import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/actions/users";
import { ProfileEditPage } from "@/components/profile-edit-page";

export async function generateMetadata() {
  return {
    title: "Edit Profile - Gunpla Sekai",
    description: "Edit your profile information and settings",
  };
}

export default async function ProfileEdit() {
  const { userId } = await auth();
  console.log("userId", userId);
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getUserById(userId);

  if (!user) {
    redirect("/sign-in");
  }

  return <ProfileEditPage user={user} />;
}
