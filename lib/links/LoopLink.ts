
import Instance from "../Instance";
import LoopState from "../states/LoopState";
import { StateBinding } from "../states/StateBinding";
import uuid from "../states/uuid";
import { BINDING } from "../Syntax";
import { insertAfter } from "../utils/DOM";
import { getValue } from "../utils/PathHelper";
import StateLink from "./StateLink";

export default class LoopLink implements StateLink {
    id: string = uuid();
    instance: Instance;
    loopValueName: string;
    binding: StateBinding;

    forComment: Comment;
    loopTemplate: Element;
    initDone: boolean;
    loopInstances: Instance[];

    constructor(instance: Instance, element: Element, loopValueName: string, binding: StateBinding) {
        this.initDone = false;
        this.instance = instance;
        this.loopValueName = loopValueName;
        this.binding = binding;

        this.forComment = document.createComment("for-" + this.id);
        insertAfter(this.forComment, element);
        element.remove();

        this.loopTemplate = element.cloneNode(true) as Element;
        element.removeAttribute(BINDING + "for");
        this.loopTemplate.removeAttribute(BINDING + "for");

        this.loopInstances = [];
    }

    init() {
        if (this.initDone) {
            return;
        }

        this.initDone = true;
        this.insertLoopChildren(getValue(this.binding.binding, this.binding.state?.value));
    }

    update() {
        this.resetLoop();
        this.insertLoopChildren(getValue(this.binding.binding, this.binding.state?.value));
    }

    destroy(): void {
        for (const loopInstance of this.loopInstances) {
            loopInstance.destroy();
        }
        this.binding.state?.unsubscribe(this);
    }

    private resetLoop() {
        for (const instance of this.loopInstances) {
            instance.unmount();
            instance.destroy();
        }
        this.loopInstances = [];
    }

    private insertLoopChildren(list: any[]) {
        if (!list) {
            return;
        }
        for (let i = list.length - 1; i >= 0; i--) {
            const loopValue: any = list[i];
            const loopInstance: Instance = new Instance(this.loopTemplate, this.loopTemplate, this.instance);
            loopInstance.origin = "LOOP";
            loopInstance.merge(this.instance);
            loopInstance.addState(this.loopValueName, new LoopState(loopValue, this.binding.state!));
            loopInstance.appendMount(this.forComment);
            this.loopInstances.push(loopInstance);
        }
    }
};