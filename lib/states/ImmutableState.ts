import StateLink from "../links/StateLink";
import State from "./State";


export default class ImmutableState implements State<any> {
    value: any;
    private subscribers: StateLink[] = [];

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

    notify(): void {
        // do nothing
    }
}