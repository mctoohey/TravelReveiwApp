import Vue from 'vue';

import Vuex from 'vuex';
Vue.use(Vuex);

export function createStore() {
    return new Vuex.Store({
        state: {
            authToken: null,
            signedInUser: null,
            userChangeStage: 0
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
            },
            userEdited(state) {
                state.userChangeStage += 1;
                if (state.userChangeStage >= 100) {
                    state.userChangeStage = 0;
                }
            }
        },
        getters: {
            userSignedIn: function(state) {
                return state.authToken !== null;
            },
            userKey: function(state) {
                return state.signedInUser !== null ? parseInt(state.signedInUser.id) * 100 + state.userChangeStage : null;
            }
        }
    });
}