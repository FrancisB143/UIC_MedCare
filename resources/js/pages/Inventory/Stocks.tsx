import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { clinicBranches, ClinicBranch } from '../../data/branchMedicines';



const StocksPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);


    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];


    const handleNavigation = (path: string): void => router.visit(path);

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    // Navigate to BranchInventory for My Branch (id=1)
    const handleMyBranchClick = (): void => {
        router.visit(`/inventory/branchinventory/1`);
    };

    // Navigate to Otherinventorystocks for other branches
    const handleOtherBranchClick = (branchId: number): void => {
        router.visit(`/inventory/otherinventorystocks/${branchId}`);
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Separate Father Selga Campus (My Branch) from other branches
    const myBranch = clinicBranches.find(branch => branch.id === 1);
    const otherBranches = clinicBranches.filter(branch => branch.id !== 1);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-stocks"
            />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        <NotificationBell
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('/Notification')}
                        />
                    </div>
                </header>

                <main className="bg-gray-100 flex-1 flex flex-col overflow-hidden">

                    
                    <div className="bg-white px-8 py-4 flex-1 flex flex-col overflow-auto">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Select Branch Inventory</h2>
                            <p className="text-gray-600">Choose a branch to view its medicine inventory</p>
                        </div>

                        {/* My Branch Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-700 mb-4">My Branch</h3>
                            {myBranch && (
                                <div className="bg-white border-2 border-[#A3386C] rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102"
                                     onClick={handleMyBranchClick}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-800">{myBranch.name}</h4>
                                            <p className="text-gray-600 mt-1">{myBranch.suffix}</p>
                                            <p className="text-sm text-[#A3386C] mt-2 font-medium">• Manage Inventory • Add/Remove Medicines</p>
                                        </div>
                                        <div className="text-[#A3386C]">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Other Branches Section */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-700 mb-4">Other Branches</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherBranches.map((branch) => (
                                    <div key={branch.id} 
                                         className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102 hover:border-[#A3386C]"
                                         onClick={() => handleOtherBranchClick(branch.id)}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800">{branch.name}</h4>
                                                <p className="text-gray-600 mt-1">{branch.suffix}</p>
                                                <p className="text-sm text-gray-500 mt-2">• View Only • Request Medicines</p>
                                            </div>
                                            <div className="text-gray-400">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StocksPage;
