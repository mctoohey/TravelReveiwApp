import Vue from 'vue';

const baseURL = 'http://localhost:4941/api/v1';

export const Api = {
    requestSignIn(username, email, password) {
        return Vue.http.post(baseURL+'/users/login', {
                            "username": username,
                            "email": email,
                            "password": password
                        });
    },
    
    requestSignOut() {
        return Vue.http.post(baseURL+'/users/logout');
    },
    
    requestUser(id) {
        return Vue.http.get(baseURL+'/users/' + id);
    },
    
    requestCreateUser(user) {
        return Vue.http.post(baseURL+'/users', user);
    },

    requestVenues(requestParams) {
        return Vue.http.get(baseURL+'/venues', {params: requestParams});
    },

    requestVenue(venueId) {
        return Vue.http.get(baseURL+`/venues/${venueId}`);
    },

    requestVenueReviews(venueId) {
        return Vue.http.get(baseURL+`/venues/${venueId}/reviews`);
    },

    requestCreateVenue(venue) {
        return Vue.http.post(baseURL+`/venues`, venue);
    },

    requetsAddVenuePhoto(venueId, photo, isPrimary, description) {
        let formData = new FormData();
        formData.append('photo', photo);
        formData.append('description', description);
        formData.append('makePrimary', isPrimary);
        return Vue.http.post(baseURL+`/venues/${venueId}/photos`, formData);
    },

    requestCategories() {
        return Vue.http.get(baseURL+'/categories');
    },

    getVenuePhotoUrl(venueId, photoId) {
        return baseURL+`/venues/${venueId}/photos/${photoId}`;
    }
}

export default Api;
