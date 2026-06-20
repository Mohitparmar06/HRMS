import React, { createContext, useContext, useState, useCallback } from 'react';
import { departments as initialDepartments, employees as allEmployees } from '../services/dummyData';

const DepartmentContext = createContext(null);

const deptMeta = {
  'DEPT-001': { code: 'ENG', description: 'Responsible for software development, infrastructure, and technical innovation across all products.', officeLocation: 'Building A, Floor 3', createdDate: '2018-03-15' },
  'DEPT-002': { code: 'HR', description: 'Manages recruitment, employee relations, benefits administration, and organizational development.', officeLocation: 'Building A, Floor 1', createdDate: '2018-03-15' },
  'DEPT-003': { code: 'FIN', description: 'Oversees financial planning, accounting, budgeting, and regulatory compliance.', officeLocation: 'Building B, Floor 2', createdDate: '2018-04-01' },
  'DEPT-004': { code: 'S&M', description: 'Drives revenue growth through sales operations, marketing campaigns, and brand management.', officeLocation: 'Building A, Floor 2', createdDate: '2018-05-10' },
  'DEPT-005': { code: 'PM', definition: 'Defines product strategy, roadmap, and ensures alignment between business goals and customer needs.', officeLocation: 'Building A, Floor 3', createdDate: '2019-01-20' },
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

  const getEmployeesByDept = useCallback((deptName) => {
    return allEmployees.filter(e => e.department === deptName);
  }, []);

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
    <DepartmentContext.Provider value={{ departments, addDepartment, updateDepartment, deleteDepartment, getDepartment, getEmployeesByDept, getNextId }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  const ctx = useContext(DepartmentContext);
  if (!ctx) throw new Error('useDepartments must be used within DepartmentProvider');
  return ctx;
}
