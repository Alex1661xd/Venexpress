import React from 'react';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
    const sizes = {
        sm: { icon: 'w-8 h-8', text: 'text-xl' },
        md: { icon: 'w-12 h-12', text: 'text-3xl' },
        lg: { icon: 'w-16 h-16', text: 'text-4xl' },
    };

    return (
        <div className="flex items-center gap-3">
            <div
                className={`${sizes[size].icon} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg`}
            >
                <svg
                    className="w-2/3 h-2/3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
            </div>
            {showText && (
                <div className={`${sizes[size].text} font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent`}>
                    Venexpress
                </div>
            )}
        </div>
    );
}
