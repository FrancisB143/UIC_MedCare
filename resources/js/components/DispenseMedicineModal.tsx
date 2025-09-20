// src/components/DispenseMedicineModal.tsx

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface DispenseMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    // now submit the selected batch id and quantity
    onSubmit: (medicineStockInId: number, quantity: number) => void;
    currentStock: number;
    medicineName?: string;
    medicineCategory?: string;
    batches?: Array<any>; // array of BranchInventoryItem-like objects with medicine_stock_in_id, expiration_date, quantity
}

const DispenseMedicineModal: React.FC<DispenseMedicineModalProps> = ({ 
    isOpen, 
    setIsOpen, 
    onSubmit, 
    currentStock, 
    medicineName = 'Unknown Medicine',
    medicineCategory = 'No Category',
    batches = []
}) => {
    
    const [quantity, setQuantity] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
    const [selectedDateReceived, setSelectedDateReceived] = useState<string>('');
    const [filteredBatches, setFilteredBatches] = useState<Array<any>>(batches || []);

    const NO_DATE = '__NO_DATE__';
    const normalizeDate = (d: any) => {
        if (!d) return NO_DATE;
        try {
            return new Date(d).toISOString().slice(0, 10);
        } catch (e) {
            return NO_DATE;
        }
    };

    // Keep selectedDateReceived in sync when selectedBatch changes
    useEffect(() => {
        if (selectedBatch) {
            const found = (batches || []).find((b: any) => b.medicine_stock_in_id === selectedBatch) || (filteredBatches || []).find((b: any) => b.medicine_stock_in_id === selectedBatch);
            if (found) {
                setSelectedDateReceived(found.date_received || '');
            }
        } else {
            // no batch selected -> clear the date selection
            setSelectedDateReceived('');
        }
    }, [selectedBatch, batches, filteredBatches]);

    useEffect(() => {
        if (isOpen) {
            // Default to All Dates (no batch selected)
            setSelectedBatch(null);
            setSelectedDateReceived('');
            setFilteredBatches(batches || []);
        }
    }, [isOpen, batches]);

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const numQuantity = parseInt(quantity, 10);

        if (isNaN(numQuantity) || numQuantity <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Please enter a valid positive number for the quantity.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // if a batch is selected, enforce max <= selected batch quantity; otherwise enforce <= total currentStock
        let maxAllowed = currentStock;
        if (selectedBatch) {
            const batch = batches.find((b: any) => b.medicine_stock_in_id === selectedBatch);
            if (batch) maxAllowed = batch.quantity || maxAllowed;
        }

        if (numQuantity > maxAllowed) {
            Swal.fire({
                icon: 'error',
                title: 'Quantity Exceeds Stock',
                text: `Quantity cannot exceed the current stock of ${maxAllowed}.`,
                confirmButtonText: 'OK'
            });
            return;
        }
        if (!selectedBatch) {
            Swal.fire({ icon: 'error', title: 'No Batch Selected', text: 'Please select a batch to dispense from.', confirmButtonText: 'OK' });
            return;
        }

        onSubmit(selectedBatch, numQuantity);
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
                                Select Date Received, Expiration Date, and Quantity to dispense:
                            </p>

                                {batches && batches.length > 0 && (
                                    <>
                                        <div className="mb-3 text-left">
                                            <label className="block text-xs text-gray-600 mb-1">Date Received</label>
                                            <select
                                                value={selectedDateReceived ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value || '';
                                                    setSelectedDateReceived(val);
                                                    // Filter batches with matching date_received
                                                    if (val) {
                                                        const matched = batches.filter((b: any) => b.date_received === val);
                                                        // sort by nearest expiration date asc
                                                        matched.sort((a: any, b: any) => {
                                                            if (!a.expiration_date) return 1;
                                                            if (!b.expiration_date) return -1;
                                                            return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
                                                        });
                                                        setFilteredBatches(matched);
                                                        setSelectedBatch(matched.length > 0 ? matched[0].medicine_stock_in_id : null);
                                                    } else {
                                                        // All Dates selected: reset filtered list but do NOT auto-pick a batch
                                                        setFilteredBatches(batches);
                                                        setSelectedBatch(null);
                                                    }
                                                }}
                                                className="w-full p-2 border rounded text-sm text-gray-700"
                                            >
                                                <option value="">-- All Dates --</option>
                                                {Array.from(new Set(batches.map((b: any) => b.date_received))).map((d: any) => (
                                                    <option key={d || 'no-date'} value={d}>{d ? new Date(d).toLocaleDateString() : 'No Date'}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3 text-left">
                                            <label className="block text-xs text-gray-600 mb-1">Select batch (by expiration)</label>
                                            <select
                                                value={selectedBatch ?? ''}
                                                onChange={(e) => {
                                                    const id = Number(e.target.value);
                                                    setSelectedBatch(id);
                                                    const batch = (filteredBatches || batches).find((b: any) => b.medicine_stock_in_id === id);
                                                    setSelectedDateReceived(batch ? batch.date_received || '' : '');
                                                }}
                                                className="w-full p-2 border rounded text-sm text-gray-700"
                                            >
                                                {filteredBatches.map((b: any) => (
                                                    <option key={b.medicine_stock_in_id} value={b.medicine_stock_in_id}>
                                                        {b.expiration_date ? new Date(b.expiration_date).toLocaleDateString() : 'No Expiry'} — {b.quantity || 0} units
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

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