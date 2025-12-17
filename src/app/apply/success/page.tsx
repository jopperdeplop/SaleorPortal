import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ApplicationSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-12 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Received</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for your interest in joining our platform. Our team will review your details (VAT validaton, warehouse location) and get back to you shortly via email.
                    </p>
                    <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                        Return to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
