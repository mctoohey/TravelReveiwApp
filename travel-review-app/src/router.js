import Vue from 'vue';

import Venues from './view/Venues.vue'
import Home from './view/Home.vue'
import SignUp from './view/SignUp'
import SignIn from './view/SignIn'

import VueRouter from 'vue-router';
Vue.use(VueRouter);

const routes = [
    {
      path: "/",
      component: Home
    },
    {
      path: "/venues",
      component: Venues
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

export function createRouter() {
      return new VueRouter({
        routes: routes,
        mode: 'history'
      });
}