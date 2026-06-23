import React, { createContext, useContext, useState, useCallback } from 'react';
import { employees as initialEmployees, departments } from '../services/dummyData';

const EmployeeContext = createContext(null);

function enrichEmployee(emp) {
  const genders = ['Male', 'Female', 'Non-binary'];
  const rand = emp.id.charCodeAt(4) + emp.id.charCodeAt(5);
  return {
    ...emp,
    gender: genders[rand % 3],
    dob: `${2000 - (rand % 25)}-${String((rand % 12) + 1).padStart(2, '0')}-${String((rand % 28) + 1).padStart(2, '0')}`,
    address: `${100 + rand} Innovation Drive, San Francisco, CA ${94000 + (rand % 100)}`,
    emergencyContact: `+1 (${500 + (rand % 499)}) ${100 + (rand % 900)}-${1000 + (rand % 9000)}`,
    emergencyName: `Contact of ${emp.firstName}`,
    profilePicture: null,
  };
}

const enriched = initialEmployees.map(enrichEmployee);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(enriched);

  const addEmployee = useCallback((emp) => {
    setEmployees(prev => [emp, ...prev]);
  }, []);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEmployee = useCallback((id) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  const getNextId = useCallback(() => {
    const maxNum = employees.reduce((max, e) => {
      const num = parseInt(e.id.replace('EMP-', ''), 10);
      return num > max ? num : max;
    }, 0);
    return `EMP-${String(maxNum + 1).padStart(4, '0')}`;
  }, [employees]);

  return (
    <EmployeeContext.Provider value={{ employees, addEmployee, updateEmployee, deleteEmployee, getEmployee, getNextId, departments }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}
