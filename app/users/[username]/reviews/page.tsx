import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserByUsername } from "@/lib/actions/users";
import { getUserReviews } from "@/lib/actions/reviews";
import { UserReviewsPage } from "@/components/user-reviews-page";

interface UserReviewsPageProps {
  params: {
    username: string;
  };
  searchParams: {
    sort?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: UserReviewsPageProps) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    return {
      title: "User Not Found",
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

export default async function UserReviews({ params, searchParams }: UserReviewsPageProps) {
  const { userId } = await auth();
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  // Check if the current user is viewing their own profile
  const isOwnProfile = userId === user.id;

  // Parse search params
  const sort = searchParams.sort || "newest";
  const page = parseInt(searchParams.page || "1", 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  // Get user reviews with pagination and sorting
  const reviews = await getUserReviews(user.id, limit, offset, sort);

  return (
    <UserReviewsPage
      user={user}
      reviews={reviews}
      isOwnProfile={isOwnProfile}
      currentSort={sort}
      currentPage={page}
    />
  );
}
