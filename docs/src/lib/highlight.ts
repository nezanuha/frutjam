/**
 * Code highlighting in the markup frutjam.com's `highlight_code` filter
 * produced: Pygments' HtmlFormatter(linenos='table'), with Pygments token
 * classes styled by pygments-monokai.css. Tokenising is done by Shiki; its
 * TextMate scopes are mapped onto the Pygments classes.
 */
import { createHighlighter, type BundledLanguage, type Highlighter } from 'shiki';

const LANGS: Record<string, BundledLanguage> = {
  html: 'html', css: 'css', js: 'javascript', javascript: 'javascript', jsx: 'jsx',
  ts: 'typescript', typescript: 'typescript', vue: 'vue', svelte: 'svelte',
  bash: 'bash', sh: 'bash', shell: 'bash', python: 'python', py: 'python', json: 'json',
  php: 'php', blade: 'blade', ruby: 'ruby', erb: 'erb', twig: 'twig', django: 'twig',
};

let highlighter: Promise<Highlighter> | undefined;
const getHighlighter = () =>
  (highlighter ??= createHighlighter({ themes: ['github-light'], langs: [...new Set(Object.values(LANGS))] }));

/**
 * TextMate scopes → Pygments token classes, most specific first. `null` means
 * Pygments leaves the text unstyled. Tuned against frutjam.com's own output.
 */
const SCOPE_CLASSES: Array<[RegExp, string | null]> = [
  [/comment/, 'c'],
  [/string\.unquoted|entity\.name\.(function|command)[^ ]*\.shell|variable\.parameter[^ ]*\.shell/, null],
  [/string|punctuation\.definition\.string/, 's'],
  [/punctuation\.definition\.keyword/, 'p'],
  [/entity\.name\.tag/, 'nt'],
  [/entity\.other\.attribute-name/, 'na'],
  [/punctuation\.separator\.key-value|keyword\.operator/, 'o'],
  [/keyword\.control\.from/, 'kr'],
  [/keyword\.control\.(import|export|default|flow|conditional|loop)|keyword\.control/, 'k'],
  [/storage\.type|storage\.modifier/, 'kd'],
  [/support\.type\.property-name/, 'k'],
  [/keyword/, 'k'],
  [/constant\.numeric|keyword\.other\.unit/, 'm'],
  [/constant\.language/, 'kc'],
  [/support\.variable\.dom|support\.class\.builtin|support\.variable\.object/, 'nb'],
  [/support\.function\.(misc|transform|color|url)|support\.function[^ ]*\.css/, 'nf'],
  [/entity\.name\.function|support\.function/, 'nx'],
  [/entity\.name\.(type|class)|support\.class/, 'nc'],
  [/variable|support\.variable|meta\.object-literal\.key/, 'nx'],
  [/punctuation|meta\.brace/, 'p'],
];

/**
 * JSX inside a `javascript` block: Pygments' JavaScript lexer reads tags and
 * attributes as names and brackets as operators. (`jsx` blocks use its JSX
 * lexer, which the default mapping already matches.)
 */
const JSX_CLASSES: Array<[RegExp, string]> = [
  [/punctuation\.definition\.tag/, 'o'],
  [/entity\.name\.tag|entity\.other\.attribute-name|support\.class\.component/, 'nx'],
];

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function tokenClass(scopes: string[], jsx: boolean): string | undefined {
  for (let i = scopes.length - 1; i >= 0; i--) {
    if (jsx) for (const [re, cls] of JSX_CLASSES) if (re.test(scopes[i])) return cls;
    for (const [re, cls] of SCOPE_CLASSES) if (re.test(scopes[i])) return cls ?? undefined;
  }
  return undefined;
}

export async function highlightCode(code: string, lang = 'html'): Promise<string> {
  const hl = await getHighlighter();
  // Pygments drops leading and trailing blank lines (stripnl).
  const source = code.replace(/^\s*\n/, '').replace(/\s+$/, '');
  const shikiLang = LANGS[lang] ?? 'html';
  const jsx = shikiLang === 'javascript';
  const lines = hl.codeToTokensBase(source, { lang: shikiLang, theme: 'github-light', includeExplanation: true });

  const body = lines
    .map((line) =>
      line
        .map((token) => {
          if (!token.content.trim()) return escape(token.content);
          const parts = token.explanation?.length ? token.explanation : [{ content: token.content, scopes: [] }];
          return parts
            .map((part) => {
              const cls = tokenClass(part.scopes.map((s) => s.scopeName), jsx);
              return cls && part.content.trim() ? `<span class="${cls}">${escape(part.content)}</span>` : escape(part.content);
            })
            .join('');
        })
        .join('')
    )
    .join('\n');

  const code_ = `<div><pre><span></span>${body}\n</pre></div>`;
  if (lines.length <= 1) {
    return `<div class="highlight"><table class="highlighttable"><tr><td class="code ps-4">${code_}</td></tr></table></div>\n`;
  }
  // Pygments right-aligns line numbers to the widest one.
  const digits = String(lines.length).length;
  const numbers = lines.map((_, i) => `<span class="normal">${String(i + 1).padStart(digits, ' ')}</span>`).join('\n');
  return `<div class="highlight"><table class="highlighttable"><tr><td class="linenos" data-pagefind-ignore><div class="linenodiv"><pre>${numbers}</pre></div></td><td class="code">${code_}</td></tr></table></div>\n`;
}
