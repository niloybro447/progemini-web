'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronDown, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import { BlogBlock } from './types';

interface BlogBlockRendererProps {
  blocks: BlogBlock[];
  postTitle?: string;
}

export default function BlogBlockRenderer({ blocks, postTitle }: BlogBlockRendererProps) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  const sorted = [...blocks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="blog-content-body space-y-8 text-gray-800">
      {sorted.map((block) => (
        <RenderSingleBlock key={block.id} block={block} postTitle={postTitle} />
      ))}
    </div>
  );
}

function RenderSingleBlock({ block, postTitle }: { block: BlogBlock; postTitle?: string }) {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content} />;
    case 'image':
      return <ImageBlock content={block.content} postTitle={postTitle} />;
    case 'accordion':
      return <AccordionBlock content={block.content} />;
    case 'card':
      return <CardBlock content={block.content} />;
    case 'button':
      return <ButtonBlock content={block.content} />;
    case 'quote':
      return <QuoteBlock content={block.content} />;
    default:
      return null;
  }
}

// ── Text Block ─────────────────────────────────────────────────────────
function TextBlock({ content }: { content: any }) {
  const html = typeof content === 'string' ? content : (content?.html || content?.text || '');
  if (!html) return null;

  return (
    <div
      className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-normal
        prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
        prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
        prose-p:mb-4 prose-p:leading-relaxed
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
        prose-li:my-1.5
        prose-a:text-brand-primary prose-a:underline hover:prose-a:text-red-700
        prose-strong:text-gray-900 prose-strong:font-semibold"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Image Block ────────────────────────────────────────────────────────
function ImageBlock({ content, postTitle }: { content: any; postTitle?: string }) {
  const url = typeof content === 'string' ? content : content?.url;
  const caption = content?.caption || '';
  const alt = content?.alt || caption || postTitle || 'Progemini Academy Blog';

  if (!url) return null;

  return (
    <figure className="my-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm border border-gray-100">
        <Image
          src={url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 850px"
        />
      </div>
      {caption && (
        <figcaption className="mt-2.5 text-center text-xs text-gray-500 font-medium italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// ── Accordion Block ───────────────────────────────────────────────────
function AccordionBlock({ content }: { content: any }) {
  const items = Array.isArray(content) ? content : (content?.items || []);
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true });

  if (!items || items.length === 0) return null;

  const toggle = (idx: number) => {
    setOpenIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="my-8 space-y-3 rounded-2xl bg-gray-50/80 p-4 md:p-6 border border-gray-200">
      {items.map((item: any, idx: number) => {
        const isOpen = Boolean(openIndices[idx]);
        return (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all shadow-sm"
          >
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-gray-900 hover:text-brand-primary transition-colors"
            >
              <span className="text-base md:text-lg pr-4">{item.title || `Item ${idx + 1}`}</span>
              <FaChevronDown
                className={`text-sm text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-brand-primary' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-4 text-sm md:text-base text-gray-600 leading-relaxed bg-gray-50/30">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: item.content || item.description || '',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Card Block ────────────────────────────────────────────────────────
function CardBlock({ content }: { content: any }) {
  const items = Array.isArray(content) ? content : (content?.items || []);
  if (!items || items.length === 0) return null;

  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((item: any, idx: number) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-brand-primary/40 transition-all flex flex-col justify-between"
        >
          <div>
            {item.badge && (
              <span className="inline-block rounded-full bg-red-50 text-brand-primary border border-red-100 px-3 py-0.5 text-xs font-semibold mb-3">
                {item.badge}
              </span>
            )}
            <h4 className="text-lg font-bold text-gray-900 mb-2">
              {item.title}
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description || item.content}
            </p>
          </div>
          {item.link && (
            <Link
              href={item.link}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-red-700 transition-colors"
            >
              <span>{item.linkText || 'Learn More'}</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Button Block ──────────────────────────────────────────────────────
function ButtonBlock({ content }: { content: any }) {
  const text = content?.text || content?.label || 'Learn More';
  const url = content?.url || content?.link || '#';
  const align = content?.align || 'center';
  const variant = content?.variant || 'primary';

  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';

  const variantClass =
    variant === 'outline'
      ? 'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'
      : variant === 'secondary'
      ? 'bg-gray-900 text-white hover:bg-gray-800'
      : 'bg-brand-primary text-white hover:bg-red-700 shadow-md';

  return (
    <div className={`my-8 flex ${alignClass}`}>
      <Link
        href={url}
        className={`inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition-all ${variantClass}`}
      >
        <span>{text}</span>
        <FaArrowRight className="text-xs" />
      </Link>
    </div>
  );
}

// ── Quote Block ───────────────────────────────────────────────────────
function QuoteBlock({ content }: { content: any }) {
  const quote = typeof content === 'string' ? content : content?.quote || content?.text;
  const author = content?.author || '';
  const title = content?.title || '';

  if (!quote) return null;

  return (
    <blockquote className="my-8 relative overflow-hidden rounded-2xl border-l-4 border-brand-primary bg-gradient-to-r from-red-50/50 to-gray-50 p-6 md:p-8">
      <FaQuoteLeft className="text-brand-primary/20 text-3xl mb-2" />
      <p className="text-base md:text-lg italic text-gray-800 leading-relaxed font-serif">
        &ldquo;{quote}&rdquo;
      </p>
      {(author || title) && (
        <footer className="mt-4 text-xs font-semibold text-gray-700">
          — {author} {title ? <span className="font-normal text-gray-500">({title})</span> : null}
        </footer>
      )}
    </blockquote>
  );
}

