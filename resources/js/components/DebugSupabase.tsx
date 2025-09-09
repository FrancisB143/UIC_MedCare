import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const DebugSupabase: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [email, setEmail] = useState('');

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);
      
      setResults({ type: 'connection', data, error });
    } catch (err) {
      setResults({ type: 'connection', error: err });
    }
  };

  const testSpecificEmail = async () => {
    if (!email) return;
    
    try {
      // Test exact email query
      const exactQuery = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      // Test case-insensitive email query
      const caseInsensitiveQuery = await supabase
        .from('users')
        .select('*')
        .ilike('email', email);
      
      // Test partial match to see if there are similar emails
      const partialQuery = await supabase
        .from('users')
        .select('*')
        .ilike('email', `%${email.split('@')[0]}%`);
      
      setResults({ 
        type: 'email', 
        email, 
        exactMatch: exactQuery,
        caseInsensitive: caseInsensitiveQuery,
        partialMatch: partialQuery
      });
    } catch (err) {
      setResults({ type: 'email', email, error: err });
    }
  };

  const testBranches = async () => {
    try {
      // Test branches table with your actual column names
      const { data, error } = await supabase
        .from('branches')
        .select('branch_id, branch_name');
      
      setResults({ type: 'branches', data, error });
    } catch (err) {
      setResults({ type: 'branches', error: err });
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Supabase Debug Tool</h2>
      
      <div className="space-y-4">
        <button 
          onClick={testConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Connection (Show All Users)
        </button>
        
        <button 
          onClick={testBranches}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Branches Table
        </button>
        
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to test"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button 
            onClick={testSpecificEmail}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Test Specific Email
          </button>
        </div>
      </div>

      {results && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
