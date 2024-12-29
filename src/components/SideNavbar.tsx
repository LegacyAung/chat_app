// components/Sidenav.tsx
'use client';
import React, {useState, useEffect} from 'react';
import {Friends, UserInfo, UserDetails} from '../model/Friends';

import {
    emitRegisterRoomId,
} from '../app/socket';
import {searchUserById} from '../services/dashboardservices';



interface sideNavProps {
    userInfo:UserInfo | null;
    friendsInfo:Friends[];
}




export default function Sidenav({userInfo, friendsInfo}:sideNavProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [userResults, setUserResults] = useState<UserInfo | null>(null);
    const [friendsResults, setFriendsResults] = useState<Friends[]>([]);
    const [friendsDetailInfo, setFriendsDetailInfo] = useState<UserDetails[]>([]);
    
    useEffect(() => {
        if(userInfo && friendsInfo) {
            setUserResults(userInfo);
            setFriendsResults(friendsInfo);
        } else {
            console.log('no user information available or no friends info available');
        }
    },[userInfo, friendsInfo])

   
    useEffect(() => {
        const fetchFriendsDetails = async () => {
            if(userResults && friendsResults.length > 0) {
                try {
                    const friendDetails = await fetchFriendDetailsHandler(userResults, friendsResults);
                    console.log(typeof friendDetails); // Should log "object" (array)
                    console.log(friendDetails); // Should log the resolved array
                    setFriendsDetailInfo(friendDetails); // Update state with resolved array
                } catch (error) {
                    console.error('Error fetching friend details:', error);
                }
            }
        }
        
        fetchFriendsDetails();
    },[userResults,friendsResults])
    
    // Toggle sidebar function
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };


    //-----------------Handlers---------------------//
    const fetchFriendDetailsHandler = async (user: UserInfo, friends: Friends[]) => {
        const friendsWithAcceptedStatus = friends.filter(friend => friend.status === 'accepted');
        
        const friendDetails = await Promise.all(
            friendsWithAcceptedStatus.map(async (friend) => {
                if (friend.friendId === user._id) {
                    return await searchUserById(friend.userId);
                }
                if (friend.userId === user._id) {
                    return await searchUserById(friend.friendId);
                }
                return null; // Return null for unmatched cases
            })
        );
    
        return friendDetails.filter((detail): detail is UserDetails => detail !== null); // Filter out null values
    };


    const handleCreateSocketRoom = async (friendDetails: UserDetails) => {
        console.log('friendDetails', friendDetails);
        console.log('userResult', userResults);
        if(userResults && friendDetails) {
            emitRegisterRoomId(userResults._id, friendDetails._id);
        }
    }
    
    return (
        <div className={`h-screen ${isOpen ? 'w-64' : 'w-16'} bg-gray-800 text-white flex flex-col justify-between transition-width duration-300 ease-in-out relative`}>
            {/* Toggle Button */}
            <div className="absolute top-4 left-5">
                <button
                    className="text-white focus:outline-none"
                    onClick={toggleSidebar}
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                </button>
            </div>

            {isOpen && (
                <>
                    {/* User Profile Section */}
                    <div className="p-6">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-600 mb-4"></div>
                            {userResults ? (
                                <>
                                    <h2 className="text-lg font-semibold">{userResults.username}</h2>
                                    <p className="text-sm text-gray-400">{userResults.email}</p>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">No user information available</p>
                            )}
                        </div>
                    </div>

                    {/* Friends List */}
                    <div className="flex-grow overflow-y-auto">
                        <h3 className="px-6 text-sm font-semibold text-gray-400 mb-2">Friends</h3>
                        <ul className="px-6">
                            {friendsDetailInfo.map((friend, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between py-2 border-b border-gray-700"
                                >
                                    <div className="flex items-center space-x-3">
                                        {/* Friend's Image */}
                                        <div>
                                            <button 
                                                className="bg-transparent hover:bg-gray-600 text-white py-1 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 "
                                                tabIndex={-1}
                                                onClick={() => handleCreateSocketRoom(friend)}
                                            >
                                                <span className="block text-white">{friend.username}</span>
                                                <span className={`text-sm ${friend.status === 'Online' ? 'text-green-400' : 'text-gray-500'}`}>
                                                    {friend.status}
                                                </span>
                                            </button>
                                            
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Settings Option */}
                    <div className="p-6 border-t border-gray-700">
                        <button className="w-full flex items-center justify-center py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c1.656 0 3-1.344 3-3S13.656 2 12 2 9 3.344 9 5s1.344 3 3 3zm0 6c-1.797 0-3.339.763-4.444 1.954-.527.584-.932 1.254-1.167 1.954-.235.7-.389 1.429-.389 2.142h12c0-.713-.154-1.442-.389-2.142-.235-.7-.64-1.37-1.167-1.954C15.339 14.763 13.797 14 12 14zm-9 8h18v-2H3v2z"
                                />
                            </svg>
                            Settings
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
