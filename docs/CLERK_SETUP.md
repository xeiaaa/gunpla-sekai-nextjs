# Clerk Authentication Setup

This document provides instructions for setting up Clerk authentication with webhook integration for the Gunpla Sekai application.

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=your_secret_key_here
CLERK_WEBHOOK_SECRET=your_webhook_signing_secret_here

# Database
DATABASE_URL="file:./dev.db"
```

### Getting Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application or create a new one
3. Navigate to **API Keys** section
4. Copy the **Publishable Key** and **Secret Key**
5. For webhook secret, go to **Webhooks** section and copy the signing secret

## Webhook Configuration

### Local Development

1. Install localtunnel globally:

   ```bash
   npm install -g localtunnel
   ```

2. Start your development server:

   ```bash
   npm run dev
   ```

3. In another terminal, create a tunnel:

   ```bash
   lt --port 3000 --subdomain gunpla-sekai-dev
   ```

4. Configure webhook in Clerk Dashboard:
   - Go to **Webhooks** section
   - Click **Add Endpoint**
   - Enter URL: `https://gunpla-sekai-dev.loca.lt/api/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret to your `.env.local` file

### Production

1. Deploy your application to your hosting platform
2. Update webhook URL in Clerk Dashboard to your production domain
3. Set environment variables in your hosting platform
4. Test webhook delivery in Clerk Dashboard

## Features Implemented

### Authentication Flow

- ✅ Sign-up and sign-in functionality
- ✅ User profile management
- ✅ Session handling
- ✅ Protected routes via middleware

### Webhook Integration

- ✅ User creation synchronization
- ✅ User profile updates synchronization
- ✅ User deletion synchronization
- ✅ Webhook signature verification
- ✅ Error handling and logging

### UI Components

- ✅ Sign-in/Sign-up buttons in header
- ✅ User button with profile management
- ✅ Responsive mobile navigation
- ✅ Conditional rendering based on auth state

## Testing

Run the webhook tests:

```bash
npm test -- __tests__/clerk-webhook.test.ts
```

## API Endpoints

- `GET /api/clerk` - Health check for webhook endpoint
- `POST /api/clerk` - Webhook endpoint for Clerk events

## Database Schema

The webhook integration automatically syncs the following user fields:

- `clerkId` - Unique Clerk user identifier
- `email` - User's primary email address
- `username` - User's username
- `firstName` - User's first name
- `lastName` - User's last name
- `profileImageUrl` - User's profile image URL
- `createdAt` - User creation timestamp
- `updatedAt` - Last update timestamp

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**

   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check Clerk dashboard for delivery status

2. **Authentication not working**

   - Verify API keys are correct
   - Check middleware configuration
   - Ensure ClerkProvider wraps your app

3. **Database sync issues**
   - Check Prisma connection
   - Verify user table exists
   - Check webhook event handling

### Debug Mode

Enable debug logging by adding to `.env.local`:

```bash
CLERK_DEBUG=true
```

This will provide detailed logs for authentication and webhook events.
