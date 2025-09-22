import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface RemovalReasonModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // new: pass selected stock_in id and its dates when submitting
    onSubmit: (description: string, medicineStockInId?: number | null, dateReceived?: string | null, expirationDate?: string | null) => void;
    currentStock?: number;
    medicineName?: string;
    medicineCategory?: string;
    // list of available batches (from medicine_stock_in) to choose from
    batchOptions?: Array<{
        medicine_stock_in_id: number;
        date_received?: string | null;
        expiration_date?: string | null;
        quantity?: number | null;
    }>;
}

type BatchOption = {
    medicine_stock_in_id: number;
    date_received?: string | null;
    expiration_date?: string | null;
    quantity?: number | null;
};

const RemovalReasonModal: React.FC<RemovalReasonModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock = 0,
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category',
    batchOptions
}) => {
    
    const [description, setDescription] = useState('');
    const [selectedStockInId, setSelectedStockInId] = useState<number | null>(null);
    const [dateReceived, setDateReceived] = useState<string | null>(null);
    const [expirationDate, setExpirationDate] = useState<string | null>(null);

    // Clear the form when the modal opens
    useEffect(() => {
        if (isOpen) {
            setDescription('');
            // reset selected batch when opening
            setSelectedStockInId(null);
            setDateReceived(null);
            setExpirationDate(null);
        }
    }, [isOpen]);

    // ensure we have a typed array to map over
    const batches: BatchOption[] = batchOptions || [];

    const handleSubmit = () => {
        // Validate description length and content
        if (!description.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Description Required',
                text: 'Please provide a description for why this stock is being archived.',
                confirmButtonText: 'OK'
            });
            return;
        }
        
        onSubmit(description.trim(), selectedStockInId, dateReceived, expirationDate);
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
                            
                            <h3 className="text-lg font-semibold text-[#A3386C] mt-2">
                                REASON FOR ARCHIVING
                            </h3>

                            <p className="text-sm text-gray-500 mb-4">
                                Fill in the required details for archiving this stock
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
                            </div>

                            {/* Batch selector and expiration shown together in one column */}
                            <div className="mb-4 grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-1">Date Received</label>
                                    {batches && batches.length > 0 ? (
                                        <select
                                            value={selectedStockInId ?? ''}
                                            onChange={(e) => {
                                                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                                                setSelectedStockInId(val);
                                                const batch = batches.find((b: BatchOption) => b.medicine_stock_in_id === val) as BatchOption | undefined;
                                                if (batch) {
                                                    setDateReceived(batch.date_received || null);
                                                    setExpirationDate(batch.expiration_date || null);
                                                } else {
                                                    setDateReceived(null);
                                                    setExpirationDate(null);
                                                }
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md text-black"
                                        >
                                            <option value="">-- Select batch (Date Received) --</option>
                                            {batches.map((b: BatchOption) => (
                                                <option key={b.medicine_stock_in_id} value={b.medicine_stock_in_id}>{b.date_received || 'Unknown Date'} — {b.quantity ?? 0} units</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="date"
                                            value={dateReceived ?? ''}
                                            onChange={(e) => {
                                                const v = e.target.value || null;
                                                setDateReceived(v);
                                                // if there are batches available, try to auto-find expiration based on the selected date
                                                const match = batches.find((b: BatchOption) => b.date_received === v);
                                                if (match) {
                                                    setSelectedStockInId(match.medicine_stock_in_id);
                                                    setExpirationDate(match.expiration_date || null);
                                                } else {
                                                    setSelectedStockInId(null);
                                                    setExpirationDate(null);
                                                }
                                            }}
                                            className="w-full p-2 border border-gray-300 rounded-md text-black"
                                        />
                                    )}

                                    <div className="mt-3">
                                        <label className="block text-sm font-semibold text-black mb-1">Expiration Date</label>
                                        {batches && batches.length > 0 ? (
                                            <select
                                                value={expirationDate ?? ''}
                                                onChange={(e) => setExpirationDate(e.target.value || null)}
                                                className="w-full p-2 border border-gray-300 rounded-md text-black"
                                            >
                                                <option value="">-- Select expiration date --</option>
                                                {batches
                                                    .filter((b: BatchOption) => !dateReceived || b.date_received === dateReceived)
                                                    .map((b: BatchOption) => (
                                                        <option key={`${b.medicine_stock_in_id}-${b.expiration_date}`} value={b.expiration_date || ''}>{b.expiration_date || 'Unknown'}</option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <input
                                                type="date"
                                                value={expirationDate ?? ''}
                                                onChange={(e) => setExpirationDate(e.target.value || null)}
                                                className="w-full p-2 border border-gray-300 rounded-md text-black"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Description Textarea */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                                    Detailed Description for Archiving:
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Provide reason for archiving (e.g., expired, damaged, recall)"
                                    className="w-full h-28 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent resize-none text-gray-700"
                                />
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
                                    ARCHIVE
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