import { StateBinding } from "../states/StateBinding";
import { BINDING } from "../Syntax";
import DefaultTemplateLink from "./DefaultTemplateSubscriber";

const booleanAttributes = ["allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "ismap",
    "itemscope",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected",
    "truespeed"]

export default class AttributeLink extends DefaultTemplateLink {
    private element: Element;
    private attribute: string;
    private staticValue: string | null;
    private isBooleanAttribute: boolean;

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
        this.isBooleanAttribute = booleanAttributes.includes(this.attribute);
        this.element.removeAttribute(BINDING + this.attribute);
        this.staticValue = this.element.getAttribute(this.attribute);
    }

    protected updateBinding(updateResult: string): void {
        this.element.removeAttribute(this.attribute);
        let newAttributeValue: string = "";
        if (this.staticValue !== null) {
            newAttributeValue += this.staticValue;
            newAttributeValue += " ";
        }
        newAttributeValue += updateResult;

        if (!this.isBooleanAttribute || newAttributeValue === "true") {
            this.element.setAttribute(this.attribute, newAttributeValue);
            if (this.attribute === "value") {
                // @ts-ignore
                this.element.value = newAttributeValue;
            }
        }
    }

}