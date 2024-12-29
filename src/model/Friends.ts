export interface UserDetails {
    _id: string;
    name: string;
    email: string;
    username: string;
    status: string;
}

export interface UserInfo {
    _id: string;
    name: string,
    username: string,
    email: string
}

export interface Friends {
    _id: string;
    userId: string;
    friendId: string;
    status: 'pending' | 'accepted' | 'blocked',
    friendDetails?: UserDetails;
    userDetails?: UserDetails
}


export interface FriendRequest {
    message: string;
    data: Friends
}

