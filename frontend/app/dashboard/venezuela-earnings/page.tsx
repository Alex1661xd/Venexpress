'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEarningsPassword } from '@/hooks/useEarningsPassword';
import EarningsPasswordModal from '@/components/EarningsPasswordModal';
import { transactionsService } from '@/services/transactions.service';
import { getLocalDateString, getFirstDayOfMonth } from '@/utils/date';

export default function VenezuelaEarningsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const earningsPassword = useEarningsPassword();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [startDate, setStartDate] = useState(() => getLocalDateString());
  const [endDate, setEndDate] = useState(() => getLocalDateString());
  const [showToday, setShowToday] = useState(true);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showVendorBreakdown, setShowVendorBreakdown] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'admin_venezuela') {
      router.push('/dashboard');
      return;
    }

    // Si no está autenticado, mostrar el modal
    if (!earningsPassword.isAuthenticated) {
      earningsPassword.openAuthModal();
    }
  }, [user, authLoading, router, earningsPassword.isAuthenticated]);

  useEffect(() => {
    if (user?.role === 'admin_venezuela' && earningsPassword.isAuthenticated) {
      loadData();
    }
  }, [user, startDate, endDate, earningsPassword.isAuthenticated]);

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
    const today = getLocalDateString();
    const firstDay = getFirstDayOfMonth();
    setStartDate(firstDay);
    setEndDate(today);
    setShowToday(false);
  };

  // Si no está autenticado, no mostrar el contenido
  if (!earningsPassword.isAuthenticated) {
    return (
      <>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
              <p className="text-gray-600 mb-4">Esta sección requiere autenticación</p>
              <button
                onClick={earningsPassword.openAuthModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ingresar Contraseña
              </button>
            </div>
          </div>
        </div>
        <EarningsPasswordModal
          isOpen={earningsPassword.showModal}
          onClose={earningsPassword.closeAuthModal}
          onAuthenticate={earningsPassword.authenticate}
        />
      </>
    );
  }

  if (loading || authLoading) {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Período</h3>
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setShowToday(false);
              }}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setShowToday(false);
              }}
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 sm:items-end">
            <button
              onClick={handleTodayFilter}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${showToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Hoy
            </button>
            <button
              onClick={handleMonthFilter}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors ${!showToday
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
              {summary.hasTransactionsWithoutPurchaseRate && (
                <p className="text-xs text-green-100 mt-2 bg-white/20 px-2 py-1 rounded border border-white/30">
                  ⚠️ Calculado solo de transacciones con tasa de compra definitiva.
                  {summary.transactionsWithoutPurchaseRateCount && (
                    <> {summary.transactionsWithoutPurchaseRateCount} transacción(es) pendiente(s) de tasa.</>
                  )}
                </p>
              )}
            </div>

            {/* Deuda Total de Colombia */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Deuda de Colombia-Armando</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalDebtFromColombia.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">COP</p>
              {summary.hasTransactionsWithoutPurchaseRate && (
                <p className="text-xs text-amber-100 mt-2 bg-white/20 px-2 py-1 rounded border border-white/30">
                  ⚠️ Calculado solo de transacciones con tasa de compra definitiva.
                  {summary.transactionsWithoutPurchaseRateCount && (
                    <> {summary.transactionsWithoutPurchaseRateCount} transacción(es) pendiente(s) de tasa.</>
                  )}
                </p>
              )}
            </div>

            {/* Total Pagado */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Pagado de Colombia-Armando</h3>
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
                <h3 className="text-sm font-medium opacity-90">Pendiente de Colombia-Armando</h3>
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

          {/* Desglose de Ganancias */}
          <div className="grid grid-cols-1 gap-4">

            {/* Ganancias de sus Vendedores (5%) - Clickeable */}
            <div
              className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:from-violet-600 hover:to-violet-700 transition-all transform hover:scale-105"
              onClick={() => setShowVendorBreakdown(true)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Ganancias de Vendedores Propios</h3>
                <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalEarningsFromOwnVendors.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-xs opacity-75 mt-1">5% de comisión por vendedor (COP)</p>
              <p className="text-xs opacity-75 mt-2">Proviene de: Monto COP × 0.05</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-90">
                <span>Ver desglose por vendedor</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
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

          {/* Cálculo de la Deuda */}
          {summary.transactionDetails && summary.transactionDetails.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Cálculo de la Deuda y Ganancia con Admin Colombia
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Desglose detallado de cómo se calcula la deuda de Colombia con Venezuela
                  </p>
                </div>
                <button
                  onClick={() => setShowTransactionDetails(!showTransactionDetails)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {showTransactionDetails ? 'Ocultar' : 'Ver'} Detalle
                </button>
              </div>

              {/* Explicación de la fórmula */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">
                  📊 Fórmulas aplicadas:
                </h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p>
                    <strong>Deuda de Admin Colombia:</strong>
                  </p>
                  <ul className="ml-4 space-y-1">
                    <li>1. Inversión = Bolívares × Tasa de Compra</li>
                    <li>2. Ganancia del Sistema = COP - Inversión</li>
                    <li>3. Ganancia Admin Venezuela = Ganancia ÷ 2</li>
                    <li className="pt-2 border-t border-blue-300"><strong>DEUDA = Inversión + Ganancia Admin Venezuela</strong></li>
                  </ul>
                  <p className="pt-3 border-t border-blue-300">
                    <strong>Comisión de Vendedores:</strong> COP × 5% (4% si usan tasa personalizada)
                  </p>
                </div>
              </div>

              {showTransactionDetails && (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beneficiario</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">COP</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Bs</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">T. Venta</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">T. Compra</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Inversión</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Gan. Sistema</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Gan. VE</th>
                        <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase bg-amber-50">Deuda</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.transactionDetails.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-gray-600">
                            {new Date(tx.createdAt).toLocaleDateString('es-CO')}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-gray-900 text-xs">
                            {tx.beneficiaryFullName}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-gray-900">
                            ${tx.amountCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-gray-900">
                            {tx.amountBs.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-gray-600">
                            {tx.saleRate.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-gray-600">
                            {tx.purchaseRate.toFixed(2)}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-blue-600 font-medium">
                            ${tx.inversion.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-green-600 font-medium">
                            ${tx.gananciaSistema.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-purple-600 font-medium">
                            ${tx.gananciaAdminVenezuela.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-amber-700 font-bold bg-amber-50">
                            ${tx.deudaConVenezuela.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={6} className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold text-gray-900">
                          TOTAL
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-bold text-blue-600">
                          ${summary.transactionDetails.reduce((sum: number, tx: any) => sum + tx.inversion, 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-bold text-green-600">
                          ${summary.transactionDetails.reduce((sum: number, tx: any) => sum + tx.gananciaSistema, 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-bold text-purple-600">
                          ${summary.transactionDetails.reduce((sum: number, tx: any) => sum + tx.gananciaAdminVenezuela, 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-bold text-amber-700 bg-amber-100">
                          ${summary.totalDebtFromColombia.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Detalle de Comisiones de Vendedores Propios */}
          {summary.ownVendorsCommissionsDetail && summary.ownVendorsCommissionsDetail.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Comisiones de Mis Vendedores
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Desglose de comisiones pagadas a tus vendedores (5% o 4% con tasa personalizada)
                  </p>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 sm:p-4 mb-4">
                <h4 className="text-xs sm:text-sm font-semibold text-violet-900 mb-2">
                  📊 Comisiones de Vendedores:
                </h4>
                <div className="text-xs text-violet-800 space-y-1">
                  <p><strong>Comisión normal:</strong> 5% del monto COP</p>
                  <p><strong>Comisión con tasa personalizada:</strong> 4% del monto COP</p>
                </div>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                      <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beneficiario</th>
                      <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">COP</th>
                      <th className="px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Comisión %</th>
                      <th className="px-2 sm:px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase bg-violet-50">Monto Comisión</th>
                      <th className="px-2 sm:px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {summary.ownVendorsCommissionsDetail.map((detail: any) => (
                      <tr key={detail.id} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-gray-600">
                          {new Date(detail.createdAt).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-gray-900 text-xs">
                          {detail.vendorName}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-gray-900 text-xs">
                          {detail.beneficiaryFullName}
                        </td>
                        <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-gray-900">
                          ${detail.amountCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${detail.hasCustomRate
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                            }`}>
                            {detail.commissionRate}%
                            {detail.hasCustomRate && ' ⚡'}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 py-2 whitespace-nowrap text-right text-violet-600 font-bold bg-violet-50">
                          ${detail.commissionAmount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-2 sm:px-3 py-2 text-center">
                          {detail.isPaid ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Pagado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⏳ Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td colSpan={5} className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-bold text-gray-900">
                        TOTAL COMISIONES
                      </td>
                      <td className="px-2 sm:px-3 py-2 text-right text-xs sm:text-sm font-bold text-violet-700 bg-violet-100">
                        ${summary.totalEarningsFromOwnVendors.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Historial de Pagos */}
          {summary.payments.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Pagos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado por</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Comprobante</th>
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
                        <td className="px-4 py-3 text-center">
                          {payment.proofUrl ? (
                            <a
                              href={payment.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USD Transactions Section */}
          {summary?.usdMetrics && summary.usdMetrics.totalTransactions > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">Transacciones en Dólares (USD)</h3>
                <span className="text-xs text-gray-500 italic">(No incluidas en ganancias/deuda)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700 font-medium mb-1">Total Transacciones USD</p>
                  <p className="text-2xl font-bold text-purple-900">{summary.usdMetrics.totalTransactions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700 font-medium mb-1">Total Dólares Movidos</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${summary.usdMetrics.totalAmountUSD.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium mb-1">Total Bolívares (USD)</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summary.usdMetrics.totalAmountBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Desglose por Tipo:</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <p className="text-xs text-green-700 font-medium">Dólares</p>
                    <p className="text-lg font-bold text-green-900">{summary.usdMetrics.byType.dolares}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-100 rounded-lg">
                    <p className="text-xs text-purple-700 font-medium">PayPal</p>
                    <p className="text-lg font-bold text-purple-900">{summary.usdMetrics.byType.paypal}</p>
                  </div>
                  <div className="text-center p-3 bg-indigo-100 rounded-lg">
                    <p className="text-xs text-indigo-700 font-medium">Zelle</p>
                    <p className="text-lg font-bold text-indigo-900">{summary.usdMetrics.byType.zelle}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Desglose por Vendedor */}
      {showVendorBreakdown && summary?.ownVendorsCommissionsDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Desglose de Comisiones por Vendedor</h2>
                <p className="text-violet-100 text-sm mt-1">
                  Comisiones de vendedores propios de Admin Venezuela
                </p>
              </div>
              <button
                onClick={() => setShowVendorBreakdown(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Resumen por vendedor */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Vendedor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.values(
                    summary.ownVendorsCommissionsDetail.reduce((acc: any, detail: any) => {
                      const vendorName = detail.vendorName;
                      if (!acc[vendorName]) {
                        acc[vendorName] = {
                          vendorName,
                          totalCommission: 0,
                          transactionCount: 0,
                        };
                      }
                      acc[vendorName].totalCommission += detail.commissionAmount;
                      acc[vendorName].transactionCount += 1;
                      return acc;
                    }, {})
                  ).map((vendor: any) => (
                    <div key={vendor.vendorName} className="bg-violet-50 p-4 rounded-lg border border-violet-200">
                      <p className="text-sm font-medium text-violet-900">{vendor.vendorName}</p>
                      <p className="text-2xl font-bold text-violet-700 mt-1">
                        ${vendor.totalCommission.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-violet-600 mt-1">
                        {vendor.transactionCount} transacción{vendor.transactionCount !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla detallada */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Transacciones</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiario</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto COP</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Comisión</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comisión</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pagado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summary.ownVendorsCommissionsDetail
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((detail: any) => (
                          <tr key={detail.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">#{detail.id}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(detail.createdAt).toLocaleDateString('es-CO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{detail.vendorName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{detail.beneficiaryFullName}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                              ${detail.amountCOP.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${detail.hasCustomRate
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                                }`}>
                                {detail.commissionRate}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-violet-700">
                              ${detail.commissionAmount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {detail.isPaid ? (
                                <span className="inline-block px-2 py-1 text-xs font-bold bg-green-100 text-green-800 rounded">
                                  ✓ Pagado
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded">
                                  Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-100 border-t-2 border-gray-200">
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          Total Comisiones:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-violet-700">
                          ${summary.ownVendorsCommissionsDetail
                            .reduce((sum: number, d: any) => sum + d.commissionAmount, 0)
                            .toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
              <button
                onClick={() => setShowVendorBreakdown(false)}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <EarningsPasswordModal
        isOpen={earningsPassword.showModal}
        onClose={earningsPassword.closeAuthModal}
        onAuthenticate={earningsPassword.authenticate}
      />
    </div>
  );
}

