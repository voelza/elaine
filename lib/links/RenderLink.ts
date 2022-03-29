import Condition from "../Condition";
import Instance, { Origin } from "../Instance";
import { StateBinding } from "../states/StateBinding";
import uuid from "../states/uuid";
import { BINDING } from "../Syntax";
import { insertBefore } from "../utils/DOM";
import DefaultLink from "./DefaultLink";
import StateLink from "./StateLink";


export default class Renderlink extends DefaultLink implements StateLink {
    private id: string = uuid();
    private ifComment: Comment;
    private element: Element;
    private instance: Instance;
    private condition: Condition;
    private isElementRendered: boolean | undefined;

    constructor(element: Element, bindings: StateBinding[], condition: Condition, parent: Instance | undefined, orignalInstance: Instance | undefined = undefined) {
        super(bindings);
        this.bind(this);
        this.condition = condition;

        this.ifComment = document.createComment("if-" + this.id);
        insertBefore(this.ifComment, element);

        this.element = element;
        this.element.removeAttribute(BINDING + "if");

        this.instance = orignalInstance ?? new Instance(Origin.LOOP, this.element, this.element).merge(parent);
        this.element.remove();
    }

    init(): void {
        this.eval();
    }

    update(): void {
        this.eval();
    }

    destroy(): void {
        for (const binding of this.bindings) {
            binding.state?.unsubscribe(this);
        }
        this.instance.destroy();
    }

    eval(): void {
        const result: boolean = this.condition.eval();
        if (result) {
            if (!this.isElementRendered || this.isElementRendered === undefined) {
                this.isElementRendered = result;
                this.instance.appendMount(this.ifComment);
            }
        } else {
            if (this.isElementRendered || this.isElementRendered === undefined) {
                this.isElementRendered = result;
                this.instance.unmount();
            }
        }

    }

}