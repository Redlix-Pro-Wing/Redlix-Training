import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Fetch full user details including profile fields
  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
    select: {
      fullName: true,
      email: true,
      selectedRole: true,
      otherRoleText: true,
      goals: true,
      profileImage: true,
      collegeStudying: true,
      branch: true,
      year: true,
      dob: true,
      portfolioLink: true,
      linkedinLink: true,
      about: true,
      shareWithNetworking: true,
      isPremium: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Ensure default values for null fields to prevent client-side render crash
  const serializedUser = {
    fullName: user.fullName,
    email: user.email,
    selectedRole: user.selectedRole,
    otherRoleText: user.otherRoleText || "",
    goals: user.goals,
    profileImage: user.profileImage || "",
    collegeStudying: user.collegeStudying || "",
    branch: user.branch || "",
    year: user.year || "",
    dob: user.dob || "",
    portfolioLink: user.portfolioLink || "",
    linkedinLink: user.linkedinLink || "",
    about: user.about || "",
    shareWithNetworking: user.shareWithNetworking ?? false,
    isPremium: user.isPremium ?? false,
  };

  return <ProfileContent user={serializedUser} />;
}
