export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_auto_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to ChatApp</h1>
        <p className="text-lg mb-6">Connect with your friends and the world around you.</p>
      </div>
      <div className="flex space-x-4">
        <a
          href="/signup"
          className="bg-blue-600 text-white py-2 px-4 rounded shadow-md hover:bg-blue-500 transition duration-200"
        >
          Sign Up
        </a>
        <a
          href="/login"
          className="bg-gray-600 text-white py-2 px-4 rounded shadow-md hover:bg-gray-500 transition duration-200"
        >
          Log In
        </a>
      </div>
      <footer className="text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} ChatApp. All rights reserved.
      </footer>
    </div>
  );
}


