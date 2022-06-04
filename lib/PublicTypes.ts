import Component from "./Component";
import { StoreInstance } from "./Store";

export type SetupState = {
    state?: any | undefined;
    onMounted?: (state: InstanceState) => void;
    beforeUnmounted?: (state: InstanceState) => void;
    onUnmounted?: (state: InstanceState) => void;
    beforeDestroyed?: (state: InstanceState) => void;
    onDestroyed?: (state: InstanceState) => void;
};

export interface ElaineSetup extends SetupState {
    components?: Component[];
};

export type ComponentData = {
    name: string;
    template: string | Element;
    props?: Prop<any>[];
    slots?: string[];
    setup?: (state: InstanceState) => SetupState | void;
    onMounted?: (state: InstanceState) => void;
    beforeUnmounted?: (state: InstanceState) => void;
    onUnmounted?: (state: InstanceState) => void;
    beforeDestroyed?: (state: InstanceState) => void;
    onDestroyed?: (state: InstanceState) => void;
    css?: string | undefined;
    components?: Component[];
};

export type InstanceState = {
    element: Element,
    data: any,
    methods: any,
    refs: any,
    $store: StoreInstance,
    dispatchEvent: (eventName: string, payload: any | undefined) => void,
    dispatchGlobalEvent: (eventName: string, payload: any | undefined) => void,
    addGlobalEventListener: (eventName: string, listener: (payload: any) => void) => void
};

export interface ComputedState<T> {
    value: T
}

export type Prop<T> = {
    name: string,
    required?: boolean,
    type: T,
    default?: T
}