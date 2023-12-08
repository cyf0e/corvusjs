import z from "zod";
import {
  corvusSupportedCurriencies,
  corvusSupportedLanguages,
  countryCodes,
} from "@corvusjs/core";
import {
  FormServiceBestBefore,
  FormServiceCardDiscount,
  FormServiceDynamicInstallments,
  FormServiceFixedInstallments,
  FormServiceFlexibleInstallments,
  FormServiceHideTabs,
  FormServiceIBANCreditorReferenceNumber,
  FormServiceOptionalFields,
  FormServicePaysafePayments,
  FormServicePrepopulateIBAN,
  FormServicePreselectCardholderCountry,
  FormServicePreselectPaymentCard,
} from "../types/formServiceTypes";

export const mandatoryFormPayloadFields = z.object({
  version: z
    .string()
    .max(3, 'Field "version" cannot have a length greater than 3.'),
  store_id: z.number(),
  order_number: z
    .string()
    .max(36, 'Field "order_number" cannot have a length greater than 36.'),
  language: z.enum(corvusSupportedLanguages),
  currency: z.enum(corvusSupportedCurriencies),
  amount: z.string(),
  cart: z
    .string()
    .max(255, 'Field "cart" cannot have a length greater than 255.'),
  require_complete: z.boolean(),
});
export const mandatoryFormFields = z.intersection(
  mandatoryFormPayloadFields,
  z.object({ signature: z.string() })
);
export function validateFormMandatoryPayload(data: FormServicePayload) {
  mandatoryFormPayloadFields.parse(data);
}

export const optionalFormServiceFields = z.object({
  cardholder_name: z.string().max(40).optional(),
  cardholder_surname: z.string().max(40).optional(),
  cardholder_address: z.string().max(100).optional(),
  cardholder_city: z.string().max(20).optional(),
  cardholder_zip_code: z.string().max(9).optional(),
  cardholder_country: z.string().max(30).optional(),
  cardholder_email: z.string().email().max(100).optional(),
  subscription: z.enum(["true", "false"]).optional(),
  additional_order_number: z.string().max(36).optional(),
});
export function validateFormOptionalPayload(data: FormServiceOptionalFields) {
  optionalFormServiceFields.parse(data);
}
export const fixedInstallmentsFormService = z.object({
  number_of_installments: z
    .string()
    .max(2, 'Maximum length of "number_of_installments" is 2.'),
});
export function validateFixedInstallments(data: FormServiceFixedInstallments) {
  fixedInstallmentsFormService.parse(data);
}

export const flexibleInstallmentsFormService = z.object({
  payment_all: z.string(),
});
export function validateFlexibleInstallments(
  data: FormServiceFlexibleInstallments
) {
  flexibleInstallmentsFormService.parse(data);
}

const dynamicInstallmentSchema = z
  .string()
  .startsWith("Y")
  .max(5)
  .or(z.string().startsWith("N").max(5))
  .optional();
export const dynamicInstallmentsSchema = z.object({
  payment_all_dynamic: z.literal("true").optional(),
  payment_amex: dynamicInstallmentSchema,
  payment_diners: dynamicInstallmentSchema,
  payment_visa: dynamicInstallmentSchema,
  payment_master: dynamicInstallmentSchema,
  payment_maestro: dynamicInstallmentSchema,
  payment_discover: dynamicInstallmentSchema,
  payment_jcb: dynamicInstallmentSchema,
  payment_all: z.string().startsWith("Y").optional(),
});
export function validateDynamicInstallmentsFormService(
  options: FormServiceDynamicInstallments
) {
  dynamicInstallmentsSchema.parse(options);
}
export const preselectPaymentCardSchema = z.object({
  cc_type: z.enum([
    "amex",
    "visa",
    "master",
    "maestro",
    "diners",
    "discover",
    "dina",
    "jcb",
  ]),
});
export function validatePreselectPaymentCardFormService(
  options: FormServicePreselectPaymentCard
) {
  preselectPaymentCardSchema.parse(options);
}
export const preselectCardholderCountrySchema = z.object({
  cardholder_country_code: z.enum(countryCodes as any),
});
export function validatePreselectCardholderCountryFormService(
  options: FormServicePreselectCardholderCountry
) {
  preselectCardholderCountrySchema.parse(options);
}

export const checkoutHideTabsSchema = z.object({
  hide_tabs: z.enum(["checkout", "pis", "wallet", "paysafecard"]),
});
export function validateHideTabsFormService(options: FormServiceHideTabs) {
  checkoutHideTabsSchema.parse(options);
}
export const creditorReferenceSchema = z.object({
  creditor_reference: z
    .string()
    .max(22, '"creditor_reference" cannot have a length greater than 22. '),
});
export function validateCreditorReference(
  options: FormServiceIBANCreditorReferenceNumber
) {
  creditorReferenceSchema.parse(options);
}
export const prepopulateIbanSchema = z.object({
  debtor_iban: z.string().max(34),
});
export function validatePrepopulateIban(options: FormServicePrepopulateIBAN) {
  prepopulateIbanSchema.parse(options);
}
export const paysafeCardPaymentsSchema = z.object({
  cardholder_email: z.string().max(100),
});
export function validatePaysafePayments(options: FormServicePaysafePayments) {
  paysafeCardPaymentsSchema.parse(options);
}
export const bestBeforeSchema = z.object({ best_before: z.string() });
export function validateBestBefore(options: FormServiceBestBefore) {
  bestBeforeSchema.parse(options);
}
export const cardDiscountSchema = z.object({ discount_amount: z.number() });
export function validateCardDiscount(options: FormServiceCardDiscount) {
  cardDiscountSchema.parse(options);
}
export const FormServiceParser = z.intersection(
  mandatoryFormFields,
  optionalFormServiceFields
);
export type FormServiceMandatory = Zod.infer<typeof mandatoryFormFields>;
export type FormServicePayload = Omit<
  Zod.infer<typeof mandatoryFormPayloadFields>,
  "store_id" | "version"
>;
