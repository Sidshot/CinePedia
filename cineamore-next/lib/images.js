import { getProxyUrl } from '@/lib/image-proxy';

/**
 * Generates an optimized poster URL.
 * Supports an optional proxy (e.g. ImageKit) via NEXT_PUBLIC_IMAGE_PROXY.
 * 
 * @param {string} title - Movie title
 * @param {string|number} year - Movie year
 * @param {string} [existingUrl] - Optional existing direct URL
 * @returns {string} Fully qualified image URL
 */
export function getPosterUrl(title, year, existingUrl) {
    if (existingUrl && existingUrl.length > 5) return getProxyUrl(existingUrl);

    const bingUrl = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(`"${title}" (${year}) film poster`)}&w=300&h=450&c=7&rs=1&p=0`;

    // Check for proxy environment variable
    const proxy = process.env.NEXT_PUBLIC_IMAGE_PROXY;
    if (proxy && proxy.startsWith('http')) {
        // Remove trailing slash from proxy if present
        const cleanProxy = proxy.replace(/\/$/, '');
        // Construct proxied URL (assuming ImageKit Web Proxy source or similar)
        // If it's ImageKit, the format is usually: https://ik.imagekit.io/id/ <url>
        return `${cleanProxy}/${encodeURIComponent(bingUrl)}`;
    }

    return bingUrl;
}

export function getBackdropUrl(title, year, existingUrl) {
    if (existingUrl && existingUrl.length > 5) return getProxyUrl(existingUrl);

    const bingUrl = `https://tse2.mm.bing.net/th?q=${encodeURIComponent(`"${title}" (${year}) film scene high quality`)}&w=1200&h=600&c=7&rs=1&p=0`;

    const proxy = process.env.NEXT_PUBLIC_IMAGE_PROXY;
    if (proxy && proxy.startsWith('http')) {
        const cleanProxy = proxy.replace(/\/$/, '');
        return `${cleanProxy}/${encodeURIComponent(bingUrl)}`;
    }

    return bingUrl;
}
