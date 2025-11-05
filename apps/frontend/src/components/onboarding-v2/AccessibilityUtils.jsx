"use client";

import { forwardRef } from "react";

/**
 * Visually hidden text for screen readers
 */
export const VisuallyHidden = ({ children, as: Component = "span" }) => {
  return (
    <Component
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </Component>
  );
};

/**
 * Skip link for keyboard navigation
 */
export const SkipLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className="skip-link focus-ring"
      style={{
        position: "absolute",
        left: "-9999px",
        zIndex: 10000,
        padding: "1rem 1.5rem",
        backgroundColor: "#F8589F",
        color: "white",
        fontWeight: "bold",
        borderRadius: "0.5rem",
        textDecoration: "none",
        transition: "left 0.2s ease",
      }}
      onFocus={(e) => {
        e.target.style.left = "1rem";
        e.target.style.top = "1rem";
      }}
      onBlur={(e) => {
        e.target.style.left = "-9999px";
      }}
    >
      {children}
    </a>
  );
};

/**
 * Accessible button with proper ARIA attributes
 */
export const AccessibleButton = forwardRef(
  (
    {
      children,
      onClick,
      disabled = false,
      ariaLabel,
      ariaDescribedBy,
      ariaPressed,
      className = "",
      variant = "primary",
      ...props
    },
    ref
  ) => {
    const baseStyles = "focus-ring button-ripple press-effect transition-smooth";
    const variantStyles = {
      primary:
        "px-6 py-3 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white font-semibold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed",
      secondary:
        "px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#F8589F] disabled:opacity-50 disabled:cursor-not-allowed",
      ghost:
        "px-6 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={ariaPressed}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

/**
 * Progress indicator with ARIA attributes
 */
export const ProgressIndicator = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = "",
}) => {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm font-bold gradient-text">{percentage}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${percentage}%`}
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-[#F8589F] to-[#FF3D88] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Accessible modal/dialog container
 */
export const DialogContainer = forwardRef(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      children,
      className = "",
      showCloseButton = true,
    },
    ref
  ) => {
    if (!isOpen) return null;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        ref={ref}
        className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${className}`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="relative glassmorphism-card rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Fermer le dialogue"
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors focus-ring"
            >
              <VisuallyHidden>Fermer</VisuallyHidden>
              <span aria-hidden="true" className="text-gray-600 text-xl">
                ✕
              </span>
            </button>
          )}

          {title && (
            <h2 id="dialog-title" className="text-2xl font-bold text-gray-800 mb-4">
              {title}
            </h2>
          )}

          {description && (
            <p id="dialog-description" className="text-gray-600 mb-6">
              {description}
            </p>
          )}

          {children}
        </div>
      </div>
    );
  }
);

DialogContainer.displayName = "DialogContainer";

/**
 * Accessible tab navigation
 */
export const TabNavigation = ({ tabs, activeTab, onChange, className = "" }) => {
  return (
    <div
      role="tablist"
      aria-label="Onglets de navigation"
      className={`flex gap-2 ${className}`}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onChange(tab.id)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              const nextTab = tabs[(index + 1) % tabs.length];
              onChange(nextTab.id);
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              const prevTab = tabs[(index - 1 + tabs.length) % tabs.length];
              onChange(prevTab.id);
            }
          }}
          tabIndex={activeTab === tab.id ? 0 : -1}
          className={`px-6 py-3 font-semibold rounded-xl transition-all focus-ring ${
            activeTab === tab.id
              ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white shadow-lg"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Loading spinner with accessible label
 */
export const LoadingSpinner = ({ label = "Chargement...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-gray-300 border-t-[#F8589F] ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <VisuallyHidden>{label}</VisuallyHidden>
    </div>
  );
};

/**
 * Accessible tooltip
 */
export const Tooltip = ({ content, children, position = "top" }) => {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div
        role="tooltip"
        className={`absolute ${positionClasses[position]} pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 z-50`}
      >
        <div className="glassmorphism px-3 py-2 rounded-lg shadow-lg text-sm text-gray-700 whitespace-nowrap">
          {content}
        </div>
      </div>
    </div>
  );
};
