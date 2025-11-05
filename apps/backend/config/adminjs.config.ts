import { getEnvOrFatal } from "common/utils/env.util";
import { Admin } from "src/admin/entities/admin.entity";
import { Faculty } from "src/faculty/entities/faculty.entity";
import { Freelancer } from "src/freelancer/entities/freelancer.entity";
import { Plan } from "src/plan/entities/plan.entity";
import { Subject } from "src/subject/entities/subject.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { University } from "src/university/entities/university.entity";
import { User } from "src/user/entities/user.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { ActivationCard } from "src/activation-cards/entities/activation-card.entity";
import { Course } from "src/course/entities/course.entity";
import { Mode } from "src/mode/entities/mode.entity";
import { RewardCategory } from "src/reward/entities/reward-category.entity";
import { RewardPerk } from "src/reward/entities/reward-perk.entity";
import { RewardAuction } from "src/reward/entities/reward-auction.entity";
import { RewardAuctionBid } from "src/reward/entities/reward-auction-bid.entity";
import { RewardTransaction } from "src/reward/entities/reward-transaction.entity";
import { FeatureAnnouncement } from "src/feature-announcement/entities/feature-announcement.entity";
import { FeatureInteraction } from "src/feature-announcement/entities/feature-interaction.entity";
import { hashString, verifyHash } from "common/utils/hashing";

export const AdminJsConfig = {
  adminJsOptions: {
    rootPath: "/admin",
    resources: [
      {
        resource: Admin,
        options: {
          navigation: "Admin Management",
          properties: {
            password: {
              type: "password",
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
            },
          },
          actions: {
            new: {
              before: async (request) => {
                if (request.payload?.password) {
                  request.payload.password = await hashString(
                    request.payload.password,
                  );
                }
                return request;
              },
            },
            edit: {
              before: async (request) => {
                if (request.payload?.password) {
                  request.payload.password = await hashString(
                    request.payload.password,
                  );
                }
                return request;
              },
            },
          },
        },
      },
      {
        resource: Mode,
        options: {
          navigation: "Admin Management",
        },
      },
      {
        resource: ActivationCard,
        options: {
          navigation: "Admin Management",
        },
      },
      {
        resource: Plan,
        options: {
          navigation: "Admin Management",
        },
      },
      {
        resource: User,
        options: {
          navigation: "Users Management",
        },
      },
      {
        resource: UserProfile,
        options: {
          navigation: "Users Management",
        },
      },
      {
        resource: Freelancer,
        options: {
          navigation: "Freelancers",
          properties: {
            password: {
              type: "password",
              isVisible: {
                list: false,
                filter: false,
                show: false,
                edit: true,
              },
            },
          },
          // The actions object should be INSIDE the options object
          actions: {
            new: {
              before: async (request) => {
                if (request.payload?.password) {
                  const hashedPassword = await hashString(
                    request.payload.password,
                  );
                  request.payload.password = hashedPassword;
                }
                return request;
              },
            },
            edit: {
              before: async (request) => {
                if (request.payload?.password) {
                  const hashedPassword = await hashString(
                    request.payload.password,
                  );
                  request.payload.password = hashedPassword;
                }
                return request;
              },
            },
          },
        },
      },
      {
        resource: Faculty,
        options: {
          navigation: "Education",
        },
      },
      {
        resource: University,
        options: {
          navigation: "Education",
        },
      },
      {
        resource: Subject,
        options: {
          navigation: "Education",
        },
      },
      {
        resource: Unit,
        options: {
          navigation: "Education",
        },
      },
      {
        resource: Course,
        options: {
          navigation: "Education",
        },
      },
      {
        resource: RewardCategory,
        options: {
          navigation: "Rewards",
        },
      },
      {
        resource: RewardPerk,
        options: {
          navigation: "Rewards",
          properties: {
            metadata: {
              type: "textarea",
              isVisible: { list: false, filter: false, show: true, edit: true },
              description:
                "JSON libre. Pour les crédits, utilisez plutôt les champs dédiés ci-dessous.",
            },
            creditMcqs: {
              type: "number",
              label: "Crédits MCQ",
            },
            creditQrocs: {
              type: "number",
              label: "Crédits QROC",
            },
          },
        },
      },
      {
        resource: RewardAuction,
        options: {
          navigation: "Rewards",
        },
      },
      {
        resource: RewardAuctionBid,
        options: {
          navigation: "Rewards",
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false },
            edit: { isAccessible: false },
          },
          listProperties: ["id", "amount", "status", "isWinning"],
        },
      },
      {
        resource: RewardTransaction,
        options: {
          navigation: "Rewards",
        },
      },
      {
        resource: FeatureAnnouncement,
        options: {
          navigation: {
            name: "What's New",
            icon: "Announcement",
          },
          listProperties: [
            "title",
            "version",
            "type",
            "status",
            "release_date",
            "is_active",
          ],
          showProperties: [
            "title",
            "version",
            "description",
            "type",
            "status",
            "release_date",
            "media_type",
            "media_url",
            "thumbnail_url",
            "target_roles",
            "cta_text",
            "cta_link",
            "priority",
            "is_active",
            "createdAt",
            "updatedAt",
          ],
          editProperties: [
            "title",
            "version",
            "description",
            "type",
            "status",
            "release_date",
            "media_type",
            "media_url",
            "thumbnail_url",
            "highlight_steps",
            "target_roles",
            "cta_text",
            "cta_link",
            "priority",
            "is_active",
          ],
          filterProperties: ["title", "type", "status", "target_roles", "is_active"],
          properties: {
            description: {
              type: "richtext",
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true,
              },
            },
            highlight_steps: {
              type: "textarea",
              isVisible: {
                list: false,
                filter: false,
                show: true,
                edit: true,
              },
              description:
                'Format JSON: [{"elementId": "...", "title": "...", "description": "..."}]',
            },
            media_url: {
              type: "string",
              description: "URL de l'image/vidéo (upload vers Cloudinary d'abord)",
            },
            thumbnail_url: {
              type: "string",
              description: "Miniature pour les aperçus vidéo",
            },
            version: {
              description: "Versioning sémantique (ex: 2.1.0)",
            },
            status: {
              availableValues: [
                { value: "draft", label: "Brouillon" },
                { value: "published", label: "Publié" },
                { value: "archived", label: "Archivé" },
              ],
            },
            type: {
              availableValues: [
                { value: "major", label: "Majeure" },
                { value: "minor", label: "Mineure" },
                { value: "update", label: "Mise à jour" },
                { value: "bugfix", label: "Correction de bug" },
              ],
            },
          },
        },
      },
      {
        resource: FeatureInteraction,
        options: {
          navigation: {
            name: "What's New",
            icon: "Analytics",
          },
          actions: {
            new: { isAccessible: false },
            edit: { isAccessible: false },
            delete: { isAccessible: false },
          },
          listProperties: ["id", "seen_at", "tried_at", "dismissed_at", "createdAt"],
        },
      },
    ],
    branding: {
      companyName: "MyQCM Admin",
      logo: "https://res.cloudinary.com/ddqioccgt/image/upload/v1740635000/myqcm_avatar.png",
      theme: {
        colors: {
          primary100: "#4caf50",
          primary80: "#388e3c",
          primary60: "#2e7d32",
          primary40: "#1b5e20",
        },
      },
    },
    dashboard: {
      handler: async () => {}, // Prevents default onboarding tips
      component: null, // Ensures no dashboard UI is rendered
    },
  },
  auth: {
    authenticate: async (email, password) => {
      const admin = await Admin.findOne({
        where: {
          email,
        },
        select: ["email", "password"],
      });
      if (!admin) return null;
      if (!admin.password) return null;
      const password_valid = await verifyHash(password, admin.password);
      if (!password_valid) return null;
      return { email: admin.email, id: admin.id, role: admin.role };
    },
    cookieName: "adminjs",
    cookiePassword:
      getEnvOrFatal("ADMINJS_COOKIE_SECRET") || "complex-secret-key",
    cookieSecure: getEnvOrFatal("APP_ENV") === "production",
    cookieSameSite: "strict",
    cookieOptions: {
      httpOnly: true,
      secure: getEnvOrFatal("APP_ENV") === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  },
  sessionOptions: {
    secret: getEnvOrFatal("ADMINJS_SESSION_SECRET") || "another-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: getEnvOrFatal("APP_ENV") === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  },
};
