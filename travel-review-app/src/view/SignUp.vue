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
                <b-form-group label="Username" v-bind:state="isValidUsername" invalid-feedback="Username should be between 1 and 64 alphanumeric characters.">
                    <b-form-input v-model="username" placeholder="Username" v-bind:state="isValidUsername"></b-form-input>
                </b-form-group>
                <b-form-group label="Email" v-bind:state="isValidEmail">
                    <b-form-input v-model="email" placeholder="Email" v-bind:state="isValidEmail"></b-form-input>
                </b-form-group>
                <b-form-group v-model="password" label="Password" v-bind:state="isValidPassword">
                    <b-form-input placeholder="Password" type="password" v-bind:state="isValidPassword"></b-form-input>
                </b-form-group>
                <b-form-group v-model="passwordReentry" label="Confirm password" v-bind:state="isValidPasswordReentry">
                    <b-form-input placeholder="Re-enter password" type="password" v-bind:state="isValidPasswordReentry"></b-form-input>
                </b-form-group>

                <b-alert v-model="errorFlag" dismissible variant="danger">{{ errorMessage }}</b-alert>
                <b-button @click="signUp()">Sign Up</b-button>
            </b-card>
        </b-container>
    </div>
</template>

<script>
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

            usernameErrorMessage: "",
            emailErrorMessage: "",
            passwordErrorMessage: "",
            passwordReentryErrorMessage: "",
        };
    },
    methods: {
        signUp: function() {
            this.isValidFirstName = this.firstName != "";
            this.isValidLastName = this.lastName != "";
            this.isValidUsername = this.username != "" && this.username.length <= 64;
            

        }
    }
}
</script>