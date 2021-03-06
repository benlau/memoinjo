export function normalizeLink(link) {
    const forbiddedQuery = [
        "fbclid",
        "gclid",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
    ];
    const url = new URL(link);

    const hasForbiddedQuery = forbiddedQuery.some((query) => url.searchParams.has(query));

    if (!hasForbiddedQuery) {
        return link;
    }

    forbiddedQuery.forEach((query) => {
        url.searchParams.delete(query);
    });

    return String(url);
}

export function hasNoValue(value) {
    if (typeof value === "string" || value instanceof String) {
        return value.trim() === "";
    }
    return value === undefined || value === null || value === "";
}

export function hasValue(value) {
    return !hasNoValue(value);
}

export async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function urlToId(url) {
    return (await sha256(url)).slice(0, 32);
}
