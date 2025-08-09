import React from "react";
import { router } from "@inertiajs/react";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (data.status === "success") {
        localStorage.setItem("isLoggedIn", "true");
        router.visit("/dashboard");
      } else {
        alert("Google login failed. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    alert("Google sign-in was unsuccessful. Please try again.");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full h-screen">
      <div className="relative w-full h-full max-w-[1550px]">
        <div className="relative h-full bg-[url(/images/UIC.png)] bg-cover bg-[50%_50%]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,72,100,0.5)_0%,rgba(255,160,173,0.5)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <img
              className="w-[120px] h-[125px] object-cover mb-6"
              alt="UIC logo"
              src="/images/Logo.png"
            />
            <h1 className="italic text-white text-[50px]">MEDITRACK</h1>
            <h2 className="font-extrabold text-white text-3xl tracking-[0] leading-normal mt-3 mb-8">
              MEDICINE INVENTORY SYSTEM
            </h2>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
            />
            <p className="mt-6 text-white text-lg font-semibold">
              Sign in with your UIC Google Account
            </p>
            <button
              className="mt-4 px-6 py-2 bg-white text-[#A3386C] font-semibold rounded shadow hover:bg-gray-100 transition"
              onClick={() => router.visit("/dashboard")}
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}