import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

// Reusing the same MessageModal component for consistency
const MessageModal: React.FC<{ message: string | null, type: 'error' | 'success', onClose: () => void }> = ({ message, type, onClose }) => {
    if (!message) return null;
    
    const bgColor = type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700';
    const title = type === 'error' ? 'Error' : 'Success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-sm p-6 rounded-xl shadow-2xl border ${bgColor} transform transition-all duration-300 scale-100`}>
                <h3 className="text-lg font-bold mb-3">{title}</h3>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition duration-150 ${type === 'error' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Mock instruments data - you might want to fetch this from your API
const INSTRUMENTS = [
    { id: 1, name: 'Guitar', type: 'string' },
    { id: 2, name: 'Piano', type: 'keyboard' },
    { id: 3, name: 'Violin', type: 'string' },
    { id: 4, name: 'Drums', type: 'percussion' },
    { id: 5, name: 'Bass', type: 'string' },
    { id: 6, name: 'Saxophone', type: 'woodwind' },
];

const SKILL_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'professional', label: 'Professional' },
];

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    skillLevel: string;
    instruments: number[];
    tuningReference: string;
    preferredMetronomeTempo: number;
}

const SignUpForm: React.FC = () => {
    const { signup, isLoading } = useAuth();
    const [formData, setFormData] = useState<SignUpFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        skillLevel: '',
        instruments: [],
        tuningReference: 'A440',
        preferredMetronomeTempo: 120,
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (field: keyof SignUpFormData, value: string | number | number[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInstrumentToggle = (instrumentId: number) => {
        setFormData(prev => ({
            ...prev,
            instruments: prev.instruments.includes(instrumentId)
                ? prev.instruments.filter(id => id !== instrumentId)
                : [...prev.instruments, instrumentId]
        }));
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            setError('Please enter your name');
            return false;
        }

        if (!formData.email.trim()) {
            setError('Please enter your email address');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (!formData.skillLevel) {
            setError('Please select your skill level');
            return false;
        }

        if (formData.instruments.length === 0) {
            setError('Please select at least one instrument');
            return false;
        }

        if (formData.preferredMetronomeTempo < 40 || formData.preferredMetronomeTempo > 240) {
            setError('Metronome tempo must be between 40 and 240 BPM');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

        try {
            // Prepare the data for signup - matching your User model structure
            const signupData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                skill_level: formData.skillLevel,
                instruments: formData.instruments,
                settings: {
                    tuning_reference: formData.tuningReference,
                    preferred_metronome_tempo: formData.preferredMetronomeTempo,
                }
            };

            await signup(signupData);
            setSuccess('Account created successfully! Welcome to the app.');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                skillLevel: '',
                instruments: [],
                tuningReference: 'A440',
                preferredMetronomeTempo: 120,
            });

        } catch (err) {
            setError((err as Error).message || "Sign up failed. Please try again.");
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="Enter your full name"
                    />
                </div>

                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="Enter your email"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="At least 6 characters"
                    />
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        placeholder="Confirm your password"
                    />
                </div>

                {/* Skill Level Selection */}
                <div>
                    <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700">Skill Level</label>
                    <select
                        id="skillLevel"
                        required
                        value={formData.skillLevel}
                        onChange={(e) => handleInputChange('skillLevel', e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                    >
                        <option value="">Select your skill level</option>
                        {SKILL_LEVELS.map(level => (
                            <option key={level.value} value={level.value}>
                                {level.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Instruments Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instruments You Play</label>
                    <div className="grid grid-cols-2 gap-2">
                        {INSTRUMENTS.map(instrument => (
                            <label key={instrument.id} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition duration-150">
                                <input
                                    type="checkbox"
                                    checked={formData.instruments.includes(instrument.id)}
                                    onChange={() => handleInstrumentToggle(instrument.id)}
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{instrument.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* User Settings */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Tuning Reference */}
                    <div>
                        <label htmlFor="tuningReference" className="block text-sm font-medium text-gray-700">Tuning Reference</label>
                        <select
                            id="tuningReference"
                            value={formData.tuningReference}
                            onChange={(e) => handleInputChange('tuningReference', e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        >
                            <option value="A440">A440 Hz (Standard)</option>
                            <option value="A432">A432 Hz</option>
                            <option value="A439">A439 Hz</option>
                        </select>
                    </div>

                    {/* Preferred Metronome Tempo */}
                    <div>
                        <label htmlFor="metronomeTempo" className="block text-sm font-medium text-gray-700">
                            Preferred Tempo (BPM)
                        </label>
                        <input
                            id="metronomeTempo"
                            type="number"
                            min="40"
                            max="240"
                            value={formData.preferredMetronomeTempo}
                            onChange={(e) => handleInputChange('preferredMetronomeTempo', parseInt(e.target.value) || 120)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : 'Create Account'}
                </button>
            </form>

            {/* Error Message Modal */}
            <MessageModal 
                message={error} 
                type="error" 
                onClose={() => setError(null)} 
            />

            {/* Success Message Modal */}
            <MessageModal 
                message={success} 
                type="success" 
                onClose={() => setSuccess(null)} 
            />
        </>
    );
};

export default SignUpForm;