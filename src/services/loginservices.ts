import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/';

interface LoginData {
    username: string;
    password: string;
}

export const loginAuthService = async (formData: LoginData) => {
    try {
        const response = await axios.post(`${BACKEND_URL}auth/auth-login`, formData, {
            headers: {'Content-Type': 'application/json'}
        })
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Login failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}


//Log out user by ID
export const logoutAuthService = async (userId:string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}auth/auth-logout/${userId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Creating friend request fail.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}