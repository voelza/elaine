import StateLink from "../links/StateLink";
import State from "./State";


export default class ImmutableState implements State<any> {
    value: any;
    subscribers: StateLink[] = [];
    watchers: (() => void)[] = [];

    constructor(value: any) {
        this.value = value;
    }

    set(): void {
        // do nothing
    }

    setPathValue(): void {
        // do nothing
    }

    subscribe(subscriber: StateLink): void {
        this.subscribers.push(subscriber);
    }

    unsubscribe(subscriber: StateLink): void {
        const index: number = this.subscribers.indexOf(subscriber);
        if (index !== -1) {
            this.subscribers.splice(index, 1);
        }
    }

    addWatcher(): void {
        // do nothing
    }

    notify(): void {
        // do nothing
    }
}