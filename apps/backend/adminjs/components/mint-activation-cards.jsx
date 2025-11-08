import React, { useState } from "react";
import { ApiClient, useNotice, useTranslation } from "adminjs";
import {
  Box,
  Button,
  FormGroup,
  H2,
  Input,
  Label,
  Text,
} from "@adminjs/design-system";

const api = new ApiClient();

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

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.plan || !form.quantity) {
      addNotice({
        message: "Plan ID and quantity are required.",
        type: "error",
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.callAction(
        {
          resourceId: resource.id,
          actionName: action.name,
        },
        {
          method: "post",
          payload: form,
        },
      );
      if (response && response.notice) {
        addNotice(response.notice);
      } else {
        addNotice({
          message: translateMessage("success", resource.id),
          type: "success",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={onSubmit}>
      <H2 mb="lg">Mint activation cards</H2>
      <Text mb="xl">
        Provide a plan ID, choose how many cards to mint, and optionally set an expiration date.
      </Text>
      <FormGroup>
        <Label required>Plan ID</Label>
        <Input
          value={form.plan}
          onChange={(event) => updateField("plan", event.target.value)}
          placeholder="plan uuid"
        />
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
        {submitting ? "Minting..." : "Mint cards"}
      </Button>
    </Box>
  );
};

export default MintActivationCards;
