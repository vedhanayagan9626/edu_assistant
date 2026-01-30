import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Sparkles, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ items = [] }) => {
    const { user, logout } = useAuth();

    return (
        <aside style={{
            width: '260px',
            backgroundColor: 'var(--color-bg-dark)',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px',
            height: '100vh',
            boxSizing: 'border-box'
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '12px' }}>
                <div style={{
                    background: 'rgba(255, 107, 74, 0.2)',
                    borderRadius: '8px',
                    padding: '8px',
                    color: 'var(--color-primary)'
                }}>
                    <Sparkles size={24} />
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>EduAssistant</span>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            color: isActive ? '#FFFFFF' : '#9CA3AF',
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            textDecoration: 'none',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && (
                            <span style={{
                                marginLeft: 'auto',
                                background: 'var(--color-primary)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </NavLink>
                ))}

                {/* Divider/Bottom Links */}
                <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <NavLink to="/settings" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        color: '#9CA3AF', textDecoration: 'none', fontSize: '0.95rem'
                    }}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </NavLink>
                    <NavLink to="/help" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        color: '#9CA3AF', textDecoration: 'none', fontSize: '0.95rem'
                    }}>
                        <HelpCircle size={20} />
                        <span>Updates & FAQ</span>
                    </NavLink>
                </div>
            </nav>

            {/* Pro Card */}
            <div style={{
                background: 'linear-gradient(135deg, #FF6B4A 0%, #E85A3A 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginTop: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        width: '32px', height: '32px',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '12px'
                    }}>
                        <Sparkles size={16} />
                    </div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Pro Plan</h4>
                    <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '16px' }}>
                        Strengthen artificial intelligence!
                    </p>
                    <button style={{
                        background: 'white',
                        color: '#FF6B4A',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        width: '100%'
                    }}>
                        Get Plan
                    </button>
                </div>
                {/* Decorative circles */}
                <div style={{
                    position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute', bottom: -10, right: 30, width: 40, height: 40,
                    background: 'rgba(255,255,255,0.1)', borderRadius: '50%'
                }} />
            </div>

            {/* User Profile / Logout */}
            <div style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: '#374151',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 'bold'
                    }}>
                        {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>{user?.full_name || user?.email || 'Guest'}</span>
                </div>
                <button onClick={logout} style={{ color: '#9CA3AF', padding: '8px' }}>
                    <LogOut size={18} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
