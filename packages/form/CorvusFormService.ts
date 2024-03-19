import { CorvusBase } from "@cyf0e/corvusjs-core";
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
   * Clears any old already constructed form objects.
   *
   * @param {FormServicePayload} options Mandatory options for every request
   * @returns CorvusFormService instance
   */
  mandatory(options: FormServicePayload) {
    //reset the initial request
    if (this.currentRequestOptions) this.currentRequestOptions = undefined;

    const withIdAndVersion = this.addStoreIdAndVersion(options);
    this.validateAndAppendToReqOptions(
      validateFormMandatoryPayload,
      withIdAndVersion
    );
    return this;
  }
  /**
   * Appends the optional form parameters to the form object
   * @param {FormServiceOptionalFields} options Optional form options
   * @returns CorvusFormService instance
   */
  optional(options: FormServiceOptionalFields) {
    this.validateAndAppendToReqOptions(validateFormOptionalPayload, options);
    return this;
  }
  /**
   * Appends fixed installments form parameters to the form object
   * @param {FormServiceFixedInstallments} options Fixed installments form options
   * @returns CorvusFormService instance
   */
  fixedInstallments(options: FormServiceFixedInstallments) {
    this.validateAndAppendToReqOptions(validateFixedInstallments, options);
    return this;
  }
  /**
   * Appends flexible installments form parameters to the form object
   * @param {FormServiceFlexibleInstallments} options Flexible installments form options
   * @returns CorvusFormService instance
   */

  flexibleInstallments(options: FormServiceFlexibleInstallments) {
    this.validateAndAppendToReqOptions(validateFlexibleInstallments, options);
    return this;
  }
  /**
   * Appends dynamic installments form parameters to the form object
   * @param {FormServiceDynamicInstallments} options Dynamic installments form options
   * @returns CorvusFormService instance
   */
  dynamicInstallments(options: FormServiceDynamicInstallments) {
    this.validateAndAppendToReqOptions(
      validateDynamicInstallmentsFormService,
      options
    );
    return this;
  }
  /**
   * Appends pre-select payment card form parameters to the form object
   * @param {FormServicePreselectPaymentCard} options Preselect payment card form options
   * @returns CorvusFormService instance
   */
  preselectPaymentCard(options: FormServicePreselectPaymentCard) {
    this.validateAndAppendToReqOptions(
      validatePreselectPaymentCardFormService,
      options
    );
    return this;
  }
  /**
   * Appends pre-select cardholder country form parameters to the form object
   * @param {FormServicePreselectCardholderCountry} options Preselect cardholder country form options
   * @returns CorvusFormService instance
   */
  preselectCardholderCountry(options: FormServicePreselectCardholderCountry) {
    this.validateAndAppendToReqOptions(
      validatePreselectCardholderCountryFormService,
      options
    );
  }
  /**
   * Appends form parameters for hidding unwanted tabs to the form object
   * @param {FormServiceHideTabs} options Hide tabs options
   * @returns CorvusFormService instance
   */
  hideTabs(options: FormServiceHideTabs) {
    this.validateAndAppendToReqOptions(validateHideTabsFormService, options);
    return this;
  }
  /**
   * Appends iban creditor reference number form parameters to the form object
   * @param {FormServiceIBANCreditorReferenceNumber} options Iban creditor reference number form options
   * @returns CorvusFormService instance
   */
  ibanCreditorReferenceNumber(options: FormServiceIBANCreditorReferenceNumber) {
    this.validateAndAppendToReqOptions(validateCreditorReference, options);
    return this;
  }
  /**
   * Appends prepopulate iban form parameters to the form object
   * @param {FormServicePrepopulateIBAN} options Prepopulate iban options
   * @returns CorvusFormService instance
   */
  prepopulateIban(options: FormServicePrepopulateIBAN) {
    this.validateAndAppendToReqOptions(validatePrepopulateIban, options);
    return this;
  }
  /**
   * Appends paysafe card payments form parameters to the form object
   * @param {FormServicePaysafePayments} options paysafe card payments form options
   * @returns CorvusFormService instance
   */
  paysafeCardPayments(options: FormServicePaysafePayments) {
    this.validateAndAppendToReqOptions(validatePaysafePayments, options);
    return this;
  }
  /**
   * Appends best before form parameters to the form object
   * @param {FormServiceBestBefore} options Best before form options
   * @returns CorvusFormService instance
   */
  timeLimit(options: FormServiceBestBefore) {
    this.validateAndAppendToReqOptions(validateBestBefore, options);
    return this;
  }
  /**
   * Appends discount card form parameters to the form object
   * @param {FormServiceCardDiscount} options Discount card form options
   * @returns CorvusFormService instance
   */
  discountCard(options: FormServiceCardDiscount) {
    this.validateAndAppendToReqOptions(validateCardDiscount, options);
    return this;
  }

  /*
   * Returns current request options without clearing the builder
   * @returns Current request options
   */
  data() {
    return this.currentRequestOptions;
  }

  /*
   * Signs (if message doesnt already have a signature field), returns current request options and clears the current form builder.
   * @returns Current form object
   */
  consume() {
    if (!this.currentRequestOptions)
      throw new Error("Cannot consume empty form options.");

    this.sign();
    const req = this.currentRequestOptions;
    this.currentRequestOptions = undefined;
    return req;
  }
  /**
   * Signs the current form object
   * @returns CorvusFormService instance
   */
  sign() {
    if (!this.currentRequestOptions) {
      throw new Error("Error signing empty request.");
    }
    const signedMessage = this.signSHA256(this.currentRequestOptions);
    this.validateAndAppendToReqOptions((message) => {
      if (typeof message.signature != "string") {
        throw new Error(
          `Signature must be of type string. Got ${typeof message}`
        );
      }
    }, signedMessage);
    return this;
  }
}
