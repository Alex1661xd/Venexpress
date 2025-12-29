'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ratesService } from '@/services/rates.service';
import { ExchangeRate } from '@/types/rate';

export default function RatesPage() {
    const { user } = useAuth();
    const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);
    const [rateHistory, setRateHistory] = useState<ExchangeRate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRate, setNewRate] = useState('');
    const [saving, setSaving] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
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
            const [current, history] = await Promise.all([
                ratesService.getCurrentRate(),
                ratesService.getRateHistory(),
            ]);
            setCurrentRate(current);
            setRateHistory(history);
            setCurrentPage(1); // Reset to first page when loading new data
            if (current && current.saleRate !== undefined && current.saleRate !== null) {
                setNewRate(current.saleRate.toString());
            }
        } catch (error) {
            console.error('Error loading rates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRate = () => {
        if (!newRate || parseFloat(newRate) <= 0) {
            setAlertState({
                isOpen: true,
                message: 'Por favor ingresa una tasa válida',
                variant: 'error'
            });
            return;
        }

        setConfirmState({
            isOpen: true,
            message: `¿Estás seguro de actualizar la tasa a ${parseFloat(newRate).toFixed(2)}? Esta tasa se aplicará a todas las nuevas transacciones.`,
            onConfirm: async () => {
                setSaving(true);
                try {
                    await ratesService.updateRate(parseFloat(newRate));
                    setConfirmState({ isOpen: false, message: '', onConfirm: () => { } });
                    setAlertState({
                        isOpen: true,
                        message: 'Tasa actualizada exitosamente',
                        variant: 'success'
                    });
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Tasa de Cambio</h1>
                <p className="text-gray-600">Gestiona la tasa de cambio actual del sistema COP/Bs.</p>
            </div>

            {/* Current Rate Card */}
            <Card className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-green-100 text-sm font-medium mb-2">Tasa Actual</p>
                        <h2 className="text-5xl font-bold">
                            {loading ? '...' : (currentRate ? parseFloat(currentRate.saleRate.toString()).toFixed(2) : '0.00')}
                        </h2>
                        <p className="text-green-100 text-sm mt-2">Bs por cada COP</p>
                        {currentRate && (
                            <p className="text-green-200 text-xs mt-1">
                                Última actualización: {new Date(currentRate.createdAt).toLocaleString('es-CO')}
                            </p>
                        )}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                    </div>
                </div>
            </Card>

            {/* Update Rate Form */}
            {user?.role === 'admin_venezuela' && (
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actualizar Tasa</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                label="Nueva Tasa (Bs/COP)"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newRate}
                                onChange={(e) => setNewRate(e.target.value)}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={handleUpdateRate}
                                isLoading={saving}
                                className="w-full sm:w-auto"
                            >
                                Actualizar Tasa
                            </Button>
                        </div>
                    </div>
                    {newRate && parseFloat(newRate) > 0 && currentRate && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <span className="font-semibold">Previsualización:</span> Con esta tasa, 1,000,000 COP = {(1000000 / parseFloat(newRate)).toFixed(2)} Bs
                            </p>
                            {currentRate && parseFloat(newRate) !== Number(currentRate.saleRate) && (
                                <p className="text-xs text-blue-700 mt-1">
                                    Diferencia con tasa actual: {((parseFloat(newRate) - Number(currentRate.saleRate)) / Number(currentRate.saleRate) * 100).toFixed(2)}%
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            )}

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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasa</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rateHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((rate, index) => {
                                        const globalIndex = (currentPage - 1) * itemsPerPage + index;
                                        return (
                                            <tr key={rate.id} className={globalIndex === 0 ? 'bg-green-50' : ''}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {parseFloat(rate.saleRate.toString()).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(rate.createdAt).toLocaleString('es-CO')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {globalIndex === 0 ? (
                                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                            Actual
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                            Anterior
                                                        </span>
                                                    )}
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

