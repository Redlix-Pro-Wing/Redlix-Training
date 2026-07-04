import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, selectedRole, otherRoleText, goals } = await req.json();

    if (!email || !password || !fullName || !selectedRole) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        selectedRole,
        otherRoleText: otherRoleText || null,
        goals: goals || [],
      },
    });

    // Send Welcome Email in the background to avoid blocking signup response
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"Redlix Training Academy" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Welcome to Redlix Training Academy! 🚀",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">Redlix Training Academy</h1>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Elevate Your Technical Expertise</p>
            </div>
            
            <p style="font-size: 16px; color: #1e293b; line-height: 1.6; margin-bottom: 20px;">Hello <strong>${fullName}</strong>,</p>
            
            <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Welcome to the <strong>Redlix Training Academy</strong>! We are absolutely thrilled to have you join our learning community. Your account has been successfully created.
            </p>

            <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 6px; margin: 25px 0;">
              <h3 style="margin-top: 0; margin-bottom: 10px; color: #1e293b; font-size: 14px;">Your Account Profile:</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
                <li><strong>Registered Email:</strong> ${email}</li>
                <li><strong>Role Track:</strong> ${selectedRole === "other" ? (otherRoleText || "Other") : selectedRole}</li>
              </ul>
            </div>

            <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 25px;">
              Now that you're in, you have full access to our curated engineering resources, video academy lectures, and database training sandbox configurations. Head over to your dashboard to get started!
            </p>

            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06);">
                Go to Training Dashboard
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.6; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              Need help? Feel free to reply to this email or contact support. Happy coding!
            </p>
            
            <p style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
              &mdash; The Redlix Training Team
            </p>
          </div>
        `,
      };

      // Deliver in the background to avoid blocking user signup
      transporter.sendMail(mailOptions).catch(err => {
        console.error("Failed to send welcome email in background:", err);
      });
    } catch (mailErr) {
      console.error("Welcome email transporter initialization error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
