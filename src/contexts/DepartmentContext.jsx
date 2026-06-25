import React, { createContext, useContext, useState, useCallback } from 'react';

const DepartmentContext = createContext(null);

const initialDepartments = [
  { id: 'DEPT-001', name: 'Engineering', head: 'Sarah Chen', employeeCount: 32, budget: 2850000, color: '#3b82f6' },
  { id: 'DEPT-002', name: 'Human Resources', head: 'Marcus Webb', employeeCount: 12, budget: 980000, color: '#a855f7' },
  { id: 'DEPT-003', name: 'Finance', head: 'Priya Sharma', employeeCount: 15, budget: 1200000, color: '#10b981' },
  { id: 'DEPT-004', name: 'Sales & Marketing', head: "James O'Connor", employeeCount: 22, budget: 1650000, color: '#f59e0b' },
  { id: 'DEPT-005', name: 'Product Management', head: 'Anika Patel', employeeCount: 10, budget: 1100000, color: '#ec4899' },
  { id: 'DEPT-006', name: 'Design', head: 'Lucas Moreau', employeeCount: 14, budget: 1050000, color: '#06b6d4' },
  { id: 'DEPT-007', name: 'Operations', head: 'Fatima Al-Rashid', employeeCount: 18, budget: 1320000, color: '#8b5cf6' },
  { id: 'DEPT-008', name: 'Customer Support', head: 'David Kim', employeeCount: 27, budget: 1480000, color: '#f97316' },
];

const deptMeta = {
  'DEPT-001': { code: 'ENG', description: 'Responsible for software development, infrastructure, and technical innovation across all products.', officeLocation: 'Building A, Floor 3', createdDate: '2018-03-15' },
  'DEPT-002': { code: 'HR', description: 'Manages recruitment, employee relations, benefits administration, and organizational development.', officeLocation: 'Building A, Floor 1', createdDate: '2018-03-15' },
  'DEPT-003': { code: 'FIN', description: 'Oversees financial planning, accounting, budgeting, and regulatory compliance.', officeLocation: 'Building B, Floor 2', createdDate: '2018-04-01' },
  'DEPT-004': { code: 'S&M', description: 'Drives revenue growth through sales operations, marketing campaigns, and brand management.', officeLocation: 'Building A, Floor 2', createdDate: '2018-05-10' },
  'DEPT-005': { code: 'PM', description: 'Defines product strategy, roadmap, and ensures alignment between business goals and customer needs.', officeLocation: 'Building A, Floor 3', createdDate: '2019-01-20' },
  'DEPT-006': { code: 'DES', description: 'Creates user-centered designs, brand visuals, and maintains design system consistency.', officeLocation: 'Building A, Floor 3', createdDate: '2018-06-01' },
  'DEPT-007': { code: 'OPS', description: 'Manages day-to-day operations, supply chain logistics, and process optimization.', officeLocation: 'Building C, Floor 1', createdDate: '2018-07-15' },
  'DEPT-008': { code: 'CS', description: 'Provides customer assistance, resolves issues, and ensures high satisfaction scores.', officeLocation: 'Building B, Floor 1', createdDate: '2018-08-20' },
};

function enrichDepartments(depts) {
  return depts.map(d => ({
    ...d,
    code: deptMeta[d.id]?.code || d.name.slice(0, 3).toUpperCase(),
    description: deptMeta[d.id]?.description || `${d.name} department operations.`,
    officeLocation: deptMeta[d.id]?.officeLocation || 'Main Office',
    status: 'Active',
    createdDate: deptMeta[d.id]?.createdDate || '2020-01-01',
  }));
}

export function DepartmentProvider({ children }) {
  const [departments, setDepartments] = useState(() => enrichDepartments(initialDepartments));

  const addDepartment = useCallback((dept) => {
    setDepartments(prev => [...prev, dept]);
  }, []);

  const updateDepartment = useCallback((id, updates) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDepartment = useCallback((id) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDepartment = useCallback((id) => {
    return departments.find(d => d.id === id);
  }, [departments]);

  const getNextId = useCallback(() => {
    const maxNum = departments.reduce((max, d) => {
      const num = parseInt(d.id.replace('DEPT-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `DEPT-${String(maxNum + 1).padStart(3, '0')}`;
  }, [departments]);

  return (
    <DepartmentContext.Provider value={{ departments, addDepartment, updateDepartment, deleteDepartment, getDepartment, getNextId }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  const ctx = useContext(DepartmentContext);
  if (!ctx) throw new Error('useDepartments must be used within DepartmentProvider');
  return ctx;
}
