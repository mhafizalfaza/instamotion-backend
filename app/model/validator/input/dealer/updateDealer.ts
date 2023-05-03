import * as z from "zod";

export const updateDealerValidator = z.object({
  name: z.string().optional(),
});

export type UpdateDealer = z.infer<typeof updateDealerValidator>;
