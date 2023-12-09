import { z } from "zod";
import { mandatoryOptions, mandatoryOptionsPayload } from "./mandatory";
import {
  APISubscriptionPaymentTransaction,
  APISubscriptionTransaction,
} from "../types/base";
import {
  APISubscriptionNewAmountPaymentPayload,
  APISubscriptionPaymentPayload,
  APISubscriptionTransactionPayload,
} from "../types/payload";
import { validateData } from "./util";
import { corvusSupportedCurriencies } from "@cyf0e/corvusjs-core";
import { versionZodDefinition } from "./partiallyComplete";

const subscriptionTransactionFields = z.object({
  subscription: z.enum(["true", "false"]),
  account_id: z.string().max(22),
});

export const subscriptionTransaction =
  subscriptionTransactionFields.merge(mandatoryOptions);

export const subscriptionPayment = subscriptionTransaction.merge(
  z.object({
    version: versionZodDefinition,
    cart: z.string().max(255).optional(),
  })
);

export const subscriptionTransactionPayload =
  subscriptionTransactionFields.merge(mandatoryOptionsPayload);

export const subscriptionPaymentPayload = mandatoryOptionsPayload
  .merge(subscriptionTransactionPayload.omit({ subscription: true }))
  .merge(z.object({ cart: z.string().max(255).optional() }));
export const subscriptionChargeNewAmount = subscriptionPayment.merge(
  z.object({
    new_amount: z.string(),
    currency: z.enum(corvusSupportedCurriencies),
  })
);
export const subscriptionChargeNewAmountPayload =
  subscriptionPaymentPayload.merge(
    z.object({
      new_amount: z.string(),
      currency: z.enum(corvusSupportedCurriencies),
    })
  );
export function validateSubscriptionFields(data: APISubscriptionTransaction) {
  validateData(subscriptionTransaction, data);
}

export function validateSubscriptionPayloadFields(
  data: APISubscriptionTransactionPayload
) {
  validateData(subscriptionTransactionPayload, data);
}

export function validateSubscriptionPaymentPayload(
  data: APISubscriptionPaymentPayload
) {
  validateData(subscriptionPaymentPayload, data);
}
export function validateSubscriptionPayment(
  data: APISubscriptionPaymentTransaction
) {
  validateData(subscriptionPayment, data);
}

export function validateSubscriptionNewAmountPaymentPayload(
  data: APISubscriptionNewAmountPaymentPayload
) {
  validateData(subscriptionChargeNewAmountPayload, data);
}
export function validateSubscriptionNewAmountPayment(
  data: APISubscriptionTransaction
) {
  validateData(subscriptionChargeNewAmount, data);
}
