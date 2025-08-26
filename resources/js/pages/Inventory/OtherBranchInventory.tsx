import React, { useState, useEffect } from "react";
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

interface DateTimeData {
    date: string;
    time: string;
}

interface OtherBranchInventoryPageProps {
    branchId: number;
}

const OtherBranchInventoryPage: React.FC<OtherBranchInventoryPageProps> = ({ branchId }) => {
    
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [branch, setBranch] = useState<ClinicBranch | null>(null);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    function getCurrentDateTime(): DateTimeData {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
        return { date, time };
    }

    useEffect(() => {
        if (branchId) {
            const branchData = getBranchById(branchId);
            const branchMedicines = getBranchMedicines(branchId);
            if (branchData) {
                setBranch(branchData);
                setMedicines(branchMedicines);
            } else {
                console.error(`Branch with ID ${branchId} not found`);
                router.visit('/stocks');
            }
        }
    }, [branchId]);

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

    const handleRequestMedicine = (): void => {
        // Placeholder for request functionality. This could open a new modal or navigate to a request page.
        alert('Navigating to medicine request form...');
        // Example: router.visit('/inventory/request-medicine');
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
                            onSeeAll={() => handleNavigation('/notifications')}
                        />
                    </div>
                </header>
                <div className="bg-gray-100 flex-1 flex flex-col overflow-hidden">
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
                                <h2 className="text-xl font-medium text-black mb-1">Stock Available List</h2>
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
                        <div className="bg-white rounded-lg overflow-auto flex-1">
                            <table className="w-full">
                                <thead className="bg-[#D4A5B8] text-black sticky top-0">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-medium">MEDICINE NAME</th>
                                        <th className="px-6 py-4 text-left font-medium">CATEGORY</th>
                                        <th className="px-6 py-4 text-left font-medium">DATE RECEIVED</th>
                                        <th className="px-6 py-4 text-left font-medium">EXPIRATION DATE</th>
                                        <th className="px-6 py-4 text-left font-medium">QUANTITY</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {getFilteredAndSortedMedicines().map((medicine) => (
                                        <tr key={medicine.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-gray-900 font-medium">
                                                    {medicine.category.match(/Pain Relief|Antibiotic|Anti-inflammatory/) ? "RITEMED" : medicine.name.split(' ')[0]}
                                                </div>
                                                <div className="text-gray-600 text-sm">{medicine.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{medicine.category}</td>
                                            <td className="px-6 py-4 text-gray-900">2025-08-26</td>
                                            <td className="px-6 py-4 text-gray-900">{medicine.expiry === "N/A" ? "2027-03-25" : medicine.expiry}</td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">{medicine.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {getFilteredAndSortedMedicines().length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">{searchTerm ? 'No medicines found.' : 'No medicines in this branch.'}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end mt-8 flex-shrink-0">
                            <button onClick={handleRequestMedicine} className="bg-[#a3386c] hover:bg-[#8a2f5a] text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 cursor-pointer transform hover:scale-105">REQUEST MEDICINE</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherBranchInventoryPage;