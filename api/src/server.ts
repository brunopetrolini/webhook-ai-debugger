import { fastifyCors } from '@fastify/cors';
import { fastifySwagger } from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import { fastify } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env';
import { captureWebhook } from './routes/capture-webhook';
import { deleteWebhook } from './routes/delete-webhook';
import { generateHandler } from './routes/generate-handler';
import { getWebhook } from './routes/get-webhook';
import { listWebhooks } from './routes/list-webhooks';

const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Webhook Inspector API',
      description: 'API for inspecting webhooks requests',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
  routePrefix: '/docs',
  configuration: {
    hideDarkModeToggle: true,
    theme: 'deepSpace',
  },
});

/**
 * Routes registration
 */
const defaultPrefix = '/api';
app.register(listWebhooks, { prefix: defaultPrefix });
app.register(getWebhook, { prefix: defaultPrefix });
app.register(deleteWebhook, { prefix: defaultPrefix });
app.register(captureWebhook, { prefix: defaultPrefix });
app.register(generateHandler, { prefix: defaultPrefix });

app.listen({ port: env.PORT, host: env.HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`🚀 HTTP server running on ${address}`);
  console.log(`📚 API docs available at ${address}/docs`);
});
