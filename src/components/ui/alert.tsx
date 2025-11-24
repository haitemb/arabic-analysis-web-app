import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose: () => void;
  autoClose?: number;
}

const alertStyles = {
  error: {
    container: 'bg-red-50 border border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800',
    iconComponent: AlertCircle,
  },
  success: {
    container: 'bg-emerald-50 border border-emerald-200',
    icon: 'text-emerald-600',
    text: 'text-emerald-800',
    iconComponent: CheckCircle,
  },
  info: {
    container: 'bg-blue-50 border border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800',
    iconComponent: Info,
  },
  warning: {
    container: 'bg-amber-50 border border-amber-200',
    icon: 'text-amber-600',
    text: 'text-amber-800',
    iconComponent: AlertCircle,
  },
};

export function Alert({ type, message, onClose, autoClose = 5000 }: AlertProps) {
  const style = alertStyles[type];
  const IconComponent = style.iconComponent;
  const [isClosing, setIsClosing] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`${style.container} rounded-lg p-4 flex items-start gap-3 shadow-md border-l-4 ${
        type === 'error'
          ? 'border-l-red-600'
          : type === 'success'
            ? 'border-l-emerald-600'
            : type === 'warning'
              ? 'border-l-amber-600'
              : 'border-l-blue-600'
      } transition-all duration-300 ease-out ${
        isClosing
          ? 'opacity-0 translate-y-2 pointer-events-none'
          : 'opacity-100 translate-y-0 animate-in'
      }`}
      style={{
        animation: !isClosing ? 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
      }}
      role="alert"
    >
      <IconComponent
        className={`${style.icon} size-5 flex-shrink-0 mt-0.5 transition-all duration-300 ${
          !isClosing ? 'animate-bounce-subtle' : ''
        }`}
      />
      <p className={`${style.text} text-sm font-medium flex-1`}>{message}</p>
      <button
        onClick={handleClose}
        className={`${style.icon} hover:opacity-70 flex-shrink-0 transition-all duration-200 hover:scale-110`}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
