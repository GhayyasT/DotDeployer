<template>
  <div :class="{'dropdown': true, 'is-right': true, 'is-active': true, 'is-up': isup}">
    <div class="dropdown-trigger">
      <button
        onclick="this.blur()"
        @click="toggleMenu()"
        :class="{'button': true, 'dropdown': true, 'is-small': true, 'is-rounded': true, 'is-outlined': true, 'is-dark': !update, 'is-danger': update}"
      >
        {{ title }}
        &nbsp;
        <i class="fa fa-caret-down" aria-hidden="true"></i>
      </button>
    </div>
    <div v-show="active" class="dropdown-menu" @mouseleave="hide()">
      <div
        v-for="(value, index) in menu"
        :key="index"
        class="dropdown-content animated fadeIn"
        id="dropdown"
      >
        <a
          @click="changed(value)"
          :class="{'dropdown-item': true, 'is-active': isInstalled(value.tag)}"
        >
          <b
            :class="{'title': true, 'pre-release': isPreRelease(value), 'release': !isPreRelease(value)}"
          >{{ value.release | chopString(30) }}</b>
          <i
            :class="{'title': true, 'pre-release': isPreRelease(value), 'release': !isPreRelease(value)}"
          >{{ value.tag }} - {{ describeRelease(value) }}</i>
          <p class="description info">{{ value.description | chopString(70) }}</p>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { ownerId } from "../helpers.js";
const _ = require("lodash");

export default {
  name: "dropdown",
  props: ["title", "repository", "tag", "update", "isup"],
  data() {
    return {
      active: false
    };
  },
  computed: {
    installs() {
      return this.$store.state.Deployer.installs;
    },
    releases() {
      return this.$store.state.Deployer.releases;
    },
    menu() {
      let menu = [];
      let releases = this.releases[ownerId(this.repository)];
      _.forEach(releases, release => {
        let tag = release.tag_name;
        let description = release.body;
        let id = release.id;
        let prerelease = release.prerelease;
        let title = release.name;
        menu.push({
          tag: tag,
          id: id,
          prerelease: prerelease,
          description: description,
          release: title
        });
        if (!prerelease) {
          // if a release is found, stop generating the menu
          return false;
        }
      });
      return menu;
    }
  },
  methods: {
    describeRelease(value) {
      if (value.prerelease) {
        return "pre-release";
      } else {
        return "release";
      }
    },
    isPreRelease(value) {
      if (value.prerelease) {
        return true;
      } else {
        return false;
      }
    },
    hide() {
      this.active = false;
    },
    toggleMenu() {
      this.active = !this.active;
    },
    changed(value) {
      this.selected = value.tag;
      this.$emit("change-event", value.tag);
      this.hide();
    },
    isInstalled(tag) {
      if (tag === this.tag) {
        return true;
      }
    }
  }
};
</script>

<style lang="sass" scoped>
  i.title
    margin-left: 6px
    font-size: 10px
  b.title
    font-size: 12px
  .dropdown-content
    padding: 0px
    margin: 0px
  .dropdown-item
    margin: 0px
    padding: 4px
    padding-left: 8px
  .pre-release
    color: $warning
  .release
    color: $primary
  .info
    color: $info
  .description
    font-size: 10px
  .small
    font-size: 9px
</style>
