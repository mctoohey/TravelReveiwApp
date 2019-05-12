<template>
    <div>
        <b-container class="center" style="max-width: 30rem;">
            <b-card title="Create Venue">
                <b-form-group label="Venue name" v-bind:state="isValidVenueName" invalid-feedback="You must provide a venue name.">
                    <b-form-input v-model="venue.venueName" placeholder="Venue name" v-bind:state="isValidVenueName"></b-form-input>
                </b-form-group>
                <b-form-group label="Category" v-bind:state="isValidCategory" invalid-feedback="You must select a category.">
                    <b-form-select v-model="venue.categoryId" :options="categoryOptions" v-bind:state="isValidCategory">
                        <template slot="first">
                            <option :value="null" disabled>-- Please select a Category --</option>
                        </template>
                    </b-form-select>
                </b-form-group>
                <b-form-group label="Short description" v-bind:state="isValidShortDescription" invalid-feedback="You must provide a short description.">
                    <b-form-input v-model="venue.shortDescription" placeholder="Short description" v-bind:state="isValidShortDescription"></b-form-input>
                </b-form-group>
                <b-form-group label="Long description">
                    <b-form-textarea v-model="venue.longDescription" placeholder="Enter long description" rows="4"></b-form-textarea>
                </b-form-group>
                <b-form-group label="City" v-bind:state="isValidCity" invalid-feedback="You must provide a City.">
                    <b-form-input v-model="venue.city" placeholder="City"  v-bind:state="isValidCity"></b-form-input>
                </b-form-group>
                <b-form-group label="Address" v-bind:state="isValidAddress" invalid-feedback="You must provide an address.">
                    <b-form-input  v-model="venue.address" placeholder="Address"  v-bind:state="isValidAddress"></b-form-input>
                </b-form-group>
                <b-row>
                    <b-col>
                        <b-form-group label="Latitude" v-bind:state="isValidLatitude" invalid-feedback="Latitude should be between -90 and 90.">
                            <b-form-input  v-model="venue.latitude" placeholder="Latitude" v-bind:state="isValidLatitude"></b-form-input>
                        </b-form-group>
                    </b-col>
                    <b-col>
                        <b-form-group label="Longitude" v-bind:state="isValidLongitude" invalid-feedback="Longitude should be between -180 and 180.">
                            <b-form-input  v-model="venue.longitude" placeholder="Longitude" v-bind:state="isValidLongitude"></b-form-input>
                        </b-form-group>
                    </b-col>
                </b-row>
                
                <b-button @click="addVenue()">Add Venue</b-button>
            </b-card>
        </b-container>
    </div>
</template>

<script>
import Api from '../api.js';
export default {
    data: function() {
        return {
            categories: [],

            venue: {
                venueName: "",
                categoryId: null,
                city: "",
                shortDescription: "",
                longDescription: "",
                address: "",
                latitude: "",
                longitude: ""
            },

            isValidVenueName: null,
            isValidCategory: null,
            isValidShortDescription: null,
            isValidCity: null,
            isValidAddress: null,
            isValidLatitude: null,
            isValidLongitude: null,

            errorTitle: "Error",
            errorMessage: "An error has occured."
        };
    },
    mounted: function() {
        this.getCategories();
    },
    methods: {
        getCategories() {
            Api.requestCategories().then((response) => {
                this.categories = response.data;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        addVenue() {
            this.isValidVenueName =  this.venue.venueName != "";
            this.isValidCategory = this.venue.categoryId != null;
            this.isValidShortDescription = this.venue.shortDescription != "";
            this.isValidCity = this.venue.city != "";
            this.isValidAddress = this.venue.address != "";
            this.isValidLatitude = this.venue.latitude != "" && -90 <= Number(this.venue.latitude) && Number(this.venue.latitude) <= 90;
            this.isValidLongitude = this.venue.longitude != "" && -180 <= Number(this.venue.longitude) && Number(this.venue.longitude) <= 180;
            if (this.isValidVenueName && this.isValidCategory && this.isValidShortDescription && this.isValidShortDescription && this.isValidCity && this.isValidAddress && this.isValidLatitude && this.isValidLongitude) {
                this.venue.latitude = Number(this.venue.latitude);
                this.venue.longitude = Number(this.venue.longitude);
                Api.requestCreateVenue(this.venue).then((response) => {
                    this.$router.push('/');
                }).catch((error) => {
                    if (error.status === 401) {
                        this.createErrorModal("Authentication Error!", "You must be logged in to create a venue.");
                    } else {
                        this.createErrorModal("Opps. Something went wrong, try again later.");
                        console.log(error);
                    }});  
            }
        }
    },
    computed: {
        categoryOptions: function() {
            let options = [];
            for (let category of this.categories) {
                options.push({value: category.categoryId, text: category.categoryName})
            }
            return options;
        }
    }
}
</script>