"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { transactionsService } from "@/services/transactions.service";
import { PendingPurchaseRateQuery, SetPurchaseRateDto, Transaction } from "@/types/transaction";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

export default function PurchaseRatesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState<{ isOpen: boolean; message: string; variant: "success" | "error" | "info" }>(
    { isOpen: false, message: "", variant: "error" }
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [purchaseRate, setPurchaseRate] = useState<string>("");
  const [isFinal, setIsFinal] = useState<boolean>(true);
  const [query, setQuery] = useState<PendingPurchaseRateQuery>({});
  const [saving, setSaving] = useState(false);
  const [showWithRate, setShowWithRate] = useState<boolean>(false);
  const [actionMode, setActionMode] = useState<'edit' | 'markFinal' | 'remove'>('edit');

  useEffect(() => {
    if (user?.role !== "admin_venezuela") return;
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showWithRate]);

  const loadPending = async (filters: PendingPurchaseRateQuery = query) => {
    try {
      setLoading(true);
      const data = showWithRate 
        ? await transactionsService.getTransactionsWithPurchaseRate(filters)
        : await transactionsService.getPendingPurchaseRateTransactions(filters);
      setTransactions(data);
      setSelectedIds([]);
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: `Error cargando transacciones ${showWithRate ? 'con tasa de compra' : 'pendientes de tasa de compra'}`, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((t) => t.id));
    }
  };

  const parseRate = (): number | null => {
    const value = parseFloat(purchaseRate);
    if (isNaN(value) || value <= 0) return null;
    return value;
  };

  const applyToSelection = async () => {
    if (selectedIds.length === 0) {
      setAlertState({ isOpen: true, message: "Selecciona al menos una transacción", variant: "error" });
      return;
    }

    const dto: SetPurchaseRateDto = {
      transactionIds: selectedIds,
    };

    if (showWithRate && actionMode === 'remove') {
      // Eliminar tasa de compra
      dto.removeRate = true;
    } else if (showWithRate && actionMode === 'markFinal') {
      // Solo marcar como definitiva (sin cambiar la tasa)
      dto.isFinal = true;
    } else {
      // Editar tasa de compra
      const rate = parseRate();
      if (!rate) {
        setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
        return;
      }
      dto.purchaseRate = rate;
      dto.isFinal = isFinal;
    }

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.bulkSetPurchaseRate(dto);
      await loadPending();
      setAlertState({ isOpen: true, message: showWithRate && actionMode === 'remove' 
        ? "Tasa de compra eliminada exitosamente" 
        : showWithRate && actionMode === 'markFinal'
        ? "Tasas marcadas como definitivas exitosamente"
        : "Tasa de compra aplicada exitosamente", variant: "success" });
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando cambios a las transacciones seleccionadas", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyToAllFiltered = async () => {
    const dto: SetPurchaseRateDto = {
      date: query.startDate || undefined,
    };

    if (showWithRate && actionMode === 'remove') {
      // Eliminar tasa de compra
      dto.removeRate = true;
    } else if (showWithRate && actionMode === 'markFinal') {
      // Solo marcar como definitiva (sin cambiar la tasa)
      dto.isFinal = true;
    } else {
      // Editar tasa de compra
      const rate = parseRate();
      if (!rate) {
        setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
        return;
      }
      dto.purchaseRate = rate;
      dto.isFinal = isFinal;
    }

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.bulkSetPurchaseRate(dto);
      await loadPending();
      setAlertState({ isOpen: true, message: showWithRate && actionMode === 'remove' 
        ? "Tasa de compra eliminada exitosamente" 
        : showWithRate && actionMode === 'markFinal'
        ? "Tasas marcadas como definitivas exitosamente"
        : "Tasa de compra aplicada exitosamente", variant: "success" });
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando cambios a las transacciones filtradas", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyIndividually = async (id: number, action?: 'edit' | 'markFinal' | 'remove') => {
    const mode = action || actionMode;
    const dto: SetPurchaseRateDto = {};
    const transaction = transactions.find(t => t.id === id);

    if (mode === 'remove') {
      // Eliminar tasa de compra
      dto.removeRate = true;
    } else if (mode === 'markFinal') {
      // Solo marcar como definitiva (sin cambiar la tasa)
      dto.isFinal = true;
    } else {
      // Editar tasa de compra
      // Si hay una tasa en el formulario, usarla; si no, usar la tasa actual de la transacción
      let rate = parseRate();
      if (!rate && transaction && transaction.purchaseRate !== undefined && transaction.purchaseRate !== null) {
        // Usar la tasa actual de la transacción si no hay una nueva en el formulario
        rate = parseFloat(transaction.purchaseRate.toString());
        setPurchaseRate(rate.toString());
      }
      if (!rate) {
        setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
        return;
      }
      dto.purchaseRate = rate;
      dto.isFinal = isFinal;
    }

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.setPurchaseRate(id, dto);
      await loadPending();
      setAlertState({ isOpen: true, message: mode === 'remove' 
        ? "Tasa de compra eliminada exitosamente" 
        : mode === 'markFinal'
        ? "Tasa marcada como definitiva exitosamente"
        : "Tasa de compra aplicada exitosamente", variant: "success" });
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando cambios a la transacción", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const newQuery = { ...query, [field]: value || undefined };
    setQuery(newQuery);
    loadPending(newQuery);
  };

  if (user?.role !== "admin_venezuela") {
    return (
      <div className="p-4">
        <Alert isOpen={true} message="No tienes permiso para ver esta página." variant="error" onClose={() => { }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasa de Compra</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona la tasa de compra de los giros ya completados que aún no tienen tasa asignada.
          </p>
        </div>
      </div>

      <Alert
        isOpen={alertState.isOpen}
        message={alertState.message}
        variant={alertState.variant}
        onClose={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}
      />

      <Card>
        <div className="space-y-4">
          {showWithRate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción a realizar
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActionMode('edit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    actionMode === 'edit'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Editar Tasa
                </button>
                <button
                  type="button"
                  onClick={() => setActionMode('markFinal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    actionMode === 'markFinal'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Marcar como Definitiva
                </button>
                <button
                  type="button"
                  onClick={() => setActionMode('remove')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    actionMode === 'remove'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Eliminar Tasa
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {actionMode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tasa de compra (Bs/COP)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 215.50"
                />
              </div>
            )}
            {actionMode === 'edit' && !showWithRate && (
              <div className="flex items-center mt-4 md:mt-7">
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFinal}
                    onChange={(e) => setIsFinal(e.target.checked)}
                    className="mr-2"
                  />
                  Marcar como tasa final
                </label>
              </div>
            )}
            {actionMode === 'edit' && showWithRate && (
              <div className="flex items-center mt-4 md:mt-7">
                <label className="inline-flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isFinal}
                    onChange={(e) => setIsFinal(e.target.checked)}
                    className="mr-2"
                  />
                  Marcar como definitiva al editar
                </label>
              </div>
            )}
            {(actionMode === 'markFinal' || actionMode === 'remove') && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">
                  {actionMode === 'markFinal' 
                    ? 'Se marcarán las tasas de compra como definitivas sin modificarlas.'
                    : 'Se eliminarán las tasas de compra de las transacciones seleccionadas.'}
                </p>
              </div>
            )}
            <div className="space-y-2 mt-2 md:mt-0 flex md:flex-col flex-row justify-end items-end gap-2">
              <Button
                variant="primary"
                disabled={saving || (actionMode === 'edit' && !purchaseRate)}
                onClick={applyToSelection}
              >
                {actionMode === 'edit' ? 'Aplicar a seleccionadas' : 
                 actionMode === 'markFinal' ? 'Marcar seleccionadas' : 
                 'Eliminar de seleccionadas'}
              </Button>
              <Button
                variant="outline"
                disabled={saving || (actionMode === 'edit' && !purchaseRate)}
                onClick={applyToAllFiltered}
              >
                {actionMode === 'edit' ? 'Aplicar a todas filtradas' : 
                 actionMode === 'markFinal' ? 'Marcar todas filtradas' : 
                 'Eliminar de todas filtradas'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha desde
              </label>
              <input
                type="date"
                value={query.startDate || ""}
                onChange={(e) => setQuery({ ...query, startDate: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fecha hasta
              </label>
              <input
                type="date"
                value={query.endDate || ""}
                onChange={(e) => setQuery({ ...query, endDate: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setQuery({});
                loadPending({});
              }}
            >
              Limpiar filtros
            </Button>
            <label className="inline-flex items-center text-sm text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showWithRate}
                onChange={(e) => setShowWithRate(e.target.checked)}
                className="mr-2"
              />
              {showWithRate ? 'Mostrar pendientes' : 'Mostrar con tasa'}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            {loading
              ? "Cargando transacciones..."
              : `${transactions.length} transacciones ${showWithRate ? 'pendientes de tasa de compra' : 'con tasa de compra'}`}
          </div>
          {transactions.length > 0 && (
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                checked={selectedIds.length === transactions.length}
                onChange={handleSelectAll}
                className="mr-2"
              />
              Seleccionar todas
            </label>
          )}
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

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
                  Monto Bs
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa venta
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa compra
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(tx.id)}
                      onChange={() => handleToggleSelect(tx.id)}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-600">
                    {new Date(tx.createdAt).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {tx.createdBy?.name}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {tx.beneficiaryFullName}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                    {Number(tx.amountCOP).toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-900">
                    {Number(tx.amountBs).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-900">
                    {tx.saleRate !== undefined
                      ? Number(tx.saleRate).toFixed(2)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center text-sm text-gray-900">
                    {tx.purchaseRate !== undefined && tx.purchaseRate !== null
                      ? Number(tx.purchaseRate).toFixed(2)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    {showWithRate ? (
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => applyIndividually(tx.id, 'edit')}
                          title="Editar tasa"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => applyIndividually(tx.id, 'markFinal')}
                          title="Marcar como definitiva"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                        >
                          Final
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => applyIndividually(tx.id, 'remove')}
                          title="Eliminar tasa"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        >
                          Eliminar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={saving}
                        onClick={() => applyIndividually(tx.id)}
                      >
                        Aplicar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No hay transacciones {showWithRate ? 'con tasa de compra' : 'pendientes de tasa de compra'} para los filtros seleccionados.
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
