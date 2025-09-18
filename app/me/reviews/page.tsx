import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById, getUserByUsername } from "@/lib/actions/users";
import { getUserReviews } from "@/lib/actions/reviews";
import { UserReviewsPage } from "@/components/user-reviews-page";

interface MeReviewsPageProps {
  searchParams: {
    sort?: string;
    page?: string;
  };
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

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  return {
    title: `${displayName}'s Reviews - Gunpla Sekai`,
    description: `Read all of ${displayName}'s Gunpla kit reviews and ratings on Gunpla Sekai`,
  };
}

export default async function MeReviewsPage({ searchParams }: MeReviewsPageProps) {
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
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get user reviews with pagination and sorting
  const reviews = await getUserReviews(userProfileData.id, limit, offset, sort);

  return (
    <UserReviewsPage
      user={userProfileData}
      reviews={reviews}
      isOwnProfile={true}
      currentSort={sort}
      currentPage={page}
    />
  );
}
