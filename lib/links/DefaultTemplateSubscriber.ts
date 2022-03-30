import { StateBinding } from "../states/StateBinding";
import { ATTRIBUTE_BINDER, REACTIVE_CONCAT } from "../Syntax";
import { getValue } from "../utils/PathHelper";
import { ConditionalStateBinding, parseConditionalBinding } from "./ConditionalStateBinding";
import DefaultLink from "./DefaultLink";
import StateLink from "./StateLink";


export default abstract class DefaultTemplateLink extends DefaultLink implements StateLink {
    private template: string;
    private isConditional: boolean;
    private conditionalBindings: ConditionalStateBinding<string>[] = [];
    private valueObjectsToStrConverter: ((value: any) => string) | undefined;

    constructor(bindings: StateBinding[], template: string, valueObjectsToStrConverter: ((value: any) => string) | undefined = undefined) {
        super(bindings);
        this.bind(this);
        this.isConditional = template.startsWith("{") && template.endsWith("}");
        this.template = this.isConditional ? template.substring(1, template.length - 1) : template;
        this.valueObjectsToStrConverter = valueObjectsToStrConverter;

        if (this.isConditional) {
            this.conditionalBindings = parseConditionalBinding(this.template, bindings);
        }
    }

    init(): void {
        this.update();
    }

    destroy(): void {
        for (const binding of this.bindings) {
            binding.state?.unsubscribe(this);
        }
    }

    update(): void {
        if (this.isConditional) {
            let updateResult: string = "";
            for (const conditionalBinding of this.conditionalBindings) {
                if (conditionalBinding.condition.eval()) {
                    updateResult += this.applyBindingsToTemplate(conditionalBinding.value) + " ";
                }
            }
            this.updateBinding(updateResult);
        } else {
            this.updateBinding(this.applyBindingsToTemplate(this.template));
        }

    }

    private applyBindingsToTemplate(template: string): string {
        let updateResult: string = template;
        for (const binding of this.bindings) {
            updateResult = this.updateTemplate(updateResult, binding);
        }
        return updateResult.replaceAll(new RegExp(REACTIVE_CONCAT, "g"), "");
    }

    private updateTemplate(text: string, binding: StateBinding): string {
        let result: string = text;
        if (!binding.binding) {
            return result;
        }
        const bindingRegex = this.bindingRegex(binding.binding);
        const reactiveValue = binding.state?.value;
        const value = getValue(binding.binding, reactiveValue);
        result = result.replaceAll(bindingRegex, this.valueAsString(value));

        console.log(bindingRegex, reactiveValue);
        return result;
    }

    private valueAsString(value: any): string {
        if (value instanceof Object) {
            if (this.valueObjectsToStrConverter) {
                return this.valueObjectsToStrConverter(value);
            }
            return JSON.stringify(value);
        }
        return value;
    }

    protected bindingRegex(binding: string): RegExp {
        return ATTRIBUTE_BINDER(binding);
    }

    protected abstract updateBinding(updateResult: string): void;
}