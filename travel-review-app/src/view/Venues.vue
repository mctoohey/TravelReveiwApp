<template>
    <div>
        <b-container fluid>
            <b-container fluid class="mt-4" v-for="venue in this.venues">
                <b-card :title="venue.venueName" sub-title="Accomadation" :img-src="`http://csse-s365.canterbury.ac.nz:4001/api/v1/venues/${venue.venueId}/photos/${venue.primaryPhoto}`" img-alt="Image not found" img-right img-height="150">
                    <b-card-text>{{ venue.city }}</b-card-text>
                    <b-badge pill variant="secondary">
                        <template v-if="venue.meanStarRating != null">
                            <template v-for="i in 5">
                                <v-icon v-if="venue.meanStarRating-i >= -0.25" name="star" class="starChecked" scale="1.5"/>
            
                                <v-icon v-else-if="venue.meanStarRating-i >= -0.75" scale="1.5">
                                    <v-icon name="star"/>
                                    <v-icon name="star-half" class="starChecked"/>
                                </v-icon>
                                <v-icon v-else name="star" scale="1.5"/>
                            </template>
                        </template>
                        <span v-else>This venue has no reviews yet.</span>
                    </b-badge>

                    <b-badge pill variant="secondary">
                        <template v-if="venue.modeCostRating != null">
                            <template v-for="i in 4">
                                <v-icon v-if="venue.modeCostRating-i >= -0.5" name="dollar-sign" class="dollarChecked" scale="1.5"/>
                                <v-icon v-else name="dollar-sign" scale="1.5"/>
                            </template>
                        </template>
                        <span v-else>This venue has no reviews yet.</span>
                    </b-badge>
                </b-card>
            </b-container>
            <b-container fluid class="mt-4" v-for="i in [29,28,27,26,25,23]">
                <b-card title="Venue Name" sub-title="Accomadation" v-bind:img-src="`https://picsum.photos/600/300/?image=${i}`" img-right img-height="150">
                    <b-card-text>Christchurch</b-card-text>
                    
                </b-card>
            </b-container>
        </b-container>
    </div>
</template>

<script>
import 'vue-awesome/icons/dollar-sign';
import 'vue-awesome/icons/star-half';
import 'vue-awesome/icons/star';
export default {
    data: function() {
        return {
            venues: []
        };
    },
    mounted: function() {
        this.getVenues(0, 10);
    },
    methods: {
        getVenues(start, count) {
            this.$http.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/venues', {
                        "startIndex": start,
                        "count": count
            }).then(function (response) {
                this.venues = response.data;
            }, function (error) {
                // TODO: Handle error.
            });
        }
    }
}
</script>

<style>
.starChecked {
  color: orange;
}

.dollarChecked {
  color: green;
}
</style>


