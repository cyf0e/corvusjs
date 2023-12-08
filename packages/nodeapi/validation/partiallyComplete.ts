import { z } from "zod";
import { corvusSupportedCurriencies } from "@corvusjs/core";
import { mandatoryOptions, mandatoryOptionsPayload } from "./mandatory";
import { APIPartiallyCompleteTransaction } from "../types/base";
import { APIPartiallyCompleteTransactionPayload } from "../types/payload";
import { validateData } from "./util";
export const versionZodDefinition = z.string().max(3);
export const partiallyCompleteTransaction = z.object({
  new_amount: z.string(),
  currency: z.enum(corvusSupportedCurriencies),
  version: versionZodDefinition,
});
const partiallyCompleteTransactionFull =
  partiallyCompleteTransaction.merge(mandatoryOptions);

export const partiallyCompleteTransactionPayload = partiallyCompleteTransaction
  .omit({ version: true })
  .merge(mandatoryOptionsPayload);

export function validatePartiallyCompleteFields(
  data: APIPartiallyCompleteTransaction
) {
  validateData(partiallyCompleteTransactionFull, data);
}
export function validatePartiallyCompletePayloadFields(
  data: APIPartiallyCompleteTransactionPayload
) {
  validateData(partiallyCompleteTransactionPayload, data);
}
