"use client";

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
// @ts-ignore
import TextAlign from '@tiptap/extension-text-align';
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
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link as LinkIcon,
  Table as TableIcon,
  ExternalLink,
  Undo,
  Redo,
  Heading2,
  Heading3,
  Pilcrow,
  Trash2,
  X,
} from 'lucide-react';

interface BlogRichTextEditorProps {
  content?: string | { html?: string; text?: string; body?: string };
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const parseContent = (val: any): string => {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    return val.html || val.text || val.body || '';
  }
  return '';
};

// ─── Modal Component ─────────────────────────────────────────────────────────
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function BlogRichTextEditor({
  content = '',
  onChange,
  minHeight = 'min-h-[220px]',
}: BlogRichTextEditorProps) {
  // Modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(false);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);

  // Statistics
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'leading-relaxed break-words',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-primary underline hover:opacity-80 transition-opacity',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'tableCell', 'tableHeader'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border border-gray-300',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-gray-200',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-gray-900 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 px-4 py-2 text-gray-800',
        },
      }),
    ],
    content: parseContent(content),
    editorProps: {
      attributes: {
        class: `blog-rich-content course-rich-content focus:outline-none p-4 ${minHeight} text-gray-800 font-sans leading-relaxed`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);

      // Reactive counters
      const text = editor.getText();
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
      setCharCount(text.length);
    },
  });

  // Keep editor content in sync with external value updates
  useEffect(() => {
    if (editor) {
      const parsed = parseContent(content);
      if (parsed !== editor.getHTML()) {
        editor.commands.setContent(parsed, { emitUpdate: false });
        const text = editor.getText();
        const trimmed = text.trim();
        setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
        setCharCount(text.length);
      }
    }
  }, [content, editor]);

  // Initial stats calculation
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor]);

  if (!editor) return null;

  // Active state button helper
  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-1 ${
      active
        ? 'bg-brand-primary text-white shadow-xs'
        : 'hover:bg-gray-100 text-gray-700'
    }`;

  // Link Handlers
  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    const target = editor.getAttributes('link').target;
    setLinkUrl(previousUrl);
    setLinkTargetBlank(target === '_blank');
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    const trimmed = linkUrl.trim();
    if (trimmed === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({
          href: trimmed,
          target: linkTargetBlank ? '_blank' : null,
        })
        .run();
    }
    setIsLinkModalOpen(false);
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkModalOpen(false);
  };

  // Table Handlers
  const handleInsertTable = () => {
    const rows = Math.max(1, Math.min(20, tableRows || 1));
    const cols = Math.max(1, Math.min(10, tableCols || 1));
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: tableHeader })
      .run();
    setIsTableModalOpen(false);
  };

  return (
    <div className="border border-gray-300 rounded-xl bg-white overflow-hidden shadow-xs focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all">
      {/* Primary Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50/80 border-b border-gray-200">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btnClass(editor.isActive('paragraph'))}
          title="Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        {/* Lists, Link & Table */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className={btnClass(editor.isActive('link'))}
          title="Insert Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-xs">Link</span>
        </button>
        <button
          type="button"
          onClick={() => setIsTableModalOpen(true)}
          className={btnClass(editor.isActive('table'))}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
          <span className="text-xs">Table</span>
        </button>

        <div className="w-[1px] h-6 bg-gray-200 mx-1" />

        {/* History: Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 hover:bg-gray-100 text-gray-700 rounded-lg disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Table Context Sub-Toolbar (Active when cursor is inside a table) */}
      {editor.isActive('table') && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-blue-50/90 border-b border-blue-200 text-xs text-blue-900 animate-in fade-in duration-100">
          <span className="font-bold text-[11px] uppercase tracking-wider text-blue-800 mr-1 flex items-center gap-1.5">
            <TableIcon className="w-3.5 h-3.5 text-blue-700" /> Table Controls:
          </span>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-medium transition-colors"
            title="Add column to left"
          >
            + Col Left
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-medium transition-colors"
            title="Add column to right"
          >
            + Col Right
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2.5 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-[11px] font-medium transition-colors"
            title="Delete current column"
          >
            Del Col
          </button>

          <span className="text-blue-300">|</span>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-medium transition-colors"
            title="Add row above"
          >
            + Row Above
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-medium transition-colors"
            title="Add row below"
          >
            + Row Below
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2.5 py-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-[11px] font-medium transition-colors"
            title="Delete current row"
          >
            Del Row
          </button>

          <span className="text-blue-300">|</span>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
            className="px-2.5 py-1 bg-white border border-blue-200 hover:bg-blue-100 rounded-md text-[11px] font-medium transition-colors"
            title="Toggle Header Cell"
          >
            Header Cell
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded-md text-[11px] font-semibold ml-auto transition-colors flex items-center gap-1 shadow-xs"
            title="Delete Table"
          >
            <Trash2 className="w-3 h-3" />
            Delete Table
          </button>
        </div>
      )}

      {/* Editor Content Canvas */}
      <div className="bg-white min-h-[200px]">
        <EditorContent editor={editor} />
      </div>

      {/* Character & Word Count Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50/60 text-[11px] text-gray-500 flex items-center justify-between font-mono">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>

      {/* ── Link Insertion Modal ── */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Insert / Edit Hyperlink"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Enter the URL to hyperlink the selected text.
          </p>
          <div className="space-y-1.5">
            <label htmlFor="link-url-input" className="block text-xs font-semibold text-gray-700">
              Target URL
            </label>
            <input
              id="link-url-input"
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveLink();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="link-target-blank"
              checked={linkTargetBlank}
              onChange={(e) => setLinkTargetBlank(e.target.checked)}
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary h-4 w-4"
            />
            <label htmlFor="link-target-blank" className="text-xs text-gray-700 cursor-pointer flex items-center gap-1">
              Open in new window / tab
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </label>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {editor.isActive('link') ? (
              <button
                type="button"
                onClick={handleRemoveLink}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Remove Link
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-primary hover:bg-red-700 transition-colors"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Table Generator Modal ── */}
      <Modal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        title="Insert Table Grid"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-500">
            Configure grid dimensions for the new table. Columns and rows can be modified or resized dynamically.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="table-rows-input" className="block text-xs font-semibold text-gray-700">
                Number of Rows
              </label>
              <input
                id="table-rows-input"
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="table-cols-input" className="block text-xs font-semibold text-gray-700">
                Number of Columns
              </label>
              <input
                id="table-cols-input"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="table-header-check"
              checked={tableHeader}
              onChange={(e) => setTableHeader(e.target.checked)}
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary h-4 w-4"
            />
            <label htmlFor="table-header-check" className="text-xs text-gray-700 cursor-pointer">
              Include Header Row (styled header cells)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsTableModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-primary hover:bg-red-700 transition-colors"
            >
              Insert Table
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

