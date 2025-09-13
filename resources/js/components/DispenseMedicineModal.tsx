// src/components/DispenseMedicineModal.tsx

import React, { useState, useEffect } from 'react';

interface DispenseMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSubmit: (quantity: number) => void;
    currentStock: number;
    medicineName?: string;
    medicineCategory?: string;
}

const DispenseMedicineModal: React.FC<DispenseMedicineModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock, 
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category'
}) => {
    
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const numQuantity = parseInt(quantity, 10);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            alert('Please enter a valid positive number for the quantity.');
            return;
        }

        if (numQuantity > currentStock) {
            alert(`Quantity cannot exceed the current stock of ${currentStock}.`);
            return;
        }

        onSubmit(numQuantity);
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
    };

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
                        className="bg-white rounded-xl w-full max-w-sm shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            
                            <h2 className="text-2xl font-bold text-red-600 mb-4">
                                DISPENSE MEDICINE
                            </h2>
                            
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
                            </div>
                            
                            <p className="text-md text-gray-700 mb-3">
                                Enter quantity to dispense:
                            </p>

                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="e.g., 10"
                                min="1"
                                max={currentStock}
                                className="w-full text-center p-3 border-2 border-[#A3386C] rounded-lg focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-gray-700 text-lg"
                                autoFocus
                            />
                            
                            {/* Updated button container */}
                            <div className="flex justify-center items-center space-x-4 mt-6">
                                {/* Cancel Button Added */}
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-[#9D446F] hover:bg-[#833a5e] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DispenseMedicineModal;