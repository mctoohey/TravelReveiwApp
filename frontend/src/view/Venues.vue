<template>
    <div>
        <b-container fluid style="height: 100%">
        <b-row>
        <b-col :style="{'padding-right': '0', 'padding-left': '0'}">
        <scrolly :style="{'height': 'calc(100vh - 60px)'}">
            <scrolly-viewport>
                <b-container fluid>
                    <h4><b-badge pill variant="light">Showing venues {{venuesStartIndex}} to {{venuesEndIndex}}</b-badge></h4>
                    <b-container fluid style="margin-bottom: 20px" v-for="venue in this.displayedVenues" v-bind:key="venue.venueId">
                        <b-card :img-src="venueImageSrc(venue)" img-alt="Image not found" img-right img-height="175">
                            <b-card-title ><b-link :to="`/venues/${venue.venueId}`" class="card-link">{{ venue.venueName }}</b-link><b-button v-if="isAdminPage" :to="`/venues/${venue.venueId}/edit`" size="sm" variant="outline-success" style="margin-left: 15px; padding-top: 0px; padding-bottom: 0px">Edit</b-button></b-card-title>
                            <b-card-sub-title>{{ categoryName(venue.categoryId) }}</b-card-sub-title>
                            <b-card-text>{{ venueLocationText(venue) }}</b-card-text>
                            <b-badge pill variant="dark" style="margin: 4px">
                                <template v-if="venue.meanStarRating !== null">
                                    <star-rating style="width: 120px; padding: 2px;" iconScale="1.5" :stars="Number(venue.meanStarRating)"></star-rating>
                                </template>
                                <span v-else>This venue has no reviews yet.</span>
                            </b-badge>

                            <b-badge pill variant="dark">
                                <template v-if="venue.modeCostRating !== null">
                                    <cost-rating style="width: 120px;" iconScale="1.5" :costRating="Number(venue.modeCostRating)"></cost-rating>
                                </template>
                                <!-- <span v-else>This venue has no reviews yet.</span> -->
                            </b-badge>
                        </b-card>
                    </b-container>
                    <div v-if="this.currentPage >= this.totalPages" class="text-center">
                        <h2><b-badge variant="light" align="center">{{ endOfVenuesMessage }}</b-badge></h2>
                    </div>
                    <b-pagination v-model="currentPage" :per-page="perPage" :total-rows="rows" align="center"></b-pagination>
                </b-container>
            </scrolly-viewport>
        <scrolly-bar axis="y"></scrolly-bar>
        </scrolly>
        </b-col>
        <b-col cols="3" :style="{'background-color': '#F2F2F2', 'padding-right': '0', 'padding-left': '0'}">
            <b-container fluid>
                <h3 style="margin-top: 20px">Filter Options</h3>
                <b-form-group label="Search">
                    <b-form-input v-model="filterOptions.q" placeholder="Name" value="String"></b-form-input>
                </b-form-group>
                <b-form-group label="Category">
                    <b-form-select v-model="filterOptions.categoryId" :options="categoryOptions"></b-form-select>
                </b-form-group>
                <b-form-group label="City">
                    <b-form-select v-model="filterOptions.city" :options="cityOptions"></b-form-select>
                </b-form-group>
                <b-form-group label="Sort by">
                    <b-form-select v-model="selectedSortBy" :options="sortByOptions"></b-form-select>
                </b-form-group>
                <b-form-group label="Minimum star rating" style="max-width: 250px">
                    <b-form-input v-model="minStarRating" type="range" min="0" max="5"></b-form-input>
                    <star-rating iconScale="2" :stars="Number(minStarRating)"></star-rating>
                </b-form-group>
                <b-form-group label="Maximum cost rating" style="max-width: 250px">
                    <b-form-input v-model="maxCostRating" type="range" min="0" max="4"></b-form-input>
                    <cost-rating iconScale="2" :costRating="Number(maxCostRating)"></cost-rating>
                </b-form-group>
                <b-button @click="search()" style="margin-bottom: 20px" variant="primary">Apply Filter</b-button>
                <b-button @click="resetFilter()" style="margin-bottom: 20px; float: right" variant="dark">Reset Filter</b-button>
                <b-alert v-model="errorFlag" dismissible variant="danger">{{ errorMessage }}</b-alert>
            </b-container>
        </b-col>
        </b-row>
        </b-container>
    </div>
</template>

<script>
import starRating from '../components/StarRating.vue';
import costRating from '../components/CostRating.vue';
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly';
import Api from '../api.js';
export default {
    data: function() {
        return {
            venues: [],
            cities: [],
            categories: [],
            filterOptions: {
                "city": null,
                "categoryId": null,
                "q": null
            },
            minStarRating: 0,
            maxCostRating: 4,
            sortByOptions: [
                {value: ["STAR_RATING", false], text: 'Mean Star Rating: High to Low'},
                {value: ["STAR_RATING", true], text: 'Mean Star Rating: Low to High'},
                {value: ["COST_RATING", false], text: 'Mode Cost Rating: Low to High'},
                {value: ["COST_RATING", true], text: 'Mode Cost Rating: High to Low'},
                {value: ["DISTANCE", false], text: 'Distance: Low to High'},
                {value: ["DISTANCE", true], text: 'Distance: High to Low'}
            ],
            selectedSortBy: ["STAR_RATING", false],

            errorFlag: false,
            errorMessage: "",

            currentPage: 1,
            perPage: 10
        };
    },
    computed: {
        cityOptions: function() {
            let options = [{value: null, text: 'Any City'}];
            for (let city of this.cities) {
                options.push({value: city, text: city.charAt(0).toUpperCase() + city.slice(1)})
            }
            options.sort((a, b) => {
                if (a.value === null) {
                    return -1;
                } else if (b.value === null) {
                    return 1;
                } else if (a.value === b.value) {
                    return 0;
                } else {
                    return a.value < b.value ? -1 : 1;
                }
            });
            return options;
        },
        categoryOptions: function() {
            let options = [{value: null, text: 'Any Category'}];
            for (let category of this.categories) {
                options.push({value: category.categoryId, text: category.categoryName})
            }
            return options;
        },
        rows: function() {
            return this.venues.length;
        },
        venuesStartIndex: function() {
            if (this.rows === 0) {
                return 0;
            } else {
                return (this.currentPage-1) * this.perPage + 1;
            }
        },
        venuesEndIndex: function() {
            if (this.currentPage * this.perPage < this.rows) {
                return (this.currentPage) * this.perPage;
            } else {
                return this.rows;
            }
        },
        totalPages: function() {
            return Math.ceil(this.rows/this.perPage);
        },
        displayedVenues: function() {
            return this.venues.slice(this.venuesStartIndex-1, this.venuesEndIndex);
        },
        endOfVenuesMessage: function() {
            if (this.rows === 0) {
                return "No venues found";
            } else {
                return "There are no more venues to view";
            }
        },
        isAdminPage() {
            return this.$route.path === "/admin/venues" && this.$store.getters.userSignedIn;
        }
    },
    mounted: function() {
        this.getVenues(this.requestParameters());
        this.getCityOptions();
        this.getCategories();
    },
    methods: {
        search() {
            let requestParams = this.requestParameters();
            let thisComponent = this;
            if (requestParams.sortBy === "DISTANCE") {
                this.$getLocation().then(function(coordinates) {
                    requestParams.myLatitude = coordinates.lat;
                    requestParams.myLongitude = coordinates.lng;
                    thisComponent.getVenues(requestParams);
                }).catch(function(error) {
                    thisComponent.displayError("Could not determine your location");
                });
            } else {
                this.getVenues(requestParams);
            }
        },
        getVenues(requestParams) {
            Api.requestVenues(requestParams).then((response) => {
                this.venues = response.data;
                this.currentPage = 1;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        requestParameters: function() {
            let query = {};
            for (let key in this.filterOptions) {
                if (this.filterOptions[key] !== null && this.filterOptions[key] !== '') {
                    query[key] = this.filterOptions[key];
                }
            }
            query.sortBy = this.selectedSortBy[0];
            query.reverseSort = this.selectedSortBy[1];
            query.maxCostRating = this.maxCostRating;
            if (this.minStarRating >= 1) {
                query.minStarRating = this.minStarRating;
            }
            
            if (this.isAdminPage) {
                query.adminId = parseInt(this.$store.state.signedInUser.id);
            }
            return query;
        },
        getCityOptions() {
             Api.requestVenues({}).then((response) => {
                let newCities = [];
                for (let venue of response.data) {
                    if (!newCities.includes(venue.city.toLowerCase())) {
                        newCities.push(venue.city.toLowerCase());
                    }
                }
                this.cities = newCities;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        getCategories() {
            Api.requestCategories().then((response) => {
                this.categories = response.data;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        categoryName(id) {
            let name = "Unknown"
            for (let category of this.categories) {
                if (category.categoryId === id) {
                    name = category.categoryName
                }
            }
            return name;
        },
        venueImageSrc(venue) {
            if (venue.primaryPhoto !== null) {
                return Api.getVenuePhotoUrl(venue.venueId, venue.primaryPhoto);
            } else {
                return require('../assets/DefaultImage.png');
            }
        },
        displayError: function(message) {
            this.errorFlag = true;
            this.errorMessage = message;
        },
        venueLocationText(venue) {
            if (venue.hasOwnProperty("distance")) {
                let distanceString = ""
                if (venue.distance < 2) {
                    distanceString = (Math.round(venue.distance * 1000 * 10) / 10).toString() + ' m';
                } else {
                    distanceString = (Math.round(venue.distance * 10) / 10).toString() + ' km';
                }
                return `${venue.city}: ${distanceString} away`
            } else {
                return venue.city;
            }

        },
        resetFilter() {
            this.filterOptions= {
                "city": null,
                "categoryId": null,
                "q": null
            };
            this.minStarRating = 0;
            this.maxCostRating = 4;
            this.selectedSortBy = ["STAR_RATING", false];
        }
    },
    components: {
        Scrolly,
        ScrollyViewport,
        ScrollyBar,
        starRating,
        costRating
    }
}
</script>

