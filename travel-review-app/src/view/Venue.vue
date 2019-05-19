<template>
    <b-container v-if="venue !== null" fluid style="padding: 20px;">
        <b-row style="margin-top: 0px;">
            <b-col style="padding-top: 0px; padding-left: 10px; padding-right: 10px; min-width: 350px">
                <b-card :title="venue.venueName" style="height: 100%">
                    <b-card-sub-title>
                        <b-badge id="categoryBadge">
                            <b-popover
                                target="categoryBadge"
                                placement="top"
                                :title="venue.category.categoryName"
                                triggers="hover focus"
                                :content="venue.category.categoryDescription"
                            ></b-popover><h6>{{ venue.category.categoryName }}</h6></b-badge>
                        <b-button v-if="adminView" :to="`/venues/${$route.params.venueId}/edit`" size="lg" variant="outline-success" style="margin-left: 15px; padding-top: 0px; padding-bottom: 0px; float: right">Edit</b-button>
                    </b-card-sub-title>
                        <b-card style="margin-top: 15px; margin-bottom: 15px">
                            <b-card-sub-title>Description<span v-if="venue.longDescription !== ''"><b-button v-b-toggle.descriptionCollapse style="float: right" variant="link"><v-icon :name="descriptionExpanded ? 'chevron-down':'chevron-right'" scale="1.5"/></b-button></span></b-card-sub-title>
                            <b-card-text>{{ venue.shortDescription }}</b-card-text>
                            <b-collapse id="descriptionCollapse" v-model="descriptionExpanded">
                                <b-card-text>{{ venue.longDescription }}</b-card-text>
                            </b-collapse>
                        </b-card>
                        <div>
                            <b-badge v-if="meanStarRating != null" pill variant="dark" style="margin: 0;">
                                <star-rating style="width: 120px; padding: 2px;" iconScale="1.5" :stars="Number(meanStarRating)"></star-rating>
                            </b-badge>
                            <b-badge pill variant="dark" style="margin-right: 0px;">
                                <cost-rating v-if="modeCostRating != null" style="width: 120px;" iconScale="1.5" :costRating="Number(modeCostRating)"></cost-rating>
                                <span v-else>This venue has no ratings yet</span>
                            </b-badge>
                        </div>
                        <b-list-group style="margin-top: 20px; margin-bottom: 20px;">
                            <b-list-group-item>City: {{ venue.city }}</b-list-group-item>
                            <b-list-group-item>Address: {{ venue.address }}</b-list-group-item>
                        </b-list-group>
                    
                <b-card style="margin-top: 20px;">
                    <b-card-text>Added by <a :href="`/users/${venue.admin.userId}`">{{ venue.admin.username }}</a> on {{ venue.dateAdded | formatDate }}</b-card-text>
                </b-card>
                </b-card>
            </b-col>
            <b-col style="padding-top: 0px; padding-left: 10px; padding-right: 10px;">
                <b-card title="Photos" style="height: 100%;">
                    <div style="">
                    <b-carousel v-if="venue.photos.length > 0" :interval="4000" controls indicators style="text-shadow: 1px 1px 2px #333; border: 4px solid gray; border-radius: 25px; overflow: hidden;" class="text-center">
                        <b-carousel-slide v-for="photo in venue.photos" v-bind:key="photo.photoFilename" style="" background="black">
                            <img :src="getPhotoUrl(photo.photoFilename)" style="object-fit: contain;" slot="img" height="480" width="800">
                        </b-carousel-slide>
                    </b-carousel>
                    <h2 v-else class="text-center"><b-badge variant="light" align="center" style="margin-top: auto; margin-bottom: auto;">This venue has no photos yet</b-badge></h2>
                    </div>
                </b-card>
            </b-col>
        </b-row>
        <b-row style="margin-top: 20px;">
            <b-col style="padding-top: 0px; padding-left: 10px; padding-right: 10px;">
                <b-card>
                    <b-card-title>Reviews</b-card-title>
                    <b-button @click="expandReviewAction()" style="margin-bottom: 10px" :disabled="adminView">{{postReviewbuttonText}}</b-button>
                    <b-collapse v-model="postReviewExpanded" id="postReviewCollapse">
                        <b-card style="margin-bottom: 10px;">
                            <template v-if="!userHasReview">
                                <b-row>
                                <b-col>
                                    <b-form-group invalid-feedback="Your review can not be empty." :state=isValidReviewBody>
                                        <b-form-textarea
                                            v-model="userReview.reviewBody"
                                            placeholder="Enter your review..."
                                            rows="8"
                                            :state=isValidReviewBody
                                            ></b-form-textarea>
                                    </b-form-group>
                                </b-col>
                                <b-col style="max-width: 300px">
                                    <b-form-group label="Minimum star rating" style="max-width: 250px">
                                        <b-form-input v-model="userReview.starRating" type="range" min="1" max="5"></b-form-input>
                                        <star-rating iconScale="2" :stars="Number(userReview.starRating)"></star-rating>
                                    </b-form-group>
                                    <b-form-group label="Maximum cost rating" style="max-width: 250px">
                                        <b-form-input v-model="userReview.costRating" type="range" min="0" max="4"></b-form-input>
                                        <cost-rating iconScale="2" :costRating="Number(userReview.costRating)"></cost-rating>
                                    </b-form-group>
                                </b-col>
                                </b-row>
                                <b-row style="margin-bottom: 0px">
                                    <b-container fluid class="text-right">
                                        <b-button @click="postReview()" style="min-width: 100px">Post</b-button>
                                    </b-container>
                                </b-row>
                            </template>
                            <template v-else>
                                <b-card-sub-title>{{ userReview.reviewAuthor.username }}<span style="float: right">{{ userReview.timePosted | formatDate}} at {{ userReview.timePosted | formatTime }}</span></b-card-sub-title>
                                <b-card-body style="padding: 15px;">
                                    <b-row>
                                        <b-col style="padding: 0px;">
                                            <b-card-text>{{ userReview.reviewBody }}</b-card-text>
                                        </b-col>
                                        <b-col style="padding: 0px;">
                                            <div style="float: right">
                                                <b-badge pill variant="dark" style="margin: 0;">
                                                    <star-rating style="width: 120px; padding: 2px;" iconScale="1.5" :stars="Number(userReview.starRating)"></star-rating>
                                                </b-badge>
                                            </div>
                                            <br><br>
                                            <div style="float: right">
                                                <b-badge pill variant="dark" style="margin-right: 0px;">
                                                    <cost-rating style="width: 120px;" iconScale="1.5" :costRating="Number(userReview.costRating)"></cost-rating>
                                                </b-badge>
                                            </div>
                                        </b-col>
                                    </b-row>
                                </b-card-body>
                            </template>
                        </b-card>
                    </b-collapse>
                    <b-card v-for="review in reviews" v-bind:key="review.reviewAuthor.userId" style="margin-bottom: 10px">
                        <b-card-sub-title><a :href="`/users/${review.reviewAuthor.userId}`">{{ review.reviewAuthor.username }}</a><span style="float: right">{{ review.timePosted | formatDate}} at {{ review.timePosted | formatTime }}</span></b-card-sub-title>
                        <b-card-body style="padding: 15px;">
                            <b-row>
                                <b-col style="padding: 0px;">
                                    <b-card-text>{{ review.reviewBody }}</b-card-text>
                                </b-col>
                                <b-col style="padding: 0px;">
                                    <div style="float: right">
                                        <b-badge pill variant="dark" style="margin: 0;">
                                            <star-rating style="width: 120px; padding: 2px;" iconScale="1.5" :stars="Number(review.starRating)"></star-rating>
                                        </b-badge>
                                    </div>
                                    <br><br>
                                    <div style="float: right">
                                        <b-badge pill variant="dark" style="margin-right: 0px;">
                                            <cost-rating style="width: 120px;" iconScale="1.5" :costRating="Number(review.costRating)"></cost-rating>
                                        </b-badge>
                                    </div>
                                </b-col>
                            </b-row>
                        </b-card-body>
                    </b-card>
                    <div v-if="reviews.length === 0" class="text-center">
                        <h2><b-badge variant="light" align="center">This venue has no reviews from other users yet</b-badge></h2>
                    </div>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import Api from '../api.js';
import 'vue-awesome/icons/chevron-down';
import 'vue-awesome/icons/chevron-right';
import starRating from '../components/StarRating.vue';
import costRating from '../components/CostRating.vue';
export default {
    data: function() {
        return {
            venue: null,
            reviews: [],
            descriptionExpanded: false,
            postReviewExpanded: false, 
            meanStarRating: null,
            modeCostRating: null,

            userReview: {
                reviewBody: "",

                starRating: 2,
                costRating: 2
            },
            userHasReview: false,
            isValidReviewBody: null
        };
    },
    mounted: function() {
        this.getVenue(this.$route.params.venueId);
        this.getReviews(this.$route.params.venueId);
    },
    methods: {
        getVenue(venueId) {
            Api.requestVenue(venueId).then((response) => {
                this.venue = response.data;
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        getReviews(venueId) {
            Api.requestVenueReviews(venueId).then((response) => {
                this.reviews = response.data;
                if (this.reviews.length > 0) {
                    let i = 0;
                    let userReviewIndex = -1;
                    let starSum = 0;
                    let costRatingMode = "-1";
                    let costRatingFrequencies = {"-1": -1};
                    let numReviews = this.reviews.length;
                    for (let review of this.reviews) {
                        if (this.$store.state.signedInUser !== null && parseInt(review.reviewAuthor.userId) === parseInt(this.$store.state.signedInUser.id)) {
                            this.userReview = review;
                            this.userHasReview = true;
                            userReviewIndex = i;
                        }
                        starSum += review.starRating;
                        if (costRatingFrequencies.hasOwnProperty(review.costRating)) {
                            costRatingFrequencies[review.costRating] += 1;
                        } else {
                            costRatingFrequencies[review.costRating] = 1;
                        }

                        if (costRatingFrequencies[review.costRating] > costRatingFrequencies[costRatingMode]) {
                            costRatingMode = review.costRating;
                        }
                        i += 1;
                    }
                    if (userReviewIndex > -1) {
                        this.reviews.splice(userReviewIndex, 1);
                    }
                    this.meanStarRating = starSum / numReviews;
                    this.modeCostRating = costRatingMode;
                } else {
                    this.meanStarRating = null;
                    this.modeCostRating = null;
                }
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        getPhotoUrl(photoFilename) {
            return Api.getVenuePhotoUrl(this.$route.params.venueId, photoFilename);
        },
        expandReviewAction() {
            if (!this.postReviewExpanded) {
                this.isValidReviewBody = null;
            }

            if (this.$store.getters.userSignedIn) {
                this.postReviewExpanded = !this.postReviewExpanded;
            } else {
                this.postReviewExpanded = false;
                this.$router.push('/signin');
            }
        },
        postReview() {
            this.userReview.costRating = parseInt(this.userReview.costRating);
            this.userReview.starRating = parseInt(this.userReview.starRating);
            if (this.userReview.reviewBody.length > 0) {
                Api.requestPostVenueReview(this.$route.params.venueId, this.userReview);
            } else {
                this.isValidReviewBody = false;
            }
        }
    },
    computed: {
        postReviewbuttonText: function() {
            if (this.userHasReview && !this.postReviewExpanded) {
                return "View my review";
            } else if (this.userHasReview && this.postReviewExpanded) {
                return "Close";
            } else if (this.$store.getters.userSignedIn && !this.postReviewExpanded) {
                return "Post a review";
            } else if (this.$store.getters.userSignedIn && this.postReviewExpanded) {
                return "Cancel";
            } else {
                return "Sign in to leave a review";
            }
        },
        adminView: function() {
            return this.$store.state.signedInUser !== null && parseInt(this.$store.state.signedInUser.id) === parseInt(this.venue.admin.userId);
        }
    },
    filters: {
        formatDate: function (value) {
            let date = new Date(value);
            return `${date.getDate()}`.padStart(2, '0') + '/' + `${date.getMonth()+1}`.padStart(2, '0') + '/' + `${date.getFullYear()}`;
        },
        formatTime: function(value) {
            let date = new Date(value);
            return `${date.getHours()}`.padStart(2, '0') + ':' + `${date.getMinutes()}`.padStart(2, '0');
        }
    },
    components: {
        starRating,
        costRating
    }
}
</script>
