'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionsService } from '@/services/transactions.service';
import { getLocalDateString, getFirstDayOfMonth } from '@/utils/date';

export default function VenezuelaEarningsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLocalDateString());
  const [showToday, setShowToday] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin_venezuela') {
      loadData();
    }
  }, [user, startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getAdminVenezuelaFinancialSummary(startDate, endDate);
      setSummary(data);
    } catch (error) {
      console.error('Error loading financial summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTodayFilter = () => {
    const today = getLocalDateString();
    setStartDate(today);
    setEndDate(today);
    setShowToday(true);
  };

  const handleMonthFilter = () => {
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLocalDateString());
    setShowToday(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Ganancias y Deuda
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Resumen financiero de Admin Venezuela
          </p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setShowToday(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setShowToday(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTodayFilter}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={handleMonthFilter}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !showToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Este Mes
            </button>
          </div>
        </div>
      </div>

      {/* Resumen de Métricas */}
      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ganancias de Venezuela */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Mis Ganancias</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalEarnings.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">COP</p>
            </div>

            {/* Deuda Total de Colombia */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Deuda de Colombia</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalDebtFromColombia.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">COP</p>
            </div>

            {/* Total Pagado */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Pagado</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalPaid.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">COP</p>
            </div>

            {/* Deuda Pendiente */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Pendiente</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.pendingDebt.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">COP</p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Período</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transacciones</p>
                  <p className="text-xl font-bold text-gray-900">{summary.transactionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pagos Recibidos</p>
                  <p className="text-xl font-bold text-gray-900">{summary.payments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          {summary.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado por</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.payments.map((payment: any) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.paidBy}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                          ${payment.amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

