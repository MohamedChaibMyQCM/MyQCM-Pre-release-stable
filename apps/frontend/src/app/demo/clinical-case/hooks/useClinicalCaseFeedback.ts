"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BaseUrl from "@/components/BaseUrl";

type FeedbackPayload = {
  rating: number;
  review?: string;
};

const FEEDBACK_QUERY_KEY = (caseIdentifier: string) => [
  "clinicalCaseFeedback",
  caseIdentifier,
];

export function useClinicalCaseFeedback(caseIdentifier: string) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");

  const {
    data: existingFeedback,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: FEEDBACK_QUERY_KEY(caseIdentifier),
    enabled: Boolean(caseIdentifier),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const response = await BaseUrl.get(
        `/clinical-case/feedback/${caseIdentifier}/me`,
      );
      return response.data?.data ?? null;
    },
  });

  useEffect(() => {
    if (!existingFeedback) {
      setRating(0);
      setReview("");
      return;
    }
    setRating(existingFeedback.rating ?? 0);
    setReview(existingFeedback.review ?? "");
  }, [existingFeedback]);

  const mutation = useMutation({
    mutationFn: async ({ rating, review }: FeedbackPayload) => {
      const payload: {
        case_identifier: string;
        rating: number;
        review?: string;
      } = {
        case_identifier: caseIdentifier,
        rating,
      };
      if (review) {
        payload.review = review;
      }
      const response = await BaseUrl.post(
        "/clinical-case/feedback",
        payload,
      );
      return response.data?.data ?? null;
    },
    onSuccess: () => {
      toast.success("Merci pour votre retour !");
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_QUERY_KEY(caseIdentifier),
      });
      queryClient.invalidateQueries({
        queryKey: [
          "clinicalCaseFeedbackSummary",
          caseIdentifier,
        ],
      });
    },
    onError: () => {
      toast.error("Impossible d'enregistrer votre avis pour le moment.");
    },
  });

  const trimmedReview = useMemo(() => review.trim(), [review]);

  const hasChanges = useMemo(() => {
    if (!existingFeedback) {
      return rating > 0 || trimmedReview.length > 0;
    }
    const initialReview = (existingFeedback.review ?? "").trim();
    return (
      existingFeedback.rating !== rating ||
      initialReview !== trimmedReview
    );
  }, [existingFeedback, rating, trimmedReview]);

  const canSubmit = rating > 0 && hasChanges && !mutation.isPending;

  const submit = async () => {
    if (!caseIdentifier || !canSubmit) {
      return;
    }
    await mutation.mutateAsync({
      rating,
      review: trimmedReview.length > 0 ? trimmedReview : undefined,
    });
  };

  return {
    rating,
    setRating,
    review,
    setReview,
    isLoading: isLoading || isFetching,
    submit,
    isSubmitting: mutation.isPending,
    hasChanges,
    canSubmit,
  };
}
