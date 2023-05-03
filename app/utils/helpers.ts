import * as z from "zod";
import { ZodError } from "zod";
import { StatusCode } from "./message";

export const zodKeys = <T extends z.ZodTypeAny>(
  schema: T,
  opts?: { enumOnly: boolean }
): string[] => {
  if (schema === null || schema === undefined) return [];
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
    return zodKeys(schema.unwrap());
  if (schema instanceof z.ZodArray) return zodKeys(schema.element);
  if (schema instanceof z.ZodObject) {
    const entries = Object.entries(schema.shape);
    return entries
      .flatMap(([key, value]) => {
        const nested =
          value instanceof z.ZodType
            ? zodKeys(value).map((subKey) => `${key}.${subKey}`)
            : [];

        const typeEval = opts?.enumOnly
          ? value instanceof z.ZodEnum || value instanceof z.ZodNativeEnum
          : !(value instanceof z.ZodOptional);

        return nested.length ? nested : typeEval ? key : null;
      })
      .filter(Boolean);
  }

  return [];
};

export const httpErrorCode = (err: unknown) => {
  const httpCode =
    err instanceof ZodError
      ? StatusCode.forbidden
      : StatusCode.internalServerError;

  return httpCode;
};
