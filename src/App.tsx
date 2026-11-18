import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import {
  FOOTER_GUIDES,
  FooterModalId,
  PageSectionId,
  SECTION_GUIDES,
  TOP_BUTTON_GUIDES,
  TopButtonId,
} from './data/guideContent';
import { InfoboxCard } from './components/InfoboxCard';
import {
  CitationAnchorRect,
  CitationDialog,
} from './components/CitationDialog';
import { FormattedText } from './components/FormattedText';
import {
  CornerAnchorRect,
  OriginalItchPageHost,
} from './components/OriginalItchPageHost';
import {
  InteractiveOverlay,
  OverlayStageMetrics,
} from './components/InteractiveOverlay';

interface ZoomedMediaState {
  src: string;
  alt: string;
  caption?: string;
}

interface ActiveCitationState {
  id: number;
  anchorRect: CitationAnchorRect;
}

const DESKTOP_SIDE_RAIL_MIN_WIDTH = 1340;
const SIDE_CARD_WIDTH = 344;
const SIDE_CARD_GAP = 18;
const SCREEN_EDGE_MARGIN = 14;

/** Sections on the right column of the itch.io page open their popup on the right side */
function isRightSideSection(sectionId: PageSectionId | null): boolean {
  return sectionId === 'screenshots';
}

export default function App() {
  // Active page section infobox (left or right side on desktop, modal on smaller screens)
  const [activeSectionId, setActiveSectionId] = useState<PageSectionId | null>(null);
  const [sectionPageIndex, setSectionPageIndex] = useState(0);

  // Active top-right corner button infobox (triggered from modified #user_tools buttons)
  const [activeTopButtonId, setActiveTopButtonId] = useState<TopButtonId | null>(null);
  const [topButtonPageIndex, setTopButtonPageIndex] = useState(0);

  // Active bottom footer window ("References" or "Credits")
  const [activeFooterModalId, setActiveFooterModalId] =
    useState<FooterModalId | null>(null);
  const [footerModalPageIndex, setFooterModalPageIndex] = useState(0);

  // Enlarged image/GIF/screenshot lightbox state
  const [zoomedMedia, setZoomedMedia] = useState<ZoomedMediaState | null>(null);

  // Active inline citation dialog ("[1]", "[2]", etc.)
  const [activeCitation, setActiveCitation] =
    useState<ActiveCitationState | null>(null);

  // Shadow DOM reference & layout version from OriginalItchPageHost
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [cornerAnchor, setCornerAnchor] = useState<CornerAnchorRect | null>(null);

  // Viewport width for responsive side-rail calculations
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  // Measured stage metrics & all section bounding boxes from InteractiveOverlay
  const [stageMetrics, setStageMetrics] = useState<OverlayStageMetrics>({
    innerColumnLeft: 0,
    innerColumnWidth: 960,
    stageHeight: 900,
    boxes: {},
  });

  // Measured height of the currently open desktop side card for viewport clamping
  const [sideCardHeight, setSideCardHeight] = useState<number>(340);

  const [stageEl, setStageEl] = useState<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const sideCardRef = useRef<HTMLDivElement>(null);
  const lastTriggeredSourceRef = useRef<string | null>(null);

  const setStageNode = useCallback((node: HTMLDivElement | null) => {
    stageRef.current = node;
    setStageEl(node);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleShadowReady = useCallback((root: ShadowRoot | null) => {
    setShadowRoot(root);
  }, []);

  const handleLayoutChange = useCallback(() => {
    setLayoutVersion((v) => v + 1);
  }, []);

  const isDesktopSideRail =
    activeSectionId !== null && viewportWidth >= DESKTOP_SIDE_RAIL_MIN_WIDTH;
  const opensOnRight = isRightSideSection(activeSectionId);

  // Compute left or right padding shift on `.wrapper` for medium desktop screens
  // (1340px–1712px) so `#inner_column` (960px) is never covered on whichever side the popup opens
  const requiredOuterSpace = SIDE_CARD_WIDTH + SIDE_CARD_GAP + SCREEN_EDGE_MARGIN;
  const neededShift = (() => {
    if (!isDesktopSideRail) return 0;
    const raw = 2 * requiredOuterSpace + 960 - viewportWidth;
    if (raw <= 0) return 0;
    const maxSafe = Math.max(0, viewportWidth - 960 - 12);
    return Math.min(raw, maxSafe);
  })();

  const leftRailShiftPx = isDesktopSideRail && !opensOnRight ? neededShift : 0;
  const rightRailShiftPx = isDesktopSideRail && opensOnRight ? neededShift : 0;

  // Keep sideCardHeight updated as pages flip so clamping stays accurate
  useLayoutEffect(() => {
    if (sideCardRef.current) {
      setSideCardHeight(sideCardRef.current.offsetHeight);
    }
  }, [activeSectionId, sectionPageIndex]);

  useEffect(() => {
    if (!isDesktopSideRail || !sideCardRef.current) return;
    const observer = new ResizeObserver(() => {
      if (sideCardRef.current) {
        setSideCardHeight(sideCardRef.current.offsetHeight);
      }
    });
    observer.observe(sideCardRef.current);
    return () => observer.disconnect();
  }, [isDesktopSideRail, activeSectionId]);

  // Compute exact side card coordinates synchronously from `stageMetrics.boxes[activeSectionId]`
  // so the infobox NEVER starts at top=24 and drops vertically—it spawns directly at the
  // section's vertical level and slides horizontally out of the page!
  const computeDesktopSideCardCoords = (): { top: number; left: number } | null => {
    if (!isDesktopSideRail || !activeSectionId) return null;
    const box = stageMetrics.boxes[activeSectionId];
    if (!box) return null;

    const left = opensOnRight
      ? Math.min(
          viewportWidth - SIDE_CARD_WIDTH - SCREEN_EDGE_MARGIN,
          stageMetrics.innerColumnLeft + stageMetrics.innerColumnWidth + SIDE_CARD_GAP
        )
      : Math.max(
          SCREEN_EDGE_MARGIN,
          stageMetrics.innerColumnLeft - SIDE_CARD_WIDTH - SIDE_CARD_GAP
        );

    const rawTop = box.top;
    const maxStageTop = Math.max(12, stageMetrics.stageHeight - sideCardHeight - 20);

    let adjustedTop = rawTop;
    if (stageRef.current && typeof window !== 'undefined') {
      const stageRect = stageRef.current.getBoundingClientRect();
      const sectionViewportTop = stageRect.top + box.top;
      const maxViewportVisibleTop =
        window.innerHeight - stageRect.top - sideCardHeight - 20;
      if (sectionViewportTop > window.innerHeight - sideCardHeight - 20) {
        adjustedTop = Math.min(rawTop, Math.max(12, maxViewportVisibleTop));
      }
    }

    const top = Math.max(12, Math.min(adjustedTop, maxStageTop));
    return { top, left };
  };

  // Close open citation popup whenever switching sections, pages, or modals
  useEffect(() => {
    setActiveCitation(null);
  }, [
    activeSectionId,
    sectionPageIndex,
    activeTopButtonId,
    topButtonPageIndex,
    activeFooterModalId,
    footerModalPageIndex,
    zoomedMedia,
  ]);

  // Keyboard navigation: Escape closes active citation/lightbox/infobox, Left/Right flips pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeCitation) {
          setActiveCitation(null);
        } else if (zoomedMedia) {
          setZoomedMedia(null);
        } else if (activeFooterModalId) {
          setActiveFooterModalId(null);
        } else if (activeTopButtonId) {
          setActiveTopButtonId(null);
        } else if (activeSectionId) {
          setActiveSectionId(null);
        }
        return;
      }

      if (zoomedMedia) return;

      if (activeFooterModalId) {
        const total = FOOTER_GUIDES[activeFooterModalId].pages.length;
        if (e.key === 'ArrowRight') {
          setFooterModalPageIndex((i) => Math.min(total - 1, i + 1));
        } else if (e.key === 'ArrowLeft') {
          setFooterModalPageIndex((i) => Math.max(0, i - 1));
        }
      } else if (activeTopButtonId) {
        const total = TOP_BUTTON_GUIDES[activeTopButtonId].pages.length;
        if (e.key === 'ArrowRight') {
          setTopButtonPageIndex((i) => Math.min(total - 1, i + 1));
        } else if (e.key === 'ArrowLeft') {
          setTopButtonPageIndex((i) => Math.max(0, i - 1));
        }
      } else if (activeSectionId) {
        const total = SECTION_GUIDES[activeSectionId].pages.length;
        if (e.key === 'ArrowRight') {
          setSectionPageIndex((i) => Math.min(total - 1, i + 1));
        } else if (e.key === 'ArrowLeft') {
          setSectionPageIndex((i) => Math.max(0, i - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCitation,
    activeFooterModalId,
    activeSectionId,
    activeTopButtonId,
    zoomedMedia,
  ]);

  const handleSelectSection = useCallback((sectionId: PageSectionId) => {
    lastTriggeredSourceRef.current = null;
    setActiveTopButtonId(null);
    setActiveFooterModalId(null);
    setActiveSectionId((prev) => {
      if (prev === sectionId) return null;
      setSectionPageIndex(0);
      return sectionId;
    });
  }, []);

  const handleTriggerSectionFromElement = useCallback(
    (sectionId: PageSectionId, sourceKey: string) => {
      setActiveTopButtonId(null);
      setActiveFooterModalId(null);
      setActiveSectionId((prev) => {
        if (prev === sectionId) {
          if (lastTriggeredSourceRef.current === sourceKey) {
            lastTriggeredSourceRef.current = null;
            return null;
          }
          lastTriggeredSourceRef.current = sourceKey;
          return prev;
        }
        lastTriggeredSourceRef.current = sourceKey;
        setSectionPageIndex(0);
        return sectionId;
      });
    },
    []
  );

  const handleSelectTopButton = useCallback((buttonId: TopButtonId) => {
    lastTriggeredSourceRef.current = null;
    setActiveSectionId(null);
    setActiveFooterModalId(null);
    setActiveTopButtonId((prev) => {
      if (prev === buttonId) return null;
      setTopButtonPageIndex(0);
      return buttonId;
    });
  }, []);

  const handleSelectFooterModal = useCallback((modalId: FooterModalId) => {
    lastTriggeredSourceRef.current = null;
    setActiveSectionId(null);
    setActiveTopButtonId(null);
    setActiveFooterModalId((prev) => {
      if (prev === modalId) return null;
      setFooterModalPageIndex(0);
      return modalId;
    });
  }, []);

  const handleZoomMedia = useCallback(
    (src: string, alt: string, caption?: string) => {
      setZoomedMedia({ src, alt, caption });
    },
    []
  );

  const handleOpenCitation = useCallback(
    (citationId: number, anchorEl: HTMLElement) => {
      const rect = anchorEl.getBoundingClientRect();
      setActiveCitation((prev) => {
        if (prev?.id === citationId) return null;
        return {
          id: citationId,
          anchorRect: {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            width: rect.width,
          },
        };
      });
    },
    []
  );

  // Compute anchored placement for the Top-Right Corner Button Infobox
  const renderTopButtonInfobox = () => {
    if (!activeTopButtonId) return null;

    const isFixedDesktop = viewportWidth > 1300;
    const isMobileBottomBar = cornerAnchor?.isBottomBar ?? viewportWidth <= 650;
    const isStaticTabletBar = viewportWidth > 650 && viewportWidth <= 960;

    if (isMobileBottomBar) {
      return (
        <div
          key={activeTopButtonId}
          data-infobox-container="true"
          className="fixed bottom-[58px] left-3 right-3 z-40 mx-auto max-w-[400px] max-h-[calc(100vh-76px)] overflow-y-auto animate-emerge-left"
        >
          <InfoboxCard
            section={TOP_BUTTON_GUIDES[activeTopButtonId]}
            currentPage={topButtonPageIndex}
            onPageChange={setTopButtonPageIndex}
            onClose={() => setActiveTopButtonId(null)}
            onZoomMedia={handleZoomMedia}
            onOpenCitation={handleOpenCitation}
          />
        </div>
      );
    }

    const topPx = cornerAnchor ? Math.max(12, cornerAnchor.bottom + 8) : 96;
    const rightPx = cornerAnchor ? cornerAnchor.right : 10;

    return (
      <div
        key={activeTopButtonId}
        data-infobox-container="true"
        style={
          isStaticTabletBar
            ? {
                top: `${topPx + (typeof window !== 'undefined' ? window.scrollY : 0)}px`,
                left: '12px',
              }
            : isFixedDesktop
              ? { top: `${topPx}px`, right: `${rightPx}px` }
              : {
                  top: `${topPx + (typeof window !== 'undefined' ? window.scrollY : 0)}px`,
                  right: `${rightPx}px`,
                }
        }
        className={`${
          isFixedDesktop ? 'fixed' : 'absolute'
        } z-40 w-[min(395px,calc(100vw-24px))] animate-emerge-left`}
      >
        <InfoboxCard
          section={TOP_BUTTON_GUIDES[activeTopButtonId]}
          currentPage={topButtonPageIndex}
          onPageChange={setTopButtonPageIndex}
          onClose={() => setActiveTopButtonId(null)}
          onZoomMedia={handleZoomMedia}
          onOpenCitation={handleOpenCitation}
        />
      </div>
    );
  };

  const sideCoords = computeDesktopSideCardCoords();

  return (
    <div
      ref={setStageNode}
      className="relative min-h-screen w-full bg-[#5a657e] overflow-x-clip"
    >
      {/* ====================================================================
          1. ORIGINAL MOCK ITCH.IO HTML PAGE (Isolated ShadowRoot)
             Replace `/public/mock-itch-page.html` anytime as you finish your
             mock page without affecting the overlaid features below!
         ==================================================================== */}
      <OriginalItchPageHost
        activeTopButtonId={activeTopButtonId}
        onSelectTopButton={handleSelectTopButton}
        onTriggerSectionFromElement={handleTriggerSectionFromElement}
        onSelectFooterModal={handleSelectFooterModal}
        onCornerAnchorChange={setCornerAnchor}
        onShadowReady={handleShadowReady}
        onLayoutChange={handleLayoutChange}
        leftRailShiftPx={leftRailShiftPx}
        rightRailShiftPx={rightRailShiftPx}
      />

      {/* ====================================================================
          2. SEPARATE INTERACTIVE OVERLAY LAYER (Hover Highlights + "?" Buttons)
             Nothing appears until you mouse over a section; mousing over shows
             the rectangular highlight and its pixelated "?" button together.
         ==================================================================== */}
      <InteractiveOverlay
        shadowRoot={shadowRoot}
        stageElement={stageEl}
        activeSectionId={activeSectionId}
        onSelectSection={handleSelectSection}
        layoutVersion={layoutVersion}
        onMetricsUpdate={setStageMetrics}
      />

      {/* ====================================================================
          3. TOP-RIGHT CORNER BUTTON MULTIPAGE INFOBOX
             Anchored directly below the modified #user_tools corner buttons
         ==================================================================== */}
      {renderTopButtonInfobox()}

      {/* ====================================================================
          4. DESKTOP SIDE MULTIPAGE INFOBOX (>= 1340px)
             - Emerges sideways out of the LEFT edge for left/banner sections
             - Emerges sideways out of the RIGHT edge for Gameplay Screenshots
         ==================================================================== */}
      {activeSectionId && isDesktopSideRail && sideCoords && (
        <aside
          key={activeSectionId}
          data-infobox-container="true"
          aria-label="Section explanation infobox"
          style={{
            top: `${sideCoords.top}px`,
            left: `${sideCoords.left}px`,
            width: `${SIDE_CARD_WIDTH}px`,
          }}
          className={`absolute z-40 ${
            opensOnRight ? 'animate-emerge-right' : 'animate-emerge-left'
          }`}
        >
          <div ref={sideCardRef}>
            <InfoboxCard
              section={SECTION_GUIDES[activeSectionId]}
              currentPage={sectionPageIndex}
              onPageChange={setSectionPageIndex}
              onClose={() => setActiveSectionId(null)}
              onZoomMedia={handleZoomMedia}
              onOpenCitation={handleOpenCitation}
              pointerSide={opensOnRight ? 'left' : 'right'}
            />
          </div>
        </aside>
      )}

      {/* ====================================================================
          5. RESPONSIVE MODAL / DRAWER FOR SMALLER SCREENS (< 1340px)
         ==================================================================== */}
      {activeSectionId && !isDesktopSideRail && (
        <div
          data-infobox-container="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-[2px]"
        >
          <div
            className="absolute inset-0"
            onClick={() => setActiveSectionId(null)}
            aria-hidden="true"
          />
          <div
            key={activeSectionId}
            className={`relative z-10 w-full max-w-[420px] max-h-[85vh] overflow-y-auto ${
              opensOnRight ? 'animate-emerge-right' : 'animate-emerge-left'
            }`}
          >
            <InfoboxCard
              section={SECTION_GUIDES[activeSectionId]}
              currentPage={sectionPageIndex}
              onPageChange={setSectionPageIndex}
              onClose={() => setActiveSectionId(null)}
              onZoomMedia={handleZoomMedia}
              onOpenCitation={handleOpenCitation}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          6. FOOTER MODAL WINDOWS ("References" & "Credits")
         ==================================================================== */}
      {activeFooterModalId && (
        <div
          data-infobox-container="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-[2px]"
        >
          <div
            className="absolute inset-0"
            onClick={() => setActiveFooterModalId(null)}
            aria-hidden="true"
          />
          <div
            key={activeFooterModalId}
            className="relative z-10 w-full max-w-[460px] max-h-[85vh] overflow-y-auto animate-emerge-left"
          >
            <InfoboxCard
              section={FOOTER_GUIDES[activeFooterModalId]}
              currentPage={footerModalPageIndex}
              onPageChange={setFooterModalPageIndex}
              onClose={() => setActiveFooterModalId(null)}
              onZoomMedia={handleZoomMedia}
              onOpenCitation={handleOpenCitation}
            />
          </div>
        </div>
      )}

      {/* ====================================================================
          7. IMAGE / GIF / SCREENSHOT ZOOM LIGHTBOX
         ==================================================================== */}
      {zoomedMedia && (
        <div
          data-infobox-container="true"
          role="dialog"
          aria-label="Expanded media preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setZoomedMedia(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#1e212b] border-2 border-white/20 rounded-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedMedia(null)}
              aria-label="Close expanded media"
              className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded bg-slate-900/90 text-white border border-white/20 hover:bg-[#fa5c5c] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={zoomedMedia.src}
              alt={zoomedMedia.alt}
              referrerPolicy="no-referrer"
              className="w-full max-h-[78vh] object-contain bg-black/40 block"
            />
            {zoomedMedia.caption && (
              <div className="font-guide px-4 py-3 text-sm text-slate-200 border-t border-white/10">
                <FormattedText
                  text={zoomedMedia.caption}
                  onOpenCitation={handleOpenCitation}
                  variant="dark"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          8. COMPACT CITATION DIALOG ("[1]", "[2]", etc.)
         ==================================================================== */}
      {activeCitation && (
        <CitationDialog
          citationId={activeCitation.id}
          anchorRect={activeCitation.anchorRect}
          onClose={() => setActiveCitation(null)}
          onOpenCitation={handleOpenCitation}
        />
      )}
    </div>
  );
}
