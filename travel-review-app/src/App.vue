<template>
  <div id="app">
    <nav-bar :key="this.$store.getters.userKey"></nav-bar>
    <router-view :key="$route.path"></router-view>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: 'app',
  components: {
      NavBar
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>

body { padding-top: 56px;}
html {padding: 0; margin: 0;}

.center {
  margin-left: 0px;
  margin-right: 0px;
  margin-bottom: 0px;
  margin-top: 28px;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
