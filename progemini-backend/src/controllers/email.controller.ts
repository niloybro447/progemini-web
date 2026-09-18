import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/ApiError";
import { dispatchSingleEmail, sleep } from "@/services/emailSender.service";
import { analyzeEmailSpamScore } from "@/services/emailMarketing.service";
import { EmailCampaignStatus, EmailCampaignType } from "@prisma/client";

const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

// ─── Campaigns ───────────────────────────────────────────
export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;

  if (id && typeof id === "string") {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { sentAt: "desc" },
          take: 1000,
        },
      },
    });

    if (!campaign) {
      throw AppError.notFound("Campaign not found");
    }

    res.json({ success: true, campaign, logs: campaign.logs });
    return;
  }

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, campaigns });
});

export const saveCampaign = asyncHandler(async (req: Request, res: Response) => {
  const {
    id,
    name = `Draft Campaign - ${new Date().toLocaleDateString()}`,
    type = "NEWSLETTER",
    fromEmail = "info@progemini.academy",
    fromName = "Progemini Academy",
    subject = "",
    htmlBody = "",
    plainText,
    delaySeconds = 3,
    batchSize = 10,
    totalRecipients = 0,
    status = "DRAFT",
  } = req.body;

  let campaign;

  if (id) {
    campaign = await prisma.emailCampaign.update({
      where: { id },
      data: {
        name,
        type: type as EmailCampaignType,
        fromEmail,
        fromName,
        subject,
        htmlBody,
        plainText,
        delaySeconds: Number(delaySeconds),
        batchSize: Number(batchSize),
        totalRecipients: Number(totalRecipients),
        status: status as EmailCampaignStatus,
      },
    });
  } else {
    campaign = await prisma.emailCampaign.create({
      data: {
        name,
        type: type as EmailCampaignType,
        fromEmail,
        fromName,
        subject,
        htmlBody,
        plainText,
        delaySeconds: Number(delaySeconds),
        batchSize: Number(batchSize),
        totalRecipients: Number(totalRecipients),
        status: status as EmailCampaignStatus,
      },
    });
  }

  res.json({ success: true, campaign });
});

export const patchCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id, action } = req.body;
  if (!id) {
    throw AppError.badRequest("Campaign ID is required");
  }

  let newStatus: EmailCampaignStatus = EmailCampaignStatus.CANCELLED;
  if (action === "cancel") {
    newStatus = EmailCampaignStatus.CANCELLED;
  } else if (action === "pause") {
    newStatus = EmailCampaignStatus.PAUSED;
  } else if (action === "resume") {
    newStatus = EmailCampaignStatus.SENDING;
  }

  const campaign = await prisma.emailCampaign.update({
    where: { id },
    data: { status: newStatus },
  });

  res.json({ success: true, campaign });
});

export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Campaign ID is required");
  }

  await prisma.emailCampaign.delete({
    where: { id },
  });

  res.json({ success: true, message: "Campaign deleted successfully" });
});

// ─── Contacts ────────────────────────────────────────────
export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;

  if (id && typeof id === "string") {
    const list = await prisma.emailContactList.findUnique({
      where: { id },
    });

    if (!list) {
      throw AppError.notFound("Contact list not found");
    }

    res.json({ success: true, list });
    return;
  }

  const lists = await prisma.emailContactList.findMany({
    orderBy: { createdAt: "desc" },
  });

  const formattedLists = lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    tags: l.tags,
    customColumns: l.customColumns,
    contactCount: Array.isArray(l.contacts) ? l.contacts.length : 0,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }));

  res.json({ success: true, lists: formattedLists });
});

export const saveContacts = asyncHandler(async (req: Request, res: Response) => {
  const { id, name, description, tags = [], customColumns = [], contacts = [] } = req.body;

  if (!name || !name.trim()) {
    throw AppError.badRequest("List name is required");
  }

  let list;
  if (id) {
    list = await prisma.emailContactList.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tags,
        customColumns,
        contacts,
      },
    });
  } else {
    list = await prisma.emailContactList.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tags,
        customColumns,
        contacts,
      },
    });
  }

  res.json({ success: true, list });
});

export const deleteContacts = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    throw AppError.badRequest("Contact List ID is required");
  }

  await prisma.emailContactList.delete({
    where: { id },
  });

  res.json({ success: true, message: "Contact list deleted successfully" });
});

// ─── Send Email ──────────────────────────────────────────
export const sendEmail = asyncHandler(async (req: Request, res: Response) => {
  const {
    campaignId,
    draftId,
    fromEmail = "info@progemini.academy",
    fromName = "Progemini Academy",
    recipients = [],
    subject,
    htmlBody,
    campaignName = `Campaign - ${new Date().toLocaleDateString()}`,
    campaignType = EmailCampaignType.NEWSLETTER,
    delaySeconds = 3,
    batchSize = 10,
    isTestEmail = false,
  } = req.body;

  if (!recipients || recipients.length === 0) {
    throw AppError.badRequest("Recipient list is empty");
  }
  if (!subject || !subject.trim()) {
    throw AppError.badRequest("Subject is required");
  }
  if (!htmlBody || !htmlBody.trim()) {
    throw AppError.badRequest("Email content is required");
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://progemini.academy";

  if (isTestEmail) {
    const testRecipient = recipients[0];
    const testResult = await dispatchSingleEmail({
      item: testRecipient,
      fromEmail,
      fromName,
      subject: `[TEST] ${subject}`,
      htmlBody,
      campaignId: null,
      baseUrl,
      isTestEmail: true,
    });

    res.json({
      success: testResult.success,
      isTestEmail: true,
      result: testResult,
      message: testResult.success
        ? `Test email sent to ${typeof testRecipient === "string" ? testRecipient : testRecipient.email}`
        : `Failed to send test email: ${testResult.error}`,
    });
    return;
  }

  // Campaign creation / retrieval
  let targetCampaignId = campaignId || draftId;
  if (!targetCampaignId) {
    const created = await prisma.emailCampaign.create({
      data: {
        name: campaignName,
        type: campaignType,
        fromEmail,
        fromName,
        subject,
        htmlBody,
        delaySeconds,
        batchSize,
        totalRecipients: recipients.length,
        status: EmailCampaignStatus.SENDING,
      },
    });
    targetCampaignId = created.id;
  } else {
    await prisma.emailCampaign.update({
      where: { id: targetCampaignId },
      data: {
        status: EmailCampaignStatus.SENDING,
        totalRecipients: recipients.length,
      },
    });
  }

  // Background dispatch
  (async () => {
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((item: any) =>
          dispatchSingleEmail({
            item,
            fromEmail,
            fromName,
            subject,
            htmlBody,
            campaignId: targetCampaignId,
            baseUrl,
          })
        )
      );

      results.forEach((r) => {
        if (r.success) sentCount++;
        else failedCount++;
      });

      await prisma.emailCampaign.update({
        where: { id: targetCampaignId },
        data: { sentCount, failedCount },
      });

      if (i + batchSize < recipients.length) {
        await sleep(delaySeconds * 1000);
      }
    }

    await prisma.emailCampaign.update({
      where: { id: targetCampaignId },
      data: {
        status: failedCount === recipients.length ? EmailCampaignStatus.FAILED : EmailCampaignStatus.COMPLETED,
        sentCount,
        failedCount,
      },
    });
  })().catch(console.error);

  res.json({
    success: true,
    campaignId: targetCampaignId,
    message: `Campaign sending initiated for ${recipients.length} recipients`,
  });
});

// ─── Analytics ───────────────────────────────────────────
export const getAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  const [campaigns, logsCount] = await Promise.all([
    prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.emailLog.count(),
  ]);

  let totalSent = 0;
  let totalOpens = 0;
  let totalClicks = 0;
  let totalBounces = 0;
  let totalSpam = 0;

  const senderStats: Record<string, { sent: number; opens: number; clicks: number }> = {};

  campaigns.forEach((c) => {
    totalSent += c.sentCount || 0;
    totalOpens += c.openCount || 0;
    totalClicks += c.clickCount || 0;
    totalBounces += c.bounceCount || 0;
    totalSpam += c.spamCount || 0;

    const from = c.fromEmail || "unknown";
    if (!senderStats[from]) {
      senderStats[from] = { sent: 0, opens: 0, clicks: 0 };
    }
    senderStats[from].sent += c.sentCount || 0;
    senderStats[from].opens += c.openCount || 0;
    senderStats[from].clicks += c.clickCount || 0;
  });

  const openRate = totalSent > 0 ? `${((totalOpens / totalSent) * 100).toFixed(1)}%` : "0.0%";
  const clickRate = totalSent > 0 ? `${((totalClicks / totalSent) * 100).toFixed(1)}%` : "0.0%";
  const bounceRate = totalSent > 0 ? `${((totalBounces / totalSent) * 100).toFixed(1)}%` : "0.0%";
  const spamRate = totalSent > 0 ? `${((totalSpam / totalSent) * 100).toFixed(2)}%` : "0.00%";

  res.json({
    success: true,
    analytics: {
      totalCampaigns: campaigns.length,
      totalSent,
      totalOpens,
      totalClicks,
      totalBounces,
      totalSpam,
      openRate,
      clickRate,
      bounceRate,
      spamRate,
      senderBreakdown: senderStats,
      totalLogs: logsCount,
    },
    recentCampaigns: campaigns.slice(0, 8),
  });
});

// ─── Analyze HTML ────────────────────────────────────────
export const analyzeContent = asyncHandler(async (req: Request, res: Response) => {
  const { html = "", subject = "" } = req.body;
  const analysis = analyzeEmailSpamScore(subject, html);
  res.json({ success: true, analysis });
});

// ─── Tracking (Pixel & Click) ────────────────────────────
export const trackEmail = asyncHandler(async (req: Request, res: Response) => {
  const { tid: trackingId, cid: campaignId, type, url: targetUrl } = req.query as Record<string, string | undefined>;

  if (type === "open" || !targetUrl) {
    if (trackingId && campaignId) {
      (async () => {
        try {
          const log = await prisma.emailLog.findUnique({ where: { id: trackingId } });
          if (log) {
            const isFirstOpen = log.openCount === 0;
            await prisma.emailLog.update({
              where: { id: trackingId },
              data: {
                openCount: { increment: 1 },
                openedAt: log.openedAt || new Date(),
              },
            });
            if (isFirstOpen) {
              await prisma.emailCampaign.update({
                where: { id: campaignId },
                data: { openCount: { increment: 1 } },
              });
            }
          }
        } catch (err) {
          console.error("Tracking pixel log error:", err);
        }
      })();
    }

    res.writeHead(200, {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.end(TRANSPARENT_GIF_BUFFER);
    return;
  }

  if (targetUrl) {
    if (trackingId && campaignId) {
      (async () => {
        try {
          const log = await prisma.emailLog.findUnique({ where: { id: trackingId } });
          if (log) {
            const isFirstClick = log.clickedUrls.length === 0;
            const isFirstOpen = log.openCount === 0;
            const updatedUrls = [...log.clickedUrls, targetUrl];

            await prisma.emailLog.update({
              where: { id: trackingId },
              data: {
                clickedUrls: updatedUrls,
                clickedAt: log.clickedAt || new Date(),
                openCount: isFirstOpen ? 1 : log.openCount,
                openedAt: log.openedAt || new Date(),
              },
            });

            if (isFirstClick) {
              await prisma.emailCampaign.update({
                where: { id: campaignId },
                data: {
                  clickCount: { increment: 1 },
                  ...(isFirstOpen ? { openCount: { increment: 1 } } : {}),
                },
              });
            }
          }
        } catch (err) {
          console.error("Click tracking log error:", err);
        }
      })();
    }

    try {
      const redirectUrl = new URL(targetUrl);
      res.redirect(redirectUrl.toString());
    } catch {
      res.redirect("https://progemini.academy");
    }
    return;
  }

  res.status(200).send("OK");
});
