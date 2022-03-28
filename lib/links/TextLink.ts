import { StateBinding } from "../states/StateBinding";
import { TEXT_BINDER } from "../Syntax";
import DefaultTemplateLink from "./DefaultTemplateSubscriber";

export default class TextLink extends DefaultTemplateLink {
    element: Element;

    constructor(element: Element, bindings: StateBinding[], text: string) {
        super(bindings, text.trim());
        this.element = element;
    }

    bindingRegex(binding: string): RegExp {
        return TEXT_BINDER(binding);
    }

    updateBinding(updateResult: string): void {
        this.element.textContent = updateResult;
    }
}