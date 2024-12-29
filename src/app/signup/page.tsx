'use client';
import {useState, useEffect} from 'react';
import {signupService, checkUserExistsService} from '../../services/signupservices';
import VerificationModal from '../../components/VerificationModal';
import {useRouter} from 'next/navigation';

export default function SignUp() {
    const [formData, setFormData] = useState({
        name: '',
        userName: '',
        email: '',
        confirmEmail: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userVerified, setUserVerified] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
      console.log('userId has changed:', userId);
        if (userId) {
            // Open the modal only when userId is set
            setIsModalOpen(true);
        }
    },[userId])

    const validateForm = () => {
        const {name, userName, email, confirmEmail, password, confirmPassword} = formData;

        if (!name || !email || !confirmEmail || !password || !confirmPassword ||!userName) {
            return "All fields are required.";
        }

        if (email !== confirmEmail) {
            return "Email does not match."
        }

        if (password !== confirmPassword) {
            return "Password does not match."
        }

        return null;

    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name] : e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
        setErrors(validationError);
        return;
    }

    try {
          // Step 1: Check if username or email already exists
          const checkResult = await checkUserExistsService({
            username: formData.userName,
            email: formData.email,
        });

        // Step 2: Handle the result from checkUserExistsService
        if (checkResult.exists) {
            setErrors('Username or email already exists.');
            return;
        }
        console.log('API request started at:', new Date().toISOString());

        // Step 3: If everything is fine, proceed with the signup
        const signupResponse = await signupService({
            name: formData.name,
            username: formData.userName,
            email: formData.email,
            password: formData.password,
        });

        // Log successful submission
        
        localStorage.setItem('token', signupResponse.token);
        console.log('API request ended at:', new Date().toISOString());
        console.log('Form submitted successfully', signupResponse);

        // Set user Id 
        setUserId(signupResponse.user._id);
        setUserVerified(signupResponse.user.verified);
        // Open the verification modal after successful signup
        setIsModalOpen(true);

        
        // Step 6: Reset form on successful submission
        setFormData({
            name: '',
            userName: '',
            email: '',
            confirmEmail: '',
            password: '',
            confirmPassword: '',
        });
        setErrors(null); // Clear any errors

    } catch (error: unknown) {
        if (error instanceof Error) {
            setErrors(error.message || 'An error occurred while checking the username or signing up.');
        } else {
            setErrors('An unknown error occurred.');
        }
    }

    // Log the form data for debugging purposes
    console.log('Form submitted', formData);
    }

    const handleModalClose = () => {
      setIsModalOpen(false);
       // Redirect to dashboard with userId
       if (userId && userVerified) {
        router.push(`/dashboard?userId=${userId}`);
      }
    } 
  

    return (
        <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-50 shadow-lg rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>
        {errors && (
          <div className="mb-4 p-2 text-red-600 bg-red-100 rounded">
            {errors}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border p-2 mt-2 w-full rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">User Name</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className="border p-2 mt-2 w-full rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 mt-2 w-full rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Confirm Email</label>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
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
              value={formData.password}
              onChange={handleInputChange}
              className="border p-2 mt-2 w-full rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="border p-2 mt-2 w-full rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>
      </div>
      {userId && (
                <VerificationModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    userId={userId}
                />
      )}
    </div>
    )
}