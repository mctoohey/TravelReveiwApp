import Vue from 'vue';

const baseURL = 'http://csse-s365.canterbury.ac.nz:4001/api/v1/';

export function requestSignIn(username, email, password) {
    return Vue.http.post(baseURL+'users/login', {
                        "username": username,
                        "email": email,
                        "password": password
                    });
}

export function requestUser(id) {
    return Vue.http.get(baseURL+'users/' + id);
}