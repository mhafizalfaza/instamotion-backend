import * as z from "zod";

export const createDealerValidator = z.object({
  name: z.string(),
});

export type CreateDealer = z.infer<typeof createDealerValidator>;
