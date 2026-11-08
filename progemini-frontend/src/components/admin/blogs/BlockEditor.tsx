'use client';

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaParagraph,
  FaImage,
  FaListUl,
  FaThLarge,
  FaLink,
  FaQuoteLeft,
  FaUpload,
  FaSpinner,
} from 'react-icons/fa';
import { BlogBlock } from '@/components/blog/types';
import { apiClient } from '@/lib/apiClient';
import toast from 'react-hot-toast';

interface BlockEditorProps {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  const addBlock = (type: BlogBlock['type']) => {
    let defaultContent: any = '';

    switch (type) {
      case 'text':
        defaultContent = { html: '<p>Write your section content here...</p>' };
        break;
      case 'image':
        defaultContent = { url: '', caption: '', alt: '' };
        break;
      case 'accordion':
        defaultContent = {
          items: [
            { title: 'Frequently Asked Question 1', content: 'Detailed answer or guidance goes here.' },
            { title: 'Frequently Asked Question 2', content: 'Detailed answer or guidance goes here.' },
          ],
        };
        break;
      case 'card':
        defaultContent = {
          items: [
            { title: 'Key Feature', description: 'Brief description of this aspect or topic.', badge: 'Highlight' },
            { title: 'Key Requirement', description: 'Brief description of this aspect or topic.', badge: 'Standard' },
          ],
        };
        break;
      case 'button':
        defaultContent = { text: 'Apply for Programme', url: '/apply', variant: 'primary', align: 'center' };
        break;
      case 'quote':
        defaultContent = { quote: 'Anticipate future academic demands with industry-focused qualifications.', author: 'Dean of Studies' };
        break;
    }

    const newBlock: BlogBlock = {
      id: uuidv4(),
      type,
      content: defaultContent,
      order: blocks.length + 1,
    };

    onChange([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, newContent: any) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, content: newContent } : b));
    onChange(updated);
  };

  const removeBlock = (id: string) => {
    const filtered = blocks.filter((b) => b.id !== id);
    const reordered = filtered.map((b, idx) => ({ ...b, order: idx + 1 }));
    onChange(reordered);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const reordered = [...blocks];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const finalized = reordered.map((b, i) => ({ ...b, order: i + 1 }));
    onChange(finalized);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="text-base font-bold text-gray-900">Article Content Blocks</h3>
        <span className="text-xs text-gray-500 font-medium">
          {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'} configured
        </span>
      </div>

      {/* Block List */}
      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
            <FaParagraph className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-sm font-semibold text-gray-700">No content blocks yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Choose a block type below to begin crafting your article.
            </p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300"
            >
              {/* Block Header */}
              <div className="mb-3 flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold text-brand-primary">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    {block.type} Block
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500">
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Move Up"
                  >
                    <FaArrowUp className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Move Down"
                  >
                    <FaArrowDown className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 ml-1"
                    title="Delete Block"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Block Content Editor Form */}
              <BlockItemContent
                block={block}
                onChange={(content) => updateBlockContent(block.id, content)}
              />
            </div>
          ))
        )}
      </div>

      {/* Block Type Selector Toolbar */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">
          Add Content Block
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaParagraph className="text-base text-gray-500" />
            <span>Rich Text</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('image')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaImage className="text-base text-gray-500" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('accordion')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaListUl className="text-base text-gray-500" />
            <span>Accordion</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('card')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaThLarge className="text-base text-gray-500" />
            <span>Info Cards</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('button')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaLink className="text-base text-gray-500" />
            <span>CTA Button</span>
          </button>

          <button
            type="button"
            onClick={() => addBlock('quote')}
            className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-700 hover:border-brand-primary hover:text-brand-primary hover:shadow-sm transition-all"
          >
            <FaQuoteLeft className="text-base text-gray-500" />
            <span>Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockItemContent({
  block,
  onChange,
}: {
  block: BlogBlock;
  onChange: (content: any) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await apiClient.post<{ success: boolean; data: { url: string } }>(
        '/admin/blogs/upload-image',
        formData
      );
      if (res.data?.url) {
        onChange({ ...block.content, url: res.data.url });
        toast.success('Image uploaded to MinIO');
      }
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  switch (block.type) {
    case 'text': {
      const html = typeof block.content === 'string' ? block.content : block.content?.html || '';
      return (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-600">HTML / Text Content</label>
          <textarea
            rows={6}
            value={html}
            onChange={(e) => onChange({ html: e.target.value })}
            placeholder="Write content (supports HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>)"
            className="w-full rounded-lg border border-gray-300 p-3 text-sm font-mono text-gray-800 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>
      );
    }

    case 'image': {
      const url = block.content?.url || '';
      const caption = block.content?.caption || '';
      const alt = block.content?.alt || '';

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Image URL (or upload to MinIO)</label>
              <input
                type="text"
                value={url}
                onChange={(e) => onChange({ ...block.content, url: e.target.value })}
                placeholder="https://... or uploaded image"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-800 focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Upload to MinIO</label>
              <div className="mt-1 flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-100">
                  {uploading ? (
                    <FaSpinner className="animate-spin text-brand-primary" />
                  ) : (
                    <FaUpload className="text-gray-500" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                    }}
                  />
                </label>
                {url && <span className="text-xs text-green-600 font-semibold truncate max-w-[180px]">Uploaded</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Caption (optional)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => onChange({ ...block.content, caption: e.target.value })}
                placeholder="Photo: Oxford campus lecture hall"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-800 focus:border-brand-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Alt Text (SEO)</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => onChange({ ...block.content, alt: e.target.value })}
                placeholder="Lecture in modern seminar room"
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm text-gray-800 focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    case 'accordion': {
      const items = Array.isArray(block.content?.items) ? block.content.items : [];

      const addItem = () => {
        onChange({
          items: [...items, { title: 'New Question', content: 'Answer text...' }],
        });
      };

      const updateItem = (idx: number, field: string, val: string) => {
        const next = items.map((it: any, i: number) => (i === idx ? { ...it, [field]: val } : it));
        onChange({ items: next });
      };

      const removeItem = (idx: number) => {
        onChange({ items: items.filter((_: any, i: number) => i !== idx) });
      };

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600">Accordion Items</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              <FaPlus className="text-[10px]" /> Add Item
            </button>
          </div>

          {items.map((item: any, idx: number) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Item #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateItem(idx, 'title', e.target.value)}
                placeholder="Question / Header"
                className="w-full rounded border border-gray-300 p-2 text-sm font-semibold"
              />
              <textarea
                rows={2}
                value={item.content || ''}
                onChange={(e) => updateItem(idx, 'content', e.target.value)}
                placeholder="Answer / Content (HTML allowed)"
                className="w-full rounded border border-gray-300 p-2 text-sm"
              />
            </div>
          ))}
        </div>
      );
    }

    case 'card': {
      const items = Array.isArray(block.content?.items) ? block.content.items : [];

      const addItem = () => {
        onChange({
          items: [...items, { title: 'Card Title', description: 'Description...', badge: 'Highlight' }],
        });
      };

      const updateItem = (idx: number, field: string, val: string) => {
        const next = items.map((it: any, i: number) => (i === idx ? { ...it, [field]: val } : it));
        onChange({ items: next });
      };

      const removeItem = (idx: number) => {
        onChange({ items: items.filter((_: any, i: number) => i !== idx) });
      };

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600">Card Items</label>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              <FaPlus className="text-[10px]" /> Add Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">Card #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={item.badge || ''}
                  onChange={(e) => updateItem(idx, 'badge', e.target.value)}
                  placeholder="Badge text (e.g. Core Module)"
                  className="w-full rounded border border-gray-300 p-1.5 text-xs"
                />
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateItem(idx, 'title', e.target.value)}
                  placeholder="Card Title"
                  className="w-full rounded border border-gray-300 p-1.5 text-sm font-semibold"
                />
                <textarea
                  rows={2}
                  value={item.description || ''}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  placeholder="Card description..."
                  className="w-full rounded border border-gray-300 p-1.5 text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'button': {
      const text = block.content?.text || '';
      const url = block.content?.url || '';
      const variant = block.content?.variant || 'primary';
      const align = block.content?.align || 'center';

      return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-600">Button Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => onChange({ ...block.content, text: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              placeholder="e.g. Apply Now"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Target URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => onChange({ ...block.content, url: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
              placeholder="/apply or /courses"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Style</label>
            <select
              value={variant}
              onChange={(e) => onChange({ ...block.content, variant: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 p-2 text-sm"
            >
              <option value="primary">Primary Red</option>
              <option value="secondary">Dark Gray</option>
              <option value="outline">Red Outline</option>
            </select>
          </div>
        </div>
      );
    }

    case 'quote': {
      const quote = block.content?.quote || '';
      const author = block.content?.author || '';

      return (
        <div className="space-y-2">
          <div>
            <label className="text-xs font-semibold text-gray-600">Quote Text</label>
            <textarea
              rows={2}
              value={quote}
              onChange={(e) => onChange({ ...block.content, quote: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm italic"
              placeholder="Important quote or testimonial..."
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Author / Source</label>
            <input
              type="text"
              value={author}
              onChange={(e) => onChange({ ...block.content, author: e.target.value })}
              className="w-full rounded border border-gray-300 p-2 text-sm"
              placeholder="Academic Director, Progemini Academy"
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

