import React from "react";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, 
  User,
  LayoutDashboard,
  Archive,
  FileText,
  History,
  ShieldQuestion
} from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();

  // Redirect if not logged in
    useEffect(() => {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        navigate("/"); // redirect to login
      }
    }, [navigate]);

    
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
              onClick={() => navigate('/Dashboard')}>
              <LayoutDashboard className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm font-medium text-white">Dashboard</p>
            </div>

            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/Stocks')}>
              <Archive className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">Stocks</p>
            </div>

            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
              onClick={() => navigate('/Reports')}>
              <FileText className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">Reports</p>
            </div>

            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg">
              <History className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">History</p>
            </div>

            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer"
            onClick={() => navigate('/About')}>
              <ShieldQuestion className="w-5 h-5 mr-3 text-white" />
              <p className="text-sm text-white">About</p>
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-6">
          <div className="flex items-center hover:text-white cursor-pointer"
            onClick={() => {
              localStorage.removeItem("isLoggedIn");
              navigate("/");
            }}>
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
          
          
      </div>
    </div>
  );
}
