import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import LearnersContent from "./LearnersContent";

export default async function AdminPanelPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  // Fetch full details of the current logged-in user
  const adminUser = await prisma.user.findUnique({
    where: { id: sessionToken },
    select: {
      fullName: true,
      email: true,
      profileImage: true,
    },
  });

  // Strict Server-Side Access Control: Check if logged-in user is adminUser and email is webstrixx@gmail.com
  if (!adminUser || adminUser.email.trim().toLowerCase() !== "webstrixx@gmail.com") {
    redirect("/dashboard");
  }

  // Retrieve all registered users to show in the table with all profile columns
  const allUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      fullName: true,
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
      isPremium: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Retrieve all payment requests
  const paymentRequests = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Convert Date objects to strings/JSON compatible dates for client component serialization
  const serializedUsers = allUsers.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  const serializedRequests = paymentRequests.map((req) => ({
    ...req,
    createdAt: req.createdAt.toISOString(),
    updatedAt: req.updatedAt.toISOString(),
  }));

  return (
    <LearnersContent
      adminUser={adminUser}
      allUsers={serializedUsers}
      paymentRequests={serializedRequests}
    />
  );
}
