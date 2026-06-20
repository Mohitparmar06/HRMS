const departments = [
  { id: 'DEPT-001', name: 'Engineering', head: 'Sarah Chen', employeeCount: 32, budget: 2850000, color: '#3b82f6' },
  { id: 'DEPT-002', name: 'Human Resources', head: 'Marcus Webb', employeeCount: 12, budget: 980000, color: '#a855f7' },
  { id: 'DEPT-003', name: 'Finance', head: 'Priya Sharma', employeeCount: 15, budget: 1200000, color: '#10b981' },
  { id: 'DEPT-004', name: 'Sales & Marketing', head: 'James O\'Connor', employeeCount: 22, budget: 1650000, color: '#f59e0b' },
  { id: 'DEPT-005', name: 'Product Management', head: 'Anika Patel', employeeCount: 10, budget: 1100000, color: '#ec4899' },
  { id: 'DEPT-006', name: 'Design', head: 'Lucas Moreau', employeeCount: 14, budget: 1050000, color: '#06b6d4' },
  { id: 'DEPT-007', name: 'Operations', head: 'Fatima Al-Rashid', employeeCount: 18, budget: 1320000, color: '#8b5cf6' },
  { id: 'DEPT-008', name: 'Customer Support', head: 'David Kim', employeeCount: 27, budget: 1480000, color: '#f97316' },
];

const positions = [
  'Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager',
  'HR Specialist', 'HR Manager', 'Recruiter', 'Payroll Analyst',
  'Financial Analyst', 'Accountant', 'Finance Manager', 'Controller',
  'Sales Representative', 'Account Executive', 'Marketing Specialist', 'Sales Manager',
  'Product Manager', 'Senior Product Manager', 'Product Analyst',
  'UI/UX Designer', 'Senior Designer', 'Design Lead',
  'Operations Analyst', 'Operations Manager', 'Supply Chain Specialist',
  'Support Specialist', 'Support Lead', 'Customer Success Manager',
  'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'Technical Writer'
];

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
  'Larry', 'Pamela', 'Justin', 'Emma', 'Scott', 'Nicole', 'Brandon', 'Helen',
  'Benjamin', 'Samantha', 'Samuel', 'Katherine', 'Raymond', 'Christine', 'Gregory', 'Debra',
  'Frank', 'Rachel', 'Alexander', 'Carolyn', 'Patrick', 'Janet', 'Jack', 'Catherine',
  'Dennis', 'Maria', 'Jerry', 'Heather', 'Tyler', 'Diane', 'Aaron', 'Ruth',
  'Jose', 'Julie', 'Adam', 'Olivia', 'Nathan', 'Joyce', 'Henry', 'Virginia',
  'Douglas', 'Victoria', 'Peter', 'Kelly', 'Zachary', 'Lauren', 'Walter', 'Christina',
  'Kyle', 'Joan', 'Harold', 'Evelyn', 'Carl', 'Judith', 'Jeremy', 'Megan',
  'Gerald', 'Andrea', 'Keith', 'Cheryl', 'Roger', 'Hannah', 'Arthur', 'Jacqueline',
  'Terry', 'Martha', 'Lawrence', 'Gloria', 'Jesse', 'Teresa', 'Austin', 'Ann',
  'Dylan', 'Sara', 'Bryan', 'Madison', 'Joe', 'Frances', 'Jordan', 'Kathryn',
  'Billy', 'Janice', 'Bruce', 'Jean', 'Albert', 'Abigail', 'Willie', 'Alice',
  'Gabriel', 'Judy', 'Logan', 'Sophia', 'Alan', 'Grace', 'Juan', 'Denise',
  'Wayne', 'Amber', 'Elijah', 'Doris', 'Randy', 'Marilyn', 'Roy', 'Danielle',
  'Vincent', 'Beverly', 'Ralph', 'Isabella', 'Eugene', 'Theresa', 'Randy', 'Diana',
  'Russell', 'Natalie', 'Bobby', 'Brittany', 'Mason', 'Charlotte', 'Philip', 'Marie',
  'Harry', 'Kayla', 'Alexis', 'Alex', 'Ethan', 'Ben', 'Evan', 'Mia',
  'Sophia', 'Isabella', 'Ava', 'Luna', 'Harper', 'Camila', 'Aria', 'Scarlett',
  'Penelope', 'Layla', 'Chloe', 'Victoria', 'Madison', 'Eleanor', 'Grace', 'Nora',
  'Riley', 'Zoey', 'Hannah', 'Hazel', 'Lily', 'Ellie', 'Violet', 'Aurora',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
  'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales',
  'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson',
  'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward',
  'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray',
  'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel',
  'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry',
  'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales',
  'Fisher', 'Vasquez', 'Simmons', 'Patterson', 'Jordan', 'Reynolds', 'Hamilton', 'Graham',
  'Wallace', 'Gibson', 'Bryant', 'Alexander', 'Tucker', 'Harvey', 'Marshall', 'Hunt',
  'Freeman', 'Webb', 'Burns', 'Spencer', 'Stone', 'Perkins', 'Jensen', 'Wells',
  'Chen', 'Patel', 'Sharma', 'Kim', 'Tanaka', 'Moreau', 'Al-Rashid', 'O\'Connor',
];

const statuses = ['Active', 'On Leave', 'Inactive'];
const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Work From Home'];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateEmployees() {
  const rand = seededRandom(42);
  const employees = [];
  const usedNames = new Set();

  for (let i = 1; i <= 150; i++) {
    let firstName, lastName, fullName;
    do {
      firstName = firstNames[Math.floor(rand() * firstNames.length)];
      lastName = lastNames[Math.floor(rand() * lastNames.length)];
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));
    usedNames.add(fullName);

    const dept = departments[Math.floor(rand() * departments.length)];
    const deptPositions = positions.filter((_, idx) => {
      if (dept.name === 'Engineering') return [0,1,2,3,27,28,29,30].includes(idx);
      if (dept.name === 'Human Resources') return [4,5,6,7].includes(idx);
      if (dept.name === 'Finance') return [8,9,10,11].includes(idx);
      if (dept.name === 'Sales & Marketing') return [12,13,14,15].includes(idx);
      if (dept.name === 'Product Management') return [16,17,18].includes(idx);
      if (dept.name === 'Design') return [19,20,21].includes(idx);
      if (dept.name === 'Operations') return [22,23,24].includes(idx);
      if (dept.name === 'Customer Support') return [25,26,27].includes(idx);
      return false;
    });
    const position = deptPositions.length > 0
      ? deptPositions[Math.floor(rand() * deptPositions.length)]
      : positions[Math.floor(rand() * positions.length)];

    const status = rand() > 0.12 ? 'Active' : rand() > 0.5 ? 'On Leave' : 'Inactive';
    const salary = 45000 + Math.floor(rand() * 120000);
    const joinYear = 2018 + Math.floor(rand() * 8);
    const joinMonth = 1 + Math.floor(rand() * 12);
    const joinDay = 1 + Math.floor(rand() * 28);

    const today = new Date();
    const hour = 7 + Math.floor(rand() * 3);
    const minute = Math.floor(rand() * 60);
    const lastCheckIn = status === 'Active'
      ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      : null;

    employees.push({
      id: `EMP-${String(i).padStart(4, '0')}`,
      firstName,
      lastName,
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace("'", '')}@dayflow.com`,
      phone: `+1 (${500 + Math.floor(rand() * 499)}) ${Math.floor(rand() * 900) + 100}-${Math.floor(rand() * 9000) + 1000}`,
      avatar: `${firstName[0]}${lastName[0]}`,
      department: dept.name,
      departmentId: dept.id,
      position,
      status,
      salary,
      joinDate: `${joinYear}-${String(joinMonth).padStart(2, '0')}-${String(joinDay).padStart(2, '0')}`,
      lastCheckIn,
      performance: 60 + Math.floor(rand() * 40),
      projectsCompleted: Math.floor(rand() * 25),
      hoursWorked: 120 + Math.floor(rand() * 50),
    });
  }

  return employees;
}

function generateAttendance() {
  const rand = seededRandom(100);
  const attendance = [];
  const today = new Date();

  for (let day = 0; day < 30; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() - day);
    const dateStr = date.toISOString().split('T')[0];

    const present = 100 + Math.floor(rand() * 35);
    const absent = 8 + Math.floor(rand() * 15);
    const late = 5 + Math.floor(rand() * 12);
    const halfDay = 3 + Math.floor(rand() * 8);
    const onLeave = 10 + Math.floor(rand() * 10);

    attendance.push({ date: dateStr, present, absent, late, halfDay, onLeave });
  }

  return attendance;
}

function generateLeaveRequests() {
  const rand = seededRandom(200);
  const requests = [];
  const reasons = [
    'Family vacation planned months in advance',
    'Medical appointment and recovery',
    'Personal reasons requiring time off',
    'Wedding ceremony and related events',
    'Relocating to new apartment',
    'Attending a professional conference',
    'Mental health day',
    'Family emergency',
    'Home renovation project',
    'Child school event',
    'Religious observance',
    'Traveling abroad',
    'Doctor recommended rest',
    'Elderly parent care',
    'Household maintenance required',
  ];
  const rejectionReasons = [
    'Insufficient staffing during project deadline',
    'Overlap with approved leave for another team member',
    'Peak business period - reschedule requested',
    'Pending performance review meeting',
    'Required for client presentation',
  ];
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

  for (let i = 1; i <= 50; i++) {
    const empIdx = Math.floor(rand() * 150);
    const emp = allEmployees[empIdx];
    const leaveType = leaveTypes[Math.floor(rand() * leaveTypes.length)];
    let status;
    if (i <= 28) {
      status = 'Pending';
    } else if (i <= 42) {
      status = 'Approved';
    } else {
      status = 'Rejected';
    }
    const month = months[Math.floor(rand() * months.length)];
    const startDay = Math.floor(rand() * 25) + 1;
    const duration = 1 + Math.floor(rand() * 5);
    const endDay = Math.min(startDay + duration, 28);

    const appliedDay = Math.max(startDay - Math.floor(rand() * 5) - 1, 1);
    const appliedDate = `${month}-${String(appliedDay).padStart(2, '0')}`;

    let approvedDate = null;
    let rejectionReason = null;
    if (status === 'Approved') {
      approvedDate = `${month}-${String(Math.min(appliedDay + 1 + Math.floor(rand() * 2), 28)).padStart(2, '0')}`;
    } else if (status === 'Rejected') {
      approvedDate = `${month}-${String(Math.min(appliedDay + 1 + Math.floor(rand() * 2), 28)).padStart(2, '0')}`;
      rejectionReason = rejectionReasons[Math.floor(rand() * rejectionReasons.length)];
    }

    requests.push({
      id: `LR-${String(i).padStart(4, '0')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeAvatar: emp.avatar,
      department: emp.department,
      leaveType,
      startDate: `${month}-${String(startDay).padStart(2, '0')}`,
      endDate: `${month}-${String(endDay).padStart(2, '0')}`,
      duration: endDay - startDay + 1,
      reason: reasons[Math.floor(rand() * reasons.length)],
      status,
      appliedDate,
      approvedDate,
      rejectionReason,
    });
  }

  return requests;
}

function generatePayrollData() {
  const rand = seededRandom(300);
  const payroll = [];
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];

  months.forEach((month, idx) => {
    const totalEmployees = 135 + Math.floor(rand() * 15);
    const basePayroll = 850000 + Math.floor(rand() * 200000);
    const bonuses = Math.floor(rand() * 80000);
    const deductions = Math.floor(rand() * 120000);
    const overtime = Math.floor(rand() * 45000);

    payroll.push({
      month,
      year: 2026,
      totalEmployees,
      basePayroll,
      bonuses,
      deductions,
      overtime,
      netPayroll: basePayroll + bonuses + overtime - deductions,
    });
  });

  return payroll;
}

function generateEmployeePayrollRecords() {
  const rand = seededRandom(700);
  const records = [];
  const periods = [
    { label: 'January 2026', key: '2026-01' },
    { label: 'February 2026', key: '2026-02' },
    { label: 'March 2026', key: '2026-03' },
    { label: 'April 2026', key: '2026-04' },
    { label: 'May 2026', key: '2026-05' },
    { label: 'June 2026', key: '2026-06' },
  ];

  let recId = 1;

  allEmployees.forEach(emp => {
    if (emp.status === 'Inactive') return;

    periods.forEach((period, pIdx) => {
      const baseSalary = emp.salary;
      const hra = Math.round(baseSalary * (0.20 + rand() * 0.10));
      const transport = Math.round(800 + rand() * 1200);
      const medical = Math.round(500 + rand() * 1000);
      const specialAllowance = Math.round(baseSalary * (0.05 + rand() * 0.08));
      const allowances = hra + transport + medical + specialAllowance;

      const bonus = rand() > 0.6 ? Math.round(baseSalary * (0.02 + rand() * 0.08)) : 0;
      const overtimePay = rand() > 0.7 ? Math.round(baseSalary * (0.01 + rand() * 0.05)) : 0;

      const pf = Math.round(baseSalary * 0.12);
      const professionalTax = 200;
      const incomeTax = Math.round(baseSalary * (0.10 + rand() * 0.10));
      const insurance = Math.round(500 + rand() * 800);
      const otherDeductions = rand() > 0.8 ? Math.round(200 + rand() * 500) : 0;
      const totalDeductions = pf + professionalTax + incomeTax + insurance + otherDeductions;

      const grossSalary = baseSalary + allowances + bonus + overtimePay;
      const netSalary = grossSalary - totalDeductions;

      let status;
      if (pIdx < 4) {
        status = 'Paid';
      } else if (pIdx === 4) {
        status = rand() > 0.3 ? 'Paid' : 'Pending';
      } else {
        status = 'Pending';
      }

      const paymentDate = status === 'Paid'
        ? `${period.key}-${String(25 + Math.floor(rand() * 3)).padStart(2, '0')}`
        : null;

      records.push({
        id: `PR-${String(recId).padStart(5, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeAvatar: emp.avatar,
        department: emp.department,
        position: emp.position,
        period: period.label,
        periodKey: period.key,
        baseSalary,
        allowances,
        hra,
        transport,
        medical,
        specialAllowance,
        bonus,
        overtimePay,
        grossSalary,
        pf,
        professionalTax,
        incomeTax,
        insurance,
        otherDeductions,
        totalDeductions,
        netSalary,
        status,
        paymentDate,
      });
      recId++;
    });
  });

  return records;
}

function generatePayPeriods() {
  return [
    { key: '2026-01', label: 'January 2026', status: 'Closed', processedDate: '2026-01-25', employeeCount: 142 },
    { key: '2026-02', label: 'February 2026', status: 'Closed', processedDate: '2026-02-25', employeeCount: 143 },
    { key: '2026-03', label: 'March 2026', status: 'Closed', processedDate: '2026-03-25', employeeCount: 144 },
    { key: '2026-04', label: 'April 2026', status: 'Closed', processedDate: '2026-04-25', employeeCount: 145 },
    { key: '2026-05', label: 'May 2026', status: 'Processing', processedDate: '2026-05-25', employeeCount: 146 },
    { key: '2026-06', label: 'June 2026', status: 'Open', processedDate: null, employeeCount: 148 },
  ];
}

function generateWeeklyAttendance() {
  const rand = seededRandom(500);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return days.map(day => ({
    day,
    present: 115 + Math.floor(rand() * 25),
    absent: 8 + Math.floor(rand() * 15),
    late: 5 + Math.floor(rand() * 12),
    workHours: (7.5 + rand() * 2).toFixed(1),
  }));
}

function generateEmployeeGrowth() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const data = [];
  let count = 128;
  months.forEach(month => {
    count += 2 + Math.floor(Math.random() * 6);
    data.push({ month, count });
  });
  return data;
}

const allEmployees = generateEmployees();
const attendanceData = generateAttendance();
const leaveRequests = generateLeaveRequests();
const payrollData = generatePayrollData();
const employeePayrollRecords = generateEmployeePayrollRecords();
const payPeriods = generatePayPeriods();
const weeklyAttendance = generateWeeklyAttendance();
const employeeGrowth = generateEmployeeGrowth();

export {
  departments,
  allEmployees as employees,
  attendanceData,
  leaveRequests,
  payrollData,
  employeePayrollRecords,
  payPeriods,
  weeklyAttendance,
  employeeGrowth,
};
