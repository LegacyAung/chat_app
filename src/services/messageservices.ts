import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/';

interface CreateMessagePayload {
    sender: string;
    receiver: string;
    message: string;
}

export const createMessageService = async (payload:CreateMessagePayload) => {
    try {
        const response = await axios.post(`${BACKEND_URL}messages`,payload);
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Creating message obj failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}

export const getMessageBetweenUserIdsService = async (userId1:string, userId2:string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}messages/getMessage/${userId1}/${userId2}`,);
        return response.data;
    } catch(error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Creating message obj failed.');
        } else {
            throw new Error('Network error or server issue.');
        }
    }
}