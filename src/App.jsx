import React from 'react';
import { Bell, User, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

export default function MeditrackDashboard() {
  return (
    <div className="flex h-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#3D1528] to-[#A3386C] text-white">
        {/* User Profile */}
        <div className="p-6 border-b border-white">
          <div className="flex flex-col items-center mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-purple-800" />
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-semibold">John Doe</h3>
              <p className="text-sm">Nurse</p>
            </div>
          </div>
          <p className="text-center text-xs">Fr Selga, Davao City, Philippines</p>
        </div>

        {/* Navigation */}
        <nav className="mt-10">
          <div className="px-4 space-y-4">
            <div className="flex items-center px-4 py-3 bg-[#77536A] rounded-lg">
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm font-medium">Dashboard</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer">
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">Stocks</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer">
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">Reports</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer">
              <div className="w-5 h-5 mr-3 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-purple-800 rounded-sm"></div>
              </div>
              <p className="text-sm">History</p>
            </div>
            
            <div className="flex items-center px-4 py-3 hover:bg-[#77536A] rounded-lg cursor-pointer">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <div className="w-8 h-8 bg-purple-800 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MT</span>
                </div>
              </div>
              <h1 className="text-xl font-semibold text-gray-800">MEDITRACK</h1>
            </div>
            <div className="flex items-center">
              <Bell className="w-6 h-6 text-gray-600 cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Date/Time */}
        <div className="bg-white px-6 py-4 border-b ">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">April 1, 2025</h2>
            <p className="text-gray-600">1:37:50 P.M</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Soon-to-Expire Medications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-center text-gray-800 mb-4">Soon-to-Expire Medications</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Decolgen Forte 25mg / 2mg / 500mg</span>
                  <span className="text-sm text-gray-600">2025-05-11</span>
                </div>
                <div className="flex items-center justify-center mt-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">0</div>
                    <div className="text-sm text-gray-600">Out of Stock</div>
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mt-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Stock Level */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Inventory Stock Level</h3>
              <div className="mb-4">
                <span className="text-sm text-gray-600">Stock Status</span>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Stock Count</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">HIGH</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Overview</h3>
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Recent Stock Received</h4>
                <p className="text-sm text-gray-600 mb-4">Medicine Information</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-sm font-medium text-gray-600 py-2">MEDICINE NAME</th>
                        <th className="text-right text-sm font-medium text-gray-600 py-2">DATE RECEIVED</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-sm text-gray-800 py-2">RITEMED Paracetamol 500mg</td>
                        <td className="text-sm text-gray-800 py-2 text-right">2027-03-25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Common Seasonal Illnesses */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Common Seasonal Illnesses</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Fever</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Cold & Flu</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Allergies</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600 italic">Check stocks regularly during peak seasons.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}