/** Default headers for same-origin Laravel endpoints (Accept JSON + XSRF cookie). */
export function laravelHeaders(extra = {}) {
    const headers = {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...extra,
    };

    if (typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (match && !headers['X-XSRF-TOKEN']) headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
    }

    return headers;
}
