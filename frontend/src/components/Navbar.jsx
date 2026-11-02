import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, API_BASE_URL } from '../api/api';
import { 
  Building2, 
  FileText, 
  Info, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Menu, 
  X,
  Server,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ currentView, setView }) {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  // Periodic health check to verify EC2 Instance 2 Backend API connectivity
  useEffect(() => {
    let mounted = true;
    const checkConnection = async () => {
      try {
        const res = await api.getHealth();
        if (mounted && res.status === 'HEALTHY') {
          setBackendStatus('online');
        } else if (mounted) {
          setBackendStatus('offline');
        }
      } catch (err) {
        if (mounted) setBackendStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Building2 },
    { id: 'about', label: 'About Barangay', icon: Info },
    { id: 'documents', label: 'Available Documents', icon: FileText },
  ];

  const handleNavClick = (viewId) => {
    setView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Government Bar */}
      <div className="bg-tinurik-navy text-white text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Republic of the Philippines • Province of Batangas • City of Tanauan</span>
          </div>
          <div className="flex items-center gap-3 text-slate-300">
            <span className="hidden sm:inline">Barangay Tinurik Online Service Portal</span>
            <span className="text-[11px] bg-slate-800/80 px-2.5 py-0.5 rounded text-emerald-400 font-medium">
              Official Government Portal
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Official Logo & Name */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-tinurik-navy to-tinurik-blue flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl select-none">🏛️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-tinurik-navy text-lg sm:text-xl tracking-tight leading-none">
                  Barangay Tinurik
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Document Request & Tracking System</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-tinurik-blue font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-tinurik-navy hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'resident-dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${
                    isAdmin 
                      ? 'bg-slate-800 hover:bg-slate-900 shadow-slate-900/20' 
                      : 'bg-tinurik-blue hover:bg-blue-800 shadow-blue-800/20'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1" />

                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-100 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <span className="block font-semibold text-slate-800 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isAdmin ? 'Administrator' : 'Resident'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-tinurik-navy hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-tinurik-blue hover:bg-blue-800 rounded-lg shadow-sm shadow-blue-900/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register Resident
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                    currentView === item.id
                      ? 'bg-blue-50 text-tinurik-blue font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">{user.full_name}</div>
                    <div className="text-xs text-slate-500">{user.email} ({user.role})</div>
                  </div>
                </div>

                <button
                  onClick={() => handleNavClick(isAdmin ? 'admin-dashboard' : 'resident-dashboard')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-tinurik-blue text-white rounded-lg font-bold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Go to {isAdmin ? 'Admin Dashboard' : 'Resident Dashboard'}
                </button>

                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-rose-200 text-rose-600 rounded-lg font-semibold text-sm hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick('login')}
                  className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-300 rounded-lg font-semibold text-sm text-slate-700"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('register')}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-tinurik-blue text-white rounded-lg font-bold text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
