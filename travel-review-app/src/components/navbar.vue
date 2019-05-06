<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand to="/" class="pull-left">Home</b-navbar-brand>
            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <b-navbar-nav>
                    <b-nav-item to="/">Venues</b-nav-item>
                    <b-nav-item to="/">Users</b-nav-item>
                </b-navbar-nav>

                <b-navbar-nav class="ml-auto">
                    <div>
                        <b-button to="/signin">Sign In</b-button>
                    </div>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
    </div>
</template>