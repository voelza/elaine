import StateLink from "../links/StateLink";
import State from "./State";


export default class InertState implements State<any> {
    value: any;
    private subscribers: StateLink[] = [];

    constructor(value: any) {
        this.value = value;
    }

    set(newValue: any): void {
        if (this.value !== newValue) {
            this.value = newValue;
        }
    }

    setPathValue(keyPath: string, newValue: any): void {
        this.value.setValueForKeyPath(keyPath, newValue);
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
        for (const subscriber of this.subscribers) {
            subscriber.update();
        }
    }
}