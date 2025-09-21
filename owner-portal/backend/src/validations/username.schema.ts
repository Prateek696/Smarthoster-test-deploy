import { z } from "zod";

export const showUsernameSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});
