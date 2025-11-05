import { DataSource } from 'typeorm';
import { FeatureAnnouncement } from '../feature-announcement/entities/feature-announcement.entity';

/**
 * Seed script for creating initial feature announcements for testing
 *
 * To run this seed:
 * 1. Make sure the database is running and migration is applied
 * 2. Run: npm run seed:feature-announcements (add this script to package.json)
 * 3. Or manually execute with ts-node
 */

export async function seedFeatureAnnouncements(dataSource: DataSource) {
  const featureAnnouncementRepo = dataSource.getRepository(FeatureAnnouncement);

  // Check if seed data already exists
  const existingCount = await featureAnnouncementRepo.count();
  if (existingCount > 0) {
    console.log(`Seed data already exists (${existingCount} announcements). Skipping...`);
    return;
  }

  const sampleAnnouncements = [
    {
      title: 'Système de Streak amélioré',
      description:
        'Nous avons repensé le système de streak pour être plus motivant ! Maintenez votre série quotidienne et débloquez des badges exclusifs. Plus vous êtes régulier, plus vous gagnez de récompenses !',
      type: 'major',
      media_url: null,
      media_type: null,
      cta_label: 'Découvrir',
      cta_link: '/dashboard/progress',
      target_roles: ['user'],
      release_date: new Date('2025-01-15'),
      is_active: true,
      priority: 100,
    },
    {
      title: 'Nouveau système de notifications',
      description:
        'Recevez des notifications intelligentes pour ne jamais manquer une mise à jour importante. Personnalisez vos préférences dans les paramètres.',
      type: 'minor',
      media_url: null,
      media_type: null,
      cta_label: 'Configurer',
      cta_link: '/dashboard/settings',
      target_roles: ['user'],
      release_date: new Date('2025-01-20'),
      is_active: true,
      priority: 90,
    },
    {
      title: 'Interface utilisateur modernisée',
      description:
        'Découvrez notre nouvelle interface avec des animations fluides, des effets glassmorphism et une expérience utilisateur repensée. Plus belle, plus rapide, plus intuitive !',
      type: 'update',
      media_url: null,
      media_type: null,
      cta_label: null,
      cta_link: null,
      target_roles: ['user', 'admin', 'freelancer'],
      release_date: new Date('2025-01-25'),
      is_active: true,
      priority: 85,
    },
    {
      title: 'Système d\'achievements et XP',
      description:
        'Gagnez des points d\'expérience (XP) en utilisant MyQCM ! Complétez des QCM, maintenez votre streak, et débloquez des achievements pour montrer votre progression.',
      type: 'major',
      media_url: null,
      media_type: null,
      cta_label: 'Voir mes achievements',
      cta_link: '/dashboard/achievements',
      target_roles: ['user'],
      release_date: new Date('2025-02-01'),
      is_active: true,
      priority: 95,
    },
    {
      title: 'Correction de bugs mineurs',
      description:
        'Nous avons corrigé plusieurs bugs signalés par la communauté, notamment sur l\'affichage des questions et la synchronisation des données.',
      type: 'bugfix',
      media_url: null,
      media_type: null,
      cta_label: null,
      cta_link: null,
      target_roles: ['user', 'admin', 'freelancer'],
      release_date: new Date('2025-01-30'),
      is_active: true,
      priority: 70,
    },
    {
      title: 'Mode sombre amélioré',
      description:
        'Le mode sombre a été optimisé pour un meilleur contraste et moins de fatigue oculaire. Activez-le dans les paramètres !',
      type: 'update',
      media_url: null,
      media_type: null,
      cta_label: 'Essayer',
      cta_link: '/dashboard/settings',
      target_roles: ['user', 'admin', 'freelancer'],
      release_date: new Date('2025-02-05'),
      is_active: true,
      priority: 75,
    },
    {
      title: 'Statistiques détaillées',
      description:
        'Nouvelle page de statistiques avec des graphiques interactifs pour suivre votre progression par matière, par type de question et par période.',
      type: 'minor',
      media_url: null,
      media_type: null,
      cta_label: 'Voir mes stats',
      cta_link: '/dashboard/progress',
      target_roles: ['user'],
      release_date: new Date('2025-02-10'),
      is_active: true,
      priority: 80,
    },
  ];

  console.log('Seeding feature announcements...');

  const createdAnnouncements = [];
  for (const announcementData of sampleAnnouncements) {
    const announcement = featureAnnouncementRepo.create(announcementData);
    const saved = await featureAnnouncementRepo.save(announcement);
    createdAnnouncements.push(saved);
    console.log(`✓ Created: ${saved.title}`);
  }

  console.log(`\n✅ Successfully seeded ${createdAnnouncements.length} feature announcements!`);
  return createdAnnouncements;
}

// Standalone execution
if (require.main === module) {
  (async () => {
    // You'll need to import your actual data source configuration
    // This is a placeholder - adjust the import path to your actual data source
    const { AppDataSource } = await import('../data-source'); // Adjust path as needed

    try {
      await AppDataSource.initialize();
      console.log('✓ Database connected');

      await seedFeatureAnnouncements(AppDataSource);

      await AppDataSource.destroy();
      console.log('✓ Database connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    }
  })();
}
