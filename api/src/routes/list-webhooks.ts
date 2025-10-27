import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const listWebhooks: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/webhooks",
    {
      schema: {
        summary: "List Webhooks",
        description: "List all webhooks configured in inspector",
        tags: ["Webhooks"],
        querystring: z.object({
          limit: z.coerce.number().min(1).max(100).default(20),
        }),
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              method: z.string(),
              url: z.string(),
            }),
          ),
        },
      },
    },
    async (request, reply) => {
      const { limit } = request.query;

      const methodsMock = ["POST", "GET", "PUT", "DELETE"];

      // Placeholder data - replace with actual data retrieval logic
      const webhooks = Array.from({ length: limit }, (_, i) => ({
        id: `webhook-${i + 1}`,
        method: methodsMock[i % methodsMock.length],
        url: `https://example.com/webhook/${i + 1}`,
      }));

      return reply.status(200).send(webhooks);
    },
  );
};
