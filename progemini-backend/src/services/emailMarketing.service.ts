import { EmailCampaignStatus, EmailCampaignType } from "@prisma/client";

export type EmailProviderType = 'resend';

export interface SenderOption {
    email: string;
    name: string;
    role?: string;
    description?: string;
}

export const SENDER_OPTIONS: SenderOption[] = [
    {
        email: 'info@progemini.academy',
        name: 'Progemini Academy',
        role: 'Official Academy Mailbox',
        description: 'General announcements, newsletters, institutional updates',
    },
    {
        email: 'evlyn.chahine@progemini.academy',
        name: 'Evlyn Chahine',
        role: 'Academic & Admissions Leadership',
        description: 'Personalized admissions outreach, partnerships, academic updates',
    },
    {
        email: 'mohsin.dulal@progemini.academy',
        name: 'Mohsin',
        role: 'Executive & Student Relations',
        description: 'Direct student correspondence, student advisory, program queries',
    },
    {
        email: 'noreply@progemini.academy',
        name: 'Progemini Notifications',
        role: 'Automated Broadcasts & Notifications',
        description: 'System alerts, broadcast updates, and transactional newsletters',
    },
];

export const DEFAULT_SENDER = SENDER_OPTIONS[0];

export interface ContactItem {
    id?: string;
    email: string;
    name?: string;
    institution_name?: string;
    schoolName?: string;
    phone?: string;
    address?: string;
    role?: string;
    [key: string]: unknown;
}

export interface ContactList {
    id: string;
    name: string;
    description?: string | null;
    tags: string[];
    customColumns: string[];
    contacts?: ContactItem[];
    contactCount?: number;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface EmailLogEntry {
    id: string;
    campaignId: string;
    recipient: string;
    customData?: Record<string, unknown>;
    status: string;
    error?: string | null;
    openCount: number;
    clickedUrls: string[];
    openedAt?: string | Date | null;
    clickedAt?: string | Date | null;
    sentAt: string | Date;
}

export interface CampaignRecord {
    id: string;
    name: string;
    type: EmailCampaignType;
    fromEmail: string;
    fromName?: string | null;
    subject: string;
    htmlBody: string;
    plainText?: string | null;
    delaySeconds: number;
    batchSize: number;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    openCount: number;
    clickCount: number;
    bounceCount: number;
    spamCount: number;
    status: EmailCampaignStatus;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface SpamAnalysis {
    score: number; // 0 - 100 (100 = cleanest)
    warnings: string[];
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
}

export const PRESET_TEMPLATES = [
    {
        id: 'course-announcement',
        name: 'New Course & Program Announcement',
        type: 'COURSE_ANNOUNCEMENT' as EmailCampaignType,
        subject: '🚀 Discover Our New Program: Advance Your Career with Progemini Academy',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progemini Academy Course Announcement</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="background-color: #0f2b48; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Progemini Academy</h1>
        <p style="color: #93c5fd; font-size: 14px; margin: 8px 0 0 0;">Empowering Modern Learners Worldwide</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 36px 32px;">
        <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear <strong>{{name}}</strong>,</p>
        
        <p style="font-size: 15px; color: #334155;">
          We are thrilled to announce new admissions and expanded curriculum opportunities at <strong>Progemini Academy</strong>. Whether you are aiming to enhance your technical capabilities, gain certified credentials, or advance into executive management, our accredited courses are designed to accelerate your journey.
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 18px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #166534;">✨ What you will gain with Progemini:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #14532d; line-height: 1.7;">
            <li>Industry-recognized certifications and British/International curriculum standards</li>
            <li>Interactive live sessions led by world-class academic instructors</li>
            <li>Hands-on practical projects, quizzes, and continuous mentor evaluations</li>
            <li>Flexible learning schedules tailored for active professionals and students</li>
          </ul>
        </div>

        <p style="font-size: 15px; color: #334155;">
          Admissions for the upcoming term are now open. Seats in high-demand specializations are allocated on a first-come, first-served basis.
        </p>

        <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: #0f2b48;">
              <a href="https://progemini.academy/courses" target="_blank" style="font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block;">
                Explore Courses & Apply Now →
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #64748b; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          Have questions or need guidance on selecting the right track? Reply directly to this email or speak with our academic counselors.
        </p>

        <p style="font-size: 15px; color: #334155; margin-bottom: 2px;">Warm regards,</p>
        <p style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 2px;">Academic Admissions Team</p>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Progemini Academy<br>
        <a href="https://progemini.academy" style="color: #2563eb; text-decoration: none;">www.progemini.academy</a></p>
      </td>
    </tr>
    <tr>
      <td style="padding: 18px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        © 2026 Progemini Academy. All rights reserved. | <a href="mailto:info@progemini.academy?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    {
        id: 'student-update',
        name: 'Student Portal & Learning Update',
        type: 'STUDENT_UPDATE' as EmailCampaignType,
        subject: '📚 Important Update: New Learning Resources & Schedule on Progemini',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progemini Student Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 24px; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="background-color: #0f2b48; padding: 28px 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 700;">Progemini Student Community</h1>
        <p style="color: #93c5fd; font-size: 13px; margin: 6px 0 0 0;">Academic & Learning Portal News</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Hello <strong>{{name}}</strong>,</p>
        
        <p style="font-size: 15px; color: #334155;">
          We are committed to delivering the best digital learning experience. Here are several important system enhancements and upcoming sessions available in your student portal.
        </p>

        <h3 style="font-size: 16px; color: #0f172a; margin-top: 24px; margin-bottom: 8px;">📌 Key Highlights:</h3>
        <ul style="padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.7;">
          <li><strong>Updated Lecture Materials:</strong> Newly recorded video sessions and study notes are uploaded.</li>
          <li><strong>Progress Tracking:</strong> Real-time assessment scores and module completion badges.</li>
          <li><strong>Mentor Office Hours:</strong> Book 1-on-1 virtual sessions with faculty members directly through your dashboard.</li>
        </ul>

        <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: #0f2b48;">
              <a href="https://progemini.academy/login" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                Access Student Portal
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #64748b; margin-top: 24px;">
          Best of luck with your continuous studies!
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Progemini Academy © 2026. | <a href="mailto:info@progemini.academy?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
      </td>
    </tr>
  </table>
</body>
</html>`
    },
    {
        id: 'academic-outreach',
        name: 'Partner Institution & Academic Outreach',
        type: 'OUTREACH' as EmailCampaignType,
        subject: 'Academic Collaboration & Training Opportunities at {{institution_name}}',
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progemini Academic Collaboration</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; line-height: 1.6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
    <tr>
      <td style="padding: 32px 32px 24px 32px;">
        <p style="font-size: 16px; margin-top: 0; color: #0f172a;">Dear {{name}},</p>
        
        <p style="font-size: 15px; color: #334155;">
          I hope you are having a productive week at <strong>{{institution_name}}</strong>{{#address}} ({{address}}){{/address}}.
        </p>
        
        <p style="font-size: 15px; color: #334155;">
          At <strong>Progemini Academy</strong>, we collaborate with premier academic institutions, educators, and enterprise partners to deliver accredited professional development, digital skills certifications, and transnational learning programs.
        </p>

        <div style="background-color: #f1f5f9; border-left: 4px solid #0f2b48; padding: 16px; border-radius: 6px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">Collaboration opportunities for {{institution_name}}:</p>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569;">
            <li style="margin-bottom: 4px;">Institutional curriculum enrichment & co-branded certificates</li>
            <li style="margin-bottom: 4px;">Direct student access to global faculty and industry mentors</li>
            <li style="margin-bottom: 4px;">Flexible hybrid or fully digital delivery frameworks</li>
          </ul>
        </div>

        <p style="font-size: 15px; color: #334155;">
          Would you be open to a brief 10-minute introductory discussion this week to explore how we can support your students and faculty?
        </p>

        <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
          <tr>
            <td align="center" style="border-radius: 8px; background-color: #0f2b48;">
              <a href="https://progemini.academy/contact" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block;">
                Schedule an Introduction
              </a>
            </td>
          </tr>
        </table>

        <p style="font-size: 15px; color: #334155; margin-bottom: 4px;">Warm regards,</p>
        <p style="font-size: 15px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 2px;">Evlyn Chahine</p>
        <p style="font-size: 13px; color: #64748b; margin: 0;">Academic Director | Progemini Academy<br>
        <a href="https://progemini.academy" style="color: #2563eb; text-decoration: none;">www.progemini.academy</a> | <a href="mailto:evlyn.chahine@progemini.academy" style="color: #2563eb; text-decoration: none;">evlyn.chahine@progemini.academy</a></p>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        If you would prefer not to receive educational partnership updates, <a href="mailto:info@progemini.academy?subject=Unsubscribe" style="color: #64748b; text-decoration: underline;">click here to opt out</a>.
      </td>
    </tr>
  </table>
</body>
</html>`
    }
];

/**
 * Replaces {{variable}} placeholders in HTML or text
 */
export function interpolateVariables(template: string, data: Record<string, unknown>): string {
    if (!template) return '';

    let output = template;

    // Support simple condition block {{#key}}...{{/key}}
    output = output.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, content) => {
        const val = data[key];
        return val ? content : '';
    });

    // Support variable interpolation {{key}}
    output = output.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const val = data[key];
        if (val !== undefined && val !== null) {
            return String(val);
        }
        return '';
    });

    return output;
}

/**
 * Converts rich HTML content into a plain-text fallback
 */
export function htmlToPlainText(html: string): string {
    if (!html) return '';
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<br\s*[\/]?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<\/li>/gi, '\n')
        .replace(/<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>(.*?)<\/a>/gi, '$3 ($2)')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Embeds tracking pixel and transforms link anchors with click tracking
 */
export function processEmailHtmlForTracking(
    html: string,
    opts: {
        baseUrl: string;
        trackingId: string;
        campaignId: string;
        recipientEmail: string;
    }
): string {
    if (!html) return '';

    let cleanBaseUrl = (opts.baseUrl || 'https://progemini.academy').replace(/\/+$/, '');

    // 1. Rewrite <a href="..."> links for click tracking (excluding mailto, tel, anchors)
    let processedHtml = html.replace(
        /<a\s+([^>]*?)href=(["'])(https?:\/\/[^"'>]+)\2([^>]*)>/gi,
        (match, prefix, _quote, originalUrl, suffix) => {
            if (originalUrl.includes('/api/admin/email/track')) {
                return match;
            }
            const trackUrl = `${cleanBaseUrl}/api/admin/email/track?tid=${encodeURIComponent(
                opts.trackingId
            )}&cid=${encodeURIComponent(opts.campaignId)}&url=${encodeURIComponent(
                originalUrl
            )}`;
            return `<a ${prefix}href="${trackUrl}"${suffix}>`;
        }
    );

    // 2. Inject 1x1 tracking pixel before </body>
    const pixelTag = `<img src="${cleanBaseUrl}/api/admin/email/track?tid=${encodeURIComponent(
        opts.trackingId
    )}&cid=${encodeURIComponent(
        opts.campaignId
    )}&type=open" alt="" width="1" height="1" border="0" style="height:1px!important;width:1px!important;border-width:0!important;margin-top:0!important;margin-bottom:0!important;margin-right:0!important;margin-left:0!important;padding-top:0!important;padding-bottom:0!important;padding-right:0!important;padding-left:0!important;display:block!important;outline:none!important;" />`;

    if (processedHtml.includes('</body>')) {
        processedHtml = processedHtml.replace('</body>', `${pixelTag}</body>`);
    } else {
        processedHtml += pixelTag;
    }

    return processedHtml;
}

/**
 * Analyze subject and email body for spam trigger words and best practice patterns
 */
export function analyzeEmailSpamScore(subject: string, html: string): SpamAnalysis {
    let score = 100;
    const warnings: string[] = [];

    const SPAM_WORDS = [
        '100% free', 'make money', 'fast cash', 'guaranteed', 'risk free',
        'no catch', 'click here now', 'urgent', 'winner', 'claim now',
        'act now', 'buy direct', 'congratulations', 'viagra', 'credit card',
        'crypto', 'earn $$$', 'unlimited income', 'risk-free'
    ];

    const lowerSubject = (subject || '').toLowerCase();
    const lowerBody = (html || '').toLowerCase();

    // Check spam words in subject
    SPAM_WORDS.forEach((word) => {
        if (lowerSubject.includes(word)) {
            score -= 15;
            warnings.push(`Spam phrase "${word}" found in subject line.`);
        }
    });

    // Check spam words in body
    SPAM_WORDS.forEach((word) => {
        if (lowerBody.includes(word)) {
            score -= 6;
            warnings.push(`Spam phrase "${word}" found in body content.`);
        }
    });

    // Check ALL CAPS in subject
    const subjectChars = (subject || '').replace(/[^a-zA-Z]/g, '');
    if (subjectChars.length > 5) {
        const uppercaseChars = subjectChars.replace(/[^A-Z]/g, '');
        if (uppercaseChars.length / subjectChars.length > 0.6) {
            score -= 20;
            warnings.push('Subject line contains too many uppercase letters (looks like shouting).');
        }
    }

    // Check excessive exclamation marks
    const exclamationCount = ((subject || '') + (html || '')).split('!').length - 1;
    if (exclamationCount > 4) {
        score -= 10;
        warnings.push('Too many exclamation marks (!) detected in email content.');
    }

    // Check for unsubscribe link
    if (!lowerBody.includes('unsubscribe') && !lowerBody.includes('opt out')) {
        score -= 15;
        warnings.push('No visible unsubscribe / opt-out link found in the email footer.');
    }

    // Check subject length
    if (subject.length < 5) {
        score -= 10;
        warnings.push('Subject line is too short.');
    } else if (subject.length > 90) {
        score -= 5;
        warnings.push('Subject line is longer than 90 characters and may get clipped on mobile devices.');
    }

    // Clamp score
    score = Math.max(10, Math.min(100, score));

    let grade: SpamAnalysis['grade'] = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 60) grade = 'C';
    else if (score >= 45) grade = 'D';

    return { score, warnings, grade };
}

/**
 * Validates an email address against RFC standards, domain syntax, and disposable domains
 */
export const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'yopmail.com',
    'trashmail.com',
    'temp-mail.org',
    'dispostable.com',
    'getairmail.com',
    'throwawaymail.com',
    'fakeinbox.com',
    'mohmal.com',
    'mytemp.email',
]);

const ROLE_BASED_PREFIXES = new Set([
    'admin',
    'administrator',
    'webmaster',
    'hostmaster',
    'postmaster',
    'root',
    'security',
    'abuse',
]);

export interface EmailValidationResult {
    isValid: boolean;
    reason?: string;
    isDisposable?: boolean;
    isRoleBased?: boolean;
    domain?: string;
}

export function validateEmailAddress(email: string): EmailValidationResult {
    if (!email || typeof email !== 'string') {
        return { isValid: false, reason: 'Email is empty or not a string' };
    }

    const trimmed = email.trim().toLowerCase();

    if (trimmed.length > 254) {
        return { isValid: false, reason: 'Email exceeds maximum allowed length (254 characters)' };
    }

    // RFC 5322 standard regex validation
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(trimmed)) {
        return { isValid: false, reason: 'Invalid email syntax or format' };
    }

    const parts = trimmed.split('@');
    if (parts.length !== 2) {
        return { isValid: false, reason: 'Email must contain exactly one @ symbol' };
    }

    const [localPart, domain] = parts;

    if (localPart.length > 64) {
        return { isValid: false, reason: 'Local part exceeds 64 characters' };
    }

    // Check TLD
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    if (!tld || tld.length < 2) {
        return { isValid: false, reason: 'Invalid top-level domain (TLD)' };
    }

    const isDisposable = DISPOSABLE_DOMAINS.has(domain);
    const isRoleBased = ROLE_BASED_PREFIXES.has(localPart);

    return {
        isValid: true,
        isDisposable,
        isRoleBased,
        domain,
    };
}

export interface RecipientSanitizeResult {
    valid: Array<Record<string, unknown>>;
    duplicates: number;
    invalid: Array<{ email: string; reason: string }>;
    totalInput: number;
}

/**
 * Sanitizes an audience list by validating syntax, filtering out invalid emails, and removing duplicates
 */
export function sanitizeAndValidateRecipients(
    recipients: Array<Record<string, unknown> | string>
): RecipientSanitizeResult {
    const seenEmails = new Set<string>();
    const valid: Array<Record<string, unknown>> = [];
    const invalid: Array<{ email: string; reason: string }> = [];
    let duplicates = 0;

    for (const item of recipients) {
        const emailStr =
            typeof item === 'string' ? item : item && item.email ? String(item.email) : '';
        const cleanEmail = emailStr.trim().toLowerCase();

        if (!cleanEmail) {
            invalid.push({ email: '(empty)', reason: 'Email is missing' });
            continue;
        }

        const check = validateEmailAddress(cleanEmail);
        if (!check.isValid) {
            invalid.push({ email: cleanEmail, reason: check.reason || 'Invalid format' });
            continue;
        }

        if (seenEmails.has(cleanEmail)) {
            duplicates++;
            continue;
        }

        seenEmails.add(cleanEmail);

        if (typeof item === 'string') {
            valid.push({ email: cleanEmail });
        } else {
            valid.push({
                ...item,
                email: cleanEmail,
            });
        }
    }

    return {
        valid,
        duplicates,
        invalid,
        totalInput: recipients.length,
    };
}
