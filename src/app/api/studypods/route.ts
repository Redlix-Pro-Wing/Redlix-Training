import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const studyPods = await prisma.studyPod.findMany({
      orderBy: { createdAt: "desc" },
    });

    const creatorIds = Array.from(new Set(studyPods.map((pod) => pod.creatorId)));
    const users = await prisma.user.findMany({
      where: { id: { in: creatorIds } },
      select: {
        id: true,
        profileImage: true,
        selectedRole: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const populatedPods = studyPods.map((pod) => {
      const creatorInfo = userMap.get(pod.creatorId);
      return {
        ...pod,
        creatorImage: creatorInfo?.profileImage || null,
        creatorRole: creatorInfo?.selectedRole || null,
      };
    });

    return NextResponse.json({ success: true, studyPods: populatedPods });
  } catch (err) {
    console.error("Fetch study pods error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Session is invalid." },
        { status: 401 }
      );
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Study Pod name is required." },
        { status: 400 }
      );
    }

    // Limit free users to exactly 1 Study Pod creation
    if (!user.isPremium) {
      const existingPodsCount = await prisma.studyPod.count({
        where: { creatorId: user.id },
      });

      if (existingPodsCount >= 1) {
        return NextResponse.json(
          { error: "Free tier users are limited to creating exactly 1 Study Pod. Upgrade to Premium for unlimited pods." },
          { status: 403 }
        );
      }
    }

    const studyPod = await prisma.studyPod.create({
      data: {
        name: name.trim(),
        creatorId: user.id,
        creatorName: user.fullName,
      },
    });

    return NextResponse.json({ success: true, studyPod });
  } catch (err) {
    console.error("Create study pod error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
