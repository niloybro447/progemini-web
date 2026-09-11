import { config } from "@/config";
import { logger } from "@/utils/logger";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://progemini.academy";
const SMTP_FROM = process.env.SMTP_FROM || "Progemini Academy <noreply@progemini.academy>";

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!config.resendApiKey) {
    logger.info({ email, verifyUrl }, "DEV MODE — Verification email not sent (no RESEND_API_KEY)");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(config.resendApiKey);

  await resend.emails.send({
    from: SMTP_FROM,
    to: email,
    subject: "Verify your email address",
    html: `<p>Hi ${name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string,
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  if (!config.resendApiKey) {
    logger.info({ email, resetUrl }, "DEV MODE — Password reset email not sent (no RESEND_API_KEY)");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(config.resendApiKey);

  await resend.emails.send({
    from: SMTP_FROM,
    to: email,
    subject: "Reset your password",
    html: `<p>Hi ${name},</p><p>Click <a href="${resetUrl}">this link</a> to reset your password.</p>`,
  });
}

export async function sendApplicationSubmissionEmail(application: Record<string, unknown>) {
  if (!config.resendApiKey) {
    logger.info({ applicationId: application.id }, "DEV MODE — Application submission email not sent (no RESEND_API_KEY)");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(config.resendApiKey);

  const course = application.course as { title?: string } | undefined;
  const user = application.user as { id?: string; name?: string; email?: string } | undefined;
  const files = (application.files as Array<{ originalName?: string; fileName?: string; fullUrl?: string; fileSize?: number }>) || [];
  const adminReviewUrl = `${APP_URL}/admin/applications/${application.id}`;

  let documentsHtml = '<p style="margin: 0; color: #6b7280; font-style: italic;">No documents uploaded.</p>';
  if (files.length > 0) {
    documentsHtml = '<ul style="margin: 0; padding-left: 20px; color: #4b5563;">';
    for (const file of files) {
      const sizeStr = file.fileSize ? ` (${(file.fileSize / 1024).toFixed(1)} KB)` : "";
      documentsHtml += `<li style="margin-bottom: 5px;"><a href="${file.fullUrl || "#"}" target="_blank" style="color: #e11d48; text-decoration: underline;">${file.originalName || file.fileName}</a>${sizeStr}</li>`;
    }
    documentsHtml += "</ul>";
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px;">
        <h2 style="color: #111827; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">New Course Application</h2>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Submitted on ${new Date(application.createdAt as string).toLocaleDateString()}</p>
      </div>
      <div style="margin-bottom: 25px;">
        <p style="margin: 0; font-size: 16px; line-height: 1.5;">A new student application has been submitted for <strong>${course?.title || "Unknown Course"}</strong>.</p>
      </div>
      <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Applicant Personal Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563; width: 30%;">Full Name</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.firstName} ${application.lastName}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Email Address</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;"><a href="mailto:${application.email}" style="color: #e11d48; text-decoration: none;">${application.email}</a></td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Phone Number</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.phone}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Date of Birth</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.dateOfBirth}</td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Gender / Nationality</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.gender} / ${application.nationality}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Address</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.address}, ${application.city}, ${application.state} ${application.zipCode}, ${application.country}</td></tr>
      </table>
      <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Academic & Professional Information</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563; width: 30%;">Highest Education</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.highestEducation}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Institution Name</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.institutionName}</td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Field of Study</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.fieldOfStudy}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Graduation Year</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.graduationYear}</td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">GPA / Result</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.gpa || "N/A"}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">English Proficiency</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.englishProficiency}</td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Previous Courses</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.previousCourses || "None"}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Work Experience</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${application.workExperience || "None"}</td></tr>
      </table>
      ${user ? `<h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Applicant Account Info</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563; width: 30%;">User ID</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-family: monospace;">${user.id}</td></tr>
        <tr><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Registered Name</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${user.name}</td></tr>
        <tr style="background-color: #f9fafb;"><td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: 600; color: #4b5563;">Registered Email</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827;">${user.email}</td></tr>
      </table>` : ""}
      <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-top: 30px; margin-bottom: 12px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Uploaded Documents</h3>
      <div style="padding: 15px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">${documentsHtml}</div>
      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 25px;">
        <a href="${adminReviewUrl}" style="background-color: #e11d48; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px; box-shadow: 0 2px 4px rgba(225,29,72,0.2);">Review in Admin Panel</a>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: SMTP_FROM,
      to: "registry@progemini.academy",
      subject: `New Application: ${application.firstName} ${application.lastName} - ${course?.title || "Course"}`,
      html,
    });
    logger.info({ applicationId: application.id }, "Application submission email sent");
  } catch (err) {
    logger.error({ err, applicationId: application.id }, "Failed to send application submission email");
  }
}

export async function sendApplicationApprovedEmail(
  email: string,
  name: string,
  courseTitle: string,
  adminFeedback?: string | null,
): Promise<void> {
  const loginUrl = `${APP_URL}/login`;

  if (!config.resendApiKey) {
    logger.info({ email, courseTitle }, "DEV MODE — Application approval email not sent (no RESEND_API_KEY)");
    return;
  }

  const { Resend } = await import("resend");
  const resend = new Resend(config.resendApiKey);

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #f3f4f6; padding-bottom: 20px;">
        <h2 style="color: #d7263d; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Application Approved!</h2>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">ProGemini Academy</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Hello ${name},</p>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Congratulations! Your application for the course <strong>${courseTitle}</strong> has been approved by the admissions committee.</p>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">We are thrilled to welcome you and support you along your educational journey.</p>
      </div>
      ${adminFeedback ? `<div style="margin: 25px 0; padding: 20px; background-color: #fdf2f2; border-left: 4px solid #d7263d; border-radius: 6px;"><strong style="color: #7f1d1d; font-size: 15px;">Admissions Feedback:</strong><p style="margin: 8px 0 0 0; color: #9b1c1c; font-size: 14px; font-style: italic; line-height: 1.5;">${adminFeedback}</p></div>` : ""}
      <div style="margin-bottom: 30px;"><p style="font-size: 15px; line-height: 1.5; color: #4b5563; margin: 0;">You can now log in to your dashboard to access your course panel, view materials, and get started.</p></div>
      <div style="text-align: center; margin: 30px 0;"><a href="${loginUrl}" style="background-color: #d7263d; color: white; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; font-size: 15px; box-shadow: 0 2px 4px rgba(215,38,61,0.2);">Go to Dashboard</a></div>
      <p style="font-size: 13px; color: #6b7280; line-height: 1.4; margin-top: 30px;">If the button doesn't work, you can copy and paste the following link into your browser:</p>
      <p style="font-size: 13px; word-break: break-all; margin: 5px 0 0 0;"><a href="${loginUrl}" style="color: #d7263d; text-decoration: underline;">${loginUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">This is an automated notification from ProGemini Academy. Please do not reply directly to this email.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: SMTP_FROM,
      to: email,
      subject: `Application Approved: ${courseTitle}`,
      html,
    });
    logger.info({ email, courseTitle }, "Application approval email sent");
  } catch (err) {
    logger.error({ err, email, courseTitle }, "Failed to send application approval email");
  }
}
