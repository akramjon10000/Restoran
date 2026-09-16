import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { BRANCHES, Branch } from '../constants';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  login: (phone: string, name?: string) => void;
  logout: () => void;
  isAdmin: boolean;
  currentAddress: string;
  setCurrentAddress: (address: string) => void;
  orderType: 'delivery' | 'pickup';
  setOrderType: (type: 'delivery' | 'pickup') => void;
  deliveryFee: number;
  setDeliveryFee: (fee: number) => void;
  selectedBranch: Branch | null;
  setSelectedBranch: (branch: Branch) => void;
  firebaseAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseAuthReady, setFirebaseAuthReady] = useState(false);
  const [currentAddress, setCurrentAddressState] = useState<string>(() => {
    try {
      return localStorage.getItem('restoran_address') || "Toshkent, Amir Temur 1";
    } catch {
      return "Toshkent, Amir Temur 1";
    }
  });
  const [deliveryFee, setDeliveryFee] = useState<number>(15000); // 15000 as default
  const [orderType, setOrderTypeState] = useState<'delivery' | 'pickup'>(() => {
    try {
      return (localStorage.getItem('restoran_order_type') as any) || 'delivery';
    } catch {
      return 'delivery';
    }
  });
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const setCurrentAddress = (address: string) => {
    setCurrentAddressState(address);
    try {
      localStorage.setItem('restoran_address', address);
    } catch {}
  };

  const setOrderType = (type: 'delivery' | 'pickup') => {
    setOrderTypeState(type);
    try {
      localStorage.setItem('restoran_order_type', type);
    } catch {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Find or create user doc
        let phone = firebaseUser.phoneNumber || '';
        let email = firebaseUser.email || '';
        let name = firebaseUser.displayName || 'Restoran Mijozi';
        let telegramId = undefined;
        try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                phone = data.phone || phone;
                name = data.name || name;
                email = data.email || email;
                telegramId = data.telegramId;
            } else {
                await setDoc(doc(db, 'users', firebaseUser.uid), {
                    phone,
                    email,
                    name,
                    createdAt: Date.now()
                });
            }
        } catch(e) {
            console.error("Error fetching user data", e);
        }
        
        const appUser: AppUser = { phone, email, name, telegramId };
        setUser(appUser);
        try { localStorage.setItem('restoran_user', JSON.stringify(appUser)); } catch (e) {}
      } else {
        // Try Telegram if no firebase user
        let userFound = false;
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const tgUser = tg.initDataUnsafe?.user;
            if (tgUser) {
                const telegramPhone = `+998(TG)${tgUser.id}`;
                const displayName = `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
                const newUser: AppUser = { phone: telegramPhone, name: displayName, telegramId: tgUser.id };
                setUser(newUser);
                userFound = true;
            }
        }
        // Try saved user in localStorage
        if (!userFound) {
          try {
            const saved = localStorage.getItem('restoran_user');
            if (saved) {
              setUser(JSON.parse(saved));
              userFound = true;
            }
          } catch (e) {}
        }
        if (!userFound) setUser(null);
      }
      setFirebaseAuthReady(true);
    });

    return () => unsub();
  }, []);

  const login = (phone: string, name?: string, email?: string) => {
    const newUser: AppUser = { phone, name: name || 'Restoran Mijozi', email };
    setUser(newUser);
    try {
      localStorage.setItem('restoran_user', JSON.stringify(newUser));
    } catch (e) {}
  };

  const logout = async () => {
    try {
        await signOut(auth);
    } catch(e) {
        console.error(e);
    }
    try {
      localStorage.removeItem('restoran_user');
    } catch (e) {}
    setUser(null);
  };

  const adminPhones = (process.env.ADMIN_PHONES || '+998901234567').split(',');
  const adminEmails = (process.env.ADMIN_EMAILS || 'akramjon10000@gmail.com').split(',');
  const isPhoneAdmin = user?.phone ? adminPhones.includes(user.phone) || (user.phone.includes('(TG)') && adminPhones.includes('TG_ADMIN')) : false;
  const isEmailAdmin = user?.email ? adminEmails.includes(user.email) : false;
  const isAdmin = isPhoneAdmin || isEmailAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, isAdmin, currentAddress, setCurrentAddress, orderType, setOrderType,
      deliveryFee, setDeliveryFee,
      selectedBranch, setSelectedBranch, firebaseAuthReady
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};