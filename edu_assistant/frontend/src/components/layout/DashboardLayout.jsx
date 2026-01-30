import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, sidebarItems }) => {
    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'var(--color-bg-dark)', /* Match sidebar bg to prevent white flashes */
            overflow: 'hidden'
        }}>
            <Sidebar items={sidebarItems} />

            <main style={{
                flex: 1,
                backgroundColor: 'var(--color-bg-light)',
                borderTopLeftRadius: '32px',
                borderBottomLeftRadius: '32px',
                overflow: 'hidden', /* Inner scroll */
                display: 'flex',
                flexDirection: 'column',
                marginTop: '12px', /* Small gap for the rounded corner effect */
                marginBottom: '12px',
                marginRight: '12px', /* If we want a margin on the right too */
                boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                position: 'relative'
            }}>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
