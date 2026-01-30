import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Users, GraduationCap, Shield, Plus, MoreHorizontal, X, Hash, Building, Trash2, Edit3, Check } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { type: 'user'|'dept', data: obj }
    const [loading, setLoading] = useState(true);

    const sidebarItems = [
        { label: 'Overview', path: '/admin', icon: <Shield size={20} /> },
        { label: 'Settings', path: '/admin/settings', icon: <Users size={20} /> },
    ];

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchUsers(), fetchDepartments()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        try {
            const path = type === 'department' ? `/admin/departments/${id}` : `/admin/users/${id}`;
            await api.delete(path);
            toast.success(`${type} deleted successfully`);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || `Failed to delete ${type}`);
        }
    };

    const filteredUsers = users.filter(u => u.role === activeTab);

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div style={{ padding: '40px', height: '100%', overflowY: 'auto' }}>
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Admin Dashboard</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Manage your institution users and settings.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center'
                        }}
                    >
                        <Plus size={20} /> Add New {activeTab === 'departments' ? 'Department' : activeTab === 'admins' ? 'Admin' : activeTab === 'staff' ? 'Staff' : 'Student'}
                    </button>
                </header>

                <StatsGrid users={users} departments={departments} />

                <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--color-border)', marginBottom: '24px' }}>
                    {['staff', 'student', 'admin', 'departments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 4px',
                                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: '600',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'student' ? 'Students' : tab === 'admin' ? 'Admins' : tab === 'departments' ? 'Departments' : 'Staff'}
                        </button>
                    ))}
                </div>

                <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                                <th style={{ padding: '16px' }}>{activeTab === 'departments' ? 'Name' : 'Full Name'}</th>
                                <th style={{ padding: '16px' }}>{activeTab === 'departments' ? 'Code' : 'Email'}</th>
                                <th style={{ padding: '16px' }}>{activeTab === 'departments' ? 'Description' : 'Departments'}</th>
                                <th style={{ padding: '16px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTab === 'departments' ? (
                                departments.map(d => (
                                    <tr key={d.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{d.name}</td>
                                        <td style={{ padding: '16px', fontFamily: 'monospace' }}>{d.code}</td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{d.description || '-'}</td>
                                        <td style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                                            <button onClick={() => setEditingItem({ type: 'department', data: d })} style={{ color: '#3B82F6' }} title="Edit"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete('department', d.id)} style={{ color: '#EF4444' }} title="Delete"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{u.full_name}</td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{u.email}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {u.department_ids?.map(id => {
                                                    const d = departments.find(dept => dept.id === id);
                                                    return d ? <span key={id} style={{ background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{d.code}</span> : null;
                                                })}
                                                {(!u.department_ids || u.department_ids.length === 0) && '-'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                                            <button onClick={() => setEditingItem({ type: 'user', data: u })} style={{ color: '#3B82F6' }} title="Edit"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDelete('user', u.id)} style={{ color: '#EF4444' }} title="Delete"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {((activeTab === 'departments' && departments.length === 0) || (activeTab !== 'departments' && filteredUsers.length === 0)) && (
                                <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showAddModal && (
                    activeTab === 'departments'
                        ? <DepartmentModal onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); loadData(); }} />
                        : <UserModal role={activeTab} departments={departments} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); loadData(); }} />
                )}

                {editingItem && (
                    editingItem.type === 'department'
                        ? <DepartmentModal mode="edit" initialData={editingItem.data} onClose={() => setEditingItem(null)} onSuccess={() => { setEditingItem(null); loadData(); }} />
                        : <UserModal mode="edit" role={editingItem.data.role} departments={departments} initialData={editingItem.data} onClose={() => setEditingItem(null)} onSuccess={() => { setEditingItem(null); loadData(); }} />
                )}
            </div>
        </DashboardLayout>
    );
};

const StatsGrid = ({ users, departments }) => {
    const stats = [
        { label: 'Total Students', value: users.filter(u => u.role === 'student').length, icon: <GraduationCap color="#FF6B4A" /> },
        { label: 'Active Staff', value: users.filter(u => u.role === 'staff').length, icon: <Users color="#3B82F6" /> },
        { label: 'Departments', value: departments.length, icon: <Building color="#8B5CF6" /> },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {stats.map((stat, idx) => (
                <div key={idx} style={{ background: 'white', padding: '24px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {stat.icon}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '2rem', lineHeight: '1' }}>{stat.value}</h3>
                        <div style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>{stat.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const UserModal = ({ mode = 'add', role, departments, initialData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: initialData?.email || '',
        password: '',
        full_name: initialData?.full_name || '',
        department_ids: initialData?.department_ids || []
    });
    const [error, setError] = useState('');

    const toggleDepartment = (id) => {
        setFormData(prev => {
            if (role === 'student') return { ...prev, department_ids: [id] };
            const ids = prev.department_ids.includes(id)
                ? prev.department_ids.filter(i => i !== id)
                : [...prev.department_ids, id];
            return { ...prev, department_ids: ids };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'add') {
                await api.post('/admin/users', { ...formData, role });
                toast.success('User created');
            } else {
                await api.put(`/admin/users/${initialData.id}`, formData);
                toast.success('User updated');
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save user');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '450px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{mode === 'edit' ? 'Edit' : 'Add'} {role}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} required />
                    <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} required />
                    <input type="password" placeholder={mode === 'edit' ? 'Change Password (optional)' : 'Password'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} required={mode === 'add'} />

                    {(role === 'staff' || role === 'student') && (
                        <div>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                                Assign Departments {role === 'student' ? '(Select One)' : '(Select Multiple)'}
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {departments.map(d => (
                                    <button
                                        type="button"
                                        key={d.id}
                                        onClick={() => toggleDepartment(d.id)}
                                        style={{
                                            padding: '8px 12px', borderRadius: '8px', border: '1px solid',
                                            borderColor: formData.department_ids.includes(d.id) ? 'var(--color-primary)' : '#E5E7EB',
                                            background: formData.department_ids.includes(d.id) ? '#FFF7ED' : 'white',
                                            color: formData.department_ids.includes(d.id) ? 'var(--color-primary)' : '#374151',
                                            fontSize: '0.85rem', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                        }}
                                    >
                                        {d.code}
                                        {formData.department_ids.includes(d.id) && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" style={{ marginTop: '8px', background: 'var(--color-primary)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {mode === 'edit' ? 'Update' : 'Create'} Account
                    </button>
                </form>
            </div>
        </div>
    );
};

const DepartmentModal = ({ mode = 'add', initialData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (mode === 'add') {
                await api.post('/admin/departments', formData);
                toast.success('Department created');
            } else {
                await api.put(`/admin/departments/${initialData.id}`, formData);
                toast.success('Department updated');
            }
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save department');
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '400px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>{mode === 'edit' ? 'Edit' : 'Add'} Department</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} required />
                    <input placeholder="Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} required />
                    <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '80px' }} />
                    <button type="submit" style={{ marginTop: '8px', background: 'var(--color-primary)', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}>
                        {mode === 'edit' ? 'Update' : 'Create'} Department
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
