// resources/js/pages/Print.tsx
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Bell,
    User,
    LayoutDashboard,
    Archive,
    FileText,
    History,
    ShieldQuestion,
    Search,
    Printer,
    GraduationCap,
    Briefcase,
    ChevronDown,
    Menu
} from 'lucide-react';

const Print: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
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

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

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
                        /* Hide sidebar and header when printing */
                        .sidebar, .header {
                            display: none;
                        }
                    }
                `}
            </style>
            
            <div className="flex h-screen bg-gray-100">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} sidebar`}>
                    {/* Profile & Navigation */}
                    <div className="p-6 mt-4 border-b border-white/50">
                        <div className="flex flex-col items-center mb-2">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-[#A3386C]" />
                            </div>
                            <div className={`flex flex-col items-center transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="text-[20px] font-semibold">John Doe</p>
                                <p className="text-sm">Nurse</p>
                            </div>
                        </div>
                        <p className={`text-center text-xs transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>Fr Selga, Davao City</p>
                    </div>

                    <nav className="mt-8">
                        <div className="px-4 space-y-2">
                            {/* Dashboard */}
                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/')}>
                                <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm font-medium text-white ml-3 whitespace-nowrap">Dashboard</p>}
                            </div>

                            {/* Search Submenu */}
                            <div>
                                <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => setSearchOpen(!isSearchOpen)}>
                                    <Search className="w-5 h-5 text-white flex-shrink-0" />
                                    {isSidebarOpen && (
                                        <div className="flex justify-between w-full items-center">
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Search</p>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSearchOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </div>
                                {isSidebarOpen && isSearchOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/student')}>
                                            <GraduationCap className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Student</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/employee')}>
                                            <Briefcase className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Employee</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Inventory Submenu */}
                            <div>
                                <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => setInventoryOpen(!isInventoryOpen)}>
                                    <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                    {isSidebarOpen && (
                                        <div className="flex justify-between w-full items-center">
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Inventory</p>
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isInventoryOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    )}
                                </div>
                                {isSidebarOpen && isInventoryOpen && (
                                    <div className="mt-1 space-y-1 pl-8">
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/dashboard')}>
                                            <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Dashboard</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/stocks')}>
                                            <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">Stocks</p>
                                        </div>
                                        <div className="flex items-center p-2 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/inventory/history')}>
                                            <History className="w-5 h-5 text-white flex-shrink-0" />
                                            <p className="text-sm text-white ml-3 whitespace-nowrap">History</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Reports')}>
                                <FileText className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Reports</p>}
                            </div>

                            {/* Print - Active */}
                            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Print')}>
                                <Printer className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm font-medium text-white ml-3 whitespace-nowrap">Print</p>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/About')}>
                                <ShieldQuestion className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">About</p>}
                            </div>
                        </div>
                    </nav>

                    <div className="absolute bottom-6 left-0 right-0 px-4">
                        <div className={`flex items-center p-3 hover:bg-[#77536A] rounded-lg cursor-pointer ${!isSidebarOpen && 'justify-center'}`} onClick={handleLogout}>
                            <div className="w-5 h-5 flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16 13v-2H7V8l-5 4 5 4v-3z"/><path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/></svg>
                            </div>
                            {isSidebarOpen && <p className="text-sm ml-3 whitespace-nowrap">Logout</p>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    {/* Header */}
                    <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10 header">
                        <div className="flex items-center justify-between">
                            <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="flex items-center">
                                <img src="/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                                <h1 className="text-white text-[28px] font-semibold">MEDICARE</h1>
                            </div>
                            <div className="flex items-center">
                                <Bell className="w-6 h-6 text-white cursor-pointer" />
                            </div>
                        </div>
                    </header>

                    {/* Main Print Container */}
                    <main className="flex-1 p-6 overflow-y-auto bg-white">
                        <div className="print-controls mb-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-bold text-black">Print Reports</h2>
                                <button
                                    onClick={handlePrint}
                                    className="bg-[#A3386C] text-white px-6 py-3 rounded-lg hover:bg-[#77536A] font-semibold flex items-center"
                                >
                                    <Printer className="w-5 h-5 mr-2" />
                                    Print Report
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">Click the button above to print the inventory report</p>
                        </div>

                        {/* Printable Content */}
                        <div className="printable-area">
                            <div className="max-w-4xl mx-auto">
                                {/* Report Header */}
                                <div className="text-center mb-8">
                                    <div className="flex items-center justify-center mb-4">
                                        <img src="/Logo.png" alt="UIC Logo" className="w-16 h-16 mr-4"/>
                                        <div>
                                            <h1 className="text-3xl font-bold text-black">UIC MEDICARE</h1>
                                            <p className="text-lg text-gray-700">University of the Immaculate Conception</p>
                                        </div>
                                    </div>
                                    <div className="border-t-2 border-b-2 border-gray-800 py-2">
                                        <h2 className="text-2xl font-bold text-black">INVENTORY REPORT</h2>
                                    </div>
                                    <p className="text-gray-700 mt-2">Generated on: {currentDate}</p>
                                </div>

                                {/* Report Table */}
                                <div className="mb-8">
                                    <table className="w-full border-collapse border border-gray-300">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left text-black font-bold">Medicine Name</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center text-black font-bold">Current Stock</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center text-black font-bold">Expiration Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {printData.map((item, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                    <td className="border border-gray-300 px-4 py-2 text-black">{item.name}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center text-black">{item.stock}</td>
                                                    <td className="border border-gray-300 px-4 py-2 text-center text-black">{item.expiration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Report Footer */}
                                <div className="text-right">
                                    <p className="text-gray-700 mb-2">Prepared by:</p>
                                    <div className="inline-block border-t border-gray-800 pt-2">
                                        <p className="text-black font-bold">John Doe</p>
                                        <p className="text-gray-700">Medical Staff</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default Print;