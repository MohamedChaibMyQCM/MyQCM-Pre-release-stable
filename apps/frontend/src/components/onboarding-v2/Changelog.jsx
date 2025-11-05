"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useChangelog } from "../../hooks/useWhatsNew";
import { Sparkles, Bug, Zap, Package, Filter, Search } from "lucide-react";

const TypeIcon = ({ type }) => {
  const icons = {
    major: <Sparkles className="w-5 h-5" />,
    minor: <Package className="w-5 h-5" />,
    update: <Zap className="w-5 h-5" />,
    bugfix: <Bug className="w-5 h-5" />,
  };

  return icons[type] || icons.minor;
};

const TypeBadge = ({ type }) => {
  const badges = {
    major: { bg: "bg-purple-100", text: "text-purple-700", label: "Majeure" },
    minor: { bg: "bg-blue-100", text: "text-blue-700", label: "Mineure" },
    update: { bg: "bg-green-100", text: "text-green-700", label: "Mise à jour" },
    bugfix: { bg: "bg-orange-100", text: "text-orange-700", label: "Correction" },
  };

  const badge = badges[type] || badges.minor;

  return (
    <div className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5`}>
      <TypeIcon type={type} />
      <span>{badge.label}</span>
    </div>
  );
};

const ChangelogEntry = ({ entry, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="glassmorphism-card rounded-2xl p-6 hover-lift cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <TypeBadge type={entry.type} />
            <span className="text-sm text-gray-500">Version {entry.version}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {new Date(entry.release_date).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-800">{entry.title}</h3>
        </div>

        {/* Expand indicator */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400"
        >
          ▼
        </motion.div>
      </div>

      {/* Preview description */}
      {!isExpanded && (
        <p className="text-gray-600 text-sm line-clamp-2">
          {entry.description.replace(/<[^>]*>/g, "")}
        </p>
      )}

      {/* Expanded content */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        {isExpanded && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            {/* Media */}
            {entry.media_url && entry.media_type !== "none" && (
              <div className="mb-4">
                {entry.media_type === "image" && (
                  <img
                    src={entry.media_url}
                    alt={entry.title}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                {entry.media_type === "video" && (
                  <video
                    src={entry.media_url}
                    poster={entry.thumbnail_url}
                    className="w-full h-48 object-cover rounded-xl"
                    controls
                  />
                )}
              </div>
            )}

            {/* Full description */}
            <div
              className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: entry.description }}
            />

            {/* CTA */}
            {entry.cta_text && entry.cta_link && (
              <a
                href={entry.cta_link}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <span>{entry.cta_text}</span>
                <span>→</span>
              </a>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function Changelog() {
  const [filter, setFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: changelog = [], isLoading, error } = useChangelog(filter, 50);

  const filteredChangelog = changelog.filter((entry) =>
    searchQuery
      ? entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const filters = [
    { value: null, label: "Tout", icon: <Package className="w-4 h-4" /> },
    { value: "major", label: "Majeures", icon: <Sparkles className="w-4 h-4" /> },
    { value: "minor", label: "Mineures", icon: <Package className="w-4 h-4" /> },
    { value: "update", label: "Mises à jour", icon: <Zap className="w-4 h-4" /> },
    { value: "bugfix", label: "Corrections", icon: <Bug className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fbfcff] to-[#f5f7fd] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold gradient-text mb-4">
            Historique des mises à jour
          </h1>
          <p className="text-xl text-gray-600">
            Découvrez toutes les nouveautés et améliorations de MyQCM
          </p>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8 space-y-4"
        >
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une mise à jour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#F8589F] focus:outline-none transition-colors duration-300 bg-white"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === f.value
                    ? "bg-gradient-to-r from-[#F8589F] to-[#FF3D88] text-white shadow-lg scale-105"
                    : "glassmorphism text-gray-700 hover:scale-105"
                }`}
              >
                {f.icon}
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-[#F8589F]" />
            <p className="text-gray-600 mt-4">Chargement...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600 mb-2">Une erreur est survenue</p>
            <p className="text-gray-600">{error.message}</p>
          </div>
        )}

        {/* Changelog entries */}
        {!isLoading && !error && (
          <>
            {filteredChangelog.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">Aucune mise à jour trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChangelog.map((entry, index) => (
                  <ChangelogEntry key={entry.id} entry={entry} index={index} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 text-gray-500"
        >
          <p>Vous avez des suggestions ? Contactez notre équipe !</p>
        </motion.div>
      </div>
    </div>
  );
}
