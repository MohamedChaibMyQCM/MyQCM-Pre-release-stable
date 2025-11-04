"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BaseUrl from "../BaseUrl";
import { motion, AnimatePresence } from "framer-motion";

const Notification = ({ onClose, notifications = [] }) => {
  const [loading, setLoading] = useState(false);
  const [loadingItems, setLoadingItems] = useState({});
  const notificationRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const markAsRead = async (notificationId) => {
    try {
      setLoadingItems((prev) => ({ ...prev, [notificationId]: true }));

      await BaseUrl.patch(`/notification/${notificationId}/status`, {
        status: "seen", // Changed from "read" to "seen" to match expected enum values
      });

      // Invalidate and refetch notifications
      await queryClient.invalidateQueries({ queryKey: ["userNotification"] });

      setLoadingItems((prev) => ({ ...prev, [notificationId]: false }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setLoadingItems((prev) => ({ ...prev, [notificationId]: false }));
    }
  };

  const markAllAsRead = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Process each notification one by one
      const pendingNotifications = notifications.filter(
        (n) => n.status === "pending"
      );

      if (pendingNotifications.length === 0) {
        setLoading(false);
        return;
      }

      // Create a promise for each notification
      const promises = pendingNotifications.map((notification) =>
        BaseUrl.patch(`/notification/${notification.id}/status`, {
          status: "seen", // Changed from "read" to "seen" to match expected enum values
        })
      );

      await Promise.all(promises);

      // Invalidate and refetch notifications
      await queryClient.invalidateQueries({ queryKey: ["userNotification"] });

      setLoading(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      welcome: { emoji: "🎉", bg: "bg-purple-50 dark:bg-purple-900/20" },
      learning_reminder: { emoji: "⏰", bg: "bg-blue-50 dark:bg-blue-900/20" },
      reminder: { emoji: "⏰", bg: "bg-blue-50 dark:bg-blue-900/20" },
      streak_reminder: { emoji: "🔥", bg: "bg-orange-50 dark:bg-orange-900/20" },
      daily_revision: { emoji: "📚", bg: "bg-green-50 dark:bg-green-900/20" },
      new_content: { emoji: "📢", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
      subscription_renewal_reminder: { emoji: "💳", bg: "bg-purple-50 dark:bg-purple-900/20" },
      subscription_expired: { emoji: "💳", bg: "bg-red-50 dark:bg-red-900/20" },
      subscription_payment_success: { emoji: "✅", bg: "bg-green-50 dark:bg-green-900/20" },
      subscription_payment_failure: { emoji: "❌", bg: "bg-red-50 dark:bg-red-900/20" },
      system_alert: { emoji: "⚠️", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
      password_changed: { emoji: "🔒", bg: "bg-gray-50 dark:bg-gray-800/20" },
      default: { emoji: "📬", bg: "bg-gray-50 dark:bg-gray-800/20" },
    };
    return iconMap[type] || iconMap.default;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

      if (diffInHours < 1) return "À l'instant";
      if (diffInHours < 24) return `Il y a ${diffInHours}h`;
      if (diffInHours < 24 * 7)
        return `Il y a ${Math.floor(diffInHours / 24)}j`;
      return `Il y a ${Math.floor(diffInHours / (24 * 7))}sem`;
    } catch {
      return "Il y a quelque temps";
    }
  };

  const getNotificationTypeLabel = (type) => {
    const labels = {
      welcome: "Bienvenue",
      learning_reminder: "Rappel d'étude",
      reminder: "Rappel",
      streak_reminder: "Série en cours",
      daily_revision: "Révision quotidienne",
      new_content: "Nouveau contenu",
      subscription_renewal_reminder: "Renouvellement",
      subscription_expired: "Abonnement expiré",
      subscription_payment_success: "Paiement réussi",
      subscription_payment_failure: "Échec de paiement",
      system_alert: "Alerte système",
      password_changed: "Mot de passe modifié",
      general: "Général",
      others: "Autre",
    };
    return labels[type] || type;
  };

  return (
    <motion.div
      ref={notificationRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute top-[60px] right-[20%] w-[360px] bg-white dark:bg-[#1a1a1a] rounded-[16px] shadow-lg border border-gray-200 dark:border-gray-700 z-[9999] max-h-[500px] overflow-hidden max-xl:top-9 max-xl:right-[-30px] max-xl:w-[calc(100vw-2rem)] max-xl:max-w-[360px] max-md:right-[-1px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
          {notifications.filter(n => n.status === "pending").length > 0 && (
            <span className="px-1.5 py-0.5 bg-[#F8589F] text-white text-[10px] font-medium rounded-full min-w-[18px] text-center">
              {notifications.filter(n => n.status === "pending").length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-3 text-4xl opacity-30">📭</div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aucune notification</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notification) => {
              const iconData = getNotificationIcon(notification.notification_type);
              const isPending = notification.status === "pending";

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() =>
                    isPending &&
                    !loadingItems[notification.id] &&
                    markAsRead(notification.id)
                  }
                  className={`p-3.5 border-b border-gray-50 dark:border-gray-800 last:border-b-0 transition-colors ${
                    isPending
                      ? "bg-[#F8589F]/[0.03] dark:bg-[#F8589F]/[0.08] hover:bg-[#F8589F]/[0.06] dark:hover:bg-[#F8589F]/[0.12] cursor-pointer"
                      : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                  } ${loadingItems[notification.id] ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${iconData.bg} flex items-center justify-center text-base`}>
                      {iconData.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                          {getNotificationTypeLabel(notification.notification_type)}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isPending && !loadingItems[notification.id] && (
                            <div className="w-1.5 h-1.5 bg-[#F8589F] rounded-full"></div>
                          )}
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">
                        {notification.content}
                      </p>

                      {/* Link */}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-[#F8589F] hover:text-[#d94a87] transition-colors font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Voir plus
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}

                      {/* Loading indicator */}
                      {loadingItems[notification.id] && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                          <div className="w-3 h-3 border-2 border-[#F8589F] border-t-transparent rounded-full animate-spin"></div>
                          <span>Marquage...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            className={`w-full text-xs font-medium py-2 px-3 rounded-[10px] transition-all ${
              loading
                ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-[#F8589F] text-white hover:bg-[#d94a87]"
            }`}
            onClick={markAllAsRead}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-gray-400 dark:border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                Traitement...
              </span>
            ) : (
              "Marquer tout comme lu"
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Notification;
