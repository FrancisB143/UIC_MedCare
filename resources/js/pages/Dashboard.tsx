import React, { useState, useEffect } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import { router } from '@inertiajs/react';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

interface DateTimeData {
    date: string;
    time: string;
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

const Dashboard: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        router.visit('/');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
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
                activeMenu="dashboard"
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
                        <NotificationBell
                            notifications={notifications}
                            onSeeAll={() => handleNavigation('../Notification')}
                        />
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <div className="flex flex-col items-center mb-8">
                        <p className="text-[22px] font-normal text-black">{date}</p>
                        <p className="text-[17px] text-base text-gray-500 mt-1">{time}</p>
                        <div className="w-[130px] h-0.5 mt-3 bg-[#A3386C]"></div>
                    </div>

                    <h1 className="text-5xl font-bold text-black mb-8">Dashboard</h1>

                    <section className="mb-10">
                        <h2 className="text-2xl font-normal text-black mb-4">Current Consultations:</h2>
                        <div className="space-y-4">
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Walk-in/Scheduled Consultation</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
                                <p className="text-4xl font-bold text-[#A3386C] mr-4">0</p>
                                <p className="text-xl text-gray-700">Referred Consultation</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-normal text-black mb-4">Recent Consultations:</h2>
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-40 flex items-center justify-center text-gray-500 italic">
                            {/* This area can be populated with actual recent consultations data */}
                            No recent consultations to display.
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;