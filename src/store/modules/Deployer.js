import backend from '../backend'
import firebase from 'firebase'
import Vue from 'vue'

import {
  ownerId,
  ownerName,
  createActualPath
} from "../../helpers.js";

const _ = require('lodash')
const fs = require('fs-extra')
const DecompressZip = require("decompress-zip");

const state = {
  computerId: "",
  supports: ['3.0.0'],
  deploying: false,
  progress: null,
  users: {},
  installs: {},
  repositories: {},
  metadata: {},
  releases: {},
  githubTrigger: 0
}

const mutations = {
  incrementGithubTrigger(state) {
    state.githubTrigger = state.githubTrigger + 1
  },
  setComputerId(state, computerId) {
    state.computerId = computerId
  },
  setDeploying(state, bool) {
    state.deploying = bool
  },
  setProgress(state, payload) {
    state.progress = payload
  },
  setModalActive(state, bool) {
    state.modalActive = bool
  },
  setRepositories(state, repositories) {
    state.repositories = repositories
  },
  setUsers(state, users) {
    state.users = users
  },
  setInstalls(state, installs) {
    state.installs = installs
  },
  setMetadata(state, metadata) {
    state.metadata = metadata
  },
  setReleases(state, payload) {
    Vue.set(state.releases, payload.name, payload.releases)
    // state.releases[payload.name] = payload.releases
  }
}

const actions = {
  // updateRollbarConfig: (context, user) => {
  //   rollbar.configure({
  //     'enabled': true,
  //     'payload': {
  //       'person': {
  //         'id': user.uid,
  //         'username': user.displayName,
  //         'email': user.email
  //       }
  //     }
  //   })
  // },
  setDeploying: (context, bool) => {
    return context.commit('setDeploying', bool)
  },
  setProgress: (context, payload) => {
    return context.commit('setProgress', payload)
  },
  setModalActive: (context, bool) => {
    return context.commit('setModalActive', bool)
  },
  fireListener: (context, ref) => {
    return new Promise((resolve, reject) => {
      firebase.database().ref(ref.db).on('value', function (snapshot) {
        context.commit(ref.store, snapshot.val())
        resolve()
      }, function (error) {
        reject(error.code)
      })
    })
  },
  fetchRepositoriesAndReleases: (context) => {
    return new Promise((resolve, reject) => {
      // refresh github information on login
      context.dispatch('repositories').then(() => {
        let releases = []
        _.forEach(context.state.repositories.repositories, (repo) => {
          releases.push(context.dispatch('releases', repo))
        })
        Promise.all(releases).then(() => {
          resolve()
        }, (error) => {
          reject(error)
        })
      }, (error) => {
        reject(error)
      })
    })
  },
  repositoryListener: (context) => {
    return firebase.database().ref('installation_repositories').on('child_removed', () => {
      // fetch repositories from github, one or multiple have been added or removed
      // a cloud function will consume the github webhook payload for repo changes and mirror the database
      // for option to add custom metadata.  when child is deleted, the database has been successfully mirrored already
      context.dispatch('fetchRepositoriesAndReleases')
    })
  },
  releaseListener: (context) => {
    // this listener will trigger anytime data is removed from db.release
    // a github webhook pushes the github payload to the database, and a cloud function automatically removes it
    // this delete action will trigger the below listener
    return firebase.database().ref('release').on('child_removed', (snapshot) => {
      const snapshotData = snapshot.val()
      let repository = snapshotData.repository
      console.log('Relase Listener Triggered...', snapshotData)
      context.dispatch('releases', repository)
    });
  },
  updateInstall: (context, payload) => {
    return new Promise((resolve) => {
      createActualPath('$COMPUTERNAME').then(computerId => {
        let user = firebase.auth().currentUser.email
        let update = {}
        update[payload.id] = {}
        update[payload.id].tag = payload.tag
        firebase.database().ref(`installs/${computerId}`).update({
          user: user
        })
        firebase.database().ref(`installs/${computerId}/installs`).update(update).then(() => {
          resolve()
        })
      })
    })
  },
  updateRepoPermissions: (context, payload) => {
    return new Promise((resolve, reject) => {
      let user = payload.user
      let metadata = _.cloneDeep(payload.metadata)
      if (!Array.isArray(metadata.users)) {
        metadata.users = []
      }
      if (_.includes(metadata.users, user)) {
        _.remove(metadata.users, (u) => {
          return u === user
        })
      } else {
        metadata.users.push(user)
      }
      firebase.database().ref(`repositories/${metadata.key}/users`).set(metadata.users).then(() => {
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  },
  addUserRole: (context, payload) => {
    return new Promise((resolve, reject) => {
      let newRole = payload.role
      let key = payload.key
      firebase.database().ref(`users/${key}/role`).once('value', snapshot => {
        let currentRoles = snapshot.val()
        if (!currentRoles) {
          currentRoles = []
        }
        currentRoles.push(newRole)
        firebase.database().ref(`users/${key}/role`).set(currentRoles).then(() => {
          resolve()
        }).catch((error) => {
          reject(error)
        })
      })
    })
  },
  removeUserRole: (context, payload) => {
    return new Promise((resolve, reject) => {
      let newRole = payload.role
      let key = payload.key
      firebase.database().ref(`users/${key}/role`).once('value', snapshot => {
        let currentRoles = snapshot.val()
        _.remove(currentRoles, role => {
          return role == newRole
        })
        firebase.database().ref(`users/${key}/role`).set(currentRoles).then(() => {
          resolve()
        }).catch((error) => {
          reject(error)
        })
      })
    })
  },
  updateRepoName: (context, payload) => {
    return new Promise((resolve, reject) => {
      let key = payload.key // metadata key
      let data = {
        // metadata new name
        name: payload.name
      }
      firebase.database().ref(`repositories/${key}`).update(data).then(() => {
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  },
  removeInstall: (context, repo) => {
    return new Promise((resolve) => {
      let computerId = context.state.computerId
      firebase.database().ref(`installs/${computerId}/installs/${repo}`).remove()
      resolve()
    })
  },
  repositories: (context) => {
    return new Promise((resolve, reject) => {
      backend.getRepositories().then(
        response => resolve(context.commit('setRepositories', response)),
        error => reject(error)
      )
    })
  },
  releases: (context, repository) => {
    const identity = ownerId(repository)
    const identityName = ownerName(repository)
    return new Promise((resolve, reject) => {
      backend.getReleases(identityName).then((response) => {
        context.commit('setReleases', {
          name: identity,
          releases: response
        })
        context.commit('incrementGithubTrigger')
        resolve()
      }).catch((error) => {
        reject(error)
      })
    })
  },
  validate: (context, deployerData) => {
    return new Promise((resolve, reject) => {
      backend.validate(deployerData).then(
        response => resolve(response),
        error => reject(error)
      )
    })
  },
  asset: (context, payload) => {
    return new Promise((resolve, reject) => {
      backend.getAsset(payload.repository, payload.assetId).then(asset => {
        const encodedPath = `$TEMP\\${payload.repository.replace('/', '-')}-${payload.releaseId}`
        createActualPath(encodedPath).then(parentPath => {
          let filePath = `${parentPath}\\${payload.fileName}`
          fs.remove(filePath).then(() => {
            fs.outputFile(filePath, asset, (outputError) => {
              if (outputError) {
                reject(outputError)
              } else {
                resolve(parentPath)
              }
            })
          }).catch((error) => {
            reject(error)
          })
        }).catch((error) => {
          reject(error)
        })
      }).catch((error) => {
        reject(error)
      })
    })
  },
  download: (context, payload) => {
    return new Promise((resolve, reject) => {
      backend.getSource(payload.repository, payload.tag).then(download => {
        const encodedPath = `$TEMP\\${payload.id}.zip`
        createActualPath(encodedPath).then(path => {
          fs.outputFile(path, download, (outputError) => {
            if (outputError) {
              reject(outputError)
            } else {
              const unzipper = new DecompressZip(path);
              unzipper.on("error", error => {
                reject(error);
              });
              unzipper.on("extract", log => {
                // remove original .zip file from temp folder
                fs.remove(path)
                  .then(() => {
                    // this folder will be unique, it has commit hash in it
                    let parentFolder = log[0].folder;
                    let encodedPath = `$TEMP\\${parentFolder}`;
                    createActualPath(encodedPath).then(extractedPath => {
                      resolve(extractedPath);
                    });
                  })
                  .catch(error => {
                    reject(error);
                  });
              });
              createActualPath("$TEMP").then(tempPath => {
                unzipper.extract({
                  path: tempPath
                });
              });
            }
          })
        }).catch((error) => {
          reject(error)
        })
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
