import StateLink from "../links/StateLink";

export default interface State<T> {
    value: T;
    subscribers: StateLink[];
    set(newValue: T): void;
    setPathValue(keyPath: string, newValue: T): void;
    subscribe(subscriber: StateLink): void;
    unsubscribe(subscriber: StateLink): void;
    notify(): void;
    addWatcher(watcher: () => void): void;
}