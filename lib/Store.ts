import Elaine from "./Elaine";
import StateLink from "./links/StateLink";
import State from "./states/State";

export class StoreInstance {

    private notify: () => void;

    constructor(notify: () => void) {
        this.notify = notify;
    }

    add(states: any): void {
        for (const name of Object.keys(states)) {
            const state: State<any> = states[name];
            // @ts-ignore: Unreachable code error
            this["_" + name] = state;
            Object.defineProperty(this, name, {
                get: () => { return state.value },
                set: (value) => {
                    state.value = value;
                    this.notify();
                }
            });
        }
    }

    watch(property: string, watcher: (stateValue: any) => void): void {
        // @ts-ignore: Unreachable code error
        const state: State<any> | undefined = this["_" + property];
        if (state) {
            Elaine.watch(() => {
                watcher(state.value);
            }, state);
        }
    }
}

function createTriggerNotify(subscribers: StateLink[]) {
    return () => {
        for (const subscriber of subscribers) {
            subscriber.update();
        }
    }
}

export class StoreState implements State<StoreInstance> {
    private _value: StoreInstance;
    private subscribers: StateLink[];
    private triggerNotify: () => void;

    constructor() {
        this.subscribers = [];
        this.triggerNotify = createTriggerNotify(this.subscribers);
        this._value = new StoreInstance(this.triggerNotify);
    }

    set value(_: StoreInstance) {
        throw "Not allowed to change Store value";
    }

    get value(): StoreInstance {
        return this._value;
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
        this.triggerNotify();
    }
}

export default new StoreState();