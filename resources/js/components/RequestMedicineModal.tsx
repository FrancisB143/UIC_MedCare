
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { getMedicinesForBranch, Medicine } from '../data/branchMedicines';

interface RequestMedicineModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  branchId: number;
  onRequest: (data: { medicineId: number; expirationDate: string; quantity: number }) => void;
}

const RequestMedicineModal: React.FC<RequestMedicineModalProps> = ({
  isOpen,
  setIsOpen,
  branchId,
  onRequest,
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicineId, setSelectedMedicineId] = useState<number | null>(null);
  const [expirationDates, setExpirationDates] = useState<string[]>([]);
  const [selectedExpiration, setSelectedExpiration] = useState('');
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Only show medicines with stock > 50
      const meds = getMedicinesForBranch(branchId).filter(m => m.stock > 50);
      setMedicines(meds);
      setSelectedMedicineId(null);
      setExpirationDates([]);
      setSelectedExpiration('');
      setMaxQuantity(0);
      setQuantity('');
      setErrors({});
    }
  }, [isOpen, branchId]);

  useEffect(() => {
    if (selectedMedicineId !== null) {
  const med = medicines.find((m) => m.id === selectedMedicineId);
      if (med) {
        setExpirationDates([med.expiry]);
        setSelectedExpiration(med.expiry);
        setMaxQuantity(med.stock);
      } else {
        setExpirationDates([]);
        setSelectedExpiration('');
        setMaxQuantity(0);
      }
      setQuantity('');
    }
  }, [selectedMedicineId, medicines]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedMedicineId) newErrors.medicine = 'Select a medicine';
    if (!selectedExpiration) newErrors.expiration = 'Select expiration date';
    if (!quantity || quantity <= 0) newErrors.quantity = 'Enter a valid quantity';
    else if (typeof quantity === 'number' && quantity > maxQuantity) newErrors.quantity = 'Exceeds available stock';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onRequest({
      medicineId: selectedMedicineId!,
      expirationDate: selectedExpiration,
      quantity: Number(quantity),
    });
    setIsOpen(false);
    const med = medicines.find(m => m.id === selectedMedicineId);
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Medicine Successfully Requested!',
      html: `
        <div style="text-align:left;margin-top:1em;">
          <div><b>Medicine:</b> ${med ? med.name : ''}</div>
          <div><b>Expiration Date:</b> ${selectedExpiration}</div>
          <div><b>Quantity:</b> ${quantity}</div>
        </div>
      `,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleClose = () => setIsOpen(false);

  return (
    <div className={`${isOpen ? 'block' : 'hidden'}`}>
      <div
        onClick={handleClose}
        className="bg-black/30 backdrop-blur-sm fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer animate-fade-in"
      >
        <div
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-xl w-full max-w-md shadow-2xl cursor-default relative overflow-hidden animate-scale-in border-2 border-[#A3386C]"
        >
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-[#A3386C] mb-6">REQUEST MEDICINE</h2>
            <div className="space-y-4 text-left">
              <div>
                <label className="font-semibold text-gray-700">Medicine Name</label>
                <select
                  className={`w-full mt-1 p-3 border ${errors.medicine ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  value={selectedMedicineId ?? ''}
                  onChange={e => setSelectedMedicineId(Number(e.target.value) || null)}
                >
                  <option value="">Select medicine</option>
                  {medicines.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                {errors.medicine && <p className="text-red-500 text-xs mt-1">{errors.medicine}</p>}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Expiration Date</label>
                <select
                  className={`w-full mt-1 p-3 border ${errors.expiration ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  value={selectedExpiration}
                  onChange={e => setSelectedExpiration(e.target.value)}
                  disabled={expirationDates.length === 0}
                >
                  <option value="">Select expiration</option>
                  {expirationDates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                {errors.expiration && <p className="text-red-500 text-xs mt-1">{errors.expiration}</p>}
              </div>
              <div>
                <label className="font-semibold text-gray-700">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value) || '')}
                  className={`w-full mt-1 p-3 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-[#A3386C] focus:border-transparent text-black`}
                  placeholder={maxQuantity ? `Max: ${maxQuantity}` : 'Enter quantity'}
                  disabled={!selectedMedicineId}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
            </div>
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button onClick={handleClose} className="w-full bg-transparent hover:bg-gray-100 border border-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">CANCEL</button>
              <button onClick={handleConfirm} className="w-full bg-[#A3386C] hover:bg-[#8a2f5a] text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer">CONFIRM</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestMedicineModal;
