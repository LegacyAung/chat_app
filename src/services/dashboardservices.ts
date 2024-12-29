import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/';

export const fetchUserByToken = async (JWTtoken:string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}users/token`, {
            headers: {
                Authorization: `Bearer ${JWTtoken}`,
            }
        });
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch user by token.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}


export const userInfoService = async (userId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}users/jwt-token/${userId}`);
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Login failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}

//Get User to base on username or email
export const searchUser = async (query: string) => {
    try {

        const params:Record<string,string> = {query};
        const response = await axios.get(`${BACKEND_URL}users/searchusers`,{
            params
        });

        return response.data; 
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Getting user information failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}

//Get user by JWT-token from URL
export const searchUserByJWTToken = async (JWTtoken: string) => {
    try {   
        const response = await axios.get(`${BACKEND_URL}users/jwt-token/${JWTtoken}`)
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Getting user information failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}

//Get user by ID
export const searchUserById = async (userId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}users/${userId}`);
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Getting user information failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}


//Create a friend request 
export const createFriendRequest = async (userId:string, friendId:string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}friends`, {
            userId,
            friendId,
        });

        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Creating friend request fail.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}


//View friend requests
export const viewFriendRequests = async (userId:string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}friends/?userId=${userId}`);
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'View friend request fail.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}


//Accept friend requests
export const acceptFriendRequests = async (id:string, status:string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}friends/${id}?status=${status}`)
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Accepting friend request fail.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}

//Delete friend requests by ID
export const deleteFriendRequests = async (reqId: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}friends/${reqId}`);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Creating friend request fail.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}










