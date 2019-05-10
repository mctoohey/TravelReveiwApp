<template>
    <div>
        <b-container fluid style="height: 100% background-color: blue">
        <b-row>
            <b-col :style="{'padding-right': '0', 'padding-left': '0'}">
        <scrolly :style="{'height': 'calc(100vh - 60px)'}">
            <scrolly-viewport>
                <b-container fluid>
                    <b-container fluid class="mt-4" v-for="venue in this.venues">
                        <b-card :title="venue.venueName" sub-title="Accomadation" :img-src="`http://csse-s365.canterbury.ac.nz:4001/api/v1/venues/${venue.venueId}/photos/${venue.primaryPhoto}`" img-alt="Image not found" img-right img-height="150">
                            <b-card-text>{{ venue.city }}</b-card-text>
                            <b-badge pill variant="dark">
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

                            <b-badge pill variant="dark">
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
                    <!-- <b-container fluid class="mt-4" v-for="i in [29,28,27,26,25,23]">
                        <b-card title="Venue Name" sub-title="Accomadation" v-bind:img-src="`https://picsum.photos/600/300/?image=${i}`" img-right img-height="150">
                            <b-card-text>Christchurch</b-card-text>
                            
                        </b-card>
                    </b-container> -->
                </b-container>
            </scrolly-viewport>
        <scrolly-bar axis="y"></scrolly-bar>
        </scrolly>
        </b-col>
        <b-col cols="3" :style="{'background-color': '#F2F2F2', 'padding-right': '0', 'padding-left': '0'}">
            <b-container fluid>
                <b-form-group label="City">
                    <b-form-select v-model="filterOptions.city" :options="cityOptions"></b-form-select>
                </b-form-group>
                 <b-button @click="getVenues()">Search</b-button>
            </b-container>
        </b-col>
        </b-row>
        </b-container>
    </div>
</template>

<script>
import 'vue-awesome/icons/dollar-sign';
import 'vue-awesome/icons/star-half';
import 'vue-awesome/icons/star';
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly';
export default {
    data: function() {
        return {
            venues: [],
            cities: [],
            filterOptions: {
                "city": null
            }
        };
    },
    computed: {
        cityOptions: function() {
            let options = [{value: null, text: 'All Cities'}];
            for (let city of this.cities) {
                options.push({value: city, text: city.charAt(0).toUpperCase() + city.slice(1)})
            }
            return options;
        }
    },
    mounted: function() {
        this.getVenues();
        this.getCityOptions();
    },
    methods: {
        getVenues() {
            this.$http.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/venues', {params: this.requestParameters()}).then(function (response) {
                this.venues = response.data;
            }, function (error) {
                // TODO: Handle error.
            });
        },
        requestParameters: function() {
            let query = {};
            for (let key in this.filterOptions) {
                if (this.filterOptions[key] != null) {
                    query[key] = this.filterOptions[key];
                }
            }
            return query;
        },
        getCityOptions() {
            this.$http.get('http://csse-s365.canterbury.ac.nz:4001/api/v1/venues', {params: this.requestParameters()}).then(function (response) {
                let newCities = [];
                for (let venue of response.data) {
                    if (!newCities.includes(venue.city.toLowerCase())) {
                        newCities.push(venue.city.toLowerCase());
                    }
                }
                this.cities = newCities;
            }, function (error) {
                // TODO: Handle error.
            });
        }
    },
    components: {
        Scrolly,
        ScrollyViewport,
        ScrollyBar
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


