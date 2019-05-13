import Vue from 'vue';
import App from './App.vue';
import { createRouter } from './router.js';
import { createStore } from './store.js';
import { initApi, Api } from './api.js';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueResource from 'vue-resource';
Vue.use(VueResource);

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import Icon from 'vue-awesome/components/Icon';
Vue.component('v-icon', Icon);

import VueGeolocation from 'vue-browser-geolocation';
Vue.use(VueGeolocation);

import VueCookies from 'vue-cookies';
Vue.use(VueCookies);

VueCookies.config('7d');

VueCookies.set('theme', 'default');
VueCookies.set('hover-time', '1s');

const store = createStore();
const router = createRouter();

// Add the auth token if the user has one.
Vue.http.interceptors.push(function(request, next) {
    if (store.getters.userSignedIn) {
        request.headers.set('X-Authorization', store.state.authToken);
    }
    next();
});

// Check if the user is signed in if the page has been reloaded.
if ($cookies.isKey('authToken') && $cookies.isKey('userId')) {
    // TODO: Move this some where an reuse code from sign in.
    store.commit('setAuth', $cookies.get('authToken'));
    Api.requestUser($cookies.get('userId')).then((response) => {
                let user = response.data;
                user.id = $cookies.get('userId');
                store.commit('setSignedInUser', user);
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
}

// Redirect requests to pages that require the user to be logged in.
router.beforeEach((to, from, next) => {   
    if (to.meta.requiresAuth && !store.getters.userSignedIn) {
      next('/signin');
    } else {
      next();
    }
  });

// Add method for displaying errors in a modal.
Vue.mixin({
    methods: {
        createErrorModal(message, errorTitle, route) {
            if (errorTitle === undefined) errorTitle = "An error has occured!";
            if (route === undefined) route = "/";

            this.$bvModal.msgBoxConfirm(message, {
                title: errorTitle,
                centered: true
            }).then((value) => {
                this.$router.push(route);
            }).catch((error) => {
                this.$router.push(route);
            });
        }
    }
});

new Vue({
  el: '#app',
  store,
  router: router,
  render: h => h(App)
})
