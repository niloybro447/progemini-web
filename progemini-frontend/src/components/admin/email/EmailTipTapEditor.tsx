'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
// @ts-ignore
import TextAlign from '@tiptap/extension-text-align';
// @ts-ignore
import { Table } from '@tiptap/extension-table';
// @ts-ignore
import { TableRow } from '@tiptap/extension-table-row';
// @ts-ignore
import { TableHeader } from '@tiptap/extension-table-header';
// @ts-ignore
import { TableCell } from '@tiptap/extension-table-cell';
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Code,
    Eye,
    Edit3,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Minus,
    Quote,
    Tag,
    X,
} from 'lucide-react';

interface EmailTipTapEditorProps {
    value: string;
    onChange: (html: string) => void;
    customTokens?: string[];
    minHeight?: string;
}

export default function EmailTipTapEditor({
    value,
    onChange,
    customTokens = ['name', 'institution_name', 'email', 'address', 'phone_number'],
    minHeight = '360px',
}: EmailTipTapEditorProps) {
    const [mode, setMode] = useState<'editor' | 'raw_html' | 'preview'>('editor');
    const [rawHtml, setRawHtml] = useState(value || '');
    const [isMounted, setIsMounted] = useState(false);

    // Modals
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync rawHtml when value changes externally
    useEffect(() => {
        setRawHtml(value || '');
    }, [value]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc pl-6 my-2 space-y-1',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal pl-6 my-2 space-y-1',
                    },
                },
                listItem: {
                    HTMLAttributes: {
                        class: 'my-0.5',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'border-l-4 border-brand-primary pl-4 py-1 italic text-gray-600 my-3 bg-gray-50/50 rounded-r',
                    },
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-brand-primary underline font-medium',
                    target: '_blank',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-3 border border-gray-200',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4 border border-gray-300 text-sm',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 bg-gray-100 font-semibold p-2 text-left text-gray-800',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 p-2 text-gray-700',
                },
            }),
        ],
        content: value || '<p>Write your email content here...</p>',
        editorProps: {
            attributes: {
                class: 'course-rich-content prose max-w-none focus:outline-none p-6 text-gray-800 text-sm leading-relaxed min-h-[300px]',
                style: `min-height: ${minHeight};`,
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            setRawHtml(html);
            onChange(html);
        },
    });

    // When value changes from template selection or draft load
    useEffect(() => {
        if (editor && value !== undefined && isMounted) {
            const currentContent = editor.getHTML();
            if (currentContent !== value && mode === 'editor') {
                editor.commands.setContent(value, { emitUpdate: false });
            }
        }
    }, [value, editor, mode, isMounted]);

    const insertToken = (token: string) => {
        const tokenFormatted = `{{${token}}}`;
        if (mode === 'editor' && editor) {
            editor.chain().focus().insertContent(tokenFormatted).run();
        } else {
            const newHtml = rawHtml + ' ' + tokenFormatted;
            setRawHtml(newHtml);
            onChange(newHtml);
        }
    };

    const handleSetLink = () => {
        if (!editor) return;
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }
        setShowLinkModal(false);
        setLinkUrl('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('folder', 'email-campaign-images');

        try {
            const res = await fetch('/api/files/upload', {
                method: 'POST',
                body: uploadData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await res.json();
            editor.chain().focus().setImage({ src: data.downloadUrl }).run();
            setShowImageModal(false);
        } catch (error: any) {
            console.error('Image upload failed:', error);
            alert(error.message || 'Image upload failed. You can paste an image URL instead.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleInsertImageUrl = () => {
        if (!editor || !imageUrl) return;
        editor.chain().focus().setImage({ src: imageUrl }).run();
        setImageUrl('');
        setShowImageModal(false);
    };

    const handleRawHtmlChange = (newVal: string) => {
        setRawHtml(newVal);
        onChange(newVal);
        if (editor) {
            editor.commands.setContent(newVal, { emitUpdate: false });
        }
    };

    if (!isMounted) {
        return (
            <div className="border border-gray-300 rounded-xl p-8 bg-gray-50 flex items-center justify-center min-h-[360px]">
                <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                    <span>Loading TipTap editor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col">
            {/* Top Bar: View Mode Switcher & Token Helpers */}
            <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shadow-xs">
                    <button
                        type="button"
                        onClick={() => setMode('editor')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            mode === 'editor'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Visual Editor</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('raw_html')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            mode === 'raw_html'
                                ? 'bg-brand-primary text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Code className="w-3.5 h-3.5" />
                        <span>HTML Code</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('preview')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            mode === 'preview'
                                ? 'bg-brand-secondary text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live Preview</span>
                    </button>
                </div>

                {/* Merge Tags / Tokens Helper */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1 mr-1">
                        <Tag className="w-3 h-3 text-brand-primary" /> Insert Variable:
                    </span>
                    {customTokens.map((token) => (
                        <button
                            key={token}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => insertToken(token)}
                            className="px-2.5 py-1 rounded text-[11px] font-mono bg-red-50 hover:bg-red-100 text-brand-primary border border-red-200 transition-all flex items-center gap-1 active:scale-95 font-semibold"
                            title={`Insert {{${token}}}`}
                        >
                            <span>+ {`{{${token}}}`}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Visual Editor Toolbar */}
            {mode === 'editor' && editor && (
                <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 text-gray-700">
                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('bold')
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('italic')
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('strike')
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Strikethrough"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('heading', { level: 1 })
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('heading', { level: 2 })
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('heading', { level: 3 })
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('bulletList')
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('orderedList')
                                ? 'bg-red-50 text-brand-primary font-bold'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('blockquote')
                                ? 'bg-red-50 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Blockquote"
                    >
                        <Quote className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
                        title="Horizontal Divider"
                    >
                        <Minus className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive({ textAlign: 'left' })
                                ? 'bg-red-50 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Align Left"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive({ textAlign: 'center' })
                                ? 'bg-red-50 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Align Center"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive({ textAlign: 'right' })
                                ? 'bg-red-50 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Align Right"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href;
                            setLinkUrl(previousUrl || '');
                            setShowLinkModal(true);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                            editor.isActive('link')
                                ? 'bg-red-50 text-brand-primary'
                                : 'hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Add or Edit Link"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setShowImageModal(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
                        title="Insert Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                                .run()
                        }
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-700"
                        title="Insert Table"
                    >
                        <TableIcon className="w-4 h-4" />
                    </button>

                    <div className="h-4 w-px bg-gray-300 mx-1" />

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-30"
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="relative flex-1 bg-white">
                {mode === 'editor' && (
                    <EditorContent
                        editor={editor}
                        className="course-rich-content prose max-w-none text-gray-800 bg-white"
                    />
                )}

                {mode === 'raw_html' && (
                    <div className="p-4 bg-gray-900 font-mono text-xs text-green-400">
                        <textarea
                            value={rawHtml}
                            onChange={(e) => handleRawHtmlChange(e.target.value)}
                            rows={18}
                            className="w-full bg-transparent text-green-300 focus:outline-none resize-y font-mono text-xs leading-relaxed"
                            placeholder="Enter raw HTML email template..."
                            spellCheck={false}
                        />
                    </div>
                )}

                {mode === 'preview' && (
                    <div className="p-6 bg-gray-100 min-h-[400px] flex justify-center items-start overflow-auto">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 max-w-[650px] w-full p-6 overflow-hidden">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-2 mb-4 flex items-center justify-between">
                                <span>Simulated Recipient View</span>
                                <span className="text-brand-primary bg-red-50 px-2 py-0.5 rounded text-[10px] font-mono border border-red-200">
                                    Max Width 600px
                                </span>
                            </div>
                            <div
                                className="email-preview-render course-rich-content text-gray-900 text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: rawHtml || '<p class="text-gray-400 italic">No content to preview</p>',
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-2xl text-gray-900">
                        <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-brand-secondary">
                            <LinkIcon className="w-4 h-4 text-brand-primary" /> Insert or Edit Link
                        </h3>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs mb-4 focus:ring-2 focus:ring-brand-primary focus:outline-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setShowLinkModal(false)}
                                className="px-4 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSetLink}
                                className="btn-primary text-xs py-2 px-4 shadow-sm"
                            >
                                Apply Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md w-full shadow-2xl text-gray-900">
                        <h3 className="text-base font-bold mb-4 flex items-center gap-2 text-brand-secondary">
                            <ImageIcon className="w-4 h-4 text-brand-primary" /> Insert Email Image
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Upload from Computer:
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-red-700 cursor-pointer"
                                />
                                {uploadingImage && (
                                    <p className="text-[11px] text-brand-primary mt-1">Uploading image...</p>
                                )}
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="border-t border-gray-200 w-full" />
                                <span className="bg-white px-3 text-[10px] uppercase text-gray-400 font-semibold absolute">
                                    or
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                    Image URL:
                                </label>
                                <input
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-xs focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowImageModal(false)}
                                className="px-4 py-2 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertImageUrl}
                                disabled={!imageUrl}
                                className="btn-primary text-xs py-2 px-4 shadow-sm disabled:opacity-40"
                            >
                                Insert URL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
