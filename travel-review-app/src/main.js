import Vue from 'vue';
import App from './App.vue';
import { createRouter } from './router.js';
import { createStore } from './store.js';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import VueResource from 'vue-resource';
Vue.use(VueResource);

import BootstrapVue from 'bootstrap-vue';
Vue.use(BootstrapVue);

import Icon from 'vue-awesome/components/Icon';
Vue.component('v-icon', Icon);

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
    Vue.http.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/users/' + $cookies.get('userId')).then(function (response) {
                let user = response.data;
                user.id = $cookies.get('authToken');
                store.commit('setSignedInUser', user);
                store.commit('setAuth', $cookies.get('authToken'));
            }, function(error) {
                // TODO: Handle error.
                console.log(error);
            });
}

new Vue({
  el: '#app',
  store,
  router: router,
  render: h => h(App)
})
