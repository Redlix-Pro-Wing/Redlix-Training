import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email address" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to user record
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiry,
      },
    });

    // Create SMTP nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kalapalarishirohan@gmail.com",
        pass: "taiqjujocbucpllm", // "taiq jujo cbuc pllm" without spaces
      },
    });

    // Email content options
    const mailOptions = {
      from: '"Redlix Training Academy" <kalapalarishirohan@gmail.com>',
      to: email,
      subject: "Your OTP Verification Code - Redlix Training",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 12px; background-color: #ffffff;">
          <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">Redlix Password Recovery</h2>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">Hello <strong>${user.fullName}</strong>,</p>
          <p style="font-size: 15px; color: #334155; line-height: 1.5;">We received a request to reset the password for your training account. Please use the following 6-digit One-Time Password (OTP) to complete your verification request:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e1b4b; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
              ${otpCode}
            </span>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">This OTP code is valid for 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
          <div style="border-top: 1px solid #e2e8f0; margin-top: 35px; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8;">
            Redlix Training Academy System &bull; Secure Password Reset
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password request error:", err);
    return NextResponse.json(
      { error: "Failed to send OTP verification email. Please try again." },
      { status: 500 }
    );
  }
}
