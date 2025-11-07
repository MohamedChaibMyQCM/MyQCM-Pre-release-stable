"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import { Sparkles, RotateCcw, Unlock, Award } from "lucide-react";
import toast from "react-hot-toast";
import { format, formatDistanceStrict, isBefore } from "date-fns";
import { fr } from "date-fns/locale";

const perkVisualPalette = [
  {
    icon: Sparkles,
    iconColor: "text-violet-600",
    iconBgGradient: "bg-gradient-to-br from-violet-50 to-purple-50",
    decorGradient: "from-violet-100/40 via-purple-100/30",
    borderAccent: "border-violet-100",
  },
  {
    icon: RotateCcw,
    iconColor: "text-sky-600",
    iconBgGradient: "bg-gradient-to-br from-sky-50 to-blue-50",
    decorGradient: "from-sky-100/40 via-blue-100/30",
    borderAccent: "border-sky-100",
  },
  {
    icon: Unlock,
    iconColor: "text-emerald-600",
    iconBgGradient: "bg-gradient-to-br from-emerald-50 to-green-50",
    decorGradient: "from-emerald-100/40 via-green-100/30",
    borderAccent: "border-emerald-100",
  },
  {
    icon: Award,
    iconColor: "text-amber-600",
    iconBgGradient: "bg-gradient-to-br from-amber-50 to-orange-50",
    decorGradient: "from-amber-100/40 via-orange-100/30",
    borderAccent: "border-amber-100",
  },
];

const auctionStatusLabels = {
  draft: "Brouillon",
  scheduled: "Programmée",
  active: "Active",
  completed: "Terminée",
  cancelled: "Annulée",
};

const auctionStatusColors = {
  draft: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  scheduled: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  active: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  completed: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  cancelled: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400",
};

const transactionStatusLabels = {
  pending: "En attente",
  completed: "Terminé",
  cancelled: "Annulé",
};

const transactionStatusColors = {
  pending: "text-amber-600 dark:text-amber-400",
  completed: "text-emerald-600 dark:text-emerald-400",
  cancelled: "text-gray-500 dark:text-gray-400",
};

const transactionTypeLabels = {
  credit: "Crédit",
  debit: "Débit",
  hold: "Blocage",
  release: "Libération",
};

const transactionTypeStyles = {
  credit: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  debit: "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  hold: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  release: "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400",
};

const RewardsCenter = () => {
  const [selectedTab, setSelectedTab] = useState("opportunites");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [redeemingPerkId, setRedeemingPerkId] = useState(null);
  const [biddingAuctionId, setBiddingAuctionId] = useState(null);
  const queryClient = useQueryClient();
  const token =
    typeof window !== "undefined" ? secureLocalStorage.getItem("token") : null;

  const buildAuthConfig = () => {
    const latestToken =
      typeof window !== "undefined"
        ? secureLocalStorage.getItem("token")
        : null;
    return latestToken
      ? {
          headers: {
            Authorization: `Bearer ${latestToken}`,
          },
        }
      : {};
  };

  const handleMutationError = (error) => {
    const message =
      error?.response?.data?.message ??
      "Une erreur est survenue. Veuillez réessayer.";
    toast.error(message);
  };

  const {
    data: xpData,
    isLoading: isLoadingXp,
  } = useQuery({
    queryKey: ["userXp"],
    queryFn: async () => {
      const response = await BaseUrl.get("/user/xp/me", buildAuthConfig());
      return response.data.data;
    },
    enabled: !!token,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["rewardCategories"],
    queryFn: async () => {
      const response = await BaseUrl.get(
        "/reward/categories",
        buildAuthConfig(),
      );
      return response.data.data ?? [];
    },
    enabled: !!token,
  });

  const { data: perksData, isLoading: isLoadingPerks } = useQuery({
    queryKey: ["rewardPerks"],
    queryFn: async () => {
      const response = await BaseUrl.get("/reward/perks", buildAuthConfig());
      return response.data.data ?? [];
    },
    enabled: !!token,
  });

  const { data: auctionsData, isLoading: isLoadingAuctions } = useQuery({
    queryKey: ["rewardAuctions"],
    queryFn: async () => {
      const response = await BaseUrl.get("/reward/auctions", {
        ...buildAuthConfig(),
        params: { activeOnly: true },
      });
      return response.data.data ?? [];
    },
    enabled: !!token,
  });

  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["rewardTransactions"],
    queryFn: async () => {
      const response = await BaseUrl.get("/reward/transactions/me", {
        ...buildAuthConfig(),
        params: { limit: 10 },
      });
      return response.data.data ?? [];
    },
    enabled: !!token,
  });

  const userXP = xpData?.xp ?? 0;
  const categories = categoriesData ?? [];
  const transactions = transactionsData ?? [];

  const decoratedPerks = useMemo(() => {
    return (perksData ?? []).map((perk, index) => {
      const visuals = perkVisualPalette[index % perkVisualPalette.length];
      const remainingStock =
        typeof perk.stock === "number" ? Math.max(perk.stock, 0) : null;
      const remainingRedeem =
        typeof perk.maxRedemptions === "number"
          ? Math.max(perk.maxRedemptions - (perk.redeemedCount ?? 0), 0)
          : null;

      return {
        ...perk,
        visuals,
        remainingStock,
        remainingRedeem,
      };
    });
  }, [perksData]);

  const filteredPerks = useMemo(() => {
    if (selectedCategoryId === "all") {
      return decoratedPerks;
    }
    return decoratedPerks.filter(
      (perk) => perk.category?.id === selectedCategoryId,
    );
  }, [decoratedPerks, selectedCategoryId]);

  const auctions = useMemo(() => {
    return (auctionsData ?? []).map((auction) => {
      const endsAt = auction.endsAt ? new Date(auction.endsAt) : null;
      const isExpired = endsAt ? isBefore(endsAt, new Date()) : false;
      const currentBid = auction.currentBidAmount ?? 0;
      const nextBid = currentBid
        ? currentBid + (auction.minimumIncrement ?? 0)
        : auction.startingBid;

      return {
        ...auction,
        endsAt,
        isExpired,
        currentBid,
        nextBid,
        timeRemaining: endsAt
          ? isExpired
            ? "Enchère terminée"
            : formatDistanceStrict(new Date(), endsAt, { locale: fr })
          : "En cours",
      };
    });
  }, [auctionsData]);

  const formatDate = (value) => {
    try {
      const dateValue = new Date(value);
      if (Number.isNaN(dateValue.getTime())) {
        return "—";
      }
      return format(dateValue, "dd MMM yyyy HH:mm", { locale: fr });
    } catch (error) {
      return "—";
    }
  };

  const placeBidMutation = useMutation({
    mutationFn: async ({ auctionId, amount }) => {
      const response = await BaseUrl.post(
        `/reward/auctions/${auctionId}/bids`,
        { amount },
        buildAuthConfig(),
      );
      return response.data;
    },
    onMutate: ({ auctionId }) => {
      setBiddingAuctionId(auctionId);
    },
    onSuccess: () => {
      toast.success("Votre enchère a bien été enregistrée !");
      queryClient.invalidateQueries({ queryKey: ["rewardAuctions"] });
      queryClient.invalidateQueries({ queryKey: ["rewardTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["userXp"] });
    },
    onError: handleMutationError,
    onSettled: () => {
      setBiddingAuctionId(null);
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ perkId }) => {
      const response = await BaseUrl.post(
        `/reward/perks/${perkId}/redeem`,
        { quantity: 1 },
        buildAuthConfig(),
      );
      return response.data;
    },
    onMutate: ({ perkId }) => {
      setRedeemingPerkId(perkId);
    },
    onSuccess: () => {
      toast.success("Avantage débloqué avec succès !");
      queryClient.invalidateQueries({ queryKey: ["rewardPerks"] });
      queryClient.invalidateQueries({ queryKey: ["rewardTransactions"] });
      queryClient.invalidateQueries({ queryKey: ["userXp"] });
    },
    onError: handleMutationError,
    onSettled: () => {
      setRedeemingPerkId(null);
    },
  });

  const tabs = [
    { id: "opportunites", label: "Opportunités de Carrière" },
    { id: "avantages", label: "Avantages Exclusifs" },
    { id: "soutien", label: "Soutien Académique" },
    { id: "impact", label: "Impact Communautaire" },
  ];

  if (!token) {
    return (
      <div className="mx-5 my-16 rounded-[20px] border border-dashed border-[#F8589F]/40 bg-white dark:bg-gray-800 p-10 text-center shadow-sm dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]">
        <h2 className="text-[20px] font-semibold text-[#191919] dark:text-gray-100 mb-3">
          Espace réservé aux membres connectés
        </h2>
        <p className="text-[14px] text-gray-600 dark:text-gray-400">
          Connectez-vous pour découvrir les récompenses que vous pouvez débloquer
          avec vos XP.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-5 mb-20 mt-8">
      <motion.div
        className="mb-8 rounded-[20px] border border-[#FFE5F1] dark:border-gray-700 bg-gradient-to-br from-white to-[#FFF5FA] dark:from-gray-800 dark:to-gray-850 p-8 shadow-[0px_2px_12px_rgba(248,88,159,0.08)] dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-6">
          <div>
            <h1 className="mb-3 text-[24px] font-[600] text-[#191919] dark:text-gray-100">
              Centre de Récompenses
            </h1>
            <p className="max-w-[600px] text-[14px] leading-relaxed text-gray-600 dark:text-gray-400">
              Convertissez vos XP en avantages concrets : expériences
              professionnelles, boosts d&rsquo;apprentissage et privilèges exclusifs.
            </p>
          </div>
          <div className="rounded-[16px] border-2 border-[#FFE5F1] dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-5 text-center shadow-[0px_4px_16px_rgba(248,88,159,0.12)] dark:shadow-[0px_4px_16px_rgba(0,0,0,0.3)]">
            <p className="mb-1 text-[12px] font-[500] text-gray-500 dark:text-gray-400">
              Votre Solde XP
            </p>
            <p className="text-[36px] font-[700] text-[#F8589F]">
              {isLoadingXp ? "…" : userXP}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="mb-10 flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`whitespace-nowrap rounded-[16px] px-5 py-3 text-[13px] font-[500] transition-all duration-300 ${
              selectedTab === tab.id
                ? "bg-[#F8589F] text-white shadow-[0px_4px_12px_rgba(248,88,159,0.3)]"
                : "border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#191919] dark:text-gray-200 hover:shadow-md dark:hover:shadow-[0px_4px_12px_rgba(0,0,0,0.3)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {selectedTab === "opportunites" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-6 text-[18px] font-[600] text-[#191919] dark:text-gray-100">
            Enchères XP - Opportunités Professionnelles
          </h2>

          {isLoadingAuctions ? (
            <p className="rounded-[16px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-6 py-8 text-center text-[14px] text-gray-600 dark:text-gray-400">
              Chargement des opportunités…
            </p>
          ) : auctions.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-6 py-12 text-center shadow-sm dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]">
              <h3 className="mb-2 text-[16px] font-semibold text-[#191919] dark:text-gray-100">
                Aucune enchère disponible pour le moment
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                Revenez bientôt&nbsp;: de nouvelles expériences seront proposées
                prochainement.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {auctions.map((auction, index) => {
                const statusLabel =
                  auctionStatusLabels[auction.status] ?? auction.status;
                const statusColor =
                  auctionStatusColors[auction.status] ??
                  "bg-gray-100 text-gray-600";
                const isAuctionActive =
                  auction.status === "active" && !auction.isExpired;
                const canBid = isAuctionActive && userXP >= auction.nextBid;
                const xpNeeded = Math.max(auction.nextBid - userXP, 0);
                const isProcessingBid =
                  biddingAuctionId === auction.id &&
                  placeBidMutation.isPending;

                return (
                  <motion.div
                    key={auction.id}
                    className="relative overflow-hidden rounded-[18px] border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-[#FFE5F1] hover:shadow-[0px_8px_24px_rgba(248,88,159,0.15)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-[100px] bg-gradient-to-br from-[#FFF5FA] dark:from-gray-700 to-transparent opacity-50" />

                    <div className="mb-3 flex items-center justify-between gap-3 text-xs font-medium">
                      <span
                        className={`rounded-full px-3 py-1 ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {auction.timeRemaining}
                      </span>
                    </div>

                    <h3 className="relative z-10 mb-2 text-[15px] font-[600] text-[#191919] dark:text-gray-100">
                      {auction.title}
                    </h3>
                    <p className="relative z-10 mb-4 text-[13px] text-gray-600 dark:text-gray-400">
                      {auction.partner || "Partenaire à confirmer"}
                    </p>

                    <div className="relative z-10 mb-4 rounded-[12px] bg-gradient-to-r from-[#FFF5FA] to-white dark:from-gray-700 dark:to-gray-750 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[12px] font-[500] text-gray-600 dark:text-gray-400">
                          Enchère actuelle
                        </span>
                        <span className="text-[16px] font-[700] text-[#F8589F]">
                          {auction.currentBid || auction.startingBid} XP
                        </span>
                      </div>
                      <div className="text-[12px] text-gray-500 dark:text-gray-400">
                        Prochaine mise minimale&nbsp;:{" "}
                        <span className="font-semibold text-[#F8589F]">
                          {auction.nextBid} XP
                        </span>
                      </div>
                    </div>

                    <motion.button
                      disabled={!canBid || isProcessingBid}
                      onClick={() =>
                        canBid &&
                        placeBidMutation.mutate({
                          auctionId: auction.id,
                          amount: auction.nextBid,
                        })
                      }
                      className={`relative z-10 w-full rounded-[12px] py-3 text-[13px] font-[600] transition-all ${
                        canBid && !isProcessingBid
                          ? "bg-[#F8589F] text-white hover:bg-[#e04d8a] hover:shadow-[0px_4px_12px_rgba(248,88,159,0.25)]"
                          : "cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      }`}
                      whileHover={
                        canBid && !isProcessingBid ? { scale: 1.01 } : {}
                      }
                      whileTap={
                        canBid && !isProcessingBid ? { scale: 0.97 } : {}
                      }
                    >
                      {isProcessingBid
                        ? "Enregistrement..."
                        : canBid
                        ? `Enchérir ${auction.nextBid} XP`
                        : isAuctionActive
                        ? `Encore ${xpNeeded} XP`
                        : "Enchère indisponible"}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {selectedTab === "avantages" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-6 text-[18px] font-[600] text-[#191919] dark:text-gray-100">
            Avantages & Contenu Exclusif
          </h2>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                selectedCategoryId === "all"
                  ? "bg-[#F8589F] text-white"
                  : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#F8589F]/40"
              }`}
            >
              Toutes les catégories
            </button>
            {isLoadingCategories ? (
              <span className="rounded-full border border-dashed border-[#F8589F]/40 px-4 py-2 text-[12px] text-gray-500 dark:text-gray-400">
                Chargement…
              </span>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-colors ${
                    selectedCategoryId === category.id
                      ? "bg-[#F8589F] text-white"
                      : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#F8589F]/40"
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>

          {isLoadingPerks ? (
            <p className="rounded-[16px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-6 py-8 text-center text-[14px] text-gray-600 dark:text-gray-400">
              Chargement des avantages…
            </p>
          ) : filteredPerks.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-6 py-12 text-center shadow-sm dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]">
              <h3 className="mb-2 text-[16px] font-semibold text-[#191919] dark:text-gray-100">
                Aucun avantage disponible dans cette catégorie
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                Modifiez le filtre ou revenez plus tard pour découvrir de
                nouvelles récompenses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {filteredPerks.map((perk, index) => {
                const {
                  icon: IconComponent,
                  iconBgGradient,
                  iconColor,
                  decorGradient,
                  borderAccent,
                } = perk.visuals;
                const xpNeeded = Math.max(perk.xpCost - userXP, 0);
                const isAvailable =
                  perk.isActive &&
                  (perk.remainingStock === null || perk.remainingStock > 0) &&
                  (perk.remainingRedeem === null || perk.remainingRedeem > 0);
                const canRedeem = isAvailable && xpNeeded === 0;
                const isProcessing = redeemingPerkId === perk.id;

                return (
                  <motion.div
                    key={perk.id}
                    className={`relative flex flex-col overflow-hidden rounded-[20px] border-2 border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:shadow-[0px_12px_32px_rgba(0,0,0,0.12)] dark:hover:shadow-[0px_12px_32px_rgba(0,0,0,0.4)] ${
                      borderAccent ?? "border-gray-100"
                    }`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: index * 0.12,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${
                        decorGradient ?? ""
                      } to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100`}
                    />
                    <div
                      className={`absolute -top-8 -right-8 h-24 w-24 rounded-full bg-gradient-to-br ${
                        decorGradient ?? ""
                      } to-transparent opacity-60 transition-transform duration-700 hover:scale-150`}
                    />

                    {perk.category?.name && (
                      <span className="relative z-10 mb-4 inline-flex w-fit items-center rounded-full bg-[#FFF5FA] dark:bg-gray-700 px-3 py-1 text-[11px] font-semibold text-[#F8589F]">
                        {perk.category.name}
                      </span>
                    )}

                    <motion.div
                      className={`${iconBgGradient} relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] shadow-sm`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent
                        className={`h-7 w-7 ${iconColor}`}
                        strokeWidth={2.5}
                      />
                    </motion.div>

                    <h3 className="relative z-10 mb-2 text-[15px] font-[600] leading-snug text-[#191919] dark:text-gray-100">
                      {perk.title}
                    </h3>
                    <p className="relative z-10 mb-4 flex-1 text-[12px] leading-relaxed text-gray-600 dark:text-gray-400">
                      {perk.description || "Un avantage exclusif pour les membres."}
                    </p>

                    <div className="relative z-10 mb-4 flex flex-wrap gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                      {perk.remainingStock !== null && (
                        <span
                          className={`rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 font-semibold ${
                            perk.remainingStock === 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          Stock&nbsp;: {perk.remainingStock}
                        </span>
                      )}
                      {perk.remainingRedeem !== null && (
                        <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 font-semibold text-gray-600 dark:text-gray-300">
                          Quota restant&nbsp;: {perk.remainingRedeem}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 mb-5 rounded-[14px] border border-[#FFE5F1] dark:border-gray-700 bg-gradient-to-r from-[#FFF5FA] via-white to-[#FFF5FA] dark:from-gray-700 dark:via-gray-750 dark:to-gray-700 p-4 text-center shadow-sm dark:shadow-[0px_2px_8px_rgba(0,0,0,0.3)]">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-[22px] font-[700] text-[#F8589F]">
                          {perk.xpCost}
                        </span>
                        <span className="text-[13px] font-[500] text-gray-500 dark:text-gray-400">
                          XP
                        </span>
                      </div>
                    </div>

                    <motion.button
                      disabled={!canRedeem || isProcessing || redeemMutation.isPending}
                      onClick={() =>
                        canRedeem &&
                        redeemMutation.mutate({
                          perkId: perk.id,
                        })
                      }
                      className={`relative z-10 w-full rounded-[14px] py-3.5 text-[13px] font-[600] transition-all ${
                        canRedeem && !isProcessing
                          ? "bg-gradient-to-r from-[#F8589F] to-[#FD2E8A] text-white hover:scale-[1.02] hover:shadow-[0px_8px_20px_rgba(248,88,159,0.4)]"
                          : "cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                      }`}
                      whileHover={
                        canRedeem && !isProcessing ? { scale: 1.02 } : {}
                      }
                      whileTap={
                        canRedeem && !isProcessing ? { scale: 0.98 } : {}
                      }
                    >
                      {isProcessing
                        ? "Achat en cours..."
                        : canRedeem
                        ? "Acheter maintenant"
                        : !isAvailable
                        ? "Indisponible"
                        : `Encore ${xpNeeded} XP`}
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {selectedTab === "soutien" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-[20px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-8 py-12 text-center shadow-sm dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]">
            <h2 className="mb-3 text-[18px] font-[600] text-[#191919] dark:text-gray-100">
              Soutien Académique
            </h2>
            <p className="text-[13px] text-gray-600 dark:text-gray-400">
              Nous finalisons l&rsquo;intégration des services de tutorat premium. Vos
              XP pourront bientôt être utilisés pour réserver des sessions
              personnalisées avec nos mentors.
            </p>
          </div>
        </motion.div>
      )}

      {selectedTab === "impact" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-[20px] border border-dashed border-[#F8589F]/30 bg-white dark:bg-gray-800 px-8 py-12 text-center shadow-sm dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]">
            <h2 className="mb-3 text-[18px] font-[600] text-[#191919] dark:text-gray-100">
              Impact Communautaire
            </h2>
            <p className="text-[13px] text-gray-600 dark:text-gray-400">
              Les projets soutenus par la communauté seront dévoilés prochainement.
              Utilisez vos XP pour voter et financer des initiatives positives.
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        className="mt-16 rounded-[20px] border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-[0px_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0px_2px_12px_rgba(0,0,0,0.3)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-[600] text-[#191919] dark:text-gray-100">
              Historique des transactions XP
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Gardez un œil sur vos achats, gains et mises en attente.
            </p>
          </div>
        </div>

        {isLoadingTransactions ? (
          <p className="rounded-[16px] border border-dashed border-[#F8589F]/30 px-6 py-6 text-center text-[13px] text-gray-600 dark:text-gray-400">
            Chargement de vos transactions…
          </p>
        ) : transactions.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-[#F8589F]/30 px-6 py-8 text-center text-[13px] text-gray-600 dark:text-gray-400">
            Aucune transaction enregistrée pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.map((transaction) => {
              const statusColor =
                transactionStatusColors[transaction.status] ??
                "text-gray-500";
              const statusLabel =
                transactionStatusLabels[transaction.status] ??
                transaction.status;
              const typeStyle =
                transactionTypeStyles[transaction.type] ??
                "bg-gray-100 text-gray-600";
              const typeLabel =
                transactionTypeLabels[transaction.type] ??
                transaction.type;
              const targetName =
                transaction.perk?.title ??
                transaction.auction?.title ??
                transaction.description ??
                "Transaction XP";
              const amountPrefix =
                transaction.type === "debit" || transaction.type === "hold"
                  ? "-"
                  : "+";

              return (
                <div
                  key={transaction.id}
                  className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeStyle}`}
                      >
                        {typeLabel}
                      </span>
                      <span className="text-[13px] font-semibold text-[#191919] dark:text-gray-100">
                        {amountPrefix}
                        {transaction.amount} XP
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-[#191919] dark:text-gray-200">
                      {targetName}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Référence&nbsp;: {transaction.reference || "—"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                    <p className={`text-[12px] font-semibold ${statusColor}`}>
                      {statusLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RewardsCenter;
