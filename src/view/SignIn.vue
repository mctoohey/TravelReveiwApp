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
import Api from '../api.js';
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
                Api.requestSignIn(this.login, this.login, this.password).then((response) => {
                    this.$cookies.set('authToken', response.data.token, '1d');
                    this.$cookies.set('userId', response.data.userId, '1d');
                    Api.requestUser(response.data.userId).then((response2) => {
                        let user = response2.data;
                        user.id = response.data.userId
                        this.$store.commit('setSignedInUser', user);
                        this.$store.commit('setAuth', response.data.token);
                        this.$router.push('/');
                    }, (error) => {
                        // TODO: Handle error.
                        console.log(error);
                        this.$router.push('/');
                    });
                }).catch((error) => {
                    if (error.status === 400) {
                        this.displayError("Invalid email/username or password.");
                    } else {
                        this.displayError("Opps. Something went wrong, try again later.");
                        console.log(error);
                    }});
            }
        },
        displayError: function(message) {
            this.errorFlag = true;
            this.errorMessage = message;
        }
    },
    mounted() {
        if (this.$store.getters.userSignedIn) {
            this.$router.push('/');
        }
    },
}
</script>