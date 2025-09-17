"use client";

import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

export function ToastSimple({ message, type, onClose }: ToastProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-bottom-2 ${getBackgroundColor()}`}
    >
      {getIcon()}
      <span className="text-sm font-medium text-gray-900">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  );
}
