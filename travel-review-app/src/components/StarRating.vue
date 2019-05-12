<template>
    <b-container fluid style="display: flex; padding: 0px;">
        <template v-for="i in 5">
            <div style="text-align: center; width: 20%;" v-bind:key="i">
                <v-icon v-if="stars-i >= -0.25" name="star" class="starChecked" :scale="iconScale"/>
                <v-icon v-else-if="stars-i >= -0.75" :scale="iconScale">
                    <v-icon name="star"/>
                    <v-icon name="star-half" class="starChecked"/>
                </v-icon>
                <v-icon v-else name="star" :scale="iconScale"/>
            </div>
        </template>
    </b-container>
</template>

<script>
import 'vue-awesome/icons/star-half';
import 'vue-awesome/icons/star';
export default {
    data() {
        return {
            
        }
    }, props: {
                'stars': {type: Number, default: 0}, 
               'iconScale': {type: String, default: "1"}
            }
}
</script>


<style>
.starChecked {
  color: orange;
}
</style>

