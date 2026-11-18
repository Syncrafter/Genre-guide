import React from 'react';

export interface FormattedTextProps {
  text: string;
  onOpenCitation?: (citationId: number, anchorEl: HTMLElement) => void;
  /** Color scheme adjustment for inline links and citation triggers ('light' for cream cards, 'dark' for dark lightbox) */
  variant?: 'light' | 'dark';
}

type TokenRule = {
  type:
    | 'br'
    | 'escape'
    | 'htmlLink'
    | 'mdLink'
    | 'angleUrl'
    | 'autoUrl'
    | 'citation'
    | 'boldItalic'
    | 'boldMd'
    | 'boldHtml'
    | 'italicMd'
    | 'italicHtml'
    | 'underlineHtml'
    | 'strikeMd'
    | 'strikeHtml'
    | 'supMd'
    | 'supHtml'
    | 'subMd'
    | 'subHtml'
    | 'codeMd'
    | 'codeHtml';
  regex: RegExp;
};

const TOKEN_RULES: TokenRule[] = [
  { type: 'br', regex: /\r?\n|<br\s*\/?>/i },
  { type: 'escape', regex: /\\([\\*_^~[\]<>`])/ },
  { type: 'htmlLink', regex: /<a\s+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i },
  { type: 'mdLink', regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/ },
  { type: 'angleUrl', regex: /<(https?:\/\/[^\s<>]+)>/ },
  { type: 'autoUrl', regex: /https?:\/\/[^\s<>*"'`]+/ },
  { type: 'citation', regex: /\[(\d+)\]/ },
  { type: 'boldItalic', regex: /\*\*\*([\s\S]+?)\*\*\*/ },
  { type: 'boldMd', regex: /\*\*([\s\S]+?)\*\*/ },
  { type: 'boldHtml', regex: /<(b|strong)>([\s\S]*?)<\/\1>/i },
  { type: 'italicMd', regex: /(?<!\*)\*(?!\*|\s)((?:\[[^\]]*\]\([^)]*\)|[^*])+?)(?<!\s|\*)\*(?!\*)/ },
  { type: 'italicHtml', regex: /<(i|em)>([\s\S]*?)<\/\1>/i },
  { type: 'underlineHtml', regex: /<u>([\s\S]*?)<\/u>/i },
  { type: 'strikeMd', regex: /~~([\s\S]+?)~~/ },
  { type: 'strikeHtml', regex: /<(s|del)>([\s\S]*?)<\/\1>/i },
  { type: 'supMd', regex: /\^([^^\n]+)\^/ },
  { type: 'supHtml', regex: /<sup>([\s\S]*?)<\/sup>/i },
  { type: 'subMd', regex: /(?<!~)~(?!~|\s)([^~\n]+?)(?<!\s|~)~(?!~)/ },
  { type: 'subHtml', regex: /<sub>([\s\S]*?)<\/sub>/i },
  { type: 'codeMd', regex: /`([^`\n]+)`/ },
  { type: 'codeHtml', regex: /<code>([\s\S]*?)<\/code>/i },
];

/** Strip trailing sentence punctuation (e.g. `,`, `.`, `)`) from bare URLs */
function cleanBareUrl(rawUrl: string): string {
  let clean = rawUrl;
  while (clean.length > 0) {
    const last = clean[clean.length - 1];
    if (/[.,;:!?]/.test(last)) {
      clean = clean.slice(0, -1);
      continue;
    }
    if (last === ')') {
      const opens = (clean.match(/\(/g) || []).length;
      const closes = (clean.match(/\)/g) || []).length;
      if (closes > opens) {
        clean = clean.slice(0, -1);
        continue;
      }
    }
    if (last === ']') {
      const opens = (clean.match(/\[/g) || []).length;
      const closes = (clean.match(/\]/g) || []).length;
      if (closes > opens) {
        clean = clean.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return clean;
}

function parseFormattedNodes(
  input: string,
  onOpenCitation: FormattedTextProps['onOpenCitation'],
  variant: 'light' | 'dark',
  keyPrefix = 'fmt',
  inItalic = false
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let remaining = input;
  let counter = 0;

  const linkClass =
    variant === 'dark'
      ? 'text-sky-300 hover:text-sky-200 hover:underline break-words'
      : 'text-[#2563eb] hover:text-[#1d4ed8] hover:underline break-words';

  const citationClass =
    variant === 'dark'
      ? 'inline p-0 m-0 border-0 bg-transparent leading-[0] align-baseline font-semibold text-sky-300 hover:text-sky-200 hover:underline decoration-[1.5px] underline-offset-2 cursor-pointer px-[1px] rounded-[2px] focus-visible:outline-2 focus-visible:outline-sky-400'
      : 'inline p-0 m-0 border-0 bg-transparent leading-[0] align-baseline font-semibold text-[#2563eb] hover:text-[#1d4ed8] hover:underline decoration-[1.5px] underline-offset-2 cursor-pointer px-[1px] rounded-[2px] focus-visible:outline-2 focus-visible:outline-blue-500';

  const codeClass =
    variant === 'dark'
      ? 'px-1 py-0.5 rounded bg-white/15 font-mono text-[0.9em]'
      : 'px-1 py-0.5 rounded bg-slate-900/10 font-mono text-[0.9em]';

  while (remaining.length > 0) {
    let bestRule: TokenRule | null = null;
    let bestMatch: RegExpExecArray | null = null;
    let bestIndex = Infinity;

    for (const rule of TOKEN_RULES) {
      const m = rule.regex.exec(remaining);
      if (m && m.index < bestIndex) {
        bestIndex = m.index;
        bestRule = rule;
        bestMatch = m;
        if (bestIndex === 0) break;
      }
    }

    if (!bestRule || !bestMatch) {
      nodes.push(remaining);
      break;
    }

    if (bestIndex > 0) {
      nodes.push(remaining.slice(0, bestIndex));
    }

    const key = `${keyPrefix}-${counter++}`;
    const fullMatch = bestMatch[0];
    let consumedLength = fullMatch.length;
    const recurse = (inner: string, nextInItalic = inItalic) =>
      parseFormattedNodes(inner, onOpenCitation, variant, key, nextInItalic);

    switch (bestRule.type) {
      case 'br':
        nodes.push(<br key={key} />);
        break;

      case 'escape':
        nodes.push(bestMatch[1]);
        break;

      case 'htmlLink': {
        const url = bestMatch[1];
        const inner = bestMatch[2];
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {recurse(inner)}
          </a>
        );
        break;
      }

      case 'mdLink': {
        const label = bestMatch[1];
        const url = bestMatch[2];
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {recurse(label)}
          </a>
        );
        break;
      }

      case 'angleUrl': {
        const url = bestMatch[1];
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {url}
          </a>
        );
        break;
      }

      case 'autoUrl': {
        const url = cleanBareUrl(fullMatch);
        consumedLength = url.length;
        nodes.push(
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            {url}
          </a>
        );
        break;
      }

      case 'citation': {
        const citationNum = Number(bestMatch[1]);
        if (onOpenCitation && !Number.isNaN(citationNum)) {
          nodes.push(
            <button
              key={key}
              type="button"
              data-citation-trigger="true"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCitation(citationNum, e.currentTarget);
              }}
              title={`View citation [${citationNum}]`}
              aria-label={`View citation ${citationNum}`}
              className={citationClass}
            >
              [{citationNum}]
            </button>
          );
        } else {
          nodes.push(fullMatch);
        }
        break;
      }

      case 'boldItalic':
        nodes.push(
          <strong key={key} className="font-bold">
            {inItalic ? (
              <span className="not-italic">{recurse(bestMatch[1], false)}</span>
            ) : (
              <em className="italic pr-[0.1em]">{recurse(bestMatch[1], true)}</em>
            )}
          </strong>
        );
        break;

      case 'boldMd':
        nodes.push(
          <strong key={key} className="font-bold">
            {recurse(bestMatch[1])}
          </strong>
        );
        break;

      case 'boldHtml':
        nodes.push(
          <strong key={key} className="font-bold">
            {recurse(bestMatch[2])}
          </strong>
        );
        break;

      case 'italicMd':
        nodes.push(
          inItalic ? (
            <span key={key} className="not-italic">
              {recurse(bestMatch[1], false)}
            </span>
          ) : (
            <em key={key} className="italic pr-[0.1em]">
              {recurse(bestMatch[1], true)}
            </em>
          )
        );
        break;

      case 'italicHtml':
        nodes.push(
          inItalic ? (
            <span key={key} className="not-italic">
              {recurse(bestMatch[2], false)}
            </span>
          ) : (
            <em key={key} className="italic pr-[0.1em]">
              {recurse(bestMatch[2], true)}
            </em>
          )
        );
        break;

      case 'underlineHtml':
        nodes.push(
          <span key={key} className="underline underline-offset-2">
            {recurse(bestMatch[1])}
          </span>
        );
        break;

      case 'strikeMd':
        nodes.push(
          <s key={key} className="line-through">
            {recurse(bestMatch[1])}
          </s>
        );
        break;

      case 'strikeHtml':
        nodes.push(
          <s key={key} className="line-through">
            {recurse(bestMatch[2])}
          </s>
        );
        break;

      case 'supMd':
        nodes.push(
          <sup
            key={key}
            className="relative -top-[0.28em] text-[0.75em] leading-[0] align-baseline"
          >
            {recurse(bestMatch[1])}
          </sup>
        );
        break;

      case 'supHtml':
        nodes.push(
          <sup
            key={key}
            className="relative -top-[0.28em] text-[0.75em] leading-[0] align-baseline"
          >
            {recurse(bestMatch[1])}
          </sup>
        );
        break;

      case 'subMd':
        nodes.push(
          <sub
            key={key}
            className="relative -bottom-[0.18em] text-[0.75em] leading-[0] align-baseline"
          >
            {recurse(bestMatch[1])}
          </sub>
        );
        break;

      case 'subHtml':
        nodes.push(
          <sub
            key={key}
            className="relative -bottom-[0.18em] text-[0.75em] leading-[0] align-baseline"
          >
            {recurse(bestMatch[1])}
          </sub>
        );
        break;

      case 'codeMd':
      case 'codeHtml':
        nodes.push(
          <code key={key} className={codeClass}>
            {bestMatch[1]}
          </code>
        );
        break;
    }

    remaining = remaining.slice(bestIndex + consumedLength);
  }

  return nodes;
}

export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  onOpenCitation,
  variant = 'light',
}) => {
  if (!text) return null;
  return <>{parseFormattedNodes(text, onOpenCitation, variant)}</>;
};
