import {
  corvusSupportedCurriencies,
  corvusSupportedLanguages,
} from "@corvusjs/core";

export type CorvusSupportedCurriencies =
  (typeof corvusSupportedCurriencies)[number];
export type CorvusSupportedLanguages =
  (typeof corvusSupportedLanguages)[number];
