import { PageSectionId, TopButtonId } from '../data/guideContent';

/**
 * ============================================================================
 * MOCK ITCH.IO HTML SOURCE & OVERLAY CONFIGURATION
 * ============================================================================
 * How to replace the mock itch.io HTML page later without breaking overlays:
 * 1. Save your updated itch.io page as a SingleFile `.html` file.
 * 2. Replace `/public/mock-itch-page.html` with your new file (or place your
 *    new `.html` file in `/public/` and update `MOCK_PAGE_HTML_PATH` below).
 * 3. All highlights, `?` buttons, and corner `#user_tools` buttons are wired
 *    automatically via standard itch.io CSS selectors below—no need to edit
 *    the overlay components when updating your mock HTML!
 * ============================================================================
 */
export const MOCK_PAGE_HTML_PATH = `${import.meta.env.BASE_URL}mock-itch-page.html`;

export interface CornerButtonMapping {
  id: TopButtonId;
  /** Standard itch.io selector inside `#user_tools` */
  selector: string;
  /** Label shown on desktop (`span.full_label`) */
  fullLabel: string;
  /** Short label shown on narrow mobile screens (`span.mobile_label`) */
  mobileLabel: string;
  /** Icon rendered inside the corner button */
  icon: 'itchio' | 'paintbrush';
}

/**
 * Corner buttons inside `<ul id="user_tools">` that should be removed from the
 * page (e.g., "View all by [creator]").
 */
export const REMOVED_CORNER_BUTTON_SELECTORS: string[] = [
  '#user_tools .view_more',
];

/**
 * Authentic itch.io storefront icon SVG (taken directly from `#user_tools .view_more`).
 * Intentionally omits `fill` attribute so itch.io's `.action_btn > svg:not([fill]) { fill: white }`
 * rule styles it cleanly without adding a stroke.
 */
export const ITCHIO_CORNER_ICON_SVG = `<svg role="img" class="svgicon icon_itchio_new" width="18" height="16" aria-hidden="true" version="1.1" viewBox="0 0 262.728 235.452"><path d="M31.99 1.365C21.287 7.72.2 31.945 0 38.298v10.516C0 62.144 12.46 73.86 23.773 73.86c13.584 0 24.902-11.258 24.903-24.62 0 13.362 10.93 24.62 24.515 24.62 13.586 0 24.165-11.258 24.165-24.62 0 13.362 11.622 24.62 25.207 24.62h.246c13.586 0 25.208-11.258 25.208-24.62 0 13.362 10.58 24.62 24.164 24.62 13.585 0 24.515-11.258 24.515-24.62 0 13.362 11.32 24.62 24.903 24.62 11.313 0 23.773-11.714 23.773-25.046V38.298c-.2-6.354-21.287-30.58-31.988-36.933C180.118.197 157.056-.005 122.685 0c-34.37.003-81.228.54-90.697 1.365zm65.194 66.217a28.025 28.025 0 0 1-4.78 6.155c-5.128 5.014-12.157 8.122-19.906 8.122a28.482 28.482 0 0 1-19.948-8.126c-1.858-1.82-3.27-3.766-4.563-6.032l-.006.004c-1.292 2.27-3.092 4.215-4.954 6.037a28.5 28.5 0 0 1-19.948 8.12c-.934 0-1.906-.258-2.692-.528-1.092 11.372-1.553 22.24-1.716 30.164l-.002.045c-.02 4.024-.04 7.333-.06 11.93.21 23.86-2.363 77.334 10.52 90.473 19.964 4.655 56.7 6.775 93.555 6.788h.006c36.854-.013 73.59-2.133 93.554-6.788 12.883-13.14 10.31-66.614 10.52-90.474-.022-4.596-.04-7.905-.06-11.93l-.003-.045c-.162-7.926-.623-18.793-1.715-30.165-.786.27-1.757.528-2.692.528a28.5 28.5 0 0 1-19.948-8.12c-1.862-1.822-3.662-3.766-4.955-6.037l-.006-.004c-1.294 2.266-2.705 4.213-4.563 6.032a28.48 28.48 0 0 1-19.947 8.125c-7.748 0-14.778-3.11-19.906-8.123a28.025 28.025 0 0 1-4.78-6.155 27.99 27.99 0 0 1-4.736 6.155 28.49 28.49 0 0 1-19.95 8.124c-.27 0-.54-.012-.81-.02h-.007c-.27.008-.54.02-.813.02a28.49 28.49 0 0 1-19.95-8.123 27.992 27.992 0 0 1-4.736-6.155zm-20.486 26.49l-.002.01h.015c8.113.017 15.32 0 24.25 9.746 7.028-.737 14.372-1.105 21.722-1.094h.006c7.35-.01 14.694.357 21.723 1.094 8.93-9.747 16.137-9.73 24.25-9.746h.014l-.002-.01c3.833 0 19.166 0 29.85 30.007L210 165.244c8.504 30.624-2.723 31.373-16.727 31.4-20.768-.773-32.267-15.855-32.267-30.935-11.496 1.884-24.907 2.826-38.318 2.827h-.006c-13.412 0-26.823-.943-38.318-2.827 0 15.08-11.5 30.162-32.267 30.935-14.004-.027-25.23-.775-16.726-31.4L46.85 124.08c10.684-30.007 26.017-30.007 29.85-30.007zm45.985 23.582v.006c-.02.02-21.863 20.08-25.79 27.215l14.304-.573v12.474c0 .584 5.74.346 11.486.08h.006c5.744.266 11.485.504 11.485-.08v-12.474l14.304.573c-3.928-7.135-25.79-27.215-25.79-27.215v-.006l-.003.002z"></path></svg>`;

/**
 * Paintbrush icon SVG matching itch.io's 24x24 2px-stroke `#user_tools` icon style.
 */
export const PAINTBRUSH_CORNER_ICON_SVG = `<svg role="img" aria-hidden="true" width="18" height="18" version="1.1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svgicon icon_paintbrush"><path d="m11 10 3 3"></path><path d="M6.5 21A3.5 3.5 0 1 0 3 17.5a2.62 2.62 0 0 1-.708 1.792A1 1 0 0 0 3 21z"></path><path d="M9.969 17.031 21.378 5.624a1 1 0 0 0-3.002-3.002L6.967 14.031"></path></svg>`;

/**
 * Maps itch.io's native "Follow [creator]" and "Add To Collection" corner
 * buttons inside `<ul id="user_tools">` to our two top-right guide infoboxes.
 * Even if you replace `mock-itch-page.html` with a freshly downloaded itch.io
 * HTML file, the host will automatically update these button labels, icons & hooks.
 */
export const CORNER_BUTTON_MAPPINGS: CornerButtonMapping[] = [
  {
    id: 'whatAreItchPages',
    selector: '#user_tools .follow_user_btn',
    fullLabel: 'What are itch.io game pages/\nvisual novels?',
    mobileLabel: 'What is itch.io?',
    icon: 'itchio',
  },
  {
    id: 'creatingAndEditing',
    selector: '#user_tools .add_to_collection_btn',
    fullLabel: 'Creating and editing your itch.io page',
    mobileLabel: 'Creating pages',
    icon: 'paintbrush',
  },
];

export interface OverlayPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface OverlayRegionConfig {
  id: PageSectionId;
  label: string;
  /**
   * One or more CSS selectors inside the mock itch.io HTML.
   * When multiple selectors are listed (e.g. Purchase heading + Buy button +
   * Uploads), the overlay wraps their combined bounding box in a single rectangle.
   */
  selectors: string[];
  /** Extra breathing room (in px) added around the measured DOM element(s) */
  padding: OverlayPadding;
  /** Corner inside the highlighted rectangle where the `?` button appears */
  buttonPosition: 'top-right' | 'bottom-right' | 'top-left';
  /** If true, clamp horizontal bounds to `#inner_column` edges */
  clampToInnerColumn?: boolean;
  /** Optional reference selector whose horizontal (left/right) bounds this box should align with */
  alignHorizontalWith?: string;
}

export const OVERLAY_REGIONS: OverlayRegionConfig[] = [
  {
    id: 'banner',
    label: 'Header Banner',
    selectors: ['#header'],
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    buttonPosition: 'bottom-right',
    clampToInnerColumn: true,
  },
  {
    id: 'description',
    label: 'Game Description',
    selectors: ['.formatted_description'],
    padding: { top: 8, right: 10, bottom: 8, left: 10 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
  },
  {
    id: 'moreInfo',
    label: 'More information',
    selectors: ['.more_information_toggle'],
    padding: { top: 14, right: 10, bottom: 14, left: 10 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
    alignHorizontalWith: '.formatted_description',
  },
  {
    id: 'purchase',
    label: 'Purchase',
    selectors: ['#purchase', '.buy_row', '.uploads'],
    padding: { top: 6, right: 10, bottom: 8, left: 10 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
    alignHorizontalWith: '.formatted_description',
  },
  {
    id: 'devlog',
    label: 'Development log',
    selectors: ['#devlog'],
    padding: { top: 6, right: 10, bottom: 8, left: 10 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
    alignHorizontalWith: '.formatted_description',
  },
  {
    id: 'comments',
    label: 'Leave a comment',
    selectors: ['.game_comments_widget'],
    padding: { top: 6, right: 10, bottom: 8, left: 10 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
    alignHorizontalWith: '.formatted_description',
  },
  {
    id: 'screenshots',
    label: 'Gameplay Screenshots',
    selectors: ['.screenshot_list'],
    padding: { top: 8, right: 6, bottom: 8, left: 6 },
    buttonPosition: 'top-right',
    clampToInnerColumn: true,
  },
];

/**
 * SingleFile strips hidden DOM nodes when a page is saved with "More information"
 * collapsed (`.info_panel_wrapper.sf-hidden` is empty). If `.info_panel_wrapper`
 * has no children in the HTML file, clicking "More information" populates this
 * standard itch.io metadata table so visitors can test expanding/collapsing it.
 * (If your future saved HTML already has `.info_panel_wrapper` expanded, your
 * own HTML table will be used instead.)
 */
export const FALLBACK_MORE_INFO_HTML = `
<div class="info_panel">
  <table>
    <tbody>
      <tr>
        <td>Updated</td>
        <td><abbr title="16 November 2026">Today</abbr></td>
      </tr>
      <tr>
        <td>Status</td>
        <td><a href="javascript:void(0)">Released</a></td>
      </tr>
      <tr>
        <td>Platforms</td>
        <td><a href="javascript:void(0)">Windows</a>, <a href="javascript:void(0)">macOS</a>, <a href="javascript:void(0)">Linux</a></td>
      </tr>
      <tr>
        <td>Author</td>
        <td><a href="javascript:void(0)">5a1ad</a></td>
      </tr>
      <tr>
        <td>Genre</td>
        <td><a href="javascript:void(0)">Visual Novel</a></td>
      </tr>
      <tr>
        <td>Tags</td>
        <td>
          <a href="javascript:void(0)">Atmospheric</a>,
          <a href="javascript:void(0)">Multiple Endings</a>,
          <a href="javascript:void(0)">Mystery</a>,
          <a href="javascript:void(0)">Singleplayer</a>,
          <a href="javascript:void(0)">Story Rich</a>
        </td>
      </tr>
      <tr>
        <td>Average session</td>
        <td><a href="javascript:void(0)">A few hours</a></td>
      </tr>
      <tr>
        <td>Languages</td>
        <td>
          <a href="javascript:void(0)">English</a>,
          <a href="javascript:void(0)">Spanish</a>,
          <a href="javascript:void(0)">French</a>,
          <a href="javascript:void(0)">German</a>,
          <a href="javascript:void(0)">Portuguese</a>,
          <a href="javascript:void(0)">Russian</a>,
          <a href="javascript:void(0)">Arabic</a>,
          <a href="javascript:void(0)">Chinese</a>,
          <a href="javascript:void(0)">Japanese</a>,
          <a href="javascript:void(0)">Turkish</a>
        </td>
      </tr>
      <tr>
        <td>Inputs</td>
        <td><a href="javascript:void(0)">Keyboard</a>, <a href="javascript:void(0)">Mouse</a></td>
      </tr>
    </tbody>
  </table>
</div>
`;
