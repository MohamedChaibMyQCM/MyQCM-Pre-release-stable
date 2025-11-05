"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useOnboardingV2 } from "../context/OnboardingV2Context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
if (typeof window !== "undefined") {
  const token = localStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

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
