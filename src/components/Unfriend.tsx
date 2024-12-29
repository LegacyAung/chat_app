"use client";

import { useState } from 'react';

interface UnfriendProps {
    onClose: () => void; // Callback to close the component
}

export default function Unfriend({ onClose }: UnfriendProps) {
    const [friendIdentifier, setFriendIdentifier] = useState<string>(''); // Stores input (username/email)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleUnfriend = async () => {
        if (!friendIdentifier.trim()) {
            setError('Please enter a valid username or email.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Simulate an API call (replace this with your real service logic)
            // Here you would call the service that adds a friend by username or email.
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay

            // If the friend is added successfully
            setSuccess('Friend request sent successfully!');
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
            <h2 className="text-xl font-bold mb-4">Unfriend</h2>

            <div className="mb-4">
                <input
                    type="text"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter username or email"
                    value={friendIdentifier}
                    onChange={(e) => setFriendIdentifier(e.target.value)}
                />
            </div>
            <div>{}</div>

            {error && <div className="text-red-500 mb-2">{error}</div>}
            {success && <div className="text-green-500 mb-2">{success}</div>}

            <div className="flex justify-between">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    onClick={handleUnfriend}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Unfriend'}
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



