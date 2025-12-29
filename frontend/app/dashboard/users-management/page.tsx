'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usersService } from '@/services/users.service';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    isBanned: boolean;
    createdAt: Date;
}

export default function UsersManagementPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; variant?: 'error' | 'success' | 'warning' | 'info' }>({
        isOpen: false,
        message: '',
        variant: 'info'
    });
    const [confirmState, setConfirmState] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
        isOpen: false,
        message: '',
        onConfirm: () => { }
    });

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== 'admin_colombia') {
            router.push('/dashboard');
            return;
        }
        loadUsers();
    }, [user, authLoading]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await usersService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeRole = async (userId: number, newRole: string, userName: string) => {
        setConfirmState({
            isOpen: true,
            message: `¿Estás seguro de cambiar el rol de ${userName} a ${newRole}?`,
            onConfirm: async () => {
                try {
                    await usersService.changeUserRole(userId, newRole);
                    setAlertState({
                        isOpen: true,
                        message: 'Rol actualizado exitosamente',
                        variant: 'success'
                    });
                    loadUsers();
                } catch (error) {
                    setAlertState({
                        isOpen: true,
                        message: 'Error al actualizar rol',
                        variant: 'error'
                    });
                }
                setConfirmState({ isOpen: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const handleToggleBan = async (userId: number, currentBanStatus: boolean, userName: string) => {
        const action = currentBanStatus ? 'desbanear' : 'banear';
        setConfirmState({
            isOpen: true,
            message: `¿Estás seguro de ${action} a ${userName}?`,
            onConfirm: async () => {
                try {
                    await usersService.toggleBanUser(userId, !currentBanStatus);
                    setAlertState({
                        isOpen: true,
                        message: `Usuario ${action === 'banear' ? 'baneado' : 'desbaneado'} exitosamente`,
                        variant: 'success'
                    });
                    loadUsers();
                } catch (error) {
                    setAlertState({
                        isOpen: true,
                        message: `Error al ${action} usuario`,
                        variant: 'error'
                    });
                }
                setConfirmState({ isOpen: false, message: '', onConfirm: () => { } });
            }
        });
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone.includes(searchTerm);
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin_colombia': return 'bg-purple-100 text-purple-700';
            case 'admin_venezuela': return 'bg-blue-100 text-blue-700';
            case 'vendedor': return 'bg-green-100 text-green-700';
            case 'cliente': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin_colombia': return 'Admin Colombia';
            case 'admin_venezuela': return 'Admin Venezuela';
            case 'vendedor': return 'Vendedor';
            case 'cliente': return 'Cliente';
            default: return role;
        }
    };

    if (user?.role !== 'admin_colombia') {
        return null;
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administra roles y permisos de usuarios</p>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        />
                    </div>
                </Card>

                <Card>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    >
                        <option value="all">Todos los roles</option>
                        <option value="admin_colombia">Admin Colombia</option>
                        <option value="admin_venezuela">Admin Venezuela</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="cliente">Cliente</option>
                    </select>
                </Card>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Cargando usuarios...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredUsers.map((u) => (
                        <Card key={u.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-lg">
                                            {u.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{u.name}</h3>
                                            {u.isBanned && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                                    Baneado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{u.email}</p>
                                        <p className="text-sm text-gray-500">{u.phone}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(u.role)}`}>
                                            {getRoleLabel(u.role)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleChangeRole(u.id, e.target.value, u.name)}
                                        className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm"
                                    >
                                        <option value="admin_colombia">Admin Colombia</option>
                                        <option value="admin_venezuela">Admin Venezuela</option>
                                        <option value="vendedor">Vendedor</option>
                                        <option value="cliente">Cliente</option>
                                    </select>

                                    <button
                                        onClick={() => handleToggleBan(u.id, u.isBanned, u.name)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${u.isBanned
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {u.isBanned ? 'Desbanear' : 'Banear'}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Alert
                isOpen={alertState.isOpen}
                message={alertState.message}
                variant={alertState.variant}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
            />

            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="Confirmar acción"
                message={confirmState.message}
                confirmText="Sí, confirmar"
                cancelText="Cancelar"
                variant="warning"
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: () => { } })}
            />
        </div>
    );
}
