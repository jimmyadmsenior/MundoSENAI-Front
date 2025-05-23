import z, { ZodSafeParseError } from "zod/v4";

export function formatError(result: ZodSafeParseError<any>) {
    return z.prettifyError(result.error)
}