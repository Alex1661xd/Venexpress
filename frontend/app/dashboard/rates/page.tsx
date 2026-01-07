'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ratesService } from '@/services/rates.service';
import { ExchangeRate, RateType } from '@/types/rate';

const RATE_CONFIGS: Record<RateType, { name: string; icon: string; color: string; bgColor: string; description: string }> = {
    [RateType.ACTUAL]: {
        name: 'Tasa Actual',
        icon: '💱',
        color: 'from-green-600 to-emerald-600',
        bgColor: 'bg-green-50 border-green-200',
        description: 'Tasa de cambio general COP/Bs'
    },
    [RateType.PAYPAL]: {
        name: 'Tasa PayPal',
        icon: '💳',
        color: 'from-blue-600 to-cyan-600',
        bgColor: 'bg-blue-50 border-blue-200',
        description: 'Tasa para transacciones PayPal'
    },
    [RateType.ZELLE]: {
        name: 'Tasa Zelle',
        icon: '⚡',
        color: 'from-purple-600 to-pink-600',
        bgColor: 'bg-purple-50 border-purple-200',
        description: 'Tasa para transferencias Zelle'
    },
    [RateType.DOLARES]: {
        name: 'Tasa Dólares',
        icon: '💵',
        color: 'from-yellow-600 to-orange-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
        description: 'Tasa para dólares en efectivo'
    },
    [RateType.BANCO_CENTRAL]: {
        name: 'Valor Dólar Banco Central',
        icon: '🏦',
        color: 'from-gray-700 to-slate-800',
        bgColor: 'bg-gray-50 border-gray-200',
        description: 'Tasa oficial del Banco Central'
    },
};

export default function RatesPage() {
    const { user } = useAuth();
    const [currentRates, setCurrentRates] = useState<Record<RateType, ExchangeRate | null>>({
        [RateType.ACTUAL]: null,
        [RateType.PAYPAL]: null,
        [RateType.ZELLE]: null,
        [RateType.DOLARES]: null,
        [RateType.BANCO_CENTRAL]: null,
    });
    const [rateHistory, setRateHistory] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRate, setEditingRate] = useState<RateType | null>(null);
    const [newRateValue, setNewRateValue] = useState('');
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
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
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allRates, history] = await Promise.all([
                ratesService.getAllCurrentRates(),
                ratesService.getRateHistory(),
            ]);
            setCurrentRates(allRates);
            setRateHistory(history);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error loading rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditRate = (rateType: RateType) => {
        setEditingRate(rateType);
        const currentValue = currentRates[rateType]?.saleRate;
        setNewRateValue(currentValue ? currentValue.toString() : '');
    };

    const handleCancelEdit = () => {
        setEditingRate(null);
        setNewRateValue('');
    };

    const handleUpdateRate = () => {
        if (!editingRate) return;

        if (!newRateValue || parseFloat(newRateValue) <= 0) {
            setAlertState({
                isOpen: true,
                message: 'Por favor ingresa una tasa válida',
                variant: 'error'
            });
            return;
        }

        const rateName = RATE_CONFIGS[editingRate].name;

        setConfirmState({
            isOpen: true,
            message: `¿Estás seguro de actualizar ${rateName} a ${parseFloat(newRateValue).toFixed(2)}?`,
            onConfirm: async () => {
                setSaving(true);
                try {
                    await ratesService.updateRate(editingRate!, parseFloat(newRateValue));
                    setConfirmState({ isOpen: false, message: '', onConfirm: () => { } });
                    setAlertState({
                        isOpen: true,
                        message: `${rateName} actualizada exitosamente`,
                        variant: 'success'
                    });
                    setEditingRate(null);
                    setNewRateValue('');
                    await loadData();
                } catch (error: any) {
                    setConfirmState({ isOpen: false, message: '', onConfirm: () => { } });
                    setAlertState({
                        isOpen: true,
                        message: error.response?.data?.message || 'Error al actualizar la tasa',
                        variant: 'error'
                    });
                } finally {
                    setSaving(false);
                }
            }
        });
    };

    const getRateDisplayName = (rateType: RateType): string => {
        return RATE_CONFIGS[rateType]?.name || rateType;
    };

    if (user?.role !== 'admin_venezuela' && user?.role !== 'admin_colombia') {
        return (
            <div className="p-4 sm:p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
                    <p className="text-red-600">Esta sección solo está disponible para administradores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasas de Cambio</h1>
                <p className="text-gray-600">Gestiona las diferentes tasas de cambio del sistema</p>
            </div>

            {/* Current Rates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {Object.entries(RATE_CONFIGS).map(([rateType, config]) => {
                    const rate = currentRates[rateType as RateType];
                    const isEditing = editingRate === rateType;
                    
                    return (
                        <Card key={rateType} className={`bg-gradient-to-br ${config.color} text-white hover:shadow-lg transition-all`}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">{config.icon}</span>
                                    {user?.role === 'admin_venezuela' && !isEditing && (
                                        <button
                                            onClick={() => handleEditRate(rateType as RateType)}
                                            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                            title="Editar tasa"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                
                                <div>
                                    <p className="text-white/80 text-xs font-medium mb-1">{config.name}</p>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={newRateValue}
                                                onChange={(e) => setNewRateValue(e.target.value)}
                                                className="w-full px-2 py-1 text-gray-900 rounded text-lg font-bold"
                                                autoFocus
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={handleUpdateRate}
                                                    disabled={saving}
                                                    className="flex-1 px-2 py-1 bg-white text-gray-900 rounded text-xs font-medium hover:bg-white/90 disabled:opacity-50"
                                                >
                                                    {saving ? 'Guardando...' : 'Guardar'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                    className="px-2 py-1 bg-white/20 rounded text-xs font-medium hover:bg-white/30"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="text-3xl font-bold">
                                                {loading ? '...' : (rate ? parseFloat(rate.saleRate.toString()).toFixed(2) : 'N/A')}
                                            </h3>
                                            <p className="text-white/70 text-xs mt-1">{config.description}</p>
                                        </>
                                    )}
                                </div>

                                {rate && !isEditing && (
                                    <p className="text-white/60 text-xs pt-2 border-t border-white/20">
                                        {new Date(rate.createdAt).toLocaleDateString('es-CO')}
                                    </p>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Rate History */}
            <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Tasas</h3>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : rateHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay historial de tasas disponible</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasa</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actualizado por</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rateHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rate) => {
                                        const config = RATE_CONFIGS[rate.rateType];
                                        return (
                                            <tr key={rate.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor}`}>
                                                        <span>{config.icon}</span>
                                                        <span className="text-sm font-medium text-gray-900">{config.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {parseFloat(rate.saleRate.toString()).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(rate.createdAt).toLocaleString('es-CO')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {rate.createdBy?.name || 'N/A'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {Math.ceil(rateHistory.length / itemsPerPage) > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="text-sm text-gray-600">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, rateHistory.length)} de {rateHistory.length}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Anterior
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(rateHistory.length / itemsPerPage), prev + 1))}
                                        disabled={currentPage === Math.ceil(rateHistory.length / itemsPerPage)}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Alert */}
            <Alert
                isOpen={alertState.isOpen}
                message={alertState.message}
                variant={alertState.variant}
                onClose={() => setAlertState({ ...alertState, isOpen: false })}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmState.isOpen}
                title="Confirmar actualización"
                message={confirmState.message}
                confirmText="Sí, actualizar"
                cancelText="Cancelar"
                variant="warning"
                onConfirm={confirmState.onConfirm}
                onCancel={() => setConfirmState({ isOpen: false, message: '', onConfirm: () => { } })}
            />
        </div>
    );
}
