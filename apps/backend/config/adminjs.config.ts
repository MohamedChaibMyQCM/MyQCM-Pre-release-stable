import * as path from "path";
import AdminJS, { ComponentLoader } from "adminjs";
import { In, MoreThan } from "typeorm";
import { randomBytes } from "crypto";
import * as fs from "fs";
import { createRequire } from "node:module";
import { getEnvOrFatal } from "common/utils/env.util";
import { hashString, verifyHash } from "common/utils/hashing";
import { Admin } from "src/admin/entities/admin.entity";
import { AdminScope } from "src/admin/enums/admin-scope.enum";
import { AdminAuditLog } from "src/admin/entities/admin-audit-log.entity";
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
import { RewardAuctionStatus } from "src/reward/enums/reward-auction-status.enum";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { TransactionStatus } from "src/transaction/dto/transaction.type";
import { Wallet } from "src/wallet/entities/wallet.entity";
import { TrainingSession } from "src/training-session/entities/training-session.entity";
import { TrainingSessionStatus } from "src/training-session/types/enums/training-session.enum";
import { GenerationRequest } from "src/generation/entities/generation-request.entity";
import { GenerationItem } from "src/generation/entities/generation-item.entity";
import { GenerationRequestStatus } from "src/generation/enums/generation-request-status.enum";
import { GenerationItemStatus } from "src/generation/enums/generation-item-status.enum";
import { Report } from "src/report/entities/report.entity";
import { ReportStatus } from "src/report/type/enum/report-status.enum";
import { ReportSeverity } from "src/report/type/enum/report-severity.enum";
import { Mcq } from "src/mcq/entities/mcq.entity";
import { ClinicalCase } from "src/clinical_case/entities/clinical_case.entity";
import { File } from "src/file/entities/file.entity";

// AdminJS TypeORM adapter does not map `simple-array` columns by default.
// Dynamically import the adapter's helper, bypassing package exports, and
// mark `simple-array` as a string to silence repeated warnings.
const locateNodeModules = () => {
  let currentDir = __dirname;
  const { root } = path.parse(currentDir);
  while (currentDir && currentDir !== root) {
    const candidate = path.join(currentDir, "node_modules");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    currentDir = path.dirname(currentDir);
  }
  throw new Error("Unable to locate node_modules directory for AdminJS helpers");
};

const nodeModulesPath = locateNodeModules();
const dataTypesPath = path.join(
  nodeModulesPath,
  "@adminjs",
  "typeorm",
  "lib",
  "utils",
  "data-types.js",
);

const requireFromHere = createRequire(__filename);

try {
  const { DATA_TYPES } = requireFromHere(dataTypesPath);
  DATA_TYPES["simple-array"] = "string";
} catch (error) {
  console.warn(
    "Unable to patch AdminJS TypeORM data types; `simple-array` warnings may persist.",
    error,
  );
}

const componentLoader = new ComponentLoader();
const componentsRoot = path.resolve(
  __dirname,
  "..",
  "..",
  "adminjs",
  "components",
);

const Components = {
  OperationsDashboard: componentLoader.add(
    "OperationsDashboard",
    path.join(componentsRoot, "dashboard.jsx"),
  ),
  MintActivationCards: componentLoader.add(
    "MintActivationCards",
    path.join(componentsRoot, "mint-activation-cards.jsx"),
  ),
};

const NAV = {
  platform: { name: "Platform Ops", icon: "Settings" },
  education: { name: "Education Graph", icon: "Education" },
  users: { name: "Users & Creators", icon: "User" },
  content: { name: "Content Pipeline", icon: "DocumentSearch" },
  finance: { name: "Finance", icon: "Payments" },
  rewards: { name: "Rewards Lab", icon: "Gift" },
  support: { name: "Support Desk", icon: "HelpCircle" },
};

const relation = (resourceId: string) => ({
  reference: resourceId,
  isVisible: {
    list: true,
    edit: true,
    show: true,
    filter: true,
  },
});

const scopeLabels: Record<AdminScope, string> = {
  [AdminScope.SUPER]: "Super Admin",
  [AdminScope.OPERATIONS]: "Operations",
  [AdminScope.CONTENT]: "Content QA",
  [AdminScope.SUPPORT]: "Support",
  [AdminScope.FINANCE]: "Finance",
  [AdminScope.REWARDS]: "Rewards",
};

const generationStatusLabels: Record<GenerationItemStatus, string> = {
  [GenerationItemStatus.DRAFT]: "Drafting",
  [GenerationItemStatus.PENDING_REVIEW]: "QA queue",
  [GenerationItemStatus.APPROVED]: "Approved",
  [GenerationItemStatus.REJECTED]: "Needs rework",
  [GenerationItemStatus.CONVERTED]: "Live in product",
};

const generationStatusOrder: GenerationItemStatus[] = [
  GenerationItemStatus.DRAFT,
  GenerationItemStatus.PENDING_REVIEW,
  GenerationItemStatus.APPROVED,
  GenerationItemStatus.CONVERTED,
  GenerationItemStatus.REJECTED,
];

const hasScope = (currentAdmin: any, scopes: AdminScope[] = []) => {
  if (!scopes.length) return true;
  const assigned: AdminScope[] = currentAdmin?.scopes ?? [];
  if (assigned.includes(AdminScope.SUPER)) {
    return true;
  }
  return scopes.some((scope) => assigned.includes(scope));
};

const requireScopes =
  (scopes: AdminScope[]) =>
  ({ currentAdmin }: { currentAdmin?: any }) =>
    hasScope(currentAdmin, scopes);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type DailyRawRow = {
  bucket: Date | string;
  value: number | string;
};

type DailyPoint = {
  iso: string;
  label: string;
  fullLabel: string;
  value: number;
};

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const normalizeToUtcMidnight = (date: Date) => {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  return normalized;
};

const parseDateBucket = (value: Date | string) => {
  if (value instanceof Date) {
    return value;
  }
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  const fallback = new Date(`${value}Z`);
  return fallback;
};

const buildDailySeries = (rawRows: DailyRawRow[], days: number, now: Date): DailyPoint[] => {
  const normalizedNow = normalizeToUtcMidnight(now);
  const start = new Date(normalizedNow.getTime() - (days - 1) * DAY_IN_MS);
  const totals = rawRows.reduce<Record<string, number>>((acc, row) => {
    if (row?.bucket === null || row?.bucket === undefined) {
      return acc;
    }
    const date = parseDateBucket(row.bucket);
    const isoKey = normalizeToUtcMidnight(date).toISOString().slice(0, 10);
    const numericValue = Number(row.value ?? 0);
    acc[isoKey] = Number.isFinite(numericValue) ? numericValue : 0;
    return acc;
  }, {});

  return Array.from({ length: days }, (_, idx) => {
    const date = new Date(start.getTime() + idx * DAY_IN_MS);
    const iso = date.toISOString().slice(0, 10);
    return {
      iso,
      label: weekdayFormatter.format(date),
      fullLabel: dayFormatter.format(date),
      value: totals[iso] ?? 0,
    };
  });
};

const sumSeries = (series: Array<{ value: number }> = []) =>
  series.reduce((total, point) => total + (point?.value ?? 0), 0);

const percentChange = (current: number, previous: number) => {
  if (!previous) {
    return null;
  }
  const delta = ((current - previous) / previous) * 100;
  return Math.round(delta * 10) / 10;
};

type AuditPayload = {
  resource: string;
  action: string;
  recordId?: string | null;
  context?: Record<string, unknown> | null;
};

const recordAuditLog = async (
  currentAdmin: any,
  payload: AuditPayload,
) => {
  if (!currentAdmin) return;
  await AdminAuditLog.create({
    adminId: currentAdmin.id ?? null,
    adminEmail: currentAdmin.email,
    resource: payload.resource,
    action: payload.action,
    recordId: payload.recordId ?? null,
    context: payload.context ?? null,
  }).save();
};

const hashPasswordBeforeSave = async (request: any) => {
  if (request.payload?.password) {
    request.payload.password = await hashString(request.payload.password);
  }
  return request;
};

const generateActivationCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const buffer = randomBytes(24);
  let code = "";
  for (let i = 0; i < 24; i++) {
    code += chars[buffer[i] % chars.length];
    if ((i + 1) % 4 === 0 && i !== 23) code += "-";
  }
  return code;
};

const loadDashboard = async () => {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const nowUtc = normalizeToUtcMidnight(now);
  const chartWindowDays = 7;
  const trendWindowDays = chartWindowDays * 2;
  const trendWindowStart = new Date(
    nowUtc.getTime() - (trendWindowDays - 1) * DAY_IN_MS,
  );

  const [
    totalUsers,
    newUsers24h,
    pendingRequests,
    pendingItems,
    pendingReports,
    highSeverity,
    activeAuctions,
    pendingTransactions,
    activeSessions,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { createdAt: MoreThan(last24h) } }),
    GenerationRequest.count({
      where: {
        status: In([
          GenerationRequestStatus.AWAITING_UPLOAD,
          GenerationRequestStatus.UPLOAD_IN_PROGRESS,
          GenerationRequestStatus.PROCESSING,
          GenerationRequestStatus.READY_FOR_REVIEW,
        ]),
      },
    }),
    GenerationItem.count({
      where: {
        status: In([
          GenerationItemStatus.DRAFT,
          GenerationItemStatus.PENDING_REVIEW,
          GenerationItemStatus.APPROVED,
        ]),
      },
    }),
    Report.count({
      where: { status: In([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]) },
    }),
    Report.count({
      where: {
        status: In([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]),
        severity: ReportSeverity.HIGH,
      },
    }),
    RewardAuction.count({
      where: {
        status: In([
          RewardAuctionStatus.SCHEDULED,
          RewardAuctionStatus.ACTIVE,
        ]),
      },
    }),
    Transaction.count({ where: { status: TransactionStatus.pending } }),
    TrainingSession.count({
      where: { status: TrainingSessionStatus.IN_PROGRESS },
    }),
  ]);

  const latestAlerts = await Report.find({
    where: { status: In([ReportStatus.OPEN, ReportStatus.IN_PROGRESS]) },
    order: { createdAt: "DESC" },
    take: 4,
  });

  const [userTrendRaw, payoutTrendRaw, contentStatusRaw] = await Promise.all([
    User.createQueryBuilder("user")
      .select("DATE_TRUNC('day', user.createdAt)", "bucket")
      .addSelect("COUNT(user.id)", "value")
      .where("user.createdAt >= :since", { since: trendWindowStart })
      .groupBy("bucket")
      .orderBy("bucket", "ASC")
      .getRawMany(),
    Transaction.createQueryBuilder("transaction")
      .select("DATE_TRUNC('day', transaction.createdAt)", "bucket")
      .addSelect("COALESCE(SUM(transaction.amount), 0)", "value")
      .where("transaction.createdAt >= :since", { since: trendWindowStart })
      .andWhere("transaction.status IN (:...statuses)", {
        statuses: [TransactionStatus.completed, TransactionStatus.pending],
      })
      .groupBy("bucket")
      .orderBy("bucket", "ASC")
      .getRawMany(),
    GenerationItem.createQueryBuilder("item")
      .select("item.status", "status")
      .addSelect("COUNT(item.id)", "value")
      .groupBy("item.status")
      .getRawMany(),
  ]);

  const userTrendSeriesFull = buildDailySeries(
    userTrendRaw,
    trendWindowDays,
    nowUtc,
  );
  const userTrendSeries = userTrendSeriesFull.slice(-chartWindowDays);
  const userTrendPrevSeries = userTrendSeriesFull.slice(0, chartWindowDays);
  const weeklySignups = sumSeries(userTrendSeries);
  const previousWeeklySignups = sumSeries(userTrendPrevSeries);
  const signupDelta = percentChange(weeklySignups, previousWeeklySignups);

  const payoutTrendSeriesFull = buildDailySeries(
    payoutTrendRaw,
    trendWindowDays,
    nowUtc,
  );
  const payoutTrendSeries = payoutTrendSeriesFull.slice(-chartWindowDays);
  const payoutTrendPrevSeries = payoutTrendSeriesFull.slice(
    0,
    chartWindowDays,
  );
  const payoutWeekTotal =
    Math.round(sumSeries(payoutTrendSeries) * 100) / 100;
  const payoutPrevWeekTotal = sumSeries(payoutTrendPrevSeries);
  const payoutDelta = percentChange(payoutWeekTotal, payoutPrevWeekTotal);

  const contentStatusSeries = generationStatusOrder.map((status) => {
    const match = contentStatusRaw.find((row) => row.status === status);
    return {
      label: generationStatusLabels[status],
      value: Number(match?.value ?? 0),
    };
  });
  const totalPipelineItems = contentStatusSeries.reduce(
    (acc, entry) => acc + entry.value,
    0,
  );

  const charts = [
    {
      id: "user-growth",
      title: "Learner signups",
      description: "New accounts captured per day (7-day window)",
      type: "line",
      data: userTrendSeries.map((point) => ({
        label: point.label,
        fullLabel: point.fullLabel,
        value: point.value,
      })),
      meta: {
        total: weeklySignups,
        delta: signupDelta,
        deltaLabel: "vs previous 7 days",
      },
    },
    {
      id: "creator-payouts",
      title: "Creator payouts",
      description: "Daily payout volume initiated",
      type: "line",
      data: payoutTrendSeries.map((point) => ({
        label: point.label,
        fullLabel: point.fullLabel,
        value: Math.round(point.value * 100) / 100,
      })),
      meta: {
        total: payoutWeekTotal,
        delta: payoutDelta,
        deltaLabel: "vs previous 7 days",
      },
    },
    {
      id: "content-pipeline",
      title: "Content pipeline mix",
      description: "Live distribution of generated items",
      type: "bar",
      data: contentStatusSeries,
      meta: {
        total: totalPipelineItems,
        deltaLabel: "items tracked",
      },
    },
  ];

  return {
    metrics: [
      {
        label: "New users (24h)",
        value: newUsers24h,
        hint: `Total learners: ${totalUsers}`,
        icon: "User",
      },
      {
        label: "Content requests in flight",
        value: pendingRequests,
        hint: `${pendingItems} items awaiting QA`,
        icon: "DocumentSearch",
      },
      {
        label: "Open support tickets",
        value: pendingReports,
        hint: `${highSeverity} high severity`,
        icon: "LifeBuoy",
      },
      {
        label: "Pending payouts",
        value: pendingTransactions,
        hint: `${activeAuctions} live auctions`,
        icon: "Payments",
      },
      {
        label: "Active sessions",
        value: activeSessions,
        hint: "Learners currently training",
        icon: "Activity",
      },
    ],
    shortcuts: [
      {
        label: "Review content queue",
        description: "Approve, reject, or fast-track generated items.",
        href: "/admin/resources/GenerationItem",
        icon: "DocumentSearch",
      },
      {
        label: "Resolve support tickets",
        description: "Close bug reports and notify learners.",
        href: "/admin/resources/Report",
        icon: "LifeBuoy",
      },
      {
        label: "Manage rewards drop",
        description: "Schedule perks, auctions, and activation codes.",
        href: "/admin/resources/RewardAuction",
        icon: "Gift",
      },
      {
        label: "Trigger payouts",
        description: "Validate creator wallets and settle transactions.",
        href: "/admin/resources/Transaction",
        icon: "Payments",
      },
    ],
    alerts: latestAlerts.map((alert) => ({
      id: alert.id,
      title: alert.title,
      severity: alert.severity,
      status: alert.status,
    })),
    charts,
  };
};

const scopeOptions = Object.values(AdminScope).map((value) => ({
  value,
  label: scopeLabels[value],
}));

export const AdminJsConfig = {
  adminJsOptions: {
    rootPath: "/admin",
    componentLoader,
    resources: [
      {
        resource: Admin,
        options: {
          navigation: NAV.platform,
          listProperties: ["email", "role", "scopes", "createdAt"],
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
            scopes: {
              availableValues: scopeOptions,
            },
          },
          actions: {
            new: {
              before: hashPasswordBeforeSave,
              isAccessible: requireScopes([AdminScope.SUPER]),
              after: async (response, request, context) => {
                await recordAuditLog(context.currentAdmin, {
                  resource: "Admin",
                  action: "create",
                  recordId: response.record?.id,
                  context: { email: request.payload?.email },
                });
                return response;
              },
            },
            edit: {
              before: hashPasswordBeforeSave,
              isAccessible: requireScopes([AdminScope.SUPER]),
              after: async (response, request, context) => {
                await recordAuditLog(context.currentAdmin, {
                  resource: "Admin",
                  action: "update",
                  recordId: context.record?.id(),
                  context: request.payload,
                });
                return response;
              },
            },
            delete: {
              isAccessible: requireScopes([AdminScope.SUPER]),
              guard: "This will remove access for this admin. Continue?",
              after: async (response, request, context) => {
                await recordAuditLog(context.currentAdmin, {
                  resource: "Admin",
                  action: "delete",
                  recordId: request?.params?.recordId,
                  context: null,
                });
                return response;
              },
            },
          },
        },
      },
      {
        resource: Mode,
        options: {
          navigation: NAV.platform,
          listProperties: ["name", "include_qcm_definer", "updatedAt"],
          sort: { direction: "desc", sortBy: "updatedAt" },
        },
      },
      {
        resource: ActivationCard,
        options: {
          navigation: NAV.platform,
          listProperties: [
            "code",
            "plan",
            "is_redeemed",
            "redeemed_at",
            "expires_at",
          ],
          properties: {
            plan: relation("Plan"),
            redeemed_by: relation("User"),
          },
          actions: {
            "mint-batch": {
              actionType: "resource",
              icon: "Add",
              isVisible: true,
              component: Components.MintActivationCards,
              isAccessible: requireScopes([
                AdminScope.SUPER,
                AdminScope.OPERATIONS,
                AdminScope.REWARDS,
              ]),
              handler: async (request, _response, context) => {
                if (request.method === "get") {
                  return {
                    notice: {
                      type: "info",
                      message:
                        "Provide `plan`, `quantity`, and optional `expires_at` in the request payload.",
                    },
                  };
                }

                const quantity = Number(request.payload?.quantity ?? 0);
                const plan = request.payload?.plan as string;
                const expires_at = request.payload?.expires_at
                  ? new Date(request.payload.expires_at)
                  : null;

                if (!plan || quantity <= 0) {
                  return {
                    notice: {
                      type: "error",
                      message:
                        "Plan and positive quantity are required to mint activation cards.",
                    },
                  };
                }

                const selectedPlan = await Plan.findOne({
                  where: { id: plan },
                });

                if (!selectedPlan) {
                  return {
                    notice: {
                      type: "error",
                      message: "Selected plan could not be found.",
                    },
                  };
                }

                const cards = Array.from({ length: quantity }).map(() =>
                  ActivationCard.create({
                    code: generateActivationCode(),
                    plan: selectedPlan,
                    expires_at,
                  }),
                );
                const savedCards = await ActivationCard.save(cards);

                await recordAuditLog(context.currentAdmin, {
                  resource: "ActivationCard",
                  action: "mint-batch",
                  recordId: null,
                  context: { quantity, plan },
                });

                const timestamp = new Date()
                  .toISOString()
                  .replace(/[:.]/g, "-");
                const safePlanSlug = selectedPlan.name
                  ? selectedPlan.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
                  : "plan";

                const excelExport = {
                  generatedAt: new Date(),
                  fileName: `activation-cards-${safePlanSlug}-${timestamp}.xlsx`,
                  plan: {
                    id: selectedPlan.id,
                    name: selectedPlan.name,
                    period: selectedPlan.period,
                    price: selectedPlan.price,
                  },
                  cards: savedCards.map((card) => ({
                    code: card.code,
                    expires_at: card.expires_at,
                    created_at: card.createdAt,
                  })),
                };

                return {
                  notice: {
                    type: "success",
                    message: `Minted ${quantity} activation card(s).`,
                  },
                  excelExport,
                };
              },
            },
          },
        },
      },
      {
        resource: Plan,
        options: {
          navigation: NAV.platform,
          listProperties: [
            "name",
            "price",
            "period",
            "is_default",
            "is_alpha",
            "createdAt",
          ],
        },
      },
      {
        resource: User,
        options: {
          navigation: NAV.support,
          listProperties: [
            "name",
            "email",
            "user_verified",
            "email_verified",
            "createdAt",
          ],
          actions: {
            edit: {
              isAccessible: requireScopes([
                AdminScope.SUPPORT,
                AdminScope.OPERATIONS,
                AdminScope.SUPER,
              ]),
            },
          },
        },
      },
      {
        resource: UserProfile,
        options: {
          navigation: NAV.support,
          listProperties: [
            "user",
            "study_field",
            "year_of_study",
            "university",
            "mode",
          ],
          properties: {
            user: relation("User"),
            university: relation("University"),
            unit: relation("Unit"),
            mode: relation("Mode"),
          },
        },
      },
      {
        resource: Freelancer,
        options: {
          navigation: NAV.users,
          listProperties: [
            "name",
            "email",
            "is_verified",
            "createdAt",
            "updatedAt",
          ],
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
              before: hashPasswordBeforeSave,
              isAccessible: requireScopes([
                AdminScope.OPERATIONS,
                AdminScope.SUPER,
              ]),
            },
            edit: {
              before: hashPasswordBeforeSave,
              isAccessible: requireScopes([
                AdminScope.OPERATIONS,
                AdminScope.SUPER,
              ]),
            },
            "mark-verified": {
              actionType: "record",
              icon: "CheckCircle",
              guard: "Mark this freelancer as verified?",
              isAccessible: requireScopes([
                AdminScope.OPERATIONS,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Freelancer record not loaded.",
                    },
                  };
                }
                await record.update({ is_verified: true });
                await recordAuditLog(context.currentAdmin, {
                  resource: "Freelancer",
                  action: "mark-verified",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Freelancer flagged as verified.",
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: Faculty,
        options: {
          navigation: NAV.education,
        },
      },
      {
        resource: University,
        options: {
          navigation: NAV.education,
        },
      },
      {
        resource: Subject,
        options: {
          navigation: NAV.education,
          properties: {
            name: { isTitle: true },
          },
          sort: { sortBy: "name", direction: "asc" },
        },
      },
      {
        resource: Unit,
        options: {
          navigation: NAV.education,
        },
      },
      {
        resource: Course,
        options: {
          navigation: NAV.education,
        },
      },
      {
        resource: RewardCategory,
        options: {
          navigation: NAV.rewards,
        },
      },
      {
        resource: RewardPerk,
        options: {
          navigation: NAV.rewards,
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
          navigation: NAV.rewards,
          listProperties: [
            "title",
            "status",
            "startingBid",
            "minimumIncrement",
            "startsAt",
            "endsAt",
          ],
          actions: {
            "start-now": {
              actionType: "record",
              icon: "Play",
              guard: "Start this auction immediately?",
              isAccessible: requireScopes([
                AdminScope.REWARDS,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Auction record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: RewardAuctionStatus.ACTIVE,
                  startsAt: new Date(),
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "RewardAuction",
                  action: "start-now",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Auction started.",
                  },
                };
              },
            },
            "complete-auction": {
              actionType: "record",
              icon: "Stop",
              guard: "Mark this auction as completed?",
              isAccessible: requireScopes([
                AdminScope.REWARDS,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Auction record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: RewardAuctionStatus.COMPLETED,
                  endsAt: new Date(),
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "RewardAuction",
                  action: "complete",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Auction completed.",
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: RewardAuctionBid,
        options: {
          navigation: NAV.rewards,
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
          navigation: NAV.rewards,
        },
      },
      {
        resource: File,
        options: {
          navigation: false,
          actions: {
            new: { isAccessible: false },
            edit: { isAccessible: false },
            delete: { isAccessible: false },
            list: { isAccessible: false },
            show: { isAccessible: false },
          },
        },
      },
      {
        resource: ClinicalCase,
        options: {
          navigation: NAV.content,
          listProperties: ["title", "faculty_type", "year_of_study", "type", "updatedAt"],
          properties: {
            university: relation("University"),
            faculty: relation("Faculty"),
            unit: relation("Unit"),
            subject: relation("Subject"),
            freelancer: relation("Freelancer"),
            objectives: {
              type: "textarea",
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            tags: {
              type: "textarea",
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
            scenario: {
              type: "textarea",
            },
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
      {
        resource: Mcq,
        options: {
          navigation: NAV.content,
          sort: { sortBy: "updatedAt", direction: "desc" },
          listProperties: [
            "question",
            "difficulty",
            "type",
            "approval_status",
            "updatedAt",
          ],
          properties: {
            question: { isTitle: true },
            keywords: {
              type: "textarea",
              isVisible: { list: false, filter: false, show: true, edit: true },
              description: "Comma-separated keywords synced from the simple-array column.",
            },
            clinical_case: relation("ClinicalCase"),
            freelancer: relation("Freelancer"),
            university: relation("University"),
            faculty: relation("Faculty"),
            unit: relation("Unit"),
            subject: relation("Subject"),
            course: relation("Course"),
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
      {
        resource: Transaction,
        options: {
          navigation: NAV.finance,
          listProperties: [
            "freelancer",
            "amount",
            "type",
            "status",
            "payment_date",
          ],
          properties: {
            freelancer: relation("Freelancer"),
            mcq: relation("Mcq"),
          },
          actions: {
            "mark-paid": {
              actionType: "record",
              icon: "Payments",
              guard: "Mark this transaction as paid and notify accounting?",
              isAccessible: requireScopes([
                AdminScope.FINANCE,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Transaction record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: TransactionStatus.completed,
                  payment_date: new Date(),
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "Transaction",
                  action: "mark-paid",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Transaction marked as completed.",
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: Wallet,
        options: {
          navigation: NAV.finance,
          listProperties: ["freelancer", "balance", "updatedAt"],
          properties: {
            freelancer: relation("Freelancer"),
          },
          actions: {
            edit: { isAccessible: requireScopes([AdminScope.SUPER]) },
          },
        },
      },
      {
        resource: GenerationRequest,
        options: {
          navigation: NAV.content,
          sort: { sortBy: "createdAt", direction: "desc" },
          listProperties: [
            "subject",
            "course",
            "status",
            "requested_mcq_count",
            "requested_qroc_count",
            "createdAt",
          ],
          filterProperties: ["status", "freelancer", "university", "course"],
          properties: {
            id: { isTitle: true },
            freelancer: relation("Freelancer"),
            university: relation("University"),
            faculty: relation("Faculty"),
            unit: relation("Unit"),
            subject: relation("Subject"),
            course: relation("Course"),
          },
          actions: {
            "mark-ready": {
              actionType: "record",
              icon: "Rocket",
              guard: "Move this request to READY_FOR_REVIEW?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Request record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationRequestStatus.READY_FOR_REVIEW,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationRequest",
                  action: "mark-ready",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Request moved to READY_FOR_REVIEW.",
                  },
                };
              },
            },
            "mark-processing": {
              actionType: "record",
              icon: "Adjustments",
              guard: "Send this request back to PROCESSING?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Request record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationRequestStatus.PROCESSING,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationRequest",
                  action: "mark-processing",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Request moved to PROCESSING.",
                  },
                };
              },
            },
            "complete-request": {
              actionType: "record",
              icon: "CheckCircle",
              guard: "Mark this request as COMPLETED?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Request record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationRequestStatus.COMPLETED,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationRequest",
                  action: "complete",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Request marked as COMPLETED.",
                  },
                };
              },
            },
            "flag-request-failed": {
              actionType: "record",
              icon: "Warning",
              guard: "Flag this request as FAILED?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Request record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationRequestStatus.FAILED,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationRequest",
                  action: "failed",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Request flagged as FAILED.",
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: GenerationItem,
        options: {
          navigation: NAV.content,
          listProperties: ["request", "type", "status", "updatedAt"],
          properties: {
            request: relation("GenerationRequest"),
          },
          actions: {
            "approve-item": {
              actionType: "record",
              icon: "ThumbsUp",
              guard: "Approve this generated item?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Item record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationItemStatus.APPROVED,
                  rejection_reason: null,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationItem",
                  action: "approve",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Item approved.",
                  },
                };
              },
            },
            "reject-item": {
              actionType: "record",
              icon: "ThumbsDown",
              guard: "Reject this generated item?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Item record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationItemStatus.REJECTED,
                  rejection_reason: "Rejected from admin panel",
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationItem",
                  action: "reject",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Item rejected.",
                  },
                };
              },
            },
            "return-to-draft": {
              actionType: "record",
              icon: "Undo",
              guard: "Return this item to draft so freelancers can retry?",
              isAccessible: requireScopes([
                AdminScope.CONTENT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Item record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: GenerationItemStatus.DRAFT,
                  rejection_reason: null,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "GenerationItem",
                  action: "return-to-draft",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Item moved back to draft.",
                  },
                };
              },
            },
          },
        },
      },
      {
        resource: TrainingSession,
        options: {
          navigation: NAV.content,
          listProperties: [
            "user",
            "course",
            "status",
            "number_of_questions",
            "accuracy",
            "xp_earned",
          ],
          properties: {
            user: relation("User"),
            course: relation("Course"),
          },
        },
      },
      {
        resource: Report,
        options: {
          navigation: NAV.support,
          listProperties: ["title", "category", "severity", "status", "user"],
          properties: {
            user: relation("User"),
            screenshot: relation("File"),
          },
          actions: {
            "resolve-ticket": {
              actionType: "record",
              icon: "CheckCircle",
              guard: "Resolve this ticket and notify the learner?",
              isAccessible: requireScopes([
                AdminScope.SUPPORT,
                AdminScope.SUPER,
              ]),
              handler: async (_request, _response, context) => {
                const { record } = context;
                if (!record) {
                  return {
                    notice: {
                      type: "error",
                      message: "Report record not loaded.",
                    },
                  };
                }
                await record.update({
                  status: ReportStatus.RESOLVED,
                });
                await recordAuditLog(context.currentAdmin, {
                  resource: "Report",
                  action: "resolve",
                  recordId: record.id(),
                  context: null,
                });
                return {
                  record: await record.populate(),
                  notice: {
                    type: "success",
                    message: "Ticket resolved.",
                  },
                };
              },
            },
          },
        },
      },
    ],
    branding: {
      companyName: "MyQCM Control Tower",
      logo: "https://res.cloudinary.com/ddqioccgt/image/upload/v1740635000/myqcm_avatar.png",
      withMadeWithLove: false,
      theme: {
        colors: {
          primary100: "#F8589F",
          primary80: "#FF6FB5",
          primary60: "#FF9FD0",
          primary40: "#FFE3EF",
          accent: "#FFF5FA",
          accentLight: "#FFEFF6",
          bg: "#F7F8FA",
          hoverBg: "#FFE7F1",
          filterBg: "#FFEFF6",
          text: "#1F1235",
          border: "#F8D8E8",
          info: "#3B82F6",
          success: "#22C55E",
          warning: "#F59E0B",
          danger: "#EF4444",
          grey100: "#1B1B3A",
          grey80: "#3F2D53",
          grey60: "#6A5D7D",
          grey40: "#B3A9C8",
          grey20: "#E6E1F1",
          grey10: "#F9F5FB",
        },
        font: "'Poppins', 'Inter', sans-serif",
        shadows: {
          card: "0px 20px 45px rgba(248, 88, 159, 0.12)",
          focus: "0 0 0 3px rgba(248, 88, 159, 0.35)",
        },
        radii: {
          card: 24,
          default: 16,
        },
      },
    },
    dashboard: {
      handler: loadDashboard,
      component: Components.OperationsDashboard,
    },
  },
  auth: {
    authenticate: async (email, password) => {
      const admin = await Admin.findOne({
        where: {
          email,
        },
        select: ["email", "password", "id", "scopes"],
      });
      if (!admin) return null;
      if (!admin.password) return null;
      const password_valid = await verifyHash(password, admin.password);
      if (!password_valid) return null;
      return {
        email: admin.email,
        id: admin.id,
        role: admin.role,
        scopes: admin.scopes,
      };
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
