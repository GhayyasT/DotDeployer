<template>
  <div id="app">
    <nav>
      <router-view name="navbar"></router-view>
    </nav>
    <section class="section">
      <div class="container is-fluid">
        <router-view name="main"></router-view>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "Dot-Deployer"
};
</script>

<style lang="sass" scoped>
html
  overflow: scroll
  overflow-x: hidden
::-webkit-scrollbar 
  width: 0px
  background: transparent
section.section
  position: absolute
  overflow-y: auto
  padding: 0px
  top: 80px
  left: 0px
  right: 0px
  bottom: 0px
</style>
