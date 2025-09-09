# Supabase Integration Guide

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Get Your Credentials
1. Go to Project Settings > API
2. Copy your Project URL and anon/public key
3. Update your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Set Up Database Tables
1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL script from `database/supabase_setup.sql`
3. This will create all necessary tables and sample data

### 4. Configure Authentication (Optional)
1. Go to Authentication > Settings in Supabase dashboard
2. Configure your site URL: `http://localhost:8000`
3. Add redirect URLs if needed

## Usage Examples

### Authentication
```tsx
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

function MyComponent() {
  const { user, signIn, signOut, loading } = useSupabaseAuth();

  const handleLogin = async () => {
    const { data, error } = await signIn('user@example.com', 'password');
    if (error) console.error('Login failed:', error.message);
  };

  if (loading) return <div>Loading...</div>;
  if (user) return <div>Welcome, {user.email}!</div>;
  return <button onClick={handleLogin}>Sign In</button>;
}
```

### Medicine Management
```tsx
import { MedicineService } from '../services/medicineService';

function MedicineList() {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const data = await MedicineService.getMedicinesByBranch(1);
        setMedicines(data);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      }
    };

    fetchMedicines();
  }, []);

  const addMedicine = async (medicineData) => {
    try {
      const newMedicine = await MedicineService.addMedicine(medicineData);
      setMedicines([...medicines, newMedicine]);
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
  };

  return (
    <div>
      {medicines.map(medicine => (
        <div key={medicine.id}>{medicine.name}</div>
      ))}
    </div>
  );
}
```

### Real-time Updates
```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function RealTimeMedicines() {
  const [medicines, setMedicines] = useState([]);

  useEffect(() => {
    // Initial fetch
    const fetchMedicines = async () => {
      const { data } = await supabase.from('medicines').select('*');
      setMedicines(data || []);
    };

    fetchMedicines();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('medicines')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'medicines' },
        (payload) => {
          console.log('Change received!', payload);
          // Handle the change (insert, update, delete)
          if (payload.eventType === 'INSERT') {
            setMedicines(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMedicines(prev => prev.map(med => 
              med.id === payload.new.id ? payload.new : med
            ));
          } else if (payload.eventType === 'DELETE') {
            setMedicines(prev => prev.filter(med => med.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      {medicines.map(medicine => (
        <div key={medicine.id}>{medicine.name} - Stock: {medicine.stock}</div>
      ))}
    </div>
  );
}
```

## Migration from Local Data

To migrate from your current local data structure to Supabase:

1. **Update your existing components** to use `MedicineService` instead of local data
2. **Replace imports** like:
   ```tsx
   // Old
   import { medicines } from '../data/branchMedicines';
   
   // New
   import { MedicineService } from '../services/medicineService';
   ```

3. **Replace state management** with Supabase calls:
   ```tsx
   // Old
   const [medicines] = useState(localMedicineData);
   
   // New
   const [medicines, setMedicines] = useState([]);
   useEffect(() => {
     MedicineService.getMedicinesByBranch(branchId)
       .then(setMedicines)
       .catch(console.error);
   }, [branchId]);
   ```

## Security Considerations

1. **Row Level Security (RLS)** is enabled on all tables
2. **Policies** restrict access to authenticated users only
3. **Environment variables** keep your API keys secure
4. **Never commit** your `.env` file to version control

## Next Steps

1. Update your `.env` file with actual Supabase credentials
2. Run the SQL setup script in your Supabase dashboard
3. Start migrating your components to use Supabase services
4. Test authentication and data operations
5. Set up real-time subscriptions where needed

## Troubleshooting

- **401 Unauthorized**: Check your API keys and RLS policies
- **Connection errors**: Verify your project URL and network connection
- **Type errors**: Ensure your TypeScript types match your database schema
- **Real-time not working**: Check if you've subscribed to the correct table/channel
