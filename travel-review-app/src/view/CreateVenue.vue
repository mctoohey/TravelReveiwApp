<template>
    <div>
        <b-container class="center" style="max-width: 54rem;">
            <b-card :title="editing ? 'Edit Venue' : 'Create Venue'">
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
                                <b-form-group :state="isValidPhotos" :invalid-feedback="photosErrorMessage">
                                    <b-form-file @input="photos.length > 0 ? addPhotos() : ''" v-model="photos" multiple :file-name-formatter="formatFileBoxMessage" accept="image/jpeg, image/png" :state="isValidPhotos" placeholder="Add photos"></b-form-file>
                                </b-form-group>
                                <b-card>
                                <template v-for="i in totalNumberPhotos">
                                    <b-button-group style="margin-bottom: 10px" :id="`photo${i}`" size="sm" v-bind:key="i*totalNumberPhotos+primaryPhoto">
                                        <b-button :pressed="true" style="outline: none; box-shadow: none; cursor: default;" variant="light">Photo #{{ i }}</b-button>
                                        <b-button @click="removePhoto(i-1)" variant="danger">Remove</b-button>
                                        <b-button @click="primaryPhoto=i" :variant="i != primaryPhoto ? 'outline-primary' : 'primary'">{{i != primaryPhoto ? 'Make Primary' :  'Primary Photo'}}</b-button>
                                    </b-button-group>
                                    <b-badge v-if="editing && i-1 >= existingVenuePhotos.length" variant="success" v-bind:key="'badge'+i*totalNumberPhotos+primaryPhoto">New</b-badge>
                                </template>
                                </b-card>
                                <b-popover v-for="i in totalNumberPhotos" v-bind:key="i*totalNumberPhotos+primaryPhoto" :target="`photo${i}`" triggers="hover" title="Preview" placement="left" no-fade>
                                    <b-img :src="getPreview(i-1)" height="100" style="max-width: 250px"></b-img>
                                </b-popover>
                            </b-card>
                        </b-form-group>
                    </b-col>
                </b-row>
                <b-button @click="editing ? updateVenue() : addVenue()" :disabled="editing && !hasVenueChanged()">{{editing ? 'Update Venue' : 'Add Venue'}}</b-button>
                <b-button v-if="editing" @click="resetEdit()">Reset</b-button>
                <b-button @click="$router.go(-1)" style="float: right">Back</b-button>
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
            originalVenue: null,

            isValidVenueName: null,
            isValidCategory: null,
            isValidShortDescription: null,
            isValidCity: null,
            isValidAddress: null,
            isValidLatitude: null,
            isValidLongitude: null,

            isValidPhotos: null,
            photosErrorMessage: "",

            photos: [],
            addedPhotos: [],
            primaryPhoto: 1, 

            existingVenuePhotos: [],
            originalVenuePhotos: [],
            originalPrimaryPhoto: 1,
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
            Api.requestVenue(this.editVenueId).then((response) => {
                let recievedVenue = response.data;

                this.venue.venueName = recievedVenue.venueName;
                this.venue.categoryId = recievedVenue.category.categoryId;
                this.venue.city = recievedVenue.city;
                this.venue.shortDescription = recievedVenue.shortDescription;
                this.venue.longDescription = recievedVenue.longDescription;
                this.venue.address = recievedVenue.address;
                this.venue.latitude = recievedVenue.latitude;
                this.venue.longitude = recievedVenue.longitude;

                this.originalVenue = {};
                this.originalVenue.venueName = recievedVenue.venueName;
                this.originalVenue.categoryId = recievedVenue.category.categoryId;
                this.originalVenue.city = recievedVenue.city;
                this.originalVenue.shortDescription = recievedVenue.shortDescription;
                this.originalVenue.longDescription = recievedVenue.longDescription;
                this.originalVenue.address = recievedVenue.address;
                this.originalVenue.latitude = recievedVenue.latitude;
                this.originalVenue.longitude = recievedVenue.longitude;
                
                this.existingVenuePhotos = recievedVenue.photos;
                this.originalVenuePhotos = [];
                let i = 1;
                for (let photo of recievedVenue.photos) {
                    if (photo.isPrimary) {
                        this.primaryPhoto = i;
                    }
                    i+= 1;
                    this.originalVenuePhotos.push(photo);
                }
                this.originalPrimaryPhoto = this.primaryPhoto;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        addVenue() {
            if (this.validateInput()) {
                this.venue.latitude = Number(this.venue.latitude);
                this.venue.longitude = Number(this.venue.longitude);
                Api.requestCreateVenue(this.venue).then((response) => {
                    this.$router.push('/');
                    let venueId = response.data.venueId;
                    let photoNumber = 1;
                    for (let photo of this.addedPhotos) {
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
        updateVenue() {
            if (this.validateInput()) {
                this.venue.latitude = Number(this.venue.latitude);
                this.venue.longitude = Number(this.venue.longitude);
                Api.requestEditVenue(this.editVenueId, this.venue).then((response) => {
                    this.$router.push(`/venues/${this.editVenueId}`);
                    let photoNumber = 1;
                    for (let photo of this.addedPhotos) {
                        Api.requetsAddVenuePhoto(this.editVenueId, photo, photoNumber === this.primaryPhoto, "").then().catch((error) => {
                            // TODO: Handle error;
                            console.log(error);
                        });
                        photoNumber += 1;
                    }
                    for (let photo of this.originalVenuePhotos) {
                        if (!this.existingVenuePhotos.some(item => item.photoFilename === photo.photoFilename)) {
                            Api.requestRemoveVenuePhoto(this.editVenueId, photo.photoFilename).catch((error) => {
                                // TODO: Handle error;
                                console.log(error);
                            });
                        }
                    }
                    if (this.primaryPhoto-1 < this.existingVenuePhotos) {
                        Api.requestSetPrimaryVenuePhoto(this.editVenueId, this.existingVenuePhotos[this.primaryPhoto-1].photoFilename).catch((error) => {
                            // TODO: Handle error;
                            console.log(error);
                        });
                    }
                }).catch((error) => {
                    // TODO: Handle error.
                    console.log(error);
                });
            }
        },
        addPhotos() {
            let isValid = true;
            console.log(this.photos)
            for (let photo of this.photos) {
                if (photo.size > 20971520) {
                    this.isValidPhotos = false;
                    isValid = false;
                    this.photosErrorMessage = "One of the selected photos was over 20 MB.";
                } else if (photo.type != "image/jpeg" && photo.type != "image/png") {
                    this.isValidPhotos = false;
                    isValid = false;
                    this.photosErrorMessage = "Photos must be either in PNG or JPEG format.";
                }
            }
            if (isValid) {
                for (let photo of this.photos) {
                this.addedPhotos.push(photo);
            }
            this.isValidPhotos = null;
            }
            this.photos = [];
        },
        removePhoto(index) {
            if (index < this.existingVenuePhotos.length) {
                this.existingVenuePhotos.splice(index, 1);
            } else if (index < this.totalNumberPhotos) {
                this.addedPhotos.splice(index-this.existingVenuePhotos.length, 1);
            }
            
            if (this.primaryPhoto-1 === index) {
                this.primaryPhoto = 1;
            } else if (index < this.primaryPhoto-1) {
                this.primaryPhoto -= 1;
            }
        },
        getPreview: function(index) {
            if (index < this.existingVenuePhotos.length) {
                return Api.getVenuePhotoUrl(this.editVenueId, this.existingVenuePhotos[index].photoFilename);
            } else if (index < this.totalNumberPhotos) {
                return window.URL.createObjectURL(this.addedPhotos[index-this.existingVenuePhotos.length]);        
            } else {
                return "";
            }
            
        },
        formatFileBoxMessage(files) {
            return `${files.length} photos selected`;
        },
        validateInput() {
            this.isValidVenueName =  this.venue.venueName != "";
            this.isValidCategory = this.venue.categoryId != null;
            this.isValidShortDescription = this.venue.shortDescription != "";
            this.isValidCity = this.venue.city != "";
            this.isValidAddress = this.venue.address != "";
            this.isValidLatitude = this.venue.latitude != "" && -90 <= Number(this.venue.latitude) && Number(this.venue.latitude) <= 90;
            this.isValidLongitude = this.venue.longitude != "" && -180 <= Number(this.venue.longitude) && Number(this.venue.longitude) <= 180;
            return (this.isValidVenueName && this.isValidCategory && this.isValidShortDescription && this.isValidShortDescription && this.isValidCity && this.isValidAddress && this.isValidLatitude && this.isValidLongitude);
        },
        hasVenueChanged() {
            for (let key in this.originalVenue) {
                if (this.originalVenue[key] != this.venue[key]) {
                    return true;
                }
            }
            if (this.originalVenuePhotos.length != this.existingVenuePhotos.length || this.addedPhotos.length > 0 || this.originalPrimaryPhoto != this.primaryPhoto) {
                return true;
            }
            return false;
        },
        resetEdit() {
            this.venue.venueName = this.originalVenue.venueName;
            this.venue.categoryId = this.originalVenue.categoryId;
            this.venue.city = this.originalVenue.city;
            this.venue.shortDescription = this.originalVenue.shortDescription;
            this.venue.longDescription = this.originalVenue.longDescription;
            this.venue.address = this.originalVenue.address;
            this.venue.latitude = this.originalVenue.latitude;
            this.venue.longitude = this.originalVenue.longitude;

            this.existingVenuePhotos = [];
            this.addedPhotos = [];
            for (let photo of this.originalVenuePhotos) {
                this.existingVenuePhotos.push(photo);
            }
            this.primaryPhoto = this.originalPrimaryPhoto;
            this.photos = [];
            this.isValidPhotos = null;
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
        },
        editVenueId: function() {
            return this.$route.params.venueId;
        },
        totalNumberPhotos: function() {
            return this.addedPhotos.length + this.existingVenuePhotos.length;
        }
    }
}
</script>
