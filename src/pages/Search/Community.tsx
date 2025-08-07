import React, { useState } from 'react';

const Community: React.FC = () => {
    return <div className="bg-white flex flex-row justify-center w-full h-screen">
      <div className="relative w-full h-full max-w-[1550px]">
        <div className="relative h-full bg-[url(/UIC.png)] bg-cover bg-[50%_50%]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,72,100,0.5)_0%,rgba(255,160,173,0.5)_100%)]" />

          <div className="absolute w-[140px] h-[140px] top-[29px] left-1/2 -translate-x-1/2 bg-white rounded-full flex items-center justify-center">
            <img
              className="w-35 h-35 object-cover"
              alt="UIC logo"
              src="/Logo.png"
            />
          </div>

          <div className="absolute top-[180px] left-1/2 -translate-x-1/2 text-center">
            <h1 className="italic text-white text-[50px]">
              MEDITRACK
            </h1>
            <h2 className="font-extrabold text-white text-3xl tracking-[0] leading-normal mt-3">
              MEDICINE INVENTORY SYSTEM
            </h2>
          </div>

          <form>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-5">
              <div className="flex flex-col gap-9 w-[401px]">
                <div className="space-y-2">
                  <input 
                  type="email"
                  placeholder="USERNAME / EMAIL" 
                  className="
                  placeholder:text-[#ffffffe6]
                  w-full h-8 bg-transparent border-0 border-b border-white focus:border-white focus:outline-none rounded-none px-0 text-white" 
                  />
                </div>
                <div className="space-y-2">
                  <input 
                  type="password" 
                  placeholder="PASSWORD"
                  className="
                  placeholder:text-[#ffffffe6]
                  w-full h-8 bg-transparent border-0 border-b border-white focus:border-white focus:outline-none rounded-none px-0 text-white" 
                  />
                </div>
                <div className="flex justify-center mt-6">
                  <button 
                  type="submit"
                  className="w-[210px] h-[53px] bg-white hover:bg-white/90 rounded-[10px] font-extrabold text-[#a3386c] text-[15px] cursor-pointer transition-colors">
                    LOGIN
                  </button>
                </div>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>;
};

export default Community;