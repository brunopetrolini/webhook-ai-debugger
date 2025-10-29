import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

import { db } from "@/db";
import { webhooks } from "@/db/schema";

export const captureWebhook: FastifyPluginAsyncZod = async (app) => {
  app.all(
    "/capture/*",
    {
      schema: {
        hide: true,
        summary: "Capture Webhook",
        description: "Endpoint to capture incoming webhook requests",
        tags: ["External"],
        response: {
          201: z.object({ id: z.uuidv7() }),
        },
      },
    },
    async (request, reply) => {
      const method = request.method;
      const pathname = new URL(request.url).pathname.replace("/capture", "");
      const ip = request.ip;
      const statusCode = 200;
      const contentType = request.headers["content-type"];

      const contentLength = request.headers["content-length"]
        ? parseInt(request.headers["content-length"], 10)
        : null;

      const headers = Object.fromEntries(
        Object.entries(request.headers).map(([key, value]) => [
          key,
          Array.isArray(value) ? value.join(", ") : value || "",
        ]),
      );

      let body: string | null = null;
      if (request.body) {
        body =
          typeof request.body === "string"
            ? request.body
            : JSON.stringify(request.body);
      }

      const result = await db
        .insert(webhooks)
        .values({
          method,
          pathname,
          ip,
          statusCode,
          contentType,
          contentLength,
          headers,
          body,
        })
        .returning({ id: webhooks.id });

      return reply.status(201).send({ id: result[0].id });
    },
  );
};
