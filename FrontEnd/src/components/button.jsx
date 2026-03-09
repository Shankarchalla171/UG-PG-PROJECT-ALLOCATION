import React from "react";

export function Button({ children, variant = "default", onClick }) {
    const baseStyle =
        "px-4 py-2 rounded font-medium transition";

    const variants = {
        default: "bg-blue-500 text-white hover:bg-blue-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        success: "bg-green-500 text-white hover:bg-green-600",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}