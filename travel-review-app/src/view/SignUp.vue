<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card title="Sign Up">
                <b-form-group label="First name" v-bind:state="isValidFirstName" invalid-feedback="You must provide a first name.">
                    <b-form-input v-model="firstName" placeholder="First name" v-bind:state="isValidFirstName"></b-form-input>
                </b-form-group>
                <b-form-group label="Last name" v-bind:state="isValidLastName" invalid-feedback="You must provide a last name.">
                    <b-form-input v-model="lastName" placeholder="Last name" v-bind:state="isValidLastName"></b-form-input>
                </b-form-group>
                <b-form-group label="Username" v-bind:state="isValidUsername" :invalid-feedback=usernameErrorMessage>
                    <b-form-input v-model="username" placeholder="Username" v-bind:state="isValidUsername"></b-form-input>
                </b-form-group>
                <b-form-group label="Email" v-bind:state="isValidEmail" :invalid-feedback=emailErrorMessage>
                    <b-form-input v-model="email" placeholder="Email" v-bind:state="isValidEmail"></b-form-input>
                </b-form-group>
                <b-form-group label="Password" v-bind:state="isValidPassword" invalid-feedback="You must provide a password.">
                    <b-form-input v-model="password" placeholder="Password" type="password" v-bind:state="isValidPassword"></b-form-input>
                </b-form-group>
                <b-form-group label="Confirm password" v-bind:state="isValidPasswordReentry" invalid-feedback="Passwords do not match.">
                    <b-form-input  v-model="passwordReentry" placeholder="Re-enter password" type="password" v-bind:state="isValidPasswordReentry"></b-form-input>
                </b-form-group>
                
                <b-button @click="signUp()">Sign Up</b-button>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import Api from '../api.js';
export default {
    data: function() {
        return {
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            passwordReentry: "",

            isValidFirstName: null,
            isValidLastName: null,
            isValidUsername: null,
            isValidEmail: null,
            isValidPassword: null,
            isValidPasswordReentry: null,

            usernameErrorMessage: "Username should be between 1 and 64 alphanumeric characters.",
            emailErrorMessage: "Invalid email address."
        };
    },
    methods: {
        signUp: function() {
            this.isValidFirstName = this.firstName !== "";
            this.isValidLastName = this.lastName !== "";
            this.isValidUsername = this.username !== "" && this.username.length <= 64 && /^[0-9a-zA-Z]+$/.test(this.username);

            let emailRe = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            this.isValidEmail = emailRe.test(this.email);

            this.isValidPassword = this.password !== "";
            this.isValidPasswordReentry = this.password === this.passwordReentry;

            if (!this.isValidPassword) {
                this.isValidPasswordReentry = null;
            }

            if (!this.isValidPasswordReentry && this.isValidPassword) {
                this.isValidPassword = null;
            }

            if (!this.isValidUsername) {
                this.usernameErrorMessage = "Username should be between 1 and 64 alphanumeric characters.";
            }

            if (!this.isValidEmail) {
                this.emailErrorMessage = "Invalid email address.";
            }

            if (this.isValidFirstName && this.isValidLastName && this.isValidUsername && this.isValidEmail && this.isValidPassword && this.isValidPasswordReentry) {
                Api.requestCreateUser({
                    "username": this.username,
                    "givenName": this.firstName,
                    "familyName": this.lastName,
                    "email": this.email,
                    "password": this.password
                }).then((response) => {
                        Api.requestSignIn(this.username, this.email, this.password).then((response) => {
                            this.$cookies.set('authToken', response.data.token, '1d');
                            this.$cookies.set('userId', response.data.userId, '1d');
                            // TODO: Don't use this hack.
                            Api.requestUser(response.data.userId).then((response2) => {
                                let user = response2.data;
                                user.id = response.data.userId
                                this.$store.commit('setSignedInUser', user);
                                this.$store.commit('setAuth', response.data.token);
                                this.$router.push('/');
                            }).catch((error) => {
                                // TODO: Handle error.
                                console.log(error);
                                this.$router.push('/');
                            });
                        }).catch((error) => {
                            console.log(error);
                        });
                }).catch((error) => {
                    if (error.status === 400) {
                        this.isValidEmail = false;
                        this.isValidUsername = false;
                        this.usernameErrorMessage = "Username or Email address is taken.";
                        this.emailErrorMessage = "Username or Email address is taken.";
                    } else {
                        console.log(error);
                    }
                });
            }
        }
    }
}
</script>