export interface GuideMedia {
  /** Path to an image or GIF in /public/assets/... (leave empty string "" to show an optional placeholder box) */
  src: string;
  alt?: string;
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
  /** Optional sub-heading shown at the top of this page inside the infobox */
  subtitle?: string;
  /** Body paragraphs — simply add or edit strings here */
  paragraphs: string[];
  /** Optional bullet list rendered below `paragraphs` */
  bullets?: string[];
  /** Optional paragraphs rendered AFTER the `bullets` list */
  paragraphsAfterBullets?: string[];
  /** Format paragraphs with a hanging indent (ideal for APA/MLA References lists) */
  hangingIndent?: boolean;
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
  /** Optional custom header title (defaults to "Reference") */
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
 *    - Plain URL:    `https://example.com` (automatically becomes a live link!)
 *
 * 3. CLICKABLE CITATIONS (`[1]`, `[2]`, etc.):
 *    Write `[1]`, `[2]`, etc. anywhere in a paragraph, bullet, or caption.
 *    Clicking it opens a small dialog box displaying `CITATIONS[1]` below.
 * ============================================================================
 */

export const CITATIONS: Record<number, CitationEntry> = {
  1: {
    text: 'Werning, S. (2019). Itch. io and the one-dollar-game: How distribution platforms affect the ontology of (games as) a medium.',
  },
  2: {
    text: 'Tuominen, K. (2026, January 6). *What is itch.io and what am I doing there?*. BoardGameGeek. https://boardgamegeek.com/blog/16853/blogpost/181984/what-is-itchio-and-what-am-i-doing-there',
  },
  3: {
    text: 'Itch.io. (n.d.). *Your first itch.io page.* itch.io. https://itch.io/docs/creators/getting-started',
  },
  4: {
    text: 'Itch.io. (n.d.). *Content creator quality guidelines.* itch.io. https://itch.io/docs/creators/quality-guidelines#tags',
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
          placeholderLabel: 'Optional Image / GIF: Examples of VN itch.io pages',
          caption: '[*Night with Timber*](https://nomnomnami.itch.io/night-with-timber) by NomnomNami, an example of a visual novel.',
        },
      },
      {
        subtitle: 'Visual novels (cont.)',
        paragraphs: [
          'Due to the cost of content creation for major studios and the sheer amount of content involved in the branching storylines of visual novels, however^[1]^, works of this genre have largely been indie games, or independent video games—games produced by individuals or small teams instead of by large companies/studios. This presents a challenge to the visibility of visual novels in the gaming world.',
        ],
        
      },
      {
        subtitle: 'itch.io',
        paragraphs: [
          'Enter itch.io—a popular online platform catering to indie games. Unlike other game platforms like Steam where games must be approved, itch.io notably allows anyone with a registered account can upload their projects^[2]^, making it an ideal choice for indie developers, and a hub for visual novels and other narrative-based works too.',
        ],
        media: {
          src: '/assets/Itch_io_homepage.jpeg',
          caption: 'The itch.io homepage.',
        },
      },
      {
        subtitle: 'itch.io game pages',
        paragraphs: [
          'All itch.io games, visual novels included, are accessed through designated game pages—landing sites that function as an informational page, download site, and community hub all in one. Designed by the developer using a built-in editor, they are listed under an itch.io subdomain given to each creator, which hosts all the developer’s other project pages and their personal homepage. They can be accessed from the developer page or the itch.io homepage, which displays game suggestions, but since login is not required to view these pages, they can also be found in search results or opened from shared links.',
        ],
        media: {
          src: '/assets/Itch_io_game_pages.jpeg',
          caption: 'Various itch.io game pages.\n*Sources (clockwise from upper left):\n[*Feed the Scorchbot*](https://indieformer.itch.io/feed-the-scorchpot) by Indieformer\n[*Sploob*](https://mors-games.itch.io/sploob) by Mors\n[*Night in the Woods*](https://finji.itch.io/night-in-the-woods) by Finji\n[*Keepsake County*](https://forwardinstinct.itch.io/keepsake-county) by Forward Instinct*',
        },
      },
      {
        subtitle: 'itch.io game pages for visual novels',
        paragraphs: [
          'Because game pages are designed by individual creators, they can look quite different for different types of games. All pages share a basic structure and a few features built in by itch.io, but everything else is up to the creator. This guide—a mock itch.io page for a fictional visual novel—will go into the conventions followed by visual novel creators in their game pages as well as the more general anatomy of itch.io game pages along the way, and also teach creators how to customize their page through the built-in settings. My hope is to help developers of visual novels and other narrative-driven games make effective use the format of the itch.io page to promote their work.',
        ],
        media: {
          src: '/assets/Bad_end_theater.jpeg',
          caption: 'Game page for [*Bad End Theater*](https://nomnomnami.itch.io/bad-end-theater), a visual novel by NomnomNami',
        },
      },
    ],
  },

  creatingAndEditing: {
    id: 'creatingAndEditing',
    category: 'Creator Guide',
    title: 'Creating and editing your itch.io page',
    pages: [
      {
        subtitle: 'Creating your account',
        paragraphs: [
          'If you don’t have an account already, make one by clicking the “register” button in the top-right corner of the itch.io homepage, and filling out the registration form with your information!',
        ],
        media: {
          src: '/assets/New_account.gif',
        },
      },
      {
        subtitle: 'Creating your page',
        paragraphs: [
          'To create a new game page, navigate to the “V” besides your username in the top-right and click “upload new project” from the drop-down menu that appears. This will bring up a form asking for your game’s name, the game files, and some basic information that will appear on your page—but don’t too much worry about filling it all in now, you can always go back to it later. Once you’re done, click the “save & view page” button at the bottom to launch your page!',
        ],
        media: {
          src: '/assets/New_project.gif',
        },
      },
      {
        subtitle: 'Dashboard',
        paragraphs: [
          'This is the interface for editing the content on the page. To bring it up, click “edit game” at the top navigation bar when viewing your page. The form you saw when creating your page will now appear under the “edit game” tab, which sits beside new tabs for devlog posts, metadata, and more!',
        ],
        media: {
          src: '/assets/Dashboard.gif',
        },
      },
      {
        subtitle: 'Theme editor',
        paragraphs: [
          'Spice up your page using the theme editor! To access this, click the “edit theme” button at the top navigation bar when viewing your page. This will bring up a sidebar you can use to change the font, color, and size of text, background colors, and even the color of links and buttons, as well as add images for the banner and background!',
        ],
        media: {
          src: '/assets/Theme_editor.gif',
        },
      },
      {
        subtitle: 'Publishing your page',
        paragraphs: [
          'When you’re all done with your game page, go into the “edit game” tab in the dashboard and head down to the “visibility & access” setting at the bottom to switch your page from “draft” to “public” mode!',
        ],
        media: {
          src: '/assets/Publish.gif',
        },
      },
    ],
  },
};

export const SECTION_GUIDES: Record<PageSectionId, GuideSection> = {
  banner: {
    id: 'banner',
    category: 'Page Section',
    title: 'Banner',
    pages: [
      {
        paragraphs: [
          'This is full-width graphic at the top of your page containing a stylized version of game’s title. Often, it will also include illustrations related to the game, such as character art. ',
        ],
      },
      {
        paragraphs: [
          'To add this, click the “edit theme” button on the top navigation bar when viewing your game page. This will bring up the theme editor, which contains the option to add or change the banner at the bottom. Adding a banner will replace the default title that appears at the top for all itch.io pages. Make it eye catching since it’s the first thing your visitor will see! Transparent PNGs and animated GIFs also work here.',
        ],
        media: {
          src: '/assets/Banner.gif',
        },
      },
    ],
  },

  description: {
    id: 'description',
    category: 'Page Section',
    title: 'Description',
    pages: [
      {
        paragraphs: [
          'This is where you get to talk about your visual novel! Make sure it includes:',
        ],
        bullets: [
          'A brief 1-3 game summary',
          'Credits (including translations)',
          'Play time and length',
          'Content Warnings (if applicable)',
        ],
        paragraphsAfterBullets: [
          'You can add this using the textbox in your dashboard’s “edit game” tab. Be sure to separate each section with paragraph breaks or headings!',
        ],
        media: {
          src: '/assets/Description.gif',
        },
      },
      {
        subtitle: 'Game summary',
        paragraphs: [
          'This is a normally 1-3 sentence logline or blurb for the story. Hook your reader here with a cliffhanger; you can tease the characters, the settings, themes/conflicts, or what the player gets to do—but not enough to spoil the story! You might also write in this hook as a short question at the end. Separate your summary into paragraphs of 1-2 sentences each to minimize cognitive load for readers—remember that this is supposed to capture the reader’s attention!',
        ],
      },
      {
        subtitle: 'Credits',
        paragraphs: [
          'Credit any contributions from others on your game by making a vertical list of those contributions (e.g. “art”, “writing”) followed by the contributors’ names. This includes translations if applicable—put these under a separate heading and write the name of each language in its native form instead of English. This is something you may have to look up!',
        ],
      },
      {
        subtitle: 'Play time & length',
        paragraphs: [
          'Give an estimated play time or range of playtimes (normally in hours). Length can be described in a range of ways—word count, number of endings, or even the number of illustrations!',
        ],
      },
      {
        subtitle: 'Content warnings',
        paragraphs: [
          'If your game addresses potentially difficult or upsetting themes, include content warnings in your description. You might write “Content warnings:” (or “CW:”) then follow with a list of sensitive topics. See [here](https://itch.io/jam/what-are-you-afraid-of-/topic/6178439/content-warnings-and-how-to-write-them) for a comprehensive list of themes to make note of. ',
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
        paragraphs: [
          'This is a collapsible box built into the page by default displaying a a game’s tags—descriptive keywords used by creators across itch.io to help players discover their games. Just like how hashtags work, clicking one opens up a search window filtering for other games under that same tag. Use tags to let potential fans find their way to your game!',
        ],
      },
      {
        subtitle: 'Genre/thematic tags',
        paragraphs: [
          'You can add tags for the content of your game in the “edit game” tab of your dashboard. For the “genre” setting, choose 1 genre tag that best describes your game from a dropdown list—this should be “visual novel”! For the “tags” setting, after that, choose up to 10 additional thematic tags. Although you can create a brand-new tag here, Itch.io advises picking from the suggested tags if possible to make your game easier to find.^[4]^',
        ],
        media: {
          src: '/assets/Thematic_tags.gif',
        },
      },
      {
        subtitle: 'Metadata tags',
        paragraphs: [
          'You can also include tags for more technical information by going to the “metadata” tab of the dashboard. Here, you can add tags about input methods, accessibility, languages available, and even the tools you used to make your game!',
        ],
        media: {
          src: '/assets/Metadata_tags.gif',
        },
      },
    ],
  },

  purchase: {
    id: 'purchase',
    category: 'Page Section',
    title: 'Download/purchase area',
    pages: [
      {
        paragraphs: [
          'This is where the reader makes their big decision! This area contains the “download” button for free games, or the “buy now” button for paid games. If your game is paid, the starting price you set will appear beside the button, followed by “or more,” as itch.io utilizes flexible pricing. ',
        ],
      },
      {
        paragraphs: [
          'Further down below is an overview of the files the reader will receive from the download listing file names, file size, and corresponding platform. These are not always just the game files but sometimes also include goodies that the developer includes with the game, such as art collections!  If you’ve decided to give players a steam key, this area will also make note of that.',
        ],
      },
      {
        paragraphs: [
          'You can adjust the files/file information and set a price (if any) in the “edit page” tab of your dashboard by finding the “pricing” and “uploads” sections.',
        ],
        media: {
          src: '/assets/Purchase_area.gif',
        },
      },
    ],
  },

  devlog: {
    id: 'devlog',
    category: 'Page Section',
    title: 'Development log',
    pages: [
      {
        paragraphs: [
          'This is where returning players will get up to speed on your game! As you write development log posts about updates, merch drops, and more; this feed will populate with the titles of those posts. Clicking a title will bring you the corresponding post.',
        ],
      },
      {
        paragraphs: [
          'To write devlog posts, navigate to the “devlog” tab of your dashboard and click “write a new post.” From here, you can title your post and compose it, as well as adjust any other settings as needed. Make sure to hit “publish” at the bottom when you’re done!',
        ],
        media: {
          src: '/assets/Devlog.gif',
        },
      },
      {
        paragraphs: [
          'Keep your titles short and sweet—ditch complete sentences for just the bare keywords of your announcement, and don’t afraid to be expressive here with exclamation marks! You want to give these entries a personal voice.',
        ],
      },
    ],
  },

  comments: {
    id: 'comments',
    category: 'Page Section',
    title: 'Comments/community section',
    pages: [
      {
        paragraphs: [
          'This is where players can talk to you, or each other, about your game! Build community by engaging with them here!',
        ],
      },
      {
        paragraphs: [
          'You can choose between a regular comment section or a discussion board, which uses threads instead of comments at the bottom of the “edit page” tab in your dashboard (or alternatively, disable it entirely).',
        ],
        media: {
          src: '/assets/Comments.gif',
        },
      },
    ],
  },

  screenshots: {
    id: 'screenshots',
    category: 'Page Section',
    title: 'Screenshots',
    pages: [
      {
        paragraphs: [
          'For downloadable projects, these will be organized in a parallel column besides the description by default. Attach 3-5 captures of key gameplay moments as suggested by itch.io guidelines^[3]^(GIFs work too!) to give your reader a visual preview of your game by going into the “edit game” tab of your dashboard! You will see an option to add screenshots, as well as the option to add a game trailer on YouTube or Vimeo if you have one, which will appear the very top.',
        ],
        media: {
          src: '/assets/Screenshots.gif',
        },
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
        hangingIndent: true,
        paragraphs: [
          '^[1]^ Werning, S. (2019). Itch. io and the one-dollar-game: How distribution platforms affect the ontology of (games as) a medium.',
          '^[2]^ Tuominen, K. (2026, January 6). *What is itch.io and what am I doing there?*. BoardGameGeek. https://boardgamegeek.com/blog/16853/blogpost/181984/what-is-itchio-and-what-am-i-doing-there',
          '^[3]^ Itch.io. (n.d.). *Your first itch.io page.* itch.io. https://itch.io/docs/creators/getting-started',
          '^[4]^ Itch.io. (n.d.). *Content creator quality guidelines.* itch.io. https://itch.io/docs/creators/quality-guidelines#tags',
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
        paragraphs: [
          'Created by Eugene Wei for UWP 012',
          'Content, design, and illustration (banner & screenshots) of mock page by Eugene Wei',
          'Interactive features (highlighting, buttons, infoboxes) created with the help of Google AI Studio',
        ],
      },
    ],
  },
};
