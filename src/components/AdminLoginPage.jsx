import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import logoImg from '../assets/maas-logo.jpg';

export default function AdminLoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Administrator Gmail / Email is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Enter a valid administrator email format.';
    }

    if (!password) {
      errs.password = 'Administrator password is required.';
    } else if (password.length < 3) {
      errs.password = 'Password must be at least 3 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const res = onLoginSuccess(email.trim(), password, 'admin');
      if (!res.success) {
        setAuthError(res.message || 'Unauthorized: Invalid administrator credentials.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Ambient Background with MAAS Brand Colors (Navy, Pink, Orange) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft Navy Aura Top-Left */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl" />
        
        {/* Soft Magenta/Pink Aura Top-Right */}
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl" />
        
        {/* Soft Orange/Amber Aura Bottom */}
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-3xl" />

        {/* Subtle Enterprise Grid Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-sm py-10 px-6 sm:px-10 rounded-3xl shadow-clean-lg">
          
          {/* Logo & Clean Title Integrated Inside Card */}
          <div className="flex flex-col items-center text-center mb-8">
            <img 
              src={logoImg} 
              alt="MAAS Group Of Companies" 
              className="h-16 w-auto object-contain mb-4"
            />

            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Admin Portal
            </h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Sign in with your administrator email and password
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 flex items-start space-x-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Admin Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Administrator Email Address
              </label>
              <div className="relative rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="Enter the Gmail ID"
                  className="block w-full pl-11 pr-4 py-3.5 bg-transparent rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium pl-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Admin Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-2xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-navy transition-all">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter Password"
                  className="block w-full pl-11 pr-11 py-3.5 bg-transparent rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium pl-2">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-navy hover:bg-brand-navyDark shadow-clean-md hover:shadow-clean-lg transition-all focus:outline-none disabled:opacity-70 pt-3"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Admin Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
