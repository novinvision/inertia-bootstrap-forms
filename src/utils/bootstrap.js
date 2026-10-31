/**
 * Lazy loader for Bootstrap 6 JavaScript plugins.
 *
 * Plugins are imported on demand (inside `onMounted`), which keeps the package
 * SSR-safe and lets bundlers code-split every plugin. If your application
 * already imports Bootstrap (or you want to pin a specific build) you can hand
 * the classes over with `configureBootstrap({ Combobox, Chips, OtpInput, Range, Menu })`.
 */
const overrides = {};
const cache = new Map();

const loaders = {
    Combobox: () => import('bootstrap/js/dist/combobox.js'),
    Menu: () => import('bootstrap/js/dist/menu.js'),
    Strength: () => import('bootstrap/js/dist/strength.js'),
    Chips: () => import('bootstrap/js/dist/chips.js'),
    OtpInput: () => import('bootstrap/js/dist/otp-input.js'),
    Range: () => import('bootstrap/js/dist/range.js'),
};

export function configureBootstrap(modules = {}) {
    Object.assign(overrides, modules);
    cache.clear();
}

export function loadBootstrap(name) {
    if (overrides[name]) {
        return Promise.resolve(overrides[name]);
    }

    if (!loaders[name]) {
        return Promise.reject(new Error(`[inertia-bootstrap-forms] Unknown Bootstrap plugin "${name}"`));
    }

    if (!cache.has(name)) {
        cache.set(
            name,
            loaders[name]()
                .then((mod) => mod.default ?? mod[name])
                .catch((error) => {
                    cache.delete(name);
                    throw error;
                })
        );
    }

    return cache.get(name);
}
