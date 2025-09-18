import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || "";

const prisma = new PrismaClient();

// Type definitions for Clerk webhook data
interface ClerkUserData {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  profile_image_url?: string | null;
  created_at?: number;
  updated_at?: number;
}

interface ClerkDeletedUserData {
  id?: string;
}

async function validateRequest(request: NextRequest) {
  const payloadString = await request.text();

  const svixHeaders = {
    "svix-id": request.headers.get("svix-id")!,
    "svix-timestamp": request.headers.get("svix-timestamp")!,
    "svix-signature": request.headers.get("svix-signature")!,
  };

  // Log headers for debugging (remove in production)
  console.log("Webhook headers:", {
    "svix-id": svixHeaders["svix-id"],
    "svix-timestamp": svixHeaders["svix-timestamp"],
    "svix-signature": svixHeaders["svix-signature"] ? "present" : "missing",
  });

  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const wh = new Webhook(webhookSecret);
  return wh.verify(payloadString, svixHeaders) as WebhookEvent;
}

export async function POST(request: NextRequest) {
  try {
    console.log("Webhook request received");

    const payload = await validateRequest(request);
    console.log("Webhook received:", payload.type);

    // Handle different webhook events
    switch (payload.type) {
      case "user.created":
        await handleUserCreated(payload.data);
        break;
      case "user.updated":
        await handleUserUpdated(payload.data);
        break;
      case "user.deleted":
        await handleUserDeleted(payload.data);
        break;
      default:
        console.log("Unhandled webhook event:", payload.type);
    }

    return Response.json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ message: "Clerk webhook endpoint is running" });
}

async function handleUserCreated(userData: ClerkUserData) {
  try {
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email_addresses[0]?.email_address || "",
        username: userData.username || null,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        imageUrl: userData.profile_image_url || null,
        createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
        updatedAt: userData.updated_at ? new Date(userData.updated_at) : new Date(),
      },
    });
    console.log("User created in database:", user.id);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function handleUserUpdated(userData: ClerkUserData) {
  try {
    const user = await prisma.user.update({
      where: { id: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || "",
        username: userData.username || null,
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        imageUrl: userData.profile_image_url || null,
        updatedAt: userData.updated_at ? new Date(userData.updated_at) : new Date(),
      },
    });
    console.log("User updated in database:", user.id);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

async function handleUserDeleted(userData: ClerkDeletedUserData) {
  try {
    if (!userData.id) {
      console.error("User ID is missing from deletion data");
      return;
    }

    const user = await prisma.user.delete({
      where: { id: userData.id },
    });
    console.log("User deleted from database:", user.id);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}