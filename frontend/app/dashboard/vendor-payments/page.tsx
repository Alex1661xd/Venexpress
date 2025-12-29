'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { transactionsService } from '@/services/transactions.service';
import { Transaction } from '@/types/transaction';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Filters {
  startDate: string;
  endDate: string;
  vendorId?: string;
}

export default function VendorPaymentsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>(() => {
    const today = new Date().toISOString().split('T')[0];
    return { startDate: today, endDate: today };
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [marking, setMarking] = useState<boolean>(false);
  const [totalsByVendor, setTotalsByVendor] = useState<
    { vendorId: number; vendorName: string; totalCommission: number }[]
  >([]);
  const [globalCommission, setGlobalCommission] = useState<number>(0);

  useEffect(() => {
    if (user?.role === 'admin_colombia') {
      loadTransactions();

      const intervalId = setInterval(() => {
        loadTransactions();
      }, 60_000);

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters.startDate, filters.endDate, filters.vendorId]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getHistoryAdminColombia(
        'completado',
        filters.startDate,
        filters.endDate,
        filters.vendorId ? Number(filters.vendorId) : undefined,
      );
      // Filtrar transacciones pendientes de pago de comisión
      const pendingPayment = data.filter(
        (t: Transaction) => !t.isCommissionPaidToVendor,
      );
      setTransactions(pendingPayment);
      setSelectedIds([]);

      // Calcular totales de comisión
      const byVendor: Record<number, { vendorId: number; vendorName: string; totalCommission: number }> = {};
      let global = 0;
      pendingPayment.forEach((tx: Transaction) => {
        const vendorId = (tx.createdBy as any)?.id as number;
        const vendorName = (tx.createdBy as any)?.name || `Vendedor #${vendorId}`;
        const commission = getCommission(tx);
        global += commission;
        if (!byVendor[vendorId]) {
          byVendor[vendorId] = { vendorId, vendorName, totalCommission: 0 };
        }
        byVendor[vendorId].totalCommission += commission;
      });
      setGlobalCommission(global);
      setTotalsByVendor(Object.values(byVendor));
    } catch (error) {
      console.error('Error loading vendor payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const getCommission = (tx: Transaction) => {
    const cop = Number(tx.amountCOP) || 0;
    return cop * 0.02;
  };

  const formatCOP = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);

  const handleMarkPaid = async () => {
    if (selectedIds.length === 0) return;
    try {
      setMarking(true);
      await transactionsService.markVendorCommissionAsPaid(selectedIds);
      await loadTransactions();
    } catch (error) {
      console.error('Error marking commission as paid:', error);
    } finally {
      setMarking(false);
    }
  };

  if (user?.role !== 'admin_colombia') {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <p className="text-sm text-red-600 font-medium">
            Esta sección solo está disponible para Admin Colombia.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Pagos a vendedores
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Administra las comisiones (2%) pagadas a los vendedores sobre las
          transacciones completadas (pendientes de pago).
        </p>
      </div>

      {/* Resumen de comisiones */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Comisión total en el período</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCOP(globalCommission)}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-gray-500 mb-2">Por vendedor</p>
            <div className="flex flex-wrap gap-2">
              {totalsByVendor.map((v) => (
                <span
                  key={v.vendorId}
                  className="px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-800"
                >
                  {v.vendorName}: <span className="font-semibold">{formatCOP(v.totalCommission)}</span>
                </span>
              ))}
              {totalsByVendor.length === 0 && (
                <span className="text-xs text-gray-500">Sin datos para los filtros actuales.</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              ID Vendedor (opcional)
            </label>
            <input
              type="number"
              value={filters.vendorId || ''}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, vendorId: e.target.value }))
              }
              placeholder="Ej: 3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-gray-500">
            Mostrando solo transacciones COMPLETADAS y PENDIENTES DE PAGO.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                setFilters({ startDate: today, endDate: today });
              }}
            >
              Hoy
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={loadTransactions}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Aplicar filtros'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Acciones y resumen */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="text-sm text-gray-700">
            {loading
              ? 'Cargando transacciones...'
              : `${transactions.length} transacciones encontradas`}
          </div>
          <div className="flex items-center gap-3">
            {transactions.length > 0 && (
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={
                    transactions.length > 0 &&
                    selectedIds.length === transactions.length
                  }
                  onChange={toggleSelectAll}
                  className="mr-2"
                />
                Seleccionar todas
              </label>
            )}
            <Button
              variant="primary"
              size="sm"
              disabled={marking || selectedIds.length === 0}
              onClick={handleMarkPaid}
            >
              {marking
                ? 'Marcando...'
                : `Marcar comisión como pagada (${selectedIds.length})`}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">

                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiario
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto COP
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisión 2%
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado comisión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => {
                const commission = getCommission(tx);
                const isSelected = selectedIds.includes(tx.id);
                return (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(tx.id)}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                      {new Date(tx.createdAt).toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {tx.createdBy?.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {tx.beneficiaryFullName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCOP(Number(tx.amountCOP) || 0)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCOP(commission)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center text-xs">
                      {tx.isCommissionPaidToVendor ? (
                        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                          Pagada
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No hay transacciones completadas con tasa de compra para los
                    filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
