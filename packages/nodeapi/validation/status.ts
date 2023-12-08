import z from "zod";
import { mandatoryOptions, mandatoryOptionsPayload } from "./mandatory";
import { versionZodDefinition } from "./partiallyComplete";
import { APICheckTransactionStatus } from "../types/base";
import { APICheckTransactionStatusPayload } from "../types/payload";
export const checkTransactionStatusFields = mandatoryOptions.merge(
  z.object({
    version: versionZodDefinition,
    timestamp: z.string().max(16),
    currency_code: z.string().max(3).optional(),
  })
);
export const checkTransactionStatusPayloadFields =
  mandatoryOptionsPayload.merge(
    z.object({
      timestamp: z.string().max(16),
      currency_code: z.string().max(3).optional(),
    })
  );
export function validateCheckTransactionStatus(
  options: APICheckTransactionStatus
) {
  checkTransactionStatusFields.parse(options);
}
export function validateCheckTransactionStatusPayload(
  options: APICheckTransactionStatusPayload
) {
  checkTransactionStatusPayloadFields.parse(options);
}
