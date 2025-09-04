import React, { useState, useEffect } from "react";
import RequestMedicineModal from '../../components/RequestMedicineModal';
import OtherInventoryTable from '../../components/OtherInventoryTable';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    Search,
    Menu
} from 'lucide-react';
import { 
    Medicine, 
    ClinicBranch, 
    getBranchById, 
    getMedicinesForBranch as getBranchMedicines 
} from '../../data/branchMedicines';





import { usePage } from '@inertiajs/react';

const OtherBranchInventoryPage: React.FC = () => {
    // Get branchId from Inertia page props (from route param)
    const { branchId } = usePage().props as unknown as { branchId: number };
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);


    // Define dateTime state
    type DateTimeData = { date: string; time: string };
    const [dateTime, setDateTime] = useState<DateTimeData>(() => getCurrentDateTime());
    const [branch, setBranch] = useState<ClinicBranch | null>(null);

    const [medicines, setMedicines] = useState<Medicine[]>([]);
    // State to show request modal
    const [isRequestModalOpen, setRequestModalOpen] = useState(false);

    
    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];


    useEffect(() => {
        if (branchId) {
            const branchData = getBranchById(branchId);
            const branchMedicines = getBranchMedicines(branchId);
            if (branchData) {
                setBranch(branchData);
                setMedicines(branchMedicines);
            } else {
                console.error(`Branch with ID ${branchId} not found`);
                router.visit('/inventory/stocks');
            }
        }
    }, [branchId]);

    function getCurrentDateTime(): DateTimeData {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        return { date, time };
    }
        
    useEffect(() => {
        const timer = setInterval(() => setDateTime(getCurrentDateTime()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => router.visit(path);

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const handleBackToStocks = (): void => router.visit('/inventory/stocks');

    // Get medicines with stock > 40 for dropdown
    const eligibleMedicines = medicines.filter(med => med.stock > 40);

    const handleRequestMedicine = (): void => {
        setRequestModalOpen(true);
    };



    const getFilteredAndSortedMedicines = (): Medicine[] => {
        let processed = medicines.filter(med =>
            med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return processed.sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
    };

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    if (!branch) {
        return (
            <div className="flex h-screen bg-gray-100 items-center justify-center">
                <p className="text-gray-500 text-lg">Loading branch data...</p>
            </div>
        );
    }

    // Handler for request modal submission
    const handleRequestSubmit = (data: { medicineId: number; expirationDate: string; quantity: number }) => {
        setRequestModalOpen(false);
        // TODO: handle request logic (API call, UI update, etc.)
    };

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
                    <div className="bg-white flex-shrink-0">
                        <div className="flex items-start px-8 py-4">
                            <button onClick={handleBackToStocks} className="flex items-center text-gray-600 hover:text-[#a3386c] transition-colors duration-200 mt-2">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                            </button>
                            <div className="flex-1 flex justify-center">
                                <div className="flex flex-col items-center">
                                    <p className="text-[22px] font-normal text-black">{date}</p>
                                    <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                                    <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white px-8 py-6 flex-1 flex flex-col overflow-hidden" style={{ minHeight: '528px' }}>
                        <div className="flex items-center justify-between mb-6 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-medium text-black mb-1">Other Branch - Stock Available List</h2>
                                <p className="text-gray-600 text-sm">{branch.name} {branch.suffix}</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search Medicine"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a3386c] focus:border-transparent text-sm ${searchTerm ? 'text-black' : 'text-gray-400'}`}
                                />
                            </div>
                        </div>
                        {/* Table for Other Branches */}
                        <OtherInventoryTable medicines={getFilteredAndSortedMedicines()} searchTerm={searchTerm} />
                        <div className="flex justify-end mt-8 flex-shrink-0">
                            <button onClick={handleRequestMedicine} className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 cursor-pointer transform hover:scale-105">
                                REQUEST MEDICINE
                            </button>
                        </div>

                        {/* Request Medicine Modal */}
                        <RequestMedicineModal
                            isOpen={isRequestModalOpen}
                            setIsOpen={setRequestModalOpen}
                            branchId={branchId}
                            onRequest={handleRequestSubmit}
                        />
                    </div>
                </main>
            </div>
        </div>

    );
};

export default OtherBranchInventoryPage;
