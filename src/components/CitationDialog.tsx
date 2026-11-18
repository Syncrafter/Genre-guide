import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { CITATIONS } from '../data/guideContent';
import { FormattedText } from './FormattedText';

export interface CitationAnchorRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

interface CitationDialogProps {
  citationId: number;
  anchorRect: CitationAnchorRect;
  onClose: () => void;
  onOpenCitation?: (citationId: number, anchorEl: HTMLElement) => void;
}

/** Compact pixel "X" glyph matching InfoboxCard */
const MiniPixelCloseGlyph: React.FC = () => (
  <svg
    viewBox="0 0 9 9"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
    className="w-[11px] h-[11px] block shrink-0"
  >
    <rect x="1" y="1" width="2" height="2" />
    <rect x="6" y="1" width="2" height="2" />
    <rect x="2" y="2" width="2" height="2" />
    <rect x="5" y="2" width="2" height="2" />
    <rect x="3" y="3" width="3" height="3" />
    <rect x="2" y="5" width="2" height="2" />
    <rect x="5" y="5" width="2" height="2" />
    <rect x="1" y="6" width="2" height="2" />
    <rect x="6" y="6" width="2" height="2" />
  </svg>
);

const DIALOG_MAX_WIDTH = 320;
const EDGE_MARGIN = 12;
const ANCHOR_GAP = 8;

export const CitationDialog: React.FC<CitationDialogProps> = ({
  citationId,
  anchorRect,
  onClose,
  onOpenCitation,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: anchorRect.bottom + ANCHOR_GAP,
    left: Math.max(EDGE_MARGIN, anchorRect.left),
  });

  const entry = CITATIONS[citationId];

  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el || typeof window === 'undefined') return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const width = rect.width || Math.min(DIALOG_MAX_WIDTH, vw - EDGE_MARGIN * 2);
    const height = rect.height || 120;

    // Center horizontally on the clicked [n] button, clamped inside viewport margins
    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const desiredLeft = anchorCenterX - width / 2;
    const clampedLeft = Math.max(
      EDGE_MARGIN,
      Math.min(desiredLeft, vw - width - EDGE_MARGIN)
    );

    // Prefer opening right below [n]; flip above if near bottom of viewport
    let top = anchorRect.bottom + ANCHOR_GAP;
    if (top + height > vh - EDGE_MARGIN) {
      const aboveTop = anchorRect.top - height - ANCHOR_GAP;
      top =
        aboveTop >= EDGE_MARGIN
          ? aboveTop
          : Math.max(EDGE_MARGIN, vh - height - EDGE_MARGIN);
    }

    setCoords({ top, left: clampedLeft });
  }, [citationId, anchorRect]);

  // Dismiss when clicking outside the citation dialog (unless clicking another [n] button)
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (dialogRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest('[data-citation-trigger="true"]')
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-label={`Citation ${citationId}`}
      data-infobox-container="true"
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className="fixed z-60 w-[min(320px,calc(100vw-24px))] font-guide bg-[#f7f6f0] text-slate-800 border-2 border-slate-900 rounded-[4px] shadow-[5px_5px_0px_#0f172a]"
    >
      {/* Compact Dark Header */}
      <div className="bg-[#1e212b] text-white px-3 py-2 flex items-center justify-between gap-2 rounded-t-[2px] border-b-2 border-slate-900">
        <span className="text-[12.5px] font-bold tracking-wide text-white">
          {entry?.title || `Reference [${citationId}]`}
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close citation dialog"
          className="px-btn px-btn-close w-[22px] h-[22px] shrink-0"
        >
          <MiniPixelCloseGlyph />
        </button>
      </div>

      {/* Citation Body */}
      <div className="p-3.5 flex flex-col gap-2 text-[12.5px] text-slate-800 leading-relaxed">
        {entry ? (
          <>
            <p className="break-words">
              <FormattedText
                text={entry.text}
                onOpenCitation={onOpenCitation}
              />
            </p>
            {entry.url && (
              <a
                href={entry.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#d9482b] hover:underline break-all pt-0.5"
              >
                <span>{entry.urlLabel || entry.url}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </>
        ) : (
          <p className="text-slate-600 italic">
            No citation configured for [{citationId}] yet. Add entry{' '}
            <code className="px-1 py-0.5 rounded bg-slate-900/10 font-mono not-italic text-[11.5px]">
              {citationId}
            </code>{' '}
            to{' '}
            <code className="px-1 py-0.5 rounded bg-slate-900/10 font-mono not-italic text-[11.5px]">
              CITATIONS
            </code>{' '}
            in <strong className="font-semibold not-italic">guideContent.ts</strong>.
          </p>
        )}
      </div>
    </div>
  );
};
