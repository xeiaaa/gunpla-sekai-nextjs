import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByUsername } from "@/lib/actions/users";
import { getUserBuildsOptimized } from "@/lib/actions/builds";
import { UserBuildsPage } from "@/components/user-builds-page";

interface UserBuildsPageProps {
  params: {
    username: string;
  };
  searchParams: {
    status?: string;
    sort?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: UserBuildsPageProps) {
  const user = await getUserByUsername(params.username);

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
    title: `${displayName}'s Builds - Gunpla Sekai`,
    description: `Browse all of ${displayName}'s Gunpla builds and projects on Gunpla Sekai`,
  };
}

export default async function UserBuilds({
  params,
  searchParams,
}: UserBuildsPageProps) {
  const { userId } = await auth();
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  const isOwnProfile = userId === user.id;

  // Parse search params
  const status = searchParams.status;
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1", 10);

  // Get user builds with filtering and sorting
  const builds = await getUserBuildsOptimized(
    user.id,
    20,
    status === "all" ? undefined : status,
    sort
  );

  return (
    <UserBuildsPage
      user={user}
      builds={builds}
      isOwnProfile={isOwnProfile}
      currentStatus={status}
      currentSort={sort}
      currentPage={page}
    />
  );
}
