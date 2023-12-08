import { z } from "zod";
import {
  subscriptionChargeNewAmountPayload,
  subscriptionPaymentPayload,
  subscriptionTransactionPayload,
} from "../validation/subscription";
import { partiallyCompleteTransactionPayload } from "../validation/partiallyComplete";
import { mandatoryOptionsPayload } from "../validation/mandatory";
import { checkTransactionStatusPayloadFields } from "../validation/status";
export type MakeStoreIdOptional<T> = T extends { store_id: unknown }
  ? Omit<T, "store_id"> & { store_id?: T["store_id"] }
  : T;
export type APIRequestMandatoryPayload = z.infer<
  typeof mandatoryOptionsPayload
>;
export type APISubscriptionTransactionPayload = z.infer<
  typeof subscriptionTransactionPayload
>;

export type APIPartiallyCompleteTransactionPayload = z.infer<
  typeof partiallyCompleteTransactionPayload
>;

export type APISubscriptionPaymentPayload = z.infer<
  typeof subscriptionPaymentPayload
>;
export type APISubscriptionNewAmountPaymentPayload = z.infer<
  typeof subscriptionChargeNewAmountPayload
>;
export type APICheckTransactionStatusPayload = z.infer<
  typeof checkTransactionStatusPayloadFields
>;
export type TransactionPayloadTypes =
  | APIRequestMandatoryPayload
  | APISubscriptionPaymentPayload
  | APISubscriptionTransactionPayload
  | APIPartiallyCompleteTransactionPayload
  | APISubscriptionNewAmountPaymentPayload
  | APICheckTransactionStatusPayload;
