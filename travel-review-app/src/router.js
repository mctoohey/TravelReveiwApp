import Vue from 'vue';

import Venues from './view/Venues.vue';
import Venue from './view/Venue.vue';
import CreateVenue from './view/CreateVenue.vue';
import Home from './view/Home.vue';
import SignUp from './view/SignUp';
import SignIn from './view/SignIn';

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
        path: "/venues/:venueId",
        component: Venue
    },
    {
        path: "/create-venue",
        component: CreateVenue
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