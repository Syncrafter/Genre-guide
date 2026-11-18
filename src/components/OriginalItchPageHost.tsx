import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FooterModalId, PageSectionId, TopButtonId } from '../data/guideContent';
import {
  COMMENT_OVERRIDES,
  CORNER_BUTTON_MAPPINGS,
  FALLBACK_MORE_INFO_HTML,
  ITCHIO_CORNER_ICON_SVG,
  MOCK_PAGE_HTML_PATH,
  OVERLAY_REGIONS,
  PAINTBRUSH_CORNER_ICON_SVG,
  REMOVED_CORNER_BUTTON_SELECTORS,
} from '../config/overlayConfig';

export interface CornerAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  isBottomBar: boolean;
}

interface OriginalItchPageHostProps {
  activeTopButtonId: TopButtonId | null;
  onSelectTopButton: (buttonId: TopButtonId) => void;
  onTriggerSectionFromElement: (
    sectionId: PageSectionId,
    sourceKey: string,
    triggerClientY?: number
  ) => void;
  onSelectFooterModal: (modalId: FooterModalId) => void;
  onCornerAnchorChange: (rect: CornerAnchorRect | null) => void;
  onShadowReady: (shadowRoot: ShadowRoot | null, hostEl: HTMLDivElement | null) => void;
  onLayoutChange: () => void;
  /** Extra left offset (px) applied to `.wrapper` when a Left Side Infobox is open on medium desktops */
  leftRailShiftPx: number;
  /** Extra right offset (px) applied to `.wrapper` when a Right Side Infobox (screenshots) is open on medium desktops */
  rightRailShiftPx: number;
}

const HOST_BRIDGE_CSS = `
:host {
  display: block;
  width: 100%;
}
.itch-body-root {
  min-height: 100vh;
  background-color: #5a657e;
}
.itch-body-root .wrapper {
  box-sizing: border-box;
  padding-left: var(--itch-left-rail-shift, 0px);
  padding-right: var(--itch-right-rail-shift, 0px);
}
.itch-body-root a,
.itch-body-root button,
.itch-body-root [role="button"] {
  cursor: pointer;
}
@media (min-width: 1001px) {
  .itch-body-root .screenshot_list > a {
    display: block;
  }
}
/* Keep modified #user_tools corner buttons crisp, readable, and aligned along both left & right edges */
@media (min-width: 961px) {
  .itch-body-root .user_tools {
    z-index: 35 !important;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-top: 8px;
  }
  .itch-body-root .user_tools > li {
    display: flex;
    margin-bottom: 7px;
  }
  .itch-body-root .user_tools > li:last-child {
    margin-bottom: 0;
  }
  .itch-body-root .user_tools .action_btn {
    width: 100%;
    box-sizing: border-box;
    font-size: 15px;
    padding: 5px 11px;
    line-height: 1.25;
    gap: 6px;
    max-width: 285px;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
  }
  .itch-body-root .user_tools .action_btn .mobile_inline_space {
    display: none;
  }
  .itch-body-root .user_tools .action_btn > svg {
    flex-shrink: 0;
    width: 19px;
    height: 19px;
    margin-right: 2px;
  }
  .itch-body-root .user_tools .action_btn:hover {
    background: rgba(18, 20, 26, 0.84);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.45);
  }
}
@media (max-width: 960px) {
  .itch-body-root .user_tools {
    z-index: 35 !important;
  }
  .itch-body-root .user_tools .action_btn .desktop_br {
    display: none;
  }
}
.itch-body-root .user_tools .action_btn .mobile_label {
  display: none;
}
@media (max-width: 650px) {
  .itch-body-root .user_tools .action_btn .mobile_label {
    display: initial;
  }
}
.itch-body-root .user_tools .action_btn[data-guide-active="true"] {
  background: rgba(37, 99, 235, 0.94) !important;
  border-color: rgba(15, 23, 42, 0.75) !important;
  box-shadow: 0 0 0 2px rgba(191, 219, 254, 0.9) !important;
  color: #ffffff !important;
}
/* Authentic itch.io "More information" metadata table rules (stripped by SingleFile when saved collapsed) */
.itch-body-root .info_panel_wrapper {
  margin-top: 8px;
}
.itch-body-root .info_panel {
  background: rgba(0, 0, 0, 0.18);
  padding: 10px 14px;
  border-radius: 2px;
}
.itch-body-root .info_panel table {
  border-collapse: collapse;
  font-size: 14px;
  line-height: 1.45;
}
.itch-body-root .info_panel td {
  padding: 3px 0;
  vertical-align: top;
}
.itch-body-root .info_panel td:first-child {
  color: inherit;
  opacity: 0.68;
  text-align: right;
  padding-right: 14px;
  white-space: nowrap;
  font-weight: normal;
}
.itch-body-root .more_information_toggle.is_expanded .icon_down_tick {
  transform: rotate(180deg);
}
`;

function adaptStylesForShadowDom(cssText: string): string {
  return cssText
    .replace(/:root\b/g, ':host, :root')
    .replace(/(^|[},])\s*body(?=[.\s:{,])/g, '$1.itch-body-root');
}

function injectEmbeddedFontsToDocumentHead(cssTexts: string[]) {
  const existing = document.getElementById('itch-mock-embedded-fonts');
  if (existing) return;

  const fontFaceBlocks: string[] = [];
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/g;
  for (const css of cssTexts) {
    const matches = css.match(fontFaceRegex);
    if (matches) {
      fontFaceBlocks.push(...matches);
    }
  }

  if (fontFaceBlocks.length > 0) {
    const styleEl = document.createElement('style');
    styleEl.id = 'itch-mock-embedded-fonts';
    styleEl.textContent = fontFaceBlocks.join('\n');
    document.head.appendChild(styleEl);
  }
}

function resolveSectionForInteractiveElement(el: Element): PageSectionId | null {
  for (const region of OVERLAY_REGIONS) {
    if (region.selectors.some((sel) => el.closest(sel) !== null)) {
      return region.id;
    }
  }

  if (el.closest('.header_buy_row, .buy_row, .uploads, #purchase')) {
    return 'purchase';
  }
  if (el.closest('.game_devlog, #devlog')) {
    return 'devlog';
  }
  if (el.closest('.game_comments_widget, #comments')) {
    return 'comments';
  }
  if (el.closest('.more_information_toggle, .game_info_panel_widget')) {
    return 'moreInfo';
  }
  if (el.closest('.screenshot_list, .video_embed')) {
    return 'screenshots';
  }
  if (el.closest('.formatted_description')) {
    return 'description';
  }
  if (el.closest('#header')) {
    return 'banner';
  }

  return null;
}

export const OriginalItchPageHost: React.FC<OriginalItchPageHostProps> = ({
  activeTopButtonId,
  onSelectTopButton,
  onTriggerSectionFromElement,
  onSelectFooterModal,
  onCornerAnchorChange,
  onShadowReady,
  onLayoutChange,
  leftRailShiftPx,
  rightRailShiftPx,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Keep latest callbacks in refs so ShadowRoot DOM listeners never go stale
  const callbacksRef = useRef({
    onSelectTopButton,
    onTriggerSectionFromElement,
    onSelectFooterModal,
    onCornerAnchorChange,
    onLayoutChange,
  });
  callbacksRef.current = {
    onSelectTopButton,
    onTriggerSectionFromElement,
    onSelectFooterModal,
    onCornerAnchorChange,
    onLayoutChange,
  };

  const measureCornerButtons = () => {
    const shadow = shadowRef.current;
    if (!shadow) return;
    const userTools = shadow.getElementById('user_tools');
    if (!userTools) {
      callbacksRef.current.onCornerAnchorChange(null);
      return;
    }
    const rect = userTools.getBoundingClientRect();
    const isBottomBar = window.innerWidth <= 650;
    callbacksRef.current.onCornerAnchorChange({
      top: rect.top,
      right: Math.max(8, window.innerWidth - rect.right),
      bottom: rect.bottom,
      left: rect.left,
      width: rect.width,
      isBottomBar,
    });
  };

  // Update CSS variables synchronously before paint when left/right rail shift changes
  useLayoutEffect(() => {
    if (hostRef.current) {
      hostRef.current.style.setProperty(
        '--itch-left-rail-shift',
        leftRailShiftPx > 0 ? `${leftRailShiftPx}px` : '0px'
      );
      hostRef.current.style.setProperty(
        '--itch-right-rail-shift',
        rightRailShiftPx > 0 ? `${rightRailShiftPx}px` : '0px'
      );
    }
    callbacksRef.current.onLayoutChange();
    measureCornerButtons();
  }, [leftRailShiftPx, rightRailShiftPx]);

  // Sync active state attribute on the modified #user_tools corner buttons
  useEffect(() => {
    const shadow = shadowRef.current;
    if (!shadow) return;
    for (const mapping of CORNER_BUTTON_MAPPINGS) {
      const btn = shadow.querySelector<HTMLElement>(mapping.selector);
      if (btn) {
        const isActive = activeTopButtonId === mapping.id;
        btn.setAttribute('data-guide-active', isActive ? 'true' : 'false');
        btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      }
    }
    measureCornerButtons();
  }, [activeTopButtonId]);

  // Load and mount the standalone mock HTML file into an isolated ShadowRoot
  useEffect(() => {
    let cancelled = false;
    const hostEl = hostRef.current;
    if (!hostEl) return;

    const shadow = hostEl.shadowRoot ?? hostEl.attachShadow({ mode: 'open' });
    shadowRef.current = shadow;

    let nextElementId = 1;
    const elementKeys = new WeakMap<Element, string>();
    const getElementKey = (el: Element): string => {
      let key = elementKeys.get(el);
      if (!key) {
        key = `itch-el-${nextElementId++}`;
        elementKeys.set(el, key);
      }
      return key;
    };

    fetch(MOCK_PAGE_HTML_PATH)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load ${MOCK_PAGE_HTML_PATH} (${res.status})`);
        }
        return res.text();
      })
      .then((rawHtml) => {
        if (cancelled) return;

        // Strip SingleFile toolbar widget if present in newly replaced HTML files
        const infobarIndex = rawHtml.indexOf('<single-file-infobar');
        const cleanedHtml =
          infobarIndex !== -1 ? rawHtml.slice(0, infobarIndex) : rawHtml;

        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanedHtml, 'text/html');
    
 

    // Rewrite root-relative /assets/ paths for GitHub Pages subpath hosting
    doc.querySelectorAll('[src^="/assets/"]').forEach((el) => {
      const val = el.getAttribute('src');
      if (val) el.setAttribute('src', `${import.meta.env.BASE_URL}${val.slice(1)}`);
    });
    doc.querySelectorAll('[href^="/assets/"]').forEach((el) => {
      const val = el.getAttribute('href');
      if (val) el.setAttribute('href', `${import.meta.env.BASE_URL}${val.slice(1)}`);
    });
    doc.querySelectorAll('style, [style]').forEach((el) => {
      if (el.tagName === 'STYLE' && el.textContent) {
        el.textContent = el.textContent.replace(
          /url\((['"]?)\/assets\//g,
          `url($1${import.meta.env.BASE_URL}assets/`
        );
      }
      const inlineStyle = el.getAttribute('style');
      if (inlineStyle && inlineStyle.includes('/assets/')) {
        el.setAttribute(
          'style',
          inlineStyle.replace(
            /url\((['"]?)\/assets\//g,
            `url($1${import.meta.env.BASE_URL}assets/`
          )
        );
      }
    });

    

        // Remove restrictive CSP meta or inline scripts from saved HTML
        doc
          .querySelectorAll('meta[http-equiv="content-security-policy"], script, single-file-infobar')
          .forEach((el) => el.remove());

        // Extract all embedded <style> blocks
        const styleNodes = Array.from(doc.querySelectorAll('style'));
        const rawCssList = styleNodes.map((s) => s.textContent || '');
        injectEmbeddedFontsToDocumentHead(rawCssList);

        // Clear ShadowRoot and append adapted original styles + bridge styles
        shadow.innerHTML = '';

        styleNodes.forEach((origStyle) => {
          const clonedStyle = document.createElement('style');
          if (origStyle.id) clonedStyle.id = origStyle.id;
          clonedStyle.textContent = adaptStylesForShadowDom(
            origStyle.textContent || ''
          );
          shadow.appendChild(clonedStyle);
        });

        const bridgeStyle = document.createElement('style');
        bridgeStyle.id = 'itch-host-bridge';
        bridgeStyle.textContent = HOST_BRIDGE_CSS;
        shadow.appendChild(bridgeStyle);

        // Build body wrapper preserving all original itch.io body classes & data attributes
        const bodyWrapper = document.createElement('div');
        const origBodyClass = doc.body.getAttribute('class') || '';
        bodyWrapper.className = `itch-body-root ${origBodyClass}`.trim();
        for (const attr of Array.from(doc.body.attributes)) {
          if (attr.name !== 'class') {
            bodyWrapper.setAttribute(attr.name, attr.value);
          }
        }

        while (doc.body.firstChild) {
          bodyWrapper.appendChild(doc.body.firstChild);
        }

        shadow.appendChild(bodyWrapper);

        // Capture the itch.io storefront SVG from "View all by [creator]" if present
        // before removing that button from #user_tools
        const existingItchioSvg =
          shadow.querySelector('#user_tools .view_more svg')?.outerHTML ||
          ITCHIO_CORNER_ICON_SVG;

        for (const removeSelector of REMOVED_CORNER_BUTTON_SELECTORS) {
          shadow.querySelectorAll(removeSelector).forEach((el) => {
            const parentLi = el.closest('li');
            if (parentLi) {
              parentLi.remove();
            } else {
              el.remove();
            }
          });
        }

        // Preserve original itch.io URLs for the bottom-right footer breadcrumb links
        // ("Games", "Visual Novel", "$15 or less") before neutralizing in-page anchors
        const breadcrumbHrefMap = new Map<HTMLAnchorElement, string>();
        const breadcrumbFallbacks: Record<string, string> = {
          games: 'https://itch.io/games',
          'visual novel': 'https://itch.io/games/genre-visual-novel',
          'visual novels': 'https://itch.io/games/genre-visual-novel',
          '$15 or less': 'https://itch.io/games/15-dollars-or-less',
        };
        bodyWrapper
          .querySelectorAll<HTMLAnchorElement>(
            '#view_game_footer .breadcrumbs a, .footer .breadcrumbs a'
          )
          .forEach((anchor) => {
            const origHref = anchor.getAttribute('href')?.trim() || '';
            const labelKey = (anchor.textContent || '').trim().toLowerCase();
            const resolvedHref =
              origHref && origHref.startsWith('http')
                ? origHref
                : breadcrumbFallbacks[labelKey] || '';
            if (resolvedHref) {
              breadcrumbHrefMap.set(anchor, resolvedHref);
            }
          });

        // Neutralize external hrefs/targets so all mock page links/buttons stay in-page and clickable
        bodyWrapper.querySelectorAll<HTMLAnchorElement>('a').forEach((anchor) => {
          anchor.setAttribute('href', 'javascript:void(0)');
          anchor.removeAttribute('target');
        });

        // Restore real itch.io external links on the footer breadcrumbs
        breadcrumbHrefMap.forEach((href, anchor) => {
          anchor.setAttribute('href', href);
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
          anchor.setAttribute('data-external-link', 'true');
        });

        // Apply optional comment PFP & username overrides from overlayConfig.ts
        const commentPosts = shadow.querySelectorAll<HTMLElement>('.community_post');
        commentPosts.forEach((postEl, index) => {
          const override = COMMENT_OVERRIDES[index];
          if (!override) return;

          if (override.avatarSrc && override.avatarSrc.trim()) {
            const avatarEl = postEl.querySelector<HTMLElement>(
              ':scope > .post_grid .post_avatar'
            );
            if (avatarEl) {
              avatarEl.style.backgroundImage = `url("${override.avatarSrc.trim()}")`;
              avatarEl.style.backgroundPosition = 'center';
              avatarEl.style.backgroundSize = 'cover';
            }
          }

          if (override.authorName && override.authorName.trim()) {
            const authorLink = postEl.querySelector<HTMLElement>(
              ':scope > .post_grid .post_author a'
            );
            if (authorLink) {
              authorLink.textContent = override.authorName.trim();
            }
          }
        });

        // Customize the bottom footer: keep "itch.io" linking to https://itch.io/,
        // and replace "View all by 5a1ad", "Report", and "Embed" with "References" and "Credits"
        const footer = shadow.querySelector<HTMLElement>('#view_game_footer, .footer');
        if (footer) {
          const logoLink = footer.querySelector<HTMLAnchorElement>('a.icon_logo');
          if (logoLink) {
            logoLink.setAttribute('href', 'https://itch.io/');
            logoLink.setAttribute('target', '_blank');
            logoLink.setAttribute('rel', 'noopener noreferrer');
            logoLink.setAttribute('data-external-link', 'true');
          }

          const endMarker =
            footer.querySelector('.last_dot') ||
            footer.querySelector('.update_timestamp') ||
            footer.querySelector('.breadcrumbs');

          const nodesToRemove: ChildNode[] = [];
          let cursor: ChildNode | null = logoLink
            ? logoLink.nextSibling
            : footer.firstChild;
          while (cursor && cursor !== endMarker) {
            nodesToRemove.push(cursor);
            cursor = cursor.nextSibling;
          }
          nodesToRemove.forEach((node) => node.remove());

          const frag = document.createDocumentFragment();

          const itchTextLink = document.createElement('a');
          itchTextLink.href = 'https://itch.io/';
          itchTextLink.target = '_blank';
          itchTextLink.rel = 'noopener noreferrer';
          itchTextLink.setAttribute('data-external-link', 'true');
          itchTextLink.textContent = 'itch.io';
          frag.appendChild(itchTextLink);

          const dot1 = document.createElement('span');
          dot1.className = 'dot';
          dot1.textContent = '·';
          frag.appendChild(dot1);

          const refsLink = document.createElement('a');
          refsLink.href = 'javascript:void(0)';
          refsLink.setAttribute('role', 'button');
          refsLink.setAttribute('data-footer-modal-id', 'references');
          refsLink.textContent = 'References';
          frag.appendChild(refsLink);

          const dot2 = document.createElement('span');
          dot2.className = 'dot';
          dot2.textContent = '·';
          frag.appendChild(dot2);

          const creditsLink = document.createElement('a');
          creditsLink.href = 'javascript:void(0)';
          creditsLink.setAttribute('role', 'button');
          creditsLink.setAttribute('data-footer-modal-id', 'credits');
          creditsLink.textContent = 'Credits';
          frag.appendChild(creditsLink);

          if (endMarker) {
            footer.insertBefore(frag, endMarker);
          } else {
            footer.appendChild(frag);
          }
        }

        // Ensure #user_tools corner buttons have our guide labels, icons & attributes
        for (const mapping of CORNER_BUTTON_MAPPINGS) {
          const btn = shadow.querySelector<HTMLAnchorElement>(mapping.selector);
          if (btn) {
            btn.setAttribute('href', 'javascript:void(0)');
            btn.setAttribute('role', 'button');
            btn.setAttribute('data-top-guide-id', mapping.id);
            btn.setAttribute('data-guide-active', 'false');

            // Replace native icon(s) with the configured itch.io or paintbrush icon
            btn.querySelectorAll('svg').forEach((svgEl) => svgEl.remove());
            const iconMarkup =
              mapping.icon === 'itchio'
                ? existingItchioSvg
                : PAINTBRUSH_CORNER_ICON_SVG;
            btn.insertAdjacentHTML('afterbegin', iconMarkup);

            btn.querySelectorAll('.on_unfollow').forEach((el) => el.remove());

            const fullLabel = btn.querySelector('.full_label');
            if (fullLabel) {
              fullLabel.textContent = '';
              const lines = mapping.fullLabel.split('\n');
              lines.forEach((line, idx) => {
                if (idx > 0) {
                  const prevLine = lines[idx - 1];
                  if (
                    prevLine &&
                    !prevLine.endsWith('/') &&
                    !prevLine.endsWith('-') &&
                    !prevLine.endsWith(' ')
                  ) {
                    const spaceSpan = document.createElement('span');
                    spaceSpan.className = 'mobile_inline_space';
                    spaceSpan.textContent = ' ';
                    fullLabel.appendChild(spaceSpan);
                  }
                  const br = document.createElement('br');
                  br.className = 'desktop_br';
                  fullLabel.appendChild(br);
                }
                fullLabel.appendChild(document.createTextNode(line));
              });
            }
            const mobileLabel = btn.querySelector('.mobile_label');
            if (mobileLabel) {
              mobileLabel.classList.remove('sf-hidden');
              mobileLabel.textContent = mapping.mobileLabel;
            }
          }
        }

        // Delegate clicks on all links & buttons inside the mock page
        bodyWrapper.addEventListener('click', (e: MouseEvent) => {
          const target = e.target instanceof Element ? e.target : null;
          if (!target) return;

          // 0. Allow real external links (e.g. footer "itch.io" link) to open natively
          if (target.closest('[data-external-link="true"]')) {
            return;
          }

          // 1. Modified corner buttons in #user_tools
          const cornerBtn = target.closest<HTMLElement>('[data-top-guide-id]');
          if (cornerBtn) {
            e.preventDefault();
            e.stopPropagation();
            const guideId = cornerBtn.getAttribute('data-top-guide-id') as TopButtonId;
            measureCornerButtons();
            callbacksRef.current.onSelectTopButton(guideId);
            return;
          }

          // 2. Footer "References" and "Credits" modal links
          const footerModalBtn = target.closest<HTMLElement>('[data-footer-modal-id]');
          if (footerModalBtn) {
            e.preventDefault();
            e.stopPropagation();
            const modalId = footerModalBtn.getAttribute(
              'data-footer-modal-id'
            ) as FooterModalId;
            callbacksRef.current.onSelectFooterModal(modalId);
            return;
          }

          // 3. "More information" collapsible drawer toggle (ONLY expands/collapses drawer)
          const moreInfoBtn = target.closest<HTMLElement>('.toggle_info_btn');
          if (moreInfoBtn) {
            e.preventDefault();
            const toggleContainer = moreInfoBtn.closest('.more_information_toggle');
            const panelWrapper =
              toggleContainer?.querySelector<HTMLElement>('.info_panel_wrapper');
            if (toggleContainer && panelWrapper) {
              if (!panelWrapper.innerHTML.trim()) {
                panelWrapper.innerHTML = FALLBACK_MORE_INFO_HTML;
              }
              const isCollapsed =
                panelWrapper.classList.contains('sf-hidden') ||
                panelWrapper.style.display === 'none' ||
                window.getComputedStyle(panelWrapper).display === 'none';
              const willExpand = isCollapsed;
              panelWrapper.classList.toggle('sf-hidden', !willExpand);
              panelWrapper.style.display = willExpand ? 'block' : 'none';
              toggleContainer.classList.toggle('open', willExpand);
              toggleContainer.classList.toggle('is_expanded', willExpand);
              callbacksRef.current.onLayoutChange();
            }
            return;
          }

          // 4. Any link or button inside a page section brings up that area's guide infobox
          const interactiveEl = target.closest('a, button, [role="button"]');
          if (interactiveEl) {
            e.preventDefault();

            const sectionId = resolveSectionForInteractiveElement(interactiveEl);
            if (sectionId) {
              const elRect = interactiveEl.getBoundingClientRect();
              const triggerCenterY = elRect.top + elRect.height / 2;
              callbacksRef.current.onTriggerSectionFromElement(
                sectionId,
                getElementKey(interactiveEl),
                triggerCenterY
              );
              return;
            }
          }
        });

        // Re-measure overlay bounds as embedded images finish decoding
        const images = Array.from(shadow.querySelectorAll('img'));
        images.forEach((img) => {
          if (!img.complete) {
            img.addEventListener('load', () => {
              callbacksRef.current.onLayoutChange();
            });
          }
        });

        onShadowReady(shadow, hostEl);
        measureCornerButtons();
        callbacksRef.current.onLayoutChange();
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Unable to load mock HTML page.'
          );
        }
      });

    const handleViewportUpdate = () => {
      measureCornerButtons();
    };
    window.addEventListener('resize', handleViewportUpdate);
    window.addEventListener('scroll', handleViewportUpdate, { passive: true });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleViewportUpdate);
      window.removeEventListener('scroll', handleViewportUpdate);
      onShadowReady(null, null);
    };
  }, [onShadowReady]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#5a657e] p-6 text-white font-guide">
        <div className="max-w-md rounded border border-white/20 bg-[#232730] p-5 text-sm">
          <p className="font-bold text-red-300 mb-1">Could not load mock HTML</p>
          <p className="text-slate-200">{loadError}</p>
        </div>
      </div>
    );
  }

  return <div ref={hostRef} className="w-full" />;
};
