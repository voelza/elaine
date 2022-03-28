import Instance from "./Instance";
import { InstanceState, SetupState } from "./PublicTypes";

export default class Component {
    name: string;
    private template: Element;
    private props: string[] = [];
    private slots: string[] = [];
    private setup: ((state: InstanceState) => SetupState | void) | undefined;
    private onMounted: ((state: InstanceState) => void) | undefined;
    private beforeUnmounted: ((state: InstanceState) => void) | undefined;
    private onUnmounted: ((state: InstanceState) => void) | undefined;
    private beforeDestroyed: ((state: InstanceState) => void) | undefined;
    private onDestroyed: ((state: InstanceState) => void) | undefined;

    constructor(
        name: string,
        element: Element,
        props: string[] = [],
        slots: string[] = [],
        setup: ((state: InstanceState) => SetupState | void) | undefined = undefined,
        onMounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        onUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeDestroyed: ((state: InstanceState) => void) | undefined = undefined,
        onDestroyed: ((state: InstanceState) => void) | undefined = undefined) {
        this.name = name;
        this.template = element.cloneNode(true) as Element;
        this.props = props;
        this.slots = slots;
        this.setup = setup;
        this.onMounted = onMounted;
        this.beforeUnmounted = beforeUnmounted;
        this.onUnmounted = onUnmounted;
        this.beforeDestroyed = beforeDestroyed;
        this.onDestroyed = onDestroyed;
    }

    toInstance(element: Element, parent: Instance): Instance {
        return new Instance(
            element,
            this.template,
            parent,
            this.props,
            this.slots,
            this.setup,
            this.onMounted,
            this.beforeUnmounted,
            this.onUnmounted,
            this.beforeDestroyed,
            this.onDestroyed
        );
    }
}