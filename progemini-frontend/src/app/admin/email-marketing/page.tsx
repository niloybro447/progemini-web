'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Send,
    Users,
    MailCheck,
    MousePointerClick,
    ShieldCheck,
    ArrowUpRight,
    Sparkles,
    CheckCircle2,
    RefreshCw,
    Inbox,
    Plus,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { SENDER_OPTIONS } from '@/lib/email-marketing';
import { apiClient } from '@/lib/apiClient';

interface AnalyticsData {
    totalCampaigns: number;
    totalSent: number;
    totalOpens: number;
    totalClicks: number;
    totalBounces: number;
    totalSpam: number;
    openRate: string;
    clickRate: string;
    bounceRate: string;
    spamRate: string;
    senderBreakdown: Record<string, { sent: number; opens: number; clicks: number }>;
}

interface CampaignItem {
    id: string;
    name: string;
    type: string;
    fromEmail: string;
    subject: string;
    totalRecipients: number;
    sentCount: number;
    openCount: number;
    clickCount: number;
    status: string;
    createdAt: string;
}

export default function EmailMarketingDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [recentCampaigns, setRecentCampaigns] = useState<CampaignItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get<{ success: boolean; analytics: AnalyticsData; recentCampaigns: CampaignItem[] }>('/admin/email/analytics');
            if (data && data.success) {
                setAnalytics(data.analytics);
                setRecentCampaigns(data.recentCampaigns || []);
            }
        } catch (err) {
            console.error('Failed to load email analytics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            {/* Header Banner - ProGemini Theme */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-gray-200 p-6 md:p-8 rounded-xl shadow-sm">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-brand-primary border border-red-200 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Resend Cloud Engine Active
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            Verified Sender Domains
                        </span>
                    </div>
                    <h1 className="heading-2 text-2xl md:text-3xl font-bold text-brand-secondary mb-1">
                        Email Marketing & Campaign Hub
                    </h1>
                    <p className="text-sm text-gray-600 max-w-2xl">
                        Design rich newsletters, student updates, and institutional outreach with TipTap editor and real-time deliverability tracking.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={fetchDashboardData}
                        className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border border-gray-200"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <Link
                        href="/admin/email-marketing/contacts"
                        className="px-4 py-2.5 rounded-lg bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold border border-gray-300 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Users className="w-4 h-4 text-gray-600" />
                        <span>Manage Contacts</span>
                    </Link>

                    <Link
                        href="/admin/email-marketing/campaigns/new"
                        className="btn-primary flex items-center gap-2 text-sm shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Campaign</span>
                    </Link>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Total Sent */}
                <div className="card p-5 md:p-6 border border-gray-200">
                    <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        <span>Total Emails Sent</span>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Send className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-brand-secondary tracking-tight">
                        {analytics?.totalSent?.toLocaleString() || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <span>Across</span>
                        <strong className="text-gray-800">{analytics?.totalCampaigns || 0}</strong>
                        <span>campaign broadcasts</span>
                    </div>
                </div>

                {/* Open Rate */}
                <div className="card p-5 md:p-6 border border-gray-200">
                    <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        <span>Average Open Rate</span>
                        <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                            <MailCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600 tracking-tight">
                        {analytics?.openRate || '0.0%'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        {analytics?.totalOpens || 0} unique email opens logged
                    </div>
                </div>

                {/* Click Rate */}
                <div className="card p-5 md:p-6 border border-gray-200">
                    <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        <span>Click-Through Rate</span>
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                            <MousePointerClick className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 tracking-tight">
                        {analytics?.clickRate || '0.0%'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        {analytics?.totalClicks || 0} link clicks tracked
                    </div>
                </div>

                {/* Inbox Reputation */}
                <div className="card p-5 md:p-6 border border-gray-200">
                    <div className="flex items-center justify-between text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">
                        <span>Inbox Score</span>
                        <div className="w-10 h-10 rounded-lg bg-red-50 text-brand-primary flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 tracking-tight flex items-center gap-2">
                        High Inbox Score
                    </div>
                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-3">
                        <span>Bounce: <strong className="text-gray-800">{analytics?.bounceRate || '0%'}</strong></span>
                        <span>Spam: <strong className="text-gray-800">{analytics?.spamRate || '0%'}</strong></span>
                    </div>
                </div>
            </div>

            {/* Selectable Sender Mailboxes Section */}
            <div className="card p-6 md:p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
                            <Inbox className="w-5 h-5 text-brand-primary" />
                            <span>Selectable Sender Mailboxes</span>
                        </h2>
                        <p className="text-xs text-gray-600 mt-0.5">
                            Authenticated Progemini sender addresses available in the campaign creation wizard
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-brand-primary border border-red-200">
                        Resend.com Premium
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {SENDER_OPTIONS.map((sender) => (
                        <div
                            key={sender.email}
                            className="bg-gray-50/70 border border-gray-200 hover:border-brand-primary/40 p-5 rounded-xl transition-all shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-brand-secondary">{sender.name}</span>
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                            </div>
                            <code className="text-xs text-brand-primary font-mono font-semibold block mb-2">
                                {sender.email}
                            </code>
                            <p className="text-xs text-gray-600 leading-relaxed min-h-[36px]">{sender.description}</p>
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
                                <span>Role: {sender.role}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Campaigns Table */}
            <div className="card p-6 md:p-8 border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-brand-secondary">Recent Email Campaigns</h2>
                        <p className="text-xs text-gray-600">Overview of recent student broadcasts and outreach dispatches</p>
                    </div>

                    <Link
                        href="/admin/email-marketing/campaigns"
                        className="text-xs text-brand-primary hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                        <span>View All Campaigns</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                {recentCampaigns.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                        <Send className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-gray-800">No campaigns dispatched yet</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            Create your first email campaign to students or partner institutions to start tracking delivery, opens, and clicks.
                        </p>
                        <Link
                            href="/admin/email-marketing/campaigns/new"
                            className="btn-primary inline-flex items-center gap-2 mt-4 text-xs py-2 px-4 shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create First Campaign</span>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider border-b border-gray-200 text-[11px]">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">Campaign Name</th>
                                    <th className="py-3 px-4 font-semibold">Sender</th>
                                    <th className="py-3 px-4 font-semibold">Type</th>
                                    <th className="py-3 px-4 font-semibold">Recipients</th>
                                    <th className="py-3 px-4 font-semibold">Opens</th>
                                    <th className="py-3 px-4 font-semibold">Clicks</th>
                                    <th className="py-3 px-4 font-semibold">Status</th>
                                    <th className="py-3 px-4 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentCampaigns.map((camp) => (
                                    <tr key={camp.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-semibold text-brand-secondary max-w-[240px] truncate">
                                            <Link
                                                href={`/admin/email-marketing/campaigns/new?draftId=${camp.id}`}
                                                className="hover:text-brand-primary transition-colors"
                                            >
                                                {camp.name}
                                            </Link>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-xs text-gray-700">
                                            {camp.fromEmail}
                                        </td>
                                        <td className="py-3.5 px-4 capitalize text-gray-600 text-xs">
                                            {camp.type?.replace(/_/g, ' ')?.toLowerCase()}
                                        </td>
                                        <td className="py-3.5 px-4 font-medium text-gray-800">
                                            {camp.sentCount} / {camp.totalRecipients}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-green-600">
                                            {camp.openCount} (
                                            {camp.sentCount > 0
                                                ? ((camp.openCount / camp.sentCount) * 100).toFixed(0)
                                                : 0}
                                            %)
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-purple-600">
                                            {camp.clickCount} (
                                            {camp.sentCount > 0
                                                ? ((camp.clickCount / camp.sentCount) * 100).toFixed(0)
                                                : 0}
                                            %)
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                                    camp.status === 'COMPLETED'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : camp.status === 'SENDING'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse'
                                                        : camp.status === 'FAILED'
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                <CheckCircle2 className="w-3 h-3" />
                                                {camp.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-gray-500">
                                            {new Date(camp.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
