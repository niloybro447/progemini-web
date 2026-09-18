'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    UserPlus,
    Upload,
    Trash2,
    Check,
    Search,
    Loader2,
    Eye,
    X,
    Plus,
    AlertCircle,
    FileSpreadsheet,
    Tag,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { ContactList, ContactItem, sanitizeAndValidateRecipients } from '@/lib/email-marketing';

export default function ContactsPage() {
    const [lists, setLists] = useState<ContactList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [listName, setListName] = useState('');
    const [listDesc, setListDesc] = useState('');
    const [listTags, setListTags] = useState('students, admissions');
    const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
    const [parsedContacts, setParsedContacts] = useState<ContactItem[]>([]);
    const [validationSummary, setValidationSummary] = useState<{
        total: number;
        valid: number;
        duplicates: number;
        invalid: number;
    }>({ total: 0, valid: 0, duplicates: 0, invalid: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // View contacts modal
    const [viewingList, setViewingList] = useState<ContactList | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadLists = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get<{ success: boolean; lists: ContactList[] }>('/admin/email/contacts');
            if (data?.success) {
                setLists(data.lists || []);
            }
        } catch (err) {
            console.error('Failed to load contact lists:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLists();
    }, []);

    // CSV Parse with dynamic custom columns
    const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            if (!text) return;

            const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
            if (lines.length === 0) return;

            const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
            const cleanHeaders = rawHeaders.map((h) => h.toLowerCase().replace(/[\s-]+/g, '_'));

            setDetectedColumns(cleanHeaders);

            const emailIndex = cleanHeaders.findIndex((h) => h.includes('email') || h.includes('mail'));

            const rawContacts: ContactItem[] = [];
            const startIndex = emailIndex !== -1 ? 1 : 0;

            for (let i = startIndex; i < lines.length; i++) {
                const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
                const contactObj: ContactItem = { email: '' };

                cleanHeaders.forEach((header, idx) => {
                    contactObj[header] = parts[idx] || '';
                });

                const email = emailIndex !== -1 ? parts[emailIndex] : parts[0];
                if (email) {
                    contactObj.email = email;
                    rawContacts.push(contactObj);
                }
            }

            const sanitizeResult = sanitizeAndValidateRecipients(rawContacts);
            setParsedContacts(sanitizeResult.valid as ContactItem[]);
            setValidationSummary({
                total: sanitizeResult.totalInput,
                valid: sanitizeResult.valid.length,
                duplicates: sanitizeResult.duplicates,
                invalid: sanitizeResult.invalid.length,
            });

            if (!listName) {
                setListName(file.name.replace(/\.[^/.]+$/, ''));
            }
        };
        reader.readAsText(file);
    };

    // Save New List
    const handleSaveList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!listName.trim()) {
            setSaveError('List name is required');
            return;
        }

        if (parsedContacts.length === 0) {
            setSaveError('Please upload a CSV with at least 1 valid email address');
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            const tags = listTags
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t !== '');

            const data = await apiClient.post<{ success: boolean; error?: string }>('/admin/email/contacts', {
                name: listName,
                description: listDesc,
                tags,
                customColumns: detectedColumns,
                contacts: parsedContacts,
            });

            if (data?.success) {
                setIsCreateModalOpen(false);
                setListName('');
                setListDesc('');
                setParsedContacts([]);
                setDetectedColumns([]);
                loadLists();
            } else {
                setSaveError(data?.error || 'Failed to save contact list');
            }
        } catch (err: any) {
            console.error('Save error:', err);
            setSaveError(err.message || 'Failed to save contact list');
        } finally {
            setIsSaving(false);
        }
    };

    // Delete List
    const handleDeleteList = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this contact list?')) {
            return;
        }

        setDeletingId(id);
        try {
            const data = await apiClient.delete<{ success: boolean; error?: string }>(`/admin/email/contacts?id=${id}`);
            if (data?.success) {
                setLists((prev) => prev.filter((l) => l.id !== id));
            } else {
                alert(data?.error || 'Failed to delete list');
            }
        } catch (err: any) {
            console.error('Failed to delete list:', err);
            alert(err.message || 'Failed to delete list');
        } finally {
            setDeletingId(null);
        }
    };

    // Open detailed view of contacts in a list
    const handleViewContacts = async (listId: string) => {
        try {
            const data = await apiClient.get<{ success: boolean; list: ContactList }>(`/admin/email/contacts?id=${listId}`);
            if (data?.success && data.list) {
                setViewingList(data.list);
            }
        } catch (err) {
            console.error('Failed to load list details:', err);
        }
    };

    const filteredLists = lists.filter(
        (l) =>
            (l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (l.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="heading-2 text-2xl md:text-3xl font-bold text-brand-secondary">
                        Contact Lists & Audience Hub
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload CSV recipient rosters, maintain targeted segments, and configure merge variables.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary flex items-center gap-2 text-sm shadow-md self-start sm:self-auto cursor-pointer"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Upload New Contact List</span>
                </button>
            </div>

            {/* Search */}
            <div className="card p-4 border border-gray-200 flex items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search contact lists by name or description..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs placeholder-gray-400 focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                    />
                </div>
            </div>

            {/* Lists Grid */}
            {isLoading ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
                    <p className="text-xs text-gray-600">Loading contact lists...</p>
                </div>
            ) : filteredLists.length === 0 ? (
                <div className="card text-center py-16 p-8 border border-gray-200">
                    <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-brand-secondary">No contact lists found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Upload your first CSV recipient roster to use with email campaigns.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary inline-flex items-center gap-2 mt-4 text-xs py-2 px-4 shadow-sm cursor-pointer"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Upload Contacts CSV</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredLists.map((list) => (
                        <div
                            key={list.id}
                            className="card p-6 border border-gray-200 hover:border-brand-primary/40 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-50 text-brand-primary flex items-center justify-center font-bold">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-red-50 text-brand-primary border border-red-200">
                                        {(list as any).contactCount ?? list.contacts?.length ?? 0} contacts
                                    </span>
                                </div>

                                <h3 className="font-bold text-brand-secondary text-base">{list.name}</h3>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {list.description || 'No description provided.'}
                                </p>

                                {/* Tags */}
                                {list.tags && list.tags.length > 0 && (
                                    <div className="flex items-center gap-1.5 flex-wrap mt-3">
                                        {list.tags.map((t) => (
                                            <span
                                                key={t}
                                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200"
                                            >
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    {new Date(list.createdAt).toLocaleDateString()}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleViewContacts(list.id)}
                                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View</span>
                                    </button>

                                    <button
                                        onClick={(e) => handleDeleteList(list.id, e)}
                                        disabled={deletingId === list.id}
                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-brand-primary transition-colors disabled:opacity-40"
                                        title="Delete List"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ════════════════════ CREATE MODAL ════════════════════ */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 max-w-xl w-full shadow-2xl text-gray-900 my-8">
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <h3 className="text-lg font-bold text-brand-secondary flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-brand-primary" /> Upload Contacts CSV
                            </h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveList} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Contact List Name:
                                </label>
                                <input
                                    type="text"
                                    value={listName}
                                    onChange={(e) => setListName(e.target.value)}
                                    placeholder="e.g. Master of Science Applicants 2026"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Description (Optional):
                                </label>
                                <input
                                    type="text"
                                    value={listDesc}
                                    onChange={(e) => setListDesc(e.target.value)}
                                    placeholder="e.g. Inquiries collected from London Education Expo"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Tags (comma separated):
                                </label>
                                <input
                                    type="text"
                                    value={listTags}
                                    onChange={(e) => setListTags(e.target.value)}
                                    placeholder="students, uk, master"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent focus:outline-none"
                                />
                            </div>

                            {/* CSV File Upload Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Upload CSV File:
                                </label>
                                <div className="border-2 border-dashed border-gray-300 hover:border-brand-primary rounded-xl p-6 text-center bg-gray-50/70 transition-colors">
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleCsvUpload}
                                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-red-700 cursor-pointer"
                                    />
                                    {parsedContacts.length > 0 && (
                                        <div className="mt-3 space-y-1.5">
                                            <div className="text-xs text-green-700 font-semibold flex items-center justify-center gap-1.5 bg-green-50 p-2 rounded-lg border border-green-200">
                                                <Check className="w-4 h-4 text-green-600" />
                                                <span>
                                                    {parsedContacts.length} valid contacts parsed (Columns: {detectedColumns.slice(0, 3).join(', ')}...)
                                                </span>
                                            </div>
                                            {(validationSummary.duplicates > 0 || validationSummary.invalid > 0) && (
                                                <div className="flex items-center justify-center gap-2 text-[11px] font-medium">
                                                    {validationSummary.duplicates > 0 && (
                                                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                            {validationSummary.duplicates} Duplicates Auto-Merged
                                                        </span>
                                                    )}
                                                    {validationSummary.invalid > 0 && (
                                                        <span className="text-brand-primary bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                                            {validationSummary.invalid} Invalid Excluded
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {saveError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-brand-primary rounded-lg text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{saveError}</span>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving || parsedContacts.length === 0}
                                    className="btn-primary text-xs py-2.5 px-6 shadow-md disabled:opacity-40 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Save Contact List</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ════════════════════ VIEW CONTACTS MODAL ════════════════════ */}
            {viewingList && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 max-w-3xl w-full shadow-2xl text-gray-900 my-8 flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-bold text-brand-secondary">{viewingList.name}</h3>
                                <p className="text-xs text-gray-500">
                                    {viewingList.contacts?.length || 0} total contacts in this audience list
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingList(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-[10px] sticky top-0 border-b border-gray-200">
                                    <tr>
                                        {viewingList.customColumns?.map((c) => (
                                            <th key={c} className="py-2.5 px-3 font-semibold">
                                                {c}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {viewingList.contacts?.map((contact, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            {viewingList.customColumns?.map((c) => (
                                                <td key={c} className="py-2 px-3 font-mono text-[11px]">
                                                    {String(contact[c] || '')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                            <Link
                                href={`/admin/email-marketing/campaigns/new?listId=${viewingList.id}`}
                                className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4 shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Campaign with This List</span>
                            </Link>

                            <button
                                onClick={() => setViewingList(null)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
