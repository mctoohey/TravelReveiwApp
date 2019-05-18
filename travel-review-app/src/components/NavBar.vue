<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info" fixed="top"> 
            <b-navbar-brand to="/" class="pull-left">Home</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item to="/venues">Venues</b-nav-item>
                    <b-nav-item to="/">Users</b-nav-item>
                </b-navbar-nav>

                <b-navbar-nav class="ml-auto">
                    <div v-if="userSignedIn">
                        <b-dropdown :text="profileBadgeName">
                            <b-dropdown-item to="/create-venue">Add Venue</b-dropdown-item>
                            <b-dropdown-item to="/admin/venues">My Venues</b-dropdown-item>
                            <b-dropdown-divider></b-dropdown-divider>
                            <b-dropdown-item :to="`/users/${this.$store.state.signedInUser.id}`">View Profile</b-dropdown-item>
                            <b-dropdown-item @click="signOut()">Sign Out</b-dropdown-item>
                        </b-dropdown>
                    </div>
                    <div v-else-if="shouldDisplaySignIn()">
                        <b-button to="/signin">Sign In</b-button>
                    </div>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>

<script>
import Api from '../api.js';
export default {
    data: function() {
        return {
        };
    },
    methods: {
        shouldDisplaySignIn: function() {
            // TODO: Use a constant.
            return this.$route.path != "/signin" && this.$route.path != '/signup' && !this.userSignedIn;
        },
        signOut: function() {
            Api.requestSignOut().then((response) => {
                        this.purgeUserData()
            }).catch((error) => {
                        // TODO: Handle error.
                        console.log(error);
                        this.purgeUserData()
            });
        },
        purgeUserData: function() {
            this.$store.commit('signUserOut');
            this.$cookies.remove('authToken');
            this.$cookies.remove('userId');
            this.$router.push('/');
        }
    },
    computed: {
        userSignedIn() {
            return this.$store.getters.userSignedIn && this.$store.state.signedInUser != null;
        },
        profileBadgeName() {
            if (this.$store.state.signedInUser != null) {
                return this.$store.state.signedInUser.givenName;
            } else {
                return "Profile";
            }
        }
    }
}
</script>