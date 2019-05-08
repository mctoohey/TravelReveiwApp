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
                    <div v-if="shouldDisplayProfileBadge()">
                        <b-dropdown text="User">
                            <b-dropdown-item>View Profile</b-dropdown-item>
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
export default {
    data: function() {
        return {
        };
    },
    methods: {
        shouldDisplaySignIn: function() {
            // TODO: Use a constant.
            return this.$route.path != "/signin" && this.$route.path != '/signup' && !this.$cookies.isKey('auth_token');
        },
        shouldDisplayProfileBadge: function () {
            return this.$cookies.isKey('auth_token');
        },
        signOut: function() {
            this.$http.post('http://csse-s365.canterbury.ac.nz:4001/api/v1/users/logout', {}, {
                        "x-Authorization": this.$cookies.get('auth_token')
                    }).then(function() {
                        this.$cookies.remove('auth_token');
                        this.$router.push('/');
                        this.$forceUpdate();
                    }, function() {
                        // TODO: Handle error.
                        this.$cookies.remove('auth_token');
                        this.$router.push('/');
                        this.$forceUpdate();
                    });
        }
    }
}
</script>