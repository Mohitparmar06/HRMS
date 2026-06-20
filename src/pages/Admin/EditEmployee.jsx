import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, User } from 'lucide-react';
import { useEmployees } from '../../contexts/EmployeeContext';
import { departments } from '../../services/dummyData';

const positionsByDept = {
  'Engineering': ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'Data Analyst', 'DevOps Engineer', 'QA Engineer', 'Technical Writer'],
  'Human Resources': ['HR Specialist', 'HR Manager', 'Recruiter', 'Payroll Analyst'],
  'Finance': ['Financial Analyst', 'Accountant', 'Finance Manager', 'Controller'],
  'Sales & Marketing': ['Sales Representative', 'Account Executive', 'Marketing Specialist', 'Sales Manager'],
  'Product Management': ['Product Manager', 'Senior Product Manager', 'Product Analyst'],
  'Design': ['UI/UX Designer', 'Senior Designer', 'Design Lead'],
  'Operations': ['Operations Analyst', 'Operations Manager', 'Supply Chain Specialist'],
  'Customer Support': ['Support Specialist', 'Support Lead', 'Customer Success Manager'],
};

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getEmployee, updateEmployee } = useEmployees();
  const emp = getEmployee(id);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    if (emp) {
      setForm({
        firstName: emp.firstName || '',
        lastName: emp.lastName || '',
        email: emp.email || '',
        phone: emp.phone || '',
        gender: emp.gender || '',
        dob: emp.dob || '',
        department: emp.department || '',
        position: emp.position || '',
        joinDate: emp.joinDate || '',
        salary: emp.salary || '',
        address: emp.address || '',
        emergencyName: emp.emergencyName || '',
        emergencyContact: emp.emergencyContact || '',
        status: emp.status || 'Active',
      });
      setProfilePreview(emp.profilePicture || null);
    }
  }, [emp]);

  if (!emp || !form) {
    return (
      <div className="emp-not-found">
        <h2>Employee Not Found</h2>
        <p>The employee with ID "{id}" does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/employees')}>Back to Employees</button>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (!form.gender) errs.gender = 'Gender is required';
    if (!form.dob) errs.dob = 'Date of birth is required';
    if (!form.department) errs.department = 'Department is required';
    if (!form.position) errs.position = 'Designation is required';
    if (!form.joinDate) errs.joinDate = 'Joining date is required';
    if (!form.salary) errs.salary = 'Salary is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateEmployee(id, {
      firstName: form.firstName,
      lastName: form.lastName,
      name: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      avatar: `${form.firstName[0]}${form.lastName[0]}`.toUpperCase(),
      department: form.department,
      departmentId: departments.find(d => d.name === form.department)?.id || '',
      position: form.position,
      status: form.status,
      salary: parseInt(form.salary, 10),
      joinDate: form.joinDate,
      gender: form.gender,
      dob: form.dob,
      address: form.address,
      emergencyName: form.emergencyName,
      emergencyContact: form.emergencyContact,
      profilePicture: profilePreview,
    });
    navigate(`/admin/employees/${id}`);
  };

  const availablePositions = form.department ? (positionsByDept[form.department] || []) : [];

  return (
    <div className="emp-form-page">
      <div className="emp-form-header">
        <button className="emp-back-btn" onClick={() => navigate(`/admin/employees/${id}`)}>
          <ArrowLeft size={18} /> Back to Profile
        </button>
        <h1>Edit Employee</h1>
        <p>Update information for {emp.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="emp-form">
        <div className="emp-form-grid">
          <div className="emp-form-section">
            <h3>Personal Information</h3>

            <div className="emp-photo-upload">
              <div className="emp-photo-preview">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" />
                ) : (
                  <User size={32} />
                )}
              </div>
              <label className="emp-photo-btn">
                <Upload size={14} /> Change Photo
                <input type="file" accept="image/*" onChange={handlePhoto} hidden />
              </label>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Employee ID</label>
                <input type="text" value={emp.id} disabled className="emp-input disabled" />
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>First Name *</label>
                <input type="text" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} className={errors.firstName ? 'error' : ''} />
                {errors.firstName && <span className="emp-error">{errors.firstName}</span>}
              </div>
              <div className="emp-field">
                <label>Last Name *</label>
                <input type="text" value={form.lastName} onChange={e => handleChange('lastName', e.target.value)} className={errors.lastName ? 'error' : ''} />
                {errors.lastName && <span className="emp-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} className={errors.email ? 'error' : ''} />
                {errors.email && <span className="emp-error">{errors.email}</span>}
              </div>
              <div className="emp-field">
                <label>Phone Number *</label>
                <input type="tel" value={form.phone} onChange={e => handleChange('phone', e.target.value)} className={errors.phone ? 'error' : ''} />
                {errors.phone && <span className="emp-error">{errors.phone}</span>}
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Gender *</label>
                <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} className={errors.gender ? 'error' : ''}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
                {errors.gender && <span className="emp-error">{errors.gender}</span>}
              </div>
              <div className="emp-field">
                <label>Date of Birth *</label>
                <input type="date" value={form.dob} onChange={e => handleChange('dob', e.target.value)} className={errors.dob ? 'error' : ''} />
                {errors.dob && <span className="emp-error">{errors.dob}</span>}
              </div>
            </div>
          </div>

          <div className="emp-form-section">
            <h3>Employment Details</h3>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Department *</label>
                <select value={form.department} onChange={e => { handleChange('department', e.target.value); handleChange('position', ''); }} className={errors.department ? 'error' : ''}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
                {errors.department && <span className="emp-error">{errors.department}</span>}
              </div>
              <div className="emp-field">
                <label>Designation *</label>
                <select value={form.position} onChange={e => handleChange('position', e.target.value)} disabled={!form.department} className={errors.position ? 'error' : ''}>
                  <option value="">Select Designation</option>
                  {availablePositions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {errors.position && <span className="emp-error">{errors.position}</span>}
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Joining Date *</label>
                <input type="date" value={form.joinDate} onChange={e => handleChange('joinDate', e.target.value)} className={errors.joinDate ? 'error' : ''} />
                {errors.joinDate && <span className="emp-error">{errors.joinDate}</span>}
              </div>
              <div className="emp-field">
                <label>Annual Salary (USD) *</label>
                <input type="number" value={form.salary} onChange={e => handleChange('salary', e.target.value)} className={errors.salary ? 'error' : ''} />
                {errors.salary && <span className="emp-error">{errors.salary}</span>}
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Status</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="emp-field-row">
              <div className="emp-field full">
                <label>Address</label>
                <input type="text" value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder="Street address, city, state, zip" />
              </div>
            </div>

            <h3>Emergency Contact</h3>

            <div className="emp-field-row">
              <div className="emp-field">
                <label>Contact Name</label>
                <input type="text" value={form.emergencyName} onChange={e => handleChange('emergencyName', e.target.value)} />
              </div>
              <div className="emp-field">
                <label>Contact Phone</label>
                <input type="tel" value={form.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="emp-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/admin/employees/${id}`)}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Save size={16} /> Save Changes</button>
        </div>
      </form>
    </div>
  );
}
