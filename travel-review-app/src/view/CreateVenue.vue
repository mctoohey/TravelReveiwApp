<template>
    <div>
        <b-container class="center" style="max-width: 50rem;">
            <b-card title="Create Venue">
                <b-row>
                    <b-col>
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
                    </b-col>
                    <b-col>
                        <b-form-group label="Photos">
                            <b-card>
                                <b-form-group :state="isValidPhotos" invalid-feedback="No files selected.">
                                    <b-form-file v-model="photos" multiple :file-name-formatter="formatFileBoxMessage" accept="image/jpeg, image/png" :state="isValidPhotos"></b-form-file>
                                </b-form-group>
                                <b-button @click="addPhotos()" style="margin-bottom: 15px">Add Selected Photos</b-button>
                                <b-card>
                                <template v-for="i in addedPhotos.length">
                                    <b-button-group style="margin-bottom: 10px" :id="`photo${i}`" size="sm" v-bind:key="i*addedPhotos.length+primaryPhoto">
                                        <b-button :pressed="true" style="outline: none; box-shadow: none; cursor: default;" variant="light">Photo #{{ i }}</b-button>
                                        <b-button @click="removePhoto(i-1)" variant="danger">Remove</b-button>
                                        <b-button @click="primaryPhoto=i" :variant="i != primaryPhoto ? 'outline-primary' : 'primary'">{{i != primaryPhoto ? 'Make Primary' :  'Primary Photo'}}</b-button>
                                    </b-button-group>
                                </template>
                                </b-card>
                                <b-popover v-for="i in addedPhotos.length" v-bind:key="i*addedPhotos.length+primaryPhoto" :target="`photo${i}`" triggers="hover" title="Preview" placement="left" no-fade>
                                    <b-img :src="getPreview(i-1)" height="100" style="max-width: 250px"></b-img>
                                </b-popover>
                            </b-card>
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

            isValidPhotos: null,

            photos: [],
            addedPhotos: [],
            primaryPhoto: 1, 

            editVenuePhotos: [],

            errorTitle: "Error",
            errorMessage: "An error has occured."
        };
    },
    mounted: function() {
        this.getCategories();
        if (this.editing) {
            this.getEditVenue();
        }
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
        getEditVenue() {
            Api.requestVenue(this.$route.params.venueId).then((response) => {
                let recievedVenue = response.data;

                this.venue.venueName = recievedVenue.venueName;
                this.venue.categoryId = recievedVenue.category.categoryId;
                this.venue.city = recievedVenue.city;
                this.venue.shortDescription = recievedVenue.shortDescription;
                this.venue.longDescription = recievedVenue.longDescription;
                this.venue.address = recievedVenue.address;
                this.venue.latitude = recievedVenue.latitude;
                this.venue.longitude = recievedVenue.longitude;
                
                this.editVenuePhotos = recievedVenue.photos;

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
                    let venueId = response.data.venueId;
                    let photoNumber = 1;
                    for (let photo of this.addedPhotos) {
                        console.log(photoNumber === this.primaryPhoto);
                        Api.requetsAddVenuePhoto(venueId, photo, photoNumber === this.primaryPhoto, "").then().catch((error) => {
                            // TODO: Handle error;
                            console.log(error);
                        });
                        photoNumber += 1;
                    }
                }).catch((error) => {
                    if (error.status === 401) {
                        this.createErrorModal("Authentication Error!", "You must be logged in to create a venue.");
                    } else {
                        this.createErrorModal("Opps. Something went wrong, try again later.");
                        console.log(error);
                    }});  
            }
        },
        addPhotos() {
            if (this.photos.length === 0) {
                this.isValidPhotos = false;
            } else {
                for (let photo of this.photos) {
                    this.addedPhotos.push(photo);
                }
                this.photos = [];
                this.isValidPhotos = null;
            }  
        },
        removePhoto(index) {
            this.addedPhotos.splice(index, 1);
            if (this.primaryPhoto-1 === index) {
                this.primaryPhoto = 1;
            } else if (index < this.primaryPhoto-1) {
                console.log("fasf")
                this.primaryPhoto -= 1;
            }
        },
        getPreview: function(index) {
            if (this.addedPhotos.length != 0) {
                return window.URL.createObjectURL(this.addedPhotos[index]);
            } else {
                return "";
            }
            
        },
        formatFileBoxMessage(files) {
            return `${files.length} photos selected`;
        }
    },
    computed: {
        categoryOptions: function() {
            let options = [];
            for (let category of this.categories) {
                options.push({value: category.categoryId, text: category.categoryName})
            }
            return options;
        },
        editing: function() {
            return this.$route.name === "EditVenue";
        }
    }
}
</script>
