import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { residentService } from '../services/residentService';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null); // 'admin' or 'resident'
    const [residentData, setResidentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current session
        const initSession = async () => {
            try {
                // First check for resident in localStorage (offline/demo capability)
                const localResident = localStorage.getItem('resident');
                if (localResident) {
                    const data = JSON.parse(localResident);
                    setResidentData(data);
                    setRole('resident');
                    setUser({ email: data.email });
                    setLoading(false);
                }

                // Add a timeout to the Supabase call to prevent hanging indefinitely
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase connection timeout')), 5000)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
                await processSession(session);

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
                    await processSession(newSession);
                });

                return () => subscription.unsubscribe();
            } catch (err) {
                console.error("Initialization error (likely Supabase connection):", err);
                // Even on error, we stop loading so the UI can render
                setLoading(false);
            }
        };

        initSession();
    }, []);

    const processSession = async (session) => {
        // If we already have a resident role from localStorage and no admin session, don't reset
        if (!session?.user) {
            const localResident = localStorage.getItem('resident');
            const localAdmin = localStorage.getItem('adminUser');
            
            if (localAdmin) {
                const data = JSON.parse(localAdmin);
                setUser(data);
                setRole('admin');
                setLoading(false);
                return;
            }

            if (!localResident) {
                setUser(null);
                setRole(null);
                setResidentData(null);
            }
            setLoading(false);
            return;
        }

        const currentUser = session.user;
        setUser(currentUser);

        // For Supabase sessions, we check if it's a resident or admin
        try {
            const { data: resident } = await supabase
                .from('residents')
                .select('*')
                .eq('email', currentUser.email)
                .maybeSingle();

            if (resident) {
                setRole('resident');
                setResidentData(resident);
                localStorage.setItem('resident', JSON.stringify(resident));
            } else {
                setRole('admin');
                setResidentData(null);
            }
        } catch (err) {
            console.error("Error fetching resident contextual data", err);
            setRole('admin');
            setResidentData(null);
        }

        setLoading(false);
    };

    const loginAsResident = (data) => {
        setResidentData(data);
        setRole('resident');
        setUser({ email: data.email });
        localStorage.setItem('resident', JSON.stringify(data));
    };

    const loginAsAdmin = (email) => {
        const adminUser = { email };
        setUser(adminUser);
        setRole('admin');
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
    };

    const logout = async () => {
        try {
            const isMockMode = localStorage.getItem('adminUser') !== null;
            if (!isMockMode) {
                // Add a short timeout to prevent hanging when offline
                const signoutPromise = supabase.auth.signOut();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));
                await Promise.race([signoutPromise, timeoutPromise]);
            }
        } catch (e) {
            console.warn("Logout network request failed or timed out", e);
        }
        localStorage.removeItem('resident');
        localStorage.removeItem('adminUser');
        setUser(null);
        setRole(null);
        setResidentData(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, residentData, loading, logout, loginAsResident, loginAsAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
