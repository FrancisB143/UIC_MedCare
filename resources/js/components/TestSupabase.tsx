import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface TestSupabaseProps {}

const TestSupabase: React.FC<TestSupabaseProps> = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test 1: Fetch branches
      console.log('Testing Supabase connection...');
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');

      if (branchesError) {
        throw new Error(`Branches error: ${branchesError.message}`);
      }

      setBranches(branchesData || []);
      console.log('Branches fetched:', branchesData);

      // Test 2: Fetch medicines
      const { data: medicinesData, error: medicinesError } = await supabase
        .from('medicines')
        .select('*')
        .limit(10);

      if (medicinesError) {
        throw new Error(`Medicines error: ${medicinesError.message}`);
      }

      setMedicines(medicinesData || []);
      console.log('Medicines fetched:', medicinesData);

      console.log('✅ Supabase connection successful!');
    } catch (err) {
      console.error('❌ Supabase connection failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Testing Supabase Connection...</h2>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg border border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Connection Failed</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={testSupabaseConnection}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-green-50 rounded-lg border border-green-200">
      <h2 className="text-xl font-semibold mb-4 text-green-800">✅ Supabase Connected Successfully!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Branches ({branches.length})</h3>
          <div className="space-y-2">
            {branches.map((branch) => (
              <div key={branch.id} className="p-3 bg-white rounded border">
                <div className="font-medium">{branch.name}</div>
                <div className="text-sm text-gray-600">{branch.suffix}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Medicines ({medicines.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {medicines.map((medicine) => (
              <div key={medicine.id} className="p-3 bg-white rounded border">
                <div className="font-medium">{medicine.name}</div>
                <div className="text-sm text-gray-600">
                  {medicine.category} • Stock: {medicine.stock} • Branch: {medicine.branch_id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={testSupabaseConnection}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Refresh Data
      </button>
    </div>
  );
};

export default TestSupabase;
