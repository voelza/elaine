import Instance, { SLOT_INDICATOR, SLOT_RESOLVER } from "../Instance";
import { createTemplateStates, Match, MatchRequest, regexMatches, regexMatchesGroups, retrieveBindings } from "../utils/RegexMatcher";
import { StateBinding } from "../states/StateBinding";
import { ATTRIBUTE_ELEMENT_STATE_BINDING, BINDING, EVENT_LISTENER_BINDING, EVENT_LISTENER_PARENT_CALL_ID, LOOP_BINDING, TEMPLATE_PARENT_CALL, TEXT_CONDITIONAL_STATE_BINDING, TEXT_STATE_BINDING } from "../Syntax";
import TextLink from "./TextLink";
import { getBindingNameFromKeyPath, getValuePath } from "../utils/PathHelper";
import State from "../states/State";
import { linkEventListener } from "./EventListenerLinker";
import ModelLink from "./ModelLink";
import LoopLink from "./LoopLink";
import AttributeLink from "./AttributeLink";
import RenderLink from "./RenderLink";
import Condition from "../Condition";
import { insertBefore } from "../utils/DOM";

export type Attribute = {
    name: string;
    value: string;
};

export function link(instance: Instance, element: Element, parent: Instance | undefined = undefined): void {
    if (element.tagName === "SCRIPT" || element instanceof Comment) {
        return;
    }

    if ("TEMPLATE-STATE" === element.tagName) {
        addStateFromTemplate(instance, element);
        return;
    }

    if (element.hasAttribute && element.hasAttribute(SLOT_INDICATOR)) {
        resolveSlots(instance, element, parent);
        return;
    }

    let shouldLinkChildren = true;
    if (!(element instanceof Text) && element.hasAttributes()) {
        shouldLinkChildren = linkAttributes(instance, element, parent);
    }

    if (element instanceof Text) {
        linkTextNode(instance, element);
    }

    if (shouldLinkChildren && element.hasChildNodes() && !instance.isComponentElement(element.tagName)) {
        // only if element has no if or for-loop or component. then its managed by different instance
        linkChildren(instance, element.childNodes, parent);
    }
}

function linkChildren(instance: Instance, elements: NodeListOf<Node> | Element[], parent: Instance | undefined = undefined): void {
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        link(instance, element as Element, parent);
    }
}

function linkTextNode(instance: Instance, textNode: Text): void {
    const textContent: string | null = textNode.textContent;
    if (!textContent) {
        return;
    }

    let bindings: StateBinding[] = [];
    const conditionalBinding: string[] = regexMatches(TEXT_CONDITIONAL_STATE_BINDING, textContent, 1);
    let text: string = textContent;
    if (conditionalBinding.length === 1) {
        text = conditionalBinding[0];
        bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, text);
    } else {
        bindings = retrieveBindings(instance, TEXT_STATE_BINDING, textContent);
    }

    if (bindings.length !== 0) {
        instance.addLink(new TextLink(textNode, bindings, text));
    }
}

function linkAttributes(instance: Instance, element: Element, parent: Instance | undefined = undefined): boolean {
    let linkChildren = true;
    for (const attribute of Array.from(element.attributes)) {
        if (attribute.name === BINDING + "for") {
            linkLoop(instance, element, attribute);
            linkChildren = false;
        } else if (attribute.name === BINDING + "model") {
            linkModel(instance, element, attribute);
        } else if (attribute.name === BINDING + "if") {
            linkConditionalRendering(instance, element, attribute);
            linkChildren = false;
        } else if (attribute.name.startsWith(BINDING)) {
            linkAttribute(instance, element, attribute);
        } else if (attribute.name.startsWith(EVENT_LISTENER_BINDING)) {
            const elementIsComponent: boolean = instance.getComponent(element.tagName) !== undefined;
            if (elementIsComponent) {
                if (attribute.value.startsWith(EVENT_LISTENER_PARENT_CALL_ID)) {
                    attribute.value = attribute.value.substring(EVENT_LISTENER_PARENT_CALL_ID.length);
                }
                attribute.value = EVENT_LISTENER_PARENT_CALL_ID + attribute.value;
            } else {
                const listener = linkEventListener(instance, element, attribute, parent);
                if (listener) {
                    instance.addLink(listener);
                }
            }
        }
    }
    return linkChildren;
}

function linkLoop(instance: Instance, element: Element, attribute: Attribute): void {
    const loopPatternMatches: MatchRequest[] = regexMatchesGroups(LOOP_BINDING, attribute.value, [1, 2]);
    if (loopPatternMatches.length !== 1) {
        return;
    }
    const matches: Match[] = loopPatternMatches[0].matches;
    const loopValueName = matches.find(m => m.group === 1)?.value.trim();
    const listValueName = matches.find(m => m.group === 2)?.value.trim();
    if (!loopValueName || !listValueName) {
        return;
    }

    const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, listValueName);
    if (bindings.length === 1) {
        const binding: StateBinding = bindings[0];
        const loopLink: LoopLink = new LoopLink(instance, element, loopValueName, binding);
        binding.state?.subscribe(loopLink);
        instance.addLink(loopLink);
    }
}

function linkModel(instance: Instance, element: Element, attribute: Attribute): void {
    const attrValue = attribute.value.replaceAll(BINDING, '').trim();
    const isParentCall: boolean = attrValue.startsWith(TEMPLATE_PARENT_CALL);
    const bindingName = isParentCall ? attrValue.substring(TEMPLATE_PARENT_CALL.length) : attrValue;
    const lookupInstance: Instance = isParentCall ? instance.parent! : instance;

    const stateName = getBindingNameFromKeyPath(bindingName);
    const state: State<any> | undefined = lookupInstance.getState(stateName);
    if (!state) {
        return;
    }
    const reactiveSubPath = getValuePath(bindingName);
    const binding: StateBinding = {
        binding: bindingName,
        stateName: stateName,
        stateSubPath: reactiveSubPath,
        state: state
    }

    const modelLink: ModelLink = new ModelLink(lookupInstance, element, binding);
    state.subscribe(modelLink);
    lookupInstance.addLink(modelLink);
}

function linkConditionalRendering(instance: Instance, element: Element, attribute: Attribute): void {
    if (instance.getComponent(element.tagName)) {
        // if conditionalBinding is on component we handle it directly in instance
        return;
    }

    const condition = attribute.value;
    const bindings: StateBinding[] = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, condition);
    if (bindings.length !== 0) {
        instance.addLink(new RenderLink(element, bindings, new Condition(condition, bindings), instance));
    }
}

function linkAttribute(instance: Instance, element: Element, attribute: Attribute): void {
    const attributeName = attribute.name.substring(BINDING.length);
    const template = attribute.value;

    const bindings: StateBinding[] = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, template);
    if (bindings.length !== 0) {
        instance.addLink(new AttributeLink(element, bindings, attributeName, template));
    }
}

function addStateFromTemplate(instance: Instance, element: Element) {
    for (const attribute of Array.from(element.attributes)) {
        instance.addState(attribute.name, createTemplateStates(instance, attribute.value));
    }
    element.remove();
}

function resolveSlots(instance: Instance, element: Element, parent: Instance | undefined): void {
    const resolver = element.getAttribute(SLOT_RESOLVER);
    const resolveState = createTemplateStates(instance, resolver!);

    let displaySlot: Element | null = null;
    for (const slot of Array.from(element.children)) {
        const slotVariant = slot.tagName.toLowerCase();
        if (slotVariant == resolveState?.value) {
            displaySlot = slot;
            break;
        } else if (displaySlot === null && slotVariant === "default") {
            displaySlot = slot;
        }
        slot.remove();
    }

    if (!displaySlot) {
        throw "Slot-Resolve-Error: Slots with variants must provide a default slot!";
    }
    const displaySlotChildren: Node[] = Array.from(displaySlot.childNodes);
    for (const child of displaySlotChildren) {
        insertBefore(child, element);
        link(instance, child as Element, parent);
    }
    element.remove();
}

