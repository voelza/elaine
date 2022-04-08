import Component from "./Component";
import EventHub, { EventHubInstance } from "./EventHub";
import Instance, { Origin } from "./Instance";
import WatcherLink from "./links/WatcherLink";
import { ElaineOptions, setAppOptions } from "./Options";
import { ComponentData, InstanceState, SetupState } from "./PublicTypes";
import ComputedState from "./states/ComputedState";
import MutableState from "./states/MutableState";
import State from "./states/State";
import Store, { StoreInstance } from "./Store";

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


export function setup(element: Element, setupState: SetupState | undefined = undefined): InstanceState {
    const instance = new Instance(
        Origin.SETUP,
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
    instance.mount();
    console.log(instance);
    return instance.internalState;
};

export function state<T>(value: T): State<T> {
    return new MutableState(value);
}

export function watch(watcher: () => void, ...states: State<any>[]): void {
    const watcherLink: WatcherLink = new WatcherLink(watcher, ...states);
    for (const state of states) {
        state.subscribe(watcherLink);
    }
}

export function computed<T>(computer: () => T, ...states: State<any>[]): ComputedState<T> {
    const computedValue: ComputedState<T> = new ComputedState(computer, states);
    for (const state of states) {
        state?.subscribe(computedValue);
    }
    return computedValue;
}

export function templateToElement(templateCode: string): Element {
    const template = document.createElement('template');
    templateCode = templateCode.trim();
    template.innerHTML = templateCode;
    return template.content.firstChild as Element;
}

export function component(componentData: ComponentData): Component {
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
        componentData.onDestroyed,
        componentData.css
    );
}

export function eventHub(): EventHubInstance {
    return EventHub;
}

export function store(): StoreInstance {
    return Store.value;
}

export function withOptions(options: ElaineOptions) {
    setAppOptions(options);
}

export default {
    setup,
    state,
    watch,
    computed,
    component,
    eventHub,
    store,
    withOptions
};