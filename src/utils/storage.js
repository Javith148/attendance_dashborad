// LocalStorage Management and Seed Data for MAAS Attendance & HRMS System

const STORAGE_KEYS = {
  USERS: 'maas_staff_users',
  ATTENDANCE: 'maas_attendance_records',
  LEAVES: 'maas_leave_requests',
  CURRENT_USER: 'maas_active_session',
  SMTP_CONFIG: 'maas_smtp_settings'
};

// Initial Seed Users
const INITIAL_USERS = [
  {
    id: 'ADMIN-001',
    name: 'MAAS Admin Officer',
    email: 'admin@mass.com',
    password: 'javith',
    role: 'admin',
    department: 'Management',
    designation: 'HR & Operations Director',
    phone: '+91 98765 43210',
    hourlyRate: 500,
    dailySalary: 4000,
    joinDate: '2023-01-10',
    avatarBg: 'bg-indigo-600'
  },
  {
    id: 'MAAS-101',
    name: 'Kavitha Raman',
    email: 'kavitha@maas.com',
    password: 'staff',
    role: 'staff',
    department: 'Engineering',
    designation: 'Senior Frontend Developer',
    phone: '+91 98401 23456',
    hourlyRate: 350,
    dailySalary: 2800,
    joinDate: '2023-06-15',
    avatarBg: 'bg-pink-600'
  },
  {
    id: 'MAAS-102',
    name: 'Suresh Kumar',
    email: 'suresh@maas.com',
    password: 'staff',
    role: 'staff',
    department: 'Operations',
    designation: 'Logistics Coordinator',
    phone: '+91 97890 12345',
    hourlyRate: 300,
    dailySalary: 2400,
    joinDate: '2023-08-01',
    avatarBg: 'bg-amber-600'
  },
  {
    id: 'MAAS-103',
    name: 'Ananya Sharma',
    email: 'ananya@maas.com',
    password: 'staff',
    role: 'staff',
    department: 'Human Resources',
    designation: 'Talent Acquisition Specialist',
    phone: '+91 96543 89012',
    hourlyRate: 320,
    dailySalary: 2560,
    joinDate: '2024-01-12',
    avatarBg: 'bg-violet-600'
  },
  {
    id: 'MAAS-104',
    name: 'Praveen Raj',
    email: 'praveen@maas.com',
    password: 'staff',
    role: 'staff',
    department: 'Marketing',
    designation: 'Digital Marketing Executive',
    phone: '+91 99402 78901',
    hourlyRate: 290,
    dailySalary: 2320,
    joinDate: '2024-03-20',
    avatarBg: 'bg-teal-600'
  }
];

// Helper to format date YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic past attendance for a month
function generateInitialAttendance() {
  const records = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const staffList = INITIAL_USERS.filter(u => u.role === 'staff');

  // Days in current month up to today
  const currentDay = today.getDate();

  staffList.forEach(staff => {
    for (let day = 1; day <= currentDay; day++) {
      const dateObj = new Date(year, month, day);
      const isSunday = dateObj.getDay() === 0;
      const dateStr = formatDate(dateObj);

      if (isSunday) {
        records.push({
          id: `att_${staff.id}_${dateStr}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          status: 'Holiday',
          isSunday: true,
          checkIn: null,
          checkOut: null,
          hoursWorked: 0,
          workType: 'Holiday',
          notes: 'Sunday Weekly Holiday'
        });
        continue;
      }

      // If today and not yet checked out
      if (day === currentDay) {
        if (staff.id === 'MAAS-101') {
          // Kavitha checked in today
          const d = new Date();
          d.setHours(9, 5, 0, 0);
          records.push({
            id: `att_${staff.id}_${dateStr}`,
            staffId: staff.id,
            staffName: staff.name,
            date: dateStr,
            status: 'In Progress',
            isSunday: false,
            checkIn: '09:05 AM',
            checkInIso: d.toISOString(),
            checkOut: null,
            hoursWorked: 0,
            workType: 'Office',
            notes: 'Client Sprint Planning'
          });
        }
        continue;
      }

      // Past days variations
      const seed = (day * 7 + staff.name.length) % 10;

      if (seed === 1 && day === 15) {
        // Approved leave day
        records.push({
          id: `att_${staff.id}_${dateStr}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          status: 'Leave',
          isSunday: false,
          checkIn: null,
          checkOut: null,
          hoursWorked: 0,
          workType: 'Leave',
          notes: 'Personal Emergency - Approved'
        });
      } else if (seed === 3) {
        // Half day (less than 8 hours, e.g. 5 hours)
        records.push({
          id: `att_${staff.id}_${dateStr}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          status: 'Half Day',
          isSunday: false,
          checkIn: '09:15 AM',
          checkOut: '02:30 PM',
          hoursWorked: 5.25,
          workType: 'WFH',
          notes: 'Medical Appointment afternoon'
        });
      } else if (seed === 9) {
        // Absent
        records.push({
          id: `att_${staff.id}_${dateStr}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          status: 'Absent',
          isSunday: false,
          checkIn: null,
          checkOut: null,
          hoursWorked: 0,
          workType: 'Absent',
          notes: 'Unplanned absence'
        });
      } else {
        // Full Day Present (>= 8 hours)
        const hours = 8.5 + (day % 3) * 0.25;
        records.push({
          id: `att_${staff.id}_${dateStr}`,
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          status: 'Present',
          isSunday: false,
          checkIn: '09:00 AM',
          checkOut: '06:00 PM',
          hoursWorked: hours,
          workType: day % 2 === 0 ? 'Office' : 'WFH',
          notes: 'Regular full day shift'
        });
      }
    }
  });

  return records;
}

// Initial Leaves
const INITIAL_LEAVES = [
  {
    id: 'LV-201',
    staffId: 'MAAS-101',
    staffName: 'Kavitha Raman',
    department: 'Engineering',
    leaveType: 'Casual Leave',
    startDate: '2026-11-04',
    endDate: '2026-11-05',
    totalDays: 2,
    reason: 'Attending family wedding ceremony out of station.',
    status: 'Pending',
    appliedDate: '2026-10-28',
    adminRemark: ''
  },
  {
    id: 'LV-202',
    staffId: 'MAAS-102',
    staffName: 'Suresh Kumar',
    department: 'Operations',
    leaveType: 'Sick Leave',
    startDate: '2026-11-02',
    endDate: '2026-11-02',
    totalDays: 1,
    reason: 'Viral fever and prescribed medical rest.',
    status: 'Pending',
    appliedDate: '2026-10-29',
    adminRemark: ''
  },
  {
    id: 'LV-203',
    staffId: 'MAAS-103',
    staffName: 'Ananya Sharma',
    department: 'Human Resources',
    leaveType: 'Emergency Leave',
    startDate: '2026-11-06',
    endDate: '2026-11-06',
    totalDays: 1,
    reason: 'Urgent home maintenance and repair.',
    status: 'Pending',
    appliedDate: '2026-10-29',
    adminRemark: ''
  },
  {
    id: 'LV-204',
    staffId: 'MAAS-104',
    staffName: 'Praveen Raj',
    department: 'Marketing',
    leaveType: 'Casual Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-12',
    totalDays: 3,
    reason: 'Personal vacation trip.',
    status: 'Pending',
    appliedDate: '2026-10-29',
    adminRemark: ''
  }
];

// Initial SMTP Configuration
const INITIAL_SMTP = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  senderEmail: 'hr@maasgroup.com',
  senderName: 'MAAS Group Of Companies HR & Accounts',
  appPassword: '', // user will supply
  enabled: true
};

// Initialize Database in LocalStorage
export function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  } else {
    // Sync admin credentials if updated
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS));
      const adminIdx = users.findIndex(u => u.role === 'admin' || u.id === 'ADMIN-001');
      if (adminIdx >= 0) {
        users[adminIdx].email = 'admin@mass.com';
        users[adminIdx].password = 'javith';
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
    } catch (e) {}
  }
  if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(generateInitialAttendance()));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEAVES)) {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(INITIAL_LEAVES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SMTP_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.SMTP_CONFIG, JSON.stringify(INITIAL_SMTP));
  }
}

// User & Auth Functions
export function getUsers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    const users = data ? JSON.parse(data) : INITIAL_USERS;
    // Ensure admin user is always in sync with admin@mass.com / javith
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser && (adminUser.email !== 'admin@mass.com' || adminUser.password !== 'javith')) {
      adminUser.email = 'admin@mass.com';
      adminUser.password = 'javith';
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  } catch (e) {
    return INITIAL_USERS;
  }
}

export function saveUser(newUser) {
  const users = getUsers();
  const existingIdx = users.findIndex(u => u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...newUser };
  } else {
    users.push(newUser);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
}

export function deleteUser(userId) {
  const users = getUsers().filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function authenticateUser(email, password, expectedRole = null) {
  const users = getUsers();
  const normalizedEmail = email.trim().toLowerCase();

  const user = users.find(u => {
    const uEmail = u.email.toLowerCase();
    // Allow admin@mass.com and admin@maas.com with password 'javith'
    if (u.role === 'admin' && (normalizedEmail === 'admin@mass.com' || normalizedEmail === 'admin@maas.com')) {
      return password === 'javith' || u.password === password;
    }
    return uEmail === normalizedEmail && u.password === password;
  });
  
  if (!user) {
    return { success: false, message: 'Invalid Email or Password. Please try again.' };
  }

  if (expectedRole && user.role !== expectedRole) {
    if (expectedRole === 'admin') {
      return { 
        success: false, 
        message: 'Access Denied: This staff account does not have Administrative rights. Please use the Staff Login portal.' 
      };
    } else if (expectedRole === 'staff') {
      return { 
        success: false, 
        message: 'This is an Executive Administrative account. Please use the dedicated /admin portal to sign in.' 
      };
    }
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return { success: true, user };
}

export function getActiveSession() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Attendance Functions
export function getAttendance() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    let records = data ? JSON.parse(data) : [];

    // Ensure newly created staff members have attendance records generated for the current month
    const usersData = localStorage.getItem(STORAGE_KEYS.USERS);
    if (usersData) {
      const users = JSON.parse(usersData);
      const staffMembers = users.filter(u => u.role === 'staff');
      let needsSave = false;

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const currentDay = today.getDate();

      staffMembers.forEach(staff => {
        const hasRecords = records.some(r => r.staffId === staff.id);
        if (!hasRecords) {
          needsSave = true;
          for (let day = 1; day <= currentDay; day++) {
            const dateObj = new Date(year, month, day);
            const isSunday = dateObj.getDay() === 0;
            const dateStr = formatDate(dateObj);

            if (isSunday) {
              records.push({
                id: `att_${staff.id}_${dateStr}`,
                staffId: staff.id,
                staffName: staff.name,
                date: dateStr,
                status: 'Holiday',
                isSunday: true,
                checkIn: null,
                checkOut: null,
                hoursWorked: 0,
                workType: 'Holiday',
                notes: 'Sunday Weekly Holiday'
              });
            } else {
              records.push({
                id: `att_${staff.id}_${dateStr}`,
                staffId: staff.id,
                staffName: staff.name,
                date: dateStr,
                status: 'Present',
                isSunday: false,
                checkIn: '09:00 AM',
                checkOut: '06:00 PM',
                hoursWorked: 8.5,
                workType: 'Office',
                notes: 'Full Day Shift'
              });
            }
          }
        }
      });

      if (needsSave) {
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
      }
    }

    return records;
  } catch (e) {
    return [];
  }
}

export function saveAttendanceRecords(records) {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export function getTodayAttendanceForStaff(staffId) {
  const records = getAttendance();
  const todayStr = formatDate(new Date());
  return records.find(r => r.staffId === staffId && r.date === todayStr);
}

// Check In
export function recordCheckIn({ staffId, staffName, workType, notes, checkInTime }) {
  const records = getAttendance();
  const todayStr = formatDate(new Date());
  const now = new Date();
  const timeFormatted = checkInTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const existingIdx = records.findIndex(r => r.staffId === staffId && r.date === todayStr);
  const newRecord = {
    id: `att_${staffId}_${todayStr}`,
    staffId,
    staffName,
    date: todayStr,
    status: 'In Progress',
    isSunday: new Date().getDay() === 0,
    checkIn: timeFormatted,
    checkInIso: now.toISOString(),
    checkOut: null,
    checkOutIso: null,
    hoursWorked: 0,
    workType: workType || 'Office',
    notes: notes || 'Standard check-in'
  };

  if (existingIdx >= 0) {
    records[existingIdx] = { ...records[existingIdx], ...newRecord };
  } else {
    records.push(newRecord);
  }

  saveAttendanceRecords(records);
  return newRecord;
}

// Check Out with 8-Hour Rule
export function recordCheckOut({ staffId, checkOutTime }) {
  const records = getAttendance();
  const todayStr = formatDate(new Date());
  const idx = records.findIndex(r => r.staffId === staffId && r.date === todayStr);

  if (idx < 0) {
    throw new Error('No active check-in found for today.');
  }

  const existing = records[idx];
  const now = new Date();
  const outTimeFormatted = checkOutTime || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  let hoursWorked = 8.0; // default standard if ISO calculation not available

  if (existing.checkInIso) {
    const diffMs = now.getTime() - new Date(existing.checkInIso).getTime();
    const diffHrs = Math.max(0.1, +(diffMs / (1000 * 60 * 60)).toFixed(2));
    hoursWorked = diffHrs;
  } else if (existing.checkIn) {
    // Parse time like "09:05 AM"
    try {
      const [time, modifier] = existing.checkIn.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      const inDate = new Date();
      inDate.setHours(hours, minutes, 0, 0);

      const diffMs = now.getTime() - inDate.getTime();
      const diffHrs = Math.max(0.1, +(diffMs / (1000 * 60 * 60)).toFixed(2));
      hoursWorked = diffHrs;
    } catch (e) {
      hoursWorked = 8.0;
    }
  }

  // 8-Hour Threshold Rule:
  // If >= 8 hours -> Full Day Present
  // If < 8 hours -> Half Day Leave
  const status = hoursWorked >= 8 ? 'Present' : 'Half Day';

  const updated = {
    ...existing,
    checkOut: outTimeFormatted,
    checkOutIso: now.toISOString(),
    hoursWorked: hoursWorked,
    status: status
  };

  records[idx] = updated;
  saveAttendanceRecords(records);
  return updated;
}

// Leaves Management
export function getLeaves() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    let leaves = data ? JSON.parse(data) : INITIAL_LEAVES;

    // Ensure all leaves start as Pending until explicitly approved or rejected by admin
    let needsUpdate = false;
    leaves = leaves.map(l => {
      if ((l.id === 'LV-202' || l.id === 'LV-203') && (l.adminRemark === 'Approved with medical certificate.' || l.adminRemark === 'Approved.')) {
        needsUpdate = true;
        return { ...l, status: 'Pending', adminRemark: '' };
      }
      return l;
    });

    if (needsUpdate) {
      localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    }

    return leaves;
  } catch (e) {
    return INITIAL_LEAVES;
  }
}

export function saveLeaves(leaves) {
  localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
}

export function submitLeave(leaveData) {
  const leaves = getLeaves();
  const newLeave = {
    id: `LV-${Date.now().toString().slice(-4)}`,
    ...leaveData,
    status: 'Pending',
    appliedDate: formatDate(new Date()),
    adminRemark: ''
  };
  leaves.unshift(newLeave);
  saveLeaves(leaves);
  return newLeave;
}

export function updateLeaveStatus(leaveId, status, adminRemark = '') {
  const leaves = getLeaves();
  const idx = leaves.findIndex(l => l.id === leaveId);
  if (idx >= 0) {
    leaves[idx].status = status;
    leaves[idx].adminRemark = adminRemark;
    saveLeaves(leaves);

    // If approved, sync to attendance records
    if (status === 'Approved') {
      const leave = leaves[idx];
      const records = getAttendance();
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() !== 0) { // Not Sunday
          const dateStr = formatDate(d);
          const attIdx = records.findIndex(r => r.staffId === leave.staffId && r.date === dateStr);
          const leaveRecord = {
            id: `att_${leave.staffId}_${dateStr}`,
            staffId: leave.staffId,
            staffName: leave.staffName,
            date: dateStr,
            status: 'Leave',
            isSunday: false,
            checkIn: null,
            checkOut: null,
            hoursWorked: 0,
            workType: 'Leave',
            notes: `${leave.leaveType} - Approved`
          };
          if (attIdx >= 0) {
            records[attIdx] = leaveRecord;
          } else {
            records.push(leaveRecord);
          }
        }
      }
      saveAttendanceRecords(records);
    }
    return leaves[idx];
  }
  return null;
}

// Salary & Payroll Calculation Engine
export function calculateStaffSalary(staff, year, month) {
  const records = getAttendance();
  const targetYear = year || new Date().getFullYear();
  const targetMonth = month !== undefined ? month : new Date().getMonth();

  const baseMonthlySalary = Number(staff.salary || staff.monthlySalary) || (staff.dailySalary ? staff.dailySalary * 25 : 50000);
  const dailySalary = staff.dailySalary || Math.round(baseMonthlySalary / 25);
  const hourlyRate = staff.hourlyRate || Math.round(dailySalary / 8);

  // Filter records for this staff in target month
  const monthlyRecords = records.filter(r => {
    if (r.staffId !== staff.id) return false;
    const rDate = new Date(r.date);
    return rDate.getFullYear() === targetYear && rDate.getMonth() === targetMonth;
  });

  let totalHours = 0;
  let fullDays = 0;
  let halfDays = 0;
  let approvedLeaves = 0;
  let absentDays = 0;
  let holidays = 0;

  if (monthlyRecords.length === 0) {
    // If no attendance records logged yet for this month, default to full month active days
    fullDays = 25;
    totalHours = 200;
  } else {
    monthlyRecords.forEach(r => {
      if (r.status === 'Present') {
        fullDays += 1;
        totalHours += (r.hoursWorked || 8);
      } else if (r.status === 'Half Day') {
        halfDays += 1;
        totalHours += (r.hoursWorked || 4);
      } else if (r.status === 'Leave') {
        approvedLeaves += 1;
      } else if (r.status === 'Absent') {
        absentDays += 1;
      } else if (r.status === 'Holiday') {
        holidays += 1;
      }
    });
  }

  // Hourly base pay
  const salaryByHours = +(totalHours * hourlyRate).toFixed(2);

  // Day base pay: Full days (100%) + Half days (50%) + Paid Leaves (100%)
  const effectiveDays = fullDays + (halfDays * 0.5) + approvedLeaves;
  let salaryByDays = +(effectiveDays * dailySalary).toFixed(2);

  // Gross Pay: If near full month or newly registered, align with baseMonthlySalary
  let grossSalary = salaryByDays;
  if (grossSalary <= 0 || effectiveDays >= 22 || monthlyRecords.length === 0) {
    grossSalary = baseMonthlySalary;
    salaryByDays = baseMonthlySalary;
  }

  // Benefits & Deductions
  const hra = +(grossSalary * 0.15).toFixed(2); // 15% HRA
  const conveyance = 1200; // standard allowance
  const pf = +(grossSalary * 0.12).toFixed(2); // 12% PF contribution
  const professionalTax = 200;

  const totalEarnings = +(grossSalary + hra + conveyance).toFixed(2);
  const totalDeductions = +(pf + professionalTax).toFixed(2);
  const netPayable = +(totalEarnings - totalDeductions).toFixed(2);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    staffId: staff.id,
    staffName: staff.name,
    designation: staff.designation,
    department: staff.department,
    email: staff.email,
    phone: staff.phone,
    joinDate: staff.joinDate,
    monthName: monthNames[targetMonth],
    year: targetYear,
    hourlyRate,
    dailySalary,
    totalHours: +totalHours.toFixed(1),
    fullDays,
    halfDays,
    approvedLeaves,
    absentDays,
    holidays,
    effectiveDays,
    salaryByHours,
    salaryByDays,
    grossSalary,
    hra,
    conveyance,
    pf,
    professionalTax,
    totalEarnings,
    totalDeductions,
    netPayable
  };
}

// SMTP Settings
export function getSmtpSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SMTP_CONFIG);
    return data ? JSON.parse(data) : INITIAL_SMTP;
  } catch (e) {
    return INITIAL_SMTP;
  }
}

export function saveSmtpSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SMTP_CONFIG, JSON.stringify(settings));
}

// Reset data helper
export function resetSystemData() {
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
  localStorage.removeItem(STORAGE_KEYS.LEAVES);
  localStorage.removeItem(STORAGE_KEYS.SMTP_CONFIG);
  initializeStorage();
}

