import { faker } from '@faker-js/faker';
import { db } from '.';
import { webhooks } from './schema';

// Stripe webhook event types
const STRIPE_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.created',
  'payment_intent.payment_failed',
  'charge.succeeded',
  'charge.failed',
  'charge.refunded',
  'customer.created',
  'customer.updated',
  'customer.deleted',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'customer.subscription.trial_will_end',
  'invoice.created',
  'invoice.finalized',
  'invoice.paid',
  'invoice.payment_failed',
  'invoice.payment_action_required',
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'charge.dispute.created',
  'charge.dispute.updated',
  'charge.dispute.closed',
  'payout.created',
  'payout.paid',
  'payout.failed',
];

// Different webhook pathnames for variety
const WEBHOOK_PATHNAMES = [
  '/webhooks/stripe',
  '/api/webhooks/stripe',
  '/stripe/webhook',
  '/api/stripe/events',
  '/webhooks/payments',
  '/payments/stripe/webhook',
  '/v1/webhooks/stripe',
  '/integrations/stripe/webhook',
];

function generateStripeWebhook() {
  const eventType = faker.helpers.arrayElement(STRIPE_EVENTS);
  const chargeId = `ch_${faker.string.alphanumeric(24)}`;
  const customerId = `cus_${faker.string.alphanumeric(14)}`;
  const paymentIntentId = `pi_${faker.string.alphanumeric(24)}`;
  const subscriptionId = `sub_${faker.string.alphanumeric(14)}`;
  const invoiceId = `in_${faker.string.alphanumeric(24)}`;

  // Simulate different payloads based on event type
  const body: Record<string, unknown> = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: 'event',
    api_version: '2024-10-28.acacia',
    created: Math.floor(faker.date.recent().getTime() / 1000),
    type: eventType,
    livemode: false,
  };

  // Add specific data based on event type
  if (eventType.startsWith('payment_intent')) {
    body.data = {
      object: {
        id: paymentIntentId,
        object: 'payment_intent',
        amount: faker.number.int({ min: 1000, max: 100000 }),
        currency: 'usd',
        customer: customerId,
        status: eventType.includes('succeeded')
          ? 'succeeded'
          : 'requires_payment_method',
        description: faker.commerce.productName(),
      },
    };
  } else if (eventType.startsWith('charge')) {
    body.data = {
      object: {
        id: chargeId,
        object: 'charge',
        amount: faker.number.int({ min: 1000, max: 100000 }),
        currency: 'usd',
        customer: customerId,
        status: eventType.includes('succeeded') ? 'succeeded' : 'failed',
        payment_method: `pm_${faker.string.alphanumeric(24)}`,
      },
    };
  } else if (eventType.startsWith('customer.subscription')) {
    body.data = {
      object: {
        id: subscriptionId,
        object: 'subscription',
        customer: customerId,
        status: 'active',
        current_period_start: Math.floor(
          faker.date.recent({ days: 30 }).getTime() / 1000,
        ),
        current_period_end: Math.floor(
          faker.date.future({ years: 1 }).getTime() / 1000,
        ),
        items: {
          data: [
            {
              id: `si_${faker.string.alphanumeric(14)}`,
              price: {
                id: `price_${faker.string.alphanumeric(24)}`,
                unit_amount: faker.number.int({ min: 999, max: 9999 }),
                currency: 'usd',
                recurring: { interval: 'month' },
              },
            },
          ],
        },
      },
    };
  } else if (eventType.startsWith('invoice')) {
    body.data = {
      object: {
        id: invoiceId,
        object: 'invoice',
        customer: customerId,
        subscription: subscriptionId,
        amount_due: faker.number.int({ min: 1000, max: 50000 }),
        amount_paid: eventType.includes('paid')
          ? faker.number.int({ min: 1000, max: 50000 })
          : 0,
        currency: 'usd',
        status: eventType.includes('paid') ? 'paid' : 'open',
      },
    };
  } else if (
    eventType.startsWith('customer') &&
    !eventType.includes('subscription')
  ) {
    body.data = {
      object: {
        id: customerId,
        object: 'customer',
        email: faker.internet.email(),
        name: faker.person.fullName(),
        created: Math.floor(faker.date.past({ years: 2 }).getTime() / 1000),
      },
    };
  } else if (eventType.startsWith('checkout.session')) {
    body.data = {
      object: {
        id: `cs_${faker.string.alphanumeric(24)}`,
        object: 'checkout.session',
        customer: customerId,
        payment_intent: paymentIntentId,
        amount_total: faker.number.int({ min: 1000, max: 100000 }),
        currency: 'usd',
        payment_status: eventType.includes('completed') ? 'paid' : 'unpaid',
      },
    };
  } else if (eventType.startsWith('charge.dispute')) {
    body.data = {
      object: {
        id: `dp_${faker.string.alphanumeric(24)}`,
        object: 'dispute',
        charge: chargeId,
        amount: faker.number.int({ min: 1000, max: 50000 }),
        currency: 'usd',
        status: eventType.includes('closed') ? 'won' : 'needs_response',
        reason: faker.helpers.arrayElement([
          'fraudulent',
          'unrecognized',
          'duplicate',
        ]),
      },
    };
  } else if (eventType.startsWith('payout')) {
    body.data = {
      object: {
        id: `po_${faker.string.alphanumeric(24)}`,
        object: 'payout',
        amount: faker.number.int({ min: 10000, max: 500000 }),
        currency: 'usd',
        status: eventType.includes('paid')
          ? 'paid'
          : eventType.includes('failed')
            ? 'failed'
            : 'in_transit',
        arrival_date: Math.floor(faker.date.future().getTime() / 1000),
      },
    };
  }

  return {
    method: 'POST',
    pathname: faker.helpers.arrayElement(WEBHOOK_PATHNAMES),
    ip: faker.internet.ipv4(),
    statusCode: 200,
    contentType: 'application/json',
    contentLength: JSON.stringify(body).length,
    headers: {
      'content-type': 'application/json',
      'stripe-signature': `t=${Math.floor(Date.now() / 1000)},v1=${faker.string.alphanumeric(64)}`,
      'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    },
    body: JSON.stringify(body),
  };
}

async function seed() {
  console.log('🌱 Starting seed...');

  const now = new Date();
  const webhooksData = Array.from({ length: 75 }, (_, index) => {
    const createdAt = new Date();

    // First 15 items: within current day with different hours/minutes
    if (index < 15) {
      // Same day, but subtract some hours
      const hoursAgo = faker.number.int({ min: 0, max: 12 });
      const minutesAgo = faker.number.int({ min: 0, max: 59 });
      createdAt.setHours(now.getHours() - hoursAgo);
      createdAt.setMinutes(now.getMinutes() - minutesAgo);
      createdAt.setSeconds(faker.number.int({ min: 0, max: 59 }));
    } else {
      // Remaining items: distribute over the last 5 days
      const daysAgo = faker.number.int({ min: 1, max: 5 });
      createdAt.setDate(now.getDate() - daysAgo);
      createdAt.setHours(faker.number.int({ min: 0, max: 23 }));
      createdAt.setMinutes(faker.number.int({ min: 0, max: 59 }));
      createdAt.setSeconds(faker.number.int({ min: 0, max: 59 }));
    }

    return {
      ...generateStripeWebhook(),
      createdAt,
    };
  });

  await db.insert(webhooks).values(webhooksData);

  console.log(`✅ Seeded ${webhooksData.length} webhook events`);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
