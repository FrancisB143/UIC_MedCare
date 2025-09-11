// src/pages/Search/WalkIn.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    User,
    Bell,
    LayoutDashboard,
    Search,
    Archive,
    FileText,
    Printer,
    ShieldQuestion,
    GraduationCap,
    Briefcase,
    History,
    ChevronDown,
    Menu
} from 'lucide-react';
import { getPatientById, addConsultation, addRemark } from '../../data/mockData';

const WalkIn: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    // Sidebar states
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    
    // Form states
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [referToDoctor, setReferToDoctor] = useState(false);
    const [bloodPressure, setBloodPressure] = useState('');
    const [pulse, setPulse] = useState('');
    const [temperature, setTemperature] = useState('');
    const [weight, setWeight] = useState('');
    const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState('');
    const [complaints, setComplaints] = useState('');
    const [remarks, setRemarks] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        // Set current date and time
        const now = new Date();
        setDate(now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        }));
        setTime(now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        }));
        
        // Get patient data
        if (id) {
            const patientData = getPatientById(id);
            if (patientData) {
                setPatient(patientData);
            }
        }
    }, [id]);

    const handleNavigation = (path: string): void => {
        navigate(path);
    };

    const handleLogout = (): void => {
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!id || !patient) return;
        
        // Create consultation record
        const consultationRecord = {
            date: date,
            notes: complaints
        };
        
        // Create remark record
        const remarkRecord = {
            date: date,
            note: remarks || `BP: ${bloodPressure}, Pulse: ${pulse}, Temp: ${temperature}°C, Weight: ${weight}kg${referToDoctor ? ', Referred to Doctor' : ''}`
        };
        
        // Add records to mock data
        addConsultation(id, consultationRecord);
        addRemark(id, remarkRecord);
        
        // Show success message
        setShowSuccess(true);
        
        // Hide success message after 2 seconds and navigate
        setTimeout(() => {
            setShowSuccess(false);
            // Navigate back to the correct profile page
            if (patient.type === 'student') {
                navigate(`/search/student/${id}`);
            } else {
                navigate(`/search/employee/${id}`);
            }
        }, 2000);
    };

    if (!patient) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Patient not found</p>
            </div>
        );
    }

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
                        <button onClick={toggleSidebar} className="text-white p-2 rounded-full hover:bg-white/20">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center">
                            <img src="/Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
                            <h1 className="text-white text-[28px] font-semibold">MEDICARE</h1>
                        </div>
                        <div className="w-6 h-6"></div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-white">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Walk-in Consultation - {patient.name}
                    </h1>
                    
                    {/* Success Message */}
                    {showSuccess && (
                        <div className="fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
                            Consultation Submitted!
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Date
                                </label>
                                <input
                                    type="text"
                                    value={date}
                                    readOnly
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Time
                                </label>
                                <input
                                    type="text"
                                    value={time}
                                    readOnly
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </div>
                        </div>

                        {/* Refer to Doctor */}
                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={referToDoctor}
                                    onChange={(e) => setReferToDoctor(e.target.checked)}
                                    className="w-5 h-5 text-[#A3386C] rounded focus:ring-[#A3386C]"
                                />
                                <span className="ml-2 text-gray-700 font-bold">Refer to Doctor?</span>
                            </label>
                        </div>

                        {/* Vital Signs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Blood Pressure
                                </label>
                                <input
                                    type="text"
                                    value={bloodPressure}
                                    onChange={(e) => setBloodPressure(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                    placeholder="e.g., 120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Pulse (BPM)
                                </label>
                                <input
                                    type="number"
                                    value={pulse}
                                    onChange={(e) => setPulse(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                    placeholder="e.g., 72"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Temperature (°C)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                    placeholder="e.g., 36.5"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                    placeholder="e.g., 65.5"
                                />
                            </div>
                        </div>

                        {/* Last Menstrual Period (only for females) */}
                        {patient.gender === 'Female' && (
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Last Menstrual Period
                                </label>
                                <input
                                    type="date"
                                    value={lastMenstrualPeriod}
                                    onChange={(e) => setLastMenstrualPeriod(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                />
                            </div>
                        )}

                        {/* Complaints */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Complaints
                            </label>
                            <textarea
                                value={complaints}
                                onChange={(e) => setComplaints(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                rows={3}
                                required
                            />
                        </div>

                        {/* Remarks */}
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Remarks
                            </label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A3386C]"
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#A3386C] text-white px-6 py-3 rounded-lg hover:bg-[#77536A] font-semibold"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default WalkIn;