import React, { useState, useEffect } from 'react';

interface RemovalReasonModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSubmit: (reason: string) => void;
}

const RemovalReasonModal: React.FC<RemovalReasonModalProps> = ({ isOpen, setIsOpen, onSubmit }) => {
    
    const [reason, setReason] = useState('');

    // Clear the reason text when the modal opens
    useEffect(() => {
        if (isOpen) {
            setReason('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        // Basic validation to ensure a reason is provided
        if (reason.trim()) {
            onSubmit(reason);
            setIsOpen(false); // Close modal on successful submission
        } else {
            // In a real app, you might show a more subtle error message
            alert('Please provide a reason for removal.');
        }
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

                            <p className="text-sm text-gray-500 mb-6">
                                Fill in the required details
                            </p>

                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="State the reason"
                                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent resize-none text-gray-700"
                            />
                            
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