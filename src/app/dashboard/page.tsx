"use client"

import { useEffect, useState, useRef} from 'react';
import { useRouter } from 'next/navigation';
import Sidenav from '@/components/SideNavbar';
import AddFriend from '@/components/AddFriend';
import BlockFriend from '@/components/BlockFriend';
import Unfriend from '@/components/Unfriend';
import ViewFriend from '@/components/ViewFriend';


import { 
    listenFriendRequestService, 
    removeFriendRequestListeners,
    listenDeleteFriendRequestService,
    removeDeleteFriendRequestListeners,
    listenAcceptedFriendRequestService,
    removeAcceptedFriendRequestListeners,
    emitRegisterUserIdToSocketId,
    removeRegisterUserIdFromSocketId,
    listenMessageRequestListener,
    removeMessageRequestListener,
    emitSendMessage,
    listenReceivedMessageListener,
    removeReceivedMessageListener
} from '@/app/socket';
import {
    createMessageService,
    getMessageBetweenUserIdsService
} from '@/services/messageservices';
import {
    userInfoService, 
    viewFriendRequests,
    searchUserById
} from '@/services/dashboardservices';
import {decodeId} from '@/utils/encodeDecodeUtils';

import {RoomChat} from '@/model/RoomChat';
import {FriendRequest, Friends, UserInfo} from '@/model/Friends';



export default function Dashboard() {
    const router = useRouter();
    // const [userId, setUserId] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [friendsInfo, setFriendsInfo] = useState<Friends[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [initialMessage, setInitialMessage] = useState<string>('');
    const [message, setMessage] = useState<string>(''); // State for input message
    const [messages, setMessages] = useState<{ roomId: string, message: string, senderUsername?:string }[]>([]);
    const [messageHistory, setMessageHistory] = useState({});

    const [tooltip, setTooltip] = useState<string | null>(null);
    const [activeComponent, setActiveComponent] = useState<string | null>(null);
    const [friendRequests, setFriendRequests] = useState<Friends[]>([]);
    const [updatedFriendRequests, setUpdatedFriendRequests] = useState<Friends[]>([]);
    const [deletedFriendRequests, setDeletedFriendRequests] = useState<Friends[]>([]);
    const [roomChatResults, setRoomChatResults] = useState<RoomChat | null>(null);
    


    const hasFetchedRef = useRef(false);
    const hasListenedRoomChat = useRef(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const searchParams = new URLSearchParams(window.location.search);
        const userId = searchParams.get('id') ?? '';
        const decodedUserId = decodeId(userId);

        if (!token) {
            router.push('/login');
            return;
        } else if (!decodedUserId) {
            setError('User ID not found in the URL.');
            setLoading(false);
            return;
        }
    
        if (decodedUserId && !hasFetchedRef.current) {
            fetchUserInfo(decodedUserId);
            fetchFriends(decodedUserId);
            emitRegisterUserIdToSocketId(decodedUserId);
            // setUserId(decodedUserId);
            hasFetchedRef.current = true;
        }
        return () => {
            removeRegisterUserIdFromSocketId();
        }
    },[]);

    // Listener for roomChat
    useEffect(() => {
        const handleRoomChat = async (data:RoomChat) => {
            console.log("RoomChat is created", data);
            if(data) {
                const senderId = userInfo?._id || '';
                const receiverId = data.friendId;
                const messageHistory = await fetchMessages(senderId, receiverId)
                setMessages([]);
                setRoomChatResults(data);
                setMessageHistory(messageHistory);
                hasListenedRoomChat.current = true;
            }
        };
        listenMessageRequestListener(handleRoomChat)
        return () => {
            removeMessageRequestListener();
        }
    }, [userInfo])

    useEffect(() => {
        console.log('data arrays', messageHistory?.data)
        console.log('message history: ', messageHistory);
    },[messageHistory])

    // Listener for incoming messages
    useEffect(() => {
        const handleReceivedMessage = (data: { roomId: string; message: string; senderUsername:string }) => {
            if (data && data.roomId === roomChatResults?.roomId && data.senderUsername !== userInfo?.username) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { roomId: data.roomId, message: data.message }, 
                ]);
            }
        };
    
        listenReceivedMessageListener(handleReceivedMessage);
        return () => {
            removeReceivedMessageListener();
        };
    }, [roomChatResults]); 
    

   // Listener for incoming friend requests
    useEffect(() => {
        const handleFriendRequest = (data: FriendRequest) => {
            console.log("Friend request received:", data.data);
            setFriendRequests((prevRequests) => [...prevRequests, data.data]);
        };
        listenFriendRequestService(handleFriendRequest);
        return () => {
            removeFriendRequestListeners(); 
        };
    }, []);

    //Listener for updated friend requests
    useEffect(() => {
        const handleFriendRequest = (data: FriendRequest) => {
            console.log("updated friend request received:", data.data);
            setUpdatedFriendRequests((prevRequests) => [...prevRequests, data.data]);
        };
        listenAcceptedFriendRequestService(handleFriendRequest);
        return () => {
            removeAcceptedFriendRequestListeners();
        }
    }, []);

    // Listener for deleted friend requests
    useEffect(() => {
        const handleTestListen = (data: FriendRequest) => {
            console.log('Deleted Friend request received:', data.data);

            setDeletedFriendRequests((prevRequests) => [...prevRequests, data.data]);
        }
        listenDeleteFriendRequestService(handleTestListen);
        return () => {
            removeDeleteFriendRequestListeners();
        }
    },[]);

   // Set Title Message for chatroom
    useEffect(() => {
        const fetchAndSetMessage = async () => {
            if(roomChatResults && userInfo && friendsInfo.length > 0) {
                const friendObj = friendsInfo.find(friend => friend.friendDetails?._id === roomChatResults.friendId || friend.userDetails?._id === roomChatResults.friendId)
                const friendUsername = friendObj 
                ? (friendObj.friendDetails?._id === roomChatResults.friendId
                    ? friendObj.friendDetails?.username
                    : friendObj.userDetails?.username)
                : null;
                console.log(friendObj, 'friendUsername sir');
                setInitialMessage(`${userInfo.username} can chat with ${friendUsername}`);
                
            }
        }
        fetchAndSetMessage();    
    },[roomChatResults, userInfo, friendsInfo])

    // Function to fetch user info
    const fetchUserInfo = async (JWTUserToken: string) => {
        try {
            const userData = await userInfoService(JWTUserToken);
            setUserInfo(userData);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch messages between users
    const fetchMessages = async (userId1:string, userId2:string) => {
        try {
            const messages = await getMessageBetweenUserIdsService(userId1, userId2);
            return messages
        } catch(err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    }
    

    // Function to fetch friends requests
    const fetchFriends = async (userId:string) => {
        try {
            const friendsData = await viewFriendRequests(userId);
            const updatedFriendsData = await Promise.all(friendsData.data.map(async (friend:Friends) => {
                const userId = friend.userId;
                const friendId = friend.friendId;
                const userDetails = await searchUserById(userId);
                const friendDetails = await searchUserById(friendId);
                return {...friend, friendDetails, userDetails};
            }))
            console.log('Friends Info',friendsData);
            console.log('Updated friends Info', updatedFriendsData);
            setFriendsInfo(updatedFriendsData);
        } catch(err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    }

    // Function to create new message object requests
    const postNewMessage = async (sender:string, receiver:string, message:string) => {
        try {
            const messagePayload = {sender:sender, receiver:receiver, message:message};
            const createMessage = await createMessageService(messagePayload);
            console.log('Message Object is created: ',createMessage);
        } catch(err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        }
    }

    // Function to handle sending the message
    const handleSendMessage = async () => {
        if (message.trim() !== '') {
            const roomId = roomChatResults?.roomId || 'defaultRoomId'; // Provide a fallback value
            const msg = message;
            const senderUsername = userInfo?.username;
            const senderUserId =  userInfo?._id;
            const receiverUserId = roomChatResults?.friendId;
            if (roomId && senderUsername && senderUserId && receiverUserId) {
                console.log('FriendsInfo: ',friendsInfo)
                emitSendMessage(roomId, msg, senderUsername);
                postNewMessage(senderUserId, receiverUserId, msg)
                setMessages([
                    ...messages,
                    { roomId: roomChatResults?.roomId || 'User', message: msg, senderUsername:senderUsername }, 
                ]);
                // Clear the input field
                setMessage('');
            } else {
                console.error('Room ID is missing.');
            }
        }
    };

    const handleMouseEnter = (message: string) => {
        setTooltip(message);
    };

    const handleMouseLeave = () => {
        setTooltip(null);
    };

    const openModal = (type: string) => {
        console.log(`Opening modal: ${type}`);
        setActiveComponent(type); 
    };

    const closeComponent = () => {
        setActiveComponent(null); 
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="flex min-h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidenav userInfo={userInfo} friendsInfo={friendsInfo}/>

            {/* Main chat area */}
            <main className="flex-1 p-6 overflow-hidden">
                <div className="h-full flex flex-col">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold mb-2">Welcome, {userInfo?.username}!</h1>
                        
                        <ul className="flex space-x-2 mb-2">
                            <li 
                                className="relative transition-transform transform hover:-translate-y-2"
                                onMouseEnter={() => handleMouseEnter('Add friends')}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => openModal('addFriend')}
                            >
                                <img src="/add-to-queue-svgrepo-com.svg" alt="Add friends" className="w-8 h-8 inline-block cursor-pointer" />
                                {tooltip === 'Add friends' && (
                                    <div className="absolute bottom-full mb-1 bg-gray-700 text-white text-xs p-1 rounded">
                                        Add friends
                                    </div>
                                )}
                            </li>
                            <li 
                                className="relative transition-transform transform hover:-translate-y-2"
                                onMouseEnter={() => handleMouseEnter('Unfriend')}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => openModal('unfriend')}
                            >
                                <img src="/add-minus-square-svgrepo-com.svg" alt="Unfriend" className="w-8 h-8 inline-block cursor-pointer" />
                                {tooltip === 'unfriend' && (
                                    <div className="absolute bottom-full mb-1 bg-gray-700 text-white text-xs p-1 rounded">
                                        Unfriend
                                    </div>
                                )}
                            </li>
                            <li 
                                className="relative transition-transform transform hover:-translate-y-2"
                                onMouseEnter={() => handleMouseEnter('Block')}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => openModal('blockFriend')}
                            >
                                <img src="/stop-sign-svgrepo-com.svg" alt="Block" className="w-8 h-8 inline-block cursor-pointer" />
                                {tooltip === 'Block' && (
                                    <div className="absolute bottom-full mb-1 bg-gray-700 text-white text-xs p-1 rounded">
                                        Block
                                    </div>
                                )}
                            </li>
                            <li 
                                className="relative transition-transform transform hover:-translate-y-2"
                                onMouseEnter={() => handleMouseEnter('View')}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => openModal('viewFriend')}
                            >
                                <img src="/search-svgrepo-com.svg" alt="View" className="w-8 h-8 inline-block cursor-pointer" />
                                {tooltip === 'View' && (
                                    <div className="absolute bottom-full mb-1 bg-gray-700 text-white text-xs p-1 rounded">
                                        View
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                    
                    {roomChatResults?.roomVerified ? (
                        <>
                            <div className="bg-gray-100 flex-1 p-4 rounded-lg shadow-md flex flex-col justify-between overflow-auto">
                                {/* Show message state if it contains a real value */}
                                {initialMessage && (
                                    <div className="p-2 mb-2 bg-yellow-200 text-gray-800 rounded-lg">
                                        {initialMessage}
                                    </div>
                                )}
                                
                                {/* Chat messages (message history + new messages) */}
                                <div className="mb-4 flex-grow overflow-y-auto">
                                    {messageHistory?.data?.length > 0 || messages.length > 0 ? (
                                        [...(messageHistory?.data || []), ...messages].map((msg, index) => {
                                            const isSender = msg.sender === userInfo?._id || msg.senderUsername === userInfo?.username; // Match sender by ID or username
                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex ${isSender ? 'justify-end' : 'justify-start'} items-start mb-2`}
                                                >
                                                    <div
                                                        className={`p-2 rounded-lg max-w-xs ${
                                                            isSender ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                                        }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-gray-400">No messages yet. Start the conversation!</p>
                                    )}
                                </div>

                                {/* Message input box */}
                                <div className="flex items-center mt-4">
                                    <input
                                        type="text"
                                        className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        placeholder="Type your message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Send message on Enter key press
                                    />
                                    <button
                                        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                                        onClick={handleSendMessage}
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-gray-400">Room Chat information is not available</p>
                    )}

                    
                    

                {activeComponent === 'addFriend' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> {/* Dark overlay */}
                        <AddFriend onClose={closeComponent} />
                    </div>
                )}
                {activeComponent === 'blockFriend' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> {/* Dark overlay */}
                        <BlockFriend onClose={closeComponent} />
                    </div>
                )}
                {activeComponent === 'unfriend' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> {/* Dark overlay */}
                        <Unfriend onClose={closeComponent} />
                    </div>
                )}
                {activeComponent === 'viewFriend' && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> {/* Dark overlay */}
                        <ViewFriend onClose={closeComponent}  newFriendRequests={friendRequests} deletedFriendRequests={deletedFriendRequests} updatedFriendRequests={updatedFriendRequests}/>
                    </div>                    
                )}

                </div>
            </main>
        </div>
    );
}
