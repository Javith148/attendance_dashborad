import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, CalendarCheck, DollarSign, 
  FileText, UserPlus, LogOut, ChevronRight, Menu, X 
} from 'lucide-react';
import logoImg from '../assets/maas-logo.jpg';
import AdminDashboardCharts from './AdminDashboardCharts';
import AdminStaffList from './AdminStaffList';
import AdminLeavesApproval from './AdminLeavesApproval';
import AdminPayroll from './AdminPayroll';
import AdminAttendanceLogs from './AdminAttendanceLogs';
import AdminAddStaffModal from './AdminAddStaffModal';
import { getUsers, getAttendance, getLeaves } from '../utils/storage';

export default function AdminPanel({ currentUser, onLogout, onSwitchToStaff }) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'staff', 'leaves', 'payroll', 'logs'
  const [staffList, setStaffList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [leavesList, setLeavesList] = useState([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshAll = () => {
    setStaffList(getUsers());
    setAttendanceList(getAttendance());
    setLeavesList(getLeaves());
  };

  const handleOpenAddStaff = () => {
    setStaffToEdit(null);
    setIsAddStaffOpen(true);
  };

  const handleOpenEditStaff = (staff) => {
    setStaffToEdit(staff);
    setIsAddStaffOpen(true);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const pendingLeavesCount = leavesList.filter(l => l.status === 'Pending').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Analytics & Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: Users,
      badge: `${staffList.filter(s => s.role === 'staff').length}`
    },
    {
      id: 'leaves',
      label: 'Leaves Approval',
      icon: CalendarCheck,
      badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending` : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'payroll',
      label: 'Salary & Payroll',
      icon: DollarSign,
      badge: 'Reports'
    },
    {
      id: 'logs',
      label: 'Attendance Master Logs',
      icon: FileText,
      badge: null
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Left-Side Navigation Sidebar */}
      <aside className={`fixed lg:sticky top-0 h-screen w-72 bg-white shadow-clean-md flex flex-col justify-between z-50 transition-transform duration-200 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top: Logo & Portal Title */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <img 
              src={logoImg} 
              alt="MAAS Group Of Companies" 
              className="h-12 w-auto object-contain"
            />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-xl text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl mt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-brand-navy">
              Administrative Console
            </div>
            <div className="text-xs text-slate-500 font-medium">
              HR & Attendance Control
            </div>
          </div>

          {/* Quick Add Staff CTA */}
          <button
            onClick={handleOpenAddStaff}
            className="w-full mt-4 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-brand-navy hover:bg-brand-navyLight shadow-clean transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Staff</span>
          </button>

          {/* Navigation Menu */}
          <nav className="mt-6 space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-50/80 text-brand-navy shadow-clean'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-navy' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Admin Profile & Settings */}
        <div className="p-6 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                A
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  Administrator
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar for Mobile Menu Toggle */}
        <div className="lg:hidden bg-white shadow-clean p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              MAAS Admin Portal
            </span>
          </div>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="p-2 rounded-xl bg-brand-navy text-white text-xs font-bold flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>

        {/* View Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {activeTab === 'dashboard' && (
            <AdminDashboardCharts 
              staffList={staffList}
              attendanceRecords={attendanceList}
              leavesList={leavesList}
            />
          )}

          {activeTab === 'staff' && (
            <AdminStaffList 
              staffList={staffList}
              onOpenAddStaff={handleOpenAddStaff}
              onEditStaff={handleOpenEditStaff}
              onSwitchToStaff={onSwitchToStaff}
              onRefreshData={refreshAll}
            />
          )}

          {activeTab === 'leaves' && (
            <AdminLeavesApproval 
              onLeaveStatusChanged={refreshAll}
            />
          )}

          {activeTab === 'payroll' && (
            <AdminPayroll 
              staffList={staffList}
            />
          )}

          {activeTab === 'logs' && (
            <AdminAttendanceLogs 
              attendanceRecords={attendanceList}
              staffList={staffList}
            />
          )}

        </main>
      </div>

      {/* Add / Edit Staff Modal */}
      <AdminAddStaffModal 
        isOpen={isAddStaffOpen}
        staffToEdit={staffToEdit}
        onClose={() => {
          setIsAddStaffOpen(false);
          setStaffToEdit(null);
        }}
        onStaffAdded={() => refreshAll()}
        onSwitchToStaff={(staff) => {
          setIsAddStaffOpen(false);
          setStaffToEdit(null);
          onSwitchToStaff(staff);
        }}
      />

    </div>
  );
}

