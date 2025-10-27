import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"], {
      message: "NODE_ENV must be one of 'development', 'production', or 'test'",
    })
    .default("development"),
  HOST: z.string({ message: "HOST must be a valid string" }).default("0.0.0.0"),
  PORT: z.coerce
    .number({ message: "PORT must be a valid number" })
    .default(3333),
  DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid database connection URL" }),
});

export const env = envSchema.parse(process.env);
