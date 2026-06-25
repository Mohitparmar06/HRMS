import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { useDepartments } from '../../contexts/DepartmentContext';
import { useEmployees } from '../../contexts/EmployeeContext';

const colorOptions = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Green', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Orange', value: '#f97316' },
];

export default function EditDepartment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getDepartment, updateDepartment } = useDepartments();
  const { employees } = useEmployees();
  const dept = getDepartment(id);

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  const heads = [...new Set(employees.map(e => e.name))].sort();

  useEffect(() => {
    if (dept) {
      setForm({
        name: dept.name || '',
        code: dept.code || '',
        description: dept.description || '',
        head: dept.head || '',
        officeLocation: dept.officeLocation || '',
        status: dept.status || 'Active',
        color: dept.color || '#3b82f6',
      });
    }
  }, [dept]);

  if (!dept || !form) {
    return (
      <div className="dept-not-found">
        <h2>Department Not Found</h2>
        <p>The department with ID "{id}" does not exist.</p>
        <button className="btn btn-primary" onClick={() => navigate('/admin/departments')}>Back to Departments</button>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Department name is required';
    if (!form.code.trim()) errs.code = 'Department code is required';
    else if (form.code.length > 10) errs.code = 'Code must be 10 characters or less';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.head) errs.head = 'Department head is required';
    if (!form.officeLocation.trim()) errs.officeLocation = 'Office location is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateDepartment(id, {
      name: form.name,
      code: form.code.toUpperCase(),
      head: form.head,
      description: form.description,
      officeLocation: form.officeLocation,
      status: form.status,
      color: form.color,
    });
    navigate(`/admin/departments/${id}`);
  };

  return (
    <div className="dept-form-page">
      <div className="dept-form-header">
        <button className="dept-back-btn" onClick={() => navigate(`/admin/departments/${id}`)}>
          <ArrowLeft size={18} /> Back to Department
        </button>
        <h1>Edit Department</h1>
        <p>Update information for {dept.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="dept-form">
        <div className="dept-form-card">
          <h3><Building2 size={16} /> Department Information</h3>

          <div className="dept-field-row">
            <div className="dept-field">
              <label>Department ID</label>
              <input type="text" value={dept.id} disabled className="dept-input disabled" />
            </div>
          </div>

          <div className="dept-field-row">
            <div className="dept-field">
              <label>Department Name *</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} className={errors.name ? 'error' : ''} />
              {errors.name && <span className="dept-error">{errors.name}</span>}
            </div>
            <div className="dept-field">
              <label>Department Code *</label>
              <input type="text" value={form.code} onChange={e => handleChange('code', e.target.value)} maxLength={10} className={errors.code ? 'error' : ''} />
              {errors.code && <span className="dept-error">{errors.code}</span>}
            </div>
          </div>

          <div className="dept-field-row">
            <div className="dept-field full">
              <label>Description *</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} rows={3} className={errors.description ? 'error' : ''} />
              {errors.description && <span className="dept-error">{errors.description}</span>}
            </div>
          </div>

          <div className="dept-field-row">
            <div className="dept-field">
              <label>Department Head *</label>
              <select value={form.head} onChange={e => handleChange('head', e.target.value)} className={errors.head ? 'error' : ''}>
                <option value="">Select Head</option>
                {heads.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              {errors.head && <span className="dept-error">{errors.head}</span>}
            </div>
            <div className="dept-field">
              <label>Office Location *</label>
              <input type="text" value={form.officeLocation} onChange={e => handleChange('officeLocation', e.target.value)} className={errors.officeLocation ? 'error' : ''} />
              {errors.officeLocation && <span className="dept-error">{errors.officeLocation}</span>}
            </div>
          </div>

          <div className="dept-field-row">
            <div className="dept-field">
              <label>Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="dept-field">
              <label>Color</label>
              <div className="dept-color-picker">
                {colorOptions.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    className={`dept-color-swatch ${form.color === c.value ? 'selected' : ''}`}
                    style={{ background: c.value }}
                    onClick={() => handleChange('color', c.value)}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dept-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/admin/departments/${id}`)}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Save size={16} /> Save Changes</button>
        </div>
      </form>
    </div>
  );
}
