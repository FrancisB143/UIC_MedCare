// resources/js/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
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
    Users,
    Stethoscope,
    Calendar
} from 'lucide-react';
import { getStudents, getEmployees } from '../data/mockData';

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

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(getCurrentDateTime());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const { date, time } = dateTime;

    const handleNavigation = (path: string): void => {
        console.log('🚀 Navigation requested to:', path);
        try {
            router.visit(path);
            console.log('✅ Navigation request sent successfully');
        } catch (error) {
            console.error('❌ Navigation failed:', error);
            alert('Navigation failed: ' + error);
        }
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Get patient counts
    const students = getStudents();
    const employees = getEmployees();
    const totalPatients = students.length + employees.length;

    // Recent activity mock data
    const recentActivities = [
        { 
            id: 1, 
            patient: "Juan Dela Cruz", 
            type: "Walk-in Consultation", 
            time: "10:30 AM", 
            status: "Completed" 
        },
        { 
            id: 2, 
            patient: "Maria Santos", 
            type: "Scheduled Consultation", 
            time: "9:15 AM", 
            status: "Completed" 
        },
        { 
            id: 3, 
            patient: "Dr. Roberto Garcia", 
            type: "Follow-up", 
            time: "Yesterday", 
            status: "Pending" 
        }
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-20 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
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
                        {/* Dashboard link - Active in Dashboard */}
                        <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/')}>
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

                        <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Print')}>
                            <Printer className="w-5 h-5 text-white flex-shrink-0" />
                            {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Print</p>}
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
                <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20"><Menu className="w-6 h-6" /></button>
                        <div className="flex items-center"><img src="/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/><h1 className="text-white text-[28px] font-semibold">MEDICARE</h1></div>
                        <div className="flex items-center"><Bell className="w-6 h-6 text-white cursor-pointer" /></div>
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

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">{totalPatients}</p>
                                    <p className="text-gray-600">Total Patients</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 text-green-600">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">2</p>
                                    <p className="text-gray-600">Today's Consultations</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center">
                                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-2xl font-bold text-gray-800">1</p>
                                    <p className="text-gray-600">Pending Appointments</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Test Section - Your debugging section */}
                    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-yellow-800 mb-4">🧪 Navigation Test</h2>
                        <p className="text-yellow-700 mb-4">Test sidebar navigation by clicking these buttons. Check the console (F12) for debug info.</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button 
                                onClick={() => handleNavigation('/search/student')}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                🎓 Student Search
                            </button>
                            <button 
                                onClick={() => handleNavigation('/search/employee')}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                💼 Employee Search
                            </button>
                            <button 
                                onClick={() => handleNavigation('/inventory/dashboard')}
                                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                            >
                                📊 Inventory Dashboard
                            </button>
                            <button 
                                onClick={() => handleNavigation('/inventory/stocks')}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                📦 Inventory Stocks
                            </button>
                            <button 
                                onClick={() => handleNavigation('/Reports')}
                                className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                            >
                                📋 Reports
                            </button>
                        </div>
                    </div>

                    {/* Current Consultations */}
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

                    {/* Recent Activity */}
                    <section>
                        <h2 className="text-2xl font-normal text-black mb-4">Recent Activity:</h2>
                        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentActivities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.patient}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.time}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    activity.status === 'Completed' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;