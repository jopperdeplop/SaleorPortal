import { submitApplication } from '@/app/actions/submit-application';

const EU_COUNTRIES = [
    { code: 'AT', name: 'Austria' },
    { code: 'BE', name: 'Belgium' },
    { code: 'HR', name: 'Croatia' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'EE', name: 'Estonia' },
    { code: 'FI', name: 'Finland' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'GR', name: 'Greece' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IT', name: 'Italy' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'PT', name: 'Portugal' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'ES', name: 'Spain' },
];

export default function ApplyPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-display">
                    Partner Application
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join our European marketplace network.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form action={submitApplication} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Brand Info */}
                            <div>
                                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">Brand Name (Public)</label>
                                <input id="brandName" name="brandName" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. EcoStyles" />
                            </div>

                            <div>
                                <label htmlFor="legalBusinessName" className="block text-sm font-medium text-gray-700">Legal Business Name</label>
                                <input id="legalBusinessName" name="legalBusinessName" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g. EcoStyles SAS" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                                <input id="email" name="email" type="email" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input id="phoneNumber" name="phoneNumber" type="tel" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-6">
                            {/* EU Tax & Registration */}
                            <div>
                                <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">VAT Number</label>
                                <input id="vatNumber" name="vatNumber" type="text" placeholder="FR123456789" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration #</label>
                                <input id="registrationNumber" name="registrationNumber" type="text" placeholder="Chamber of Commerce ID" className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>

                            <div>
                                <label htmlFor="eoriNumber" className="block text-sm font-medium text-gray-700">EORI Number</label>
                                <input id="eoriNumber" name="eoriNumber" type="text" placeholder="FR123..." className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        {/* Warehouse / Location Info */}
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Pickup / Warehouse Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input id="street" name="street" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input id="city" name="city" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                        <input id="zip" name="zip" type="text" required className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                    <select id="country" name="country" required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="">Select a country</option>
                                        {EU_COUNTRIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label>
                                    <input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://..." className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="border-t pt-6">
                            <div className="flex items-start gap-3">
                                <input 
                                    type="checkbox" 
                                    id="acceptTerms" 
                                    name="acceptTerms" 
                                    required 
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                                    I have read and agree to the{' '}
                                    <a href="/terms" target="_blank" className="text-indigo-600 underline hover:text-indigo-800">
                                        Vendor Terms & Conditions
                                    </a>.
                                </label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                                Submit Partner Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
