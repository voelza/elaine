import { StateBinding } from "../states/StateBinding";
import { BINDING } from "../Syntax";
import DefaultTemplateLink from "./DefaultTemplateSubscriber";

export default class AttributeLink extends DefaultTemplateLink {
    element: Element;
    attribute: string;
    staticValue: string | null;

    constructor(element: Element, bindings: StateBinding[], attribute: string, template: string) {
        super(bindings, template, (value: any): string => {
            if (value instanceof Array) {
                return value.join(" ");
            }

            let str: string = "";
            for (const prop in value) {
                str += prop + ":" + value[prop] + ";";
            }
            return str;
        });
        this.element = element;
        this.attribute = attribute;
        this.element.removeAttribute(BINDING + this.attribute);
        this.staticValue = this.element.getAttribute(this.attribute);
    }

    updateBinding(updateResult: string): void {
        this.element.removeAttribute(this.attribute);
        let newAttributeValue: string = "";
        if (this.staticValue !== null) {
            newAttributeValue += this.staticValue;
            newAttributeValue += " ";
        }
        newAttributeValue += updateResult;
        this.element.setAttribute(this.attribute, newAttributeValue);
    }

}