export interface GuideMedia {
  /** Path to an image or GIF in /public/assets/... (leave empty string "" to show an optional placeholder box) */
  src: string;
  alt: string;
  caption?: string;
  /** Optional text shown if src is empty (useful while drafting before adding real screenshots/GIFs) */
  placeholderLabel?: string;
}

export interface GuideLink {
  label: string;
  url?: string;
  note?: string;
}

export interface GuidePage {
  /** Sub-heading shown at the top of this page inside the infobox */
  subtitle: string;
  /** Body paragraphs — simply add or edit strings here */
  paragraphs: string[];
  /** Optional bullet list rendered below the paragraphs */
  bullets?: string[];
  /** Optional list of external/source links or citations */
  links?: GuideLink[];
  /** Optional image or animated GIF featured on this page */
  media?: GuideMedia;
}

export interface GuideSection {
  id: SectionId;
  category: string;
  title: string;
  pages: GuidePage[];
}

export type PageSectionId =
  | 'banner'
  | 'description'
  | 'moreInfo'
  | 'purchase'
  | 'devlog'
  | 'comments'
  | 'screenshots';

export type TopButtonId =
  | 'whatAreItchPages'
  | 'creatingAndEditing';

export type FooterModalId =
  | 'references'
  | 'credits';

export type SectionId = PageSectionId | TopButtonId | FooterModalId;

export interface CitationEntry {
  /** Optional custom header title (defaults to "Reference [n]") */
  title?: string;
  /** Full citation text — supports *italics*, **bold**, ^superscript^, \n line breaks, and [links](https://...) */
  text: string;
  /** Optional external source URL shown at the bottom of the citation dialog */
  url?: string;
  /** Optional display label for the URL link */
  urlLabel?: string;
}

/**
 * ============================================================================
 * HOW TO EDIT INFOBOX CONTENT, FORMATTING & CITATIONS
 * ============================================================================
 * 1. SECTIONS & PAGES:
 *    Find the section below (e.g. `whatAreItchPages`, `description`) and edit
 *    its `pages: [ ... ]` array.
 *
 * 2. LINE BREAKS & INLINE FORMATTING (works in captions, paragraphs, bullets):
 *    - Line break:   use `\n` inside a string (e.g. 'Line 1\nLine 2') or `<br>`
 *    - Bold:         `**bold**` or `<b>bold</b>`
 *    - Italics:      `*italics*` or `<i>italics</i>`
 *    - Underline:    `<u>underlined</u>`
 *    - Superscript:  `^sup^` or `<sup>sup</sup>`  (e.g. `^[1]^` for superscript citation)
 *    - Subscript:    `~sub~` or `<sub>sub</sub>`
 *    - Inline link:  `[link text](https://example.com)`
 *
 * 3. CLICKABLE CITATIONS (`[1]`, `[2]`, etc.):
 *    Write `[1]`, `[2]`, etc. anywhere in a paragraph, bullet, or caption.
 *    Clicking it opens a small dialog box displaying `CITATIONS[1]` below.
 * ============================================================================
 */

export const CITATIONS: Record<number, CitationEntry> = {
  1: {
    text: 'Add your full citation for [1] here in `CITATIONS` inside **src/data/guideContent.ts** (supports *italics*, **bold**, and links).',
    url: '',
  },
  2: {
    text: 'itch.io. *Getting Started — Creator Documentation*.',
    url: 'https://itch.io/docs/creators/getting-started',
    urlLabel: 'itch.io/docs/creators/getting-started',
  },
};

export const TOP_BUTTON_GUIDES: Record<TopButtonId, GuideSection> = {
  whatAreItchPages: {
    id: 'whatAreItchPages',
    category: 'Overview',
    title: 'What are itch.io game pages/visual novels?',
    pages: [
      {
        subtitle: 'Visual novels',
        paragraphs: [
          'A video game genre of Japanese origin that has since gone worldwide, visual novels center around a story told through click-through dialogue boxes combined with static or animated visuals of characters and backgrounds. As an active participant in this story, the player shapes its progression through their choices to eventually arrive at one of several possible endings.',
        ],
        media: {
          src: '/assets/Night_with_timber.png',
          alt: 'Example overview of visual novel pages on itch.io',
          placeholderLabel: 'Optional Image / GIF: Examples of VN itch.io pages',
          caption: 'Add a screenshot or GIF in guideContent.ts to showcase real examples.',
        },
      },
      {
        subtitle: 'Visual novels (cont.)',
        paragraphs: [
          'Due to the cost of content creation for major studios and the sheer amount of content involved in the branching storylines of visual novels, however [1], works of this genre have largely been indie games, or independent video games—games produced by individuals or small teams instead of by large companies/studios. This presents a challenge to the visibility of visual novels in the gaming world.',
        ],
        
      },
      {
        subtitle: 'itch.io',
        paragraphs: [
          'Enter itch.io—a popular online platform catering to indie games. Unlike other game platforms like Steam where games must be approved, itch.io notably allows anyone with a registered account can upload their projects [2], making it an ideal choice for indie developers, and a hub for visual novels and other narrative-based works too.',
        ],
      },
    ],
  },

  creatingAndEditing: {
    id: 'creatingAndEditing',
    category: 'Creator Guide',
    title: 'Creating and editing your itch.io page',
    pages: [
      {
        subtitle: 'Setting Up Your Project Dashboard',
        paragraphs: [
          'Creators build their game page from the “Edit game” dashboard on itch.io, filling out the title, classification (Games), kind of project (Downloadable or HTML), pricing, description, and uploads.',
          'Once saved, you can switch to “Edit theme” directly on the public page to customize colors, fonts, background images, and banner artwork.',
        ],
        media: {
          src: '',
          alt: 'Screenshot of the itch.io Edit Theme panel',
          placeholderLabel: 'Optional GIF: Opening the Edit Theme sidebar on itch.io',
          caption: 'Drop a GIF here showing how creators customize page themes.',
        },
      },
      {
        subtitle: 'Visual Theme & Custom CSS',
        paragraphs: [
          'Most visual novel pages match the color palette and typography of their in-game dialogue UI so the storefront feels like an extension of the story.',
        ],
        bullets: [
          'Upload a wide header banner (typically 960px wide) to establish tone immediately.',
          'Choose a dark or muted background color so screenshots and text remain easy to read.',
          'Use custom HTML/CSS (if enabled on your account) for dividers, custom bullet styling, or collapsible sections.',
        ],
      },
      {
        subtitle: 'Checklist Before Publishing',
        paragraphs: [
          'Before switching your page visibility from Draft to Public, double-check that players have all the practical information they need:',
        ],
        bullets: [
          'Clear playtime, word count, and content warnings in the description.',
          'At least 3–4 readable gameplay screenshots showing the text box and art.',
          'Accurate genre, language, and accessibility tags inside “More information”.',
        ],
      },
    ],
  },
};

export const SECTION_GUIDES: Record<PageSectionId, GuideSection> = {
  banner: {
    id: 'banner',
    category: 'Page Section',
    title: 'Header Banner',
    pages: [
      {
        subtitle: 'First Impression & Visual Tone',
        paragraphs: [
          'The header banner spans the top of the 960px game column and replaces itch.io’s plain text title when uploaded.',
          'For visual novels, the banner almost always pairs stylized title typography with key character art or atmospheric scenery to signal genre, tone, and art style at a glance.',
        ],
        media: {
          src: '',
          alt: 'Examples of visual novel banners',
          placeholderLabel: 'Optional Image / GIF: Banner composition examples',
          caption: 'Replace with example banners or a before/after GIF.',
        },
      },
      {
        subtitle: 'Design & Readability Tips',
        paragraphs: [
          'Because banners sit directly above the body text, strong contrast between the title lettering and background art helps visitors read the game’s name immediately—even on smaller screens.',
        ],
        bullets: [
          'Recommended width is 960px (or 1920px for crisp Retina displays).',
          'Keep important text centered or away from extreme edges in case of mobile cropping.',
        ],
      },
    ],
  },

  description: {
    id: 'description',
    category: 'Page Section',
    title: 'Game Description',
    pages: [
      {
        subtitle: 'Story Hook & Premise',
        paragraphs: [
          'Everything above “More information” lives inside itch.io’s main rich-text description editor.',
          'Visual novel pages usually open with a concise 2–4 line narrative hook or atmospheric premise—inviting the reader into the protagonist’s predicament without spoiling major plot twists.',
        ],
      },
      {
        subtitle: 'Scope, Specs & Content Warnings',
        paragraphs: [
          'Right beneath the story blurb, creators list key reading specs so players know what kind of experience to expect before committing.',
        ],
        bullets: [
          'Playtime & length (e.g., “3–4 hours”, “23,000 words, 750 illustrations, 6 endings”).',
          'Content Warnings (CW) so readers can navigate sensitive themes comfortably.',
        ],
      },
      {
        subtitle: 'Credits & Collaborators',
        paragraphs: [
          'Unlike storefronts that hide individual contributors behind a studio name, itch.io visual novel pages highlight every creator’s role—writing, art, music, programming, and animation—often linking directly to each member’s portfolio.',
        ],
        media: {
          src: '',
          alt: 'Example of formatted credits and links',
          placeholderLabel: 'Optional Image: Hyperlinked credits formatting example',
        },
      },
      {
        subtitle: 'Translations & Localization',
        paragraphs: [
          'Many visual novels list supported languages and fan/official translation credits directly in the description so international players can immediately see whether their language is available.',
        ],
      },
    ],
  },

  moreInfo: {
    id: 'moreInfo',
    category: 'Page Section',
    title: 'More information',
    pages: [
      {
        subtitle: 'Collapsible Metadata Drawer',
        paragraphs: [
          'Clicking “More information” on an itch.io page expands a structured table of metadata fields generated from your project settings.',
          'Try clicking the “More information” link right on this mock page to see the drawer expand!',
        ],
      },
      {
        subtitle: 'Tags, Genre & Discoverability',
        paragraphs: [
          'While the main description is freeform prose for human readers, the fields inside “More information” power itch.io’s search filters, browse directories, and tag pages.',
        ],
        bullets: [
          'Genre (Visual Novel / Interactive Fiction) & Tags (up to 10 descriptive tags).',
          'Platforms, Languages, Inputs, and Accessibility features.',
        ],
      },
    ],
  },

  purchase: {
    id: 'purchase',
    category: 'Page Section',
    title: 'Purchase & Downloads',
    pages: [
      {
        subtitle: 'Pricing & “Or More” Patronage',
        paragraphs: [
          'itch.io supports free releases, Pay-What-You-Want donations, and minimum-price purchases with an optional “or more” tip prompt.',
          'When a minimum price is set (such as $9.99 USD), the coral-red “Buy Now” button displays the listed downloadable files and file sizes underneath.',
        ],
        media: {
          src: '',
          alt: 'Comparison of Free vs PWYW vs Paid purchase boxes',
          placeholderLabel: 'Optional Image / GIF: Purchase box variations',
        },
      },
      {
        subtitle: 'Files, Demos & Supporter Extras',
        paragraphs: [
          'Visual novel creators frequently pair a paid full build with a free browser/downloadable demo, or bundle bonus paratexts like digital artbooks, wallpapers, and soundtracks.',
        ],
      },
    ],
  },

  devlog: {
    id: 'devlog',
    category: 'Page Section',
    title: 'Development log',
    pages: [
      {
        subtitle: 'Ongoing Project Timeline',
        paragraphs: [
          'The Development log (devlog) displays chronological posts linked to the project—ranging from major content patches and mobile ports to behind-the-scenes art posts and merch announcements.',
        ],
        media: {
          src: '',
          alt: 'Example of an itch.io devlog post',
          placeholderLabel: 'Optional Image / GIF: Inside an itch.io devlog post',
        },
      },
      {
        subtitle: 'Keeping Followers Engaged',
        paragraphs: [
          'Publishing a devlog notifies people who follow the creator or project, making it one of the most effective ways for serialized or multi-chapter visual novels to retain an audience between updates.',
        ],
      },
    ],
  },

  comments: {
    id: 'comments',
    category: 'Page Section',
    title: 'Comments Section',
    pages: [
      {
        subtitle: 'Reader Reactions & Community',
        paragraphs: [
          'At the bottom of an itch.io game page sits the comment thread. Players often treat it like a guestbook—sharing favorite routes, emotional reactions, bug reports, or questions.',
        ],
      },
      {
        subtitle: 'Author Replies & Moderation',
        paragraphs: [
          'Creators can reply directly with an Author badge, upvote helpful feedback, or pin important announcements (like FAQ answers or known bug workarounds).',
        ],
      },
    ],
  },

  screenshots: {
    id: 'screenshots',
    category: 'Page Section',
    title: 'Gameplay Screenshots',
    pages: [
      {
        subtitle: 'Proving Reading Comfort & Visual Style',
        paragraphs: [
          'The right-hand column holds a vertical stack of gameplay screenshots (and optionally an embedded trailer).',
          'Because players spend hours reading a visual novel, screenshots show more than art—they demonstrate textbox contrast, font legibility, UI polish, and variety of scenes.',
        ],
        media: {
          src: '',
          alt: 'Annotated visual novel screenshot example',
          placeholderLabel: 'Optional GIF: Cycling through gameplay screenshots',
        },
      },
      {
        subtitle: 'What Screenshots to Include',
        paragraphs: [
          'Strong visual novel sidebars show a mix of moments rather than four identical dialogue frames:',
        ],
        bullets: [
          'Standard dialogue scene showing character sprites + UI textbox.',
          'Branching choice menu or interactive gameplay screen.',
          'Special event CGs or atmospheric background transitions.',
        ],
      },
    ],
  },
};

export const FOOTER_GUIDES: Record<FooterModalId, GuideSection> = {
  references: {
    id: 'references',
    category: 'Sources',
    title: 'References',
    pages: [
      {
        subtitle: 'Sources & Further Reading',
        paragraphs: [
          'Information in this genre guide draws from itch.io’s creator documentation and conventions observed across indie visual novel pages on itch.io.',
        ],
        links: [
          {
            label: 'itch.io Creator Docs — Designing Your Page',
            url: 'https://itch.io/docs/creators/design',
            note: 'Official documentation on banners, themes, screenshots, and custom CSS.',
          },
          {
            label: 'itch.io Creator Docs — Quality Guidelines & Metadata',
            url: 'https://itch.io/docs/creators/quality-guidelines',
            note: 'Best practices for tags, descriptions, classifications, and discoverability.',
          },
          {
            label: 'itch.io Creator Docs — Devlogs',
            url: 'https://itch.io/docs/creators/devlogs',
            note: 'Overview of project update posts and follower notifications.',
          },
        ],
      },
    ],
  },

  credits: {
    id: 'credits',
    category: 'About',
    title: 'Credits',
    pages: [
      {
        subtitle: 'Guide & Mock Page Credits',
        paragraphs: [
          'This interactive genre guide and mock visual novel storefront (“Out of Time”) were created to illustrate how indie visual novel developers structure and customize itch.io game pages.',
        ],
        bullets: [
          'Genre Guide Research, Writing & Mock Page (“Out of Time”) — 5a1ad',
          'Mock Visual Novel Artwork & Screenshots — 5a1ad',
          'Storefront Platform Layout & Iconography — itch.io',
        ],
      },
    ],
  },
};
