"use client";

import { useState, useEffect } from 'react';
import {viewFriendRequests, 
        searchUserById,
        searchUserByJWTToken, 
        deleteFriendRequests, 
        acceptFriendRequests
} from '@/services/dashboardservices';
import {Friends} from '@/model/Friends';
import {decodeId} from '@/utils/encodeDecodeUtils';


interface ViewFriendProps {
    onClose: () => void;
    newFriendRequests: Friends[];
    deletedFriendRequests: Friends[];
    updatedFriendRequests: Friends[];
};



export default function ViewFriends({ onClose, newFriendRequests, deletedFriendRequests, updatedFriendRequests }: ViewFriendProps) {
    const [friendIdentifier, setFriendIdentifier] = useState<string>(''); 
    const [friendLists, setFriendLists] = useState<Friends[]>([]);
    const [viewFriendUsername, setViewFriendUsername] = useState<string[]>([]);
    const [urlUserId, setUrlUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userData, setUserData] = useState({});
    

   

    // Update friend lists with new friend requests when they change
    useEffect(() => {
        const updateFriendLists = async () => {
            if(newFriendRequests.length === 0) return;
            const friendUsers = await Promise.all(newFriendRequests.map(fetchFriendDetails));
            setFriendLists((prevLists) => {
                const existingIds = new Set(prevLists.map((friend) => friend._id));
                const newFriends = friendUsers.filter((friend) => !existingIds.has(friend._id));
                return [...prevLists, ...newFriends] as Friends[];
            })
        }
        updateFriendLists();
    }, [newFriendRequests]);

    useEffect(() => {
        const updateFriendLists = async () => {
            if (updatedFriendRequests.length === 0) return;
            const friendUsers = await Promise.all(updatedFriendRequests.map(fetchFriendDetails));
    
            setFriendLists((prevLists) => {
                return prevLists.map((friend) => {
                    const match = updatedFriendRequests.find(request => request._id === friend._id);
                    if (match) {
                        const updatedFriend = friendUsers.find(f => f._id === friend._id);
                        return updatedFriend ? { ...updatedFriend, status: 'accepted' } : friend;
                    }
                    return friend;
                });
            });
        };
    
        updateFriendLists();
    }, [updatedFriendRequests]);

    useEffect(() => {
        const updateFriendLists = () => {
            if(deletedFriendRequests.length === 0) return;

            setFriendLists(prevFriendLists => {
                const updatedFriendLists = prevFriendLists.filter(friend => 
                    !deletedFriendRequests.some(deletedRequest => deletedRequest._id === friend._id)
                )
                return updatedFriendLists as Friends[];
            })
        }

        updateFriendLists();
    },[deletedFriendRequests])
   
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenURL = urlParams.get('id') ?? '';
        const JWTdecodedUserId = decodeId(tokenURL);
        const fetchFriendRequests = async () => {
            if (JWTdecodedUserId) {
                setLoading(true);
                setError(null);
                setUrlUserId(JWTdecodedUserId);
                try {
                    const friendList = await viewFriendRequests(JWTdecodedUserId);
                    const userData = await searchUserByJWTToken(JWTdecodedUserId);
                    const friendsData = friendList.data || [];
                    setUserData(userData);
                    const friendUsers = await Promise.all(
                        friendsData.map(fetchFriendDetails)
                    );
                    
                    setFriendLists(friendUsers);
                    setSuccess('Friend requests loaded successfully.');
                } catch(error) {
                    console.error(error);
                }
            } else {
                setError('User ID not provided in URL');
            }
        }
        fetchFriendRequests();
    }, [])

    useEffect(() => {
        // Find the matching usernames
        const matchedUsernames: string[] = [];
    
        friendLists
            .filter(friend => friend.status === 'accepted') 
            .forEach(friend => {
                if (userData._id === friend.userDetails?._id && friend.friendDetails?.username) {
                    matchedUsernames.push(friend.friendDetails.username);
                }
    
                if (userData._id === friend.friendDetails?._id && friend.userDetails?.username) {
                    matchedUsernames.push(friend.userDetails.username);
                }
            });
        setViewFriendUsername(matchedUsernames);
    }, [friendLists, userData]);


    const fetchFriendDetails = async (friend:Friends) => {
        if(friend.status === "pending" || friend.status === "accepted") {
            const friendDetails = await searchUserById(friend.friendId);
            const userDetails = await searchUserById(friend.userId);
            return {...friend, friendDetails, userDetails};
        }
        return {...friend, friendDetails: null, userDetails: null};
    }

    
    const handleCancelButtonClick = async (friend: Friends) => {
        setLoading(true); // Start loading
        setError(null); // Reset error before fetching
        try {
            await deleteFriendRequests(friend._id);
        } catch (err) {
            console.error(err);
            setError('Failed to cancel friend request.'); // Handle any error that occurs
        } finally {
            setLoading(false); // Stop loading
        }
    }

    const handleAcceptButtonClick = async (friend: Friends) => {
        setLoading(true);
        setError(null);
        try {
            await acceptFriendRequests(friend._id, 'accepted');
        } catch(err) {
            console.error(err);
        }

    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">View Friends</h2>

            <div className="mb-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter username or email"
                    value={friendIdentifier}
                    onChange={(e) => setFriendIdentifier(e.target.value)}
                />
            </div>

            {/* Sent Friend Request */}
            {friendLists.length > 0 && (
                <div className="mt-2 mb-2 p-2 bg-zinc-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Sent Friend Requests</h3>
                    <ul className="list-disc pl-5">
                        {friendLists
                            .filter(friend => friend.status === 'pending' && friend.userId === userData._id)
                            .map((result, index) => (
                                <li key={index} className="flex items-center justify-between mb-2">
                                    <span>{result.friendDetails ? result.friendDetails.username : ''}</span>
                                    <button 
                                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleCancelButtonClick(result)}
                                    >
                                        Cancel
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            {/* Pending Friend Requests */}
            {friendLists.length > 0 ? (
                <div className="mt-2 mb-2 p-2 bg-zinc-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Accept Friend Requests</h3>
                    <ul className="list-disc pl-5">
                        {friendLists
                            .filter(friend => friend.status === 'pending' && friend.friendId === userData._id)
                            .map((result, index) => (
                            <li key={index} className="flex item-center justify-between mb-2">
                                <span>{result.userDetails ? result.userDetails.username : ''}</span> {/* Display username */}
                                <button 
                                    className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                    onClick={() => handleAcceptButtonClick(result)}
                                >
                                    Accept
                                </button>
                                <button 
                                    className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    onClick={() => handleCancelButtonClick(result)}
                                >
                                    Cancel
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="text-gray-500"></div>
            )}

            {/* View Friends */}
            {friendLists.some(friend => friend.status === 'accepted') ? (
                <div className="mt-2 mb-2 p-2 bg-zinc-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">View Friends</h3>
                    <ul className="list-disc pl-5">
                        {friendLists
                            .filter(friend => friend.status === 'accepted') // Show only accepted friends
                            .map((result, index) => (
                                <li key={index} className="flex items-center justify-between mb-2">
                                    <span>
                                        {viewFriendUsername[index]}
                                    </span>
                                    <button 
                                        className="ml-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleCancelButtonClick(result)}
                                    >
                                        Unfriend
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            ) : (
                <div className="text-gray-500">No accepted friends to show.</div>
            )}

            

            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-500 mb-2">{success}</div>}

            <div className="flex justify-between">
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



