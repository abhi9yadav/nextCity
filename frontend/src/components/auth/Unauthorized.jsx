import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
                Sorry, you do not have the necessary permissions to access this page.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={goBack}
                    className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    Go Back
                </button>
                <Link
                    to="/"
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
