import Instance from "../Instance";
import { StateBinding } from "../states/StateBinding";
import uuid from "../states/uuid";
import { BINDING } from "../Syntax";
import EventListenerLink from "./EventListenerLink";
import { linkEventListener } from "./EventListenerLinker";
import StateLink from "./StateLink";

export default class ModelLink implements StateLink {
    element: Element;
    binding: StateBinding;
    isPathValue: boolean;
    inputListener: (e: Event) => void;
    targetAttribute: string;
    eventListener: EventListenerLink | undefined;

    constructor(instance: Instance, element: Element, binding: StateBinding) {
        this.element = element;
        this.binding = binding;
        this.isPathValue = binding.binding !== binding.stateName;
        this.inputListener = this.getInputListener(binding);

        this.element.removeAttribute(BINDING + "model");
        this.targetAttribute = element.getAttribute("type") === "checkbox" ? "checked" : "value";
        this.eventListener = this.createInputListener(instance);
    }

    getInputListener(binding: StateBinding): (e: Event) => void {
        if (this.isPathValue) {
            return (e: Event) => {
                const target: any | null = e.target;
                if (target) {
                    binding.state?.setPathValue(binding.stateSubPath, target[this.targetAttribute]);
                }
            };
        }
        return (e: Event) => {
            const target: any | null = e.target;
            if (target && binding.state) {
                binding.state.value = target[this.targetAttribute];
            }
        };
    }

    createInputListener(instance: Instance): EventListenerLink | undefined {
        const listenerName: string = this.binding.binding + "-" + uuid();
        instance.addMethod(listenerName, this.inputListener);
        return linkEventListener(instance, this.element, {
            name: "++input",
            value: listenerName
        });
    }

    init() {
        this.update();
        this.eventListener?.init();
    }

    update() {
        if (this.isPathValue) {
            (this.element as any)[this.targetAttribute] = this.binding.state?.value.getValueForKeyPath(this.binding.stateSubPath);
        } else {
            (this.element as any)[this.targetAttribute] = this.binding.state?.value;
        }
    }

    destroy(): void {
        this.eventListener?.destroy();
        this.binding.state?.unsubscribe(this);
    }
}