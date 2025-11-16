import { db } from '@/db';
import { webhooks } from '@/db/schema';
import { env } from '@/env';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { inArray } from 'drizzle-orm';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/generate',
    {
      schema: {
        summary: 'Generate a TypeScript handler',
        description:
          'Uses AI to generate a TypeScript handler for the selected webhooks.',
        tags: ['Webhooks'],
        body: z.object({
          webhookIds: z.array(z.uuidv7()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body;

      const result = await db
        .select()
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds));

      const webhooksBodies = result.map((webhook) => webhook.body).join('\n\n');

      const google = createGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
      });
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: `
        You are an expert Senior TypeScript developer, specializing in creating robust, type-safe data validation and handling functions using Zod.

        Your task is to generate a comprehensive **TypeScript handler function** for a set of incoming webhooks.

        **Crucial Instruction: The ONLY output MUST be the complete and runnable TypeScript code, returned as a single, unformatted text string. DO NOT use markdown language indicators (e.g., '''typescript, ''') or include any introductory, explanatory, or concluding text.**

        **Instructions for Code Generation:**
        1.  **Analyze the following example JSON bodies** from different webhooks. Each body represents a unique event or webhook type.
        2.  **Generate a Zod schema** for *each* unique webhook event structure. The schemas should be named descriptively (e.g., 'OrderCreatedSchema', 'UserUpdatedSchema'). Use appropriate Zod types and methods (e.g., '.optional()', '.array()', '.transform()').
        3.  **Create a main TypeScript function**, named 'handleWebhookEvent(data: unknown)', that performs the following steps:
            * It should use a **discriminating union pattern** (or a similar efficient method like a 'switch' statement based on a common field like 'event_type') to safely determine which Zod schema to use.
            * It must use 'try/catch' blocks for validation to handle parsing errors gracefully, utilizing 'ZodError'.
            * It should return a strongly typed object representing the parsed event or throw a descriptive error if validation fails or the webhook type is unknown.
        4.  **Use a clean, modern, and production-ready code style.**

        **Webhook JSON Examples:**

        """
        ${webhooksBodies}
        """
        `.trim(),
      });

      return reply.status(201).send({ code: text });
    },
  );
};
