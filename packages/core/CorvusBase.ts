import { sha256 } from "js-sha256";

export class CorvusBase {
  protected secretKey?: string;
  public endpoint: string;
  protected storeId: number;
  protected version: string = "1.4";
  constructor(options: {
    secretKey?: string;
    endpoint: string;
    storeId: number;
    version: string;
  }) {
    this.secretKey = options.secretKey;
    this.endpoint = options.endpoint;
    this.storeId = options.storeId;
    this.version = options.version;
  }
  protected signSHA256<T extends Record<string, string | number>>(options: T) {
    if (!this.secretKey)
      throw new Error("Secret key is required to sing transactions.");
    const sortedMessage = this.generateSortedMessageFromOptions(options);
    const encoder = new TextEncoder();
    const sortedMessageUTF8 = encoder.encode(sortedMessage);
    const signature = sha256.hmac(this.secretKey, sortedMessageUTF8);

    const fullObject = Object.defineProperty(options, "signature", {
      value: signature,
      enumerable: true,
    });
    return fullObject as T & { signature: string };
  }
  protected encodeRequest<T extends Record<any, any>>(data: T) {
    const searchParams = new URLSearchParams(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    return searchParams.toString();
  }

  private generateSortedMessageFromOptions<
    T extends Record<string, string | number>
  >(options: T) {
    const sortedKeys = [...Object.keys(options)].sort();
    let sortedMessage = "";
    for (let key of sortedKeys) {
      let value = options[key];
      if (value == undefined || value == null) continue;
      sortedMessage = sortedMessage.concat(
        key,
        typeof value == "number" ? value.toString() : value
      );
    }
    return sortedMessage;
  }

  protected addVersion<T>(transaction: T) {
    Object.defineProperty(transaction, "version", {
      value: this.version,
      enumerable: true,
    });
    return { ...transaction } as T & { version: string };
  }
  protected addStoreId<T>(transaction: T) {
    //patch store_id into every transaction since its a mandatory field for every request
    Object.defineProperty(transaction, "store_id", {
      value: this.storeId,
      enumerable: true,
    });
    return { ...transaction } as T & { store_id: number };
  }
  protected addStoreIdAndVersion<T>(transaction: T) {
    const withVersion = this.addVersion(transaction);
    const final = this.addStoreId(withVersion);
    return final;
  }
}
