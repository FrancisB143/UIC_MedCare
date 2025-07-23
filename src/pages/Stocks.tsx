import React, { useState } from "react";
import { Bell, 
  User, 
  ArrowLeft, 
  Search,
  SquarePen, 
  Trash2, 
  HandCoins, 
  LayoutDashboard,
  Archive,
  FileText,
  History,
  ShieldQuestion
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Type definitions
interface Medicine {
  id: number;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  expiry: string;
}

interface ClinicBranch {
  id: number;
  name: string;
  suffix: string;
}

interface BranchMedicines {
  [key: number]: Medicine[];
}

// Mock medicine data for each branch
const branchMedicines: BranchMedicines = {
  1: [ // Fr Selga Campus
    { id: 1, name: "Paracetamol 500mg", category: "Pain Relief", stock: 150, minStock: 50, expiry: "2025-12-15" },
    { id: 2, name: "Amoxicillin 250mg", category: "Antibiotic", stock: 75, minStock: 30, expiry: "2025-08-20" },
    { id: 3, name: "Ibuprofen 400mg", category: "Anti-inflammatory", stock: 25, minStock: 40, expiry: "2025-11-30" },
    { id: 4, name: "Cetirizine 10mg", category: "Antihistamine", stock: 90, minStock: 25, expiry: "2026-01-10" },
    { id: 5, name: "Omeprazole 20mg", category: "Antacid", stock: 60, minStock: 20, expiry: "2025-09-25" },
    { id: 20, name: "Aspirin 80mg", category: "Cardioprotective", stock: 110, minStock: 35, expiry: "2025-10-20" },
  ],
  2: [ // Bonifacio Campus
    { id: 6, name: "Paracetamol 500mg", category: "Pain Relief", stock: 120, minStock: 50, expiry: "2025-10-15" },
    { id: 7, name: "Salbutamol Inhaler", category: "Bronchodilator", stock: 15, minStock: 10, expiry: "2025-07-30" },
    { id: 8, name: "Metformin 500mg", category: "Diabetes", stock: 80, minStock: 30, expiry: "2025-12-20" },
    { id: 9, name: "Losartan 50mg", category: "Hypertension", stock: 45, minStock: 25, expiry: "2025-11-15" },
    { id: 21, name: "Amlodipine 5mg", category: "Hypertension", stock: 65, minStock: 20, expiry: "2025-09-30" },
  ],
  3: [ // Bajada Campus (SHS)
    { id: 10, name: "Paracetamol 500mg", category: "Pain Relief", stock: 200, minStock: 50, expiry: "2026-02-15" },
    { id: 11, name: "Betadine Solution", category: "Antiseptic", stock: 30, minStock: 15, expiry: "2025-08-10" },
    { id: 12, name: "Bandages", category: "First Aid", stock: 100, minStock: 20, expiry: "2027-01-01" },
    { id: 13, name: "Alcohol 70%", category: "Antiseptic", stock: 50, minStock: 20, expiry: "2025-12-31" },
    { id: 22, name: "Hydrogen Peroxide", category: "Antiseptic", stock: 35, minStock: 15, expiry: "2025-11-25" },
  ],
  4: [ // Bajada Campus (JHS)
    { id: 14, name: "Children's Paracetamol", category: "Pain Relief", stock: 85, minStock: 30, expiry: "2025-09-20" },
    { id: 15, name: "Oral Rehydration Salts", category: "Rehydration", stock: 40, minStock: 20, expiry: "2026-03-15" },
    { id: 16, name: "Cough Syrup", category: "Cough Relief", stock: 20, minStock: 15, expiry: "2025-08-30" },
    { id: 23, name: "Children's Ibuprofen", category: "Anti-inflammatory", stock: 55, minStock: 25, expiry: "2025-12-05" },
  ],
  5: [ // Bajada Campus (GS)
    { id: 17, name: "Children's Vitamins", category: "Supplements", stock: 60, minStock: 25, expiry: "2025-11-10" },
    { id: 18, name: "First Aid Kit", category: "Emergency", stock: 10, minStock: 5, expiry: "2026-12-31" },
    { id: 19, name: "Thermometer", category: "Medical Device", stock: 8, minStock: 3, expiry: "N/A" },
    { id: 24, name: "Zinc Supplements", category: "Supplements", stock: 45, minStock: 20, expiry: "2025-10-15" },
  ]
};

const StocksPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'main' | 'branch'>('main');
  const [selectedBranch, setSelectedBranch] = useState<ClinicBranch | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const navigate = useNavigate();

  // Data for clinic branches
  const clinicBranches: ClinicBranch[] = [
    {
      id: 1,
      name: "Fr Selga Campus, Davao City, Philippines",
      suffix: "",
    },
    {
      id: 2,
      name: "Bonifacio Campus, Davao City, Philippines",
      suffix: "",
    },
    {
      id: 3,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(SHS)",
    },
    {
      id: 4,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(JHS)",
    },
    {
      id: 5,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(GS)",
    },
  ];

  // Get current date and time
  const getCurrentDateTime = (): { date: string; time: string } => {
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

  const handleViewClick = (branchId: number): void => {
    const branch = clinicBranches.find(b => b.id === branchId);
    if (branch) {
      setSelectedBranch(branch);
      setCurrentView('branch');
      setSearchTerm('');
    }
  };

  const handleBackToMain = (): void => {
    setCurrentView('main');
    setSelectedBranch(null);
    setSearchTerm('');
  };

  const handleRequestMedicine = (): void => {
    console.log("Request medicine clicked");
    // Add your request medicine logic here
  };

  const handleLogout = (): void => {
    console.log("Logout clicked");
    // Add your logout logic here
  };

  const handleEdit = (id: number): void => {
    console.log(`Edit medicine with id: ${id}`);
    // Add your edit logic here
  };

  const handleDelete = (id: number): void => {
    console.log(`Delete medicine with id: ${id}`);
    // Add your delete logic here
  };

  const handleDispense = (id: number): void => {
    console.log(`Dispense medicine with id: ${id}`);
    // Add your dispense logic here
  };

  // Get medicines for selected branch
  const getMedicinesForBranch = (): Medicine[] => {
    if (!selectedBranch) return [];
    const medicines = branchMedicines[selectedBranch.id] || [];
    
    if (searchTerm) {
      return medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return medicines;
  };

  const isLowStock = (stock: number, minStock: number): boolean => stock <= minStock;
  
  const isExpiringSoon = (expiry: string): boolean => {
    if (expiry === "N/A") return false;
    const expiryDate = new Date(expiry);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 90; // Expiring within 3 months
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      {currentView === 'main' && (
      <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-10">
        {/* Profile */}
        <div className="p-6 mt-4 border-b border-white">
          <div className="flex flex-col items-center mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-800" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[20px] font-semibold">John Doe</p>
              <p className="text-sm">Nurse</p>
            </div>
          </div>
          <p className="text-center text-xs">Fr Selga, Davao City, Philippines</p>
        </div>

        {/* Navigation */}
        <nav className="mt-10">
          <div className="px-4 space-y-6">
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/')}>
              <LayoutDashboard className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm font-medium text-white">Dashboard</p>
            </div>
            
            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg">
              <Archive className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">Stocks</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/Reports')}>
              <FileText className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">Reports</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/History')}>
              <History className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">History</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/About')}>
              <ShieldQuestion className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">About</p>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div onClick={handleLogout} className="absolute bottom-6 left-6">
          <div className="flex items-center hover:text-white cursor-pointer"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}>
            <div className="w-5 h-5 mr-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
              </svg>
            </div>
            <p className="text-sm">Logout</p>
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className={`${currentView === 'main' ? 'ml-64' : ''} flex-1 flex flex-col h-screen`}>
        {/* Header */}
        <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span></span>
            <div className="flex items-center">
              <img src="Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
              <h1 className="text-white text-[28px] font-semibold">MEDITRACK</h1>
            </div>
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-white cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        {currentView === 'main' ? (
          // Main Stocks View
          <div className="bg-white flex-1 px-20 py-6 overflow-hidden">
            {/* Date and Time */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <h2 className="font-normal text-[25px] text-black">{date}</h2>
                <p className="mt-2 font-normal text-black text-xl">{time}</p>
                <div className="w-[190px] h-0.5 mt-4 bg-[#A3386C]"></div>
              </div>
            </div>

            {/* Dashboard Title */}
            <div className="mb-4">
              <h2 className="font-normal text-black text-[22px]">Inventory Clinic Branches</h2>
            </div>
            
            <div className="space-y-4">
              {clinicBranches.map((branch) => (
                <div
                  key={branch.id}
                  className="w-full h-[59px] rounded-[10px] border border-solid border-[#a3386c] bg-white shadow-sm"
                >
                  <div className="p-0 h-full flex items-center justify-between">
                    <div className="flex items-center pl-7">
                      <span className="font-semibold text-black text-xl font-inter">
                        {branch.name}
                      </span>
                      {branch.suffix && (
                        <span className="ml-4 font-semibold text-black text-xl font-inter">
                          {branch.suffix}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleViewClick(branch.id)}
                      className="w-[90px] h-[40px] mr-7 bg-[#a3386c] hover:bg-[#8a2f5a] rounded-[10px] text-l font-semibold 
                      text-white transition-colors duration-200 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Medicine Button */}
            <div className="flex justify-end mt-8">
              <button onClick={handleRequestMedicine}
                className="w-[180px] h-[40px] border border-solid border-[#a3386c] hover:bg-[#a3386c] hover:text-white rounded-[10px] 
                text-l font-semibold text-[#a3386c] transition-colors duration-200 cursor-pointer"
              >
                Request Medicine
              </button>
            </div>
          </div>
        ) : (
          // Branch Inventory View - Fixed height with scrollable table
          <div className="bg-gray-100 flex-1 flex flex-col overflow-hidden">
            {/* Back Button and Date/Time Section */}
            <div className="bg-white flex-shrink-0">
              <div className="flex items-start px-8 py-4">
                <button onClick={handleBackToMain} 
                  className="flex items-center text-gray-600 hover:text-[#a3386c] transition-colors duration-200 mt-2">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </button>
                <div className="flex-1 flex justify-center">
                  <div className="flex flex-col items-center">
                    <h2 className="font-normal text-[28px] text-black">{date}</h2>
                    <p className="mt-2 font-normal text-black text-lg">{time}</p>
                    <div className="w-[190px] h-0.5 mt-4 bg-[#A3386C]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Available List Section - Flexible height */}
            <div className="bg-white px-8 py-6 flex-1 flex flex-col overflow-hidden" style={{ minHeight: '528px' }}>
              {/* Title and Search */}
              <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-medium text-black mb-1">Stock Available List</h2>
                  <p className="text-gray-600 text-sm">{selectedBranch?.name} {selectedBranch?.suffix}</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search Medicine"
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] 
                    focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Medicine Table - Scrollable */}
              <div className="bg-white rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="overflow-auto flex-1">
                  <table className="w-full">
                    <thead className="bg-[#D4A5B8] text-black sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">MEDICINE NAME</th>
                        <th className="px-6 py-4 text-left font-medium">CATEGORY</th>
                        <th className="px-6 py-4 text-left font-medium">DATE RECEIVED</th>
                        <th className="px-6 py-4 text-left font-medium">EXPIRATION DATE</th>
                        <th className="px-6 py-4 text-left font-medium">QUANTITY</th>
                        <th className="px-6 py-4 text-center font-medium"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getMedicinesForBranch().map((medicine) => (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-gray-900 font-medium">
                              {medicine.category === "Pain Relief" ? "RITEMED" : 
                               medicine.category === "Antibiotic" ? "RITEMED" : 
                               medicine.category === "Anti-inflammatory" ? "RITEMED" : 
                               medicine.name.split(' ')[0]}
                            </div>
                            <div className="text-gray-600 text-sm">{medicine.name}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{medicine.category}</td>
                          <td className="px-6 py-4 text-gray-900">2025-03-25</td>
                          <td className="px-6 py-4 text-gray-900">
                            {medicine.expiry === "N/A" ? "2027-03-25" : medicine.expiry}
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-medium">{medicine.stock}</td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleEdit(medicine.id)}
                                className="text-gray-500 hover:text-blue-700 p-1 transition-colors"
                                title="Edit">
                                <SquarePen className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(medicine.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full"
                                title="Delete">
                                <Trash2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDispense(medicine.id)}
                                className="text-gray-700 hover:text-green-700 p-1 rounded-full"
                                title="Dispense">
                                <HandCoins className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {getMedicinesForBranch().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {searchTerm ? 'No medicines found matching your search.' : 'No medicines available in this branch.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Medicine Button */}
              <div className="flex justify-end mt-8 flex-shrink-0">
                <button 
                  className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 
                  cursor-pointer"
                  onClick={() => console.log('Add Medicine clicked')}
                >
                  ADD MEDICINE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StocksPage;