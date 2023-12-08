import { z } from "zod";

export function validateData<T, V extends z.ZodTypeAny>(
  validationFunction: V,
  data: T
) {
  validationFunction.parse(data);
}
