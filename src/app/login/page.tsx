'use client';

import { useState } from 'react';
import {loginAuthService} from '@/services/loginservices';
import {useRouter} from 'next/navigation';
import {encodeId} from '@/utils/encodeDecodeUtils'


interface UserInfo {
    username: string | null;
    password: string | null;
}

export default function Login() {
    const [formData, setFormData] = useState<UserInfo>({
        username: null,
        password: null,
    });

    const [errors, setErrors] = useState<string | null>(null);
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            setErrors('Both username and password are required.');
            return;
        }
        try {
            // Perform login logic here
            const responseData = await loginAuthService({
                username: formData.username,
                password: formData.password
            })
            const url = responseData.encryptedId;
            const encryptedUserId = encodeId(url);
            localStorage.setItem('token', responseData.token);
            
            if(responseData.token && responseData.user.verified) {
                router.push(`/dashboard?id=${encryptedUserId}`);
            } else {
                setErrors("Need Email Verification");
                return;
            }

            setFormData({
                username: '',
                password: ''
            })
            setErrors(null); // Clear any errors if validation passes

        } catch(error) {
            if (error instanceof Error) {
                setErrors(error.message);
              } else {
                  setErrors('An unknown error occurred.');
              }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md bg-slate-50 shadow-lg rounded-lg p-6">
                <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username || ''}
                            onChange={handleInputChange}
                            className="border p-2 mt-2 w-full rounded"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password || ''}
                            onChange={handleInputChange}
                            className="border p-2 mt-2 w-full rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
                    >
                        Login
                    </button>
                    {errors && (
                    <div className="mt-4 mb-4 p-2 flex justify-center text-red-600 bg-red-100 rounded">
                        {errors}
                    </div>
                    )}

                    <div className="flex justify-center mt-4">
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                            Forgot your password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
