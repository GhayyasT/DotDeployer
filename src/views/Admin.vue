<template>
  <div class="admin animated fadeIn">
    <div class="columns">
      <div class="computers column is-6">
        <div class="field has-addons">
          <div class="control">
            <span>
              <label class="label is-small">Computers</label>
              <b-autocomplete
                class="autocomplete"
                :expanded="true"
                :keep-first="true"
                name="computers"
                :clear-on-select="true"
                :open-on-focus="true"
                size="is-small"
                v-model="computerSearch"
                :data="filteredInstallsArray()"
                :placeholder="`search ${installs.length} computers...`"
                icon-pack="fa"
                icon="user"
                @select="user => showComputerInstalls(user)"
              ></b-autocomplete>
            </span>
            <span>
              <label class="label is-small">Users</label>
              <b-autocomplete
                class="autocomplete"
                :keep-first="true"
                :clear-on-select="true"
                :open-on-focus="true"
                :expanded="true"
                size="is-small"
                v-model="userSearch"
                name="user-roles"
                :data="filteredUsersArray()"
                :placeholder="`search ${users.length} users...`"
                icon-pack="fa"
                icon="user"
                @select="user => toggleUserPermissions(user)"
              ></b-autocomplete>
            </span>
            <span>
              <label class="label is-small">Roles</label>
              <b-autocomplete
                class="autocomplete"
                :clear-on-select="true"
                :open-on-focus="true"
                :keep-first="true"
                :expanded="true"
                size="is-small"
                name="user-roles"
                :data="userRoles"
                :placeholder="`search ${userRoles.length} roles...`"
                icon-pack="fa"
                icon="user"
              ></b-autocomplete>
            </span>
          </div>
        </div>
      </div>
      <!-- COMPUTER INSTALLS PANEL -->
      <div v-if="computerSelected != null" class="column admin animated fadeIn">
        <label class="label install-info is-small">Installed Tools</label>
        <div class="notification is-white">
          <div
            class="installed-tools control"
            v-for="(value, key) in computerSelected.installs"
            :key="key"
          >
            <div class="tags has-addons is-left">
              <span class="animated fadeIn tag is-dark">{{ findMetadataFromkey(key) }}</span>
              <span
                :class="{'animated': true, 'fadeIn': true, 'tag': true, 'is-warning': isInstalledPreRelease(key, value.tag), 'is-primary': !isInstalledPreRelease(key, value.tag)}"
              >
                <b>{{ value.tag }}</b>
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- COMPUTER INSTALLS PANEL -->
      <!-- USER ROLES PANEL -->
      <div class="user-role-panel" v-if="userSelected != null">
        <span>
          <label class="user-info label is-small">User Information</label>
          <div class="user-info">
            <span class="animated fadeIn tag is-dark">{{ userToChangeRole.name }}</span>
          </div>
          <b-tag
            class="user-role-tag"
            v-for="role in userToChangeRole.role"
            :key="role"
            @close="removeUserRole(role)"
            type="is-primary"
            attached
            :closable="true"
          >{{ role }}</b-tag>
          <div @keyup.enter="addUserRole(roleSearch)">
            <b-autocomplete
              :clear-on-select="true"
              size="is-small"
              :expanded="true"
              :open-on-focus="true"
              v-model="roleSearch"
              name="user-roles"
              :data="filteredUserRoles"
              :placeholder="`add role or search ${userRoles.length} existing roles`"
              icon-pack="fa"
              icon="user"
              @select="role => addUserRole(role)"
            ></b-autocomplete>
          </div>
        </span>
      </div>
      <!-- USER ROLES PANEL -->
    </div>
  </div>
</template>

<script>
import { flattenObject, ownerId } from "../helpers.js";
const _ = require("lodash");
const firebase = require("firebase");

export default {
  name: "Admin",
  mounted() {
    // this bit of code allows for hot reload to work when on install tab
    if (!this.userEmail) {
      this.$router.push("/");
    }
  },
  data() {
    return {
      computerSearch: "",
      userSearch: "",
      roleSearch: "",
      computerSelected: null,
      userSelected: null
    };
  },
  methods: {
    flashMessage(message, error) {
      console.log("Flashing Message: ", message);
      let type;
      let newMessage;
      error == true ? (type = "is-danger") : (type = "is-success");
      message.message == null
        ? (newMessage = message.toString())
        : (newMessage = message.message.toString());
      this.$toast.open({
        message: newMessage,
        position: "is-bottom",
        type: type,
        duration: 2500
      });
    },
    removeUserRole(role) {
      let user = _.find(this.users, {
        name: this.userSelected
      });
      let action = this.$store.dispatch("Deployer/removeUserRole", {
        key: user.key,
        role: role
      });
      action.catch(error => {
        this.flashMessage(error, true);
      });
    },
    addUserRole(role) {
      if (!role) {
        return;
      }
      let user = _.find(this.users, {
        name: this.userSelected
      });
      let action = this.$store.dispatch("Deployer/addUserRole", {
        key: user.key,
        role: role
      });
      action
        .then(() => {
          this.roleSearch = "";
        })
        .catch(error => {
          this.flashMessge(error, true);
        });
    },
    isInstalledPreRelease(repoId, tag) {
      // get repoName from repoid
      let repo = _.find(this.repositories, {
        id: parseInt(repoId)
      });
      if (repo) {
        let identity = ownerId(repo);
        let installed = _.find(this.releases[identity], {
          tag_name: tag
        });
        return installed.prerelease;
      }
    },
    showComputerInstalls(user) {
      this.userSelected = null;
      if (user) {
        this.computerSelected = _.find(this.installs, {
          user: user
        });
      }
    },
    toggleUserPermissions(user) {
      if (user) {
        this.userSelected = user;
        this.computerSelected = null;
      }
    },
    filteredUsersArray() {
      let result = _.cloneDeep(_.map(this.users, "name"));
      if (this.userSearch) {
        result = result.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(this.userSearch.toLowerCase()) >= 0
          );
        });
      }
      return result;
    },
    filteredInstallsArray() {
      let result = _.cloneDeep(_.map(this.installs, "user"));
      if (this.computerSearch) {
        result = result.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(this.computerSearch.toLowerCase()) >= 0
          );
        });
      }
      return result;
    },
    findMetadataFromkey(key) {
      let repo = _.find(this.metadata, {
        id: parseInt(key)
      });
      if (repo) {
        return repo.name;
      }
    }
  },
  computed: {
    userToChangeRole() {
      let user = {};
      if (this.userSelected != null) {
        user = _.find(this.users, {
          name: this.userSelected
        });
      }
      return user;
    },
    currentUser() {
      return _.find(this.users, {
        email: this.userEmail
      });
    },
    filteredUserRoles() {
      let result = _.difference(this.userRoles, this.userToChangeRole.role);
      if (this.roleSearch) {
        result = result.filter(option => {
          return (
            option
              .toString()
              .toLowerCase()
              .indexOf(this.roleSearch.toLowerCase()) >= 0
          );
        });
      }
      return result;
    },
    userRoles() {
      let userRoles = _.map(this.users, "role");
      // return a single array of all unique user roles
      return _.spread(_.union)(userRoles);
      // return _.uniq(_.map(this.users, "role"));
    },
    userEmail() {
      let user = firebase.auth().currentUser;
      return user ? firebase.auth().currentUser.email : null;
    },
    users() {
      return flattenObject(this.$store.state.Deployer.users);
    },
    installs() {
      return flattenObject(this.$store.state.Deployer.installs);
    },
    metadata() {
      return flattenObject(this.$store.state.Deployer.metadata);
    },
    repositories() {
      return this.$store.state.Deployer.repositories.repositories;
    },
    releases() {
      return this.$store.state.Deployer.releases;
    },
    installCount() {
      return this.installs.length;
    }
  }
};
</script>

<style lang="sass" scoped>
  div.user-role-panel
    margin-top: 24px
    margin-left: 20px
  div.installed-tools
    margin-bottom: 2px
  div.user-info
    margin-top: 4px
    margin-bottom: 22px
  span.tag
    font-size: 14px
  div.computers
    margin-left: 5px
  .autocomplete
    width: 340px
  .input
    color: $dark
  label.install-info
    margin-left: 16px
  label.user-info
    margin-left: 10px
    margin-top: -11px
  .notification
    padding: 8px
  .user-role-tag
    margin-top: -18px
</style>
