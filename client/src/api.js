import axios from 'axios'

//const api_base = 'http://47.108.179.63:3001';
const baseURL = 'http://127.0.0.1:3001';
axios.defaults.withCredentials = false;

export default ({ url, method, headers, data }, option = {}) => {
    return axios(baseURL+url, {
        method: method || 'GET', 
        data,
        headers: headers || {
            'content-type': 'application/json'
        },
        ...option
    })
}
