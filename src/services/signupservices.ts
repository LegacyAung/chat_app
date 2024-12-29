import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/';

interface SignupData {
    name: string;
    username: string;
    email: string;
    password: string;
}

interface UsernameCheckData {
    username: string;
    email: string;
}



// Signup service using axios
export const signupService = async (formData: SignupData) => {
    try {
        const response = await axios.post(`${BACKEND_URL}users`, formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // If the request was successful, return the response data
        console.log(response.data);
        return response.data;
    } catch (error) {
        // Handle errors and return a descriptive message
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Error occurred while signing up.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
};


//checking user exists
export const checkUserExistsService = async (formData: UsernameCheckData) => {
    try {
        const response = await axios.get(`${BACKEND_URL}users/checkuser`, {
            params: {
                username: formData.username,
                email: formData.email
            },
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return response.data;
    } catch (error) {
        // Handle errors and return a descriptive message
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Error occurred while checking user.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
};


















