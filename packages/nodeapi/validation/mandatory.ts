import { z } from "zod";
import { APIRequestMandatory } from "../types/base";
import { APIRequestMandatoryPayload } from "../types/payload";
import { validateData } from "./util";

export const mandatoryOptions = z.object({
  store_id: z.number().int(),
  order_number: z.string().max(36),
  hash: z.string().max(40),
});
export const mandatoryOptionsPayload = mandatoryOptions.omit({
  hash: true,
  store_id: true,
});
export function validateMandatoryFields(data: APIRequestMandatory) {
  validateData(mandatoryOptions, data);
}
export function validateMandatoryPayload(data: APIRequestMandatoryPayload) {
  validateData(mandatoryOptionsPayload, data);
}
