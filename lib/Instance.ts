import Condition from "./Condition";
import State from "./states/State";
import { ATTRIBUTE_ELEMENT_STATE_BINDING, BINDING } from "./Syntax";
import StateLink from "./links/StateLink";
import MutableState from "./states/MutableState";
import ImmutableState from "./states/ImmutableState";
import Component from "./Component";
import ComputedState from "./states/ComputedState";
import { insertAfter } from "./utils/DOM";
import { link } from "./links/Linker";
import { InstanceState, SetupState } from "./PublicTypes";
import { StateBinding } from "./states/StateBinding";
import { retrieveBindings } from "./utils/RegexMatcher";
import RenderLink from "./links/RenderLink";

export default class Instance {
    origin: string | undefined;
    private element: Element;
    private parent: Instance | undefined = undefined;
    private template: Element;
    private states: Map<string, State<any>> = new Map();
    private methods: Map<string, Function> = new Map();
    private components: Map<string, Component> = new Map();
    private links: StateLink[] = [];
    private childInstances: Instance[] = [];

    private condition: Condition | undefined;
    private conditionLink: RenderLink | undefined;

    private props: string[] = [];
    private slots: string[] = [];
    private setup: ((state: InstanceState) => SetupState | void) | undefined;
    private onMounted: ((state: InstanceState) => void) | undefined;
    private beforeUnmounted: ((state: InstanceState) => void) | undefined;
    private onUnmounted: ((state: InstanceState) => void) | undefined;
    private beforeDestroyed: ((state: InstanceState) => void) | undefined;
    private onDestroyed: ((state: InstanceState) => void) | undefined;

    private internalState: InstanceState;
    private wasCreated: boolean;
    private dispatchEvent: (eventName: string, payload: any) => void;

    constructor(
        element: Element,
        template: Element,
        parent: Instance | undefined = undefined,
        props: string[] = [],
        slots: string[] = [],
        setup: ((state: InstanceState) => SetupState | void) | undefined = undefined,
        onMounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        onUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeDestroyed: ((state: InstanceState) => void) | undefined = undefined,
        onDestroyed: ((state: InstanceState) => void) | undefined = undefined,
        components: Component[] | undefined = undefined) {
        this.element = element;
        this.template = template.cloneNode(true) as Element;
        this.parent = parent;
        this.props = props;
        this.slots = slots;
        this.setup = setup;
        this.onMounted = onMounted;
        this.beforeUnmounted = beforeUnmounted;
        this.onUnmounted = onUnmounted;
        this.beforeDestroyed = beforeDestroyed;
        this.onDestroyed = onDestroyed;

        for (const componentFromOutside of components ?? []) {
            this.components.set(componentFromOutside.name, componentFromOutside);
        }

        this.dispatchEvent = (eventName: string, payload: any): void => {
            const event = new CustomEvent(eventName, {
                detail: payload
            });
            this.template.dispatchEvent(event);
        }
        this.internalState = {
            element: this.template,
            data: {},
            methods: {},
            dispatchEvent: this.dispatchEvent
        };

        this.condition = this.extractCondition(element);
        if (this.condition) {
            this.conditionLink = new RenderLink(element, this.condition.getBindings(), this.condition, undefined, this);
            this.conditionLink.init();
        }
        this.wasCreated = false;
    }

    setupIfNeeded(): void {
        if (this.wasCreated) {
            return;
        }

        this.resolveSlots(this.element);
        this.resolveProps(this.element, this.parent);
        this.resolveSetup();

        // copy over attributes from parent
        for (const elementAttr of Array.from(this.element.attributes)) {
            const transferAttr: Attr = elementAttr.cloneNode(true) as Attr;
            this.template.attributes.setNamedItem(transferAttr);
        }

        // bindComponents from template (maybe)
        link(this, this.template, this.parent);
        /*
        * because of loops link init has to be done before
        */
        for (const link of this.links) {
            link.init();
        }
        this.initComponents([this.template]);

        // refs maybe

        this.wasCreated = true;
    }

    addLink(link: StateLink): void {
        this.links.push(link);
    }

    getState(name: string): State<any> | undefined {
        return this.states.get(name);
    }

    addState(name: string, state: State<any>): void {
        this.states.set(name, state);
    }

    merge(instance: Instance | undefined): Instance {
        if (!instance) {
            return this;
        }

        for (const state of instance.states.entries()) {
            this.states.set(state[0], state[1]);
        }
        for (const method of instance.methods.entries()) {
            this.addMethod(method[0], method[1]);
        }
        for (const component of instance.components.entries()) {
            this.registerComponent(component[0], component[1]);
        }
        return this;
    }

    getMethod(methodName: string): Function | undefined {
        return this.methods.get(methodName);
    }

    addMethod(name: string, method: Function): void {
        this.methods.set(name, method);
    }

    registerComponent(name: string, component: Component): void {
        this.components.set(name, component);
    }

    getComponent(name: string): Component | undefined {
        return this.components.get(name);
    }

    mount(): void {
        if (this.condition && !this.condition.eval()) {
            // do not mount or setup
            return;
        }
        insertAfter(this.template, this.element);
        this.setupIfNeeded();

        this.element.remove();

        // was mounted
        if (this.onMounted) {
            this.onMounted(this.internalState);
        }
    }

    appendMount(comment: Comment): void {
        if (this.condition && !this.condition.eval()) {
            // do not mount or setup
            return;
        }
        insertAfter(this.template, comment);
        this.setupIfNeeded();


        // was mounted
        if (this.onMounted) {
            this.onMounted(this.internalState);
        }
    }

    private extractCondition(element: Element): Condition | undefined {
        const condition: string | null = element.getAttribute(BINDING + "if");
        if (!condition) {
            return undefined;
        }
        const bindings: StateBinding[] = retrieveBindings(this.parent ?? this, ATTRIBUTE_ELEMENT_STATE_BINDING, condition);
        return new Condition(condition, bindings);
    }

    private resolveSlots(element: Element): void {
        for (const slotName of this.slots) {
            const slotOnThisComponent = this.template.querySelector(slotName);
            const slotTemplateOnElement = element.querySelector(slotName);

            if (slotTemplateOnElement && slotTemplateOnElement.parentNode) {
                slotTemplateOnElement.remove();

                const children: Element[] = Array.from(slotTemplateOnElement.children);
                for (const child of children) {
                    slotOnThisComponent?.parentNode?.insertBefore(child, slotOnThisComponent);
                }
            }
            slotOnThisComponent?.remove();
        }
    }

    private resolveProps(element: Element, parent: Instance | undefined): void {
        for (const propName of this.props) {
            const propAttr = element.getAttribute(propName);
            if (propAttr) {
                const stateName = propAttr.substring(BINDING.length);
                const state: State<any> | undefined = parent?.getState(stateName);
                if (state && state instanceof MutableState) {
                    this.states.set(propName, state);
                    this.internalState.data[propName] = state;
                } else if (propAttr) {
                    // It must be a constants
                    const immutableState = new ImmutableState(propAttr);
                    this.states.set(propName, immutableState);
                    this.internalState.data[propName] = state;
                }

                element.removeAttribute(propName);
            }
        }
    }

    private resolveSetup(): void {
        if (!this.setup) {
            return;
        }

        const setupResult: SetupState | void = this.setup(this.internalState);
        if (setupResult) {
            for (const component of setupResult.components || []) {
                this.registerComponent(component.name, component);
            }

            for (const propName in setupResult.state) {
                const state = setupResult.state[propName];
                if (state instanceof Function) {
                    this.methods.set(propName, state);
                    this.internalState.methods[propName] = state;
                } else if (state instanceof MutableState || state instanceof ComputedState) {
                    this.states.set(propName, state);
                    this.internalState.data[propName] = state;
                } else {
                    this.states.set(propName, new ImmutableState(state));
                    this.internalState.data[propName] = state;
                }
            }
        }
    }

    private initComponents(elements: NodeListOf<Node> | Element[]) {
        for (let i = 0; i < elements.length; i++) {
            const element: Element = elements[i] as Element;
            const componentByThatName: Component | undefined = this.getComponent(element.tagName);
            if (componentByThatName !== undefined) {
                const componentInstance: Instance = componentByThatName.toInstance(element, this);
                componentInstance.origin = "COMPONENT";
                this.childInstances.push(componentInstance);
                if (componentInstance.condition === undefined) {
                    componentInstance.mount();
                }
                continue;
            }

            if (element.hasChildNodes()) {
                this.initComponents(element.childNodes);
            }

        }
    }

    unmount(): void {
        if (this.beforeUnmounted) {
            this.beforeUnmounted(this.internalState);
        }

        this.template.remove();
        for (const instance of this.childInstances) {
            instance.unmount();
        }

        if (this.onUnmounted) {
            this.onUnmounted(this.internalState);
        }
    }

    destroy(): void {
        if (this.beforeDestroyed) {
            this.beforeDestroyed(this.internalState);
        }

        for (const instance of this.childInstances) {
            instance.destroy();
        }
        this.childInstances = [];
        for (const link of this.links) {
            link.destroy();
        }
        this.conditionLink?.destroy();

        if (this.onDestroyed) {
            this.onDestroyed(this.internalState);
        }
    }
}
