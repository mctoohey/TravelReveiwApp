<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card title="Sign Up">
                <b-form-group label="First name">
                    <b-form-input placeholder="First name"></b-form-input>
                </b-form-group>
                <b-form-group label="Last name">
                    <b-form-input placeholder="Last name"></b-form-input>
                </b-form-group>
                <b-form-group label="Last name">
                    <b-form-input placeholder="Last name"></b-form-input>
                </b-form-group>

                <b-alert v-model="errorFlag" dismissible variant="danger">{{ errorMessage }}</b-alert>
                <b-button @click="signIn()">Sign Up</b-button>
            </b-card>
        </b-container>
    </div>
</template>

<script>
export default {
    data: function() {
        return {
            
        };
    },
    methods: {
        
    }
}
</script>