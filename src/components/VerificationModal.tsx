'use client';
// components/VerificationModal.tsx
import React from 'react';


interface VerificationModalProps {
    userId: string | null; 
    isOpen: boolean;
    onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, userId }) => {
   
   

    if (!isOpen) return null;
    const handleClose = () => {
        onClose();
        // Redirect to dashboard with userId
       
    };
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-4">Verify Your Account</h2>
                <p>Please check your email for a verification link to activate your account.</p>
                <div className="mt-4">
                    <div>{userId}</div>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={handleClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
