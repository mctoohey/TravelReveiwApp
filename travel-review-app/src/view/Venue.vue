<template>
    <div v-if="venue != null">
        <b-row style="margin-top: 30px">
            <b-col style="padding-left: 50px">
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
                    </b-card-sub-title>
                    <b-list-group style="margin-top: 20px; margin-bottom: 20px">
                        <b-list-group-item>City: {{ venue.city }}</b-list-group-item>
                        <b-list-group-item>Address: {{ venue.address }}</b-list-group-item>
                    </b-list-group>
                    <b-card>
                        <b-card-sub-title>Description<span v-if="venue.longDescription != ''"><b-button v-b-toggle.descriptionCollapse style="float: right" variant="link"><v-icon :name="descriptionCollapsed ? 'chevron-down':'chevron-right'" scale="1.5"/></b-button></span></b-card-sub-title>
                        <b-card-text>{{ venue.shortDescription }}</b-card-text>
                        <b-collapse id="descriptionCollapse" v-model="descriptionCollapsed">
                            <b-card-text>{{ venue.longDescription }}</b-card-text>
                        </b-collapse>
                    </b-card>
                <b-card style="margin-top: 20px;">
                    <b-card-text>Added by '{{ venue.admin.username }}' on {{ venue.dateAdded | formatDate }}</b-card-text>
                </b-card>
                </b-card>
            </b-col>
            <b-col style="padding-right: 50px">
                <b-card title="Photos" style="height: 100%;">
                    <b-carousel :interval="5000" controls indicators background="#ababab" style="text-shadow: 1px 1px 2px #333">
                
                        <b-carousel-slide v-for="photo in venue.photos" v-bind:key="photo.photoFilename"
                            :img-src="getPhotoUrl(photo.photoFilename)"
                            :caption="photo.photoDescription"
                        ></b-carousel-slide>
                        
                    </b-carousel>
                </b-card>
            </b-col>
        </b-row >
        <b-row style="margin-bottom: 20px">
            <b-col>
                <b-card>
                    <b-card-title>Reviews</b-card-title>
                    <b-button v-b-toggle="'post-review-card'" style="margin-bottom: 10px">Post a review</b-button>
                    <b-collapse id="post-review-card">
                            <b-form-textarea
                                id="textarea"
                                v-model="text"
                                placeholder="Enter something..."
                                rows="3"
                                max-rows="6"
                                ></b-form-textarea>
                    </b-collapse>
                    <b-card v-for="review in reviews" v-bind:key="review.reviewAuthor.userId" style="margin-bottom: 10px">
                        <b-card-sub-title>{{ review.reviewAuthor.username }}<span style="float: right">{{ review.timePosted | formatDate}} at {{ review.timePosted | formatTime }}</span></b-card-sub-title>
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
                        <h2><b-badge variant="light" align="center">This venue has no reviews yet</b-badge></h2>
                    </div>
                </b-card>
            </b-col>
        </b-row>
    </div>
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
            descriptionCollapsed: false
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
            }).catch((error) => {
                // TODO: Handle error.
                console.log(error);
            });
        },
        getPhotoUrl(photoFilename) {
            return Api.getVenuePhotoUrl(this.$route.params.venueId, photoFilename);
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

