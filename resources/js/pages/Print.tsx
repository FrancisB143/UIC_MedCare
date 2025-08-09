import React, { useState } from 'react';
import NotificationBell, { Notification as NotificationType } from '../components/NotificationBell';
import Sidebar from '../components/Sidebar'; // Import Sidebar
import { router } from '@inertiajs/react';
import {
    Printer,
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
                            <h2 className="text-3xl font-normal text-black">Print Documents</h2>
                            <p className="text-gray-500 mb-6">Select a document type and click print.</p>

                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 flex items-end gap-6">
                                <div>
                                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">Document to Print</label>
                                    <select id="documentType" className="w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#A3386C] focus:border-[#A3386C]">
                                        <option>Inventory Report</option>
                                        <option>Dispensing Log</option>
                                        <option>Patient Record</option>
                                        <option>Low Stock Report</option>
                                    </select>
                                </div>
                                <button onClick={handlePrint} className="bg-[#A3386C] text-white px-6 py-2 rounded-md hover:bg-[#862d59] transition-colors flex items-center gap-2">
                                    <Printer className="w-4 h-4"/>
                                    Preview & Print
                                </button>
                            </div>
                        </div>

                        {/* This is the area that will be printed */}
                        <div className="printable-area bg-white p-8 rounded-lg shadow-lg border border-gray-200 max-w-4xl mx-auto">
                            <header className="flex items-center justify-between pb-4 border-b-2 border-black">
                                <div className="flex items-center gap-4">
                                    <img src="/Logo.png" alt="Logo" className="h-16" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-black">MEDITRACK</h1>
                                        <p className="text-sm text-gray-600">University Clinic, Davao City, Philippines</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-semibold">Inventory Report</h2>
                                    <p className="text-sm text-gray-600">Date: {currentDate}</p>
                                </div>
                            </header>

                            <table className="min-w-full mt-6">
                                <thead className="border-b border-gray-300">
                                    <tr>
                                        <th className="py-2 text-left text-sm font-semibold text-gray-700">MEDICINE NAME</th>
                                        <th className="py-2 text-left text-sm font-semibold text-gray-700">CURRENT STOCK</th>
                                        <th className="py-2 text-left text-sm font-semibold text-gray-700">EXPIRATION DATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {printData.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-200">
                                            <td className="py-3 text-sm text-gray-800">{item.name}</td>
                                            <td className="py-3 text-sm text-gray-800">{item.stock}</td>
                                            <td className="py-3 text-sm text-gray-800">{item.expiration}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                                <p>Generated by John Doe</p>
                                <p>This is a system-generated document from MEDITRACK.</p>
                            </footer>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Print;