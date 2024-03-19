import {
  bestBeforeSchema,
  cardDiscountSchema,
  checkoutHideTabsSchema,
  creditorReferenceSchema,
  dynamicInstallmentsSchema,
  fixedInstallmentsFormService,
  flexibleInstallmentsFormService,
  mandatoryFormFields,
  mandatoryFormPayloadFields,
  optionalFormServiceFields,
  paysafeCardPaymentsSchema,
  prepopulateIbanSchema,
  preselectCardholderCountrySchema,
  preselectPaymentCardSchema,
} from "../validation/validateForm";

export type FormServiceMandatoryFields = Zod.infer<typeof mandatoryFormFields>;

export type FormServiceMandatoryProps = Zod.infer<
  typeof mandatoryFormPayloadFields
>;
export type FormServiceOptionalFields = Zod.infer<
  typeof optionalFormServiceFields
>;

export type FormServiceFixedInstallments = Zod.infer<
  typeof fixedInstallmentsFormService
>;

export type FormServiceFlexibleInstallments = Zod.infer<
  typeof flexibleInstallmentsFormService
>;

export type FormServiceDynamicInstallments = Zod.infer<
  typeof dynamicInstallmentsSchema
>;

export type FormServicePreselectPaymentCard = Zod.infer<
  typeof preselectPaymentCardSchema
>;

export type FormServicePreselectCardholderCountry = Zod.infer<
  typeof preselectCardholderCountrySchema
>;

export type FormServiceHideTabs = Zod.infer<typeof checkoutHideTabsSchema>;

export type FormServiceIBANCreditorReferenceNumber = Zod.infer<
  typeof creditorReferenceSchema
>;

export type FormServicePrepopulateIBAN = Zod.infer<
  typeof prepopulateIbanSchema
>;

export type FormServicePaysafePayments = Zod.infer<
  typeof paysafeCardPaymentsSchema
>;

export type FormServiceBestBefore = Zod.infer<typeof bestBeforeSchema>;

export type FormServiceCardDiscount = Zod.infer<typeof cardDiscountSchema>;
