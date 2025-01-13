export function normalizeLink(link: string): string {
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

    const hasForbiddedQuery = forbiddedQuery.some((query) =>
        url.searchParams.has(query),
    );

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

export function breakdownUrl(url: string): string[] {
    const res = [] as string[];
    res.push(normalizeLink(url));

    const u = new URL(url);
    u.hash = "";
    u.search = "";
    res.push(u.toString());
    const { pathname } = u;
    const tokens = pathname.split("/");
    tokens.pop();

    while (tokens.length > 0) {
        u.pathname = tokens.join("/");
        res.push(
            tokens.length > 1 ? u.toString() : u.toString().replace(/\/$/, ""),
        );
        tokens.pop();
    }

    return [...new Set(res)];
}
