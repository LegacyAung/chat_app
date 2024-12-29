"use client";

import { useState, useEffect } from 'react';
import {
    searchUser, 
    createFriendRequest, 
    viewFriendRequests,
    searchUserByJWTToken
} from '@/services/dashboardservices';
import {Friends} from '@/model/Friends';
import {decodeId} from '@/utils/encodeDecodeUtils';

interface User {
    _id : string,
    username : string,
    email?: string
}

interface AddFriendProps {
    onClose: () => void; // Callback to close the component
}

export default function AddFriend({ onClose }: AddFriendProps) {
    const [friendIdentifier, setFriendIdentifier] = useState<string>(''); // Stores input (username/email)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [userIdUrl , setUserIdUrl] = useState<string | null>(null);
    const [friendReqList, setFriendReqList] = useState<Friends[]>([]);
    const [userData, setUserData] = useState({});
   

    useEffect(() => {
        const fetchUserRequest = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('id') ?? '';
            const decodedUserId = decodeId(userId);
            
            if(decodedUserId) {
                setUserIdUrl(decodedUserId);
            }
            
            if(decodedUserId) {
                setLoading(true);
                setError(null);
                try {
                    const userFriendObjLists = await viewFriendRequests(decodedUserId);
                    const userData = await searchUserByJWTToken(decodedUserId);
                    const userFriendReqData = userFriendObjLists.data || [];
                    setFriendReqList(userFriendReqData);
                    setUserData(userData);
                    
                } catch (err) {
                    console.error(err);
                    setError('Failed to load friend requests.'); // Handle any error that occurs
                } finally {
                    setLoading(false); // Stop loading
                }
            }
        }    
        fetchUserRequest();
    }, [])

    // Handle the input change event
    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFriendIdentifier(value);

        // Call the search function with a debounce (optional)
        if (value) {
            try {
                const users = await searchUser(value); // Pass the input value directly
                console.log(users);
                console.log("friendReqList", friendReqList);
                // Filter out users who already have a pending friend request with the logged-in user
                const filteredUsers = users.users.filter((user:User) =>
                    !friendReqList.some(req => req.friendId === user._id || req.userId === user._id)
                );
                setSearchResults(filteredUsers); // Set the search results state
                
            } catch (error: unknown) {
                if(error instanceof Error) {
                    setError(error.message);
                } else {
                    setError('An unknown error occurred.');
                }
            }
        } else {
            setSearchResults([]); // Clear results if input is cleared
        }
    };

    const handleAddFriendList = async (e: React.MouseEvent<HTMLLIElement>) => {
        const value = (e.currentTarget as HTMLLIElement).textContent;
        if (value) {
            setSelectedUser(value);
        }
    }


    const handleAddFriend = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Use find to get the result where the username matches selectedUser
            const foundUser = searchResults.find(result => result.username === selectedUser);
            const friendId = foundUser ? foundUser._id : null; 
            
            // Get the userId from the URL
            const decodedUserId = userIdUrl; //this is jwt token encrypted token
            
            if (!friendId) {
                setError('Selected user not foundSelected user not found.');
                return;
            }

            if (!decodedUserId) {
                setError('User ID not found in URL.');
                return;
            }

            if(friendId === userData._id) {
                setError('You cannot add yourself');
            } else {
                const users = await createFriendRequest(decodedUserId, friendId);
                // Log the response from createFriendRequest if needed
                console.log('Friend request response:', users);
                setSuccess('Friend request sent successfully!');
            }
            
            setFriendIdentifier(''); // Clear input after success
        } catch (err: unknown) {
            // Ensure the error is cast to a string or use a fallback message
        if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add a Friend</h2>

            <div className="mb-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter username or email"
                    value={friendIdentifier}
                    onChange={handleInputChange}
                />
            </div>

            {/* Show search results */}
            {searchResults.length > 0 && (
                <ul className="mb-4 bg-gray-100 rounded-lg p-2">
                    {searchResults.map((result, index) => {
                        // Check if the userIdUrl is already in friendReqList's friendId
                        const isFriend = friendReqList.some(friendReq => friendReq.friendId === userIdUrl && friendReq.userId === result._id);

                        // If not already friends, show in the search result
                        if (!isFriend) {
                            return (
                                <li
                                    key={index}
                                    onClick={handleAddFriendList}
                                    className={`p-2 hover:bg-gray-200 cursor-pointer ${selectedUser === result.username ? 'bg-blue-300 rounded-lg' : ''}`}
                                >
                                    {result.username}
                                </li>
                            );
                        }
                    })}
                    
                </ul>
            )}

            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-500 mb-2">{success}</div>}

            <div className="flex justify-between">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    onClick={handleAddFriend}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Add Friend'}
                </button>

                <button
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}



