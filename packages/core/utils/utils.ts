export function generateSortedMessageFromOptions<
  T extends Record<string, string | number>
>(options: T) {
  const sortedKeys = Object.keys(options)
    .filter((o) => o.toLowerCase() != "signature")
    .sort();

  let sortedMessage = sortedKeys.map((key) => `${key}${options[key]}`).join("");

  return sortedMessage;
}
