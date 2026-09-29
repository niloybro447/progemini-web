import { Resend } from 'resend';
import { prisma } from '@/config/prisma';
import {
    interpolateVariables,
    processEmailHtmlForTracking,
    htmlToPlainText,
    SENDER_OPTIONS,
} from './emailMarketing.service';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const resend = new Resend(resendApiKey);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface SendSingleEmailParams {
    item: { email: string; [key: string]: unknown } | string;
    fromEmail: string;
    fromName?: string;
    subject: string;
    htmlBody: string;
    campaignId?: string | null;
    baseUrl?: string;
    isTestEmail?: boolean;
}

export interface SendResult {
    email: string;
    success: boolean;
    id?: string;
    error?: string;
}

/**
 * Validates and matches fromEmail against allowed sender options
 */
export function getFormattedSender(fromEmail: string, fromName?: string): string {
    const matched = SENDER_OPTIONS.find(
        (s) => s.email.toLowerCase() === (fromEmail || '').toLowerCase()
    );

    const displayName = fromName || (matched ? matched.name : 'Progemini Academy');
    const emailAddress = matched ? matched.email : (fromEmail || 'info@progemini.academy');

    return `${displayName} <${emailAddress}>`;
}

/**
 * Dispatches a single personalized email via Resend and logs into Prisma
 */
export async function dispatchSingleEmail({
    item,
    fromEmail,
    fromName,
    subject,
    htmlBody,
    campaignId = null,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://progemini.academy',
    isTestEmail = false,
}: SendSingleEmailParams): Promise<SendResult> {
    const recipientEmail =
        typeof item === 'string' ? item.trim() : item.email ? String(item.email).trim() : '';
    const recipientData: Record<string, unknown> =
        typeof item === 'string' ? { email: recipientEmail } : item;

    if (!recipientEmail || !recipientEmail.includes('@')) {
        return {
            email: recipientEmail || 'unknown',
            success: false,
            error: 'Invalid email address',
        };
    }

    const fromHeader = getFormattedSender(fromEmail, fromName);
    const trackingId = `trk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Personalize subject and html body with custom recipient variables
    const personalizedSubject = interpolateVariables(
        subject,
        recipientData as Record<string, unknown>
    );
    const personalizedRawHtml = interpolateVariables(
        htmlBody,
        recipientData as Record<string, unknown>
    );

    // 2. Wrap links and inject tracking pixel
    const finalHtml = processEmailHtmlForTracking(personalizedRawHtml, {
        baseUrl,
        trackingId,
        campaignId: campaignId || '',
        recipientEmail,
    });

    const plainText = htmlToPlainText(personalizedRawHtml);

    try {
        const resendResponse = await resend.emails.send({
            from: fromHeader,
            to: [recipientEmail],
            replyTo: fromEmail || 'info@progemini.academy',
            subject: personalizedSubject,
            html: finalHtml,
            text: plainText,
            headers: {
                'X-Campaign-ID': campaignId || '',
                'X-Tracking-ID': trackingId,
                'List-Unsubscribe': `<mailto:${fromEmail || 'info@progemini.academy'}?subject=Unsubscribe%20${recipientEmail}>`,
            },
        });

        if (resendResponse.error) {
            throw new Error(resendResponse.error.message || 'Resend delivery failed');
        }

        // Create log entry in database if it's a real campaign dispatch
        if (!isTestEmail && campaignId) {
            try {
                await prisma.emailLog.create({
                    data: {
                        id: trackingId,
                        campaignId,
                        recipient: recipientEmail,
                        customData: recipientData as any,
                        status: 'sent',
                        openCount: 0,
                        clickedUrls: [],
                    },
                });
            } catch (dbErr) {
                console.error('Failed to log email sent in db:', dbErr);
            }
        }

        return {
            email: recipientEmail,
            success: true,
            id: resendResponse.data?.id || trackingId,
        };
    } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown Resend error';
        console.error(`Failed to send email to ${recipientEmail}:`, errorMsg);

        if (!isTestEmail && campaignId) {
            try {
                await prisma.emailLog.create({
                    data: {
                        id: trackingId,
                        campaignId,
                        recipient: recipientEmail,
                        customData: recipientData as any,
                        status: 'failed',
                        error: errorMsg,
                        openCount: 0,
                        clickedUrls: [],
                    },
                });
            } catch (dbErr) {
                console.error('Failed to log email failure in db:', dbErr);
            }
        }

        return {
            email: recipientEmail,
            success: false,
            error: errorMsg,
        };
    }
}
