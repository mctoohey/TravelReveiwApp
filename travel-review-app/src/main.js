import Vue from 'vue'
import App from './App.vue'
import Venues from './view/Venues.vue'
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

import Vuex from 'vuex';
Vue.use(Vuex);

import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

VueCookies.config('7d');

VueCookies.set('theme', 'default');
VueCookies.set('hover-time', '1s');

// Add the auth token if the user has one.
Vue.http.interceptors.push(function(request, next) {
    if (this.$store.getters.userSignedIn) {
        request.headers.set('X-Authorization', this.$store.state.authToken);
    }
    next();
});

const store = new Vuex.Store({
    state: {
        authToken: null,
        signedInUser: null
    },
    mutations: {
        setAuth(state, authToken) {
            state.authToken = authToken;
        },
        signUserOut(state) {
            state.authToken = null;
            state.signedInUser = null;
        },
        setSignedInUser(state, user) {
            state.signedInUser = user;
        }
    },
    getters: {
        userSignedIn: function(state) {
            return state.authToken != null;
        }
    }
});

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

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  store,
  router: router,
  render: h => h(App)
})
