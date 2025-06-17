"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaSearch,
  FaSort,
  FaFilter,
  FaEye,
  FaCircleNotch,
  FaCalendarDay,
  FaTag,
  FaArrowLeft,
  FaPlus,
  FaFileDownload,
  FaTrash,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle,
  FaRegularBell,
  FaUserClock,
  FaListAlt,
  FaBug,
} from "react-icons/fa";
import {
  BsCheckCircleFill,
  BsHourglassSplit,
  BsExclamationCircleFill,
  BsXCircleFill,
  BsThreeDots,
} from "react-icons/bs";
import Dash_Header from "@/components/dashboard/Dash_Header";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import Link from "next/link";

const MyReportPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchTerm, sortConfig, statusFilter]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await BaseUrl.get("/report/my-reports");
      if (response.data && response.data.data && response.data.data.data) {
        setReports(response.data.data.data || []);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Erreur lors de la récupération des rapports.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (report) => report.status.toLowerCase() === statusFilter
      );
    }

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === "createdAt") {
          return sortConfig.direction === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        }

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredReports(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getStatusIcon = (status) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return (
          <BsExclamationCircleFill className="text-yellow-500" title="Ouvert" />
        );
      case "IN_PROGRESS":
        return <BsHourglassSplit className="text-blue-500" title="En cours" />;
      case "RESOLVED":
        return <BsCheckCircleFill className="text-green-500" title="Résolu" />;
      case "CLOSED":
        return <BsXCircleFill className="text-gray-500" title="Fermé" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch (status.toUpperCase()) {
      case "OPEN":
        return "Ouvert";
      case "IN_PROGRESS":
        return "En cours";
      case "RESOLVED":
        return "Résolu";
      case "CLOSED":
        return "Fermé";
      default:
        return status;
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity.toUpperCase()) {
      case "LOW":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "MEDIUM":
        return "bg-orange-50 text-orange-700 border-orange-300";
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity.toUpperCase()) {
      case "LOW":
        return "Faible";
      case "MEDIUM":
        return "Moyen";
      case "HIGH":
        return "Elevé";
      default:
        return severity;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredReports.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredReports.map((report) => report.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const exportSelected = () => {
    setIsExporting(true);
    setTimeout(() => {
      toast.success(
        `${selectedRows.length} rapport(s) exporté(s) avec succès!`
      );
      setIsExporting(false);
    }, 1000);
  };

  // Functional delete operation
  const deleteSelected = async () => {
    if (selectedRows.length === 0) return;

    setIsDeleting(true);
    try {
      // Delete each report in parallel
      const deletePromises = selectedRows.map((reportId) =>
        BaseUrl.delete(`/report/${reportId}`)
      );

      await Promise.all(deletePromises);

      // Success message and refresh reports
      toast.success(
        `${selectedRows.length} rapport(s) supprimé(s) avec succès!`,
        {
          icon: "🗑️",
          style: {
            backgroundColor: "#F8589F",
            color: "white",
          },
          duration: 4000,
        }
      );

      // Remove deleted reports from the state
      setReports((prev) =>
        prev.filter((report) => !selectedRows.includes(report.id))
      );
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting reports:", error);
      toast.error("Erreur lors de la suppression des rapports.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Single report delete
  const deleteSingleReport = async (reportId) => {
    try {
      await BaseUrl.delete(`/report/${reportId}`);
      setReports((prev) => prev.filter((report) => report.id !== reportId));
      toast.success("Rapport supprimé avec succès!", {
        icon: "🗑️",
        style: {
          backgroundColor: "#F8589F",
          color: "white",
        },
      });
      setActiveDropdown(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Erreur lors de la suppression du rapport.");
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="bg-[#F7F8FA] pb-10 min-h-screen">
      <Dash_Header />
      <div className="container mx-auto px-5 mt-6">
        {/* Header - Reverting to previous style */}
        <div className="flex flex-wrap items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/report"
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mes Rapports</h1>
              <p className="text-sm text-gray-600">
                Consultez et gérez tous vos rapports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Link
              href="/dashboard/report"
              className="flex items-center gap-2 px-4 py-2 bg-[#F8589F] text-white rounded-md hover:bg-[#e74d91] transition-colors"
            >
              <FaPlus size={14} />
              <span>Nouveau rapport</span>
            </Link>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter size={14} />
              <span className="hidden md:inline">Filtres</span>
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase">
                Total
              </h3>
              <div className="p-2 rounded-md bg-[#FFF5F9]">
                <FaListAlt className="text-[#F8589F] text-lg" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{reports.length}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase">
                En attente
              </h3>
              <div className="p-2 rounded-md bg-yellow-50">
                <BsExclamationCircleFill className="text-yellow-500 text-lg" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {reports.filter((r) => r.status === "open").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase">
                En cours
              </h3>
              <div className="p-2 rounded-md bg-blue-50">
                <BsHourglassSplit className="text-blue-500 text-lg" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {reports.filter((r) => r.status === "in_progress").length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-600 uppercase">
                Résolus
              </h3>
              <div className="p-2 rounded-md bg-green-50">
                <BsCheckCircleFill className="text-green-500 text-lg" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {
                reports.filter(
                  (r) => r.status === "resolved" || r.status === "closed"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-5 rounded-xl mb-6 shadow-md animate-fadeIn">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recherche
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher par titre ou description..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F8589F] focus:border-[#F8589F]"
                  />
                </div>
              </div>

              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F8589F] focus:border-[#F8589F]"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="open">Ouvert</option>
                  <option value="in_progress">En cours</option>
                  <option value="resolved">Résolu</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={sortConfig.key}
                    onChange={(e) =>
                      setSortConfig({ ...sortConfig, key: e.target.value })
                    }
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-[#F8589F] focus:border-[#F8589F]"
                  >
                    <option value="createdAt">Date de création</option>
                    <option value="title">Titre</option>
                    <option value="severity">Sévérité</option>
                    <option value="status">Statut</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortConfig({
                        ...sortConfig,
                        direction:
                          sortConfig.direction === "asc" ? "desc" : "asc",
                      })
                    }
                    className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {sortConfig.direction === "asc" ? (
                      <FaSortAmountUp />
                    ) : (
                      <FaSortAmountDown />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between bg-white p-4 rounded-t-xl border-b border-gray-200 animate-fadeIn">
            <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-[#F8589F] text-white text-xs font-bold rounded-full">
                {selectedRows.length}
              </span>
              <span>
                {selectedRows.length > 1
                  ? "rapports sélectionnés"
                  : "rapport sélectionné"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportSelected}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {isExporting ? (
                  <FaCircleNotch className="animate-spin" />
                ) : (
                  <FaFileDownload />
                )}
                <span>Exporter</span>
              </button>
              <button
                onClick={deleteSelected}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                {isDeleting ? (
                  <FaCircleNotch className="animate-spin" />
                ) : (
                  <FaTrash />
                )}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div
          className={`bg-white rounded-xl shadow-md overflow-hidden ${
            selectedRows.length > 0 ? "rounded-t-none" : ""
          }`}
        >
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-[#FFF5F9] rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-[#F8589F] text-2xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                Aucun rapport trouvé
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Modifiez vos critères de recherche pour afficher plus de résultats."
                  : "Vous n'avez pas encore créé de rapport. Créez votre premier rapport pour commencer à suivre les problèmes."}
              </p>
              <Link
                href="/dashboard/report"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F8589F] text-white rounded-lg hover:bg-[#e74d91] transition-colors shadow-md"
              >
                <FaPlus size={14} />
                <span className="font-medium">Créer un rapport</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Enhanced Beautiful Table with removed Action column and improved borders */}
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600">
                    <th className="px-4 py-4 font-semibold text-center w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.length === filteredReports.length &&
                          filteredReports.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded text-[#F8589F] focus:ring-[#F8589F]"
                      />
                    </th>
                    <th
                      className="px-4 py-4 font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Titre</span>
                        {sortConfig.key === "title" && (
                          <div className="bg-[#F8589F] rounded-full p-1">
                            <FaSort
                              className={`text-white text-xs ${
                                sortConfig.direction === "asc"
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Catégorie</span>
                        {sortConfig.key === "category" && (
                          <div className="bg-[#F8589F] rounded-full p-1">
                            <FaSort
                              className={`text-white text-xs ${
                                sortConfig.direction === "asc"
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleSort("severity")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Sévérité</span>
                        {sortConfig.key === "severity" && (
                          <div className="bg-[#F8589F] rounded-full p-1">
                            <FaSort
                              className={`text-white text-xs ${
                                sortConfig.direction === "asc"
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Statut</span>
                        {sortConfig.key === "status" && (
                          <div className="bg-[#F8589F] rounded-full p-1">
                            <FaSort
                              className={`text-white text-xs ${
                                sortConfig.direction === "asc"
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 py-4 font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-2">
                        <span>Date</span>
                        {sortConfig.key === "createdAt" && (
                          <div className="bg-[#F8589F] rounded-full p-1">
                            <FaSort
                              className={`text-white text-xs ${
                                sortConfig.direction === "asc"
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`border-b-2 border-gray-100 hover:bg-[#FFF5F9]/30 transition-all duration-200 group ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <div className="flex justify-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(report.id)}
                            onChange={() => toggleSelectRow(report.id)}
                            className="rounded text-[#F8589F] focus:ring-[#F8589F]"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-[#FFF5F9] flex items-center justify-center mr-3">
                            <FaBug className="text-[#F8589F]" />
                          </div>
                          <div className="font-medium text-gray-800 group-hover:text-[#F8589F] transition-colors duration-200">
                            {report.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-start">
                          <span className="flex gap-1 items-center px-3 py-1.5 bg-[#F8589F]/5 border border-[#F8589F]/10 text-[#F8589F] rounded-full">
                            <FaTag size={10} />
                            <span className="text-xs font-medium">
                              {report.category.replace(/_/g, " ").toLowerCase()}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-start">
                          <div
                            className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                            ${
                              report.severity.toUpperCase() === "LOW"
                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                : report.severity.toUpperCase() === "MEDIUM"
                                ? "bg-orange-50 text-orange-700 border border-orange-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }
                          `}
                          >
                            {report.severity.toUpperCase() === "HIGH" && (
                              <FaExclamationTriangle size={10} />
                            )}
                            <span className="text-xs font-medium">
                              {getSeverityLabel(report.severity)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          ${
                            report.status === "open"
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : report.status === "in_progress"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : report.status === "resolved"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }
                        `}
                        >
                          {getStatusIcon(report.status)}
                          <span className="text-xs font-medium">
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="bg-gray-50 rounded-md py-1 px-2 inline-flex items-center">
                          <FaCalendarDay
                            className="mr-1.5 text-gray-400"
                            size={12}
                          />
                          <span className="text-xs text-gray-600 font-medium">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination with improved styling */}
          {filteredReports.length > 0 && (
            <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <span className="font-medium text-[#F8589F]">
                    {filteredReports.length}
                  </span>{" "}
                  rapport{filteredReports.length > 1 ? "s" : ""} au total
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex shadow-sm rounded-lg overflow-hidden"
                    aria-label="Pagination"
                  >
                    <button className="relative inline-flex items-center px-3 py-2.5 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-[#FFF5F9] hover:text-[#F8589F]">
                      <span className="sr-only">Précédent</span>
                      &lsaquo;
                    </button>
                    <button className="bg-[#F8589F] text-white relative inline-flex items-center px-4 py-2.5 border border-[#F8589F] text-sm font-medium">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-3 py-2.5 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-[#FFF5F9] hover:text-[#F8589F]">
                      <span className="sr-only">Suivant</span>
                      &rsaquo;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReportPage;
