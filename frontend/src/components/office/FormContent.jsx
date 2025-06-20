import React from 'react';

const FormContent = ({
    isModal,
    formData,
    semesters,
    errors,
    loading,
    handleInputChange,
    handleCancel,
    handleSubmit,
    inputClasses
}) => (
    <div className={`bg-white ${isModal ? '' : 'rounded-lg shadow-md'}`}>
        <div className={`${isModal ? 'mb-6' : 'px-6 py-4 border-b border-gray-200'}`}>
            <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
            <p className="text-gray-600 mt-1">Fill in the student information below</p>
        </div>

        <form onSubmit={handleSubmit} className={`${isModal ? '' : 'px-6 py-6'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Student Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={inputClasses('name')}
                        placeholder="Enter student's full name"
                        required
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* UUCMS Number */}
                <div>
                    <label htmlFor="uucmsNo" className="block text-sm font-medium text-gray-700 mb-2">
                        UUCMS Number *
                    </label>
                    <input
                        type="text"
                        id="uucmsNo"
                        name="uucmsNo"
                        value={formData.uucmsNo}
                        onChange={handleInputChange}
                        className={inputClasses('uucmsNo')}
                        placeholder="e.g., 21CS001"
                        required
                    />
                    {errors.uucmsNo && <p className="mt-1 text-sm text-red-600">{errors.uucmsNo}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClasses('email')}
                        placeholder="student@example.com"
                        required
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                {/* Semester */}
                <div>
                    <label htmlFor="semesterId" className="block text-sm font-medium text-gray-700 mb-2">
                        Semester *
                    </label>
                    <select
                        id="semesterId"
                        name="semesterId"
                        value={formData.semesterId}
                        onChange={handleInputChange}
                        className={inputClasses('semesterId')}
                        required
                    >
                        <option value="">Select Semester</option>
                        {semesters.map((semester) => (
                            <option key={semester._id} value={semester._id}>
                                Semester {semester.semesterNumber}
                            </option>
                        ))}
                    </select>
                    {errors.semesterId && <p className="mt-1 text-sm text-red-600">{errors.semesterId}</p>}
                </div>

                {/* Division */}
                <div>
                    <label htmlFor="division" className="block text-sm font-medium text-gray-700 mb-2">
                        Division *
                    </label>
                    <select
                        id="division"
                        name="division"
                        value={formData.division}
                        onChange={handleInputChange}
                        className={inputClasses('division')}
                        required
                    >
                        <option value="">Select Division</option>
                        <option value="A">Division A</option>
                        <option value="B">Division B</option>
                        <option value="C">Division C</option>
                        <option value="D">Division D</option>
                    </select>
                    {errors.division && <p className="mt-1 text-sm text-red-600">{errors.division}</p>}
                </div>
            </div>

            <div className={`flex items-center justify-end space-x-4 ${isModal ? 'mt-8' : 'mt-8 pt-6 border-t border-gray-200'}`}>
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {loading && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {loading ? 'Adding Student...' : 'Add Student'}
                </button>
            </div>
        </form>

        {!isModal && (
            <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Student Information</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>UUCMS number must be unique and alphanumeric</li>
                                <li>Email address must be valid and unique</li>
                                <li>Default password will be set to "student"</li>
                                <li>Student can change password after first login</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

export default FormContent;
