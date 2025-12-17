import { submitApplication } from '@/app/actions/submit-application';

export default function ApplyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Partner Application
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our European marketplace network.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form action={submitApplication} className="space-y-6">

                        {/* Company Info */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
                            <div className="mt-1">
                                <input id="companyName" name="companyName" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        {/* EU Specifics */}
                        <div>
                            <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">VAT Number</label>
                            <div className="mt-1">
                                <input id="vatNumber" name="vatNumber" type="text" placeholder="FR123456789" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                            <select id="country" name="country" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option value="FR">France</option>
                                <option value="DE">Germany</option>
                                <option value="IT">Italy</option>
                                <option value="ES">Spain</option>
                                <option value="NL">Netherlands</option>
                                <option value="PL">Poland</option>
                            </select>
                        </div>

                        {/* Warehouse Address */}
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Main Warehouse Location</h3>
                            <div className="grid grid-cols-1 gap-y-4">
                                <div>
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input id="street" name="street" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input id="city" name="city" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP / Postcode</label>
                                        <input id="zip" name="zip" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
