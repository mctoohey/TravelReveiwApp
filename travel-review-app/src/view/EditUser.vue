<template>
   <b-container class="center" style="max-width: 30rem;">
        <b-card title="Edit Profile">
            <b-form-group label="First name" v-bind:state="isValidFirstName" invalid-feedback="You must provide a first name.">
                <b-form-input v-model="firstName" placeholder="First name" v-bind:state="isValidFirstName"></b-form-input>
            </b-form-group>
            <b-form-group label="Last name" v-bind:state="isValidLastName" invalid-feedback="You must provide a last name.">
                <b-form-input v-model="lastName" placeholder="Last name" v-bind:state="isValidLastName"></b-form-input>
            </b-form-group>
            <b-button @click="changePasswordBoxExpanded = !changePasswordBoxExpanded" size="sm">{{ !changePasswordBoxExpanded ? "Change Password" : "Cancel"}}</b-button>
            <b-collapse v-model="changePasswordBoxExpanded" id="change-password-box" class="mt-3">
                <b-card style="margin-bottom: 20px">
                    <b-form-group v-if="!userIsValidated" label="Current Password" v-bind:state="isValidCurrentPassword" invalid-feedback="Invalid password.">
                        <b-form inline>
                            <b-form-input v-model="currentPassword" placeholder="Password" type="password" v-bind:state="isValidCurrentPassword"></b-form-input>
                            <b-button @click="confirmUser()" style="margin-left: 10px">Confirm</b-button>
                        </b-form>
                    </b-form-group>
                    <template v-else>
                        <b-form-group label="New password" v-bind:state="isValidPassword" invalid-feedback="You must provide a password.">
                            <b-form-input v-model="password" placeholder="Password" type="password" v-bind:state="isValidPassword"></b-form-input>
                        </b-form-group>
                        <b-form-group label="Confirm new password" v-bind:state="isValidPasswordReentry" invalid-feedback="Passwords do not match.">
                            <b-form-input  v-model="passwordReentry" placeholder="Re-enter password" type="password" v-bind:state="isValidPasswordReentry"></b-form-input>
                        </b-form-group>
                    </template>
                </b-card>
            </b-collapse>
            <b-container fluid>
                <b-row style="margin-top: 15px">
                    <b-col style="padding: 0px">
                        <b-button @click="updateProfile()">Update</b-button>
                    </b-col>
                    <b-col style="padding: 0px">
                        <b-button @click="$router.go(-1)" style="float: right">Back</b-button>
                    </b-col>
                </b-row>
            </b-container>
        </b-card>
    </b-container> 
</template>

<script>
import Api from '../api.js';
export default {
    data: function() {
        return {
            firstName: "",
            lastName: "",
            password: "",
            passwordReentry: "",
            currentPassword: "",

            isValidFirstName: null,
            isValidLastName: null,
            isValidPassword: null,
            isValidPasswordReentry: null,
            isValidCurrentPassword: null,

            changePasswordBoxExpanded: false,
            userIsValidated: false
        };
    },
    mounted() {
        this.getUser();
    },
    methods: {
        updateProfile: function() {
            this.isValidFirstName = this.firstName != "";
            this.isValidLastName = this.lastName != "";

            if (this.changePasswordBoxExpanded) {
                this.isValidPassword = this.password != "";
                this.isValidPasswordReentry = this.password === this.passwordReentry;

                if (!this.isValidPassword) {
                    this.isValidPasswordReentry = null;
                }

                if (!this.isValidPasswordReentry && this.isValidPassword) {
                    this.isValidPassword = null;
                }
            }

            if (this.isValidFirstName && this.isValidLastName && ((this.isValidPassword && this.isValidPasswordReentry) || !this.userIsValidated)) {
                let editValues = {
                    "familyName": this.lastName,
                    "givenName": this.firstName
                };
                if (this.userIsValidated) {
                    editValues.password = this.password;
                }
                Api.requestEditUser(this.$route.params.userId, editValues).then((response) => {
                    this.$router.push(`/users/${this.$route.params.userId}`);
                    let updatedUser = this.$store.state.signedInUser;
                    updatedUser.familyName = this.lastName;
                    updatedUser.givenName = this.firstName;
                    this.$store.commit('setSignedInUser', updatedUser);
                }).catch((error) => {
                    // TODO: Handle error
                    console.log(error);
                });
            }
        },
        getUser: function() {
            Api.requestUser(this.$route.params.userId).then((response) => {
                        let user = response.data;
                        this.firstName = user.givenName;
                        this.lastName = user.familyName;
                    }, (error) => {
                        // TODO: Handle error.
                        console.log(error);
                    });
        },
        confirmUser: function() {
            Api.requestSignIn(this.$store.state.signedInUser.username, this.$store.state.signedInUser.email, this.currentPassword).then((response) => {
                    this.$cookies.set('authToken', response.data.token, '1d');
                    this.$cookies.set('userId', response.data.userId, '1d');
                    this.$store.commit('setAuth', response.data.token);
                    this.isValidCurrentPassword = null;
                    this.userIsValidated = true;
                }).catch((error) => {
                    if (error.status === 400) {
                        this.isValidCurrentPassword = false;
                        this.userIsValidated = false;
                    } else {
                        //TODO: Handle error.
                        console.log(error);
                    }});
        }
    }
}
</script>