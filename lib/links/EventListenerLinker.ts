import Instance from "../Instance";
import FunctionImmutableState from "../states/FunctionImmutableState";
import State from "../states/State";
import { StateBinding } from "../states/StateBinding";
import { BINDING, EVENT_LISTENER_PARENT_CALL_ID, TEMPLATE_PARENT_CALL } from "../Syntax";
import { getBindingNameFromKeyPath, getValuePath } from "../utils/PathHelper";
import ConditionalEventListenerLink from "./ConditionalEventListenerLink";
import { ConditionalStateBinding, parseConditionalBindingWithoutBindings } from "./ConditionalStateBinding";
import EventListenerLink from "./EventListenerLink";
import { Attribute } from "./Linker";

type FunctionInfo = {
    name: string,
    params: StateBinding[];
}

function getFunctionInfo(functionCall: string, instance: Instance): FunctionInfo {
    const params: StateBinding[] = [];
    let name: string = functionCall;
    const paramStart: number = name.indexOf("(");
    if (paramStart !== -1) {
        name = functionCall.substring(0, paramStart);
        const callParams: string[] = functionCall
            .substring(paramStart + 1, functionCall.length - 1)
            .split(",")
            .map(p => p.trim());

        for (const callParam of callParams) {
            const paramName: string = callParam.replace(BINDING, "");
            let stateName: string | undefined = undefined;
            let state: State<any> | undefined = undefined;

            if (callParam.startsWith(BINDING)) {
                stateName = getBindingNameFromKeyPath(paramName);
                state = stateName.startsWith(TEMPLATE_PARENT_CALL) ? instance.parent!.getState(stateName.substring(TEMPLATE_PARENT_CALL.length)) : instance.getState(stateName);
            } else {
                stateName = paramName;
                state = new FunctionImmutableState(paramName);
            }

            params.push({
                binding: paramName,
                stateName: stateName,
                stateSubPath: getValuePath(paramName),
                state: state
            });
        }
    }
    return {
        name: name,
        params: params
    }
}

export function createEventListener(instance: Instance, element: Element | undefined, eventName: string, functionCall: string): EventListenerLink | undefined {
    const functionInfo: FunctionInfo = getFunctionInfo(functionCall, instance);
    const listenerName: string = functionInfo.name;
    const bindings: StateBinding[] = functionInfo.params;

    const method: Function | undefined = listenerName.startsWith(TEMPLATE_PARENT_CALL) ? instance.parent!.getMethod(listenerName.substring(TEMPLATE_PARENT_CALL.length)) : instance.getMethod(listenerName);
    if (method) {
        return new EventListenerLink(element, bindings, eventName, method);
    }
    return undefined;
}

function createConditionalFunction(instance: Instance, element: Element, eventName: string, functionCall: string): void {
    const conditionalStateBindings: ConditionalStateBinding<string>[] = parseConditionalBindingWithoutBindings(instance, functionCall.substring(1, functionCall.length - 1));
    const conditionalEventListenerBindings: ConditionalStateBinding<EventListenerLink>[] = [];
    for (const binding of conditionalStateBindings) {
        const listener: EventListenerLink | undefined = createEventListener(instance, element, eventName, binding.value);
        if (listener) {
            conditionalEventListenerBindings.push({
                condition: binding.condition,
                stateBindings: binding.stateBindings,
                value: listener
            });
        }
    }
    const bindings: StateBinding[] = [];
    for (const binding of conditionalEventListenerBindings) {
        const conditionBindings: StateBinding[] | undefined = binding.stateBindings;
        if (conditionBindings) {
            for (const b of conditionBindings) {
                bindings.push(b);
            }
        }

        const listener: EventListenerLink = binding.value;
        for (const b of listener.bindings) {
            if (bindings.find(bind => bind.binding === b.binding) === undefined) {
                bindings.push(b);
            }
        }
    }
    instance.addLink(new ConditionalEventListenerLink(bindings, conditionalEventListenerBindings));
}

export function linkEventListener(instance: Instance, element: Element, attribute: Attribute, parent: Instance | undefined = undefined): EventListenerLink | undefined {
    const eventName: string = attribute.name.substring(BINDING.length);
    const functionCall: string = attribute.value;
    if (functionCall.startsWith("{") && functionCall.endsWith("}")) {
        createConditionalFunction(instance, element, eventName, functionCall);
    } else if (functionCall.startsWith(EVENT_LISTENER_PARENT_CALL_ID) && parent !== undefined) {
        return createEventListener(parent, element, eventName, functionCall.substring(EVENT_LISTENER_PARENT_CALL_ID.length));
    } else {
        return createEventListener(instance, element, eventName, functionCall);
    }
    return undefined;
}
