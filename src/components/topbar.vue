<template>
    <div class="navigation">
        <div class="menuHeader" v-on:click="menuExpanded=!menuExpanded">MENU</div>
        <transition name="slide">
            <ul v-bind:class="{menuHidden: !menuExpanded, menuVisible: menuExpanded}">
                <li><router-link to="/" class="menuItem">HOME</router-link></li>
                <li><router-link to="/" class="menuItem">VENUES</router-link></li>
                <li><router-link to="/" class="menuItem">USERS</router-link></li>
                <li><router-link to="/signup" class="menuItem">Sign Up</router-link></li>
            </ul>
        </transition>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            menuExpanded: false
        };
    }
}
</script>

<style>
.navigation ul {
    list-style-type: none;
    margin: 0;
    width: 100%;
    max-width: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    flex-direction: row;
}

.navigation li a {
    display: block;
    width: 100%;
    height: 40px;
    text-decoration: none;
    font-family: helvetica;
    text-align: center;
    vertical-align: middle;
    line-height: 40px
}

.navigation li a:hover {
    background-color: #3665af;
    cursor: pointer;
}

.navigation li {
    display: inline;
    float: left;
    width: 100%;
}

.menuItem {
    background-color: #1f4b91;
    color: white;
}

.menuHeader {
    display: none;
}

@media screen and (max-width: 550px) {
    .navigation ul {
    display: flex;
    flex-direction: column;
    align-items: center;
    }

    .menuHeader {
    display: block;
    width: 100%;
    height: 40px;
    background-color: #b2b5ba;
    color: black;
    text-decoration: none;
    font-family: helvetica;
    text-align: center;
    vertical-align: middle;
    line-height: 40px
    }

    .menuHeader:hover {
        background-color: #cacbce;
        cursor: pointer;
    }

    .menuHidden {
        transform: scaleY(0);
        transition: transform 0.3s ease-in-out;
        transform-origin: top;
    }

    .menuVisible {
        transition: transform 0.3s ease-in-out;
        transform-origin: top;
    }
}

.slide-enter-active {
    transition: all 0.3s ease;
    transform-origin: top;
} 
.slide-leave-active {
    transition: all 0.3s ease;
    transform-origin: top;
}
.slide-enter, .slide-leave-to {
    transform: scaleY(0);
    opacity: 0;
}
</style>