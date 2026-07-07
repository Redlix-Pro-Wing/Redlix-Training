import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Authenticate the current user
    const adminUser = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Session is invalid." },
        { status: 401 }
      );
    }

    // Strict Admin Authorization
    if (adminUser.email.trim().toLowerCase() !== "webstrixx@gmail.com") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { userId } = await params;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // Toggle premium status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: !targetUser.isPremium,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isPremium: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated premium status for ${updatedUser.fullName}.`,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Toggle premium error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
