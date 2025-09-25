import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { AlertTriangle, Menu, Package, Minus, Calendar } from 'lucide-react';
import { BranchInventoryService, BranchStockSummary, MedicineStockIn } from '../../services/branchInventoryService';
import { UserService } from '../../services/userService';

interface DateTimeData {
    date: string;
    time: string;
}

interface SoonToExpireMedicine {
    medicine_name: string;
    expiration_date: string;
    days_until_expiry: number;
}

function getCurrentDateTime(): DateTimeData {
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
}

const MeditrackDashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());
    const [lowStockMedicines, setLowStockMedicines] = useState<BranchStockSummary[]>([]);
    const [soonToExpireMedicines, setSoonToExpireMedicines] = useState<SoonToExpireMedicine[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingExpiry, setIsLoadingExpiry] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // NotificationBell will fetch notifications itself

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        // Load current user
        const user = UserService.getCurrentUser();
        if (!user) {
            router.visit('/');
            return;
        }
        setCurrentUser(user);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(timer);
        };
    }, []);

    // Load low stock medicines when user is available
    useEffect(() => {
        if (currentUser) {
            loadLowStockMedicines();
            loadSoonToExpireMedicines();
        }
    }, [currentUser]);

    const loadLowStockMedicines = async () => {
        try {
            setIsLoading(true);
            const lowStock = await BranchInventoryService.getLowStockMedicinesMSSQL(currentUser.branch_id);
            // Get top 5 medicines that need reorder (sorted by quantity ascending)
            const top5LowStock = lowStock
                .sort((a, b) => a.quantity - b.quantity)
                .slice(0, 5);
            setLowStockMedicines(top5LowStock);
        } catch (error) {
            console.error('Error loading low stock medicines:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadSoonToExpireMedicines = async () => {
        try {
            setIsLoadingExpiry(true);
            const expiringMedicines = await BranchInventoryService.getSoonToExpireMedicinesMSSQL(currentUser.branch_id);
            
            // Take only the first (most urgent) medicine
            const sortedExpiring = expiringMedicines
                .sort((a, b) => a.days_until_expiry - b.days_until_expiry)
                .slice(0, 1);
            
            setSoonToExpireMedicines(sortedExpiring);
        } catch (error) {
            console.error('Error loading soon to expire medicines:', error);
        } finally {
            setIsLoadingExpiry(false);
        }
    };

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const toggleNotification = () => {
        setNotificationOpen(!isNotificationOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-dashboard"
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        {/* Sidebar Toggle Button */}
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        {/* Notification Bell */}
                        <NotificationBell onSeeAll={() => handleNavigation('../Notification')} />
                    </div>
                </header>

                {/* Main Dashboard */}
                <main className="bg-white main-dashboard p-6 flex-1 overflow-hidden">
                    {/* Date and Time */}
                    <div className="flex justify-center mb-4">
                        <div className="flex flex-col items-center">
                            <p className="text-[22px] font-normal text-black">{date}</p>
                            <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                            <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                        </div>
                    </div>

                    {/* Dashboard Title */}
                    <div className="mb-6">
                        <h2 className="font-normal text-black text-[26px]">Dashboard</h2>
                    </div>
                    <div className="w-full h-px bg-[#A3386C] mb-6"></div>

                    {/* Dashboard Content */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                            {/* Left Column */}
                            <div className="flex flex-col space-y-4 min-h-0">
                                {/* Soon-to-Expire Medications */}
                                <div className="border border-[#A3386C] bg-white flex-1 flex flex-col min-h-0">
                                    <div className="p-4 border-b border-[#A3386C] flex-shrink-0">
                                        <h3 className="font-normal text-black text-base text-center flex items-center justify-center">
                                            <Calendar className="w-4 h-4 mr-2 text-[#A3386C]" />
                                            Soon-to-Expire Medication
                                        </h3>
                                        <p className="font-light text-gray-600 text-xs text-center mt-2">Most urgent expiry within 30 days</p>
                                    </div>
                                    
                                    <div className="flex-1 p-4 overflow-hidden">
                                        {isLoadingExpiry ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3386C]"></div>
                                            </div>
                                        ) : soonToExpireMedicines.length > 0 ? (
                                            <div className="h-full flex items-center">
                                                {soonToExpireMedicines.map((medicine, index) => (
                                                    <div key={index} className="w-full p-3 bg-orange-50 border border-orange-200 rounded-md">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm truncate mb-1" title={medicine.medicine_name}>
                                                                    {medicine.medicine_name}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    Expires: {new Date(medicine.expiration_date).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <div className="text-right ml-3 flex-shrink-0">
                                                                <div className="flex items-center justify-center">
                                                                    <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                                                                    <span className="font-bold text-orange-600 text-xl">
                                                                        {medicine.days_until_expiry}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-600 text-center block mt-1">
                                                                    {medicine.days_until_expiry === 0 ? 'expires today' : 
                                                                     medicine.days_until_expiry === 1 ? 'day left' : 'days left'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                                <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                                                <p className="text-base font-medium mb-1">No medicines expiring soon!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Common Seasonal Illnesses Card */}
                                <div className="border border-[#A3386C] bg-white flex-shrink-0">
                                    <div className="p-4">
                                        <h3 className="font-normal text-black text-base mb-3">Common Seasonal Illnesses</h3>
                                        <div className="w-full h-px bg-gray-300 mb-3"></div>
                                        <div className="border border-[#A3386C] rounded">
                                            <div className="border-b border-[#A3386C]">
                                                <div className="py-2 px-2 flex items-center justify-between cursor-pointer">
                                                    <span className="font-normal text-black text-sm">Fever</span>
                                                    <img className="w-[16px] h-[16px]" alt="Arrow" src="/images/up-arrow.png" />
                                                </div>
                                            </div>
                                            <div className="border-b border-[#A3386C]">
                                                <div className="py-2 px-2 flex items-center justify-between cursor-pointer">
                                                    <span className="font-normal text-black text-sm">Cold & Flu</span>
                                                    <img className="w-[16px] h-[16px]" alt="Arrow" src="/images/up-arrow.png" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="py-2 px-2 flex items-center justify-between cursor-pointer">
                                                    <span className="font-normal text-black text-sm">Allergies</span>
                                                    <img className="w-[16px] h-[16px]" alt="Arrow" src="/images/down-arrow.png" />
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-3 font-normal italic text-[#ff0000] text-xs">Check stocks regularly during peak seasons.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Top 5 Medicines Need Reorder */}
                            <div className="flex flex-col min-h-0">
                                <div className="border border-[#A3386C] bg-white flex-1 flex flex-col min-h-0">
                                    <div className="p-4 border-b border-[#A3386C] flex-shrink-0">
                                        <h3 className="font-normal text-black text-base text-center flex items-center justify-center">
                                            <Package className="w-4 h-4 mr-2 text-[#A3386C]" />
                                            Top 5 Medicines Need Reorder
                                        </h3>
                                        <p className="font-light text-gray-600 text-xs text-center mt-2">Stock Level ≤ 50 units</p>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center h-32">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A3386C]"></div>
                                            </div>
                                        ) : lowStockMedicines.length > 0 ? (
                                            <div className="space-y-2 p-4 pb-4">
                                                {lowStockMedicines.map((medicine, index) => (
                                                    <div key={medicine.medicine_id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
                                                        <div className="flex items-center flex-1 min-w-0">
                                                            <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-gray-900 text-sm truncate" title={medicine.medicine_name}>
                                                                    {medicine.medicine_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{medicine.medicine_category}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right ml-4 flex-shrink-0">
                                                            <div className="flex items-center">
                                                                <Minus className="w-4 h-4 text-red-600 mr-1" />
                                                                <span className="font-bold text-red-600 text-lg">{medicine.quantity}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">units left</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                                                <Package className="w-12 h-12 text-gray-300 mb-2" />
                                                <p className="text-sm font-medium">All medicines are well stocked!</p>
                                                <p className="text-xs">No medicines need reordering at this time.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MeditrackDashboard;