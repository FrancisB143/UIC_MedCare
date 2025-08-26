import React, { useState, useEffect } from 'react';

interface ReorderMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // The onSubmit signature is updated to include the new expiration date
    onSubmit: (formData: { dateReceived: string; expirationDate: string; quantity: number }) => void;
    medicineName: string;
    category: string;
    // This is now the initial expiration date
    expirationDate: string;
}

const ReorderMedicineModal: React.FC<ReorderMedicineModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    medicineName, 
    category, 
    expirationDate 
}) => {
    
    const [dateReceived, setDateReceived] = useState('');
    const [newExpirationDate, setNewExpirationDate] = useState(''); // State for the editable expiration date
    const [quantity, setQuantity] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Pre-fill dates when the modal opens
            setDateReceived(new Date().toISOString().split('T')[0]);
            setNewExpirationDate(expirationDate); // Set initial expiration date from props
            setQuantity('');
        }
    }, [isOpen, expirationDate]);

    const handleSubmit = () => {
        const numQuantity = parseInt(quantity, 10);

        if (!dateReceived || !newExpirationDate) {
            alert('Please fill in all date fields.');
            return;
        }
        if (isNaN(numQuantity) || numQuantity <= 0) {
            alert('Please enter a valid positive number for the quantity.');
            return;
        }

        // Submit all three values
        onSubmit({ dateReceived, expirationDate: newExpirationDate, quantity: numQuantity });
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
                        className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
                    >
                        <div className="p-8 text-center">
                            <h2 className="text-2xl font-bold text-[#A3386C] mb-6">
                                REORDER MEDICINE
                            </h2>
                            
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="font-semibold text-gray-700">Medicine Name</label>
                                    <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500">
                                        {medicineName}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="font-semibold text-gray-700">Category</label>
                                    <div className="mt-1 p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-500">
                                        {category}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="dateReceived" className="font-semibold text-gray-700">Date Received</label>
                                    <input
                                        id="dateReceived"
                                        type="date"
                                        value="mm/dd/yyyy"
                                        onChange={(e) => setDateReceived(e.target.value)}
                                        className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                    />
                                </div>
                                
                                {/* Expiration Date is now an editable input */}
                                <div>
                                    <label htmlFor="expirationDate" className="font-semibold text-gray-700">Expiration Date</label>
                                    <input
                                        id="expirationDate"
                                        type="date"
                                        value="mm/dd/yyyy"
                                        onChange={(e) => setNewExpirationDate(e.target.value)}
                                        className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity</label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Enter quantity to add"
                                        min="1"
                                        className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-center items-center space-x-4 mt-8">
                                <button
                                    onClick={handleClose}
                                    className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
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

export default ReorderMedicineModal;