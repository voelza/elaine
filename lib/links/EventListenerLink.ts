import FunctionImmutableState from "../states/FunctionImmutableState";
import { StateBinding } from "../states/StateBinding";
import { EVENT_LISTENER_BINDING } from "../Syntax";
import { getValue } from "../utils/PathHelper";
import DefaultLink from "./DefaultLink";


export default class EventListenerSubscriber extends DefaultLink {
    element: Element | undefined;
    eventName: string;
    listener: (event: Event | undefined) => any;

    constructor(element: Element | undefined, bindings: StateBinding[], eventName: string, callback: Function) {
        super(bindings);
        console.log("bind");
        this.bind(this);
        this.element = element;
        this.eventName = eventName;
        this.listener = (event: Event | undefined): any => {
            const args: any = [];

            for (const param of bindings) {
                args.push(getValue(param.binding, param.state?.value));
            }

            args.push(event);
            return callback(...args);
        };

        this.element?.removeAttribute(EVENT_LISTENER_BINDING + this.eventName);

        if (this.immediateInitNeeded()) {
            this.init();
        }
    }

    immediateInitNeeded(): boolean {
        if (this.bindings.length === 0) {
            // init because otherwise it would never get initialized
            return true;
        }
        if (this.bindings.filter(b => b.state instanceof FunctionImmutableState).length === this.bindings.length) {
            // init because theses constants are not in Instance state mangement
            return true;
        }

        return false;
    }

    init(): void {
        this.element?.addEventListener(this.eventName, this.listener);
    }

    update(): void {
        // nothing to do
    }

    destroy(): void {
        this.element?.removeEventListener(this.eventName, this.listener);
    }

};