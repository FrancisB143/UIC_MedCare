import React from "react";
import { useNavigate } from 'react-router-dom';
import { Bell, User, AlertTriangle } from 'lucide-react';

export default function Stocks() {
  const navigate = useNavigate();

  // Data for clinic branches - all data is contained within the component
  const clinicBranches = [
    {
      id: 1,
      name: "Fr Selga Campus, Davao City, Philippines",
      suffix: "",
    },
    {
      id: 2,
      name: "Bonifacio Campus, Davao City, Philippines",
      suffix: "",
    },
    {
      id: 3,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(SHS)",
    },
    {
      id: 4,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(JHS)",
    },
    {
      id: 5,
      name: "Bajada Campus, Davao City, Philippines",
      suffix: "(ELEM)",
    },
  ];

  // Get current date and time
  const getCurrentDateTime = () => {
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
  };

  const { date, time } = getCurrentDateTime();

  const handleViewClick = (branchId) => {
    console.log(`Viewing branch with ID: ${branchId}`);
    // Add your navigation logic here
  };

  const handleRequestMedicine = () => {
    console.log("Request medicine clicked");
    // Add your request medicine logic here
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Add your logout logic here
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white z-10">
        {/* Profile */}
        <div className="p-6 mt-4 border-b border-white">
          <div className="flex flex-col items-center mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-purple-800" />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[20px] font-semibold">John Doe</p>
              <p className="text-sm">Nurse</p>
            </div>
          </div>
          <p className="text-center text-xs">Fr Selga, Davao City, Philippines</p>
        </div>

        {/* Navigation */}
        <nav className="mt-10">
          <div className="px-4 space-y-6">
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
                onClick={() => navigate('/')}>
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
            
            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg">
                <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
                </div>
                <p className="text-sm">Stocks</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/Reports')}>
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">Reports</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/History')}>
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">History</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/About')}>
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">About</p>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div onClick={handleLogout} className="absolute bottom-6 left-6">
          <div className="flex items-center hover:text-white cursor-pointer">
            <div className="w-5 h-5 mr-3">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
                <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
              </svg>
            </div>
            <p className="text-sm">Logout</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-b from-[#3D1528] to-[#A3386C] shadow-sm border-b border-gray-200 px-7 py-3">
          <div className="flex items-center justify-between">
            <span></span>
            <div className="flex items-center">
              <img src="Logo.png" alt="UIC Logo" className="w-15 h-15 mr-2"/>
              <h1 className="text-white text-[28px] font-semibold">MEDITRACK</h1>
            </div>
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-white cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Main Dashboard Container */}
          <div className="bg-white main-dashboard px-20 py-6">
            {/* Date and Time */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <h2 className="font-normal text-[25px] text-black">{date}</h2>
                <p className="mt-2 font-normal text-black text-xl">{time}</p>
                <div className="w-[190px] h-0.5 mt-4 bg-[#A3386C]"></div>
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
                    <button onClick={() => handleViewClick(branch.id)}
                      className="w-[90px] h-[40px] mr-7 bg-[#a3386c] hover:bg-[#8a2f5a] rounded-[10px] text-l font-semibold text-white transition-colors duration-200 cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Medicine Button */}
            <div className="flex justify-end mt-8">
              <button onClick={handleRequestMedicine}
                className="w-[180px] h-[40px] border border-solid border-[#a3386c] hover:bg-[#a3386c] hover:text-white rounded-[10px] text-l font-semibold text-[#a3386c] transition-colors duration-200 cursor-pointer"
              >
                Request Medicine
              </button>
            </div>
          </div>
          
      </div>
    </div>
  );
}
