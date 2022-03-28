import Instance from "../Instance";
import { getBindingNameFromKeyPath, getValuePath } from "./PathHelper";
import State from "../states/State";
import { StateBinding } from "../states/StateBinding";
import EventListenerLink from "../links/EventListenerLink";
import { createEventListener } from "../links/EventListenerLinker";
import ComputedState from "../states/ComputedState";

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
            const state: State<any> | undefined = instance.getState(binding.stateName);
            if (state) {
                binding.state = state;
                return true;
            }

            const methodName: string = binding.stateName.substring(0, binding.stateName.indexOf("(")).trim();
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