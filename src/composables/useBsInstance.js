import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { loadBootstrap } from '../utils/bootstrap.js';

/**
 * Creates a Bootstrap 6 plugin instance after the component is mounted and
 * disposes it when the component unmounts (or when it is re-created).
 *
 * @param {string}   name        Plugin name: Combobox | Chips | OtpInput | Range
 * @param {Function} getElement  () => HTMLElement   (usually reads a template ref)
 * @param {Function} getConfig   () => object        (plugin options)
 * @param {object}   hooks       { onCreate(instance, el), onDestroy(instance, el) }
 */
export function useBsInstance(name, getElement, getConfig, hooks = {}) {
    const instance = shallowRef(null);
    let sequence = 0;
    let unmounted = false;
    let currentEl = null;

    function destroy() {
        sequence++;
        const inst = instance.value;
        instance.value = null;

        if (inst) {
            try { hooks.onDestroy?.(inst, currentEl); } catch (e) { /* noop */ }
            try { inst.dispose(); } catch (e) { /* noop */ }
        }
        currentEl = null;
    }

    async function create() {
        destroy();
        const ticket = sequence;
        const Plugin = await loadBootstrap(name);

        // The component may have been unmounted / re-created while the plugin was loading
        if (unmounted || ticket !== sequence) return null;

        const el = getElement();
        if (!el) return null;

        // A data-api click can already have created an instance for this element
        Plugin.getInstance?.(el)?.dispose();

        currentEl = el;
        const inst = new Plugin(el, getConfig());
        instance.value = inst;
        hooks.onCreate?.(inst, el);
        return inst;
    }

    onMounted(() => {
        unmounted = false;
        create().catch((error) => {
            // eslint-disable-next-line no-console
            console.error(`[inertia-bootstrap-forms] Could not start Bootstrap ${name}.`, error);
        });
    });

    onBeforeUnmount(() => {
        unmounted = true;
        destroy();
    });

    return { instance, create, destroy };
}
