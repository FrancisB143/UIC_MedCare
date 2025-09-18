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
    Menu,
    MessageSquare
} from 'lucide-react';

const Print: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [activePrintTab, setActivePrintTab] = useState('inventory');

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handlePrint = () => {
        window.print();
    };

    const inventoryData = [
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
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .printable-area, .printable-area * {
                            visibility: visible;
                        }
                        .printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .print-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 14px;
                        }
                        .print-table th,
                        .print-table td {
                            border: 1px solid #333;
                            padding: 12px;
                            text-align: left;
                        }
                        .print-table th {
                            background-color: #f8f9fa;
                            font-weight: 600;
                        }
                        .prescription-print-container {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                            padding: 0;
                        }
                        .prescription-image {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                            margin: 0;
                            padding: 0;
                        }
                    }
                `}
            </style>

            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                    <div className="p-6 mt-4 border-b border-white/20">
                        <div className="flex flex-col items-center mb-2">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div className={`flex flex-col items-center transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                                <p className="text-lg font-semibold">Medical Staff</p>
                                <p className="text-xs text-white/70">Nurse</p>
                            </div>
                        </div>
                        <p className={`text-center text-xs text-white/70 transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>UIC Medical Center</p>
                    </div>

                    <nav className="mt-8">
                        <div className="px-4 space-y-1">
                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/')}>
                                <LayoutDashboard className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <span className="ml-3 text-sm">Dashboard</span>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => setSearchOpen(!isSearchOpen)}>
                                <Search className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && (
                                    <div className="flex justify-between w-full items-center">
                                        <span className="ml-3 text-sm">Patient Search</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                )}
                            </div>
                            {isSidebarOpen && isSearchOpen && (
                                <div className="mt-1 space-y-1 pl-12">
                                    <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/search/student')}>
                                        <GraduationCap className="w-4 h-4 text-white flex-shrink-0" />
                                        <span className="ml-2 text-sm">Students</span>
                                    </div>
                                    <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/search/employee')}>
                                        <Briefcase className="w-4 h-4 text-white flex-shrink-0" />
                                        <span className="ml-2 text-sm">Employees</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => setInventoryOpen(!isInventoryOpen)}>
                                <Archive className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && (
                                    <div className="flex justify-between w-full items-center">
                                        <span className="ml-3 text-sm">Inventory</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isInventoryOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                )}
                            </div>
                            {isSidebarOpen && isInventoryOpen && (
                                <div className="mt-1 space-y-1 pl-12">
                                    <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/inventory/dashboard')}>
                                        <LayoutDashboard className="w-4 h-4 text-white flex-shrink-0" />
                                        <span className="ml-2 text-sm">Dashboard</span>
                                    </div>
                                    <div className="flex items-center p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/inventory/stocks')}>
                                        <Archive className="w-4 h-4 text-white flex-shrink-0" />
                                        <span className="ml-2 text-sm">Stocks</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Reports')}>
                                <FileText className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <span className="ml-3 text-sm">Reports</span>}
                            </div>

                            <div className="flex items-center px-4 py-3 bg-white/20 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Print')}>
                                <Printer className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <span className="ml-3 text-sm font-medium">Print</span>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/About')}>
                                <ShieldQuestion className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <span className="ml-3 text-sm">About</span>}
                            </div>

                            <div className="flex items-center px-4 py-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" onClick={() => handleNavigation('/Chat')}>
                                <MessageSquare className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <span className="ml-3 text-sm">Chat</span>}
                            </div>
                        </div>
                    </nav>

                    <div className="absolute bottom-6 left-0 right-0 px-4">
                        <div className={`flex items-center p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors ${!isSidebarOpen && 'justify-center'}`} onClick={handleLogout}>
                            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
                                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
                            </svg>
                            {isSidebarOpen && <span className="ml-3 text-sm">Logout</span>}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    {/* Header */}
                    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Menu className="w-6 h-6 text-gray-600" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <img src="/Logo.png" alt="UIC Logo" className="w-10 h-10" />
                                <h1 className="text-2xl font-bold text-gray-800">MEDICARE</h1>
                            </div>
                            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <Bell className="w-6 h-6 text-gray-600" />
                            </button>
                        </div>
                    </header>

                    {/* Print Content */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Print Documents</h1>
                                        <p className="text-gray-600">Select document type to print</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                                                activePrintTab === 'inventory' 
                                                    ? 'bg-[#A3386C] text-white shadow-sm' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            onClick={() => setActivePrintTab('inventory')}
                                        >
                                            Inventory Report
                                        </button>
                                        <button
                                            className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                                                activePrintTab === 'prescription' 
                                                    ? 'bg-[#A3386C] text-white shadow-sm' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            onClick={() => setActivePrintTab('prescription')}
                                        >
                                            Prescription
                                        </button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    {activePrintTab === 'inventory' ? (
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Inventory Report</h2>
                                                    <p className="text-gray-600">Generated on: {currentDate}</p>
                                                </div>
                                                <button 
                                                    onClick={handlePrint}
                                                    className="flex items-center gap-2 bg-[#A3386C] hover:bg-[#8a2f58] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print Report
                                                </button>
                                            </div>

                                            <div className="overflow-hidden rounded-lg border border-gray-200">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine Name</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {inventoryData.map((item, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock} units</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expiration}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                                <div>
                                                    <h2 className="text-xl font-semibold text-gray-900">Prescription</h2>
                                                    <p className="text-gray-600">Print prescription form</p>
                                                </div>
                                                <button 
                                                    onClick={handlePrint}
                                                    className="flex items-center gap-2 bg-[#A3386C] hover:bg-[#8a2f58] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                    Print Prescription
                                                </button>
                                            </div>

                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                                                <div className="mb-4">
                                                    <Printer className="w-12 h-12 text-gray-400 mx-auto" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Prescription Form Ready</h3>
                                                <p className="text-gray-600 mb-4">Click print to continue.</p>
                                                <div className="text-sm text-gray-500">
                                                    <p>Official Rx Prescription format</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Print Area - Only visible during printing */}
            <div className="printable-area">
                {activePrintTab === 'inventory' ? (
                    <div className="p-8">
                        <h1 className="text-2xl font-bold text-center mb-2">Inventory Report</h1>
                        <p className="text-center text-gray-600 mb-6">Generated on: {currentDate}</p>
                        <table className="print-table">
                            <thead>
                                <tr>
                                    <th>Medicine Name</th>
                                    <th>Current Stock</th>
                                    <th>Expiration Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.name}</td>
                                        <td>{item.stock} units</td>
                                        <td>{item.expiration}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="prescription-print-container">
                        <img 
                            src="/rx-prescription.png" 
                            alt="Prescription"
                            className="prescription-image"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/rx-prescription.png';
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
};

export default Print;