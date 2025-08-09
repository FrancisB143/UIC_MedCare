import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';

interface AddMedicineModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onAddMedicine: (medicineData: MedicineFormData) => void;
    branchName?: string;
}

interface MedicineFormData {
    medicineName: string;
    category: string;
    dateReceived: string;
    expirationDate: string;
    quantity: number;
}

const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
    isOpen,
    setIsOpen,
    onAddMedicine,
    branchName
}) => {
    const [formData, setFormData] = useState<MedicineFormData>({
        medicineName: '',
        category: '',
        dateReceived: '',
        expirationDate: '',
        quantity: 0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get current date and time
    const getCurrentDateTime = () => {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const time = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        return { date, time };
    };

    const { date, time } = getCurrentDateTime();

    // Medicine categories
    const categories = [
        'Pain Relief',
        'Antibiotic',
        'Anti-inflammatory',
        'Antihistamine',
        'Antacid',
        'Cardioprotective',
        'Bronchodilator',
        'Diabetes',
        'Hypertension',
        'Antiseptic',
        'First Aid',
        'Rehydration',
        'Cough Relief',
        'Supplements',
        'Emergency',
        'Medical Device'
    ];

    const handleInputChange = (field: keyof MedicineFormData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
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

        if (!formData.medicineName.trim()) {
            newErrors.medicineName = 'Medicine name is required';
        }

        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.dateReceived) {
            newErrors.dateReceived = 'Date received is required';
        }

        if (!formData.expirationDate) {
            newErrors.expirationDate = 'Expiration date is required';
        } else if (new Date(formData.expirationDate) <= new Date(formData.dateReceived)) {
            newErrors.expirationDate = 'Expiration date must be after received date';
        }

        if (!formData.quantity || formData.quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            onAddMedicine(formData);
            // Reset form
            setFormData({
                medicineName: '',
                category: '',
                dateReceived: '',
                expirationDate: '',
                quantity: 0
            });
            setErrors({});
            setIsOpen(false);
        }
    };

    const handleClose = () => {
        setFormData({
            medicineName: '',
            category: '',
            dateReceived: '',
            expirationDate: '',
            quantity: 0
        });
        setErrors({});
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes scaleIn {
                    from {
                        transform: scale(0) rotate(12.5deg);
                    }
                    to {
                        transform: scale(1) rotate(0deg);
                    }
                }
            `}</style>
            
            <div className={`${isOpen ? 'block' : 'hidden'}`}>
                <div
                    onClick={handleClose}
                    className="bg-black/20 backdrop-blur-sm p-4 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
                >
                    <div
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="bg-white rounded-lg w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in"
                        style={{ maxHeight: '95vh' }}
                    >
                        {/* Background decoration */}
                        <Plus className="text-[#A3386C]/10 rotate-12 text-[200px] absolute z-0 -top-16 -right-16" />
                        
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#3D1528] to-[#A3386C] text-white p-6 relative">
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                
                                <div className="text-center">
                                    <h2 className="text-lg font-bold mb-1">{date}</h2>
                                    <p className="text-white/90 text-xs mb-4">{time}</p>
                                    <div className="w-20 h-0.5 bg-white/50 mx-auto"></div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 120px)' }}>
                                <p className="text-red-500 text-sm text-center mb-4 italic">
                                    Fill in all required details to save this medicine to the system.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Medicine Name */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">
                                            Medicine Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.medicineName}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('medicineName', e.target.value)}
                                            className={`w-full px-3 py-2 border-0 border-b-2 ${
                                                errors.medicineName ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'
                                            } bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                            placeholder="Enter medicine name"
                                        />
                                        {errors.medicineName && (
                                            <p className="text-red-500 text-sm mt-1">{errors.medicineName}</p>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('category', e.target.value)}
                                            className={`w-full px-3 py-2 border-0 border-b-2 ${
                                                errors.category ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'
                                            } bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && (
                                            <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                                        )}
                                    </div>

                                    {/* Date Received */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">
                                            Date Received
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={formData.dateReceived}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('dateReceived', e.target.value)}
                                                className={`w-full px-3 py-2 border-0 border-b-2 ${
                                                    errors.dateReceived ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'
                                                } bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                            />
                                            <Calendar className="absolute right-3 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors.dateReceived && (
                                            <p className="text-red-500 text-sm mt-1">{errors.dateReceived}</p>
                                        )}
                                    </div>

                                    {/* Expiration Date */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">
                                            Expiration Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={formData.expirationDate}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('expirationDate', e.target.value)}
                                                className={`w-full px-3 py-2 border-0 border-b-2 ${
                                                    errors.expirationDate ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'
                                                } bg-transparent focus:outline-none transition-colors text-black text-sm`}
                                            />
                                            <Calendar className="absolute right-3 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        </div>
                                        {errors.expirationDate && (
                                            <p className="text-red-500 text-sm mt-1">{errors.expirationDate}</p>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <label className="block text-gray-700 text-xs font-medium mb-1 uppercase tracking-wider">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.quantity || ''}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                            className={`w-full px-3 py-3 border-0 border-b-2 ${
                                                errors.quantity ? 'border-red-500' : 'border-gray-300 focus:border-[#A3386C]'
                                            } bg-transparent focus:outline-none transition-colors text-black`}
                                            placeholder="Enter quantity"
                                        />
                                        {errors.quantity && (
                                            <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-center pt-2">
                                        <button
                                            type="submit"
                                            className="bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg hover:scale-105 transform text-sm"
                                        >
                                            ADD MEDICINE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddMedicineModal;