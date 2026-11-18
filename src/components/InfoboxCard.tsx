import React, { useState } from 'react';
import { ExternalLink, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { GuideSection } from '../data/guideContent';
import { FormattedText } from './FormattedText';

interface InfoboxCardProps {
  section: GuideSection;
  currentPage: number;
  onPageChange: (nextPage: number) => void;
  onClose: () => void;
  onZoomMedia?: (src: string, alt: string, caption?: string) => void;
  onOpenCitation?: (citationId: number, anchorEl: HTMLElement) => void;
  /** Which side of the infobox points toward the mock page ('right' for left-side popups, 'left' for right-side screenshots popup) */
  pointerSide?: 'left' | 'right' | null;
  className?: string;
}

/** Crisp integer-grid pixel "X" glyph for the corner close button */
const PixelCloseGlyph: React.FC = () => (
  <svg
    viewBox="0 0 9 9"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
    className="w-[14px] h-[14px] block shrink-0"
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

/** Crisp integer-grid pixelated darker-gray sideways triangle (30px tall to match 32px pixel buttons) */
const PixelSidewaysTriangle: React.FC<{ direction: 'left' | 'right' }> = ({
  direction,
}) => {
  if (direction === 'left') {
    return (
      <svg
        viewBox="0 0 9 15"
        shapeRendering="crispEdges"
        aria-hidden="true"
        className="w-[18px] h-[30px] block shrink-0"
      >
        {/* Outer pixel border */}
        <g fill="var(--tri-border)">
          <rect x="0" y="7" width="1" height="1" />
          <rect x="1" y="6" width="1" height="1" />
          <rect x="2" y="5" width="1" height="1" />
          <rect x="3" y="4" width="1" height="1" />
          <rect x="4" y="3" width="1" height="1" />
          <rect x="5" y="2" width="1" height="1" />
          <rect x="6" y="1" width="1" height="1" />
          <rect x="7" y="0" width="1" height="1" />
          <rect x="1" y="8" width="1" height="1" />
          <rect x="2" y="9" width="1" height="1" />
          <rect x="3" y="10" width="1" height="1" />
          <rect x="4" y="11" width="1" height="1" />
          <rect x="5" y="12" width="1" height="1" />
          <rect x="6" y="13" width="1" height="1" />
          <rect x="7" y="14" width="1" height="1" />
          <rect x="8" y="0" width="1" height="15" />
        </g>
        {/* Inner darker-gray body */}
        <g fill="var(--tri-fill)">
          <rect x="1" y="7" width="1" height="1" />
          <rect x="2" y="6" width="1" height="3" />
          <rect x="3" y="5" width="1" height="5" />
          <rect x="4" y="4" width="1" height="7" />
          <rect x="5" y="3" width="1" height="9" />
          <rect x="6" y="2" width="1" height="11" />
          <rect x="7" y="1" width="1" height="13" />
        </g>
        {/* Bottom/right pixel shade bevel */}
        <g fill="var(--tri-lo)">
          <rect x="2" y="8" width="1" height="1" />
          <rect x="3" y="9" width="1" height="1" />
          <rect x="4" y="10" width="1" height="1" />
          <rect x="5" y="11" width="1" height="1" />
          <rect x="6" y="12" width="1" height="1" />
          <rect x="7" y="2" width="1" height="12" />
        </g>
        {/* Top pixel highlight bevel */}
        <g fill="var(--tri-hi)">
          <rect x="1" y="7" width="1" height="1" />
          <rect x="2" y="6" width="1" height="1" />
          <rect x="3" y="5" width="1" height="1" />
          <rect x="4" y="4" width="1" height="1" />
          <rect x="5" y="3" width="1" height="1" />
          <rect x="6" y="2" width="1" height="1" />
          <rect x="7" y="1" width="1" height="1" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 9 15"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className="w-[18px] h-[30px] block shrink-0"
    >
      {/* Outer pixel border */}
      <g fill="var(--tri-border)">
        <rect x="8" y="7" width="1" height="1" />
        <rect x="7" y="6" width="1" height="1" />
        <rect x="6" y="5" width="1" height="1" />
        <rect x="5" y="4" width="1" height="1" />
        <rect x="4" y="3" width="1" height="1" />
        <rect x="3" y="2" width="1" height="1" />
        <rect x="2" y="1" width="1" height="1" />
        <rect x="1" y="0" width="1" height="1" />
        <rect x="7" y="8" width="1" height="1" />
        <rect x="6" y="9" width="1" height="1" />
        <rect x="5" y="10" width="1" height="1" />
        <rect x="4" y="11" width="1" height="1" />
        <rect x="3" y="12" width="1" height="1" />
        <rect x="2" y="13" width="1" height="1" />
        <rect x="1" y="14" width="1" height="1" />
        <rect x="0" y="0" width="1" height="15" />
      </g>
      {/* Inner darker-gray body */}
      <g fill="var(--tri-fill)">
        <rect x="7" y="7" width="1" height="1" />
        <rect x="6" y="6" width="1" height="3" />
        <rect x="5" y="5" width="1" height="5" />
        <rect x="4" y="4" width="1" height="7" />
        <rect x="3" y="3" width="1" height="9" />
        <rect x="2" y="2" width="1" height="11" />
        <rect x="1" y="1" width="1" height="13" />
      </g>
      {/* Bottom pixel shade bevel */}
      <g fill="var(--tri-lo)">
        <rect x="1" y="13" width="1" height="1" />
        <rect x="2" y="12" width="1" height="1" />
        <rect x="3" y="11" width="1" height="1" />
        <rect x="4" y="10" width="1" height="1" />
        <rect x="5" y="9" width="1" height="1" />
        <rect x="6" y="8" width="1" height="1" />
      </g>
      {/* Top/left pixel highlight bevel */}
      <g fill="var(--tri-hi)">
        <rect x="1" y="1" width="1" height="12" />
        <rect x="2" y="2" width="1" height="1" />
        <rect x="3" y="3" width="1" height="1" />
        <rect x="4" y="4" width="1" height="1" />
        <rect x="5" y="5" width="1" height="1" />
        <rect x="6" y="6" width="1" height="1" />
        <rect x="7" y="7" width="1" height="1" />
      </g>
    </svg>
  );
};

export const InfoboxCard: React.FC<InfoboxCardProps> = ({
  section,
  currentPage,
  onPageChange,
  onClose,
  onZoomMedia,
  onOpenCitation,
  pointerSide = null,
  className = '',
}) => {
  const [imgError, setImgError] = useState<Record<number, boolean>>({});
  const totalPages = section.pages.length;
  const safeIndex = Math.min(Math.max(currentPage, 0), totalPages - 1);
  const page = section.pages[safeIndex];

  const hasValidImage = Boolean(page.media?.src && !imgError[safeIndex]);
  const showMediaArea = Boolean(page.media && (hasValidImage || page.media.placeholderLabel));

  return (
    <div
      role="dialog"
      aria-label={`${section.title} guide information`}
      className={`font-guide relative bg-[#f7f6f0] text-slate-800 border-2 border-slate-900 rounded-[4px] shadow-[6px_6px_0px_#0f172a] ${className}`}
    >
      {/* Right-pointing speech triangle (used when infobox sits on the left side of the page) */}
      {pointerSide === 'right' && (
        <>
          <span
            aria-hidden="true"
            className="block absolute top-7 -right-[14px] w-0 h-0 border-y-[10px] border-y-transparent border-l-[14px] border-l-slate-900 z-10"
          />
          <span
            aria-hidden="true"
            className="block absolute top-[30px] -right-[10px] w-0 h-0 border-y-[8px] border-y-transparent border-l-[11px] border-l-[#f7f6f0] z-20"
          />
        </>
      )}

      {/* Left-pointing speech triangle (used when infobox sits on the right side for screenshots) */}
      {pointerSide === 'left' && (
        <>
          <span
            aria-hidden="true"
            className="block absolute top-7 -left-[14px] w-0 h-0 border-y-[10px] border-y-transparent border-r-[14px] border-r-slate-900 z-10"
          />
          <span
            aria-hidden="true"
            className="block absolute top-[30px] -left-[10px] w-0 h-0 border-y-[8px] border-y-transparent border-r-[11px] border-r-[#f7f6f0] z-20"
          />
        </>
      )}

      {/* Dark Header (Area title only + Pixelated corner X button) */}
      <div className="bg-[#1e212b] text-white px-4 py-3 flex items-center justify-between gap-3 rounded-t-[2px] border-b-2 border-slate-900">
        <h2 className="text-sm sm:text-[15px] font-bold text-white leading-snug">
          {section.title}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close infobox"
          className="px-btn px-btn-close w-[26px] h-[26px] shrink-0"
        >
          <PixelCloseGlyph />
        </button>
      </div>

      {/* Crisp Cream Body (No dividing lines between heading, body text, and pagination) */}
      <div className="p-4 sm:p-5 flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
          <FormattedText
            text={page.subtitle}
            onOpenCitation={onOpenCitation}
          />
        </h3>

        {/* Paragraphs */}
        <div className="space-y-2.5 text-[13.5px] text-slate-800 leading-relaxed">
          {page.paragraphs.map((text, idx) => (
            <p key={idx}>
              <FormattedText text={text} onOpenCitation={onOpenCitation} />
            </p>
          ))}
        </div>

        {/* Optional Bullet Points */}
        {page.bullets && page.bullets.length > 0 && (
          <ul className="space-y-1.5 text-[13px] text-slate-800 list-disc pl-5 leading-relaxed">
            {page.bullets.map((item, idx) => (
              <li key={idx}>
                <FormattedText text={item} onOpenCitation={onOpenCitation} />
              </li>
            ))}
          </ul>
        )}

        {/* Optional Source / Reference Links */}
        {page.links && page.links.length > 0 && (
          <ul className="space-y-2.5 text-[13px] text-slate-800 pt-0.5">
            {page.links.map((item, idx) => (
              <li
                key={idx}
                className="rounded-[3px] border border-slate-300/80 bg-[#eeece3] px-3 py-2"
              >
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#d9482b] hover:underline leading-snug"
                  >
                    <span>
                      <FormattedText
                        text={item.label}
                        onOpenCitation={onOpenCitation}
                      />
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="font-semibold text-slate-900 leading-snug block">
                    <FormattedText
                      text={item.label}
                      onOpenCitation={onOpenCitation}
                    />
                  </span>
                )}
                {item.note && (
                  <p className="mt-0.5 text-[12px] text-slate-600 leading-snug">
                    <FormattedText
                      text={item.note}
                      onOpenCitation={onOpenCitation}
                    />
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Optional Image / GIF Slot (rendered below text) */}
        {showMediaArea && page.media && (
          <div className="flex flex-col gap-1.5">
            <div className="rounded-[3px] border border-slate-300/80 bg-[#eeece3] overflow-hidden">
              {hasValidImage ? (
                <div className="relative group/media">
                  <img
                    src={page.media.src}
                    alt={page.media.alt}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgError((prev) => ({ ...prev, [safeIndex]: true }))
                    }
                    className="w-full h-auto block"
                  />
                  {onZoomMedia && (
                    <button
                      type="button"
                      onClick={() =>
                        onZoomMedia(
                          page.media!.src,
                          page.media!.alt,
                          page.media!.caption
                        )
                      }
                      aria-label="Enlarge image or GIF"
                      className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-slate-900/80 px-2 py-1 text-[11px] font-semibold text-white opacity-90 hover:opacity-100 hover:bg-slate-900 transition-opacity cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Expand</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-5 text-center bg-[#eae8de]">
                  <ImageIcon className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {page.media.placeholderLabel || 'Image / GIF slot'}
                  </span>
                </div>
              )}
            </div>

            {page.media.caption && (
              <p className="text-[11.5px] text-slate-600 leading-snug">
                <FormattedText
                  text={page.media.caption}
                  onOpenCitation={onOpenCitation}
                />
              </p>
            )}
          </div>
        )}

        {/* Minimalist Footer Pagination: Sideways Pixelated Triangles + "x of x" (shown when multipage) */}
        {totalPages > 1 && (
          <div className="pt-2 mt-0.5 flex items-center justify-between gap-2 select-none">
            <button
              type="button"
              disabled={safeIndex === 0}
              onClick={() => onPageChange(safeIndex - 1)}
              aria-label="Previous page"
              className="px-tri-btn inline-flex h-8 w-8 items-center justify-center rounded-[2px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <PixelSidewaysTriangle direction="left" />
            </button>

            <span className="text-[12px] font-bold text-slate-700 tabular-nums">
              {safeIndex + 1} of {totalPages}
            </span>

            <button
              type="button"
              disabled={safeIndex === totalPages - 1}
              onClick={() => onPageChange(safeIndex + 1)}
              aria-label="Next page"
              className="px-tri-btn inline-flex h-8 w-8 items-center justify-center rounded-[2px] disabled:opacity-30 disabled:pointer-events-none cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <PixelSidewaysTriangle direction="right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
