import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserById, getUserProfileById } from "@/lib/actions/users";
import { UserProfilePage } from "@/components/user-profile-page";

export async function generateMetadata() {
  const { userId } = await auth();

  if (!userId) {
    return {
      title: "Sign In Required - Gunpla Sekai",
    };
  }

  // Use optimized function to get basic user info for metadata
  const user = await getUserById(userId);

  if (!user || !user.username) {
    return {
      title: "Profile Setup Required - Gunpla Sekai",
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

export default async function MePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get full user profile data in a single optimized query
  const userProfileData = await getUserProfileById(userId);

  if (!userProfileData) {
    redirect("/sign-in");
  }

  // Render the same component as the user profile page, but always as own profile
  return (
    <Suspense fallback={<div></div>}>
      <UserProfilePage
        user={userProfileData}
        isOwnProfile={true}
        routeContext="me"
      />
    </Suspense>
  );
}
