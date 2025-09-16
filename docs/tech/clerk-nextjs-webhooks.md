# Clerk Webhooks: Getting Started with Next.js

Learn how to set up webhooks to build integrations in a Next.js application with Clerk's authentication system.

## Overview

Webhooks enable external services like Clerk to notify your application of important user interactions. These interactions include:

- User sign-in/sign-up
- Profile changes
- Organization creation
- Session management

## Setting up Webhooks in Next.js

### Prerequisites

- Next.js project with Clerk already configured
- Basic familiarity with Next.js and Clerk

### 1. Create the Webhook Endpoint

Create an API route at `app/api/clerk/route.ts`:

```typescript
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const payload: WebhookEvent = await request.json();
  console.log(payload);
  return Response.json({ message: "Received" });
}

export async function GET() {
  return Response.json({ message: "Hello World!" });
}
```

### 2. Configure Middleware

Add the webhook endpoint as a public route in `middleware.ts`:

```typescript
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/api/clerk"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/"],
};
```

### 3. Local Development Setup

For local testing, use a tunneling service like localtunnel:

```bash
# Install localtunnel globally
npm install -g localtunnel

# Create tunnel to your local server
lt --port 3000

# For consistent URL (recommended)
lt --port 3000 --subdomain unique-url-name
```

### 4. Configure Webhook in Clerk Dashboard

1. Go to the Webhooks page in your Clerk dashboard
2. Click "Add Endpoint"
3. Enter your localtunnel URL (e.g., `https://unique-url-name.loca.lt/api/clerk`)
4. Select which events to receive (leave all selected for testing)
5. Click "Create"

### 5. Test the Webhook

1. Navigate to the Testing tab in your webhook configuration
2. Select an event from the dropdown
3. Click "Send Example"
4. Check your console for the logged payload

## Production Security

### Webhook Signature Verification

Secure your webhook endpoint by validating requests:

```typescript
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

async function validateRequest(request: Request) {
  const payloadString = await request.text();
  const headerPayload = headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };

  const wh = new Webhook(webhookSecret);
  return wh.verify(payloadString, svixHeaders) as WebhookEvent;
}

export async function POST(request: Request) {
  try {
    const payload = await validateRequest(request);
    console.log(payload);

    // Process the event

    return Response.json({ message: "Received" });
  } catch (e) {
    // Return error for retry
    return Response.error();
  }
}
```

### Environment Variables

Add to your `.env.local`:

```bash
CLERK_WEBHOOK_SECRET=your_webhook_signing_secret
```

Get the signing secret from your Clerk dashboard webhook configuration.

## Webhook Use Cases

### 1. Data Synchronization

- Sync user data to your own database
- Maintain local copies for complex queries
- Enable offline functionality

### 2. Event-Driven Systems

- Send onboarding emails to new users
- Trigger background jobs
- Update external systems

### 3. Custom Email/SMS

- Handle auth message delivery yourself
- Integrate with your preferred providers
- Customize message templates

## Common Webhook Events

- `user.created` - New user registration
- `user.updated` - Profile changes
- `session.created` - User sign-in
- `session.ended` - User sign-out
- `session.revoked` - Remote sign-out
- `organization.created` - New organization
- `organizationMembership.created` - User joins organization

## Best Practices

### Error Handling

- Return 20x status codes for successful processing
- Return 40x/50x for errors to trigger retries
- Implement exponential backoff handling
- Monitor webhook status in Clerk dashboard

### Performance

- Process webhooks asynchronously when possible
- Use selective event filtering in production
- Implement proper logging and monitoring
- Handle duplicate events gracefully

### Security

- Always validate webhook signatures
- Use HTTPS endpoints in production
- Implement rate limiting if needed
- Store webhook secrets securely

## Deployment

When deploying to production:

1. Update webhook endpoint URL in Clerk dashboard
2. Set `CLERK_WEBHOOK_SECRET` environment variable
3. Enable only necessary events for performance
4. Implement proper error handling and logging

## Resources

- [Clerk Webhook Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Webhook Platform](https://svix.com/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
