<template>
   <b-container class="center" style="max-width: 30rem;">
        <b-card title="Edit Profile">
            <b-container>
                <b-row>
                    <div style="border: 4px solid gray; float: none; margin: 0 auto; border-radius: 5px;">
                    <vue-cropper
                    ref="cropper"
                    :src="photoSrc"
                    alt="Source Image"
                    dragMode="move"
                    :movable="true"
                    :cropBoxMovable="false"
                    :cropBoxResizable="false"
                    :toggleDragModeOnDblclick="false"
                    :aspectRatio="1"
                    :viewMode="3"
                    :background="false"
                    :minCropBoxHeight="250"
                    :minCropBoxWidth="250"
                    :minCanvasWidth="250"
                    :minCanvasHeight="250"
                    :minContainerWidth="250"
                    :minContainerHeight="250"
                    :autoCrop="true"
                    :autoCropArea="0.11"
                    :img-style="{ 'width': '250', 'height': '250' }"
                    :key="photoSrc"
                    style="width: 250px; height: 250px;"
                    >
                    </vue-cropper>
                    </div>
                </b-row>
            </b-container>
            <b-form-group label="Profile photo">
                <b-row>
                    <b-col style="padding-right: 0px">
                        <b-form-file @input="photoDeleted = false; getPhotoSrc()" v-model="photo" placeholder="Add photo here" :file-name-formatter="(files) => {return 'Photo Selected'}"></b-form-file>
                    </b-col>
                    <b-col cols="5" style="padding-left: 0px">
                        <b-button @click="photoDeleted = true; getPhotoSrc()" style="float: right">Delete Photo</b-button>
                    </b-col>
                </b-row>
            </b-form-group>
            <b-form-group label="First name" v-bind:state="isValidFirstName" invalid-feedback="You must provide a first name.">
                <b-form-input v-model="firstName" placeholder="First name" v-bind:state="isValidFirstName"></b-form-input>
            </b-form-group>
            <b-form-group label="Last name" v-bind:state="isValidLastName" invalid-feedback="You must provide a last name.">
                <b-form-input v-model="lastName" placeholder="Last name" v-bind:state="isValidLastName"></b-form-input>
            </b-form-group>
            <b-button @click="changePasswordBoxExpanded = !changePasswordBoxExpanded" size="sm">{{ !changePasswordBoxExpanded ? "Change Password" : "Cancel"}}</b-button>
            <b-collapse v-model="changePasswordBoxExpanded" id="change-password-box" class="mt-3">
                <b-card style="margin-bottom: 0px">
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
import VueCropper from 'vue-cropperjs';
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
            userIsValidated: false,

            photo: null,
            photoSrc: require('../assets/DefaultProfileImage.png'),
            photoDeleted: false
        };
    },
    mounted() {
        this.getUser();
        this.getPhotoSrc();
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
                    if (this.photoDeleted) {
                        Api.requestDeleteUserPhoto(this.$route.params.userId).then((response) => {
                            this.$router.push(`/users/${this.$route.params.userId}`);
                        }).catch((error) => {
                            this.$router.push(`/users/${this.$route.params.userId}`);
                            // TODO: Handle error.
                            console.log(error);
                            });
                    } else {
                        this.$refs.cropper.getCroppedCanvas().toBlob((blob) => {
                        Api.requestSetUserPhoto(this.$route.params.userId, blob).then((response) => {
                            this.$router.push(`/users/${this.$route.params.userId}`);
                        }).catch((error) => {
                            this.$router.push(`/users/${this.$route.params.userId}`);
                            // TODO: Handle error.
                            console.log(error);
                            });
                        });
                    }
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
        },
        getPhotoSrc: function() {
            if (this.photoDeleted) {
                 this.photoSrc = require('../assets/DefaultProfileImage.png');
            } else if (this.photo === null) {
                Api.requestUserPhoto(this.$route.params.userId).then((response) => {
                    this.photoSrc = Api.getUserPhotoUrl(this.$route.params.userId);                
                }).catch((error) => {
                    if (error.status === 404) {
                        this.photoSrc = require('../assets/DefaultProfileImage.png');
                    } else {
                        //TODO: Handle error.
                        console.log(error);
                }});
            } else {
                this.photoSrc = window.URL.createObjectURL(this.photo);
            }
        }
    },
    components: {VueCropper}
}
</script>