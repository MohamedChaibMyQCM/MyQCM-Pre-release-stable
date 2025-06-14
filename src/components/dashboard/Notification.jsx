"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import BaseUrl from "../BaseUrl";

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
    switch (type) {
      case "welcome":
        return "🎉";
      case "learning_reminder":
      case "reminder":
        return "⏰";
      case "streak_reminder":
        return "🔥";
      case "daily_revision":
        return "📚";
      case "new_content":
        return "📢";
      case "subscription_renewal_reminder":
      case "subscription_expired":
        return "💳";
      case "subscription_payment_success":
        return "✅";
      case "subscription_payment_failure":
        return "❌";
      case "system_alert":
        return "⚠️";
      case "password_changed":
        return "🔒";
      default:
        return "📬";
    }
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
    <div
      ref={notificationRef}
      className="absolute top-[60px] left-[58%] w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] max-h-96 overflow-hidden"
      style={{
        boxShadow:
          "0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-semibold text-gray-900 text-lg">Notifications</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto max-h-80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="mb-4 text-5xl opacity-50">📭</div>
            <p className="text-sm font-medium text-gray-600">
              Aucune notification
            </p>
            <p className="text-xs text-gray-400 mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() =>
                  notification.status === "pending" &&
                  markAsRead(notification.id)
                }
                className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
                  notification.status === "pending"
                    ? "bg-blue-50/50 border-l-2 border-l-blue-400 cursor-pointer"
                    : "hover:bg-gray-25"
                } ${loadingItems[notification.id] ? "opacity-70" : ""}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-xl mt-0.5">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {getNotificationTypeLabel(
                          notification.notification_type
                        )}
                      </p>
                      <div className="flex items-center space-x-2">
                        {notification.status === "pending" && (
                          <div
                            className={`w-2 h-2 bg-blue-500 rounded-full ${
                              loadingItems[notification.id]
                                ? ""
                                : "animate-pulse"
                            }`}
                          ></div>
                        )}
                        <p className="text-xs text-gray-500 font-medium">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {notification.content}
                    </p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="inline-flex items-center mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Voir plus
                        <svg
                          className="w-3 h-3 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </a>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          notification.channel === "in_app"
                            ? "bg-purple-100 text-purple-800"
                            : notification.channel === "email"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {notification.channel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <button
            className={`w-full text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium py-1 px-2 rounded hover:bg-gray-100 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            onClick={markAllAsRead}
            disabled={loading}
          >
            {loading ? "Traitement..." : "Marquer tout comme lu"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;
