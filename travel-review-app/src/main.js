import Vue from 'vue'
import App from './App.vue'
import Home from './view/Home.vue'
import SignUp from './view/SignUp'
import SignIn from './view/SignIn'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import VueResource from 'vue-resource';
Vue.use(VueResource);

import VueRouter from 'vue-router';
Vue.use(VueRouter);

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/signin",
    component: SignIn
  },
  {
    path: "/signup",
    component: SignUp
  }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})
