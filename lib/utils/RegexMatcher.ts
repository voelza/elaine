import Instance from "../Instance";
import { getBindingNameFromKeyPath, getValue, getValuePath } from "./PathHelper";
import State from "../states/State";
import { StateBinding } from "../states/StateBinding";
import EventListenerLink from "../links/EventListenerLink";
import { createEventListener } from "../links/EventListenerLinker";
import ComputedState from "../states/ComputedState";
import { BINDING } from "../Syntax";

export type MatchRequest = {
    matches: Match[]
}

export type Match = {
    group: number,
    value: string
}

export function regexMatches(regex: RegExp, str: string, group: number = 0): string[] {
    const foundMatches: string[] = [];
    let match = regex.exec(str);
    while (match !== null) {
        foundMatches.push(match[group]);
        match = regex.exec(str);
    }
    return foundMatches;
}

function getMatchingReactiveBindings(regex: RegExp, str: string, group: number = 1): StateBinding[] {
    const matches: string[] = regexMatches(regex, str, group);
    return matches.map(match => {
        const bindingName = match;
        const stateName = getBindingNameFromKeyPath(bindingName);
        const stateSubPath = getValuePath(bindingName);

        const reactiveBinding: StateBinding = {
            binding: bindingName,
            stateName: stateName,
            stateSubPath: stateSubPath
        }
        return reactiveBinding;
    });
}

export function regexMatchesGroups(regex: RegExp, str: string, groups: number[] = [0]): MatchRequest[] {
    const foundMatchRequets: MatchRequest[] = [];
    let match = regex.exec(str);
    while (match !== null) {
        const matches: Match[] = [];
        for (const group of groups) {
            const matchValue = match[group];
            if (matchValue) {
                matches.push({
                    group: group,
                    value: matchValue
                });
            }
        }

        foundMatchRequets.push({
            matches: matches
        });
        match = regex.exec(str);
    }
    return foundMatchRequets;
}

export function retrieveBindings(instance: Instance, regex: RegExp, str: string, group: number = 1): StateBinding[] {
    return getMatchingReactiveBindings(regex, str, group)
        .filter(binding => {
            const name: string = binding.stateName;

            const state: State<any> | undefined = instance.getState(name);
            if (state) {
                binding.state = state;
                return true;
            }

            const methodName: string = name.substring(0, name.indexOf("(")).trim();
            const method: Function | undefined = instance.getMethod(methodName);
            if (!method) {
                return false;
            }

            const eventListener: EventListenerLink | undefined = createEventListener(instance, undefined, "", binding.binding);
            if (!eventListener) {
                return false;
            }

            const eventListenerBindings: State<any>[] = [];
            for (const b of eventListener.bindings) {
                if (b.state) {
                    eventListenerBindings.push(b.state);
                }
            }

            const computed = new ComputedState(() => {
                return eventListener.listener(undefined);
            }, eventListenerBindings);
            for (const state of eventListenerBindings) {
                state.subscribe(computed);
            }
            instance.addLink(computed);

            binding.stateName = methodName;
            binding.state = computed;
            return true;
        });
}


function createComputedShell(instance: Instance, str: string) {
    if (str.startsWith(BINDING)) {
        // must be state
        const bindingName = str.substring(BINDING.length);
        const stateName = getBindingNameFromKeyPath(bindingName);
        const state: State<any> | undefined = instance.getState(stateName);
        if (state) {
            return {
                computer: () => getValue(bindingName, state.value),
                states: [state]
            }
        }
    }
    const methodName: string = str.substring(0, str.indexOf("(")).trim();
    const method: Function | undefined = instance.getMethod(methodName);
    if (method) {
        const eventListener: EventListenerLink | undefined = createEventListener(instance, undefined, "", str)!;
        const eventListenerBindings: State<any>[] = [];
        for (const b of eventListener.bindings) {
            if (b.state) {
                eventListenerBindings.push(b.state);
            }
        }
        return {
            computer: () => {
                return eventListener.listener(undefined);
            },
            states: eventListenerBindings
        };
    }
    return {
        computer: () => str,
        states: []
    }
}

export function createTemplateStates(instance: Instance, str: string): State<any> {
    const shell = createComputedShell(instance, str);
    const computed = new ComputedState(shell.computer, shell.states);
    for (const state of shell.states) {
        state.subscribe(computed);
    }
    instance.addLink(computed);
    return computed;
}