import { CorvusBase } from "@corvusjs/core";
import {
  FormServicePayload,
  validateBestBefore,
  validateCardDiscount,
  validateCreditorReference,
  validateDynamicInstallmentsFormService,
  validateFixedInstallments,
  validateFlexibleInstallments,
  validateFormMandatoryPayload,
  validateFormOptionalPayload,
  validateHideTabsFormService,
  validatePaysafePayments,
  validatePrepopulateIban,
  validatePreselectCardholderCountryFormService,
  validatePreselectPaymentCardFormService,
} from "./validation/validateForm";
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
} from "./types/formServiceTypes";

export class CorvusFormService extends CorvusBase {
  private currentRequestOptions: Record<string, any> | undefined;

  private validateAndAppendToReqOptions<T>(
    validationFunction: (options: T) => void,
    options: T
  ) {
    validationFunction(options);
    this.currentRequestOptions = { ...this.currentRequestOptions, ...options };
  }
  /**
   * This is the starting point for creating form options.
   * Deletes old CorvusFormService.currentRequest object.
   *
   * @param options Mandatory options
   * @returns CorvusFormService insance
   */
  form(options: FormServicePayload) {
    //reset the initial request
    if (this.currentRequestOptions) this.currentRequestOptions = undefined;
    const withAll = this.addStoreIdAndVersion(options);
    this.validateAndAppendToReqOptions(validateFormMandatoryPayload, withAll);
    return this;
  }
  optional(options: FormServiceOptionalFields) {
    this.validateAndAppendToReqOptions(validateFormOptionalPayload, options);
    return this;
  }
  fixedInstallments(options: FormServiceFixedInstallments) {
    this.validateAndAppendToReqOptions(validateFixedInstallments, options);
    return this;
  }
  flexibleInstallments(options: FormServiceFlexibleInstallments) {
    this.validateAndAppendToReqOptions(validateFlexibleInstallments, options);
    return this;
  }
  dynamicInstallments(options: FormServiceDynamicInstallments) {
    this.validateAndAppendToReqOptions(
      validateDynamicInstallmentsFormService,
      options
    );
    return this;
  }
  preselectPaymentCard(options: FormServicePreselectPaymentCard) {
    this.validateAndAppendToReqOptions(
      validatePreselectPaymentCardFormService,
      options
    );
    return this;
  }
  preselectCardholderCountry(options: FormServicePreselectCardholderCountry) {
    this.validateAndAppendToReqOptions(
      validatePreselectCardholderCountryFormService,
      options
    );
  }
  hideTabs(options: FormServiceHideTabs) {
    this.validateAndAppendToReqOptions(validateHideTabsFormService, options);
    return this;
  }
  ibanCreditorReferenceNumber(options: FormServiceIBANCreditorReferenceNumber) {
    this.validateAndAppendToReqOptions(validateCreditorReference, options);
    return this;
  }
  prepopulateIban(options: FormServicePrepopulateIBAN) {
    this.validateAndAppendToReqOptions(validatePrepopulateIban, options);
    return this;
  }
  paysafeCardPayments(options: FormServicePaysafePayments) {
    this.validateAndAppendToReqOptions(validatePaysafePayments, options);
    return this;
  }
  timeLimit(options: FormServiceBestBefore) {
    this.validateAndAppendToReqOptions(validateBestBefore, options);
    return this;
  }
  discountCard(options: FormServiceCardDiscount) {
    this.validateAndAppendToReqOptions(validateCardDiscount, options);
    return this;
  }

  /*
   * Returns current request options wihtout clearing Form.currentRequestOptions
   * @returns Current request options
   */
  data() {
    return this.currentRequestOptions;
  }

  /*
   * Returns current request options and clears Form.currentRequestOptions
   * @returns Current request options
   */
  consume() {
    const req = this.currentRequestOptions;
    this.currentRequestOptions = undefined;
    return req;
  }

  sign() {
    if (!this.currentRequestOptions) {
      throw new Error("Error signing empty request.");
    }
    const signedMessage = this.signMessage(this.currentRequestOptions);
    this.validateAndAppendToReqOptions((message) => {
      if (typeof message.signature != "string") {
        throw new Error(`Signature must be of type string. Got ${message}`);
      }
    }, signedMessage);
    return this;
  }
}
