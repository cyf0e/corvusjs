import assert from "node:assert";
import { CorvusBase } from "../CorvusBase.js";
import { generateSortedMessageFromOptions } from "../utils/utils.js";
class MockCorvusBase extends CorvusBase {
  constructor(options: {
    secretKey?: string;
    endpoint?: string;
    storeId?: number;
    version?: string;
  }) {
    super({
      secretKey: options.secretKey ?? "secret_key",
      endpoint: "test" ?? options.endpoint,
      storeId: 1234 ?? options.storeId,
      version: "1.4" ?? options.version,
    });
  }
  signSHA256<T extends Record<string, string | number>>(
    options: T
  ): T & { signature: string } {
    return super.signSHA256(options);
  }

  addStoreIdAndVersion<T>(
    transaction: T
  ): T & { version: string } & { store_id: number } {
    return super.addStoreIdAndVersion(transaction);
  }
}

describe("SIGN SHA256", () => {
  it("signs message", () => {
    const c = new MockCorvusBase({
      secretKey: "UNV3-i2otJw0rUWzA2lpcNRqTOYRWdAeTw",
      endpoint: "test",
      storeId: 1234,
      version: "1.4",
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
    const signed = c.signSHA256(message);

    assert.deepStrictEqual(
      signed.signature,
      "dd76d1b5a457f338d1d9c16cb070958c55f0a8595001e20e0584300074f50f3e"
    );
  });
  it("generates sorted message", () => {
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
    const message2 = {
      b: "test",
      a: "test",
    };
    const sorted = generateSortedMessageFromOptions(message);

    assert.deepStrictEqual(
      sorted,
      "amount10.00cartorder 256currencyEURlanguagehrorder_number1537270065109require_completefalsestore_id2029version1.4"
    );
    assert.deepStrictEqual(
      generateSortedMessageFromOptions(message2),
      "atestbtest"
    );
    assert.deepStrictEqual(
      generateSortedMessageFromOptions({ c: 432, D: 99, a: "test", A: "big" }),
      "AbigD99atestc432"
    );
    //skip undefined values
    assert.equal(
      generateSortedMessageFromOptions({
        amount: "25.74",
        cardholder_country: undefined,
      }),
      "amount25.74"
    );
    //dont skip false booleans
    assert.equal(
      generateSortedMessageFromOptions({
        amount: "25.74",
        b: false,
      }),
      "amount25.74bfalse"
    );
  });
  it("appends store id and version", () => {
    const c = new MockCorvusBase({
      secretKey: "UNV3-i2otJw0rUWzA2lpcNRqTOYRWdAeTw",
      endpoint: "test",
      storeId: 1234,
      version: "1.4",
    });

    assert.deepStrictEqual(c.addStoreIdAndVersion({}), {
      store_id: 1234,
      version: "1.4",
    });
  });
});
