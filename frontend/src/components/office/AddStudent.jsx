import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import officeService from '../../services/officeService';
import FormContent from './FormContent'; // You can also keep it in same file if you prefer

const AddStudent = ({ onSuccess, onCancel, isModal = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [semesters, setSemesters] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        uucmsNo: '',
        email: '',
        semesterId: '',
        division: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            const response = await officeService.getSemesters();
            setSemesters(response.semesters || []);
        } catch (error) {
            console.error('Error fetching semesters:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const validation = officeService.validateStudentData(formData);
        setErrors(validation.errors);
        return validation.isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await officeService.addStudent(formData);

            if (onSuccess) {
                onSuccess(response.student);
            } else {
                navigate('/office/students', {
                    state: { message: 'Student added successfully!' }
                });
            }
        } catch (error) {
            if (error.message.includes('already exists')) {
                setErrors({
                    uucmsNo: 'Student with this UUCMS number already exists',
                    email: 'Student with this email already exists'
                });
            } else {
                alert(error.message || 'Failed to add student');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/office/students');
        }
    };

    const inputClasses = (field) => `
        w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${errors[field] ? 'border-red-500' : 'border-gray-300'}
    `;

    return isModal ? (
        <FormContent
            isModal={isModal}
            formData={formData}
            semesters={semesters}
            errors={errors}
            loading={loading}
            handleInputChange={handleInputChange}
            handleCancel={handleCancel}
            handleSubmit={handleSubmit}
            inputClasses={inputClasses}
        />
    ) : (
        <div className="max-w-4xl mx-auto">
            <FormContent
                isModal={isModal}
                formData={formData}
                semesters={semesters}
                errors={errors}
                loading={loading}
                handleInputChange={handleInputChange}
                handleCancel={handleCancel}
                handleSubmit={handleSubmit}
                inputClasses={inputClasses}
            />
        </div>
    );
};

export default AddStudent;
