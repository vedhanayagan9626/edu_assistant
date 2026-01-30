import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BookOpen, Upload, Plus, FileText, CheckCircle, X, Loader2, Edit3, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const StaffDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(null); // subjectId being uploaded
    const [lastUploadedId, setLastUploadedId] = useState(null); // to trigger modal refresh
    const [editingSubject, setEditingSubject] = useState(null);
    const fileInputRef = useRef(null);

    const sidebarItems = [
        { label: 'My Subjects', path: '/staff', icon: <BookOpen size={20} /> },
        { label: 'Performance', path: '/staff/performance', icon: <CheckCircle size={20} /> },
    ];

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/staff/subjects');
            setSubjects(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject? All documents and data will be permanently removed.")) return;

        try {
            await api.delete(`/staff/subjects/${id}`);
            toast.success("Subject deleted successfully");
            fetchSubjects();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete subject");
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchSubjects();
            setLoading(false);
        };
        loadData();
    }, []);

    const handleUploadClick = (subject) => {
        setSelectedSubject(subject);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedSubject) return;

        if (!file.name.endsWith('.pdf')) {
            toast.error("Only PDF files are allowed.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(selectedSubject.id);
        const uploadToast = toast.loading("Uploading and processing PDF...");
        try {
            await api.post(`/staff/subjects/${selectedSubject.id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("File uploaded and processed successfully!", { id: uploadToast });
            fetchSubjects();
            setLastUploadedId(Date.now());
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Upload failed.", { id: uploadToast });
        } finally {
            setUploading(null);
            e.target.value = null; // Reset input
        }
    };

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div style={{ padding: '40px', overflowY: 'auto', height: '100%' }}>
                <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Staff Dashboard</h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>Manage subjects and course materials.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            background: 'var(--color-primary)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: '600', display: 'flex', gap: '8px', alignItems: 'center'
                        }}
                    >
                        <Plus size={20} /> Create New Subject
                    </button>
                </header>

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept=".pdf"
                />

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                        {subjects.length > 0 ? subjects.map(subject => (
                            <div key={subject.id} style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={24} color="#374151" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button onClick={() => setEditingSubject(subject)} style={{ color: '#3B82F6', background: 'none', border: 'none', cursor: 'pointer' }} title="Edit"><Edit3 size={18} /></button>
                                        <button onClick={() => handleDeleteSubject(subject.id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                                        <div style={{ width: '8px' }} />
                                        <span style={{ background: '#EEF2FF', color: '#4F46E5', padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>{subject.code}</span>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{subject.name}</h3>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {subject.description}
                                </p>

                                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '20px', display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setSelectedSubject(subject)}
                                        style={{
                                            flex: 1, padding: '10px',
                                            border: '1px solid #E5E7EB', borderRadius: '10px',
                                            fontSize: '0.9rem', fontWeight: '600', color: '#374151',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}>
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => handleUploadClick(subject)}
                                        disabled={uploading === subject.id}
                                        style={{
                                            flex: 1, padding: '10px',
                                            background: '#FFF7ED', color: '#C2410C',
                                            border: '1px dashed #F97316', borderRadius: '10px',
                                            fontSize: '0.9rem', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            opacity: uploading === subject.id ? 0.7 : 1
                                        }}>
                                        {uploading === subject.id ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                        Upload PDF
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '20px', color: '#9CA3AF' }}>
                                No subjects found. Create one to get started.
                            </div>
                        )}
                    </div>
                )}

                {showCreateModal && (
                    <SubjectModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchSubjects();
                        }}
                    />
                )}

                {editingSubject && (
                    <SubjectModal
                        mode="edit"
                        initialData={editingSubject}
                        onClose={() => setEditingSubject(null)}
                        onSuccess={() => {
                            setEditingSubject(null);
                            fetchSubjects();
                        }}
                    />
                )}

                {selectedSubject && !fileInputRef.current?.matches(':focus-within') && !uploading && (
                    <SubjectDetailsModal
                        subject={selectedSubject}
                        onClose={() => setSelectedSubject(null)}
                        refreshTrigger={lastUploadedId}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

const SubjectDetailsModal = ({ subject, onClose, refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/staff/subjects/${subject.id}/documents`);
                setDocuments(res.data);
            } catch (err) {
                console.error("Could not fetch documents", err);
                toast.error("Failed to load documents list.");
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [subject.id, refreshTrigger]);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', width: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem' }}>{subject.name}</h2>
                        <p style={{ color: 'var(--color-primary)', fontWeight: '600' }}>{subject.code}</p>
                    </div>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>Description</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {subject.description || 'No description provided.'}
                    </p>
                </div>

                <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={20} />
                        Uploaded Documents
                    </h4>
                    {loading ? (
                        <div>Loading documents...</div>
                    ) : documents.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {documents.map(doc => (
                                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F9FAFB', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ color: 'var(--color-primary)' }}><FileText size={18} /></div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{doc.file_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{new Date(doc.upload_date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {doc.is_processed ?
                                            <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '10px' }}>Processed</span>
                                            : <span style={{ fontSize: '0.7rem', color: '#D97706', background: '#FFFBEB', padding: '2px 8px', borderRadius: '10px' }}>Processing...</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '12px' }}>
                            No documents uploaded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SubjectModal = ({ mode = 'add', initialData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        code: initialData?.code || '',
        description: initialData?.description || '',
        department_id: initialData?.department_id || ''
    });
    const [departments, setDepartments] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await api.get('/staff/departments');
                setDepartments(res.data);
                if (mode === 'add' && res.data.length > 0 && !formData.department_id) {
                    setFormData(prev => ({ ...prev, department_id: res.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to load departments", err);
            } finally {
                setLoadingDepts(false);
            }
        };
        fetchDepts();
    }, [mode, formData.department_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.department_id) {
            toast.error("Please select a department");
            return;
        }
        setError('');
        try {
            if (mode === 'add') {
                await api.post('/staff/subjects', formData);
                toast.success("Subject created successfully!");
            } else {
                await api.put(`/staff/subjects/${initialData.id}`, formData);
                toast.success("Subject updated successfully!");
            }
            onSuccess();
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to save subject';
            setError(msg);
            toast.error(msg);
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
                    <h2 style={{ fontSize: '1.5rem' }}>{mode === 'edit' ? 'Edit Subject' : 'Create Subject'}</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                {error && <div style={{ color: 'red', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        placeholder="Subject Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                        required
                    />
                    <input
                        placeholder="Subject Code (e.g. MCA-101)"
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

                    <div>
                        <label style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '4px', display: 'block' }}>Department</label>
                        <select
                            value={formData.department_id}
                            onChange={e => setFormData({ ...formData, department_id: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white' }}
                            required
                        >
                            <option value="">Select department...</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                            ))}
                        </select>
                        {loadingDepts && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>Loading departments...</span>}
                    </div>

                    <button type="submit" disabled={departments.length === 0} style={{
                        marginTop: '8px',
                        background: departments.length === 0 ? '#9CA3AF' : 'var(--color-primary)',
                        color: 'white', padding: '12px',
                        borderRadius: '12px', fontWeight: 'bold',
                        cursor: departments.length === 0 ? 'not-allowed' : 'pointer'
                    }}>
                        {mode === 'edit' ? 'Update Subject' : 'Create Subject'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StaffDashboard;
