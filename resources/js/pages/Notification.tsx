import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';

// A more detailed interface for the full notification page
interface FullNotification {
    id: number;
    title: string;
    message: string;
    time: string;
    // In a real app, you might have an image URL or an icon component
    icon: React.ReactNode; 
}

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

const Notification: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(true);
    const [dateTime, setDateTime] = useState<DateTimeData>(getCurrentDateTime());

    // Dummy data for the notifications pop-up in the header
    const bellNotifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];
    
    // Dummy data for the main notification page, matching the image
    const fullNotifications: FullNotification[] = [
        {
            id: 1,
            title: 'Updated Medicine',
            message: 'Paracetamol added 2x',
            time: '5hrs ago',
            icon: <img src="/images/medicine.jpg" alt="Update" className="w-10 h-10 rounded-full" /> 
        },
        {
            id: 2,
            title: 'Medicine Request Received',
            message: 'Nurse Jane',
            time: '10hrs ago',
            icon: <img src="/images/nurse.jpg" alt="Request" className="w-10 h-10 rounded-full" />
        },
        {
            id: 3,
            title: 'Deleted Medicine',
            message: 'Paracetamol deleted 100x',
            time: '12hrs ago',
            icon: <img src="/images/medicine.jpg" alt="Delete" className="w-10 h-10 rounded-full" />
        },
        {
            id: 4,
            title: 'Dispensed Medicine',
            message: 'Decolgen Forte 5x',
            time: '15hrs ago',
            icon: <img src="/images/nurse.jpg" alt="Dispense" className="w-10 h-10 rounded-full" />
        },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    const { date, time } = dateTime;

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
                activeMenu=""
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
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
                            notifications={bellNotifications}
                            onSeeAll={() => handleNavigation('/notification')}
                        />
                    </div>
                </header>

                {/* Main Notification Container */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    {/* Page Title */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Notification</h2>
                        <p className="text-gray-500 mt-1">Get notification what's the recent transaction</p>
                    </div>

                    {/* Notification List */}
                    <div className="max-w-4xl mx-auto">
                        <div className="space-y-4">
                            {fullNotifications.length > 0 ? (
                                fullNotifications.map(notification => (
                                    <div key={notification.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                {notification.icon}
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-md font-semibold text-gray-900">{notification.title}</p>
                                                <p className="text-sm text-gray-600">{notification.message}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-400 whitespace-nowrap">{notification.time}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">No notifications to display.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Notification;