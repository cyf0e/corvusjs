import { format } from "date-fns";
import https from "node:https";
import { CorvusBase } from "@cyf0e/corvusjs-core";
import { readFileSync } from "node:fs";
import { hashV2, hashV1, hashV3 } from "./utils/hashFunctions";
import {
  APICheckTransactionStatusPayload,
  APIPartiallyCompleteTransactionPayload,
  APIRequestMandatoryPayload,
  APISubscriptionNewAmountPaymentPayload,
  APISubscriptionPaymentPayload,
  APISubscriptionTransactionPayload,
  TransactionPayloadTypes,
} from "./types/payload";
import { validateMandatoryPayload } from "./validation/mandatory";
import {
  validateSubscriptionNewAmountPaymentPayload,
  validateSubscriptionPayloadFields,
  validateSubscriptionPaymentPayload,
} from "./validation/subscription";
import { validatePartiallyCompletePayloadFields } from "./validation/partiallyComplete";

import { validateCheckTransactionStatusPayload } from "./validation/status";
import { XMLParser } from "fast-xml-parser";
import {
  CheckTransactionStatusAPIResponse,
  GenericAPIResponse,
} from "./types/apiResponseTypes";

type TransactionCreateOptions<T> = {
  payload: T;
  hashFunction: (params: { secret: string; transaction: T }) => string;
};
export type CorvusAPIPaths =
  | "refund"
  | "partial_refund"
  | "complete"
  | "partial_complete"
  | "cancel"
  | "next_sub_payment"
  | "status"
  | "check_pis_status";
interface DefaultHTTPSRequestOptions {
  hostname: string;
  cert: Buffer;
  passphrase?: string;
  method: "POST";
  key: Buffer;
}
export type CorvusAPIProps = {
  certificatePath: string;
  secretKey: string;
  passphrase?: string;
  privateKeyPath: string;
  storeId: number;
  version: string;
  endpoint: string;
  makeHTTPSRequestOverride?: (
    options: https.RequestOptions,
    body: string | Buffer | Uint8Array
  ) => Promise<Buffer>;
  parseXMLFn?: <T extends string | Buffer>(data: T) => any;
};

export class CorvusAPI extends CorvusBase {
  private privateKey: Buffer;
  private passphrase?: string;
  private certificate: Buffer;
  private makeHTTPSRequestOverride?: CorvusAPIProps["makeHTTPSRequestOverride"];
  private parseXMLFn?: CorvusAPIProps["parseXMLFn"];
  /**
   * @param {string} certificatePath Path to the certificate file
   * @param {string} privateKeyPath Path to the private key for the certificate
   * @param {string} secretKey Secret key to calculate hashes
   * @param {string} version Version of the corvus api
   * @param {number} storeId Store id issued by corvus
   * @param {string} endpoint Endpoint to send requests to. Test or Production.
   * @param {string} passphrase Passphrase used to encode/decode the private key.
   * @param makeHTTPSRequestOverride Overwrite the default makeHTTPSRequest. Takes in the options with defaults and the body
   * @param parseXMLFn Overwrite  the default XML parsing function. Takes in a single parameter the xml string
   * @returns {CorvusAPI} Instance of CorvusAPI.
   */
  constructor(options: CorvusAPIProps) {
    super(options);

    this.passphrase = options.passphrase;
    this.certificate = readFileSync(options.certificatePath);
    this.privateKey = readFileSync(options.privateKeyPath);
    //TODO: Add validation for storeId and version

    this.secretKey = options.secretKey;
    this.endpoint = options.endpoint;
    this.makeHTTPSRequestOverride = options.makeHTTPSRequestOverride;
    this.parseXMLFn = options.parseXMLFn;
  }

  protected async makeHTTPSRequest(
    options: https.RequestOptions,
    body: string | Buffer | Uint8Array
  ): Promise<Buffer> {
    const defaultOptions: DefaultHTTPSRequestOptions = {
      hostname: this.endpoint,
      cert: this.certificate,
      passphrase: this.passphrase,
      method: "POST",
      key: this.privateKey,
    };
    const requestOptions = { ...defaultOptions, ...options };
    if (this.makeHTTPSRequestOverride) {
      return this.makeHTTPSRequestOverride(requestOptions, body);
    }

    return new Promise(function (resolve, reject) {
      const request = https.request(requestOptions, function (response) {
        if (
          !response.statusCode ||
          response.statusCode < 200 ||
          response.statusCode >= 300
        ) {
          return reject(
            new Error(
              "Request rejected with status code: " +
                response.statusCode +
                response.statusMessage
            )
          );
        }
        let responseBody: Buffer[] = [];
        response.on("data", function (chunk) {
          responseBody.push(chunk);
        });
        response.on("end", function () {
          resolve(Buffer.concat(responseBody));
        });
        response.on("error", function (err) {
          reject(err);
        });
      });

      request.on("error", function (err) {
        reject(err);
      });

      if (body) request.write(body);
      request.end();
    });
  }

  protected addHash<T>(transaction: T, hash: string) {
    Object.defineProperty(transaction, "hash", {
      value: hash,
      enumerable: true,
    });
    return { ...transaction } as T & { hash: string };
  }

  protected createTransactionBody<T extends TransactionPayloadTypes>(
    transaction: TransactionCreateOptions<T>
  ) {
    let { payload, hashFunction } = transaction;
    if (!this.secretKey)
      throw new Error(
        "Secret key is required to sign transactions and calculate hash."
      );
    const hash = hashFunction({ secret: this.secretKey, transaction: payload });
    const transactionWithHash = this.addHash(payload, hash);
    return transactionWithHash;
  }
  public getCurrentTimestamp() {
    return format(new Date(), "YmdHis");
  }
  public parseXML<T extends string | Buffer>(data: T) {
    if (this.parseXMLFn) {
      return this.parseXMLFn(data);
    }
    const parser = new XMLParser();
    return parser.parse(data);
  }
  public async completeTransaction(transaction: APIRequestMandatoryPayload) {
    validateMandatoryPayload(transaction);
    //patch in storeId
    const newTransaction = this.addStoreId(transaction);
    const transactionBody = this.createTransactionBody({
      payload: newTransaction,
      hashFunction: hashV1,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/complete" },
      this.encodeRequest(transactionBody)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async completeSubscriptionTransaction(
    transaction: APISubscriptionTransactionPayload
  ) {
    validateSubscriptionPayloadFields(transaction);
    //patch in storeId
    const newTransaction = this.addStoreId(transaction);

    const body = this.createTransactionBody({
      payload: newTransaction,
      hashFunction: hashV1,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/complete" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async partiallyCompleteTransaction(
    transaction: APIPartiallyCompleteTransactionPayload
  ) {
    validatePartiallyCompletePayloadFields(transaction);
    //patch in version
    const payloadWithVersion = this.addVersion(transaction);
    //patch in storeId
    const payloadWithStoreId = this.addStoreId(payloadWithVersion);

    const body = this.createTransactionBody({
      payload: payloadWithStoreId,
      hashFunction: hashV2,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/partially_complete" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async cancelTransaction(transaction: APIRequestMandatoryPayload) {
    validateMandatoryPayload(transaction);
    //patch in storeId
    const newTransaction = this.addStoreId(transaction);

    const body = this.createTransactionBody({
      payload: newTransaction,
      hashFunction: hashV1,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/cancel" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async refundTransaction(transaction: APIRequestMandatoryPayload) {
    let transactionWithStore = this.addStoreId(transaction);
    validateMandatoryPayload(transactionWithStore);

    const body = this.createTransactionBody({
      payload: transactionWithStore,
      hashFunction: hashV1,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/refund" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async partialRefundTransaction(
    transaction: APIRequestMandatoryPayload &
      APIPartiallyCompleteTransactionPayload
  ) {
    validateMandatoryPayload(transaction);
    validatePartiallyCompletePayloadFields(transaction);

    const transactionWithVersion = this.addVersion(transaction);
    const transactionWithStoreAndVersion = this.addStoreId(
      transactionWithVersion
    );

    const body = this.createTransactionBody({
      payload: transactionWithStoreAndVersion,
      hashFunction: hashV2,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/partial_refund" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }

  public async chargeSubscriptionPayment(
    subscription: APISubscriptionPaymentPayload
  ) {
    validateSubscriptionPaymentPayload(subscription);

    const subscriptionWithVersion = this.addVersion(subscription);
    const subscriptionWithVersionAndStoreId = this.addStoreId(
      subscriptionWithVersion
    );

    const withAll = {
      ...subscriptionWithVersionAndStoreId,
      subscription: "true",
    };

    const body = this.createTransactionBody({
      payload: withAll,
      hashFunction: hashV2,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/next_sub_payment" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }
  public async chargeNewAmountSubscriptionPayment(
    subscription: APISubscriptionNewAmountPaymentPayload
  ) {
    validateSubscriptionNewAmountPaymentPayload(subscription);

    const subscriptionWithVersion = this.addVersion(subscription);
    const subscriptionWithVersionAndStoreId = this.addStoreId(
      subscriptionWithVersion
    );

    const withAll = {
      ...subscriptionWithVersionAndStoreId,
      subscription: "true",
    };

    const body = this.createTransactionBody({
      payload: withAll,
      hashFunction: hashV2,
    });
    const res = await this.makeHTTPSRequest(
      { path: "/next_sub_payment" },
      this.encodeRequest(body)
    );
    return this.parseXML(res) as GenericAPIResponse;
  }
  public async checkTransactionStatus(
    transaction: APICheckTransactionStatusPayload
  ) {
    validateCheckTransactionStatusPayload(transaction);
    const withDefaults = this.addStoreIdAndVersion(transaction);
    const body = this.createTransactionBody({
      payload: withDefaults,
      hashFunction: hashV3,
    }) as any;

    const response = await this.makeHTTPSRequest(
      {
        path: "/status",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
      this.encodeRequest(body)
    );

    return this.parseXML(response) as CheckTransactionStatusAPIResponse;
  }

  public async checkPISTransaction(
    transaction: APICheckTransactionStatusPayload
  ) {
    //patch in storeid and version
    const withDefaults = this.addStoreIdAndVersion(transaction);
    const signed = this.signSHA256(withDefaults);
    const res = await this.makeHTTPSRequest(
      {
        path: "/check_pis_status",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
      this.encodeRequest(signed)
    );
    return this.parseXML(res);
  }
}
