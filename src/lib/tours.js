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
        side: "bottom",
        showSkip: true,
      },
      {
        icon: "⭐",
        title: "Points d'Expérience (XP)",
        content:
          "Gagnez des XP en répondant aux questions. Montre votre progression globale.",
        selector: "#tour-xp-display",
        side: "bottom",
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
        title: "Tour Terminé !",
        content:
          "Vous savez maintenant où trouver les informations clés. Bonne exploration !",
      },
    ],
  },
];

