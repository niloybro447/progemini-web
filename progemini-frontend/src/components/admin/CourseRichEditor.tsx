"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
// @ts-ignore
import TextAlign from "@tiptap/extension-text-align";
// @ts-ignore
import { apiClient } from "@/lib/apiClient";
import { Table } from "@tiptap/extension-table";
// @ts-ignore
import { TableRow } from "@tiptap/extension-table-row";
// @ts-ignore
import { TableHeader } from "@tiptap/extension-table-header";
// @ts-ignore
import { TableCell } from "@tiptap/extension-table-cell";

export interface RichContent {
  json: any;
  html: string;
}

function toRichContent(content: unknown): RichContent {
  if (!content) return { json: null, html: "" };

  if (typeof content === "object" && content !== null) {
    const asRich = content as { json?: unknown; html?: unknown };
    if (asRich.json !== undefined || asRich.html !== undefined) {
      return {
        json: asRich.json ?? null,
        html: typeof asRich.html === "string" ? asRich.html : "",
      };
    }

    const asDoc = content as { type?: string };
    if (asDoc.type === "doc") {
      return { json: content, html: "" };
    }
  }

  if (typeof content === "string") {
    let candidate: unknown = content;

    for (let i = 0; i < 2; i++) {
      if (typeof candidate !== "string") break;
      const trimmed = candidate.trim();
      if (!trimmed) return { json: null, html: "" };

      try {
        candidate = JSON.parse(trimmed);
      } catch {
        return { json: null, html: typeof candidate === "string" ? candidate : "" };
      }
    }

    return toRichContent(candidate);
  }

  return { json: null, html: "" };
}

interface CourseRichEditorProps {
  value: RichContent;
  onChange: (content: RichContent) => void;
  placeholder?: string;
  minHeight?: string;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── MenuBar ──────────────────────────────────────────────────────────────────
const MenuBar = ({ editor }: { editor: any }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("folder", "course-content-images");

    try {
      const data = await apiClient.upload<{ downloadUrl: string }>("/v1/files/upload", uploadData);
      editor.chain().focus().setImage({ src: data.downloadUrl }).run();
      setShowImageModal(false);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!editor) return null;

  const addImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setShowImageModal(false);
    }
  };

  const applyLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkModal(false);
      return;
    }
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setShowLinkModal(false);
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
      .run();
    setTableRows(3);
    setTableCols(3);
    setShowTableModal(false);
  };

  const openLinkModal = () => {
    setLinkUrl(editor.getAttributes("link").href || "");
    setShowLinkModal(true);
  };

  const getHeadingLevel = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    return "normal";
  };

  const handleHeadingChange = (value: string) => {
    if (value === "normal") {
      editor.chain().focus().setParagraph().run();
    } else if (value === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const getAlignment = () => {
    try {
      const p = editor.getAttributes("paragraph");
      if (p?.textAlign) return p.textAlign;
      const h = editor.getAttributes("heading");
      if (h?.textAlign) return h.textAlign;
    } catch (_) {}
    return "left";
  };

  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${
      active
        ? "bg-brand-primary text-white"
        : "hover:bg-gray-100 text-gray-700"
    } focus:outline-none focus:ring-2 focus:ring-brand-primary`;

  const selectCls =
    "px-2 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer";

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all text-sm";

  const modalBtnPrimary =
    "px-4 py-2 rounded-lg bg-brand-primary text-white hover:opacity-90 transition-colors text-sm font-medium";
  const modalBtnSecondary =
    "px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm";

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 py-2 flex flex-wrap items-center gap-1 rounded-t-lg">

        {/* Bold / Italic / Strike */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleBold().run();
            }}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={btn(editor.isActive("bold"))}
            title="Bold (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 2A1.5 1.5 0 004 3.5v13A1.5 1.5 0 005.5 18h5.25a3.75 3.75 0 002.006-6.93A3.5 3.5 0 0010.5 4H5.5zm.75 2h4.25a1.5 1.5 0 010 3H6.25V4zm0 5h4.75a2.25 2.25 0 010 4.5H6.25V9z" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleItalic().run();
            }}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={btn(editor.isActive("italic"))}
            title="Italic (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.5 4a.5.5 0 01.5-.5h3a.5.5 0 010 1h-1.146l-1.708 7H10.5a.5.5 0 010 1h-3a.5.5 0 010-1h1.146l1.708-7H8.5a.5.5 0 01-.5-.5z" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleStrike().run();
            }}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={btn(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 10h12M7 6.5c0-1.1.9-2.5 3-2.5s3 1 3 2.5M7 13.5c0 1.1.9 2.5 3 2.5s3-1 3-2.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Heading dropdown */}
        <div className="pr-2 border-r border-gray-200">
          <select
            value={getHeadingLevel()}
            onChange={(e) => handleHeadingChange(e.target.value)}
            className={selectCls}
            title="Text style"
          >
            <option value="normal">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Alignment dropdown */}
        <div className="pr-2 border-r border-gray-200">
          <select
            value={getAlignment()}
            onChange={(e) => {
              editor.chain().focus().setTextAlign(e.target.value as any).run();
            }}
            className={selectCls}
            title="Alignment"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
            }}
            className={btn(editor.isActive("bulletList"))}
            title="Bullet list"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 5a1 1 0 100-2 1 1 0 000 2zM4 11a1 1 0 100-2 1 1 0 000 2zM4 17a1 1 0 100-2 1 1 0 000 2zM8 4a1 1 0 011-1h7a1 1 0 110 2H9A1 1 0 018 4zM8 10a1 1 0 011-1h7a1 1 0 110 2H9a1 1 0 01-1-1zM8 16a1 1 0 011-1h7a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
            }}
            className={btn(editor.isActive("orderedList"))}
            title="Numbered list"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>

        {/* Blockquote / Code */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btn(editor.isActive("blockquote"))}
            title="Blockquote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={btn(editor.isActive("codeBlock"))}
            title="Code block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        </div>

        {/* Link / Image / Table */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={openLinkModal}
            className={btn(editor.isActive("link"))}
            title="Insert link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowImageModal(true)}
            className={btn(false)}
            title="Insert image"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowTableModal(true)}
            className={btn(false)}
            title="Insert table"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v2h2V5H5zm4 0v2h2V5H9zm4 0v2h2V5h-2zM5 9v2h2V9H5zm4 0v2h2V9H9zm4 0v2h2V9h-2zM5 13v2h2v-2H5zm4 0v2h2v-2H9zm4 0v2h2v-2h-2z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            title="Undo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 110 14H4a1 1 0 110-2h7a5 5 0 100-10H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            title="Redo"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 9H9a5 5 0 100 10h7a1 1 0 110 2H9A7 7 0 119 7h5.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <Modal isOpen={showImageModal} onClose={() => setShowImageModal(false)} title="Insert Image">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Option 1: Upload from Device (MinIO)</label>
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-brand-primary cursor-pointer transition-colors bg-gray-50/50 hover:bg-red-50/10 group">
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage}
              />
              {uploadingImage ? (
                <div className="flex flex-col items-center space-y-2 py-2">
                  <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full" />
                  <span className="text-xs font-semibold text-gray-500">Uploading to MinIO...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-center py-2">
                  <svg className="w-8 h-8 text-gray-400 group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700">Click to choose image file</span>
                  <span className="text-[10px] text-gray-400">PNG, JPEG, JPG, WEBP (Max 10MB)</span>
                </div>
              )}
            </label>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option 2: Web Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={inputCls}
              onKeyDown={(e) => e.key === "Enter" && addImage()}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setShowImageModal(false)} className={modalBtnSecondary}>Cancel</button>
            <button type="button" onClick={addImage} className={modalBtnPrimary} disabled={!imageUrl.trim()}>Insert URL</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showLinkModal} onClose={() => setShowLinkModal(false)} title="Insert Link">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className={inputCls}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowLinkModal(false)} className={modalBtnSecondary}>Cancel</button>
            <button type="button" onClick={applyLink} className={modalBtnPrimary}>
              {linkUrl ? "Set Link" : "Remove Link"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showTableModal} onClose={() => setShowTableModal(false)} title="Insert Table">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
            <input
              type="number"
              value={tableRows}
              min={1}
              max={20}
              onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
              className={inputCls}
              aria-label="Number of rows"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
            <input
              type="number"
              value={tableCols}
              min={1}
              max={10}
              onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
              className={inputCls}
              aria-label="Number of columns"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowTableModal(false)} className={modalBtnSecondary}>Cancel</button>
            <button type="button" onClick={insertTable} className={modalBtnPrimary}>Insert Table</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// ─── Image Node View Component for Resize handles (Edit Mode) ─────────────────
const ImageNodeView = (props: any) => {
  const { node, updateAttributes, selected, editor, getPos } = props;
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Detect if we're in edit mode by checking the editor instance
  const isEditable = editor?.isEditable === true;

  // Keydown listener to delete image on Backspace or Delete
  useEffect(() => {
    if (!selected || !isEditable || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        e.stopPropagation();
        editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [selected, isEditable, editor, getPos, node.nodeSize]);

  const deleteNode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    editor.commands.deleteRange({ from: getPos(), to: getPos() + node.nodeSize });
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = imageRef.current ? imageRef.current.clientWidth : 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Proportional resizing (scaling width while height stays auto)
      const newWidth = Math.max(50, startWidth + deltaX);
      updateAttributes({
        width: `${newWidth}px`,
        height: 'auto',
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper className="relative select-none my-2 inline-block align-middle mr-4 mb-4" style={{ width: node.attrs.width && node.attrs.width !== '100%' ? node.attrs.width : 'auto', maxWidth: '100%' }}>
      <div className={`relative inline-block max-w-full group rounded-lg overflow-hidden ${selected ? 'ring-2 ring-brand-primary ring-offset-2' : ''}`}>
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt}
          title={node.attrs.title}
          style={{
            width: node.attrs.width || 'auto',
            height: node.attrs.height || 'auto',
            display: 'inline-block',
            maxWidth: '100%',
          }}
          className="max-w-full"
        />
        
        {/* Delete Button - Only visible on hover in edit mode */}
        {isEditable && (
          <button
            type="button"
            onClick={deleteNode}
            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
            style={{ zIndex: 10 }}
            title="Delete image"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        
        {/* Resize Handle - Only visible in edit mode */}
        {isEditable && (
          <div
            onMouseDown={startResize}
            className="absolute bottom-2 right-2 w-5 h-5 bg-brand-primary text-white border-2 border-white rounded-lg cursor-se-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            style={{ zIndex: 10 }}
          >
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
              <line x1="6" y1="18" x2="18" y2="6" />
              <line x1="12" y1="18" x2="18" y2="12" />
            </svg>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};


const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 'auto',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: attributes => ({
          height: attributes.height,
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, {
      as: 'span',
    });
  },
});

// ─── Shared extensions factory ────────────────────────────────────────────────
const buildExtensions = () => [
  StarterKit.configure({
    paragraph: {
      HTMLAttributes: {
        class: "break-words",
      },
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-brand-primary underline hover:opacity-80" },
  }),
  ResizableImage,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Table.configure({
    resizable: true,
    HTMLAttributes: { class: "border-collapse table-auto w-full border border-gray-300 my-4" },
  }),
  TableRow.configure({ HTMLAttributes: { class: "border-b border-gray-200" } }),
  TableHeader.configure({
    HTMLAttributes: { class: "border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-gray-800 text-left" },
  }),
  TableCell.configure({ HTMLAttributes: { class: "border border-gray-300 px-4 py-2 text-gray-700" } }),
];

// Shared class used by both editable and read-only rich content blocks.
const RICH_CLS = "course-rich-content max-w-none";

// ─── Main Editor Component ────────────────────────────────────────────────────
export default function CourseRichEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  minHeight = "min-h-[180px]",
}: CourseRichEditorProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const normalizedValue = toRichContent(value);

  // Initialize with proper content
  const getInitialContent = () => {
    if (normalizedValue.json) return normalizedValue.json;
    if (normalizedValue.html) return normalizedValue.html;
    return "<p></p>";
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(),
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      onChange({ json, html });
    },
    editorProps: {
      attributes: { class: `${RICH_CLS} p-4 ${minHeight} focus:outline-none` },
    },
  });

  // Mark as mounted after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle external value changes (e.g., loading existing data)
  useEffect(() => {
    if (!editor || !isMounted) return;

    // If value changed externally (e.g., form reset or load)
    const valueToSync = normalizedValue.json || normalizedValue.html;
    if (valueToSync) {
      const editorContent = editor.getJSON();
      
      // Only update if the content is actually different
      if (JSON.stringify(editorContent) !== JSON.stringify(normalizedValue.json)) {
        editor.commands.setContent(valueToSync);
      }
    } else if (!editor.isEmpty) {
      editor.commands.clearContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedValue, isMounted]);

  // Show loading state while hydrating
  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 ${minHeight} bg-gray-50 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">Loading editor...</span>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-lg p-4 ${minHeight} bg-red-50 flex items-center justify-center`}>
        <span className="text-red-400 text-sm">Failed to initialize editor</span>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── Read-only renderer (for public course pages) ─────────────────────────────
/**
 * Returns true when a rich-content value (DB string or object) has no visible text.
 * Use this before rendering a section so labels never appear for empty fields.
 */
export function isRichContentEmpty(content: RichContent | string | null | undefined): boolean {
  if (!content) return true;
  const resolved = toRichContent(content);
  // Check HTML: strip all tags and see if any text remains
  if (resolved.html) {
    const stripped = resolved.html.replace(/<[^>]*>/g, "").trim();
    if (stripped) return false;
  }
  // Check TipTap JSON: walk content nodes for text
  if (resolved.json) {
    const raw = JSON.stringify(resolved.json);
    // If there's any non-empty text node the string will contain "text":"..."
    if (/"text"\s*:\s*"[^"]+"/i.test(raw)) return false;
  }
  return true;
}

export function CourseRichRenderer({ content }: { content: RichContent | string | null }) {
  // content may be JSON string, double-encoded JSON string, RichContent object, TipTap doc, or legacy plain string
  const resolved = toRichContent(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildExtensions(),
    content: resolved.json || resolved.html || "",
    editable: false,
    editorProps: {
      attributes: { class: `${RICH_CLS}` },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (resolved.json && JSON.stringify(editor.getJSON()) !== JSON.stringify(resolved.json)) {
      editor.commands.setContent(resolved.json);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, resolved.json]);

  return (
    <div className={RICH_CLS}>
      <EditorContent editor={editor} />
    </div>
  );
}
