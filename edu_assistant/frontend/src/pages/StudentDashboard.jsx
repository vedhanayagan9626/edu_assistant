import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { BookOpen, MessageSquare, Clock, GraduationCap } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';
import api from '../api/axios'; // Assuming standard api setup

const StudentDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [activeSubject, setActiveSubject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock data for visual dev if API fails or empty
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                // Try fetching real data
                const res = await api.get('/student/subjects');
                setSubjects(res.data);
            } catch (err) {
                console.error("Failed to fetch subjects", err);
                setSubjects([]); // No fallback
            } finally {
                setLoading(false);
            }
        };
        fetchSubjects();
    }, []);

    const sidebarItems = [
        { label: 'My Subjects', path: '/student', icon: <BookOpen size={20} />, badge: subjects.length.toString() },
        { label: 'Assignments', path: '/student/assignments', icon: <Clock size={20} /> },
        { label: 'Grades', path: '/student/grades', icon: <GraduationCap size={20} /> },
    ];

    if (activeSubject) {
        return (
            <DashboardLayout sidebarItems={sidebarItems}>
                <ChatInterface
                    subject={activeSubject}
                    onBack={() => setActiveSubject(null)}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div style={{ padding: '40px' }}>
                <header style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Welcome back, Student!</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Select a subject to start learning with your AI assistant.</p>
                </header>

                {loading ? (
                    <div>Loading resources...</div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {subjects.map(subject => (
                            <div
                                key={subject.id}
                                onClick={() => setActiveSubject(subject)}
                                style={{
                                    background: 'white',
                                    borderRadius: '20px',
                                    padding: '24px',
                                    boxShadow: 'var(--shadow-sm)',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '48px', height: '48px',
                                    borderRadius: '12px',
                                    background: '#FFF7ED',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--color-primary)',
                                    marginBottom: '20px'
                                }}>
                                    <BookOpen size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{subject.name}</h3>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: '#F3F4F6',
                                    fontSize: '0.8rem',
                                    color: '#6B7280',
                                    marginBottom: '12px'
                                }}>
                                    {subject.code}
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '20px' }}>
                                    {subject.description || 'Access course materials and AI assistance.'}
                                </p>
                                <button style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                    <MessageSquare size={18} />
                                    Start Chat
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default StudentDashboard;
