import api from './api';
import { setUserData } from '../store/user';

export async function login(username, password) {

    try {
        const response = await api.post('/auth/login', { username, password });
        const  token  = response.data.token;
        const usedId = response.data.userId;
        setUserData(token, usedId);
        return response.status;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response:', error.response.data);
            return error.response.status;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            return 500; // Internal Server Error
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
            return 500; // Internal Server Error
        }
    }

}

export async function register(username, password, email){

    try {
    const response = await api.post('/auth/register', {
      id: 0,           
      username,
      password,
      email
    })

    return response;

    } catch (error) {
        if (error.response) {
            
            console.error('Error response:', error.response.data);
            return error.response;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            return 500; // Internal Server Error
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
            return 500; // Internal Server Error
        }
    }
        
}