import {
  corvusSupportedCurriencies,
  corvusSupportedLanguages,
} from "@cyf0e/corvusjs-core";
export * from "./apiResponseTypes";
export * from "./payload";
export * from "./base";
export type CorvusSupportedCurriencies =
  (typeof corvusSupportedCurriencies)[number];
export type CorvusSupportedLanguages =
  (typeof corvusSupportedLanguages)[number];
