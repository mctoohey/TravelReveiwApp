<template>
    <b-container style="display: flex; padding: 0px">
        <template v-for="i in 4">
            <div style="text-align: center; width: 25%;" v-bind:key="i">
                <v-icon v-if="costRating-i >= -0.5" name="dollar-sign" class="dollarChecked" :scale="iconScale"/>
                <v-icon v-else name="dollar-sign" :scale="iconScale"/>
            </div>
        </template>
    </b-container>
</template>

<script>
import 'vue-awesome/icons/dollar-sign';
export default {
    data() {
        return {
            
        }
    }, 
    props: {
               'costRating': {type: Number, default: 0}, 
               'iconScale': {type: String, default: "1"}
            }
}
</script>


<style>
.dollarChecked {
  color: green;
}
</style>
