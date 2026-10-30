import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/maas-logo.jpg';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function
  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address (e.g., name@maas.com).';
    }

    if (!password) {
      errs.password = 'Password is required.';
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
      const res = onLoginSuccess(email.trim(), password);
      if (!res.success) {
        setAuthError(res.message || 'Invalid credentials. Please verify your email and password.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  // Quick fill helper for ease of demo
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Company Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-clean">
            <img 
              src={logoImg} 
              alt="MAAS Group Of Companies" 
              className="h-16 w-auto object-contain"
            />
          </div>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          MAAS HR & Attendance Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium">
          Sign in to access your employee dashboard or administrative console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-9 px-6 sm:px-10 rounded-3xl shadow-clean-md">
          
          {authError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 flex items-start space-x-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-2xl bg-slate-50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. employee@maas.com"
                  className="block w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium pl-2">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-2xl bg-slate-50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter your secret password"
                  className="block w-full pl-12 pr-12 py-3.5 bg-transparent rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium pl-2">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me / Help Info */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted Session Authentication</span>
              </span>
              <span className="text-slate-400">Standard 8h Shift</span>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl text-sm font-semibold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean-md hover:shadow-clean-lg transition-all focus:outline-none disabled:opacity-70"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t-0 bg-slate-50 -mx-6 -mb-9 p-6 rounded-b-3xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick Sign-in Presets
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@maas.com', 'admin')}
                className="p-3 bg-white hover:bg-indigo-50/50 rounded-xl text-left shadow-clean transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                  Admin Account
                </div>
                <div className="text-[11px] text-slate-400">
                  admin@maas.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('kavitha@maas.com', 'staff')}
                className="p-3 bg-white hover:bg-pink-50/50 rounded-xl text-left shadow-clean transition-all group"
              >
                <div className="text-xs font-bold text-slate-800 group-hover:text-pink-600">
                  Staff Account
                </div>
                <div className="text-[11px] text-slate-400">
                  kavitha@maas.com
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center mt-3">
              Admin credentials route directly to the Admin Portal without separate buttons.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

