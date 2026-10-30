import React from 'react';
import { LogOut, User, Shield, Briefcase, Clock, Calendar } from 'lucide-react';
import logoImg from '../assets/maas-logo.jpg';

export default function Navbar({ currentUser, onLogout, onSwitchToAdmin, activeView, setActiveView }) {
  return (
    <header className="bg-white shadow-clean sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-4">
          <img 
            src={logoImg} 
            alt="MAAS Group Of Companies" 
            className="h-12 w-auto object-contain"
          />
          <div className="hidden md:block">
            <span className="text-xs font-semibold tracking-wider uppercase text-brand-navy block">
              Enterprise HRMS & Attendance
            </span>
            <span className="text-xs text-slate-400 font-medium">
              MAAS Group Portal
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser && currentUser.role === 'admin' && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-brand-navy bg-indigo-50 hover:bg-indigo-100 transition-colors shadow-clean"
              title="Go to Admin Console"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Admin Console</span>
            </button>
          )}

          {currentUser && (
            <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold ${currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-brand-navy'}`}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentUser.role === 'admin' ? 'System Administrator' : `${currentUser.department || 'Staff'} • ${currentUser.id}`}
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

