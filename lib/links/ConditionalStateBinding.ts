import Condition from "../Condition";
import Instance from "../Instance";
import { StateBinding } from "../states/StateBinding";
import { ATTRIBUTE_ELEMENT_STATE_BINDING } from "../Syntax";
import { retrieveBindings } from "../utils/RegexMatcher";

export type ConditionalStateBinding<T> = {
    condition: Condition,
    stateBindings: StateBinding[],
    value: T
};

export function parseConditionalBinding(templateWithoutBrackets: string, bindings: StateBinding[]): ConditionalStateBinding<string>[] {
    const conditionalBindings: ConditionalStateBinding<string>[] = [];

    for (const conditionalBinding of templateWithoutBrackets.split(";")) {
        const conditionalBindingSplit = conditionalBinding.split(":");

        const conditionStr = conditionalBindingSplit[0].trim();
        const condition = new Condition(conditionStr, bindings);
        const valueTemplate = conditionalBindingSplit[1].trim();
        conditionalBindings.push({
            condition: condition,
            value: valueTemplate,
            stateBindings: []
        });
    }
    return conditionalBindings;
}

export function parseConditionalBindingWithoutBindings(instance: Instance, templateWithoutBrackets: string): ConditionalStateBinding<string>[] {
    const conditionalBindings: ConditionalStateBinding<string>[] = [];

    for (const conditionalBinding of templateWithoutBrackets.split(";")) {
        const conditionalBindingSplit = conditionalBinding.split(":");

        const conditionStr = conditionalBindingSplit[0].trim();
        const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, conditionStr);
        const condition = new Condition(conditionStr, bindings);
        const valueTemplate = conditionalBindingSplit[1].trim();
        conditionalBindings.push({
            condition: condition,
            stateBindings: bindings,
            value: valueTemplate
        });
    }
    return conditionalBindings;
}