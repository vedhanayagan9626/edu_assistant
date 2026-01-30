import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Shield, GraduationCap } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                const user = await login(username, password);
                if (user) {
                    if (user.role === 'admin') navigate('/admin');
                    else if (user.role === 'staff') navigate('/staff');
                    else navigate('/student');
                }
            } else {
                // Default registration is student for now
                await register(username, password, 'student');
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Left Side - Visual */}
            <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1A1D21 0%, #2D3748 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                padding: '40px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(255,107,74,0.2) 0%, rgba(0,0,0,0) 70%)',
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        width: '64px', height: '64px',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '32px',
                        marginInline: 'auto',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <Sparkles size={32} color="#FF6B4A" />
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '16px', fontWeight: 'bold' }}>EduAssistant</h1>
                    <p style={{ fontSize: '1.2rem', color: '#A0AEC0', lineHeight: '1.6' }}>
                        Empower your learning journey with AI-driven insights and personalized assistance.
                    </p>

                    <div style={{ marginTop: '60px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <FeatureIcon icon={<Shield />} label="Secure" />
                        <FeatureIcon icon={<BookOpen />} label="Smart" />
                        <FeatureIcon icon={<GraduationCap />} label="Proven" />
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                padding: '40px'
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#1A1D21' }}>
                        {isLogin ? 'Welcome back' : 'Create account'}
                    </h2>
                    <p style={{ color: '#6B7280', marginBottom: '40px' }}>
                        {isLogin ? 'Enter your details to access your account' : 'Start your journey with us today'}
                    </p>

                    {error && (
                        <div style={{
                            background: '#FEF2F2', color: '#DC2626', padding: '12px',
                            borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    fontSize: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>

                        <button type="submit" style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: '#FF6B4A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.1s'
                        }}>
                            {isLogin ? 'Sign In' : 'Sign Up'}
                            <ArrowRight size={20} />
                        </button>
                    </form>

                    <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.9rem', color: '#6B7280' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{
                                color: '#FF6B4A',
                                fontWeight: '600',
                                padding: 0,
                                backgroundColor: 'transparent'
                            }}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureIcon = ({ icon, label }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{
            width: '48px', height: '48px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FF6B4A'
        }}>
            {icon}
        </div>
        <span style={{ fontSize: '0.8rem', color: '#CBD5E0' }}>{label}</span>
    </div>
);

export default Login;
