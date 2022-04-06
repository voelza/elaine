import Condition from "./Condition";
import State from "./states/State";
import { ATTRIBUTE_ELEMENT_STATE_BINDING, BINDING, EVENT_LISTENER_BINDING, TEMPLATE_PARENT_CALL, TEXT_STATE_BINDING } from "./Syntax";
import StateLink from "./links/StateLink";
import MutableState from "./states/MutableState";
import ImmutableState from "./states/ImmutableState";
import Component, { COMPONENT_CSS_SCOPE } from "./Component";
import ComputedState from "./states/ComputedState";
import { insertAfter, insertBefore } from "./utils/DOM";
import { link } from "./links/Linker";
import { InstanceState, Prop, SetupState } from "./PublicTypes";
import { StateBinding } from "./states/StateBinding";
import { retrieveBindings } from "./utils/RegexMatcher";
import RenderLink from "./links/RenderLink";
import EventHub, { GlobalEventListener } from "./EventHub";
import Store from "./Store";

export enum Origin {
    SETUP,
    COMPONENT,
    IF,
    LOOP
}

export const SLOT_INDICATOR = "elaine-slot";
export const SLOT_RESOLVER = "elaine-slot-resolver";
const SLOT_PARENT_COMPONENT = "elaine-parent-component";


function dateToDateStr(date: Date): string {
    return date.toLocaleDateString();
}
function dateToTimeStr(date: Date): string {
    return date.toLocaleTimeString();
}
function dateToDateTimeStr(date: Date): string {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

const componentElements: string[] = [];

export default class Instance {
    private origin: Origin;
    private element: Element;
    parent: Instance | undefined = undefined;
    private template: Element;
    private states: Map<string, State<any>> = new Map();
    private methods: Map<string, Function> = new Map();
    components: Map<string, Component> = new Map();
    private links: StateLink[] = [];
    private childInstances: Instance[] = [];

    private condition: Condition | undefined;
    private conditionLink: RenderLink | undefined;

    private props: Prop<any>[] = [];
    private slots: string[] = [];
    private setup: ((state: InstanceState) => SetupState | void) | undefined;
    private onMounted: ((state: InstanceState) => void) | undefined;
    private beforeUnmounted: ((state: InstanceState) => void) | undefined;
    private onUnmounted: ((state: InstanceState) => void) | undefined;
    private beforeDestroyed: ((state: InstanceState) => void) | undefined;
    private onDestroyed: ((state: InstanceState) => void) | undefined;

    internalState: InstanceState;
    private wasCreated: boolean;
    private dispatchEvent: (eventName: string, payload: any) => void;

    private globalEventListeners: GlobalEventListener[] = [];
    private dispatchGlobalEvent: (eventName: string, payload: any) => void;
    private addGlobalEventListener: (eventName: string, listener: (payload: any) => void) => void;

    private styleElement: Element | undefined;

    constructor(
        origin: Origin,
        element: Element,
        template: Element,
        parent: Instance | undefined = undefined,
        props: Prop<any>[] = [],
        slots: string[] = [],
        setup: ((state: InstanceState) => SetupState | void) | undefined = undefined,
        onMounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        onUnmounted: ((state: InstanceState) => void) | undefined = undefined,
        beforeDestroyed: ((state: InstanceState) => void) | undefined = undefined,
        onDestroyed: ((state: InstanceState) => void) | undefined = undefined,
        components: Component[] | undefined = undefined) {
        this.origin = origin;
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
        this.dispatchGlobalEvent = (eventName: string, payload: any): void => {
            EventHub.dispatchEvent(eventName, payload);
        };
        this.addGlobalEventListener = (eventName: string, listener: (payload: any) => void) => {
            const globalEventListener: GlobalEventListener = { eventName, listener };
            EventHub.addListener(globalEventListener);
            this.globalEventListeners.push(globalEventListener);
        };

        this.internalState = {
            element: this.template,
            data: {},
            methods: {},
            refs: {},
            $store: Store.value,
            dispatchEvent: this.dispatchEvent,
            dispatchGlobalEvent: this.dispatchGlobalEvent,
            addGlobalEventListener: this.addGlobalEventListener
        };

        this.condition = this.extractCondition(element);
        if (this.condition) {
            this.conditionLink = new RenderLink(element, this.condition.getBindings(), this.condition, undefined, this);
            this.conditionLink.init();
        }

        this.wasCreated = false;

        this.methods.set("$date", dateToDateStr);
        this.methods.set("$time", dateToTimeStr);
        this.methods.set("$dateTime", dateToDateTimeStr);

        this.states.set("$store", Store);

        if (this.components.size > 0) {
            for (const component of this.components.values()) {
                componentElements.push(component.name);
                for (const elementName of component.slots) {
                    componentElements.push(elementName.toUpperCase());
                }
            }
        }
    }

    isComponentElement(tagName: string): boolean {
        return componentElements.includes(tagName);
    }

    private setupIfNeeded(): void {
        if (this.wasCreated) {
            return;
        }

        this.resolveProps(this.element, this.parent);
        this.resolveSetup();

        this.resolveSlots(this.element);

        // copy over attributes from parent
        for (const elementAttr of Array.from(this.element.attributes)) {
            if (elementAttr.name.startsWith(COMPONENT_CSS_SCOPE)) {
                continue;
            }
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

        if (this.origin === Origin.SETUP) {
            const css = this.gatherAllComponents()
                .map(c => c.css)
                .filter(c => c !== undefined)
                .reduce((cssAll, css) => cssAll + " " + css, "");

            if (css) {
                this.styleElement = document.createElement("style");
                this.styleElement.textContent = css;
            }
        }
        this.wasCreated = true;
    }

    private gatherAllComponents(): Component[] {
        return [...this.components.values(), ...this.childInstances.map(i => i.components.values()).flatMap(c => Array.from(c))];
    }

    addLink(link: StateLink): void {
        this.links.push(link);
    }

    getState(name: string): State<any> | undefined {
        if (name.startsWith(TEMPLATE_PARENT_CALL)) {
            return this.parent?.getState(name.substring(TEMPLATE_PARENT_CALL.length));
        }
        const foundState = this.states.get(name);
        if (!name.startsWith("!")) {
            return foundState;
        }

        const originalState = this.states.get(name.substring(1));
        if (!originalState) {
            return undefined;
        }

        const negateState = new ComputedState(() => !originalState.value, [originalState]);
        originalState.subscribe(negateState);
        this.states.set(name, negateState);
        this.addLink(negateState);
        return negateState;
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

        this.parent = instance.parent;
        return this;
    }

    getMethod(methodName: string): Function | undefined {
        if (methodName.startsWith(TEMPLATE_PARENT_CALL)) {
            return this.parent?.getMethod(methodName.substring(TEMPLATE_PARENT_CALL.length));
        }
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
        this.element.remove();
        this.setupIfNeeded();

        if (this.styleElement) {
            document.body.prepend(this.styleElement);
        }

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
            const slotOnComponent = this.template.querySelector(slotName);
            if (!slotOnComponent) {
                continue;
            }

            const variant = slotOnComponent.getAttribute("variant");
            const slotOnElement = element.querySelector(slotName);
            if (slotOnElement) {
                invertParentCalls(slotOnElement, this.parent?.components);
                if (variant) {
                    slotOnElement.setAttribute(SLOT_INDICATOR, "");
                    slotOnElement.setAttribute(SLOT_RESOLVER, variant);
                    insertBefore(slotOnElement, slotOnComponent);
                } else {
                    for (const child of Array.from(slotOnElement.childNodes)) {
                        insertBefore(child, slotOnComponent);
                    }
                }
            }
            slotOnComponent.remove();
        }
    }

    private resolveProps(element: Element, parent: Instance | undefined): void {
        for (const prop of this.props) {
            const propName = prop.name;
            const propAttr = element.getAttribute(propName);
            if (propAttr) {
                const stateName = propAttr.substring(BINDING.length);
                const state: State<any> | undefined = parent?.getState(stateName);
                if (state && state instanceof MutableState || state instanceof ImmutableState || state instanceof ComputedState) {
                    this.states.set(propName, state);
                    this.internalState.data[propName] = state;
                } else if (propAttr) {
                    // It must be a constants
                    const immutableState = new ImmutableState(this.parseIntoType(prop.type, propAttr));
                    this.states.set(propName, immutableState);
                    this.internalState.data[propName] = state;
                }

                element.removeAttribute(propName);
            } else {
                if (prop.required || prop.required === undefined) {
                    throw `Prop-Read-Error: "${propName}" is a required prop and was not provided.`
                } else {
                    const defaultState = new ImmutableState(prop.default);
                    this.states.set(propName, defaultState);
                    this.internalState.data[propName] = prop.default;
                }
            }
        }
    }

    private parseIntoType(type: any, value: string): any {
        if (value === "null") {
            return null;
        } else if (value === "undefined") {
            return undefined;
        } else if (type === Number) {
            if (value.includes(".")) {
                return Number.parseFloat(value);
            }
            return Number.parseInt(value);
        } else if (type === Boolean) {
            return value === "true";
        } else if (type === Object || type === Array) {
            return JSON.parse(value);
        }
        return value;
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

            for (const propName in setupResult.state ?? {}) {
                const state = setupResult.state[propName];
                if (state instanceof Function) {
                    this.methods.set(propName, state);
                    this.internalState.methods[propName] = state;
                } else if (state instanceof MutableState || state instanceof ComputedState || state instanceof ImmutableState) {
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
            const isParentComponent: boolean = element.getAttribute && element.getAttribute(SLOT_PARENT_COMPONENT) !== null;
            const componentByThatName: Component | undefined = isParentComponent ? this.parent?.getComponent(element.tagName) : this.getComponent(element.tagName);
            if (componentByThatName !== undefined) {
                const componentInstance: Instance = componentByThatName.toInstance(element, this);
                this.childInstances.push(componentInstance);

                const ref = element.getAttribute("ref");
                if (ref) {
                    this.internalState.refs[ref] = componentInstance.internalState;
                }

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
        this.styleElement?.remove();
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

        for (const globalEventListener of this.globalEventListeners) {
            EventHub.removeListener(globalEventListener);
        }
        this.globalEventListeners = [];

        if (this.onDestroyed) {
            this.onDestroyed(this.internalState);
        }
    }
}

function invertParentCalls(slot: Element, parentComponents: Map<string, Component> | undefined) {
    if (parentComponents?.get(slot.tagName)) {
        slot.setAttribute(SLOT_PARENT_COMPONENT, "");
    }

    if (slot instanceof Text && slot.textContent && slot.textContent.length !== 0) {
        const newText = slot.textContent
            .replaceAll(TEXT_STATE_BINDING, (_, g) => BINDING + "{" + invertParentCall(g) + "}")
            .replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
        slot.textContent = newText;
    } else if (slot.hasAttributes()) {
        for (const attribute of Array.from(slot.attributes)) {
            if (attribute.name === BINDING + "model") {
                attribute.value = invertParentCall(attribute.value.replace(BINDING, ""));
            } else if (attribute.name.startsWith(EVENT_LISTENER_BINDING)) {
                attribute.value = invertParentCall(attribute.value)
                    .replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
            } else {
                attribute.value = attribute.value
                    .replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
            }
        }
    }

    if (slot.hasChildNodes()) {
        invertChildrentParentCalls(slot.childNodes, parentComponents);
    }
}

function invertChildrentParentCalls(slotChildren: NodeListOf<Node> | Element[], parentComponents: Map<string, Component> | undefined) {
    for (let i = 0; i < slotChildren.length; i++) {
        const element = slotChildren[i];
        invertParentCalls(element as Element, parentComponents);
    }
}

function invertParentCall(template: string): string {
    return template.startsWith(TEMPLATE_PARENT_CALL) ? template.substring(TEMPLATE_PARENT_CALL.length) : TEMPLATE_PARENT_CALL + template;
}