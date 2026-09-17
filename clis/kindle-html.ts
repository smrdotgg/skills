#!/bin/sh
':' //; exec bun "$0" -- "$@"
// The shell launcher supplies the separator Bun consumes, preserving user '--'.
import { stat, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";

const VERSION = "1.0.0";
const USAGE = "Usage: kindle-html.ts [OPTIONS] [FILE|-]";
const HELP = `${USAGE}

Convert UTF-8 Markdown to small, basic HTML for reading on a Kindle.
One executable file. Requires Bun with Bun.markdown (tested on Bun 1.4.2).
No packages, build step, configuration files, or network requests.

INSTALL
  chmod +x kindle-html.ts
  Put this file's directory on PATH, or run: bun kindle-html.ts -- ...

INPUT AND OUTPUT
  FILE                   Markdown file. Omit FILE or use - to read stdin.
  -o, --output FILE      Write HTML to FILE, replacing existing contents.
                        Default: stdout. Use - explicitly for stdout.
  With no file and an interactive stdin, show usage and exit with code 2.
  Parent output directories must exist. Input and output must be different
  files (including symbolic and hard links).

OPTIONS
  --title TEXT          Set the browser/document title. Default: Document.
                        Does not insert a heading into the content.
  --text-only           Replace images with their available alt text.
                        Captions stay in place. Visual information is omitted.
  --base-url URL        Resolve relative links and images against an absolute
                        HTTP(S) URL. Local #fragment links stay local.
                        A trailing / makes the URL a directory base.
  -h, --help            Show this guide and exit.
  --version             Print the CLI version and exit.
  --                    End options; subsequent arguments are filenames.

EXAMPLES
  kindle-html.ts article.md > article.html
  kindle-html.ts article.md -o article.html
  cat article.md | kindle-html.ts > article.html
  kindle-html.ts - --title 'Reading notes' -o notes.html
  kindle-html.ts article.md --text-only -o article.html
  kindle-html.ts article.md --base-url https://example.com/posts/ -o article.html
  kindle-html.ts -- -unusual-filename.md

CONVERSION RULES
  Preserves wording and order while interpreting Markdown syntax. Supports
  headings, paragraphs, emphasis, strikethrough, lists (including tasks),
  quotations, links, images, code, tables, and horizontal rules. Task states
  become plain [x] / [ ] markers. Headings receive IDs for fragment links.
  Code indentation and line breaks are retained. Bun expands leading code
  tabs to four-column stops and normalizes CRLF line endings to LF.
  Normal prose uses HTML whitespace rules.
  No summaries, added visible titles, contents pages, or syntax highlighting.

  Output is a complete UTF-8 HTML document with zero classes, no JavaScript,
  and one tiny element-only stylesheet for wrapping, images, and tables.
  Whitespace is not aggressively minified, so words and code stay intact.

  Embedded HTML: basic reading elements and readable text are retained.
  Block layout wrappers become plain divs; redundant inline wrappers are
  unwrapped. Presentation attributes, comments, scripts, styles, frames,
  document metadata, and embedded media resources are removed. Fallback text
  and captions are retained where present. Interactive controls are reduced
  to text where possible. This is Markdown conversion, not website extraction.

  Images are ordinary references: nothing is downloaded, resized, converted,
  copied, or embedded. Images without a usable source become alt text.
  Links support HTTP(S), mailto, tel, FTP, and relative URLs; images support
  HTTP(S) and relative URLs. Other URL schemes are removed.
  Relative URLs are kept unless --base-url is supplied. Local image files
  must be made accessible alongside the published HTML. This CLI writes the
  HTML file; publish it separately to obtain a URL for your Kindle.

EXIT CODES
  0  Success (including --help and --version).
  1  Runtime, input, conversion, or output failure.
  2  Invalid arguments, missing interactive input, or input/output collision.
  Conversion writes only HTML to stdout; diagnostics go to stderr.
`;

const STYLE = "body{word-wrap:break-word}pre{white-space:pre-wrap}img{max-width:100%;height:auto}table{border-collapse:collapse}th,td{border:1px solid;padding:.2em}";
const BASIC_TAGS = new Set("a abbr b bdi bdo blockquote br caption code col colgroup dd del div dl dt em h1 h2 h3 h4 h5 h6 hr i img ins kbd li mark ol p pre q rp rt ruby s samp small span strong sub sup table tbody td tfoot th thead tr u ul var wbr".split(" "));
const BLOCK_WRAPPERS = new Set("address article aside center details dialog fieldset figcaption figure footer form header hgroup legend main menu nav option section summary".split(" "));
const DROP_CONTENT = new Set("script style iframe frame frameset noframes head title template".split(" "));
const RAW_TEXT_TAGS = ["xmp", "plaintext", "noembed", "noscript"];
const GLOBAL_ATTRIBUTES = new Set(["id", "title", "lang", "dir"]);
const ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "name"], img: ["src", "alt"], ol: ["start", "reversed", "type"],
  ul: ["type"], li: ["value"], td: ["colspan", "rowspan", "headers"],
  th: ["colspan", "rowspan", "scope", "headers"], col: ["span"], colgroup: ["span"],
};

// HTML accepts these legacy named entities without a semicolon in attributes.
const LEGACY_ENTITIES = new Set("AElig AMP Aacute Acirc Agrave Aring Atilde Auml COPY Ccedil ETH Eacute Ecirc Egrave Euml GT Iacute Icirc Igrave Iuml LT Ntilde Oacute Ocirc Ograve Oslash Otilde Ouml QUOT REG THORN Uacute Ucirc Ugrave Uuml Yacute aacute acirc acute aelig agrave amp aring atilde auml brvbar ccedil cedil cent copy curren deg divide eacute ecirc egrave eth euml frac12 frac14 frac34 gt iacute icirc iexcl igrave iquest iuml laquo lt macr micro middot nbsp not ntilde oacute ocirc ograve ordf ordm oslash otilde ouml para plusmn pound quot raquo reg sect shy sup1 sup2 sup3 szlig thorn times uacute ucirc ugrave uml uuml yacute yen yuml".split(" "));
const C1_REPLACEMENTS = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ";

class UsageError extends Error {}

type Options = { input: string; output: string; title: string; textOnly: boolean; baseURL?: URL };

function parseOptions(args: string[]): Options | "help" | "version" {
  let parsed: ReturnType<typeof parseArgs>;
  try {
    parsed = parseArgs({ args, allowPositionals: true, strict: true, options: {
      output: { type: "string", short: "o" }, title: { type: "string" },
      "text-only": { type: "boolean" }, "base-url": { type: "string" },
      help: { type: "boolean", short: "h" }, version: { type: "boolean" },
    } });
  } catch (error) {
    throw new UsageError(error instanceof Error ? error.message : String(error));
  }
  const { values, positionals } = parsed;
  if (values.help) return "help";
  if (values.version) return "version";
  if (positionals.length > 1) throw new UsageError("Expected at most one Markdown file.");
  const input = positionals[0] ?? "-";
  const output = (values.output as string | undefined) ?? "-";
  if (!input || !output) throw new UsageError("Input and output paths must not be empty.");
  let baseURL: URL | undefined;
  if (values["base-url"] !== undefined) {
    try {
      baseURL = new URL(values["base-url"] as string);
      if (!["http:", "https:"].includes(baseURL.protocol)) throw new Error();
    } catch {
      throw new UsageError("--base-url must be an absolute HTTP(S) URL.");
    }
  }
  return { input, output, title: (values.title as string | undefined) ?? "Document",
    textOnly: Boolean(values["text-only"]), baseURL };
}

function decodeAttribute(value: string): string {
  // HTMLRewriter returns encoded attributes; decode once before URL resolution
  // or converting an image's alt attribute into a text node.
  return value.replace(/&(#(?:[xX][\da-fA-F]+|\d+);?|[a-zA-Z][a-zA-Z\d]*;?)/g,
    (match: string, entity: string, offset: number) => {
      if (!entity.startsWith("#") && !entity.endsWith(";") &&
          (!LEGACY_ENTITIES.has(entity) || value[offset + match.length] === "=")) return match;
      const terminated = entity.endsWith(";") ? entity : `${entity};`;
      const decoded = Bun.markdown.render(`&${terminated}`, { text: text => text });
      // HTML numeric references use Windows-1252 for the C1 range.
      if (entity.startsWith("#") && decoded.length === 1) {
        const code = decoded.charCodeAt(0);
        if (code >= 0x80 && code <= 0x9f) return C1_REPLACEMENTS[code - 0x80]!;
      }
      return decoded;
    });
}

function readableURL(value: string, image: boolean, baseURL?: URL): string | undefined {
  const url = value.trim().replace(/[\t\n\r]/g, "");
  // Normalize the same controls browsers ignore before checking the scheme.
  const normalized = url.replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "");
  const scheme = /^([a-z][a-z\d+.-]*):/i.exec(normalized)?.[1]?.toLowerCase();
  const allowed = image ? ["http", "https"] : ["http", "https", "mailto", "tel", "ftp"];
  if (scheme && !allowed.includes(scheme)) return undefined;
  if (image && !normalized) return undefined;
  if (!baseURL || normalized.startsWith("#")) return normalized;
  try { return new URL(normalized, baseURL).href; }
  catch { return undefined; }
}

function cleanHTML(html: string, options: Options): string {
  return new HTMLRewriter().on("*", {
    element(element) {
      let tag = element.tagName.toLowerCase();
      if (DROP_CONTENT.has(tag)) { element.remove(); return; }

      if (tag === "input") {
        const type = decodeAttribute(element.getAttribute("type") ?? "text").toLowerCase();
        let text = "";
        if (type === "checkbox") text = element.hasAttribute("checked") ? "[x] " : "[ ] ";
        else if (type === "radio") text = element.hasAttribute("checked") ? "(x) " : "( ) ";
        else if (!["hidden", "password", "file", "range", "color"].includes(type)) {
          text = decodeAttribute(element.getAttribute(type === "image" ? "alt" : "value") ?? "");
        }
        element.replace(text);
        return;
      }
      if (BLOCK_WRAPPERS.has(tag)) { element.tagName = tag = "div"; }
      if (tag === "textarea" || RAW_TEXT_TAGS.includes(tag)) { element.tagName = tag = "pre"; }
      if (!BASIC_TAGS.has(tag)) { element.removeAndKeepContent(); return; }

      for (const [name, encoded] of [...element.attributes]) {
        element.removeAttribute(name);
        if (!GLOBAL_ATTRIBUTES.has(name) && !ATTRIBUTES[tag]?.includes(name)) continue;
        let value: string | undefined = decodeAttribute(encoded);
        if (name === "href" || name === "src") {
          value = readableURL(value, name === "src", options.baseURL);
        }
        if (value !== undefined) element.setAttribute(name, Bun.escapeHTML(value));
      }

      if (tag === "img" && (options.textOnly || !element.getAttribute("src"))) {
        element.replace(decodeAttribute(element.getAttribute("alt") ?? ""));
      } else if (tag === "span" && [...element.attributes].length === 0) {
        element.removeAndKeepContent();
      }
    },
  }).on("textarea", {
    // RCDATA already contains entity references; only literal '<' needs escaping.
    text(text) { text.replace(text.text.replace(/</g, "&lt;"), { html: true }); },
  }).on(RAW_TEXT_TAGS.join(", "), {
    // These elements contain raw text, which must stay text after changing tags.
    text(text) { text.replace(text.text); },
  }).onDocument({
    comments(comment) { comment.remove(); },
    doctype(doctype) { doctype.remove(); },
  }).transform(html);
}

function convert(markdown: string, options: Options): string {
  const content = cleanHTML(Bun.markdown.html(markdown, {
    headings: { ids: true }, tagFilter: false,
  }), options);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${Bun.escapeHTML(options.title)}</title><style>${STYLE}</style></head><body>${content}</body></html>\n`;
}

async function checkOutput(options: Options): Promise<void> {
  if (options.input === "-" || options.output === "-") return;
  const input = await stat(options.input);
  let output;
  try { output = await stat(options.output); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  if (input.dev === output.dev && input.ino === output.ino) {
    throw new UsageError("Input and output refer to the same file. Choose a different output path.");
  }
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  if (options === "help") { console.log(HELP); return; }
  if (options === "version") { console.log(`kindle-html.ts ${VERSION}`); return; }
  if (options.input === "-" && process.stdin.isTTY) {
    throw new UsageError("Supply a Markdown file or pipe Markdown into stdin.");
  }
  if (typeof Bun.markdown?.html !== "function" || typeof Bun.markdown?.render !== "function") {
    throw new Error("This CLI requires Bun.markdown. Upgrade Bun (tested on 1.4.2).");
  }
  await checkOutput(options);
  const source = options.input === "-" ? Bun.stdin : Bun.file(options.input);
  const markdown = new TextDecoder("utf-8", { fatal: true }).decode(await source.arrayBuffer());
  const html = convert(markdown, options);
  if (options.output === "-") await Bun.write(Bun.stdout, html);
  else await writeFile(options.output, html, "utf8");
}

main().catch((error: unknown) => {
  if ((error as NodeJS.ErrnoException)?.code === "EPIPE") return;
  console.error(`kindle-html.ts: ${error instanceof Error ? error.message : String(error)}`);
  if (error instanceof UsageError) console.error(`${USAGE}\nTry 'kindle-html.ts --help' for examples and conversion rules.`);
  process.exitCode = error instanceof UsageError ? 2 : 1;
});
