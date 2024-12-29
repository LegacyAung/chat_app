import io from 'socket.io-client';
import {FriendRequest} from '@/model/Friends';
import {RoomChat} from '@/model/RoomChat';

import dotenv from 'dotenv';
dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/';
const socket = io(BACKEND_URL);


export const getSocketId = () => {
    return socket.id;
}

export const emitRegisterUserIdToSocketId = (userId:string) => {
    socket.emit('registerUser',userId);
}

export const removeRegisterUserIdFromSocketId = () => {
    socket.off('registerUser');
}

export const emitRegisterRoomId = (userId:string, friendId:string) => {
    socket.emit('registerRoom', userId, friendId);
}

export const removeRegisterRoomId = () => {
    socket.off('registerRoom');
    
}
export const emitSendMessage = (roomId:string, message:string, senderUsername:string) => {
    socket.emit('sendMessage', roomId, message, senderUsername);
}

export const removeSendMessage = () => {
    socket.off('sendMessage');
}

export const listenFriendRequestService = (callback: (data:FriendRequest) => void) => {
    socket.on('friendRequest',callback);
}

export const removeFriendRequestListeners = () => {
    socket.off('friendRequest');
}

export const listenAcceptedFriendRequestService = (callback: (data:FriendRequest) => void) => {
    socket.on('acceptedFriendRequest', callback);
}

export const removeAcceptedFriendRequestListeners = () => {
    socket.off('acceptedFriendRequest');
}

export const listenDeleteFriendRequestService = (callback: (data:FriendRequest) => void) => {
    socket.on('deleteFriendRequest',callback);
}

export const removeDeleteFriendRequestListeners = () => {
    socket.off('deleteFriendRequest');
}

export const listenMessageRequestListener = (callback: (data:RoomChat) => void) => {
    socket.on('message', callback);
}

export const removeMessageRequestListener = () => {
    socket.off('message');
}

export const listenReceivedMessageListener = (callback: (data:{roomId:string, message:string, senderUsername:string})=> void) => {
    socket.on('receivedMessage', callback);
}

export const removeReceivedMessageListener = () => {
    socket.off('receivedMessage');
}





