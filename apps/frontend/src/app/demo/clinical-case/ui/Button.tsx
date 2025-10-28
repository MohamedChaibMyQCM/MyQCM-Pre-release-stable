"use client";

import { motion } from "framer-motion";
import {
  ComponentType,
  CSSProperties,
  MouseEvent,
  ReactNode,
} from "react";
import { ALPHA, COLORS } from "./colors";

type ButtonVariant = "primary" | "secondary" | "ghost";

type IconComponent = ComponentType<{ className?: string }>;

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  icon?: IconComponent;
  rightIcon?: IconComponent;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

type VariantStyles = {
  style: CSSProperties;
  hover?: string;
};

const variantMap: Record<ButtonVariant, VariantStyles> = {
  primary: {
    style: {
      color: COLORS.white,
      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
      boxShadow: `0 8px 18px ${ALPHA.primaryShadow}`,
    },
    hover: `linear-gradient(135deg, ${COLORS.primaryDark}, ${COLORS.primaryAlt})`,
  },
  secondary: {
    style: {
      color: COLORS.primaryDark,
      background: COLORS.white,
      border: `1px solid ${ALPHA.primarySoft}`,
    },
    hover: COLORS.bgLightPink,
  },
  ghost: {
    style: {
      color: COLORS.textSecondary,
      background: COLORS.white,
      border: `1px dashed ${COLORS.bgLightGray}`,
    },
    hover: COLORS.bgLightGray,
  },
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  rightIcon: RightIcon,
  onClick,
  type = "button",
  className = "",
}: ButtonProps) => {
  const styles = variantMap[variant];
  const defaultBackground = styles.style.background;
  const sizeClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-[10px] text-sm",
    lg: "px-6 py-3 text-base",
  };

  const handleMouseEnter = (event: MouseEvent<HTMLButtonElement>) => {
    if (styles.hover) {
      event.currentTarget.style.background = styles.hover;
    }
  };

  const handleMouseLeave = (event: MouseEvent<HTMLButtonElement>) => {
    if (defaultBackground) {
      event.currentTarget.style.background = defaultBackground;
    }
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.99 }}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-colors focus:outline-none focus-visible:outline focus-visible:outline-[2px] focus-visible:outline-offset-2 focus-visible:outline-[#FD2E8A] ${sizeClasses[size]} ${className}`}
      style={styles.style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
      {RightIcon ? <RightIcon className="h-4 w-4" /> : null}
    </motion.button>
  );
};
