import API from "./api";

export const getEmployees = async () => {
  const res = await API.get("/employees");
  return res.data.employees;
};

export const createEmployee = async (employeeData) => {
  const res = await API.post("/employees", employeeData);
  return res.data.employee;
};

export const updateEmployeeApi = async (mongoId, employeeData) => {
  const res = await API.put(`/employees/${mongoId}`, employeeData);
  return res.data.employee;
};

export const deleteEmployee = async (mongoId) => {
  await API.delete(`/employees/${mongoId}`);
};