import { ChargilyPaymentMethods } from "../enums/payment-method.enum";

export interface ChargilyEventInterface {
  id: string;
  entity: string;
  livemode: boolean;
  type: string;
  data: ChargilyEventDataInterface;
  account: any;
  created_at: string;
  updated_at: string;
}

export interface ChargilyEventDataInterface {
  id: string;
  fees: number;
  amount: number;
  entity: string;
  locale: string;
  status: string;
  currency: string;
  discount: null | number;
  livemode: boolean;
  metadata: null | Record<string, any>;
  created_at: number;
  invoice_id: null | string;
  updated_at: number;
  customer_id: string;
  description: null | string;
  failure_url: string;
  success_url: string;
  checkout_url: string;
  payment_method: ChargilyPaymentMethods;
  payment_link_id: null | string;
  fees_on_customer: number;
  fees_on_merchant: number;
  shipping_address: {
    country: string;
  };
  webhook_endpoint: null | string;
  fulfillment_status: string;
  pass_fees_to_customer: null | boolean;
  deposit_transaction_id: number;
  amount_without_discount: number;
  collect_shipping_address: number;
  chargily_pay_fees_allocation: string;
}
