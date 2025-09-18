import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById, getUserByUsername } from "@/lib/actions/users";
import { UserProfilePage } from "@/components/user-profile-page";

export async function generateMetadata() {
  const { userId } = await auth();

  if (!userId) {
    return {
      title: "Sign In Required - Gunpla Sekai",
    };
  }

  const user = await getUserById(userId);

  if (!user || !user.username) {
    return {
      title: "Profile Setup Required - Gunpla Sekai",
    };
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  return {
    title: `${displayName} - Gunpla Sekai`,
    description: `View ${displayName}'s Gunpla collection, builds, and reviews on Gunpla Sekai`,
  };
}

export default async function MePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user data to get their username
  const user = await getUserById(userId);

  if (!user || !user.username) {
    // If user doesn't have a username, redirect to profile settings
    redirect("/settings/profile");
  }

  // Get full user profile data using the same function as the user profile page
  const userProfileData = await getUserByUsername(user.username);

  if (!userProfileData) {
    redirect("/sign-in");
  }

  // Render the same component as the user profile page, but always as own profile
  return <UserProfilePage user={userProfileData} isOwnProfile={true} routeContext="me" />;
}
