import React from 'react';
import { Medicine } from '../data/branchMedicines'; // Adjust path if necessary

interface OtherInventoryTableProps {
  medicines: Medicine[];
  searchTerm: string;
}

const OtherInventoryTable: React.FC<OtherInventoryTableProps> = ({ medicines, searchTerm }) => {
  return (
    <div className="bg-white rounded-lg overflow-auto flex-1">
      <table className="w-full">
        <thead className="bg-[#D4A5B8] text-black sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left font-medium">MEDICINE NAME</th>
            <th className="px-6 py-4 text-left font-medium">CATEGORY</th>
            <th className="px-6 py-4 text-left font-medium">DATE RECEIVED</th>
            <th className="px-6 py-4 text-left font-medium">EXPIRATION DATE</th>
            <th className="px-6 py-4 text-left font-medium">QUANTITY</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {medicines.map((medicine) => (
            <tr key={medicine.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-gray-900 font-medium">
                  {/* Logic to show brand or generic name */}
                  {medicine.category.match(/Pain Relief|Antibiotic|Anti-inflammatory/) ? "RITEMED" : medicine.name.split(' ')[0]}
                </div>
                <div className="text-gray-600 text-sm">{medicine.name}</div>
              </td>
              <td className="px-6 py-4 text-gray-900">{medicine.category}</td>
              {/* Using static dates as in the original example */}
              <td className="px-6 py-4 text-gray-900">2025-08-26</td> 
              <td className="px-6 py-4 text-gray-900">{medicine.expiry === "N/A" ? "2027-03-25" : medicine.expiry}</td>
              <td className="px-6 py-4 text-gray-900 font-medium">{medicine.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Display message when no medicines are found */}
      {medicines.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            {searchTerm ? 'No medicines found for your search.' : 'There are no medicines in this branch.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default OtherInventoryTable;