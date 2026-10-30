import React, { useState } from 'react';
import { 
  Check, X, Clock, AlertCircle, CheckCircle2, User, Calendar, 
  FileText, Search, ShieldCheck, Tag, ArrowRight 
} from 'lucide-react';
import { getLeaves, updateLeaveStatus } from '../utils/storage';

export default function AdminLeavesApproval({ onLeaveStatusChanged }) {
  const [leaves, setLeaves] = useState(getLeaves());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Pending', 'Approved', 'Rejected'
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionNotice, setActionNotice] = useState(null);

  const refreshLeaves = () => {
    const updated = getLeaves();
    setLeaves(updated);
    if (onLeaveStatusChanged) onLeaveStatusChanged();
  };

  const handleApprove = (leave) => {
    updateLeaveStatus(leave.id, 'Approved', 'Approved by Administration');
    refreshLeaves();
    showNotice('success', `Leave request for ${leave.staffName} (${leave.leaveType}) has been Approved.`);
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedLeave) return;
    const remark = rejectReason.trim() || 'Not approved as per operational requirements.';
    updateLeaveStatus(selectedLeave.id, 'Rejected', remark);
    refreshLeaves();
    setRejectModalOpen(false);
    showNotice('warning', `Leave request for ${selectedLeave.staffName} marked as Not Approved.`);
  };

  const showNotice = (type, message) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Filter leaves by search query and status tab
  const filteredLeaves = leaves.filter(l => {
    const matchesSearch = 
      l.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.leaveType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.department && l.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.reason && l.reason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  const quickRejectReasons = [
    'Critical project milestone scheduled',
    'Operational workforce peak period',
    'Short advance notice provided',
    'Please reschedule with your team lead'
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl shadow-clean-md flex items-center space-x-3 text-xs font-semibold animate-in slide-in-from-top-4 duration-300 ${
          actionNotice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {actionNotice.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Top Header Card with KPI Status Counters */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-clean">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-brand-navy bg-indigo-50 px-2.5 py-0.5 rounded-lg uppercase tracking-wider">
                HR Governance
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Leave Management Portal
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Staff Leave Approvals
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Review, verify and execute approval actions for employee time-off requests
            </p>
          </div>

          {/* Quick Stats Pill Strip */}
          <div className="grid grid-cols-3 gap-3 self-start lg:self-auto">
            <div className="px-4 py-2.5 rounded-2xl bg-amber-50 shadow-clean text-center min-w-[95px]">
              <div className="text-[10px] font-bold uppercase text-amber-700">Pending</div>
              <div className="text-lg font-black text-amber-800">{pendingCount}</div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 shadow-clean text-center min-w-[95px]">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Approved</div>
              <div className="text-lg font-black text-emerald-800">{approvedCount}</div>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-rose-50 shadow-clean text-center min-w-[95px]">
              <div className="text-[10px] font-bold uppercase text-rose-700">Declined</div>
              <div className="text-lg font-black text-rose-800">{rejectedCount}</div>
            </div>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Input */}
          <div className="relative bg-slate-50 rounded-2xl w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by staff, ID, leave type, department, or reason..."
              className="w-full pl-10 pr-4 py-2.5 bg-transparent rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All', count: leaves.length },
              { id: 'Pending', label: 'Pending', count: pendingCount, badgeColor: 'bg-amber-100 text-amber-800' },
              { id: 'Approved', label: 'Approved', count: approvedCount, badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'Rejected', label: 'Declined', count: rejectedCount, badgeColor: 'bg-rose-100 text-rose-800' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-brand-navy text-white shadow-clean'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${statusFilter === tab.id ? 'bg-white/20 text-white' : (tab.badgeColor || 'bg-slate-200 text-slate-700')}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Professional Table Format */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-3.5 rounded-l-2xl">Staff Member</th>
                <th className="py-3.5 px-3">Leave Type</th>
                <th className="py-3.5 px-3">Duration & Dates</th>
                <th className="py-3.5 px-3">Reason / Remark</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3.5 rounded-r-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl">
                    No leave requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Staff Column */}
                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-brand-navy flex items-center justify-center font-bold text-xs shadow-clean flex-shrink-0">
                          {leave.staffName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{leave.staffName}</div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {leave.staffId} {leave.department ? `• ${leave.department}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Leave Type */}
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-brand-navy bg-indigo-100/70 px-2.5 py-1 rounded-lg inline-block">
                        {leave.leaveType}
                      </span>
                    </td>

                    {/* Duration & Dates */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">
                        {leave.totalDays} {leave.totalDays === 1 ? 'Working Day' : 'Working Days'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{leave.startDate} to {leave.endDate}</span>
                      </div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-3 max-w-xs">
                      <div className="text-slate-700 font-medium line-clamp-2" title={leave.reason}>
                        "{leave.reason}"
                      </div>
                      {leave.adminRemark && (
                        <div className="text-[11px] text-slate-400 italic mt-0.5">
                          <span className="font-semibold text-slate-500">Note:</span> {leave.adminRemark}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3">
                      {leave.status === 'Approved' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800 shadow-clean">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}
                      {leave.status === 'Pending' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800 shadow-clean">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                      {leave.status === 'Rejected' && (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800 shadow-clean">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Declined</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3.5 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleApprove(leave)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-clean bg-emerald-600 hover:bg-emerald-700 text-white shadow-clean-md"
                            title="Grant Leave Approval"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => openRejectModal(leave)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-clean bg-rose-50 hover:bg-rose-100 text-rose-700"
                            title="Decline or Request Reschedule"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 italic">
                          Action Completed
                        </span>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Professional Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-clean-lg animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900">
              Decline Leave Application
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Provide feedback or specify reason for declining {selectedLeave?.staffName}'s request
            </p>

            {/* Quick Reason Chips */}
            <div className="mt-3.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Reason Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickRejectReasons.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="mt-3">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrative Remark / Feedback
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter feedback or specific reason for rejection..."
                className="w-full p-3 bg-slate-50 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2.5 mt-4">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-clean"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
