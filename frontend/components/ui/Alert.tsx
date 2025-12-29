'use client';

import React from 'react';
import Button from './Button';

interface AlertProps {
    isOpen: boolean;
    message: string;
    title?: string;
    onClose: () => void;
    variant?: 'error' | 'success' | 'warning' | 'info';
}

export default function Alert({ isOpen, message, title, onClose, variant = 'info' }: AlertProps) {
    if (!isOpen) return null;

    const variantStyles = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'text-red-800',
            titleColor: 'text-red-900'
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'text-green-800',
            titleColor: 'text-green-900'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            text: 'text-yellow-800',
            titleColor: 'text-yellow-900'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            text: 'text-blue-800',
            titleColor: 'text-blue-900'
        }
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-slide-up ${styles.bg} ${styles.border} border-2`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                        {styles.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3 className={`text-lg sm:text-xl font-bold mb-2 ${styles.titleColor}`}>
                                {title}
                            </h3>
                        )}
                        <p className={`text-sm sm:text-base ${styles.text}`}>
                            {message}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={onClose} className="min-w-[100px]">
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}

