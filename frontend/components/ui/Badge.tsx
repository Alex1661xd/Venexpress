import React from 'react';
import { TransactionStatus } from '@/types/transaction';

interface BadgeProps {
    status: TransactionStatus;
    children?: React.ReactNode;
}

export default function Badge({ status, children }: BadgeProps) {
    const variants: Record<TransactionStatus, { bg: string; text: string; border: string }> = {
        pendiente: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
        },
        enviado_venezuela: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
        },
        procesando: {
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            border: 'border-purple-200',
        },
        completado: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
        },
        rechazado: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
        },
        pendiente_colombia: {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-200',
        },
        pendiente_venezuela: {
            bg: 'bg-indigo-50',
            text: 'text-indigo-700',
            border: 'border-indigo-200',
        },
        cancelado_vendedor: {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
        },
        cancelado_administrador: {
            bg: 'bg-slate-100',
            text: 'text-slate-700',
            border: 'border-slate-300',
        },
    };

    const variant = variants[status] || variants.pendiente;

    const labels: Record<TransactionStatus, string> = {
        pendiente: 'Pendiente',
        pendiente_colombia: 'PendienteCL',
        pendiente_venezuela: 'PendienteVE',
        enviado_venezuela: 'EnviadoVE',
        procesando: 'Procesando',
        completado: 'Completado',
        rechazado: 'Rechazado',
        cancelado_vendedor: 'Cancelado',
        cancelado_administrador: 'Canc. Admin',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 ${variant.bg} ${variant.text} ${variant.border}`}
        >
            <span className={`w-2 h-2 rounded-full ${variant.text.replace('text-', 'bg-')}`} />
            {children || labels[status]}
        </span>
    );
}
