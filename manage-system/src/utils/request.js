import axios from 'axios';
import bus from "../components/common/bus"

const service = axios.create({
    // process.env.NODE_ENV === 'development' 来判断是否开发环境
    // baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:10010' : "http://api.admin.com:10010",
    baseURL: "http://api.admin.com:10010",
    timeout: 10000
});

service.interceptors.request.use(
    config => {
        let token = localStorage.getItem('ms_token');
        if(token) {
            config.headers.Authorization = token
        }
        return config;
    },
    error => {
        return Promise.reject(error.message);
    }
);

service.interceptors.response.use(
    response => {
        if (response.status === 200) {
            return response.data;
        }
        else if(response.status === 400) {
            bus.$emit("relogin")
        }
        return Promise.reject(response.data.error || "");
    },
    error => {
        if (error.response) {
            return Promise.reject(error.response.data.error || error.message);
        } else {
            return Promise.reject(error.message);
        }
    }
);

export default service;
