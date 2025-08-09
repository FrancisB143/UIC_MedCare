import React, { useState, useEffect } from "react";
import NotificationBell, { Notification as NotificationType } from '../../components/NotificationBell';
import Sidebar from '../../components/Sidebar';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { clinicBranches, ClinicBranch } from '../../data/branchMedicines';

interface DateTimeData {
    date: string;
    time: string;
}

const StocksPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());

    // Notifications (same as Dashboard)
    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    // Get current date and time
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

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const { date, time } = dateTime;

    const handleViewClick = (branchId: number): void => {
        console.log('Navigating to branch:', branchId); // Debug log
        console.log('URL:', `/inventory/stocks/branch/${branchId}`); // Debug log
        
        try {
            // Navigate to the branch inventory page with the branch ID
            router.visit(`/inventory/stocks/branch/${branchId}`, {
                method: 'get',
                onError: (errors) => {
                    console.error('Navigation error:', errors);
                },
                onSuccess: () => {
                    console.log('Navigation successful');
                }
            });
        } catch (error) {
            console.error('Router error:', error);
            // Fallback to window.location if router fails
            window.location.href = `/inventory/stocks/branch/${branchId}`;
        }
    };

    const handleRequestMedicine = (): void => {
        console.log("Request medicine clicked");
        // TODO: Implement request medicine functionality
    };

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

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isSidebarOpen={isSidebarOpen}
                isSearchOpen={isSearchOpen}
                setSearchOpen={setSearchOpen}
                isInventoryOpen={isInventoryOpen}
                setInventoryOpen={setInventoryOpen}
                handleNavigation={handleNavigation}
                handleLogout={handleLogout}
                activeMenu="inventory-stocks" // <-- Highlight Inventory > Stocks
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 flex-shrink-0 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/images/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">UIC MediCare</h1>
                        </div>
                        {/* Notification Bell */}
                        <NotificationBell
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('/notifications')}
                        />
                    </div>
                </header>

                {/* Main Stocks View */}
                <div className="bg-white flex-1 px-20 py-6 overflow-y-auto">
                    {/* Date and Time */}
                    <div className="flex justify-center mb-6">
                        <div className="flex flex-col items-center">
                            <p className="text-[22px] font-normal text-black">{date}</p>
                            <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                            <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
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
                                    <button
                                        onClick={() => handleViewClick(branch.id)}
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
                        <button
                            onClick={handleRequestMedicine}
                            className="w-[180px] h-[40px] border border-solid border-[#a3386c] hover:bg-[#a3386c] hover:text-white rounded-[10px]
                            text-l font-semibold text-[#a3386c] transition-colors duration-200 cursor-pointer"
                        >
                            Request Medicine
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StocksPage;