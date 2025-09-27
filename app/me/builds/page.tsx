import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById, getUserByUsername } from "@/lib/actions/users";
import { getUserBuildsOptimized } from "@/lib/actions/builds";
import { UserBuildsPage } from "@/components/user-builds-page";

interface MeBuildsPageProps {
  searchParams: Promise<{
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

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

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || "User";

  return {
    title: `${displayName}'s Builds - Gunpla Sekai`,
    description: `Browse all of ${displayName}'s Gunpla builds and projects on Gunpla Sekai`,
  };
}

export default async function MeBuildsPage({
  searchParams,
}: MeBuildsPageProps) {
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

  // Parse search params
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status;
  const sort = resolvedSearchParams.sort || "newest";
  const page = parseInt(resolvedSearchParams.page || "1", 10);

  // Get user builds with filtering and sorting
  const builds = await getUserBuildsOptimized(
    userProfileData.id,
    20,
    status === "all" ? undefined : parseInt(status, 10),
    sort
  );

  return (
    <UserBuildsPage
      user={userProfileData}
      builds={builds}
      isOwnProfile={true}
      currentStatus={status}
      currentSort={sort}
      currentPage={page}
    />
  );
}
