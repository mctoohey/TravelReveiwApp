<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card title="Sign In">
                <b-form-group label="Email or Username">
                    <b-form-input v-model="login" placeholder="Email or Username"></b-form-input>
                </b-form-group>
                <b-form-group label="Password">
                    <b-form-input v-model="password" type="password" placeholder="Password"></b-form-input>
                </b-form-group>
                <b-alert v-model="errorFlag" dismissible variant="danger">{{ errorMessage }}</b-alert>
                <b-button @click="signIn()">Sign In</b-button>
                <b-link to="/signup" class="card-link float-right">Don't have an account? Sign up here!</b-link>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import { requestSignIn, requestUser } from '../api.js';
export default {
    data: function() {
        return {
            login: "",
            password: "",
            errorFlag: false,
            errorMessage: ""
        };
    },
    methods: {
        signIn: function() {
            if (this.login === "") {
                this.displayError("Please provide a Username or Email.")
            } else if (this.password === "") {
                this.displayError("Please provide a password.")
            } else {
                requestSignIn(this.login, this.login, this.password).then(this.handleValidResponse, this.handleErrorResponse);
            }
        },
        displayError: function(message) {
            this.errorFlag = true;
            this.errorMessage = message;
        },
        handleValidResponse: function(response) {
            this.$cookies.set('authToken', response.data.token, '1d');
            this.$cookies.set('userId', response.data.userId, '1d');
            // TODO: Don't use this hack.
            let outerThis = this;
            requestUser(response.data.userId).then(function (response2) {
                let user = response2.data;
                user.id = response.data.userId
                outerThis.$store.commit('setSignedInUser', user);
                outerThis.$store.commit('setAuth', response.data.token);
                outerThis.$router.push('/');
            }, function(error) {
                // TODO: Handle error.
                console.log(error);
                outerThis.$router.push('/');
            });
        },
        handleErrorResponse: function(error) {
            if (error.status === 400) {
                this.displayError("Invalid email/username or password.");
            } else {
                this.displayError("Opps. Something went wrong, try again later.");
                console.log(error);
            }
            
        }
    }
}
</script>