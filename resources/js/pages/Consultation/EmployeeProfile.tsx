// resources/js/pages/Consultation/EmployeeProfile.tsx
import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
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
    Plus,
    MessageSquare
} from 'lucide-react';
import { getPatientById } from '../../data/mockData';

const EmployeeProfile: React.FC = () => {
    // Get the id from Inertia's page props (passed from Laravel controller)
    const { props } = usePage();
    const id = (props as any).id as string;
    
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isSearchOpen, setSearchOpen] = useState(false); 
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('medicalHistory');

    const handleNavigation = (path: string): void => {
        router.visit(path);
    };

    const handleLogout = (): void => {
        router.post('/logout');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Get employee data from centralized mock data
    const employee = id ? getPatientById(id) : undefined;

    if (!employee || employee.type !== 'employee') {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-xl text-gray-600">Employee not found</p>
            </div>
        );
    }

    // Add the type annotation to fix the error
    const tabContent: Record<string, React.ReactNode> = {
        medicalHistory: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Condition</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Diagnosed</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.medicalHistory.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.condition}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.diagnosed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        consultations: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.consultations.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        remarks: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#D4A5B8] text-black">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-black">Note</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {employee.remarks.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{item.date}</td>
                                <td className="px-6 py-4 text-sm text-black">{item.note}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ),
        additionalProfile: (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">First Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.firstName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Middle Initial</p>
                        <p className="font-medium text-black">{employee.additionalProfile.middleInitial}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Suffix</p>
                        <p className="font-medium text-black">{employee.additionalProfile.suffix || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-black">{employee.additionalProfile.dateOfBirth}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Nationality/Citizenship</p>
                        <p className="font-medium text-black">{employee.additionalProfile.nationality}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Civil Status</p>
                        <p className="font-medium text-black">{employee.additionalProfile.civilStatus}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium text-black">{employee.additionalProfile.address}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Name</p>
                        <p className="font-medium text-black">{employee.additionalProfile.guardianName || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Guardian's Contact Number</p>
                        <p className="font-medium text-black">{employee.additionalProfile.guardianContact || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Blood Type</p>
                        <p className="font-medium text-black">{employee.additionalProfile.bloodType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="font-medium text-black">{employee.additionalProfile.height}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Religion/Faith</p>
                        <p className="font-medium text-black">{employee.additionalProfile.religion}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Eye Color</p>
                        <p className="font-medium text-black">{employee.additionalProfile.eyeColor}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Chronic Condition(s)</p>
                        <p className="font-medium text-black">{employee.additionalProfile.chronicConditions.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Known Allergies</p>
                        <p className="font-medium text-black">{employee.additionalProfile.knownAllergies.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Disabilities</p>
                        <p className="font-medium text-black">{employee.additionalProfile.disabilities}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Immunization History</p>
                        <p className="font-medium text-black">{employee.additionalProfile.immunizationHistory.join(", ") || "None"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Genetic Conditions</p>
                        <p className="font-medium text-black">{employee.additionalProfile.geneticConditions}</p>
                    </div>
                </div>
            </div>
        )
    };

    return (
        <>
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

                            {/* Search Submenu - Employee Active */}
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
                                        <div className="flex items-center p-2 bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/search/employee')}>
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

                            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer" onClick={() => handleNavigation('/Chat')}>
                                <MessageSquare className="w-5 h-5 text-white flex-shrink-0" />
                                {isSidebarOpen && <p className="text-sm text-white ml-3 whitespace-nowrap">Chat</p>}
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
                            <div className="flex items-center">
                                <Bell className="w-6 h-6 text-white cursor-pointer mr-4" />
                            </div>
                        </div>
                    </header>

                    {/* Profile Content */}
                    <main className="flex-1 p-6 overflow-y-auto bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-black">Employee Profile: {employee.name}</h1>
                            <button
                                className="bg-[#A3386C] text-white p-2 rounded-full hover:bg-[#77536A] relative group"
                                onClick={() => handleNavigation(`/consultation/employee/${id}/create`)}
                            >
                                <Plus className="w-5 h-5" />
                                <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                                    Add new consultation
                                </span>
                            </button>
                        </div>

                        {/* Employee Info */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-black mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-black">{employee.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium text-black">{employee.age}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium text-black">{employee.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Department</p>
                                    <p className="font-medium text-black">{employee.department}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Position</p>
                                    <p className="font-medium text-black">{employee.position}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Contact</p>
                                    <p className="font-medium text-black">{employee.contact}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-500">Address</p>
                                    <p className="font-medium text-black">{employee.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabbed Interface */}
                        <div className="mb-8">
                            <div className="flex space-x-4 mb-4">
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'medicalHistory' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('medicalHistory')}
                                >
                                    Medical History
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'consultations' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('consultations')}
                                >
                                    Past Consultations
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'remarks' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('remarks')}
                                >
                                    Remark Records
                                </button>
                                <button
                                    className={`px-4 py-2 rounded-lg ${activeTab === 'additionalProfile' ? 'bg-[#D4A5B8] text-black' : 'hover:bg-[#D4A5B8] text-black'}`}
                                    onClick={() => setActiveTab('additionalProfile')}
                                >
                                    Additional Profile
                                </button>
                            </div>
                            <div>{tabContent[activeTab]}</div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};

export default EmployeeProfile;