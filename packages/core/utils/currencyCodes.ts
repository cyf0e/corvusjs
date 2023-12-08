const CURRENCY_CODES = new Map([
  ["AUD", "036"] /* Australian dollar, 100 */,
  ["BAM", "977"] /* Bosnia and Herzegovina convertible mark, 100 */,
  ["CAD", "124"] /* Canadian dollar, 100 */,
  ["CHF", "756"] /* Swiss franc, 100 */,
  ["CZK", "203"] /* Czech koruna, 100 */,
  ["DKK", "208"] /* Danish krone, 100 */,
  ["EUR", "978"] /* Euro, 100 */,
  ["GBP", "826"] /* British pound, 100 */,
  ["HRK", "191"] /* Croatian kuna, 100 */,
  ["HUF", "348"] /* Hungarian forint, 100 */,
  ["NOK", "578"] /* Norwegian krone, 100 */,
  ["PLN", "985"] /* Polish złoty, 100 */,
  ["RSD", "941"] /* Serbian dinar, 100 */,
  ["USD", "840"] /* United States dollar, 100 */,
  ["SEK", "752"] /* Swedish krona, 100 */,
  ["BHD", "048"] /* Bahraini dinar, 100 */,
  ["RUB", "643"] /* Russian ruble, 100 */,
  ["RON", "946"] /* Romanian leu, 100 */,
  ["ISK", "352"] /* Icelandic króna, 100 */,
]);
export function getCurrencyCodeFor(currency: string) {
  return CURRENCY_CODES.get(currency);
}
