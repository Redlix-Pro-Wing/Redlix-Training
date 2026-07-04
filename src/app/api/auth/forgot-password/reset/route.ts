import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json(
        { error: "Missing required fields (email, OTP, new password)" },
        { status: 400 }
      );
    }

    // Retrieve user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Verify OTP code exists and matches
    if (!user.otpCode || user.otpCode !== otp.trim()) {
      return NextResponse.json(
        { error: "Invalid OTP verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // Verify OTP code has not expired
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return NextResponse.json(
        { error: "OTP code has expired. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = hashPassword(password);

    // Update password and clear OTP fields in a single operation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otpCode: null,
        otpExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password reset error:", err);
    return NextResponse.json(
      { error: "Failed to reset password. Please try again." },
      { status: 500 }
    );
  }
}
