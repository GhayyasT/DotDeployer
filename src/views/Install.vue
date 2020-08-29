<template>
  <div class="manage animated fadeIn">
    <dottable class="released" :source="getAuthorizedRepositories"></dottable>
    <!-- LOADING SCREEN -->
    <div v-if="deploying && progress != null" class="modal is-active animated fadeIn">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="level">
          <div class="level-item has-text-centered">
            <div class="progress-tool">{{ progress.tool | capitalize }}</div>
            <div class="progress-title">{{ progress.title }}</div>
          </div>
        </div>
        <div class="level">
          <div class="level-item has-text-centered">
            <progress class="progress is-small is-light" :value="progress.value" max="100"></progress>
          </div>
        </div>
        <div class="level">
          <div class="level-item has-text-centered">
            <button class="loading button is-loading is-outlined is-light is-small"></button>
          </div>
        </div>
      </div>
    </div>
    <!-- LOADING SCREEN -->
  </div>
</template>

<script>
import DotTable from "@/components/DotTable";

import { ownerId, flattenObject } from "../helpers.js";
const _ = require("lodash");
const firebase = require("firebase");
const { shell } = require("electron");

export default {
  name: "Install",
  components: {
    dottable: DotTable
  },
  mounted() {
    // this bit of code allows for hot reload to work when on install tab
    if (!this.userEmail) {
      this.$router.push("/");
    }
  },
  methods: {
    matchMetadataWithGithubRepository(repository) {
      return _.find(this.metadata, obj => {
        return obj.id == repository.id;
      });
    },
    getUrl(type) {
      let identity = ownerId(this.downloadSelected);
      let deploy = this.deployers[identity];
      if (deploy) {
        if (deploy[type]) {
          return deploy[type].url;
        } else {
          return "";
        }
      }
    },
    launchUrl(url) {
      shell.openExternal(url);
    },
    closeModal() {
      this.$store.dispatch("Deployer/setModalActive", false);
      this.$store.dispatch("Deployer/setDownloadSelected", null);
    }
  },
  computed: {
    deploying() {
      return this.$store.state.Deployer.deploying;
    },
    progress() {
      return this.$store.state.Deployer.progress;
    },
    repositories() {
      return this.$store.state.Deployer.repositories.repositories;
    },
    metadata() {
      return flattenObject(this.$store.state.Deployer.metadata);
    },
    users() {
      return this.$store.state.Deployer.users;
    },
    userEmail() {
      let user = firebase.auth().currentUser;
      return user ? firebase.auth().currentUser.email : null;
    },
    userName() {
      let user = _.find(this.users, { email: this.userEmail });
      if (user != null) {
        return user.name;
      } else {
        return null;
      }
    },
    userRoles() {
      let user = _.find(this.users, { email: this.userEmail });
      if (user != null) {
        return user.role;
      } else {
        return null;
      }
    },
    isAdmin() {
      if (this.userRoles) {
        return this.userRoles.includes("admin");
      } else {
        return null
      }
    },
    getAuthorizedRepositories() {
      if (this.isAdmin) {
        return this.repositories;
      } else {
        let result = [];
        _.forEach(this.repositories, repository => {
          let metadata = this.matchMetadataWithGithubRepository(repository);
          let allowedUsers = metadata.users;
          if (Array.isArray(allowedUsers)) {
            if (
              _.intersection(allowedUsers, this.userRoles).length > 0 ||
              allowedUsers.includes(this.userName)
            ) {
              result.push(repository);
            }
          }
        });
        return result;
      }
    }
  }
};
</script>

<style lang="sass" scoped>
  div.manage
    font-family: $font-stack
  div.progress-tool
    font-weight: bold
    color: $light
    font-size: 16px
  div.progress-title
    color: $light
    padding-left: 12px
    font-style: italic
    font-size: 13px
  button.loading 
    border: none
</style>
