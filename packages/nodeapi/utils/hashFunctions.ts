import { createHash } from "crypto";
import { CorvusSupportedCurriencies } from "../types/types";

export function hashV1<
  R extends { store_id: number; order_number: string }
>(params: { transaction: R; secret: string }) {
  const { secret, transaction } = params;
  const stringToHash = secret + transaction.order_number + transaction.store_id;
  return hashBase(stringToHash);
}
export function hashV2<
  R extends {
    store_id: number;
    order_number: string;
    version: string;
    new_amount?: string | number;
    currency?: CorvusSupportedCurriencies;
  }
>(params: { secret: string; transaction: R }) {
  const { secret, transaction } = params;
  const newAmount =
    typeof transaction.new_amount == "number"
      ? transaction.new_amount
      : transaction.new_amount;
  const stringToHash =
    secret +
    transaction.order_number +
    transaction.store_id +
    transaction.version +
    newAmount +
    transaction.currency;
  return hashBase(stringToHash);
}
export function hashV3<
  T extends {
    order_number: string;
    store_id: number;
    currency_code?: string;
    timestamp: string;
    version: string;
  }
>(params: { transaction: T; secret: string }) {
  const { secret, transaction } = params;
  const stringToHash =
    secret +
    transaction.order_number +
    transaction.store_id +
    transaction.currency_code +
    transaction.timestamp +
    transaction.version;
  return hashBase(stringToHash);
}
function hashBase(stringToHash: string) {
  const text = new TextEncoder();
  const encodedString = text.encode(stringToHash);
  const sha1hasher = createHash("sha1");
  const hash = sha1hasher.update(encodedString).digest("hex");
  return hash;
}
