import { z } from "zod";

const config = z
  .object({
    DATABASE_URL: z.string(),
    JWT_SECRET: z.string(),
    OPENAI_API_KEY: z.string(),
    OPENAI_MODEL: z.string().default("gpt-3.5-turbo"),
    NODE_ENV: z.string(),
    PORT: z.coerce.number(),
  })
  .parse(Bun.env);

export default config;
