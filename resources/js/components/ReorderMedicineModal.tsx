import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react'; // Using an icon for the success view

// Interface for the form data, consistent with AddMedicineModal
interface ReorderFormData {
    dateReceived: string;
    expirationDate: string;
    quantity: number | ''; // Allow empty string for initial state
}

// Interface for the data submitted, which represents a new row
interface SubmittedMedicineData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

interface ReorderMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // The onSubmit signature is updated to pass the full data for a new row
    onSubmit: (formData: SubmittedMedicineData) => void;
    medicineName: string;
    category: string;
}

const ReorderMedicineModal: React.FC<ReorderMedicineModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    medicineName, 
    category 
}) => {
    
    const initialFormData: ReorderFormData = {
        dateReceived: new Date().toISOString().split('T')[0],
        expirationDate: '',
        quantity: ''
    };

    const [formData, setFormData] = useState<ReorderFormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [view, setView] = useState<'form' | 'success'>('form');

    // Effect to reset the form when the modal is opened
    useEffect(() => {
        if (isOpen) {
            // Pre-fill date received and reset other fields
            setFormData({
                ...initialFormData,
                dateReceived: new Date().toISOString().split('T')[0],
            });
            setErrors({});
            // Ensure the view is reset to the form
            setView('form'); 
        }
    }, [isOpen]);

    const handleInputChange = (field: keyof ReorderFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for the field being edited
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.dateReceived) {
            newErrors.dateReceived = 'Date received is required';
        }
        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Expiration date is required';
        } else if (new Date(formData.expirationDate) <= new Date(formData.dateReceived)) {
            newErrors.expirationDate = 'Expiration date must be after the received date';
        }
        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be a positive number';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            // Construct the full data object for the new row
            const submissionData: SubmittedMedicineData = {
                medicineName,
                category,
                dateReceived: formData.dateReceived,
                expirationDate: formData.expirationDate,
                quantity: Number(formData.quantity)
            };
            onSubmit(submissionData);
            setView('success'); // Switch to the success view
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // Success View Component
    const SuccessView = () => (
        <div className="p-8 text-center animate-fade-in">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-6">
                REORDER SUCCESSFUL!
            </h2>
            <div className="space-y-3 text-sm text-left bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">MEDICINE:</span>
                    <span className="font-medium text-gray-900">{medicineName}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">NEW EXPIRATION:</span>
                    <span className="font-medium text-gray-900">{formData.expirationDate}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">QUANTITY ADDED:</span>
                    <span className="font-bold text-red-500 text-base">{formData.quantity}</span>
                </div>
            </div>
            <div className="flex justify-center pt-8">
                <button
                    onClick={handleClose}
                    className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-8 rounded-lg transition-colors"
                >
                    CLOSE
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
                .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0px); opacity: 1; } }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                <div
                    onClick={handleClose}
                    className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        {view === 'form' ? (
                             <div className="p-8 text-center">
                                <h2 className="text-2xl font-bold text-[#A3386C] mb-6">REORDER MEDICINE</h2>
                                
                                <div className="space-y-4 text-left">
                                    {/* Medicine Name (Display Only) */}
                                    <div>
                                        <label className="font-semibold text-gray-700">Medicine Name</label>
                                        <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500">{medicineName}</div>
                                    </div>
                                    
                                    {/* Category (Display Only) */}
                                    <div>
                                        <label className="font-semibold text-gray-700">Category</label>
                                        <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500">{category}</div>
                                    </div>

                                    {/* Date Received */}
                                    <div>
                                        <label htmlFor="dateReceived" className="font-semibold text-gray-700">Date Received</label>
                                        <input
                                            id="dateReceived"
                                            type="date"
                                            value={formData.dateReceived}
                                            onChange={(e) => handleInputChange('dateReceived', e.target.value)}
                                            className={`w-full mt-1 p-3 border ${errors.dateReceived ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                                        />
                                        {errors.dateReceived && <p className="text-red-500 text-xs mt-1">{errors.dateReceived}</p>}
                                    </div>
                                    
                                    {/* Expiration Date */}
                                    <div>
                                        <label htmlFor="expirationDate" className="font-semibold text-gray-700">New Expiration Date</label>
                                        <input
                                            id="expirationDate"
                                            type="date"
                                            value={formData.expirationDate}
                                            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                                            className={`w-full mt-1 p-3 border ${errors.expirationDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                                        />
                                         {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
                                    </div>
                                    
                                    {/* Quantity */}
                                    <div>
                                        <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity to Add</label>
                                        <input
                                            id="quantity"
                                            type="number"
                                            value={formData.quantity}
                                            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || '')}
                                            placeholder="Enter quantity"
                                            min="1"
                                            className={`w-full mt-1 p-3 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                                        />
                                        {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                                    </div>
                                </div>
                                
                                <div className="flex justify-center items-center space-x-4 mt-8">
                                    <button onClick={handleClose} className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">CANCEL</button>
                                    <button onClick={handleSubmit} className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer">SUBMIT</button>
                                </div>
                            </div>
                        ) : (
                            <SuccessView />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReorderMedicineModal;