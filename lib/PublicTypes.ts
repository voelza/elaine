import Component from "./Component";

export type SetupState = {
    state: any | undefined;
    onMounted?: (state: InstanceState) => void;
    beforeUnmounted?: (state: InstanceState) => void;
    onUnmounted?: (state: InstanceState) => void;
    beforeDestroyed?: (state: InstanceState) => void;
    onDestroyed?: (state: InstanceState) => void;
    components?: Component[]
};

export type ComponentData = {
    name: string;
    template: string | Element;
    props?: string[];
    slots?: string[];
    setup?: (state: InstanceState) => SetupState | void;
    onMounted?: (state: InstanceState) => void;
    beforeUnmounted?: (state: InstanceState) => void;
    onUnmounted?: (state: InstanceState) => void;
    beforeDestroyed?: (state: InstanceState) => void;
    onDestroyed?: (state: InstanceState) => void;
    css?: string | undefined;
};

export type InstanceState = {
    element: Element,
    data: any,
    methods: any,
    refs: any,
    dispatchEvent: (eventName: string, payload: any | undefined) => void
};

export interface ComputedState<T> {
    value: T
}