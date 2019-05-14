<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card class="text-center">
                <b-img thumbnail fluid src="https://picsum.photos/250/250/?image=54" alt="Image 1"></b-img>
                <b-card-title style="margin-top: 20px">{{user.givenName}} {{user.familyName}}</b-card-title>
                <b-card class="text-left">
                    <p><b>Username:</b> {{user.username}}</p>
                    <p v-if="user.email != null"><b>Email:</b> {{user.email}}</p>
                </b-card>
                
            <!-- <b-form-group disabled label="Email or Username">
                <b-card></b-card>
                <b-badge>asf</b-badge>
                <b-form-input v-model="login" placeholder="Email or Username"></b-form-input>
            </b-form-group> -->
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
                email: null
            }
        };
    },
    methods: {
        getUser() {
            Api.requestUser(this.$route.params.userId).then((response) => {
                        this.user = response.data;
                    }, (error) => {
                        // TODO: Handle error.
                        console.log(error);
                    });
        }
    },
    mounted: function() {
        this.getUser();
    }
}
</script>
