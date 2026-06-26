import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import API from "../services/api";

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
  'Engineering & Product': '#3b82f6',
  'Research': '#14b8a6',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6'];

const EmployeeContext = createContext(null);

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([]);

  const departments = useMemo(() => {
    const deptMap = {};
    for (const emp of employees) {
      const deptName = emp.department;
      if (!deptName) continue;
      if (!deptMap[deptName]) {
        const colorIndex = Object.keys(deptMap).length;
        deptMap[deptName] = {
          id: `DEPT-${String(colorIndex + 1).padStart(3, '0')}`,
          name: deptName,
          employeeCount: 0,
          color: DEPT_COLORS[deptName] || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length],
        };
      }
      deptMap[deptName].employeeCount++;
    }
    return Object.values(deptMap);
  }, [employees]);

  const fetchEmployees = useCallback(async () => {
    const token = localStorage.getItem("dayflow-token");
    if (!token) return;
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
      const res = await API.post("/employees", {
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

      return res.data;
    } catch (error) {
      throw error;
    }
  };

  // Update Employee
  const updateEmployee = async (id, updates) => {
    try {
      const employee = employees.find((e) => e.id === id);

      if (!employee) return;

      await API.put(`/employees/${employee._id}`, {
        fullName: updates.name || updates.fullName,
        email: updates.email,
        department: updates.department,
        designation: updates.position || updates.designation,
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