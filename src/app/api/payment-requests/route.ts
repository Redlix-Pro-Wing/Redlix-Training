import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

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

    const { plan, referenceNo, name, utrNo } = await req.json();

    if (!plan || !referenceNo || !name || !utrNo) {
      return NextResponse.json(
        { error: "All payment details (Plan, Reference Number, Name, UTR Number) are required." },
        { status: 400 }
      );
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        plan: plan.toUpperCase(),
        referenceNo: referenceNo.trim(),
        name: name.trim(),
        utrNo: utrNo.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, paymentRequest });
  } catch (err) {
    console.error("Create payment request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
