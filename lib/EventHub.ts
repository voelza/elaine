export type GlobalEventListener = {
    eventName: string,
    listener: (payload: any) => void,
}

export class EventHubInstance {

    private listeners: Map<string, ((payload: any | undefined) => void)[]> = new Map();

    dispatchEvent(eventName: string, payload: any | undefined) {
        for (const listener of this.listeners.get(eventName) ?? []) {
            listener(payload);
        }
    }

    addListener({ eventName, listener }: GlobalEventListener) {
        let eventListeners = this.listeners.get(eventName);
        if (eventListeners === undefined) {
            eventListeners = [];
        }
        eventListeners.push(listener);
        this.listeners.set(eventName, eventListeners);
    }

    removeListener({ eventName, listener }: GlobalEventListener) {
        const eventListeners = this.listeners.get(eventName);
        if (eventListeners === undefined) {
            return;
        }
        const indexOfListener = eventListeners.indexOf(listener);
        if (indexOfListener !== -1) {
            eventListeners.splice(eventListeners.indexOf(listener), 1);
        }
    }

}


export default new EventHubInstance();