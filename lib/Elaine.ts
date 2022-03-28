import Component from "./Component";
import Instance from "./Instance";
import { ComponentData, SetupState } from "./PublicTypes";
import ComputedState from "./states/ComputedState";
import MutableState from "./states/MutableState";
import State from "./states/State";

Object.defineProperty(Object.prototype, "setValueForKey", {
    value: function (value: any, key: string) { this[key] = value; }
});
Object.defineProperty(Object.prototype, "setValueForKeyPath", {
    value: function (keyPath: string, value: any): void {
        if (keyPath == null) {
            return;
        }

        if (keyPath.indexOf('.') === -1) {
            this.setValueForKey(value, keyPath);
            return;
        }

        const chain: string[] = keyPath.split('.');
        const firstKey: string | undefined = chain.shift();
        const shiftedKeyPath: string = chain.join('.');

        if (firstKey) {
            this[firstKey].setValueForKeyPath(shiftedKeyPath, value);
        }
    }
});
Object.defineProperty(Object.prototype, "getValueForKey", {
    value: function (key: string): void {
        return this[key];
    }
});
Object.defineProperty(Object.prototype, "getValueForKeyPath", {
    value: function (keyPath: string): any {
        if (keyPath == null) return;
        if (keyPath.indexOf('.') === -1) {
            return this.getValueForKey(keyPath);
        }

        var chain: string[] = keyPath.split('.');
        var firstKey: string | undefined = chain.shift();
        var shiftedKeyPath: string = chain.join('.');

        if (firstKey) {
            return this[firstKey].getValueForKeyPath(shiftedKeyPath);
        }
    }
});


function setup(element: Element, setupState: SetupState | undefined): Instance {
    const instance = new Instance(
        element,
        element,
        undefined,
        [],
        [],
        () => {
            return setupState;
        },
        setupState?.onMounted,
        setupState?.beforeUnmounted,
        setupState?.onUnmounted,
        setupState?.beforeDestroyed,
        setupState?.onDestroyed,
        setupState?.components
    );
    instance.origin = "SETUP";
    instance.mount();
    return instance;
};

function state<T>(value: T): State<T> {
    return new MutableState(value);
}

function watch(watcher: () => void, ...states: State<any>[]): void {
    for (const reactive of states) {
        reactive.addWatcher(watcher);
    }
}

function computed<T>(computer: () => T, ...states: State<any>[]): ComputedState<T> {
    const computedValue: ComputedState<T> = new ComputedState(computer, states);
    for (const state of states) {
        state.subscribe(computedValue);
    }
    return computedValue;
}

function templateToElement(templateCode: string): Element {
    const template = document.createElement('template');
    templateCode = templateCode.trim();
    template.innerHTML = templateCode;
    return template.content.firstChild as Element;
}

function component(componentData: ComponentData): Component {
    const name = componentData.name.toUpperCase();
    const element = typeof componentData.template === "string" ? templateToElement(componentData.template) : componentData.template;
    return new Component(
        name,
        element,
        componentData.props,
        componentData.slots,
        componentData.setup,
        componentData.onMounted,
        componentData.beforeUnmounted,
        componentData.onUnmounted,
        componentData.beforeDestroyed,
        componentData.onDestroyed
    );
}

export default {
    setup,
    state,
    watch,
    computed,
    component
};