'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Send,
    Plus,
    Search,
    Trash2,
    Edit3,
    Eye,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    X,
    MailCheck,
    MousePointerClick,
    ShieldAlert,
    Download,
    Building2,
    User,
    ExternalLink,
    RefreshCw,
    Mail,
    FileSpreadsheet,
} from 'lucide-react';
import { EmailCampaignStatus, EmailCampaignType } from '@/lib/email-marketing';
import { apiClient } from '@/lib/apiClient';

interface CampaignItem {
    id: string;
    name: string;
    type: EmailCampaignType;
    fromEmail: string;
    fromName: string | null;
    subject: string;
    htmlBody?: string;
    plainText?: string | null;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    openCount: number;
    clickCount: number;
    bounceCount: number;
    spamCount: number;
    status: EmailCampaignStatus;
    createdAt: string;
    updatedAt: string;
}

interface EmailLogItem {
    id: string;
    campaignId: string;
    recipient: string;
    customData?: Record<string, unknown> | null;
    status: string;
    error?: string | null;
    openCount: number;
    clickedUrls: string[];
    openedAt?: string | null;
    clickedAt?: string | null;
    sentAt: string;
}

export default function CampaignsListPage() {
    const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Detail Modal state
    const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);
    const [campaignLogs, setCampaignLogs] = useState<EmailLogItem[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [modalTab, setModalTab] = useState<'recipients' | 'preview'>('recipients');
    const [logSearchQuery, setLogSearchQuery] = useState('');
    const [logStatusFilter, setLogStatusFilter] = useState<'all' | 'opened' | 'clicked' | 'bounced' | 'delivered'>('all');

    const loadCampaigns = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get<{ success: boolean; campaigns: CampaignItem[] }>('/admin/email/campaigns');
            if (data?.success) {
                setCampaigns(data.campaigns || []);
            }
        } catch (err) {
            console.error('Failed to load campaigns:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCampaigns();
    }, []);

    // Open detail modal and fetch logs from Postgres
    const handleOpenDetailModal = async (camp: CampaignItem) => {
        setSelectedCampaign(camp);
        setIsLoadingLogs(true);
        setCampaignLogs([]);
        setModalTab('recipients');
        setLogSearchQuery('');
        setLogStatusFilter('all');

        try {
            const data = await apiClient.get<{ success: boolean; campaign?: CampaignItem; logs?: EmailLogItem[] }>(`/admin/email/campaigns?id=${camp.id}`);
            if (data?.success) {
                if (data.campaign) setSelectedCampaign(data.campaign);
                if (data.logs) setCampaignLogs(data.logs);
            }
        } catch (err) {
            console.error('Failed to load campaign logs:', err);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleDeleteCampaign = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this email campaign and its delivery logs?')) {
            return;
        }

        setDeletingId(id);
        try {
            const data = await apiClient.delete<{ success: boolean; error?: string }>(`/admin/email/campaigns?id=${id}`);
            if (data?.success) {
                setCampaigns((prev) => prev.filter((c) => c.id !== id));
                if (selectedCampaign?.id === id) {
                    setSelectedCampaign(null);
                }
            } else {
                alert(data?.error || 'Failed to delete campaign');
            }
        } catch (err: any) {
            console.error('Delete error:', err);
            alert(err.message || 'Failed to delete campaign');
        } finally {
            setDeletingId(null);
        }
    };

    // Export tracking logs to CSV
    const handleExportCsv = () => {
        if (!selectedCampaign || campaignLogs.length === 0) return;

        const headers = [
            'Recipient Email',
            'Delivery Status',
            'Open Count',
            'First Opened At',
            'Click Count',
            'Clicked URLs',
            'First Clicked At',
            'Sent At',
            'Custom Metadata',
        ];

        const rows = campaignLogs.map((log) => {
            const customDataStr = log.customData ? JSON.stringify(log.customData).replace(/"/g, '""') : '';
            const clickedUrlsStr = log.clickedUrls.join(' | ').replace(/"/g, '""');

            return [
                `"${log.recipient}"`,
                `"${log.status}"`,
                log.openCount,
                log.openedAt ? `"${new Date(log.openedAt).toLocaleString()}"` : '""',
                log.clickedUrls.length,
                `"${clickedUrlsStr}"`,
                log.clickedAt ? `"${new Date(log.clickedAt).toLocaleString()}"` : '""',
                `"${new Date(log.sentAt).toLocaleString()}"`,
                `"${customDataStr}"`,
            ].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute(
            'download',
            `campaign_${selectedCampaign.name.replace(/[^a-zA-Z0-9]/g, '_')}_tracking_logs.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredCampaigns = campaigns.filter((camp) => {
        const matchesSearch =
            (camp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (camp.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (camp.fromEmail || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || camp.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Filter modal recipient logs
    const filteredLogs = campaignLogs.filter((log) => {
        const q = logSearchQuery.toLowerCase();
        const matchesQuery =
            log.recipient.toLowerCase().includes(q) ||
            (log.customData && JSON.stringify(log.customData).toLowerCase().includes(q));

        if (!matchesQuery) return false;

        if (logStatusFilter === 'opened') return log.openCount > 0;
        if (logStatusFilter === 'clicked') return log.clickedUrls.length > 0;
        if (logStatusFilter === 'bounced') return log.status === 'bounced';
        if (logStatusFilter === 'delivered') return log.status === 'delivered';

        return true;
    });

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            {/* Header with Dark Charcoal Visible Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-2 text-2xl md:text-3xl font-bold text-brand-secondary">
                        Email Campaigns
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage, monitor, and inspect real-time delivery outcomes of your email campaigns.
                    </p>
                </div>

                <Link
                    href="/admin/email-marketing/campaigns/new"
                    className="btn-primary flex items-center gap-2 text-sm shadow-md self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Campaign</span>
                </Link>
            </div>

            {/* Filter and Search Bar - Clean Light Card */}
            <div className="card p-4 border border-gray-200 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search input */}
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search campaigns, subject, sender..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                    {['ALL', 'COMPLETED', 'SENDING', 'DRAFT', 'FAILED'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap cursor-pointer ${
                                statusFilter === st
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {st.toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns Table - Clean Light Card */}
            <div className="card border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                        <span>Loading email campaigns from PostgreSQL...</span>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        No campaigns found matching the filter.{' '}
                        <Link
                            href="/admin/email-marketing/campaigns/new"
                            className="text-brand-primary font-semibold underline"
                        >
                            Create a new campaign
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-4">Campaign Name</th>
                                    <th className="py-3 px-4">Sender Mailbox</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Delivery Progress</th>
                                    <th className="py-3 px-4">Opens</th>
                                    <th className="py-3 px-4">Clicks</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Created Date</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-xs">
                                {filteredCampaigns.map((camp) => (
                                    <tr
                                        key={camp.id}
                                        onClick={() => handleOpenDetailModal(camp)}
                                        className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-brand-secondary max-w-[240px] truncate text-sm group-hover:text-brand-primary transition-colors">
                                                {camp.name}
                                            </div>
                                            <div className="text-xs text-gray-500 max-w-[240px] truncate mt-0.5">
                                                {camp.subject || '(No subject line)'}
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 font-mono text-xs text-gray-700">
                                            {camp.fromEmail}
                                        </td>

                                        <td className="py-4 px-4">
                                            <span className="capitalize px-2.5 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                                {camp.type?.replace(/_/g, ' ')?.toLowerCase()}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 text-gray-700">
                                            <div className="font-medium text-xs">
                                                {camp.sentCount} / {camp.totalRecipients}
                                            </div>
                                            <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-primary rounded-full"
                                                    style={{
                                                        width: `${
                                                            camp.totalRecipients > 0
                                                                ? Math.min(
                                                                      100,
                                                                      Math.round(
                                                                          (camp.sentCount /
                                                                              camp.totalRecipients) *
                                                                              100
                                                                      )
                                                                  )
                                                                : 0
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 font-semibold text-green-600">
                                            {camp.openCount} (
                                            {camp.sentCount > 0
                                                ? ((camp.openCount / camp.sentCount) * 100).toFixed(0)
                                                : 0}
                                            %)
                                        </td>

                                        <td className="py-4 px-4 font-semibold text-purple-600">
                                            {camp.clickCount} (
                                            {camp.sentCount > 0
                                                ? ((camp.clickCount / camp.sentCount) * 100).toFixed(0)
                                                : 0}
                                            %)
                                        </td>

                                        <td className="py-4 px-4">
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

                                        <td className="py-4 px-4 text-gray-500 text-xs">
                                            {new Date(camp.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Eye Details Button */}
                                                <button
                                                    onClick={() => handleOpenDetailModal(camp)}
                                                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-brand-primary transition-colors cursor-pointer"
                                                    title="View Campaign Outcome & Recipient Logs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>

                                                {/* Edit / Resume Wizard Button */}
                                                <Link
                                                    href={`/admin/email-marketing/campaigns/new?draftId=${camp.id}`}
                                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                                                    title="Edit / Resume Wizard"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </Link>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => handleDeleteCampaign(camp.id, e)}
                                                    disabled={deletingId === camp.id}
                                                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-40 cursor-pointer"
                                                    title="Delete Campaign"
                                                >
                                                    {deletingId === camp.id ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ════════════════════ CAMPAIGN OUTCOME & RECIPIENT LOGS MODAL ════════════════════ */}
            {selectedCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-200 rounded-2xl max-w-5xl w-full shadow-2xl text-gray-900 my-8 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
                        
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gray-50/70 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                    <h2 className="text-xl font-bold text-brand-secondary">
                                        {selectedCampaign.name}
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-brand-primary border border-red-200 font-mono">
                                        {selectedCampaign.fromEmail}
                                    </span>
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            selectedCampaign.status === 'COMPLETED'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}
                                    >
                                        {selectedCampaign.status}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    <span className="font-semibold text-gray-700">Subject:</span>{' '}
                                    {selectedCampaign.subject || '(No subject line)'}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedCampaign(null)}
                                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Top 5 Metric Cards */}
                        <div className="p-5 bg-white border-b border-gray-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                                <span className="text-[11px] text-gray-600 font-medium block">Total Sent</span>
                                <span className="text-lg font-bold text-brand-secondary mt-0.5 block">
                                    {selectedCampaign.sentCount} / {selectedCampaign.totalRecipients}
                                </span>
                            </div>

                            <div className="p-3 bg-green-50/50 border border-green-200 rounded-xl text-center">
                                <span className="text-[11px] text-green-700 font-medium block flex items-center justify-center gap-1">
                                    <MailCheck className="w-3.5 h-3.5 text-green-600" /> Opens
                                </span>
                                <span className="text-lg font-bold text-green-700 mt-0.5 block">
                                    {selectedCampaign.openCount} (
                                    {selectedCampaign.sentCount > 0
                                        ? ((selectedCampaign.openCount / selectedCampaign.sentCount) * 100).toFixed(0)
                                        : 0}
                                    %)
                                </span>
                            </div>

                            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl text-center">
                                <span className="text-[11px] text-purple-700 font-medium block flex items-center justify-center gap-1">
                                    <MousePointerClick className="w-3.5 h-3.5 text-purple-600" /> Clicks
                                </span>
                                <span className="text-lg font-bold text-purple-700 mt-0.5 block">
                                    {selectedCampaign.clickCount} (
                                    {selectedCampaign.sentCount > 0
                                        ? ((selectedCampaign.clickCount / selectedCampaign.sentCount) * 100).toFixed(0)
                                        : 0}
                                    %)
                                </span>
                            </div>

                            <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl text-center">
                                <span className="text-[11px] text-red-700 font-medium block flex items-center justify-center gap-1">
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Bounced
                                </span>
                                <span className="text-lg font-bold text-brand-primary mt-0.5 block">
                                    {selectedCampaign.bounceCount || 0}
                                </span>
                            </div>

                            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-center col-span-2 sm:col-span-1">
                                <span className="text-[11px] text-amber-700 font-medium block">Spam Flag</span>
                                <span className="text-lg font-bold text-amber-700 mt-0.5 block">
                                    {selectedCampaign.spamCount || 0}
                                </span>
                            </div>
                        </div>

                        {/* Modal Toolbar: Tab switcher & Actions */}
                        <div className="px-6 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setModalTab('recipients')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        modalTab === 'recipients'
                                            ? 'bg-brand-primary text-white shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    Recipient Logs ({campaignLogs.length})
                                </button>
                                <button
                                    onClick={() => setModalTab('preview')}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        modalTab === 'preview'
                                            ? 'bg-brand-primary text-white shadow-xs'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    Email Content Preview
                                </button>
                            </div>

                            <button
                                onClick={handleExportCsv}
                                disabled={campaignLogs.length === 0}
                                className="px-3.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 self-start sm:self-auto shadow-xs"
                                title="Export tracking details to CSV spreadsheet"
                            >
                                <Download className="w-3.5 h-3.5 text-brand-primary" />
                                <span>Export CSV</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            {modalTab === 'recipients' ? (
                                <div className="space-y-4">
                                    {/* Search & Status Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={logSearchQuery}
                                                onChange={(e) => setLogSearchQuery(e.target.value)}
                                                placeholder="Filter recipients by email, name, or metadata..."
                                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200 self-start sm:self-auto text-xs">
                                            {[
                                                { key: 'all', label: 'All' },
                                                { key: 'opened', label: 'Opened' },
                                                { key: 'clicked', label: 'Clicked' },
                                                { key: 'bounced', label: 'Bounced' },
                                                { key: 'delivered', label: 'Delivered' },
                                            ].map((btn) => (
                                                <button
                                                    key={btn.key}
                                                    onClick={() => setLogStatusFilter(btn.key as typeof logStatusFilter)}
                                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                                        logStatusFilter === btn.key
                                                            ? 'bg-brand-primary text-white shadow-xs'
                                                            : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recipient Logs Table */}
                                    {isLoadingLogs ? (
                                        <div className="text-center py-16 text-gray-500 text-xs flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
                                            <span>Loading tracking logs from PostgreSQL...</span>
                                        </div>
                                    ) : filteredLogs.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 text-xs border border-dashed border-gray-300 rounded-xl">
                                            No recipient logs match the current filter.
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white shadow-xs">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-200">
                                                    <tr>
                                                        <th className="py-3 px-4">Recipient Contact</th>
                                                        <th className="py-3 px-4">Delivery Status</th>
                                                        <th className="py-3 px-4">Open Activity</th>
                                                        <th className="py-3 px-4">Link Clicks</th>
                                                        <th className="py-3 px-4">Sent Timestamp</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filteredLogs.map((log) => {
                                                        const custom = (log.customData || {}) as Record<string, unknown>;
                                                        const institute = String(
                                                            custom.institute ||
                                                                custom.institution_name ||
                                                                custom.institution ||
                                                                custom.school_name ||
                                                                custom.college_name ||
                                                                ''
                                                        );
                                                        const name = String(custom.name || custom.contact_name || '');
                                                        const address = String(custom.address || custom.city || '');
                                                        const phone = String(custom.phone || custom.phone_number || '');

                                                        return (
                                                            <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                                                                <td className="py-3 px-4">
                                                                    <div className="font-semibold text-brand-secondary font-mono text-xs">
                                                                        {log.recipient}
                                                                    </div>

                                                                    {institute && (
                                                                        <div className="text-[11px] text-gray-700 flex items-center gap-1.5 mt-0.5 font-medium">
                                                                            <Building2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                                            <span>{institute}</span>
                                                                        </div>
                                                                    )}

                                                                    {(name || address || phone) && (
                                                                        <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-1 flex-wrap">
                                                                            {name && (
                                                                                <span className="flex items-center gap-1 text-gray-600 font-medium">
                                                                                    <User className="w-3 h-3 text-gray-400" />
                                                                                    {name}
                                                                                </span>
                                                                            )}
                                                                            {address && (
                                                                                <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                                                                    📍 {address}
                                                                                </span>
                                                                            )}
                                                                            {phone && (
                                                                                <span className="text-gray-500 font-mono text-[10px]">
                                                                                    {phone}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                <td className="py-3 px-4">
                                                                    {log.status === 'bounced' ? (
                                                                        <div>
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-brand-primary border border-red-200">
                                                                                <ShieldAlert className="w-3 h-3" /> Bounced
                                                                            </span>
                                                                            {log.error && (
                                                                                <div className="text-[10px] text-red-600 mt-0.5 truncate max-w-xs">
                                                                                    {log.error}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : log.status === 'failed' ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                                                                            <AlertCircle className="w-3 h-3" /> Failed
                                                                        </span>
                                                                    ) : log.status === 'delivered' ? (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                                                            <CheckCircle2 className="w-3 h-3" /> Delivered
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                                            <CheckCircle2 className="w-3 h-3" /> Sent
                                                                        </span>
                                                                    )}
                                                                </td>

                                                                <td className="py-3 px-4">
                                                                    {log.openCount > 0 ? (
                                                                        <div>
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                                                                ✓ Opened ({log.openCount}x)
                                                                            </span>
                                                                            {log.openedAt && (
                                                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                                                    {new Date(log.openedAt).toLocaleTimeString([], {
                                                                                        hour: '2-digit',
                                                                                        minute: '2-digit',
                                                                                    })}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-[11px]">Unopened</span>
                                                                    )}
                                                                </td>

                                                                <td className="py-3 px-4">
                                                                    {log.clickedUrls.length > 0 ? (
                                                                        <div>
                                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                                                🔗 {log.clickedUrls.length} Click{log.clickedUrls.length > 1 ? 's' : ''}
                                                                            </span>
                                                                            <div className="text-[10px] text-gray-500 truncate max-w-[180px] mt-0.5">
                                                                                {log.clickedUrls[0]}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 text-[11px]">No clicks</span>
                                                                    )}
                                                                </td>

                                                                <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                                                                    {new Date(log.sentAt).toLocaleString([], {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Email Content Preview Tab */
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 w-16">Subject:</span>
                                            <span className="font-bold text-brand-secondary">
                                                {selectedCampaign.subject || '(No subject)'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-700 w-16">Sender:</span>
                                            <span className="font-mono text-gray-800">
                                                {selectedCampaign.fromName || 'Progemini'} &lt;{selectedCampaign.fromEmail}&gt;
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-100 rounded-xl border border-gray-200 flex justify-center">
                                        <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-[650px] w-full p-6 overflow-hidden">
                                            <div
                                                className="course-rich-content text-gray-900 text-sm leading-relaxed"
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        selectedCampaign.htmlBody ||
                                                        '<p class="text-gray-400 italic">No email body saved.</p>',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
