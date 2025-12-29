'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { User } from '@/types/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setUser(response.user);
        return response;
    };

    const register = async (data: {
        name: string;
        email: string;
        phone: string;
        password: string;
    }) => {
        const response = await authService.register(data);
        setUser(response.user);
        return response;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };
}
