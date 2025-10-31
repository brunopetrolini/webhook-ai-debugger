import { inArray } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

import { db } from "@/db";
import { webhooks } from "@/db/schema";

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/generate",
    {
      schema: {
        summary: "Generate a TypeScript handler",
        description:
          "Uses AI to generate a TypeScript handler for the selected webhooks.",
        tags: ["Webhooks"],
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

      const webhooksBodies = result.map((webhook) => webhook.body).join("\n\n");

      return reply.status(201).send({ code: webhooksBodies });
    },
  );
};
