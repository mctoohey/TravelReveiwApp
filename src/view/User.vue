<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card class="text-center">
                <b-img fluid :src="image" alt="No Photo Found" width="300" height="300" style="padding: 0px; border: 4px solid gray; border-radius: 25px;"></b-img>
                <b-card-title style="margin-top: 20px">{{user.givenName}} {{user.familyName}}</b-card-title>
                <b-card class="text-left" style="margin-bottom: 20px">
                    <p><b>Username:</b> {{user.username}}</p>
                    <p v-if="user.email"><b>Email:</b> {{user.email}}</p>
                </b-card>
                <b-button v-if="user.email" :to="`/users/${this.$route.params.userId}/edit`" style="float: right">Edit Profile</b-button>
            </b-card>
        </b-container>
    </div>
</template>
<script>
import Api from '../api.js';
export default {
    data: function() {
        return {
            user: {
                givenName: "",
                familyName: "",
                username: "",
                email: null,
            },

            image: require('../assets/DefaultProfileImage.png')
        };
    },
    methods: {
        getUser() {
            Api.requestUser(this.$route.params.userId).then((response) => {
                        this.user = response.data;
                        console.log(response)
                    }, (error) => {
                        // TODO: Handle error.
                        console.log(error);
                    });
        },
        getPhoto() {
            Api.requestUserPhoto(this.$route.params.userId).then((response) => {
                this.image = Api.getUserPhotoUrl(this.$route.params.userId);                
            }).catch((error) => {
                if (error.status === 404) {
                    this.image = require('../assets/DefaultProfileImage.png');
                } else {
                    //TODO: Handle error.
                    console.log(error);
            }});
        }
    },
    mounted: function() {
        this.getUser();
        this.getPhoto();
    }
}
</script>
