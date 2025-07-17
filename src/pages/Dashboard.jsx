import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, AlertTriangle } from 'lucide-react';

export default function MeditrackDashboard() {
  const navigate = useNavigate();

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
            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg">
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
                onClick={() => navigate('/Stocks')}>
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
        <div className="absolute bottom-6 left-6">
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
          <div className="bg-white main-dashboard p-6">
            {/* Date and Time */}
            <div className="flex justify-center mb-4">
              <div className="flex flex-col items-center">
                <h2 className="font-normal text-[25px] text-black">{date}</h2>
                <p className="mt-2 font-normal text-black text-xl">{time}</p>
                <div className="w-[190px] h-0.5 mt-4 bg-[#A3386C]"></div>
              </div>
            </div>

            {/* Dashboard Title */}
            <div className="mb-6">
              <h2 className="font-normal text-black text-[32px]">Dashboard</h2>
            </div>

            <div className="w-full h-px bg-[#A3386C] mb-6"></div>

            {/* Dashboard Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Soon-to-Expire Medications Card */}
                <div className="border border-[#A3386C] py-4">
                  <h3 className="font-normal text-black text-lg mb-4 text-center">Soon-to-Expire Medications</h3>
                  <div className="w-full h-px bg-[#A3386C] mb-4"></div>
                  <div className="flex">
                    <div className="flex-1 border-r border-[#A3386C] py-2">
                      <p className="font-medium text-black text-sm text-center">DECOLGEN Forte 25mg / 2mg / 500mg</p>
                    </div>
                    <div className="flex-1 py-2">
                      <p className="font-medium text-black text-sm text-center">2025-05-11</p>
                    </div>
                  </div>
                </div>

                {/* Out of Stock Card */}
                <div className="border border-[#A3386C] bg-white px-6 py-4">
                  <div className="flex items-center">
                    <span className="font-bold text-black text-2xl">0</span>
                    <AlertTriangle className="w-[21px] h-[22px] ml-12 text-amber-500" />
                  </div>
                  <p className="mt-2 font-normal text-black text-base">Out of Stock</p>
                </div>
              </div>

              {/* Right Column - Inventory Stock Level Card */}
              <div className="flex flex-col justify-center border border-[#a3386c] p-6">
                <h3 className="font-normal text-black text-2xl mb-4">Inventory Stock Level</h3>
                <p className="font-light text-black text-base mb-6">Stock Status</p>
                <div className="w-full">
                  <table className="w-full table-fixed border border-[#a3386c]">
                    <thead>
                      <tr>
                        <th className="w-1/2 text-xs font-semibold text-center border border-[#A3386C] py-3">
                          Current Stock Count
                        </th>
                        <th className="w-1/2 text-xs font-normal text-[#008000] text-center border border-[#A3386C] py-3">
                          HIGH
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-[#A3386C] mb-6"></div>

            {/* Overview Title */}
            <div className="mb-6">
              <h2 className="font-normal text-black text-[32px]">Overview</h2>
            </div>

            {/* Overview Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Stock Received Card */}
              <div className="border border-[#a3386c] bg-white p-6">
                <h3 className="font-normal text-black text-base mb-2">Recent Stock Received</h3>
                <p className="font-light text-black text-sm mb-6">Medicine Information</p>
                <div className="w-full">
                  <table className="w-full border border-[#a3386c]">
                    <thead>
                      <tr>
                        <th className="text-xs font-extrabold text-black text-center border border-[#a3386c] p-2">MEDICINE NAME</th>
                        <th className="text-xs font-extrabold text-black text-center border border-[#a3386c] p-2">DATE RECEIVED</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-sm font-normal text-black text-center border border-[#a3386c] p-2">RITEMED Paracetamol 500mg</td>
                        <td className="text-sm font-medium text-black text-center border border-[#a3386c] p-2">2027-03-25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Seasonal Illnesses Card */}
              <div className="border border-[#a3386c] bg-white p-6">
                <h3 className="font-normal text-black text-base mb-4">Common Seasonal Illnesses</h3>
                <div className="w-full h-px bg-gray-300 mb-4"></div>

                <div className="space-y-0">
                  <div className="border-b border-[#a3386c]">
                    <div className="py-2 px-3 flex items-center justify-between cursor-pointer">
                      <span className="font-normal text-black text-base">Fever</span>
                      <img className="w-[18px] h-[18px]" alt="Arrow" src="/up-arrow.png" />
                    </div>
                  </div>
                  <div className="border-b border-[#a3386c]">
                    <div className="py-2 px-3 flex items-center justify-between cursor-pointer">
                      <span className="font-normal text-black text-base">Cold & Flu</span>
                      <img className="w-[18px] h-[18px]" alt="Arrow" src="/up-arrow.png" />
                    </div>
                  </div>
                  <div className="border-b border-[#a3386c]">
                    <div className="py-2 px-3 flex items-center justify-between cursor-pointer">
                      <span className="font-normal text-black text-base">Allergies</span>
                      <img className="w-[18px] h-[18px]" alt="Arrow" src="/down-arrow.png" />
                    </div>
                  </div>
                </div>

                <p className="mt-6 font-normal italic text-[#ff0000] text-[13px]">Check stocks regularly during peak seasons.</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}