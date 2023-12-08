import { z } from "zod";

import {
  subscriptionChargeNewAmount,
  subscriptionPayment,
  subscriptionTransaction,
} from "../validation/subscription";
import { mandatoryOptions } from "../validation/mandatory";
import { partiallyCompleteTransaction } from "../validation/partiallyComplete";
import { checkTransactionStatusFields } from "../validation/status";

export type APIRequestMandatory = z.infer<typeof mandatoryOptions>;

export type APIPartiallyCompleteTransaction = z.infer<
  typeof partiallyCompleteTransaction
>;

export type APISubscriptionTransaction = z.infer<
  typeof subscriptionTransaction
>;

export type APISubscriptionPaymentTransaction = z.infer<
  typeof subscriptionPayment
>;
export type APISubscriptionNewAmountPayment = z.infer<
  typeof subscriptionChargeNewAmount
>;
export type APICheckTransactionStatus = z.infer<
  typeof checkTransactionStatusFields
>;
export type TransactionTypes =
  | APIRequestMandatory
  | APISubscriptionPaymentTransaction
  | APISubscriptionTransaction
  | APIPartiallyCompleteTransaction
  | APISubscriptionNewAmountPayment
  | APICheckTransactionStatus;
