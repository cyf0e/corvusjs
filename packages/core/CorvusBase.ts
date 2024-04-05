import { computeSHA256Signature } from "./utils/utils";

export class CorvusBase {
  protected secretKey: string;
  public endpoint: string;
  protected storeId: number;
  protected version: string = "1.4";
  constructor(options: {
    secretKey: string;
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
    const signature = computeSHA256Signature(options, this.secretKey);
    return { ...options, signature } as T & { signature: string };
  }
  protected encodeRequest<T extends Record<any, any>>(data: T) {
    const searchParams = new URLSearchParams(
      Object.entries(data).map(([key, value]) => [key, String(value)])
    );
    return searchParams.toString();
  }

  protected addVersion<T>(transaction: T) {
    return { ...transaction, version: this.version } as T & { version: string };
  }
  protected addStoreId<T>(transaction: T) {
    //patch store_id into every transaction since its a mandatory field for every request

    return { ...transaction, store_id: this.storeId } as T & {
      store_id: number;
    };
  }
  protected addStoreIdAndVersion<T>(transaction: T) {
    return this.addStoreId(this.addVersion(transaction));
  }
}
