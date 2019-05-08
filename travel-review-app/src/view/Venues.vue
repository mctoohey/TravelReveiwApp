<template>
    <div>
        <b-container fluid>
            <b-container fluid class="mt-4" v-for="venue in this.venues">
                <b-card :title="venue.venueName" sub-title="Accomadation" :img-src="`http://csse-s365.canterbury.ac.nz:4001/api/v1/venues/${venue.venueId}/photos/${venue.primaryPhoto}`" img-alt="Image not found" img-right img-height="150">
                    <b-card-text>{{ venue.city }}</b-card-text>
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


