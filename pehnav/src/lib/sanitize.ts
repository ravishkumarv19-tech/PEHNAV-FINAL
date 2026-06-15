// HTML sanitizer — strips all dangerous tags and attributes
// Used before any dangerouslySetInnerHTML usage

const ALLOWED_TAGS = new Set(["strong", "em", "ul", "li", "br", "p"]);
const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
const ATTR_RE = /\s+on\w+\s*=|javascript:|data:/gi;

export function sanitizeHtml(html: string): string {
  // Remove dangerous attributes first
  let safe = html.replace(ATTR_RE, "");

  // Strip any tags not in the allowlist
  safe = safe.replace(TAG_RE, (match, tagName: string) => {
    if (ALLOWED_TAGS.has(tagName.toLowerCase())) return match;
    return ""; // strip disallowed tag entirely
  });

  return safe;
}

// Markdown → safe HTML (bold, bullets, line breaks only)
export function markdownToSafeHtml(text: string): string {
  const html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul class='mt-1 ml-4 space-y-1 list-disc'>$1</ul>")
    .replace(/\n/g, "<br/>");
  return html;
}
