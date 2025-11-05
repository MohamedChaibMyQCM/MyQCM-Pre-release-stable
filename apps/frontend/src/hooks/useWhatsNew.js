"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { useOnboardingV2 } from "../context/OnboardingV2Context";

// Use the same base URL as the rest of the app (backend is on port 3001, no /api prefix)
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to dynamically add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = secureLocalStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function useWhatsNew() {
  const queryClient = useQueryClient();
  const {
    setUnseenFeatures,
    markFeatureAsSeen: contextMarkSeen,
    markFeatureAsTried: contextMarkTried,
    dismissFeature: contextDismiss,
  } = useOnboardingV2();

  // Fetch new features
  const {
    data: newFeatures = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["whatsNew"],
    queryFn: async () => {
      const response = await api.get("/feature-announcements/new");
      const features = response.data;
      setUnseenFeatures(features);
      return features;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });

  // Mark feature as seen
  const markAsSeenMutation = useMutation({
    mutationFn: async (featureId) => {
      await api.post(`/feature-announcements/${featureId}/seen`);
      return featureId;
    },
    onSuccess: (featureId) => {
      contextMarkSeen(featureId);
      queryClient.invalidateQueries(["whatsNew"]);
    },
    onError: (error) => {
      console.error("Failed to mark feature as seen:", error);
      // Silently fail - this is not critical for UX
    },
  });

  // Mark feature as tried
  const markAsTriedMutation = useMutation({
    mutationFn: async (featureId) => {
      await api.post(`/feature-announcements/${featureId}/tried`);
      return featureId;
    },
    onSuccess: (featureId) => {
      contextMarkTried(featureId);
      queryClient.invalidateQueries(["whatsNew"]);
    },
    onError: (error) => {
      console.error("Failed to mark feature as tried:", error);
      // Silently fail - this is not critical for UX
    },
  });

  // Dismiss feature
  const dismissFeatureMutation = useMutation({
    mutationFn: async (featureId) => {
      await api.post(`/feature-announcements/${featureId}/dismissed`);
      return featureId;
    },
    onSuccess: (featureId) => {
      contextDismiss(featureId);
      queryClient.invalidateQueries(["whatsNew"]);
    },
    onError: (error) => {
      console.error("Failed to dismiss feature:", error);
      // Silently fail - this is not critical for UX
    },
  });

  // Get changelog
  const useChangelog = (filter, limit = 20) => {
    return useQuery({
      queryKey: ["changelog", filter, limit],
      queryFn: async () => {
        const params = new URLSearchParams();
        if (filter) params.append("filter", filter);
        if (limit) params.append("limit", limit.toString());

        const response = await api.get(`/feature-announcements/changelog?${params.toString()}`);
        return response.data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };

  return {
    // Data
    newFeatures,
    hasNewFeatures: newFeatures.length > 0,
    isLoading,
    error,

    // Actions
    markAsSeen: (featureId) => markAsSeenMutation.mutate(featureId),
    markAsTried: (featureId) => markAsTriedMutation.mutate(featureId),
    dismissFeature: (featureId) => dismissFeatureMutation.mutate(featureId),
    refetch,

    // Loading states
    isMarkingAsSeen: markAsSeenMutation.isLoading,
    isMarkingAsTried: markAsTriedMutation.isLoading,
    isDismissing: dismissFeatureMutation.isLoading,

    // Changelog
    useChangelog,
  };
}

// Separate hook for changelog to use outside main component
export function useChangelog(filter, limit = 20) {
  return useQuery({
    queryKey: ["changelog", filter, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter) params.append("filter", filter);
      if (limit) params.append("limit", limit.toString());

      const response = await api.get(`/feature-announcements/changelog?${params.toString()}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
