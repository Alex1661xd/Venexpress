'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { transactionsService } from '@/services/transactions.service';
import { Transaction } from '@/types/transaction';

export default function TransferHistoryPage() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        loadTransactions();
    }, [selectedStatus, startDate, endDate]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionsService.getTransferHistory(
                selectedStatus !== 'all' ? selectedStatus : undefined,
                startDate || undefined,
                endDate || undefined
            );
            setTransactions(data);
            setCurrentPage(1);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number, currency: 'COP' | 'Bs') => {
        if (currency === 'COP') {
            return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
        }
        return `${amount.toFixed(2)} Bs`;
    };

    const handleViewDetails = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    // Pagination
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

    if (user?.role !== 'admin_venezuela') {
        return (
            <div className="p-4 sm:p-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
                    <p className="text-red-600">Esta sección solo está disponible para administradores de Venezuela.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial de Transferencias</h1>
                <p className="text-gray-600">Revisa el historial de transferencias procesadas.</p>
            </div>

            {/* Filters */}
            <Card className="p-3 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filtros</h3>
                
                {/* Quick Filters */}
                <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Filtros Rápidos</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <button
                            onClick={() => {
                                const today = new Date();
                                const todayStr = today.toISOString().split('T')[0];
                                setStartDate(todayStr);
                                setEndDate(todayStr);
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Hoy
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const fifteenDaysAgo = new Date();
                                fifteenDaysAgo.setDate(today.getDate() - 15);
                                setStartDate(fifteenDaysAgo.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            15 Días
                        </button>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                                setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
                                setEndDate(today.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            Este Mes
                        </button>
                    </div>
                </div>

                {/* Custom Filters */}
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Filtros Personalizados</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Estado</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all"
                            >
                                <option value="all">Todos</option>
                                <option value="completado">Completados</option>
                                <option value="rechazado">Rechazados</option>
                                <option value="cancelado_administrador">Cancelados Admin</option>
                                <option value="cancelado_vendedor">Cancelados Vendedor</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Fecha Inicio</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Fecha Fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-500 focus:ring-2 sm:focus:ring-4 focus:ring-blue-100 transition-all"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSelectedStatus('all');
                                    setStartDate('');
                                    setEndDate('');
                                }}
                                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium transition-colors"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 text-lg">No hay transferencias en el historial</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiario</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banco</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto COP</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto Bs</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tasa</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">#{transaction.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900">{transaction.beneficiaryFullName}</div>
                                                <div className="text-xs text-gray-500">{transaction.beneficiaryDocumentId}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{transaction.beneficiaryBankName}</td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                {formatCurrency(Number(transaction.amountCOP), 'COP')}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm font-semibold text-blue-600">
                                                {formatCurrency(Number(transaction.amountBs), 'Bs')}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                                                {Number(transaction.rateUsed).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge status={transaction.status} />
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(transaction.createdAt).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(transaction)}
                                                    className="text-purple-600 hover:text-purple-900 font-medium text-sm"
                                                >
                                                    Ver detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden space-y-3">
                            {currentTransactions.map((transaction) => (
                                <div key={transaction.id} className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-gray-900">#{transaction.id}</span>
                                        <Badge status={transaction.status} />
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-500">Beneficiario:</span>
                                            <span className="ml-2 text-gray-900 font-medium">{transaction.beneficiaryFullName}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Banco:</span>
                                            <span className="ml-2 text-gray-900">{transaction.beneficiaryBankName}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-green-600">{formatCurrency(Number(transaction.amountCOP), 'COP')}</span>
                                            <span className="font-semibold text-blue-600">{formatCurrency(Number(transaction.amountBs), 'Bs')}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Tasa:</span>
                                            <span className="ml-2 text-gray-900 font-semibold">{Number(transaction.rateUsed).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString('es-CO')}</span>
                                            <button
                                                onClick={() => handleViewDetails(transaction)}
                                                className="text-purple-600 hover:text-purple-900 font-medium text-sm"
                                            >
                                                Ver detalles
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="text-sm text-gray-600">
                                    Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, transactions.length)} de {transactions.length}
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
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
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

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Detalles de la Transferencia"
                size="lg"
            >
                {selectedTransaction && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                            <div>
                                <p className="text-sm text-gray-500">ID de Transacción</p>
                                <p className="text-2xl font-bold text-gray-900">#{selectedTransaction.id}</p>
                            </div>
                            <Badge status={selectedTransaction.status} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-xs text-green-600 font-medium mb-1">Monto COP</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {formatCurrency(Number(selectedTransaction.amountCOP), 'COP')}
                                </p>
                            </div>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-xs text-blue-600 font-medium mb-1">Monto Bs</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {formatCurrency(Number(selectedTransaction.amountBs), 'Bs')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Beneficiario</p>
                                <p className="font-medium text-gray-900">{selectedTransaction.beneficiaryFullName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Documento</p>
                                <p className="font-medium text-gray-900">{selectedTransaction.beneficiaryDocumentId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Banco</p>
                                <p className="font-medium text-gray-900">{selectedTransaction.beneficiaryBankName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Cuenta</p>
                                <p className="font-mono text-sm text-gray-900">{selectedTransaction.beneficiaryAccountNumber}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Tasa Usada</p>
                                <p className="font-semibold text-gray-900">{Number(selectedTransaction.rateUsed).toFixed(2)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Vendedor</p>
                                <p className="font-semibold text-gray-900">{selectedTransaction.createdBy.name}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                                <p className="font-semibold text-gray-900">
                                    {new Date(selectedTransaction.createdAt).toLocaleString('es-CO')}
                                </p>
                            </div>
                        </div>

                        {selectedTransaction.notes && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                <p className="text-xs text-yellow-600 font-medium mb-1">Notas / Motivo</p>
                                <p className="text-sm text-yellow-900">{selectedTransaction.notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

