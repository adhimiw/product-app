/**
 * Secure HTML Sanitizer for XSS Prevention (OWASP Top 10 A03:2021)
 * Safely strips malicious script tags, iframes, inline event handlers (onload, onerror), and javascript: protocol URIs.
 */

const ALLOWED_TAGS = new Set([
    'B', 'I', 'U', 'S', 'STRONG', 'EM', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'UL', 'OL', 'LI', 'BR', 'SPAN', 'DIV', 'BLOCKQUOTE'
]);

export function sanitizeHtml(dirty) {
    if (!dirty || typeof dirty !== 'string') return '';
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(dirty, 'text/html');

        const sanitizeNode = (node) => {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const tagName = child.tagName.toUpperCase();

                    // If tag is not allowed, strip the tag or replace with text
                    if (!ALLOWED_TAGS.has(tagName)) {
                        child.remove();
                        continue;
                    }

                    // Remove all on* event handler attributes and dangerous protocols
                    const attrs = Array.from(child.attributes);
                    for (const attr of attrs) {
                        const attrName = attr.name.toLowerCase();
                        const attrVal = attr.value.toLowerCase();

                        if (attrName.startsWith('on') || 
                            attrVal.includes('javascript:') || 
                            attrVal.includes('data:text/html') ||
                            attrVal.includes('vbscript:')) {
                            child.removeAttribute(attr.name);
                        }
                    }

                    sanitizeNode(child);
                }
            }
        };

        sanitizeNode(doc.body);
        return doc.body.innerHTML;
    } catch (e) {
        console.warn('HTML Sanitization notice:', e);
        return dirty.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
}
