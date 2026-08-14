import React from 'react';
import { Loader2, X } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
    icon: 'p-2 text-sm',
  };

  const variantStyles = {
    primary: 'bg-[#0F766E] text-white hover:bg-[#0D655E] active:bg-[#0B544E] focus:ring-[#0F766E] shadow-sm',
    secondary: 'bg-[#CCFBF1] text-[#0F766E] hover:bg-[#99F6E4] active:bg-[#5EEAD4] focus:ring-[#14B8A6]',
    outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:ring-slate-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 focus:ring-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500 shadow-sm',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
};

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white text-slate-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-slate-400 py-2 ${
            Icon ? 'pl-9 pr-3.5' : 'px-3.5'
          } ${error ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Select = ({
  label,
  error,
  options = [],
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-200 bg-white text-slate-900 text-sm px-3.5 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent ${
          error ? 'border-rose-400' : ''
        } ${className}`}
        {...props}
      >
        {options.length > 0
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold',
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-medium',
  };

  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    teal: 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', hover = false, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] ${
      hover ? 'hover:border-teal-600/40 hover:shadow-md transition-all duration-200 cursor-pointer' : ''
    } ${className}`}
  >
    {children}
  </div>
);

export const Avatar = ({ name = 'User', src = '', size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-slate-200 ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white font-semibold flex items-center justify-center select-none shadow-sm ${sizeStyles[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export const ProgressBar = ({ progress = 0, showLabel = true, size = 'md', className = '' }) => {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
          <span>Progress</span>
          <span className="text-[#0F766E]">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 ${heightStyles[size]}`}>
        <div
          className="h-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export const KPICard = ({ title, value, subtitle, icon: Icon, trend, className = '' }) => (
  <Card className={`p-5 flex flex-col justify-between ${className}`}>
    <div className="flex items-start justify-between">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      {Icon && (
        <div className="p-2.5 rounded-lg bg-[#CCFBF1] text-[#0F766E]">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
    <div className="mt-3">
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </div>
  </Card>
);

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={`relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full ${maxWidth} overflow-hidden z-10 animate-fade-in ${className}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 ${className}`}>
    {Icon && (
      <div className="p-3.5 rounded-full bg-slate-100 text-slate-400 mb-3.5">
        <Icon className="w-6 h-6 text-[#0F766E]" />
      </div>
    )}
    <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
    {description && <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>}
    {action}
  </div>
);

export const LoadingSpinner = ({ text = 'Loading Flowra workspace...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-slate-500 ${className}`}>
    <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mb-3" />
    <p className="text-xs font-medium text-slate-500">{text}</p>
  </div>
);
