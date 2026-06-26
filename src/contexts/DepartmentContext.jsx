import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DepartmentContext = createContext(null);

const DEPT_COLORS = {
  'Engineering': '#3b82f6',
  'Human Resources': '#a855f7',
  'Finance': '#10b981',
  'Sales & Marketing': '#f59e0b',
  'Product Management': '#ec4899',
  'Design': '#06b6d4',
  'Operations': '#8b5cf6',
  'Customer Support': '#f97316',
  'Marketing': '#f97316',
  'Sales': '#f59e0b',
  'Administration': '#6366f1',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#8b5cf6', '#f97316'];

const deptMeta = {
  'Engineering': { code: 'ENG', description: 'Responsible for software development, infrastructure, and technical innovation across all products.', officeLocation: 'Building A, Floor 3' },
  'Human Resources': { code: 'HR', description: 'Manages recruitment, employee relations, benefits administration, and organizational development.', officeLocation: 'Building A, Floor 1' },
  'Finance': { code: 'FIN', description: 'Oversees financial planning, accounting, budgeting, and regulatory compliance.', officeLocation: 'Building B, Floor 2' },
  'Sales & Marketing': { code: 'S&M', description: 'Drives revenue growth through sales operations, marketing campaigns, and brand management.', officeLocation: 'Building A, Floor 2' },
  'Product Management': { code: 'PM', description: 'Defines product strategy, roadmap, and ensures alignment between business goals and customer needs.', officeLocation: 'Building A, Floor 3' },
  'Design': { code: 'DES', description: 'Creates user-centered designs, brand visuals, and maintains design system consistency.', officeLocation: 'Building A, Floor 3' },
  'Operations': { code: 'OPS', description: 'Manages day-to-day operations, supply chain logistics, and process optimization.', officeLocation: 'Building C, Floor 1' },
  'Customer Support': { code: 'CS', description: 'Provides customer assistance, resolves issues, and ensures high satisfaction scores.', officeLocation: 'Building B, Floor 1' },
};

function buildDepartmentsFromEmployees(employees) {
  const deptMap = {};
  for (const emp of employees) {
    const deptName = emp.department;
    if (!deptName) continue;
    if (!deptMap[deptName]) {
      const colorIndex = Object.keys(deptMap).length;
      const meta = deptMeta[deptName] || {};
      deptMap[deptName] = {
        id: `DEPT-${String(colorIndex + 1).padStart(3, '0')}`,
        name: deptName,
        code: meta.code || deptName.slice(0, 3).toUpperCase(),
        description: meta.description || `${deptName} department operations.`,
        officeLocation: meta.officeLocation || 'Main Office',
        employeeCount: 0,
        color: DEPT_COLORS[deptName] || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length],
        status: 'Active',
      };
    }
    deptMap[deptName].employeeCount++;
  }
  return Object.values(deptMap);
}

export function DepartmentProvider({ children, employees = [] }) {
  const [customDepartments, setCustomDepartments] = useState([]);

  const departments = useMemo(() => {
    const dynamicDepts = buildDepartmentsFromEmployees(employees);
    const dynamicNames = new Set(dynamicDepts.map(d => d.name));
    const onlyCustom = customDepartments.filter(d => !dynamicNames.has(d.name));
    return [...dynamicDepts, ...onlyCustom];
  }, [employees, customDepartments]);

  const addDepartment = useCallback((dept) => {
    setCustomDepartments(prev => [...prev, dept]);
  }, []);

  const updateDepartment = useCallback((id, updates) => {
    setCustomDepartments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDepartment = useCallback((id) => {
    setCustomDepartments(prev => prev.filter(d => d.id !== id));
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
