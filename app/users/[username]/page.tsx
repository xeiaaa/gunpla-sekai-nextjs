import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByUsername, getUserBasicInfo } from "@/lib/actions/users";
import { UserProfilePage } from "@/components/user-profile-page";

// ISR: Revalidate every 7 days (604800 seconds)
export const revalidate = 604800;

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: UserProfilePageProps) {
  // Use optimized function for metadata generation (minimal data)
  const { username } = await params;
  const user = await getUserBasicInfo(username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "User";

  return {
    title: `${displayName} - Gunpla Sekai`,
    description: `View ${displayName}'s Gunpla collection, builds, and reviews on Gunpla Sekai`,
  };
}

export default async function UserProfile({ params }: UserProfilePageProps) {
  const { userId } = await auth();
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  const isOwnProfile = userId === user.id;

  return (
    <UserProfilePage
      user={user}
      isOwnProfile={isOwnProfile}
      routeContext="user"
    />
  );
}
