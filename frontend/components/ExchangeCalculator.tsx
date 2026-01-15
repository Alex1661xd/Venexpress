'use client';

import { useState, useEffect } from 'react';
import { RateType, ExchangeRate } from '@/types/rate';

type CalculatorType = 'actual' | 'dolares' | 'paypal' | 'zelle';

interface ExchangeCalculatorProps {
    rates: {
        actual: ExchangeRate | null;
        banco_central: ExchangeRate | null;
        paypal: ExchangeRate | null;
        zelle: ExchangeRate | null;
    };
    isOpen: boolean;
    onClose: () => void;
}



export default function ExchangeCalculator({ rates, isOpen, onClose }: ExchangeCalculatorProps) {
    const [calculatorType, setCalculatorType] = useState<CalculatorType>('actual');
    const [amountCOP, setAmountCOP] = useState('');
    const [amountBs, setAmountBs] = useState('');
    const [amountUSD, setAmountUSD] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setAmountCOP('');
            setAmountBs('');
            setAmountUSD('');
            setCalculatorType('actual');
        }
    }, [isOpen]);

    const formatCOP = (value: number) => {
        return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value);
    };

    const formatUSD = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    // Calculadora Actual: COP ↔ Bs
    const handleCOPChangeActual = (value: string) => {
        const rawValue = value.replace(/\./g, '');
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
            if (rawValue === '') {
                setAmountCOP('');
                setAmountBs('');
                return;
            }
            const cop = parseFloat(rawValue);
            setAmountCOP(formatCOP(cop));
            const rate = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;
            if (rate > 0) {
                const bs = cop / rate;
                setAmountBs(Math.round(bs).toString());
            }
        }
    };

    const handleBsChangeActual = (value: string) => {
        setAmountBs(value);
        if (value && !isNaN(parseFloat(value))) {
            const bs = parseFloat(value);
            const rate = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;
            if (rate > 0) {
                const cop = bs * rate;
                setAmountCOP(formatCOP(cop));
            }
        } else {
            setAmountCOP('');
        }
    };

    // Calculadora Dólares: USD ↔ COP ↔ Bs (bidireccional)
    const handleUSDChangeDolares = (value: string) => {
        const rawValue = value.replace(/[^\d.]/g, '');
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            setAmountUSD(rawValue);
            if (rawValue === '' || rawValue === '.') {
                setAmountCOP('');
                setAmountBs('');
                return;
            }
            const usd = parseFloat(rawValue);
            if (!isNaN(usd) && usd > 0) {
                const bancoCentralRate = rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()) : 0;
                const actualRate = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;

                // USD → COP: USD × banco_central × tasa_actual
                if (bancoCentralRate > 0 && actualRate > 0) {
                    const cop = usd * bancoCentralRate * actualRate;
                    setAmountCOP(formatCOP(cop));
                }

                // USD → Bs: USD × banco_central
                if (bancoCentralRate > 0) {
                    const bs = usd * bancoCentralRate;
                    setAmountBs(Math.round(bs).toString());
                }
            }
        }
    };

    const handleCOPChangeDolares = (value: string) => {
        const rawValue = value.replace(/\./g, '');
        if (rawValue === '' || /^\d+$/.test(rawValue)) {
            if (rawValue === '') {
                setAmountCOP('');
                setAmountUSD('');
                setAmountBs('');
                return;
            }
            const cop = parseFloat(rawValue);
            setAmountCOP(formatCOP(cop));

            const bancoCentralRate = rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()) : 0;
            const actualRate = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;

            // COP → USD: COP / (banco_central × tasa_actual)
            if (bancoCentralRate > 0 && actualRate > 0) {
                const usd = cop / (bancoCentralRate * actualRate);
                setAmountUSD(formatUSD(usd));

                // USD → Bs: USD × banco_central
                const bs = usd * bancoCentralRate;
                setAmountBs(Math.round(bs).toString());
            }
        }
    };

    const handleBsChangeDolares = (value: string) => {
        setAmountBs(value);
        if (value && !isNaN(parseFloat(value))) {
            const bs = parseFloat(value);
            const bancoCentralRate = rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()) : 0;
            const actualRate = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;

            // Bs → USD: Bs / banco_central
            if (bancoCentralRate > 0) {
                const usd = bs / bancoCentralRate;
                setAmountUSD(formatUSD(usd));

                // USD → COP: USD × banco_central × tasa_actual
                if (actualRate > 0) {
                    const cop = usd * bancoCentralRate * actualRate;
                    setAmountCOP(formatCOP(cop));
                }
            }
        } else {
            setAmountUSD('');
            setAmountCOP('');
        }
    };

    // Calculadora PayPal: USD → Bs
    const handleUSDChangePaypal = (value: string) => {
        const rawValue = value.replace(/[^\d.]/g, '');
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            setAmountUSD(rawValue);
            if (rawValue === '' || rawValue === '.') {
                setAmountBs('');
                return;
            }
            const usd = parseFloat(rawValue);
            if (!isNaN(usd) && usd > 0) {
                const paypalRate = rates.paypal?.saleRate ? parseFloat(rates.paypal.saleRate.toString()) : 0;
                if (paypalRate > 0) {
                    const bs = usd * paypalRate;
                    setAmountBs(Math.round(bs).toString());
                }
            }
        }
    };

    // Calculadora Zelle: USD → Bs
    const handleUSDChangeZelle = (value: string) => {
        const rawValue = value.replace(/[^\d.]/g, '');
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            setAmountUSD(rawValue);
            if (rawValue === '' || rawValue === '.') {
                setAmountBs('');
                return;
            }
            const usd = parseFloat(rawValue);
            if (!isNaN(usd) && usd > 0) {
                const zelleRate = rates.zelle?.saleRate ? parseFloat(rates.zelle.saleRate.toString()) : 0;
                if (zelleRate > 0) {
                    const bs = usd * zelleRate;
                    setAmountBs(Math.round(bs).toString());
                }
            }
        }
    };

    // Calculadora PayPal: Bs → USD
    const handleBsChangePaypal = (value: string) => {
        setAmountBs(value);
        if (value && !isNaN(parseFloat(value))) {
            const bs = parseFloat(value);
            const paypalRate = rates.paypal?.saleRate ? parseFloat(rates.paypal.saleRate.toString()) : 0;

            // Bs → USD: Bs / tasa_paypal
            if (paypalRate > 0) {
                const usd = bs / paypalRate;
                setAmountUSD(formatUSD(usd));
            }
        } else {
            setAmountUSD('');
        }
    };

    // Calculadora Zelle: Bs → USD
    const handleBsChangeZelle = (value: string) => {
        setAmountBs(value);
        if (value && !isNaN(parseFloat(value))) {
            const bs = parseFloat(value);
            const zelleRate = rates.zelle?.saleRate ? parseFloat(rates.zelle.saleRate.toString()) : 0;

            // Bs → USD: Bs / tasa_zelle
            if (zelleRate > 0) {
                const usd = bs / zelleRate;
                setAmountUSD(formatUSD(usd));
            }
        } else {
            setAmountUSD('');
        }
    };

    const handleClear = () => {
        setAmountCOP('');
        setAmountBs('');
        setAmountUSD('');
    };

    const getCurrentRate = () => {
        switch (calculatorType) {
            case 'actual':
                return rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;
            case 'paypal':
                return rates.paypal?.saleRate ? parseFloat(rates.paypal.saleRate.toString()) : 0;
            case 'zelle':
                return rates.zelle?.saleRate ? parseFloat(rates.zelle.saleRate.toString()) : 0;
            default:
                return 0;
        }
    };

    const getCalculatorInfo = () => {
        switch (calculatorType) {
            case 'actual':
                return {
                    title: 'Calculadora Actual',
                    description: 'Conversión entre Pesos Colombianos y Bolívares',
                    rateLabel: `Tasa: ${getCurrentRate().toFixed(2)} Bs/COP`,
                };
            case 'dolares':
                const bancoCentral = rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()) : 0;
                const actual = rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()) : 0;
                return {
                    title: 'Calculadora Dólares',
                    description: 'Conversión de Dólares a Pesos y Bolívares',
                    rateLabel: `Banco Central: ${bancoCentral.toFixed(2)} | Tasa Actual: ${actual.toFixed(2)} Bs/COP`,
                };
            case 'paypal':
                return {
                    title: 'Calculadora PayPal',
                    description: 'Conversión de Dólares a Bolívares (Tasa PayPal)',
                    rateLabel: `Tasa PayPal: ${getCurrentRate().toFixed(2)} Bs/USD`,
                };
            case 'zelle':
                return {
                    title: 'Calculadora Zelle',
                    description: 'Conversión de Dólares a Bolívares (Tasa Zelle)',
                    rateLabel: `Tasa Zelle: ${getCurrentRate().toFixed(2)} Bs/USD`,
                };
        }
    };

    if (!isOpen) return null;

    const info = getCalculatorInfo();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 relative animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                            <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{info.title}</h2>
                            <p className="text-xs sm:text-sm text-gray-500">{info.description}</p>
                        </div>
                    </div>

                    {/* Calculator Type Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                            onClick={() => {
                                setCalculatorType('actual');
                                handleClear();
                            }}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${calculatorType === 'actual'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >

                            <span>Actual</span>
                        </button>
                        <button
                            onClick={() => {
                                setCalculatorType('dolares');
                                handleClear();
                            }}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${calculatorType === 'dolares'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >

                            <span>Dólares</span>
                        </button>
                        <button
                            onClick={() => {
                                setCalculatorType('paypal');
                                handleClear();
                            }}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${calculatorType === 'paypal'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span>💳</span>
                            <span>PayPal</span>
                        </button>
                        <button
                            onClick={() => {
                                setCalculatorType('zelle');
                                handleClear();
                            }}
                            className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${calculatorType === 'zelle'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span>⚡</span>
                            <span>Zelle</span>
                        </button>
                    </div>
                </div>

                {/* Calculator */}
                <div className="space-y-4">
                    {/* Rate Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 font-medium">{info.rateLabel}</p>
                    </div>

                    {/* USD Input (for dolares, paypal, zelle) */}
                    {(calculatorType === 'dolares' || calculatorType === 'paypal' || calculatorType === 'zelle') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dólares (USD)
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">
                                    $
                                </span>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amountUSD}
                                    onChange={(e) => {
                                        if (calculatorType === 'dolares') {
                                            handleUSDChangeDolares(e.target.value);
                                        } else if (calculatorType === 'paypal') {
                                            handleUSDChangePaypal(e.target.value);
                                        } else if (calculatorType === 'zelle') {
                                            handleUSDChangeZelle(e.target.value);
                                        }
                                    }}
                                    placeholder="0.00"
                                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                                />
                            </div>
                        </div>
                    )}

                    {/* COP Input (for actual and dolares) */}
                    {(calculatorType === 'actual' || calculatorType === 'dolares') && (
                        <>
                            {calculatorType === 'actual' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pesos Colombianos (COP)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={amountCOP}
                                            onChange={(e) => handleCOPChangeActual(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Exchange Icon */}
                            {calculatorType === 'actual' && (
                                <div className="flex justify-center">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* COP Input (for dolares) */}
                            {calculatorType === 'dolares' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pesos Colombianos (COP)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">
                                            $
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={amountCOP}
                                            onChange={(e) => handleCOPChangeDolares(e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Exchange Icon for dolares, paypal, zelle */}
                    {calculatorType === 'dolares' && (amountUSD || amountCOP || amountBs) && (
                        <div className="flex justify-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </div>
                        </div>
                    )}
                    {(calculatorType === 'paypal' || calculatorType === 'zelle') && amountUSD && (
                        <div className="flex justify-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Bs Input/Result */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bolívares (Bs)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-lg">
                                Bs
                            </span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={amountBs}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^\d.]/g, '');
                                    if (calculatorType === 'actual') {
                                        handleBsChangeActual(value.replace(/\D/g, ''));
                                    } else if (calculatorType === 'dolares') {
                                        handleBsChangeDolares(value);
                                    } else if (calculatorType === 'paypal') {
                                        handleBsChangePaypal(value);
                                    } else if (calculatorType === 'zelle') {
                                        handleBsChangeZelle(value);
                                    }
                                }}
                                placeholder="0"
                                className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg font-semibold"
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    {((calculatorType === 'actual' && amountCOP && amountBs) ||
                        (calculatorType === 'dolares' && (amountUSD || amountCOP || amountBs)) ||
                        ((calculatorType === 'paypal' || calculatorType === 'zelle') && amountUSD && amountBs)) && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                                {calculatorType === 'actual' && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-bold flex items-center gap-1 inline-flex"> ${amountCOP} COP</span>
                                        {' '}equivale a{' '}
                                        <span className="font-bold flex items-center gap-1 inline-flex">{parseInt(amountBs).toLocaleString('es-CO')} Bs</span>
                                    </p>
                                )}
                                {calculatorType === 'dolares' && (amountUSD || amountCOP || amountBs) && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-700">
                                            {amountUSD && (
                                                <>
                                                    <span className="font-bold">${amountUSD} USD</span>
                                                    {(amountCOP || amountBs) && ' equivale a '}
                                                    {amountCOP && <span className="font-bold ml-1">${amountCOP} COP</span>}
                                                    {amountCOP && amountBs && ' y '}
                                                    {amountBs && <span className="font-bold ml-1">{parseInt(amountBs).toLocaleString('es-CO')} Bs</span>}
                                                </>
                                            )}
                                            {!amountUSD && amountCOP && (
                                                <>
                                                    <span className="font-bold">${amountCOP} COP</span>
                                                    {' equivale a '}
                                                    {amountUSD && <span className="font-bold ml-1">${amountUSD} USD</span>}
                                                    {amountUSD && amountBs && ' y '}
                                                    {amountBs && <span className="font-bold ml-1">{parseInt(amountBs).toLocaleString('es-CO')} Bs</span>}
                                                </>
                                            )}
                                            {!amountUSD && !amountCOP && amountBs && (
                                                <>
                                                    <span className="font-bold">{parseInt(amountBs).toLocaleString('es-CO')} Bs</span>
                                                    {' equivale a '}
                                                    {amountUSD && <span className="font-bold ml-1">${amountUSD} USD</span>}
                                                    {amountUSD && amountCOP && ' y '}
                                                    {amountCOP && <span className="font-bold ml-1">${amountCOP} COP</span>}
                                                </>
                                            )}
                                        </p>
                                        <div className="text-xs text-gray-500 space-y-0.5 pt-1">
                                            {amountUSD && amountCOP && (
                                                <p>
                                                    COP: USD × Banco Central ({rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()).toFixed(2) : 'N/A'}) × Tasa Actual ({rates.actual?.saleRate ? parseFloat(rates.actual.saleRate.toString()).toFixed(2) : 'N/A'}) = COP
                                                </p>
                                            )}
                                            {amountUSD && amountBs && (
                                                <p>
                                                    Bs: USD × Banco Central ({rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()).toFixed(2) : 'N/A'}) = Bs
                                                </p>
                                            )}
                                            {!amountUSD && amountCOP && (
                                                <p>
                                                    USD: COP ÷ (Banco Central × Tasa Actual) = USD
                                                </p>
                                            )}
                                            {!amountUSD && amountBs && (
                                                <p>
                                                    USD: Bs ÷ Banco Central ({rates.banco_central?.saleRate ? parseFloat(rates.banco_central.saleRate.toString()).toFixed(2) : 'N/A'}) = USD
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(calculatorType === 'paypal' || calculatorType === 'zelle') && amountUSD && amountBs && (
                                    <p className="text-sm text-gray-700">
                                        <span className="font-bold">${amountUSD} USD</span>
                                        {' '}equivale a{' '}
                                        <span className="font-bold">{parseInt(amountBs).toLocaleString('es-CO')} Bs</span>
                                    </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {info.rateLabel}
                                </p>
                            </div>
                        )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
