import React, { useCallback, useEffect, useState } from "react";
import { ApiClient } from "adminjs";
import {
  Badge,
  Box,
  Button,
  H2,
  H5,
  Icon,
  Label,
  Loader,
  Text,
} from "@adminjs/design-system";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

const api = new ApiClient();

const BRAND = {
  primary: "#F8589F",
  primarySoft: "#FFE3EF",
  accent: "#FFF5FA",
  midnight: "#1F1235",
  plum: "#351A45",
};

const heroGradient =
  "linear-gradient(120deg, rgba(31,18,53,1) 0%, rgba(92,26,85,1) 55%, rgba(248,88,159,1) 100%)";

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const initialDashboardState = {
  metrics: [],
  shortcuts: [],
  alerts: [],
  charts: [],
};

const severityVariant = {
  HIGH: "danger",
  MEDIUM: "secondary",
  LOW: "info",
};

const statusCopy = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const formatMetricValue = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  return value;
};

const formatCompactMetric = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value !== "number" || Number.isNaN(value)) {
    return value;
  }
  return compactNumberFormatter.format(value);
};

const formatDelta = (delta) => {
  if (delta === null || delta === undefined || Number.isNaN(delta)) {
    return null;
  }
  const formatted =
    Math.abs(delta) >= 100 ? Math.round(delta) : Number(delta).toFixed(1);
  return `${delta > 0 ? "+" : ""}${formatted}%`;
};

const KpiCard = ({ metric }) => (
  <Box
    variant="card"
    p="xl"
    display="flex"
    flexDirection="column"
    gap="sm"
    style={{
      borderRadius: 20,
      border: "1px solid #F8D8E8",
      background: "linear-gradient(180deg, #FFF5FA 0%, #FFFFFF 100%)",
      boxShadow: "0px 18px 40px rgba(248, 88, 159, 0.08)",
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Label color="grey60">{metric.label}</Label>
      {metric.icon && <Icon icon={metric.icon} size={24} color={BRAND.primary} />}
    </Box>
    <H2 mb="xs">{formatMetricValue(metric.value)}</H2>
    {metric.hint ? (
      <Text variant="sm" color="grey60">
        {metric.hint}
      </Text>
    ) : null}
  </Box>
);

const ShortcutCard = ({ shortcut }) => (
  <Box
    variant="card"
    p="xl"
    display="flex"
    flexDirection="column"
    gap="md"
    style={{
      borderRadius: 20,
      border: "1px solid #F1E5F7",
      backgroundColor: "#FFFFFF",
      boxShadow: "0px 14px 30px rgba(53, 26, 69, 0.05)",
    }}
  >
    <Box display="flex" alignItems="center" gap="sm">
      {shortcut.icon && <Icon icon={shortcut.icon} size={18} color={BRAND.primary} />}
      <H5 mb={0}>{shortcut.label}</H5>
    </Box>
    <Text variant="sm" color="grey60">
      {shortcut.description}
    </Text>
    <Button as="a" href={shortcut.href} size="sm" variant="contained" color="primary">
      Open
    </Button>
  </Box>
);

const AlertCard = ({ alert }) => (
  <Box
    variant="card"
    p="xl"
    display="flex"
    flexDirection="column"
    gap="sm"
    style={{
      borderRadius: 20,
      borderLeft: `4px solid ${
        severityVariant[alert.severity] === "danger" ? BRAND.primary : "#E4E6F1"
      }`,
      boxShadow: "0px 14px 32px rgba(31, 18, 53, 0.06)",
    }}
  >
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <Badge variant={severityVariant[alert.severity] ?? "secondary"} size="sm">
        {alert.severity || "INFO"}
      </Badge>
      <Text variant="sm" color="grey60">
        {statusCopy[alert.status] ?? alert.status ?? "New"}
      </Text>
    </Box>
    <Text fontWeight="bold">{alert.title}</Text>
  </Box>
);

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }
  const point = payload[0]?.payload;
  return (
    <Box
      variant="card"
      p="md"
      style={{
        borderRadius: 12,
        border: "1px solid #F3E3F4",
        boxShadow: "0px 20px 35px rgba(31, 18, 53, 0.12)",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text fontWeight="bold">{point?.fullLabel ?? point?.label ?? "—"}</Text>
      <Text variant="sm" color="grey60">
        {formatMetricValue(point?.value)}
      </Text>
    </Box>
  );
};

const ChartCard = ({ chart }) => {
  const chartKey =
    chart?.id ??
    chart?.title?.toLowerCase().replace(/\s+/g, "-") ??
    "chart-card";
  const hasSeries = chart?.data?.length;

  return (
    <Box
      variant="card"
      p="xl"
      display="flex"
      flexDirection="column"
      gap="lg"
      style={{
        borderRadius: 24,
        border: "1px solid #F1E5F7",
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 25px 55px rgba(31, 18, 53, 0.08)",
      }}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="lg">
        <Box>
          <H5 mb="xs">{chart.title}</H5>
          <Text variant="sm" color="grey60">
            {chart.description}
          </Text>
        </Box>
        <Box textAlign="right" minWidth="120px">
          <Text fontSize="24px" fontWeight="bold">
            {formatCompactMetric(chart?.meta?.total)}
          </Text>
          {chart?.meta?.deltaLabel ? (
            <Text variant="sm" color="grey60" style={{ fontSize: "12px" }}>
              {chart.meta.deltaLabel}
            </Text>
          ) : null}
          {chart?.meta?.delta !== null && chart?.meta?.delta !== undefined ? (
            <Badge
              mt="sm"
              variant={chart.meta.delta >= 0 ? "success" : "danger"}
              size="sm"
            >
              {formatDelta(chart.meta.delta)}
            </Badge>
          ) : null}
        </Box>
      </Box>
      {hasSeries ? (
        <Box height="240px">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "bar" ? (
              <BarChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4DAEC" />
                <XAxis dataKey="label" stroke="#B0A8C0" />
                <YAxis
                  stroke="#B0A8C0"
                  allowDecimals={false}
                  width={40}
                  tickFormatter={(value) => (value > 999 ? `${Math.round(value / 1000)}k` : value)}
                />
                <RechartsTooltip cursor={{ fill: "rgba(248, 88, 159, 0.08)" }} content={<ChartTooltip />} />
                <Bar
                  dataKey="value"
                  fill={BRAND.primary}
                  radius={[12, 12, 12, 12]}
                  maxBarSize={40}
                />
              </BarChart>
            ) : (
              <AreaChart data={chart.data}>
                <defs>
                  <linearGradient id={`gradient-${chartKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={BRAND.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F4DAEC" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#B0A8C0" />
                <YAxis
                  stroke="#B0A8C0"
                  allowDecimals={false}
                  width={40}
                  tickFormatter={(value) => (value > 999 ? `${Math.round(value / 1000)}k` : value)}
                />
                <RechartsTooltip
                  cursor={{ stroke: BRAND.primary, strokeOpacity: 0.3 }}
                  content={<ChartTooltip />}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={BRAND.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill={`url(#gradient-${chartKey})`}
                  dot={{ strokeWidth: 2, r: 3, stroke: "#FFFFFF" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </Box>
      ) : (
        <Text variant="sm" color="grey60">
          No chart data available yet.
        </Text>
      )}
    </Box>
  );
};

const Dashboard = ({ data }) => {
  const [payload, setPayload] = useState(initialDashboardState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getDashboard();
      setPayload(response?.data ?? initialDashboardState);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? "Unable to load KPI data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data && (data.metrics || data.shortcuts || data.alerts)) {
      setPayload({
        metrics: data.metrics ?? [],
        shortcuts: data.shortcuts ?? [],
        alerts: data.alerts ?? [],
        charts: data.charts ?? [],
      });
      setError(null);
      setLoading(false);
      return;
    }
    void loadDashboard();
  }, [data, loadDashboard]);

  return (
    <Box
      variant="grey"
      padding="xxl"
      style={{ backgroundColor: "#F7F8FA", minHeight: "100vh" }}
    >
      <Box
        mb="xxl"
        p="xxl"
        style={{
          borderRadius: 28,
          background: heroGradient,
          color: "#FFFFFF",
          boxShadow: "0px 55px 90px rgba(31, 18, 53, 0.35)",
        }}
      >
        <Badge
          variant="primary"
          size="sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#FFFFFF",
          }}
        >
          Ops mission control
        </Badge>
        <H2 mb="sm" style={{ color: "#FFFFFF" }}>
          AlphaOps control tower
        </H2>
        <Text variant="sm" style={{ color: "rgba(255,255,255,0.85)" }}>
          Monitor growth, creator payouts, and support queues without leaving the console.
        </Text>
        <Box mt="lg">
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={loadDashboard}
            disabled={loading}
          >
            <Icon icon="RefreshCcw" size={16} mr="sm" color="#FFFFFF" />
            Refresh KPIs
          </Button>
        </Box>
      </Box>
      {loading ? (
        <Box
          variant="card"
          p="xxl"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="md"
          style={{
            borderRadius: 24,
            boxShadow: "0px 35px 70px rgba(31, 18, 53, 0.12)",
          }}
        >
          <Loader />
          <Text variant="sm" color="grey60">
            Loading KPI metrics…
          </Text>
        </Box>
      ) : error ? (
        <Box
          variant="card"
          p="xxl"
          display="flex"
          flexDirection="column"
          gap="md"
          style={{ borderRadius: 24 }}
        >
          <Text fontWeight="bold">We could not load the dashboard KPIs.</Text>
          <Text variant="sm" color="grey60">
            {error}
          </Text>
          <Button type="button" size="sm" variant="contained" onClick={loadDashboard}>
            Try again
          </Button>
        </Box>
      ) : (
        <>
          <Box
            display="grid"
            gridTemplateColumns={[
              "repeat(1, 1fr)",
              "repeat(2, 1fr)",
              "repeat(3, 1fr)",
              "repeat(5, 1fr)",
            ]}
            gap="xl"
          >
            {payload.metrics.length ? (
              payload.metrics.map((metric) => <KpiCard key={metric.label} metric={metric} />)
            ) : (
              <Box variant="card" p="xl">
                <Text variant="sm" color="grey60">
                  No KPI data available yet.
                </Text>
              </Box>
            )}
          </Box>

          {payload.charts?.length ? (
            <Box
              mt="xxl"
              display="grid"
              gridTemplateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]}
              gap="xxl"
            >
              {payload.charts.map((chart) => (
                <ChartCard key={chart.id ?? chart.title} chart={chart} />
              ))}
            </Box>
          ) : null}

          <Box
            mt="xxl"
            display="grid"
            gridTemplateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]}
            gap="xxl"
          >
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb="lg">
                <H5 mb={0}>Workflow shortcuts</H5>
                <Text variant="sm" color="grey60">
                  Quick pivots for common reviews.
                </Text>
              </Box>
              <Box display="grid" gridTemplateColumns="1fr" gap="lg">
                {payload.shortcuts.length ? (
                  payload.shortcuts.map((shortcut) => (
                    <ShortcutCard key={`${shortcut.href}-${shortcut.label}`} shortcut={shortcut} />
                  ))
                ) : (
                  <Box variant="card" p="xl">
                    <Text variant="sm" color="grey60">
                      Add shortcuts in the dashboard handler to surface priority queues.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb="lg">
                <H5 mb={0}>Latest alerts</H5>
                <Text variant="sm" color="grey60">
                  Support + QA queue highlights.
                </Text>
              </Box>
              <Box display="grid" gridTemplateColumns="1fr" gap="lg">
                {payload.alerts.length ? (
                  payload.alerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
                ) : (
                  <Box variant="card" p="xl">
                    <Text variant="sm" color="grey60">
                      All systems nominal. No blocking alerts.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Dashboard;
