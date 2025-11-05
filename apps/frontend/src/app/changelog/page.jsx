"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChangelog } from "@/hooks/useWhatsNew";
import { SkipLink, LoadingSpinner } from "@/components/onboarding-v2/AccessibilityUtils";
import Link from "next/link";

export default function ChangelogPage() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: changelog = [], isLoading, error } = useChangelog(selectedFilter, 100);

  // Client-side search filter
  const filteredChangelog = changelog.filter((entry) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.description.toLowerCase().includes(query)
    );
  });

  const filters = [
    { id: null, label: "Tout", icon: "📋" },
    { id: "major", label: "Majeur", icon: "🚀" },
    { id: "minor", label: "Mineur", icon: "✨" },
    { id: "update", label: "Mise à jour", icon: "🔄" },
    { id: "bugfix", label: "Correction", icon: "🐛" },
  ];

  const getTypeStyles = (type) => {
    const styles = {
      major: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
      minor: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white",
      update: "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white",
      bugfix: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
    };
    return styles[type] || styles.update;
  };

  return (
    <>
      <SkipLink href="#main-content">Aller au contenu principal</SkipLink>

      <div className="min-h-screen bg-gradient-to-br from-[#fbfcff] to-[#f5f7fd]">
        {/* Header */}
        <header className="glassmorphism-card border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center text-gray-600 hover:text-[#F8589F] transition-colors mb-4 focus-ring rounded-lg px-2 py-1"
                >
                  <span className="mr-2">←</span>
                  Retour au tableau de bord
                </Link>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  Nouveautés & Mises à jour
                </h1>
                <p className="text-gray-600">
                  Découvrez toutes les nouvelles fonctionnalités et améliorations de MyQCM
                </p>
              </div>
              <div className="text-6xl animate-float">📚</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="max-w-7xl mx-auto px-6 py-12">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search bar */}
            <div className="glassmorphism-card p-4 rounded-2xl">
              <label htmlFor="search-changelog" className="sr-only">
                Rechercher dans le changelog
              </label>
              <input
                id="search-changelog"
                type="text"
                placeholder="🔍 Rechercher dans le changelog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-[#F8589F] focus:outline-none transition-colors text-gray-800"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id || "all"}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all focus-ring press-effect ${
                    selectedFilter === filter.id
                      ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white shadow-lg scale-105"
                      : "glassmorphism-card text-gray-700 hover:shadow-md"
                  }`}
                >
                  <span className="mr-2">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" label="Chargement du changelog..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glassmorphism-card p-8 rounded-2xl text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Erreur de chargement
              </h2>
              <p className="text-gray-600">
                Impossible de charger le changelog. Veuillez réessayer plus tard.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredChangelog.length === 0 && (
            <div className="glassmorphism-card p-12 rounded-2xl text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Aucun résultat
              </h2>
              <p className="text-gray-600">
                {searchQuery
                  ? "Aucune entrée ne correspond à votre recherche."
                  : "Aucune nouveauté pour le moment."}
              </p>
            </div>
          )}

          {/* Changelog Entries */}
          {!isLoading && !error && filteredChangelog.length > 0 && (
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {filteredChangelog.map((entry, index) => (
                  <motion.article
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="glassmorphism-card p-6 rounded-2xl hover-lift"
                  >
                    <div className="flex items-start gap-4">
                      {/* Type Badge */}
                      <div
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${getTypeStyles(
                          entry.type
                        )}`}
                      >
                        {entry.type === "major" && "🚀"}
                        {entry.type === "minor" && "✨"}
                        {entry.type === "update" && "🔄"}
                        {entry.type === "bugfix" && "🐛"}
                        {entry.type === "major" && " Majeur"}
                        {entry.type === "minor" && " Mineur"}
                        {entry.type === "update" && " Mise à jour"}
                        {entry.type === "bugfix" && " Correction"}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h2 className="text-xl font-bold text-gray-800">
                            {entry.title}
                          </h2>
                          <time
                            className="text-sm text-gray-500 whitespace-nowrap ml-4"
                            dateTime={entry.release_date}
                          >
                            {new Date(entry.release_date).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </time>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-4">
                          {entry.description}
                        </p>

                        {/* Media */}
                        {entry.media_url && (
                          <div className="mt-4 rounded-xl overflow-hidden">
                            {entry.media_type === "image" && (
                              <img
                                src={entry.media_url}
                                alt={entry.title}
                                className="w-full h-auto"
                              />
                            )}
                            {entry.media_type === "video" && (
                              <video
                                src={entry.media_url}
                                controls
                                className="w-full h-auto"
                              >
                                Votre navigateur ne supporte pas les vidéos.
                              </video>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        {entry.cta_link && entry.cta_label && (
                          <a
                            href={entry.cta_link}
                            className="inline-flex items-center gap-2 mt-4 px-6 py-2 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white font-semibold rounded-xl hover:shadow-lg transition-all focus-ring"
                          >
                            {entry.cta_label}
                            <span>→</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>

        {/* Decorative background elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#F8589F]/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 right-20 w-80 h-80 bg-[#FF3D88]/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          />
        </div>
      </div>
    </>
  );
}
