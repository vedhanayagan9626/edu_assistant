import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Users, GraduationCap, Shield, Plus, MoreHorizontal, X, Hash, Building } from 'lucide-react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('staff');
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showModal, setShowModal] = useState(false);
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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchDepartments()]);
            setLoading(false);
        };
        loadData();
    }, []);

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
                        onClick={() => setShowModal(true)}
                        style={{
                            background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center'
                        }}
                    >
                        <Plus size={20} /> Add New {activeTab === 'departments' ? 'Department' : activeTab === 'admins' ? 'Admin' : activeTab === 'staff' ? 'Staff' : 'Student'}
                    </button>
                </header>

                <StatsGrid users={users} departments={departments} />

                {/* Tabs */}
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

                {/* Content */}
                {activeTab === 'departments' ? (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '16px' }}>Name</th>
                                    <th style={{ padding: '16px' }}>Code</th>
                                    <th style={{ padding: '16px' }}>Description</th>
                                    <th style={{ padding: '16px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.length > 0 ? departments.map(dept => (
                                    <tr key={dept.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{dept.name}</td>
                                        <td style={{ padding: '16px', fontFamily: 'monospace' }}>{dept.code}</td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{dept.description || '-'}</td>
                                        <td style={{ padding: '16px' }}>
                                            <button style={{ color: '#9CA3AF' }}><MoreHorizontal size={20} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>No departments found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.85rem', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ padding: '16px' }}>Name</th>
                                    <th style={{ padding: '16px' }}>Email</th>
                                    <th style={{ padding: '16px' }}>Role</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                    <tr key={user.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{user.full_name || 'N/A'}</td>
                                        <td style={{ padding: '16px', color: '#6B7280' }}>{user.email}</td>
                                        <td style={{ padding: '16px', textTransform: 'capitalize' }}>{user.role}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ background: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600' }}>Active</span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button style={{ color: '#9CA3AF' }}><MoreHorizontal size={20} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && activeTab === 'departments' && (
                    <AddDepartmentModal
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchDepartments();
                        }}
                    />
                )}

                {showModal && activeTab !== 'departments' && (
                    <AddUserModal
                        role={activeTab}
                        departments={departments}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false);
                            fetchUsers();
                        }}
                    />
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

const AddUserModal = ({ role, departments, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        department_id: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/admin/users', {
                ...formData,
                role: role
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create user');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '400px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Add New {role}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />

                    {(role === 'staff' || role === 'student') && (
                        <select
                            value={formData.department_id}
                            onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                            required
                        >
                            <option value="">Select Department...</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                    )}

                    <button type="submit" style={{
                        marginTop: '8px',
                        background: 'var(--color-primary)', color: 'white', padding: '12px',
                        borderRadius: '12px', fontWeight: 'bold'
                    }}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

const AddDepartmentModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/admin/departments', formData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create department');
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '400px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem' }}>Add New Department</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        placeholder="Department Name (e.g. Computer Application)"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />
                    <input
                        placeholder="Code (e.g. MCA)"
                        value={formData.code}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', minHeight: '80px' }}
                    />

                    <button type="submit" style={{
                        marginTop: '8px',
                        background: 'var(--color-primary)', color: 'white', padding: '12px',
                        borderRadius: '12px', fontWeight: 'bold'
                    }}>
                        Create Department
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;
