import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import API from "../services/api";

const departments = [
  { id: 'DEPT-001', name: 'Engineering', head: 'Sarah Chen', employeeCount: 32, budget: 2850000, color: '#3b82f6' },
  { id: 'DEPT-002', name: 'Human Resources', head: 'Marcus Webb', employeeCount: 12, budget: 980000, color: '#a855f7' },
  { id: 'DEPT-003', name: 'Finance', head: 'Priya Sharma', employeeCount: 15, budget: 1200000, color: '#10b981' },
  { id: 'DEPT-004', name: 'Sales & Marketing', head: "James O'Connor", employeeCount: 22, budget: 1650000, color: '#f59e0b' },
  { id: 'DEPT-005', name: 'Product Management', head: 'Anika Patel', employeeCount: 10, budget: 1100000, color: '#ec4899' },
  { id: 'DEPT-006', name: 'Design', head: 'Lucas Moreau', employeeCount: 14, budget: 1050000, color: '#06b6d4' },
  { id: 'DEPT-007', name: 'Operations', head: 'Fatima Al-Rashid', employeeCount: 18, budget: 1320000, color: '#8b5cf6' },
  { id: 'DEPT-008', name: 'Customer Support', head: 'David Kim', employeeCount: 27, budget: 1480000, color: '#f97316' },
];

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);

  // Load Employees
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await API.get("/employees");

      const mappedEmployees = res.data.employees.map((emp) => ({
        _id: emp._id,

        id: emp.employeeId,

        firstName: emp.fullName?.split(" ")[0] || "",

        lastName:
          emp.fullName?.split(" ").slice(1).join(" ") || "",

        name: emp.fullName,

        email: emp.email,

        phone: emp.phone || "",

        department: emp.department,

        position: emp.designation,

        status: emp.status || "Active",

        salary: emp.salary || 0,

        joinDate: emp.joinDate || "",

        gender: emp.gender || "",

        dob: emp.dob || "",

        address: emp.address || "",

        emergencyName: emp.emergencyName || "",

        emergencyContact: emp.emergencyContact || "",

        profilePicture: emp.profilePicture || "",

        avatar: emp.fullName
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase(),

        performance: emp.performance || 75,

        projectsCompleted: emp.projectsCompleted || 0,

        hoursWorked: emp.hoursWorked || 0,

        lastCheckIn: emp.lastCheckIn || null,
      }));

      setEmployees(mappedEmployees);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Add Employee
  const addEmployee = async (emp) => {
    try {
      await API.post("/employees", {
        employeeId: emp.id,
        fullName: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.position,
        salary: emp.salary,
        status: emp.status,
        phone: emp.phone,
        joinDate: emp.joinDate,
        gender: emp.gender,
        dob: emp.dob,
        address: emp.address,
        emergencyName: emp.emergencyName,
        emergencyContact: emp.emergencyContact,
        profilePicture: emp.profilePicture,
        performance: emp.performance,
        projectsCompleted: emp.projectsCompleted,
        hoursWorked: emp.hoursWorked,
        lastCheckIn: emp.lastCheckIn,
      });

      await fetchEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  // Update Employee
  const updateEmployee = async (id, updates) => {
    try {
      const employee = employees.find((e) => e.id === id);

      if (!employee) return;

      await API.put(`/employees/${employee._id}`, {
        fullName: updates.name,
        email: updates.email,
        department: updates.department,
        designation: updates.position,
        salary: updates.salary,
        status: updates.status,
        phone: updates.phone,
        joinDate: updates.joinDate,
        gender: updates.gender,
        dob: updates.dob,
        address: updates.address,
        emergencyName: updates.emergencyName,
        emergencyContact: updates.emergencyContact,
        profilePicture: updates.profilePicture,
      });

      await fetchEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    try {
      const employee = employees.find((e) => e.id === id);

      if (!employee) return;

      await API.delete(`/employees/${employee._id}`);

      await fetchEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  const getEmployee = useCallback(
    (id) => {
      return employees.find((e) => e.id === id);
    },
    [employees]
  );

  const getNextId = useCallback(() => {
    const maxNum = employees.reduce((max, e) => {
      const num = parseInt(
        e.id.replace("EMP-", ""),
        10
      );

      return num > max ? num : max;
    }, 0);

    return `EMP-${String(maxNum + 1).padStart(
      4,
      "0"
    )}`;
  }, [employees]);

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployee,
        getNextId,
        departments,
        fetchEmployees,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);

  if (!ctx) {
    throw new Error(
      "useEmployees must be used within EmployeeProvider"
    );
  }

  return ctx;
}