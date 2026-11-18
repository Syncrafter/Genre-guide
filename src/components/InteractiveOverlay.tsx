import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { PageSectionId } from '../data/guideContent';
import { OVERLAY_REGIONS, OverlayRegionConfig } from '../config/overlayConfig';

export interface MeasuredBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface OverlayStageMetrics {
  innerColumnLeft: number;
  innerColumnWidth: number;
  stageHeight: number;
  boxes: Partial<Record<PageSectionId, MeasuredBox>>;
}

interface InteractiveOverlayProps {
  shadowRoot: ShadowRoot | null;
  stageElement: HTMLDivElement | null;
  activeSectionId: PageSectionId | null;
  onSelectSection: (sectionId: PageSectionId) => void;
  layoutVersion: number;
  onMetricsUpdate: (metrics: OverlayStageMetrics) => void;
}

/** Crisp integer-grid 8-bit pixel question mark glyph */
const PixelQuestionMark: React.FC = () => (
  <svg
    viewBox="0 0 9 11"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
    className="w-[14px] h-[18px] shrink-0 block"
  >
    <rect x="2" y="0" width="5" height="2" />
    <rect x="1" y="1" width="2" height="2" />
    <rect x="6" y="1" width="2" height="3" />
    <rect x="4" y="4" width="3" height="2" />
    <rect x="3" y="5" width="2" height="2" />
    <rect x="3" y="9" width="2" height="2" />
  </svg>
);

function measureRegionInStage(
  shadowRoot: ShadowRoot,
  stageRect: DOMRect,
  innerColRect: DOMRect | null,
  region: OverlayRegionConfig
): MeasuredBox | null {
  const matchedElements: Element[] = [];
  for (const selector of region.selectors) {
    const found = shadowRoot.querySelectorAll(selector);
    found.forEach((el) => matchedElements.push(el));
  }

  if (matchedElements.length === 0) return null;

  let minTop = Infinity;
  let minLeft = Infinity;
  let maxBottom = -Infinity;
  let maxRight = -Infinity;
  let validCount = 0;

  for (const el of matchedElements) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    validCount += 1;
    minTop = Math.min(minTop, rect.top);
    minLeft = Math.min(minLeft, rect.left);
    maxBottom = Math.max(maxBottom, rect.bottom);
    maxRight = Math.max(maxRight, rect.right);
  }

  if (validCount === 0) return null;

  if (region.alignHorizontalWith) {
    const refEl = shadowRoot.querySelector(region.alignHorizontalWith);
    if (refEl) {
      const refRect = refEl.getBoundingClientRect();
      if (refRect.width > 0) {
        minLeft = refRect.left;
        maxRight = refRect.right;
      }
    }
  }

  let top = minTop - stageRect.top - region.padding.top;
  let bottom = maxBottom - stageRect.top + region.padding.bottom;
  let left = minLeft - stageRect.left - region.padding.left;
  let right = maxRight - stageRect.left + region.padding.right;

  // Ensure compact sections (such as collapsed "More information") are always
  // tall enough to comfortably enclose the pixelated "?" button inside the border
  const minBoxHeight = 46;
  const currentHeight = bottom - top;
  if (currentHeight < minBoxHeight) {
    const extra = (minBoxHeight - currentHeight) / 2;
    top -= extra;
    bottom += extra;
  }

  if (region.clampToInnerColumn && innerColRect) {
    const colLeft = innerColRect.left - stageRect.left;
    const colRight = innerColRect.right - stageRect.left;
    left = Math.max(colLeft, left);
    right = Math.min(colRight, right);
  }

  return {
    top,
    left,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
  shadowRoot,
  stageElement,
  activeSectionId,
  onSelectSection,
  layoutVersion,
  onMetricsUpdate,
}) => {
  const [boxes, setBoxes] = useState<Partial<Record<PageSectionId, MeasuredBox>>>({});
  const [hoveredSectionId, setHoveredSectionId] = useState<PageSectionId | null>(null);

  const recomputeBoxes = useCallback(() => {
    if (!shadowRoot || !stageElement) {
      setBoxes({});
      return;
    }

    const stageRect = stageElement.getBoundingClientRect();
    const innerColEl = shadowRoot.getElementById('inner_column');
    const innerColRect = innerColEl ? innerColEl.getBoundingClientRect() : null;

    const nextBoxes: Partial<Record<PageSectionId, MeasuredBox>> = {};
    for (const region of OVERLAY_REGIONS) {
      const box = measureRegionInStage(shadowRoot, stageRect, innerColRect, region);
      if (box) {
        nextBoxes[region.id] = box;
      }
    }

    // Keep Game Description and Gameplay Screenshots highlight boxes perfectly
    // level at the top when displayed side-by-side in the two-column layout
    const descBox = nextBoxes.description;
    const shotsBox = nextBoxes.screenshots;
    if (
      descBox &&
      shotsBox &&
      shotsBox.left > descBox.left &&
      Math.abs(descBox.top - shotsBox.top) <= 24
    ) {
      const sharedTop = Math.min(descBox.top, shotsBox.top);
      const descBottom = descBox.top + descBox.height;
      const shotsBottom = shotsBox.top + shotsBox.height;
      nextBoxes.description = {
        ...descBox,
        top: sharedTop,
        height: Math.max(0, descBottom - sharedTop),
      };
      nextBoxes.screenshots = {
        ...shotsBox,
        top: sharedTop,
        height: Math.max(0, shotsBottom - sharedTop),
      };
    }

    setBoxes(nextBoxes);

    onMetricsUpdate({
      innerColumnLeft: innerColRect ? innerColRect.left - stageRect.left : 0,
      innerColumnWidth: innerColRect ? innerColRect.width : 960,
      stageHeight: stageRect.height,
      boxes: nextBoxes,
    });
  }, [shadowRoot, stageElement, onMetricsUpdate]);

  // Re-measure synchronously before paint whenever layoutVersion changes
  useLayoutEffect(() => {
    recomputeBoxes();
  }, [recomputeBoxes, layoutVersion]);

  useEffect(() => {
    if (!shadowRoot || !stageElement) return;

    const handleWindowResize = () => recomputeBoxes();
    window.addEventListener('resize', handleWindowResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => recomputeBoxes());
    }

    const resizeObserver = new ResizeObserver(() => {
      recomputeBoxes();
    });

    resizeObserver.observe(stageElement);
    const innerCol = shadowRoot.getElementById('inner_column');
    if (innerCol) resizeObserver.observe(innerCol);

    for (const region of OVERLAY_REGIONS) {
      for (const selector of region.selectors) {
        shadowRoot.querySelectorAll(selector).forEach((el) => {
          resizeObserver.observe(el);
        });
      }
    }

    const mutationObserver = new MutationObserver(() => {
      recomputeBoxes();
    });
    mutationObserver.observe(shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [shadowRoot, stageElement, recomputeBoxes]);

  // Coordinate hit-testing so hovering over any target area shows the rectangular
  // highlight FIRST (along with its pixelated "?" button), while passing clicks through
  useEffect(() => {
    if (!stageElement) return;

    const hitTestPoint = (e: PointerEvent) => {
      const path = e.composedPath();

      // If pointer is on a "?" button itself, keep that section hovered
      for (const node of path) {
        if (node instanceof HTMLElement) {
          const btnSection = node.getAttribute('data-overlay-question-btn');
          if (btnSection) {
            setHoveredSectionId(btnSection as PageSectionId);
            return;
          }
          // Ignore hover underneath floating infoboxes or #user_tools corner buttons
          if (
            node.id === 'user_tools' ||
            node.hasAttribute('data-infobox-container')
          ) {
            setHoveredSectionId(null);
            return;
          }
        }
      }

      const stageRect = stageElement.getBoundingClientRect();
      const x = e.clientX - stageRect.left;
      const y = e.clientY - stageRect.top;

      let matched: PageSectionId | null = null;
      for (const region of OVERLAY_REGIONS) {
        const box = boxes[region.id];
        if (!box) continue;
        if (
          x >= box.left &&
          x <= box.left + box.width &&
          y >= box.top &&
          y <= box.top + box.height
        ) {
          matched = region.id;
          break;
        }
      }

      setHoveredSectionId(matched);
    };

    const handlePointerLeave = () => {
      setHoveredSectionId(null);
    };

    stageElement.addEventListener('pointermove', hitTestPoint);
    stageElement.addEventListener('pointerdown', hitTestPoint);
    stageElement.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      stageElement.removeEventListener('pointermove', hitTestPoint);
      stageElement.removeEventListener('pointerdown', hitTestPoint);
      stageElement.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [stageElement, boxes]);

  return (
    <div
      aria-label="Interactive page section highlights"
      className="pointer-events-none absolute inset-0 z-20"
    >
      {OVERLAY_REGIONS.map((region) => {
        const box = boxes[region.id];
        if (!box) return null;

        const isActive = activeSectionId === region.id;
        const isHovered = hoveredSectionId === region.id;
        const isHighlighted = isActive || isHovered;

        // Nothing is rendered when neither hovered nor active:
        // Zero buttons appear on the page before mousing over an area!
        if (!isHighlighted) {
          return null;
        }

        // Vertically center the "?" button inside compact boxes (like collapsed "More information")
        // so the entire pixel button + stepped border sits 100% inside the highlighted rectangle
        const isCompactBox = box.height < 62;
        const positionClasses = isCompactBox
          ? region.buttonPosition === 'top-left'
            ? 'top-1/2 -translate-y-1/2 left-2.5'
            : 'top-1/2 -translate-y-1/2 right-2.5'
          : region.buttonPosition === 'bottom-right'
            ? 'bottom-2.5 right-2.5'
            : region.buttonPosition === 'top-left'
              ? 'top-2.5 left-2.5'
              : 'top-2.5 right-2.5';

        return (
          <div
            key={region.id}
            id={`section-overlay-${region.id}`}
            style={{
              top: `${box.top}px`,
              left: `${box.left}px`,
              width: `${box.width}px`,
              height: `${box.height}px`,
            }}
            className={`pointer-events-none absolute rounded-[3px] border-2 transition-colors duration-150 ${
              isActive
                ? 'border-[#3b82f6] bg-[#3b82f6]/16 shadow-[0_0_0_2px_rgba(59,130,246,0.3)]'
                : 'border-[#3b82f6] bg-[#3b82f6]/12'
            }`}
          >
            {/* #85879A Pixelated "?" Button ONLY (32x32px outer footprint) */}
            <div className={`pointer-events-auto absolute ${positionClasses} flex`}>
              <button
                type="button"
                data-overlay-question-btn={region.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSection(region.id);
                }}
                aria-label={`Open guide info for ${region.label}`}
                aria-expanded={isActive}
                title={region.label}
                className="px-btn px-btn-question w-[26px] h-[26px]"
              >
                <PixelQuestionMark />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
