import React, { useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import Sidebar from '../components/Sidebar'; // Import Sidebar
import { router } from '@inertiajs/react';
import {
    Menu
} from 'lucide-react';

const Print: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    const notifications: NotificationType[] = [
        { id: 1, type: 'updatedMedicine', message: 'Updated Medicine', time: '5hrs ago' },
        { id: 2, type: 'medicineRequest', message: 'Medicine Request Received', time: '10hrs ago' },
    ];
        
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

    // Function to trigger the browser's print dialog
    const handlePrint = () => {
        window.print();
    };

    // Sample data for the printable report
    const printData = [
        { name: 'RITEMED Paracetamol 500mg', stock: 150, expiration: '2026-12-31' },
        { name: 'DECOLGEN Forte', stock: 45, expiration: '2025-11-20' },
        { name: 'Cetirizine (Allerkid)', stock: 80, expiration: '2027-05-10' },
        { name: 'Neozep Forte', stock: 120, expiration: '2026-08-15' },
    ];

    const currentDate = "July 28, 2025";

    return (
        <>
            {/* These styles will be applied only when printing */}
            <style>
                {`
                    @media print {
                        /* Hide everything on the page by default */
                        body * {
                            visibility: hidden;
                        }
                        /* Then, make the printable area and its children visible */
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        /* Position the printable area to the top-left corner */
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        /* Hide the print controls when printing */
                        .print-controls {
                            display: none;
                        }
                    }
                `}
            </style>
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
                activeMenu="print" // <-- Highlight About as active
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

                    {/* Main Print Container */}
                    <main className="flex-1 p-6 overflow-y-auto bg-white">
                        <div className="print-controls">
                            <h2 className="text-3xl font-normal text-black">Print Prescription</h2>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Print;