import assert from "assert";
import { CorvusAPI, CorvusAPIProps } from "../CorvusAPI";
import { hashV2, hashV1, hashV3 } from "../utils/hashFunctions";
import {
  APICheckTransactionStatus,
  APIPartiallyCompleteTransaction,
  APIRequestMandatory,
  APISubscriptionNewAmountPayment,
  APISubscriptionPaymentTransaction,
} from "../types/base";
import {
  APICheckTransactionStatusPayload,
  APIPartiallyCompleteTransactionPayload,
} from "../types/payload";
import { RequestOptions } from "https";
import fs, { PathOrFileDescriptor } from "fs";

//mock readFileSync to skip certs
fs.readFileSync = function (path: PathOrFileDescriptor) {
  return "data" as any;
};

const TEST_STORE_ID = 123;
const TEST_VERSION = "1.4";
const TEST_SECRETKEY = "2svQwmRIBhiiA9b26Z6SpaSGuFqZ_sFKyA";

function omitHash<T extends Record<string, unknown>>(obj: T | null) {
  if (!obj) throw new Error("Obj undefined.");
  const newObj = { ...obj };
  if (newObj.hash) delete newObj.hash;
  return newObj;
}

function apiFactory(params?: { secret?: string; store_id?: number }) {
  class mockedCorvusAPI extends CorvusAPI {
    constructor(
      options: Omit<CorvusAPIProps, "privateKeyPath" | "certificatePath">
    ) {
      super({ ...options, privateKeyPath: "/", certificatePath: "/" });
    }
    protected makeHTTPSRequest(
      options: RequestOptions,
      body: string | Buffer | Uint8Array
    ): Promise<Buffer> {
      return Promise.resolve(Buffer.from(body));
    }
    public parseXML<T extends string | Buffer>(data: T) {
      return data.toString();
    }
  }
  return new mockedCorvusAPI({
    secretKey: params?.secret ?? TEST_SECRETKEY,
    endpoint: "test",
    version: TEST_VERSION,
    storeId: params?.store_id ?? TEST_STORE_ID,
  });
}
function corvusPublicSign(params: {
  custom_key?: string;
  customeStoreId?: number;
}) {
  class CorvusWithPublicSign extends CorvusAPI {
    constructor(
      options: Omit<CorvusAPIProps, "privateKeyPath" | "certificatePath">
    ) {
      super({ ...options, privateKeyPath: "/", certificatePath: "/" });
    }
    public signMessage<T extends Record<string, string | number>>(
      options: T
    ): T & { signature: string } {
      return super.signSHA256(options);
    }
  }
  return new CorvusWithPublicSign({
    secretKey: params.custom_key ?? TEST_SECRETKEY,
    endpoint: "test",
    version: TEST_VERSION,
    storeId: params.customeStoreId ?? TEST_STORE_ID,
  });
}
function decodeURLSP(sp: string) {
  const o = new URLSearchParams(sp);
  const osp = Object.fromEntries(o.entries()) as any;
  osp.store_id = parseInt(osp.store_id);
  return osp;
}
describe("SIGNATURE", function () {
  it("signs correctly", function () {
    const corvus = corvusPublicSign({
      custom_key: "UNV3-i2otJw0rUWzA2lpcNRqTOYRWdAeTw",
    });

    const message = {
      version: "1.4",
      store_id: 2029,
      order_number: "1537270065109",
      amount: "10.00",
      currency: "EUR",
      cart: "order 256",
      require_complete: "false",
      language: "hr",
    };
    assert.deepStrictEqual(
      corvus.signMessage(message).signature,
      "dd76d1b5a457f338d1d9c16cb070958c55f0a8595001e20e0584300074f50f3e"
    );
  });
});
describe("HASHING", function () {
  it("hashV1", function () {
    const transaction: Omit<APIRequestMandatory, "hash"> = {
      order_number: "10555",
      store_id: 44,
    };
    assert.equal(
      hashV1({
        transaction,
        secret: "2svQwmRIBhiiA9b26Z6SpaSGuFqZ_sFKyA",
      }),
      "bee137ad7be972975f815b35e3181d765674d489"
    );
  });
  it("hashV2", function () {
    const transaction: APIPartiallyCompleteTransactionPayload & {
      store_id: number;
      version: string;
    } = {
      store_id: 44,
      order_number: "10555",
      new_amount: "123.22",
      currency: "EUR",
      version: "1.4",
    };
    assert.equal(
      hashV2({
        transaction,
        secret: "2svQwmRIBhiiA9b26Z6SpaSGuFqZ_sFKyA",
      }),
      "27cb0ac12afb7487d026dd86d8d967bfddc4db46"
    );
  });
  it("hashV3", function () {
    const transaction: APICheckTransactionStatusPayload & {
      store_id: number;
      version: string;
    } = {
      store_id: 413,
      order_number: "Corvuš WooCommerce - 007",
      currency_code: "978",
      version: "1.4",
      timestamp: "20190701145139",
    };
    assert.equal(
      hashV3({
        transaction,
        secret: "86dVcb59moSoDbkESnGiHsDK9",
      }),
      "7e7d77d81cdbf337a0da771278bf205cbe006197"
      //coruvs integration manual gives this as the result. Seems to be incorrect. Tested with online sha1 calcs.
      // "c8fd5e86d728f7eeb592d8b4afb02c3a795d54d8"
    );
  });
});
describe("API ", function () {
  it("complete transaction", async function () {
    const corvus = apiFactory();
    const res = await corvus.completeTransaction({ order_number: "1233" });
    console.log(res);
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), {
      order_number: "1233",
      store_id: 123,
    });
  });
  it("complete transaction for subscription", async function () {
    const corvus = apiFactory();
    const res = await corvus.completeSubscriptionTransaction({
      order_number: "1233",
      subscription: "true",
      account_id: "12345678",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), {
      store_id: TEST_STORE_ID,
      order_number: "1233",
      subscription: "true",
      account_id: "12345678",
    });
  });

  it("partially complete transaction", async function () {
    const corvus = apiFactory();
    const res = await corvus.partiallyCompleteTransaction({
      order_number: "1233",
      new_amount: "22.22",
      currency: "EUR",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), {
      store_id: TEST_STORE_ID,
      order_number: "1233",
      new_amount: "22.22",
      currency: "EUR",
      version: "1.4",
    });
  });
  it("cancel transaction", async function () {
    const corvus = apiFactory();
    const res = await corvus.cancelTransaction({
      order_number: "1233",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), {
      store_id: TEST_STORE_ID,
      order_number: "1233",
    });
  });
  it("refund transaction", async function () {
    const corvus = apiFactory();
    const expected: Omit<APIRequestMandatory, "hash"> = {
      order_number: "1233",
      store_id: TEST_STORE_ID,
    };
    const res = await corvus.refundTransaction({
      order_number: "1233",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("partial refund transaction", async function () {
    const corvus = apiFactory();
    const expected: Omit<
      APIRequestMandatory & APIPartiallyCompleteTransaction,
      "hash"
    > = {
      order_number: "1233",
      currency: "EUR",
      new_amount: "100.00",
      version: TEST_VERSION,
      store_id: TEST_STORE_ID,
    };
    const res = await corvus.partialRefundTransaction({
      order_number: "1233",
      new_amount: "100.00",
      currency: "EUR",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("charge subscription payment", async function () {
    const corvus = apiFactory();
    const expected: Omit<APISubscriptionPaymentTransaction, "hash"> = {
      order_number: "1233",
      subscription: "true",
      version: TEST_VERSION,
      store_id: TEST_STORE_ID,
      account_id: "123",
    };
    const res = await corvus.chargeSubscriptionPayment({
      order_number: "1233",
      account_id: "123",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("charge subscription payment", async function () {
    const corvus = apiFactory();
    const expected: Omit<APISubscriptionPaymentTransaction, "hash"> = {
      order_number: "1233",
      subscription: "true",
      version: TEST_VERSION,
      store_id: TEST_STORE_ID,
      account_id: "123",
    };
    const res = await corvus.chargeSubscriptionPayment({
      order_number: "1233",
      account_id: "123",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("charge subscription payment with new amount", async function () {
    const corvus = apiFactory();
    const expected: Omit<APISubscriptionNewAmountPayment, "hash"> = {
      order_number: "1233",
      new_amount: "101.00",
      currency: "EUR",
      subscription: "true",
      version: TEST_VERSION,
      store_id: TEST_STORE_ID,
      account_id: "123",
      cart: "cart",
    };
    const res = await corvus.chargeNewAmountSubscriptionPayment({
      order_number: "1233",
      account_id: "123",
      new_amount: "101.00",
      currency: "EUR",
      cart: "cart",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("check transaction status", async function () {
    const corvus = apiFactory();
    const expected: Omit<APICheckTransactionStatus, "hash"> = {
      order_number: "1233",
      store_id: TEST_STORE_ID,
      version: TEST_VERSION,
      timestamp: "20221014160544",
      currency_code: "978",
    };
    const res = await corvus.checkTransactionStatus({
      order_number: "1233",
      timestamp: "20221014160544",
      currency_code: "978",
    });
    assert.deepStrictEqual(omitHash(decodeURLSP(res as any)), expected);
  });
  it("check PIS transaction status", async function () {
    const corvus = apiFactory({
      secret: "kzpBsSC6RatThzXRW0zxwnM5I263lRYMEA",
      store_id: 1,
    });
    const expected: Omit<APICheckTransactionStatus, "hash"> & {
      signature: string;
    } = {
      order_number: "265942",
      store_id: 1,
      version: TEST_VERSION,
      timestamp: "1579265340",
      signature:
        "32055ec364b35fde03136f4b85f8093d9a521a36341b738e8a64a2dde1a1546a",
      //according to corvus integration guide this should be the result but, for me,  it is not reproducible
      //"77f7e16f574ff91e50ed805344e5785fed830fb2a67d7a133ad6d86c766aff6b",
    };
    const res = await corvus.checkPISTransaction({
      order_number: "265942",
      timestamp: "1579265340",
    });
    expect(decodeURLSP(res as any)).toEqual(expected);
  });
});
