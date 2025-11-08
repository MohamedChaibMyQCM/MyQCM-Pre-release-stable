import React, { useEffect, useMemo, useState } from "react";
import { ApiClient, useNotice, useTranslation } from "adminjs";
import {
  Box,
  Button,
  FormGroup,
  H2,
  Input,
  Label,
  Select,
  Text,
} from "@adminjs/design-system";
import * as XLSX from "xlsx";

const api = new ApiClient();

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Free";
  }
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return `${numeric.toLocaleString("fr-DZ")} DZD`;
};

const humanize = (value) =>
  typeof value === "string"
    ? value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : value ?? "";

const buildPlanLabel = (record) => {
  const name = record?.title ?? record?.params?.name ?? "Plan";
  const period = record?.params?.period ? humanize(record.params.period) : "—";
  const price = formatPrice(record?.params?.price);
  return `${name} • ${period} • ${price}`;
};

const formatDateForSheet = (value) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
};

const MintActivationCards = (props) => {
  const { resource, action } = props;
  const addNotice = useNotice();
  const { translateMessage } = useTranslation();
  const [form, setForm] = useState({
    plan: "",
    quantity: 10,
    expires_at: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const selectedPlanOption = useMemo(
    () => plans.find((option) => option.value === form.plan) ?? null,
    [plans, form.plan],
  );

  const selectedPlanDetails = selectedPlanOption?.record?.params;

  const exportMintedCards = (payload) => {
    if (!payload?.cards?.length) {
      return;
    }

    const rows = payload.cards.map((card, index) => ({
      "#": index + 1,
      Code: card.code,
      "Plan name": payload.plan?.name ?? "",
      "Plan period": humanize(payload.plan?.period),
      "Plan price": formatPrice(payload.plan?.price),
      "Expires at": formatDateForSheet(card.expires_at),
      "Created at": formatDateForSheet(card.created_at),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activation cards");
    XLSX.writeFile(
      workbook,
      payload.fileName ?? `activation-cards-${Date.now()}.xlsx`,
    );
  };

  useEffect(() => {
    let mounted = true;
    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const response = await api.resourceAction({
          resourceId: "Plan",
          actionName: "list",
          method: "get",
          params: {
            page: 1,
            perPage: 200,
            sortBy: "name",
            direction: "asc",
          },
        });
        if (!mounted) {
          return;
        }
        const planOptions =
          response?.data?.records?.map((record) => ({
            value: record.id,
            label: buildPlanLabel(record),
            record,
          })) ?? [];
        setPlans(planOptions);
      } catch (error) {
        if (mounted) {
          addNotice({
            message: "Unable to load plans. Please refresh.",
            type: "error",
          });
        }
      } finally {
        if (mounted) {
          setLoadingPlans(false);
        }
      }
    };

    fetchPlans();

    return () => {
      mounted = false;
    };
  }, [addNotice]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.plan || !form.quantity) {
      addNotice({
        message: "Plan and quantity are required.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.resourceAction({
        resourceId: resource.id,
        actionName: action.name,
        method: "post",
        data: form,
      });
      const data = response?.data;
      if (data?.excelExport) {
        exportMintedCards(data.excelExport);
      }
      if (data?.notice) {
        addNotice(data.notice);
      } else {
        addNotice({
          message: translateMessage("success", resource.id),
          type: "success",
        });
      }
    } catch (error) {
      addNotice({
        message: error?.message ?? "Unable to mint activation cards.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={onSubmit}>
      <H2 mb="lg">Mint activation cards</H2>
      <Text mb="xl">
        Choose a plan, set the quantity, optionally set an expiration date, and
        we&apos;ll automatically generate an Excel export for the new batch.
      </Text>
      <FormGroup>
        <Label required>Plan</Label>
        <Select
          value={selectedPlanOption}
          options={plans}
          isLoading={loadingPlans}
          onChange={(option) => updateField("plan", option?.value ?? "")}
          isClearable
          placeholder={
            loadingPlans ? "Loading plans..." : "Select the plan to mint for"
          }
        />
        {selectedPlanDetails ? (
          <Text variant="sm" color="grey60" mt="xs">
            {selectedPlanOption?.label ?? ""}
            {selectedPlanDetails?.xp_reward
              ? `• ${selectedPlanDetails.xp_reward} XP`
              : ""}
          </Text>
        ) : null}
      </FormGroup>
      <FormGroup>
        <Label required>Quantity</Label>
        <Input
          type="number"
          min={1}
          value={form.quantity}
          onChange={(event) => updateField("quantity", Number(event.target.value))}
        />
      </FormGroup>
      <FormGroup>
        <Label>Expiration date</Label>
        <Input
          type="date"
          value={form.expires_at}
          onChange={(event) => updateField("expires_at", event.target.value)}
        />
      </FormGroup>
      <Button variant="primary" type="submit" disabled={submitting}>
        {submitting ? "Minting..." : "Mint & export"}
      </Button>
    </Box>
  );
};

export default MintActivationCards;
