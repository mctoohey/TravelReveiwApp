<template>
  <div id="app">
    <TopBar></TopBar>
    <router-view></router-view>
  </div>
</template>

<script>
import TopBar from './components/topbar.vue'
export default {
  name: 'app',
  components: {
      TopBar
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>
