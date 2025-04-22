// lib/tours.js

export const dashboardHeaderTour = [
  {
    tour: "dashboardHeaderIntro",
    steps: [
      {
        icon: "👋",
        title: "Bienvenue !",
        content: "Faisons un rapide tour des éléments importants de dashboard.",
        showSkip: true,
      },
      {
        icon: "🔔",
        title: "Notifications",
        content: "Vos mises à jour et alertes importantes apparaîtront ici.",
        selector: "#tour-notification-icon",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "❓",
        title: "QCM Restants",
        content:
          "Indique le nombre de Questions à Choix Multiples que vous pouvez encore faire (ou infini!).",
        selector: "#tour-qcm-display",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "✍️",
        title: "QROC Restants",
        content:
          "Le nombre de Questions à Réponse Ouverte et Courte disponibles.",
        selector: "#tour-qroc-display",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🔥",
        title: "Série (Streak)",
        content:
          "Votre nombre de jours consécutifs d'activité. Essayez de ne pas la briser !",
        selector: "#tour-streak-display",
        side: "left",
        showSkip: true,
      },
      {
        icon: "⭐",
        title: "Points d'Expérience (XP)",
        content:
          "Gagnez des XP en répondant aux questions. Montre votre progression globale.",
        selector: "#tour-xp-display",
        side: "left", // Changed
        showSkip: true,
      },
      {
        icon: "📚",
        title: "Unités d'Étude",
        content:
          "Ici, vous pouvez explorer et commencer les différentes unités de cours disponibles.",
        selector: "#tour-units-section",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "📖",
        title: "Modules Récents",
        content:
          "Retrouvez ici les derniers modules que vous avez étudiés pour reprendre facilement.",
        selector: "#tour-modules-section",
        side: "top",
        showSkip: true,
      },
      {
        icon: "📅",
        title: "Planifiez votre apprentissage",
        content:
          "Visualisez votre activité et planifiez vos sessions d'étude grâce au calendrier.",
        selector: "#tour-calendar-section",
        side: "top",
        showSkip: true,
      },
      {
        icon: "⏱️",
        title: "Temps d'étude",
        content:
          "Suivez le temps consacré à vos études pour mieux gérer votre progression.",
        selector: "#tour-studytime-section",
        side: "top",
        showSkip: true,
      },
      {
        icon: "🎉",
        title: "Tour Principal Terminé !",
        content: "Explorons maintenant vos progrès.",
      },
    ],
  },
];

export const progressSummaryTour = [
  {
    tour: "progressSummary",
    steps: [
      {
        icon: "📊",
        title: "Synthèse des Progrès",
        content: "Explorons la vue d'ensemble de vos performances.",
        showSkip: true,
      },
      {
        icon: "📈",
        title: "Questions tentées",
        content: "Le nombre total de questions auxquelles vous avez répondu.",
        selector: "#tour-question-tentées",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "🎯",
        title: "Précision",
        content: "Votre taux de réussite global sur les questions tentées.",
        selector: "#tour-précision",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "⏱️",
        title: "Temps passé",
        content: "Le temps total consacré à répondre aux questions.",
        selector: "#tour-temps-passé",
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "💪",
        title: "Forces & Faiblesses",
        content:
          "Voyez les matières où vous excellez ou avez besoin de plus de travail.",
        selector: "#tour-stren-weakn",
        side: "bottom", // Reverted side based on user update
        showSkip: true,
      },
      {
        icon: "⏱️",
        title: "Temps d'Étude (Progrès)",
        content: "Votre répartition du temps d'étude dans cette section.",
        selector: "#tour-myprogress-studytime",
        side: "bottom", // Reverted side based on user update
        showSkip: true,
      },
      {
        icon: "⭐",
        title: "Points Totaux",
        content: "Votre score total d'expérience (XP) accumulé.",
        selector: "#tour-total-point",
        side: "left", // Kept side change from user update
        showSkip: true,
      },
      {
        icon: "🏆",
        title: "Classement",
        content: "Votre position par rapport aux autres utilisateurs.",
        selector: "#tour-ranking",
        side: "left", // Kept side change from user update
        showSkip: true,
      },
      {
        icon: "📅",
        title: "Mon Planning (Progrès)",
        content: "Visualisez votre activité planifiée ou passée.",
        selector: "#tour-my-schedule",
        side: "bottom", // Kept side change from user update
        showSkip: true,
      },
      {
        icon: "🎯",
        title: "Précision dans le Temps",
        content: "Suivez l'évolution de votre taux de réussite.",
        selector: "#tour-accuracy-over-time",
        side: "top", // Kept side change from user update
        showSkip: true,
      },
      // Removed the extra #tour-progress-links step from here
      {
        icon: "🎉",
        title: "Synthèse Explorée !",
        content: "Passons maintenant aux détails de l'activité.",
      },
    ],
  },
];

export const progressActivityTour = [
  {
    tour: "progressActivity",
    steps: [
      {
        icon: "🤸",
        title: "Détail de l'Activité",
        content: "Plongeons dans les détails de votre activité récente.",
        showSkip: true,
      },
      {
        icon: "📶",
        title: "Progrès par Module",
        content:
          "Suivez votre avancement spécifique pour chaque module étudié.",
        selector: "#tour-module-progress",
        side: "top",
        showSkip: true,
      },
      {
        icon: "✅",
        title: "Performances Récentes",
        content: "Un résumé de vos résultats sur les activités récentes.",
        selector: "#tour-performance-summary",
        side: "top",
        showSkip: true,
      },
      {
        icon: "📝",
        title: "Quiz Récents",
        content: "Retrouvez la liste de vos derniers quiz.",
        selector: "#tour-recent-quizzes",
        side: "top",
        showSkip: true,
      },
      {
        icon: "📅",
        title: "Calendrier d'Apprentissage",
        content: "Visualisez votre historique d'activité jour par jour.",
        selector: "#tour-learning-calendar",
        side: "top",
        showSkip: true,
      },
      {
        icon: "👍",
        title: "Activité Explorée !",
        content:
          "Vous avez terminé le tour des progrès. Retour au tableau de bord !",
      },
    ],
  },
];
