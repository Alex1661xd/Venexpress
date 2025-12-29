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

  useEffect(() => {
    if (user?.role !== "admin_venezuela") return;
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPending = async (filters: PendingPurchaseRateQuery = query) => {
    try {
      setLoading(true);
      const data = await transactionsService.getPendingPurchaseRateTransactions(filters);
      setTransactions(data);
      setSelectedIds([]);
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error cargando transacciones pendientes de tasa de compra", variant: "error" });
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
    const rate = parseRate();
    if (!rate) {
      setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
      return;
    }
    if (selectedIds.length === 0) {
      setAlertState({ isOpen: true, message: "Selecciona al menos una transacción", variant: "error" });
      return;
    }

    const dto: SetPurchaseRateDto = {
      purchaseRate: rate,
      isFinal,
      transactionIds: selectedIds,
    };

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.bulkSetPurchaseRate(dto);
      await loadPending();
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando tasa de compra a las transacciones seleccionadas", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyToAllFiltered = async () => {
    const rate = parseRate();
    if (!rate) {
      setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
      return;
    }

    const dto: SetPurchaseRateDto = {
      purchaseRate: rate,
      isFinal,
      date: query.startDate || undefined,
    };

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.bulkSetPurchaseRate(dto);
      await loadPending();
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando tasa de compra a las transacciones filtradas", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const applyIndividually = async (id: number) => {
    const rate = parseRate();
    if (!rate) {
      setAlertState({ isOpen: true, message: "Ingresa una tasa de compra válida", variant: "error" });
      return;
    }

    const dto: SetPurchaseRateDto = {
      purchaseRate: rate,
      isFinal,
    };

    try {
      setSaving(true);
      setAlertState({ isOpen: false, message: "", variant: "error" });
      await transactionsService.setPurchaseRate(id, dto);
      await loadPending();
    } catch (e: any) {
      console.error(e);
      setAlertState({ isOpen: true, message: "Error aplicando tasa de compra a la transacción", variant: "error" });
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-2 mt-2 md:mt-0 flex md:flex-col flex-row justify-end items-end gap-2">
            <Button
              variant="primary"
              disabled={saving}
              onClick={applyToSelection}
            >
              Aplicar a seleccionadas
            </Button>
            <Button
              variant="outline"
              disabled={saving}
              onClick={applyToAllFiltered}
            >
              Aplicar a todas filtradas
            </Button>
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
                onChange={(e) => handleDateChange("startDate", e.target.value)}
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
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setQuery({});
                loadPending({});
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            {loading
              ? "Cargando transacciones..."
              : `${transactions.length} transacciones pendientes de tasa de compra`}
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
                      ? Number(tx.saleRate).toFixed(4)
                      : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={() => applyIndividually(tx.id)}
                    >
                      Aplicar
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No hay transacciones pendientes de tasa de compra para los filtros
                    seleccionados.
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
