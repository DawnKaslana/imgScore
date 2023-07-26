import axios from 'axios'

const baseURL = 'http://127.0.0.1:3001';
export const file_url = baseURL+'/getFile?filename='

axios.defaults.withCredentials = false;

export default ({ url, method, headers, data, params }, option = {}) => {
    return axios(baseURL+url, {
        method: method || 'GET', 
        data,
        params,
        headers: headers || {
            'content-type': 'application/json'
        },
        ...option
    })
}

