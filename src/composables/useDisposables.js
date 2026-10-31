import { onBeforeUnmount } from 'vue';

/**
 * Tracks every resource a component acquires after mount (DOM listeners,
 * timers, abort controllers, third-party instances) and releases all of them
 * in reverse order when the component unmounts.
 */
export function useDisposables() {
    const tasks = [];
    let disposed = false;

    const add = (fn) => {
        if (disposed) {
            try { fn(); } catch (e) { /* noop */ }
            return () => {};
        }
        tasks.push(fn);
        return () => {
            const i = tasks.indexOf(fn);
            if (i !== -1) tasks.splice(i, 1);
        };
    };

    const listen = (target, type, handler, options) => {
        if (!target) return () => {};
        target.addEventListener(type, handler, options);
        return add(() => target.removeEventListener(type, handler, options));
    };

    const timeout = (fn, ms) => {
        const id = setTimeout(fn, ms);
        add(() => clearTimeout(id));
        return id;
    };

    const abortable = () => {
        const controller = new AbortController();
        add(() => controller.abort());
        return controller;
    };

    const dispose = () => {
        disposed = true;
        while (tasks.length) {
            try { tasks.pop()(); } catch (e) { /* keep releasing the rest */ }
        }
    };

    onBeforeUnmount(dispose);

    return {
        add,
        listen,
        timeout,
        abortable,
        dispose,
        isDisposed: () => disposed,
    };
}
