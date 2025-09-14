import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface RemovalReasonModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSubmit: (description: string) => void;
    currentStock?: number;
    medicineName?: string;
    medicineCategory?: string;
}

const RemovalReasonModal: React.FC<RemovalReasonModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock = 0,
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category'
}) => {
    
    const [description, setDescription] = useState('');

    // Clear the form when the modal opens
    useEffect(() => {
        if (isOpen) {
            setDescription('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        // Validate description length and content
        if (!description.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Description Required',
                text: 'Please provide a detailed description for the removal.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (description.trim().length < 10) {
            Swal.fire({
                icon: 'warning',
                title: 'Description Too Short',
                text: 'Please provide a more detailed description (at least 10 characters).',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        onSubmit(description.trim());
        setIsOpen(false); // Close modal on successful submission
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* Styles for animations, same as the provided LogoutModal */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0px); opacity: 1; }
                }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                {/* Backdrop */}
                <div
                    onClick={handleClose}
                    className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    {/* Modal Content */}
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            
                            <h2 className="text-2xl font-bold text-red-600 mb-2">
                                CAUTION!
                            </h2>
                            
                            <h3 className="text-lg font-semibold text-[#A3386C] mt-4">
                                REASON FOR REMOVAL
                            </h3>

                            <p className="text-sm text-gray-500 mb-4">
                                Fill in the required details
                            </p>

                            {/* Medicine Information */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">Medicine: </span>
                                    <span className="text-gray-900">{medicineName}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="font-semibold text-gray-700">Category: </span>
                                    <span className="text-gray-900">{medicineCategory}</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Current Stock: </span>
                                    <span className="text-green-600 font-bold">{currentStock} units</span>
                                </div>
                                <div className="mt-2 text-sm text-red-600 font-medium">
                                    ⚠️ This will remove the entire stock
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                                    Detailed Description for Removal:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide detailed reason (e.g., expired on [date], damaged during transport, manufacturer recall notice #[number], contamination detected)"
                                    className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent resize-none text-gray-700"
                                />
                                <div className="mt-1 text-xs text-gray-500">
                                    Minimum 10 characters required. This will be stored in the medicine_deleted table.
                                </div>
                            </div>
                            
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    SUBMIT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RemovalReasonModal;