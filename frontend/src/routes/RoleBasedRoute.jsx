import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext/index';
import LoadingAnimation from '../components/loadingAnimation/LoadingAnimation';
import FlowerAnimation from '../components/flowerAnimation/FlowerAnimation';    
const RoleBasedRoute = ({ allowedRoles }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FlowerAnimation />;
    }

    if (loading || !currentUser?.role) {
        return <FlowerAnimation />;
    }

    const normalizedRole = currentUser.role.toLowerCase();

    return allowedRoles.map(r => r.toLowerCase()).includes(normalizedRole)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;
