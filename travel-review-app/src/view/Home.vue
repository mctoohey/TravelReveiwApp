<template>
    <div class="text-center" style="margin-top: 50px">
        <h1 style="margin-bottom: 60px">Welcome to the Travel Review Site!</h1>
        <h2 style="margin-bottom: 10px"><b-link to="/venues">View All Venues</b-link></h2>
        <template v-if="!$store.getters.userSignedIn">
            <h5><b-link to="/signup">Create an account</b-link></h5>
            <h5><b-link to="/signin">Sign in</b-link></h5>
        </template>
        <template v-else>
            <h2 style="margin-bottom: 10px"><b-link to="/admin/venues">My Venues</b-link></h2>
            <h2 style="margin-bottom: 10px"><b-link :to="`/users/${$store.state.signedInUser.id}`">My Profile</b-link></h2>
        </template>
    </div>
</template>

