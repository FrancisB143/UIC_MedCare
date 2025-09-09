import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { UserService } from "../services/userService";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../lib/supabaseClient";

interface GoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export default function Login() {
  // State to handle loading and display errors to the user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugResult, setDebugResult] = useState<any>(null);

  // Direct test function
  const testDirectQuery = async () => {
    try {
      console.log('Testing direct Supabase query...');
      
      // Test basic connection
      const allUsers = await supabase.from('users').select('*');
      console.log('All users query:', allUsers);
      
      // Test with count to see if there are any rows at all
      const userCount = await supabase.from('users').select('*', { count: 'exact', head: true });
      console.log('User count query:', userCount);
      
      // Test if we can access the table schema
      const tableInfo = await supabase.rpc('get_table_info', { table_name: 'users' }).single();
      console.log('Table info:', tableInfo);
      
      // Try different possible table names
      const possibleTables = ['users', 'Users', 'user', 'User'];
      const tableTests: any = {};
      
      for (const tableName of possibleTables) {
        try {
          const result = await supabase.from(tableName).select('*').limit(1);
          tableTests[tableName] = result;
        } catch (err) {
          tableTests[tableName] = { error: err };
        }
      }
      
      // Test specific email
      const testEmail = 'fbangoy_230000001354@uic.edu.ph';
      const exactMatch = await supabase.from('users').select('*').eq('email', testEmail);
      console.log('Exact match query:', exactMatch);
      
      setDebugResult({
        allUsers: allUsers,
        userCount: userCount,
        tableInfo: tableInfo,
        tableTests: tableTests,
        exactMatch: exactMatch,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      });
      
    } catch (err) {
      console.error('Direct test error:', err);
      setDebugResult({ error: err });
    }
  };

  // Handle Google login success
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try { 
      // A safety check to ensure the credential exists
      if (!credentialResponse.credential) {
        throw new Error("Login failed: Credential not found.");
      }

      // Decode the Google JWT token to get user info
      const googleUser: GoogleUser = jwtDecode(credentialResponse.credential);
      console.log('Google user email:', googleUser.email);

      // Verify user exists in database based on email only
      const userData = await UserService.verifyUserAccess(googleUser.email);
      console.log('User found in database:', userData);

      // Create a Supabase session using email/password method
      // For simplicity, we'll use the email as both username and password
      // This creates a proper Supabase session for database operations
      try {
        // First, try to sign in with existing account
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: googleUser.email,
          password: googleUser.email // Using email as password for simplicity
        });

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // If user doesn't exist in Supabase auth, create them
          console.log('Creating new Supabase user...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: googleUser.email,
            password: googleUser.email, // Using email as password
            options: {
              data: {
                name: googleUser.name,
                user_id: userData.user_id,
                branch_id: userData.branch_id
              }
            }
          });

          if (signUpError) {
            console.error('Supabase signup error:', signUpError);
            // If signup fails, continue without Supabase session
          } else {
            console.log('Supabase user created successfully');
          }
        } else if (signInError) {
          console.error('Supabase signin error:', signInError);
          // Continue without Supabase session
        } else {
          console.log('Supabase session created successfully');
        }
      } catch (supabaseError) {
        console.warn('Supabase authentication failed, continuing with local session:', supabaseError);
      }

      // Store user session
      UserService.storeUserSession(userData);

      // Also try to store in Laravel session for compatibility
      try {
        const sessionResponse = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            token: credentialResponse.credential,
            userData: userData
          }),
        });
        
        if (!sessionResponse.ok) {
          console.warn("Laravel session creation failed, but continuing with client-side auth");
        }
      } catch (sessionError) {
        console.warn("Laravel session error:", sessionError);
      }

      // Redirect to dashboard
      router.visit("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login error
  const handleGoogleError = () => {
    setError("Google sign-in was unsuccessful. Please try again.");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full h-screen">
      <div className="relative w-full h-full max-w-[1550px]">
        <div className="relative h-full bg-[url(/images/UIC.png)] bg-cover bg-[50%_50%]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,72,100,0.5)_0%,rgba(255,160,173,0.5)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
            <img
              className="w-[125px] h-[125px] object-cover mb-6"
              alt="UIC logo"
              src="/images/Logo.png"
            />
            <h1 className="italic text-white text-[50px] text-center">MEDITRACK</h1>
            <h2 className="font-extrabold text-white text-3xl tracking-[0] leading-normal mt-3 mb-8 text-center">
              MEDICINE INVENTORY SYSTEM
            </h2>
            
            {/* Display loading or error states */}
            {isLoading ? (
              <div className="text-white text-lg font-semibold my-4">Signing in...</div>
            ) : (
              <div className="my-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 max-w-sm text-center bg-red-800 bg-opacity-70 text-white font-semibold rounded-md">
                {error}
              </div>
            )}

            <p className="mt-6 text-white text-lg font-semibold text-center">
              Sign in with your UIC Google Account
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className="px-6 py-2 bg-white text-[#A3386C] font-semibold rounded shadow hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => router.visit("/dashboard")}
                disabled={isLoading}
              >
                Skip
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded shadow hover:bg-blue-600 transition"
                onClick={testDirectQuery}
              >
                Debug Test
              </button>
            </div>
            
            {debugResult && (
              <div className="mt-4 p-3 max-w-lg bg-black bg-opacity-70 text-white text-xs rounded-md overflow-auto max-h-40">
                <pre>{JSON.stringify(debugResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}