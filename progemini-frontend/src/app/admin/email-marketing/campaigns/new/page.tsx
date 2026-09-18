'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Send,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Upload,
    Check,
    Loader2,
    Sparkles,
    FileSpreadsheet,
    Users,
    Mail,
    Bookmark,
    Activity,
    CheckCircle,
    X,
} from 'lucide-react';
import {
    SENDER_OPTIONS,
    DEFAULT_SENDER,
    PRESET_TEMPLATES,
    SpamAnalysis,
    ContactItem,
    ContactList,
    EmailLogEntry,
    sanitizeAndValidateRecipients,
    validateEmailAddress,
    EmailCampaignStatus,
    EmailCampaignType,
} from '@/lib/email-marketing';
import { apiClient } from '@/lib/apiClient';
import EmailTipTapEditor from '@/components/admin/email/EmailTipTapEditor';

const WIZARD_STEPS = [
    { step: 1, title: 'Sender Mailbox', desc: 'Select Progemini Sender' },
    { step: 2, title: 'Campaign Info', desc: 'Name, Type & Identity' },
    { step: 3, title: 'Throttle & Pacing', desc: 'Anti-Spam Delivery Speed' },
    { step: 4, title: 'Audience & CSV', desc: 'Recipients & Merge Tokens' },
    { step: 5, title: 'Subject & Body', desc: 'TipTap Rich Text & Spam Score' },
    { step: 6, title: 'Test & Launch', desc: 'Summary, Test & Dispatch' },
];

function WizardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftIdParam = searchParams.get('draftId');

    const [currentStep, setCurrentStep] = useState(1);
    const [draftId, setDraftId] = useState<string | null>(draftIdParam);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftFeedback, setDraftFeedback] = useState<string | null>(null);

    // Step 1: Sender Selection
    const [selectedFromEmail, setSelectedFromEmail] = useState(DEFAULT_SENDER.email);
    const [senderName, setSenderName] = useState(DEFAULT_SENDER.name);

    // Step 2: Campaign Details
    const [campaignName, setCampaignName] = useState(`Campaign - ${new Date().toLocaleDateString()}`);
    const [campaignType, setCampaignType] = useState<EmailCampaignType>(EmailCampaignType.NEWSLETTER);

    // Step 3: Time & Delay (Pacing)
    const [delaySeconds, setDelaySeconds] = useState<number>(3);
    const [batchSize, setBatchSize] = useState<number>(10);

    // Step 4: Audience & CSV with Custom Columns
    const [audienceMode, setAudienceMode] = useState<'csv' | 'saved_list' | 'manual'>('manual');
    const [manualEmailsText, setManualEmailsText] = useState('info@progemini.academy');
    const [parsedRecipients, setParsedRecipients] = useState<Array<Record<string, unknown>>>([
        {
            email: 'info@progemini.academy',
            name: 'Academic Leader',
            institution_name: 'Partner University',
            address: 'London, UK',
            phone_number: '+44 20 7946 0912',
        },
    ]);
    const [detectedColumns, setDetectedColumns] = useState<string[]>([
        'email',
        'name',
        'institution_name',
        'address',
        'phone_number',
    ]);
    const [saveAudienceAsList, setSaveAudienceAsList] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [savedLists, setSavedLists] = useState<ContactList[]>([]);
    const [selectedListId, setSelectedListId] = useState('');
    const [validationSummary, setValidationSummary] = useState<{
        total: number;
        valid: number;
        duplicates: number;
        invalid: number;
    }>({ total: 1, valid: 1, duplicates: 0, invalid: 0 });

    // Step 5: Subject & HTML Body
    const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
    const [htmlBody, setHtmlBody] = useState(PRESET_TEMPLATES[0].html);
    const [spamAnalysis, setSpamAnalysis] = useState<SpamAnalysis | null>(null);

    // Step 6: Test & Launch
    const [testEmailAddress, setTestEmailAddress] = useState('info@progemini.academy');
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isLaunching, setIsLaunching] = useState(false);
    const [launchError, setLaunchError] = useState<string | null>(null);
    const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
    const [liveProgress, setLiveProgress] = useState<{
        campaignId: string;
        status: string;
        total: number;
        sent: number;
        failed: number;
        percent: number;
        recentLogs: EmailLogEntry[];
        startedAt: number;
    } | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Load saved lists
    useEffect(() => {
        loadSavedLists();
    }, []);

    // Load draft if draftId is in URL
    useEffect(() => {
        if (draftIdParam) {
            loadDraft(draftIdParam);
        }
    }, [draftIdParam]);

    // Live Polling of Active Campaign Progress
    useEffect(() => {
        if (!activeCampaignId || !liveProgress || liveProgress.status !== 'SENDING') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const data = await apiClient.get<{ success: boolean; campaign?: any; logs?: EmailLogEntry[] }>(`/admin/email/campaigns?id=${activeCampaignId}`);
                if (data?.success && data.campaign) {
                    const camp = data.campaign;
                    const logs: EmailLogEntry[] = data.logs || [];
                    const total = Number(camp.totalRecipients) || liveProgress.total || 1;
                    const sent = Number(camp.sentCount) || 0;
                    const failed = Number(camp.failedCount) || 0;
                    const done = sent + failed;
                    const percent = Math.min(100, Math.round((done / (total || 1)) * 100));

                    setLiveProgress((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            status: camp.status,
                            total,
                            sent,
                            failed,
                            percent,
                            recentLogs: logs,
                        };
                    });

                    if (camp.status === 'COMPLETED' || camp.status === 'FAILED' || camp.status === 'CANCELLED') {
                        setIsLaunching(false);
                    }
                }
            } catch (pollErr) {
                console.error('Progress poll error:', pollErr);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [activeCampaignId, liveProgress?.status]);

    const loadDraft = async (id: string) => {
        try {
            const data = await apiClient.get<{ success: boolean; campaign?: any; logs?: EmailLogEntry[] }>(`/admin/email/campaigns?id=${id}`);
            if (data?.success && data.campaign) {
                const c = data.campaign;
                setDraftId(c.id);
                setCampaignName(c.name || '');
                setSelectedFromEmail(c.fromEmail || DEFAULT_SENDER.email);
                setSenderName(c.fromName || DEFAULT_SENDER.name);
                setCampaignType(c.type || EmailCampaignType.NEWSLETTER);
                setDelaySeconds(c.delaySeconds || 3);
                setSubject(c.subject || '');
                setHtmlBody(c.htmlBody || '');

                if (c.status === 'SENDING') {
                    setActiveCampaignId(c.id);
                    setLiveProgress({
                        campaignId: c.id,
                        status: 'SENDING',
                        total: c.totalRecipients || 1,
                        sent: c.sentCount || 0,
                        failed: c.failedCount || 0,
                        percent: Math.min(
                            100,
                            Math.round(((c.sentCount + c.failedCount) / (c.totalRecipients || 1)) * 100)
                        ),
                        recentLogs: data.logs || [],
                        startedAt: Date.now(),
                    });
                    setIsLaunching(true);
                    setCurrentStep(6);
                    setDraftFeedback('Active campaign monitoring loaded!');
                } else {
                    setCurrentStep(5);
                    setDraftFeedback('Draft loaded from database!');
                }
                setTimeout(() => setDraftFeedback(null), 3000);
            }
        } catch (err) {
            console.error('Failed to load draft:', err);
        }
    };

    const loadSavedLists = async () => {
        try {
            const data = await apiClient.get<{ success: boolean; lists?: ContactList[] }>('/admin/email/contacts');
            if (data?.success && data.lists) {
                setSavedLists(data.lists);
            }
        } catch {
            // Non-blocking
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!subject && !htmlBody) return;
            try {
                const data = await apiClient.post<{ success: boolean; analysis?: SpamAnalysis }>('/admin/email/analyze', {
                    subject,
                    html: htmlBody,
                });
                if (data?.success && data.analysis) {
                    setSpamAnalysis(data.analysis);
                }
            } catch {
                // Non-blocking
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [subject, htmlBody]);

    // Save as Draft
    const handleSaveDraft = async (targetStep?: number) => {
        setIsSavingDraft(true);
        setDraftFeedback(null);

        try {
            const idToUse = draftId || `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const data = await apiClient.post<{ success: boolean; campaign?: any }>('/admin/email/campaigns', {
                id: idToUse,
                name: campaignName,
                type: campaignType,
                fromEmail: selectedFromEmail,
                fromName: senderName,
                subject,
                htmlBody,
                delaySeconds,
                batchSize,
                totalRecipients: parsedRecipients.length,
                status: 'DRAFT',
            });

            if (data?.success) {
                setDraftId(idToUse);
                setDraftFeedback('✅ Draft saved to database!');
                setTimeout(() => setDraftFeedback(null), 3000);

                if (targetStep) {
                    setCurrentStep(targetStep);
                }
            }
        } catch (err) {
            console.error('Failed to save draft:', err);
        } finally {
            setIsSavingDraft(false);
        }
    };

    // CSV File Upload
    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r\n|\n/).filter((l) => l.trim() !== '');
            if (lines.length === 0) return;

            const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
            const cleanHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[\s-]+/g, '_'));

            setDetectedColumns(cleanHeaders);

            const emailColIndex = cleanHeaders.findIndex((h) => h.includes('email') || h.includes('mail'));

            const rawRecipients: Array<Record<string, unknown>> = [];
            const startIndex = emailColIndex !== -1 ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
                const rowObj: Record<string, unknown> = {};

                cleanHeaders.forEach((header, idx) => {
                    rowObj[header] = parts[idx] || '';
                });

                const email = emailColIndex !== -1 ? parts[emailColIndex] : parts[0];
                if (email) {
                    rowObj.email = email;
                    rawRecipients.push(rowObj);
                }
            }

            const sanitizeResult = sanitizeAndValidateRecipients(rawRecipients);
            setParsedRecipients(sanitizeResult.valid);
            setValidationSummary({
                total: sanitizeResult.totalInput,
                valid: sanitizeResult.valid.length,
                duplicates: sanitizeResult.duplicates,
                invalid: sanitizeResult.invalid.length,
            });

            if (!newListName) {
                setNewListName(file.name.replace(/\.[^/.]+$/, ''));
            }
        };
        reader.readAsText(file);
    };

    // Manual emails parser
    const handleManualEmailsChange = (text: string) => {
        setManualEmailsText(text);
        const emails = text
            .split(/[\n,;]+/)
            .map((e) => e.trim())
            .filter((e) => e.length > 0);

        const rawRecipients = emails.map((email) => ({
            email,
            name: 'Student / Partner',
            institution_name: 'Progemini Community',
            address: 'London, UK',
            phone_number: 'N/A',
        }));

        const sanitizeResult = sanitizeAndValidateRecipients(rawRecipients);
        setParsedRecipients(sanitizeResult.valid);
        setValidationSummary({
            total: sanitizeResult.totalInput,
            valid: sanitizeResult.valid.length,
            duplicates: sanitizeResult.duplicates,
            invalid: sanitizeResult.invalid.length,
        });
    };

    // Saved list selector
    const handleSelectSavedList = async (listId: string) => {
        setSelectedListId(listId);
        if (!listId) return;

        try {
            const data = await apiClient.get<{ success: boolean; list?: ContactList }>(`/admin/email/contacts?id=${listId}`);
            if (data?.success && data.list) {
                const list = data.list;
                setDetectedColumns(
                    list.customColumns && list.customColumns.length > 0
                        ? list.customColumns
                        : ['email', 'name', 'institution_name']
                );
                const sanitizeResult = sanitizeAndValidateRecipients(list.contacts || []);
                setParsedRecipients(sanitizeResult.valid);
                setValidationSummary({
                    total: sanitizeResult.totalInput,
                    valid: sanitizeResult.valid.length,
                    duplicates: sanitizeResult.duplicates,
                    invalid: sanitizeResult.invalid.length,
                });
            }
        } catch {
            // Ignore
        }
    };

    // Apply template
    const handleApplyTemplate = (tpl: (typeof PRESET_TEMPLATES)[0]) => {
        setSubject(tpl.subject);
        setHtmlBody(tpl.html);
        setCampaignType(tpl.type);
    };

    // Send Test Email
    const handleSendTest = async () => {
        if (!testEmailAddress || !testEmailAddress.includes('@')) {
            setTestResult({ success: false, message: 'Please enter a valid test email address' });
            return;
        }

        setIsSendingTest(true);
        setTestResult(null);

        try {
            const sampleRecipient = parsedRecipients[0] || {
                email: testEmailAddress,
                name: 'Progemini Tester',
                institution_name: 'Progemini Academy',
                address: 'London, UK',
                phone_number: '+44 20 7946 0912',
            };

            const data = await apiClient.post<{ success: boolean; error?: string }>('/admin/email/send', {
                fromEmail: selectedFromEmail,
                fromName: senderName,
                recipients: [{ ...sampleRecipient, email: testEmailAddress }],
                subject,
                htmlBody,
                campaignName: `[TEST] ${campaignName}`,
                campaignType,
                delaySeconds: 1,
                batchSize: 1,
                isTestEmail: true,
            });

            if (!data || !data.success) {
                throw new Error(data?.error || 'Failed to send test email');
            }

            setTestResult({
                success: true,
                message: `Test email dispatched to ${testEmailAddress} via ${selectedFromEmail} (Resend Cloud)! Check your inbox.`,
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to send test email';
            setTestResult({ success: false, message: msg });
        } finally {
            setIsSendingTest(false);
        }
    };

    // Launch Full Campaign
    const handleLaunchCampaign = async () => {
        if (parsedRecipients.length === 0) {
            setLaunchError('Please add at least one recipient.');
            return;
        }

        if (!subject.trim()) {
            setLaunchError('Subject line is required.');
            return;
        }

        if (!htmlBody.trim()) {
            setLaunchError('Email HTML content is required.');
            return;
        }

        if (saveAudienceAsList && newListName && parsedRecipients.length > 0) {
            try {
                await apiClient.post('/admin/email/contacts', {
                    name: newListName,
                    description: `Saved from campaign "${campaignName}" on ${new Date().toLocaleDateString()}`,
                    tags: [campaignType.toLowerCase()],
                    customColumns: detectedColumns,
                    contacts: parsedRecipients,
                });
            } catch {
                // Non-blocking
            }
        }

        const estMinutes = ((parsedRecipients.length * delaySeconds) / 60).toFixed(1);
        const confirmMsg = `Ready to dispatch to ${parsedRecipients.length} recipients from ${selectedFromEmail} with ${delaySeconds}s delay (~${estMinutes} mins total)?`;
        if (!window.confirm(confirmMsg)) return;

        setIsLaunching(true);
        setLaunchError(null);

        const tempCampId = draftId || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        setActiveCampaignId(tempCampId);
        setLiveProgress({
            campaignId: tempCampId,
            status: 'SENDING',
            total: parsedRecipients.length,
            sent: 0,
            failed: 0,
            percent: 0,
            recentLogs: [],
            startedAt: Date.now(),
        });

        try {
            const data = await apiClient.post<{ success: boolean; campaignId?: string; error?: string }>('/admin/email/send', {
                campaignId: tempCampId,
                draftId: draftId || undefined,
                fromEmail: selectedFromEmail,
                fromName: senderName,
                recipients: parsedRecipients,
                subject,
                htmlBody,
                campaignName,
                campaignType,
                delaySeconds,
                batchSize,
                isTestEmail: false,
            });

            if (!data || !data.success) {
                throw new Error(data?.error || 'Campaign launch failed');
            }

            if (data?.campaignId) {
                const launchedId: string = data.campaignId;
                setActiveCampaignId(launchedId);
                setLiveProgress((prev) => (prev ? { ...prev, campaignId: launchedId } : null));
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Campaign launch failed';
            setLaunchError(msg);
            setIsLaunching(false);
            setLiveProgress((prev) => (prev ? { ...prev, status: 'FAILED' } : null));
        }
    };

    const handleCancelCampaign = async () => {
        if (!activeCampaignId) return;
        if (!window.confirm('Are you sure you want to stop sending remaining emails in this campaign?')) {
            return;
        }

        setIsCancelling(true);
        try {
            const data = await apiClient.patch<{ success: boolean }>('/admin/email/campaigns', {
                id: activeCampaignId,
                action: 'cancel',
            });
            if (data?.success) {
                setLiveProgress((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
                setIsLaunching(false);
            }
        } catch (err) {
            console.error('Failed to cancel campaign:', err);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 w-full pb-16">
            {/* Header with Dark Charcoal Visible Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-2 text-2xl md:text-3xl font-bold text-brand-secondary">
                        Campaign Creation Wizard
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Configure verified sender, throttling delay, audience CSV, and TipTap rich content.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {draftFeedback && (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg animate-in fade-in">
                            {draftFeedback}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => handleSaveDraft()}
                        disabled={isSavingDraft}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-lg border border-gray-300 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                        title="Save campaign state to PostgreSQL to resume later"
                    >
                        {isSavingDraft ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                        ) : (
                            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span>Save as Draft</span>
                    </button>
                </div>
            </div>

            {/* Stepper Navigation - Clean Light Card */}
            <div className="card p-4 border border-gray-200 overflow-x-auto shadow-sm">
                <div className="flex items-center justify-between min-w-[720px]">
                    {WIZARD_STEPS.map((s, idx) => {
                        const isCompleted = currentStep > s.step;
                        const isCurrent = currentStep === s.step;

                        return (
                            <React.Fragment key={s.step}>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(s.step)}
                                    className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all cursor-pointer ${
                                        isCurrent
                                            ? 'bg-red-50 border border-red-200 text-brand-secondary shadow-xs'
                                            : isCompleted
                                            ? 'text-green-700 hover:bg-gray-50'
                                            : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                            isCurrent
                                                ? 'bg-brand-primary text-white shadow-xs'
                                                : isCompleted
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {isCompleted ? <Check className="w-4 h-4" /> : s.step}
                                    </div>
                                    <div>
                                        <div
                                            className={`text-xs font-bold ${
                                                isCurrent
                                                    ? 'text-brand-secondary'
                                                    : isCompleted
                                                    ? 'text-gray-800'
                                                    : 'text-gray-400'
                                            }`}
                                        >
                                            {s.title}
                                        </div>
                                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                                            {s.desc}
                                        </div>
                                    </div>
                                </button>

                                {idx < WIZARD_STEPS.length - 1 && (
                                    <div
                                        className={`h-0.5 w-6 shrink-0 ${
                                            isCompleted ? 'bg-green-300' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* ════════════════════ STEP 1: SENDER SELECTION ════════════════════ */}
            {currentStep === 1 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div>
                        <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                            Step 1 of 6
                        </span>
                        <h2 className="text-xl font-bold text-brand-secondary mt-1">Select Sender Mailbox</h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Choose which verified Progemini email address will appear in the recipient's inbox.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {SENDER_OPTIONS.map((sender) => {
                            const isSelected = selectedFromEmail === sender.email;
                            return (
                                <div
                                    key={sender.email}
                                    onClick={() => {
                                        setSelectedFromEmail(sender.email);
                                        setSenderName(sender.name);
                                    }}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-red-50/40 border-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                                            : 'bg-white border-gray-200 hover:border-brand-primary/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 text-brand-primary flex items-center justify-center font-bold">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            {isSelected ? (
                                                <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center">
                                                    <Check className="w-4 h-4" />
                                                </span>
                                            ) : (
                                                <span className="w-6 h-6 rounded-full border border-gray-300" />
                                            )}
                                        </div>

                                        <h3 className="font-bold text-brand-secondary text-base">{sender.name}</h3>
                                        <code className="text-xs text-brand-primary font-mono block mt-1 font-semibold">
                                            {sender.email}
                                        </code>
                                        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                                            {sender.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                                        <span className="font-medium text-gray-700">{sender.role}</span>
                                        <span className="text-green-700 font-semibold flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-green-600" /> Verified
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="btn-primary flex items-center gap-2 text-xs py-3 px-6 shadow-md"
                        >
                            <span>Next: Campaign Information</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════ STEP 2: CAMPAIGN DETAILS ════════════════════ */}
            {currentStep === 2 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div>
                        <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                            Step 2 of 6
                        </span>
                        <h2 className="text-xl font-bold text-brand-secondary mt-1">Campaign Information & Type</h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Set your campaign internal title, category, and custom sender display name.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Campaign Internal Name:
                            </label>
                            <input
                                type="text"
                                value={campaignName}
                                onChange={(e) => setCampaignName(e.target.value)}
                                placeholder="e.g. Fall Admissions Broadcast - March"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Sender Display Name:
                            </label>
                            <input
                                type="text"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="e.g. Progemini Academy or Evlyn Chahine"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Campaign Category / Purpose:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    type: EmailCampaignType.NEWSLETTER,
                                    label: 'Monthly Newsletter',
                                    sub: 'General broadcasts & updates',
                                },
                                {
                                    type: EmailCampaignType.COURSE_ANNOUNCEMENT,
                                    label: 'Course Announcement',
                                    sub: 'New modules, programs & admissions',
                                },
                                {
                                    type: EmailCampaignType.STUDENT_UPDATE,
                                    label: 'Student Update',
                                    sub: 'Portal news, assessments & deadlines',
                                },
                                {
                                    type: EmailCampaignType.OUTREACH,
                                    label: 'Academic Outreach',
                                    sub: 'Colleges, partner institutions & leads',
                                },
                                {
                                    type: EmailCampaignType.PROMOTIONAL,
                                    label: 'Promotional / Offers',
                                    sub: 'Special discounts & scholarship info',
                                },
                                {
                                    type: EmailCampaignType.SYSTEM_NOTIFICATION,
                                    label: 'System Notification',
                                    sub: 'Important administrative alerts',
                                },
                            ].map((item) => (
                                <label
                                    key={item.type}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                                        campaignType === item.type
                                            ? 'bg-red-50/40 border-brand-primary text-brand-secondary shadow-xs'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="campCategory"
                                        checked={campaignType === item.type}
                                        onChange={() => setCampaignType(item.type)}
                                        className="text-brand-primary mt-0.5 focus:ring-brand-primary"
                                    />
                                    <div>
                                        <div className="text-xs font-bold text-brand-secondary">{item.label}</div>
                                        <div className="text-[11px] text-gray-500">{item.sub}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                        <span className="text-gray-600">Selected Sender Header:</span>
                        <code className="text-brand-primary font-mono font-bold">
                            {senderName} &lt;{selectedFromEmail}&gt;
                        </code>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="btn-primary flex items-center gap-2 text-xs py-3 px-6 shadow-md"
                        >
                            <span>Next: Throttle & Pacing</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════ STEP 3: THROTTLE & PACING ════════════════════ */}
            {currentStep === 3 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div>
                        <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                            Step 3 of 6
                        </span>
                        <h2 className="text-xl font-bold text-brand-secondary mt-1">Anti-Throttle Delay & Pacing</h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Control pause interval between each email delivery to ensure high inbox delivery and avoid ISP spam flags.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-xs font-semibold text-gray-700">
                            Pause Between Each Outgoing Email:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { sec: 1, label: 'Fast (1s)', desc: 'High throughput, small lists' },
                                { sec: 3, label: 'Standard (3s)', desc: 'Recommended balance' },
                                { sec: 5, label: 'Gentle (5s)', desc: 'Higher primary inbox rate' },
                                { sec: 10, label: 'Slow (10s)', desc: 'Best for cold outreach lists' },
                            ].map((preset) => (
                                <button
                                    key={preset.sec}
                                    type="button"
                                    onClick={() => setDelaySeconds(preset.sec)}
                                    className={`p-4 rounded-xl border text-left transition-all ${
                                        delaySeconds === preset.sec
                                            ? 'bg-red-50/40 border-brand-primary text-brand-secondary ring-2 ring-brand-primary/20 shadow-xs'
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="text-xs font-bold text-brand-secondary">{preset.label}</div>
                                    <div className="text-[11px] text-gray-500 mt-1">{preset.desc}</div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
                            <div className="flex justify-between text-gray-600">
                                <span>Estimated Dispatch Time for {parsedRecipients.length} recipients:</span>
                                <strong className="text-brand-primary font-mono font-bold">
                                    {((parsedRecipients.length * delaySeconds) / 60).toFixed(1)} minutes
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="btn-primary flex items-center gap-2 text-xs py-3 px-6 shadow-md"
                        >
                            <span>Next: Audience & CSV</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════ STEP 4: AUDIENCE & CSV ════════════════════ */}
            {currentStep === 4 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div>
                        <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                            Step 4 of 6
                        </span>
                        <h2 className="text-xl font-bold text-brand-secondary mt-1">Audience & Recipient List</h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Upload a CSV with custom columns, pick a saved list, or enter manual email addresses.
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
                        {[
                            { id: 'csv', label: 'CSV Spreadsheet Upload', icon: FileSpreadsheet },
                            { id: 'saved_list', label: 'Saved Contact Lists', icon: Users },
                            { id: 'manual', label: 'Manual Email Input', icon: Mail },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setAudienceMode(tab.id as any)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                                    audienceMode === tab.id
                                        ? 'bg-brand-primary text-white shadow-xs'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* CSV Mode */}
                    {audienceMode === 'csv' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 hover:border-brand-primary rounded-xl p-8 text-center bg-gray-50/70 transition-colors">
                                <Upload className="w-8 h-8 text-brand-primary mx-auto mb-3" />
                                <h3 className="text-sm font-bold text-brand-secondary">Upload CSV Contact File</h3>
                                <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                                    Include columns like <code className="text-brand-primary font-mono">email</code>,{' '}
                                    <code className="text-brand-primary font-mono">name</code>,{' '}
                                    <code className="text-brand-primary font-mono">institution_name</code>, etc.
                                </p>
                                <label className="btn-primary inline-flex items-center gap-2 mt-4 text-xs py-2 px-5 shadow-sm cursor-pointer">
                                    <Upload className="w-4 h-4" />
                                    <span>Browse CSV File</span>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleCsvUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Save list option */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="saveListCheck"
                                    checked={saveAudienceAsList}
                                    onChange={(e) => setSaveAudienceAsList(e.target.checked)}
                                    className="rounded text-brand-primary focus:ring-brand-primary"
                                />
                                <label
                                    htmlFor="saveListCheck"
                                    className="text-xs text-gray-700 cursor-pointer font-medium"
                                >
                                    Save this uploaded CSV as a reusable contact list
                                </label>
                                {saveAudienceAsList && (
                                    <input
                                        type="text"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                        placeholder="List name e.g. London Admissions"
                                        className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 ml-auto focus:ring-1 focus:ring-brand-primary focus:outline-none"
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Saved List Mode */}
                    {audienceMode === 'saved_list' && (
                        <div className="space-y-4">
                            <label className="block text-xs font-semibold text-gray-700">
                                Select from Existing Contact Lists:
                            </label>
                            {savedLists.length === 0 ? (
                                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
                                    No saved contact lists found.{' '}
                                    <Link
                                        href="/admin/email-marketing/contacts"
                                        className="text-brand-primary underline font-semibold"
                                    >
                                        Create one in Manage Contacts
                                    </Link>
                                    .
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {savedLists.map((l) => (
                                        <div
                                            key={l.id}
                                            onClick={() => handleSelectSavedList(l.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                selectedListId === l.id
                                                    ? 'bg-red-50/40 border-brand-primary shadow-xs'
                                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-brand-secondary text-xs">{l.name}</h4>
                                                <span className="text-[11px] font-semibold text-brand-primary font-mono bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                                    {l.contactCount || l.contacts?.length || 0} contacts
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-1 truncate">
                                                {l.description || 'No description'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Mode */}
                    {audienceMode === 'manual' && (
                        <div className="space-y-3">
                            <label className="block text-xs font-semibold text-gray-700">
                                Enter Recipient Emails (comma, semicolon, or newline separated):
                            </label>
                            <textarea
                                value={manualEmailsText}
                                onChange={(e) => handleManualEmailsChange(e.target.value)}
                                rows={5}
                                placeholder="test@progemini.academy, student@example.com"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                        </div>
                    )}

                    {/* Audience Validation Summary Card */}
                    {validationSummary.total > 0 && (
                        <div className="flex items-center gap-3 flex-wrap p-3.5 bg-white border border-gray-200 rounded-lg text-xs shadow-xs">
                            <span className="font-semibold text-brand-secondary flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span>Audience Validation:</span>
                            </span>
                            <span className="px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200 font-semibold">
                                ✅ {validationSummary.valid} Valid Emails
                            </span>
                            {validationSummary.duplicates > 0 && (
                                <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                                    ⚠️ {validationSummary.duplicates} Duplicates Auto-Merged
                                </span>
                            )}
                            {validationSummary.invalid > 0 && (
                                <span className="px-2.5 py-1 rounded bg-red-50 text-brand-primary border border-red-200 font-semibold">
                                    ❌ {validationSummary.invalid} Invalid Excluded
                                </span>
                            )}
                        </div>
                    )}

                    {/* Recipient Preview Table */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3 text-xs">
                            <span className="font-bold text-brand-secondary flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-primary" />
                                <span>Parsed Audience ({parsedRecipients.length} recipients)</span>
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {detectedColumns.map((col) => (
                                    <span
                                        key={col}
                                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white text-gray-700 border border-gray-300"
                                    >
                                        {`{{${col}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {parsedRecipients.length > 0 ? (
                            <div className="max-h-48 overflow-y-auto overflow-x-auto bg-white border border-gray-200 rounded-lg">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] border-b border-gray-200">
                                        <tr>
                                            {detectedColumns.slice(0, 4).map((c) => (
                                                <th key={c} className="py-2 px-3 font-semibold">
                                                    {c}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700 text-[11px]">
                                        {parsedRecipients.slice(0, 5).map((r, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                {detectedColumns.slice(0, 4).map((c) => (
                                                    <td key={c} className="py-1.5 px-3 font-mono">
                                                        {String(r[c] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {parsedRecipients.length > 5 && (
                                    <p className="text-[10px] text-gray-500 text-center py-2">
                                        ...and {parsedRecipients.length - 5} more recipients
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-4">No recipients parsed yet</p>
                        )}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="btn-primary flex items-center gap-2 text-xs py-3 px-6 shadow-md"
                        >
                            <span>Next: Subject & Email Body</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════ STEP 5: SUBJECT & EMAIL BODY (TIPTAP) ════════════════════ */}
            {currentStep === 5 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                                Step 5 of 6
                            </span>
                            <h2 className="text-xl font-bold text-brand-secondary mt-1">Email Subject & Body Composer</h2>
                            <p className="text-xs text-gray-600 mt-1">
                                Write email copy with TipTap rich text, insert dynamic tokens, and monitor spam deliverability.
                            </p>
                        </div>

                        {/* Preset Template Selector */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 font-medium">Templates:</span>
                            <select
                                onChange={(e) => {
                                    const tpl = PRESET_TEMPLATES.find((t) => t.id === e.target.value);
                                    if (tpl) handleApplyTemplate(tpl);
                                }}
                                className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            >
                                <option value="">-- Choose Template Preset --</option>
                                {PRESET_TEMPLATES.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Subject Line */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-700">
                                Email Subject Line:
                            </label>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500 font-semibold">Add Token:</span>
                                {detectedColumns.slice(0, 3).map((col) => (
                                    <button
                                        key={col}
                                        type="button"
                                        onClick={() => setSubject((prev) => `${prev} {{${col}}}`)}
                                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 hover:bg-red-100 text-brand-primary border border-red-200 font-semibold"
                                    >
                                        + {`{{${col}}}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. 🚀 Welcome to Progemini Academy, {{name}}!"
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs font-medium focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            required
                        />
                    </div>

                    {/* Spam Analysis Score Bar */}
                    {spamAnalysis && (
                        <div
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                                spamAnalysis.score >= 80
                                    ? 'bg-green-50 border-green-200 text-green-900'
                                    : spamAnalysis.score >= 60
                                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                                    : 'bg-red-50 border-red-200 text-brand-primary'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-sm ${
                                        spamAnalysis.score >= 80
                                            ? 'bg-green-600 text-white'
                                            : spamAnalysis.score >= 60
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-brand-primary text-white'
                                    }`}
                                >
                                    {spamAnalysis.grade}
                                </div>
                                <div>
                                    <div className="font-bold">
                                        Deliverability & Spam Score: {spamAnalysis.score}/100
                                    </div>
                                    <div className="text-[11px] opacity-90">
                                        {spamAnalysis.warnings.length === 0
                                            ? 'Excellent! No spam trigger words or delivery flags detected.'
                                            : spamAnalysis.warnings[0]}
                                    </div>
                                </div>
                            </div>

                            {spamAnalysis.warnings.length > 1 && (
                                <span className="text-[10px] underline cursor-pointer font-medium opacity-90">
                                    +{spamAnalysis.warnings.length - 1} more suggestions
                                </span>
                            )}
                        </div>
                    )}

                    {/* TipTap Rich Text Email Body Component */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-700">
                            Email Body Content (TipTap Visual Editor / Raw HTML):
                        </label>
                        <EmailTipTapEditor
                            value={htmlBody}
                            onChange={(newHtml) => setHtmlBody(newHtml)}
                            customTokens={detectedColumns}
                            minHeight="380px"
                        />
                    </div>

                    <div className="flex justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(4)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(6)}
                            className="btn-primary flex items-center gap-2 text-xs py-3 px-6 shadow-md"
                        >
                            <span>Next: Test & Launch</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ════════════════════ STEP 6: TEST & LAUNCH ════════════════════ */}
            {currentStep === 6 && (
                <div className="card p-6 md:p-8 space-y-6 border border-gray-200">
                    <div>
                        <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider">
                            Step 6 of 6
                        </span>
                        <h2 className="text-xl font-bold text-brand-secondary mt-1">Review, Test & Dispatch</h2>
                        <p className="text-xs text-gray-600 mt-1">
                            Send a single test email, verify formatting, and initiate the live delivery dispatch.
                        </p>
                    </div>

                    {/* Campaign Summary Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 p-5 rounded-xl text-xs">
                        <div>
                            <span className="text-gray-500 block mb-1">Sender Mailbox:</span>
                            <strong className="text-brand-secondary block font-mono">
                                {senderName} &lt;{selectedFromEmail}&gt;
                            </strong>
                            <span className="text-[10px] text-green-700 font-semibold">Resend Cloud Engine</span>
                        </div>

                        <div>
                            <span className="text-gray-500 block mb-1">Recipients & Pacing:</span>
                            <strong className="text-brand-secondary block">
                                {parsedRecipients.length} recipients ({delaySeconds}s delay)
                            </strong>
                            <span className="text-[10px] text-gray-500">
                                ~{((parsedRecipients.length * delaySeconds) / 60).toFixed(1)} mins total
                            </span>
                        </div>

                        <div>
                            <span className="text-gray-500 block mb-1">Category & Spam Grade:</span>
                            <strong className="text-brand-secondary block capitalize">
                                {campaignType.replace(/_/g, ' ').toLowerCase()}
                            </strong>
                            <span className="text-[10px] text-brand-primary font-semibold">
                                Grade: {spamAnalysis?.grade || 'A+'} ({spamAnalysis?.score || 100}/100)
                            </span>
                        </div>
                    </div>

                    {/* Test Email Box */}
                    <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                        <h3 className="text-xs font-bold text-brand-secondary flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-brand-primary" /> Send Test Email First
                        </h3>
                        <p className="text-[11px] text-gray-600">
                            Dispatch a sample rendered email to your personal inbox to verify styling and links before launching to the whole list.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                value={testEmailAddress}
                                onChange={(e) => setTestEmailAddress(e.target.value)}
                                placeholder="your-email@example.com"
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSendTest}
                                disabled={isSendingTest}
                                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-800 rounded-lg text-xs font-semibold border border-gray-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                            >
                                {isSendingTest ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                                ) : (
                                    <Send className="w-3.5 h-3.5 text-brand-primary" />
                                )}
                                <span>Send Test Email</span>
                            </button>
                        </div>

                        {testResult && (
                            <div
                                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                                    testResult.success
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-brand-primary border border-red-200'
                                }`}
                            >
                                {testResult.success ? (
                                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                                ) : (
                                    <AlertCircle className="w-4 h-4 text-brand-primary shrink-0" />
                                )}
                                <span>{testResult.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Live Progress Tracker (When campaign is sending or completed) */}
                    {liveProgress && (
                        <div className="p-6 bg-white border border-brand-primary/30 rounded-xl space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 text-brand-primary flex items-center justify-center">
                                        <Activity className="w-5 h-5 animate-spin" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-brand-secondary text-sm">
                                            Live Campaign Progress ({liveProgress.status})
                                        </h3>
                                        <p className="text-[11px] text-gray-500">
                                            {liveProgress.sent} sent • {liveProgress.failed} failed • of{' '}
                                            {liveProgress.total} total
                                        </p>
                                    </div>
                                </div>

                                {liveProgress.status === 'SENDING' && (
                                    <button
                                        type="button"
                                        onClick={handleCancelCampaign}
                                        disabled={isCancelling}
                                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-brand-primary border border-red-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        <span>{isCancelling ? 'Stopping...' : 'Stop Campaign'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-brand-primary to-red-600 transition-all duration-500"
                                    style={{ width: `${liveProgress.percent}%` }}
                                />
                            </div>

                            {/* Live activity feed */}
                            {liveProgress.recentLogs && liveProgress.recentLogs.length > 0 && (
                                <div className="pt-3 border-t border-gray-200 space-y-1.5 max-h-44 overflow-y-auto font-mono text-[11px]">
                                    {liveProgress.recentLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center justify-between text-gray-600 py-1 border-b border-gray-100"
                                        >
                                            <span className="text-gray-900">{log.recipient}</span>
                                            <span
                                                className={`capitalize font-semibold ${
                                                    log.status === 'sent' || log.status === 'delivered'
                                                        ? 'text-green-600'
                                                        : 'text-brand-primary'
                                                }`}
                                            >
                                                {log.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {launchError && (
                        <div className="p-4 bg-red-50 border border-red-200 text-brand-primary rounded-lg text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{launchError}</span>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(5)}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Email Editor</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLaunchCampaign}
                            disabled={isLaunching}
                            className="btn-primary text-xs py-3.5 px-8 shadow-md disabled:opacity-50 flex items-center gap-2 font-bold"
                        >
                            {isLaunching ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>
                                {isLaunching
                                    ? 'Dispatching Campaign...'
                                    : `Launch Campaign to ${parsedRecipients.length} Recipients`}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CampaignWizardPage() {
    return (
        <Suspense
            fallback={
                <div className="p-12 text-center text-gray-500 text-xs">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-primary" />
                    Loading campaign wizard...
                </div>
            }
        >
            <WizardContent />
        </Suspense>
    );
}
