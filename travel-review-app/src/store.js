import Vue from 'vue';

import Vuex from 'vuex';
Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
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
}