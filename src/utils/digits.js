const PERSIAN = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC = '٠١٢٣٤٥٦٧٨٩';

/** Converts Persian / Arabic-Indic digits to ASCII digits. */
export function toEnglishDigits(input) {
    return String(input ?? '').replace(/[۰-۹٠-٩]/g, (ch) => {
        const p = PERSIAN.indexOf(ch);
        return p !== -1 ? String(p) : String(ARABIC.indexOf(ch));
    });
}

export function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    return Number.isNaN(n) ? '' : n.toLocaleString('en-US');
}

export function parseDigits(text) {
    const digits = toEnglishDigits(text).replace(/\D/g, '');
    return digits === '' ? null : parseInt(digits, 10);
}
