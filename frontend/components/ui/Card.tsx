import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

export default function Card({ children, className = '', noPadding = false }: CardProps) {
    return (
                <div
                        className={`
                bg-white rounded-2xl shadow-xl border border-gray-100 
                backdrop-blur-sm transition-all duration-300 
                hover:shadow-2xl
                ${noPadding ? '' : 'p-4 sm:p-8'}
                ${className}
            `}
        >
            {children}
        </div>
    );
}
