import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emoji } = await req.json();

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // reactions is parsed as a JSON object: { [userId]: { emoji, fullName } }
    let currentReactions: any = message.reactions || {};
    if (typeof currentReactions === "string") {
      try {
        currentReactions = JSON.parse(currentReactions);
      } catch {
        currentReactions = {};
      }
    }

    if (!emoji) {
      // Remove user reaction if no emoji is provided
      delete currentReactions[user.id];
    } else {
      // Add or update user reaction
      currentReactions[user.id] = {
        emoji,
        fullName: user.fullName,
      };
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        reactions: currentReactions,
      },
    });

    return NextResponse.json({ message: updatedMessage });
  } catch (err: any) {
    console.error("React message error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
