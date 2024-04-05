import { sha256 } from "js-sha256";
export function generateSortedMessageFromOptions<
  T extends Record<string, unknown>
>(options: T) {
  const sortedKeys = Object.keys(options)
    .filter(
      (o) =>
        options[o] != undefined &&
        options[o] != null &&
        o.toLowerCase() != "signature"
    )
    .sort();

  let sortedMessage = sortedKeys.map((key) => `${key}${options[key]}`).join("");
  return sortedMessage;
}

export function computeSHA256Signature<
  T extends Record<string, string | number>
>(options: T, secretKey: string) {
  if (!secretKey)
    throw new Error("Secret key is required to sign transactions.");

  const sortedMessage = generateSortedMessageFromOptions(options);
  const signature = sha256.hmac(secretKey, sortedMessage);

  return signature;
}
