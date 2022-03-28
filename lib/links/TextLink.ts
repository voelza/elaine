import { StateBinding } from "../states/StateBinding";
import { TEXT_BINDER } from "../Syntax";
import DefaultTemplateLink from "./DefaultTemplateSubscriber";

export default class TextLink extends DefaultTemplateLink {
    private element: Element;

    constructor(element: Element, bindings: StateBinding[], text: string) {
        super(bindings, text.trim());
        this.element = element;
    }

    protected bindingRegex(binding: string): RegExp {
        return TEXT_BINDER(binding);
    }

    protected updateBinding(updateResult: string): void {
        this.element.textContent = updateResult;
    }
}