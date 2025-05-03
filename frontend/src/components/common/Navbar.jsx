import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ setOpenSidebar }) => {
    const { currentUser } = useAuth();

    return (
        <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                <button onClick={() => setOpenSidebar(true)} className="lg:hidden">
                    <Bars3Icon className="h-6 w-6" />
                </button>
                <div className="text-xl font-bold lg:hidden">Admin Portal</div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium hidden md:inline">
                        {currentUser?.email || 'admin@example.com'}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;