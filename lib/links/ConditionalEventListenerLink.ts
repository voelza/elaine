import { StateBinding } from "../states/StateBinding";
import { ConditionalStateBinding } from "./ConditionalStateBinding";
import DefaultLink from "./DefaultLink";
import EventListenerLink from "./EventListenerLink";


export default class ConditionalEventListenerLink extends DefaultLink {
    private conditionalBindings: ConditionalStateBinding<EventListenerLink>[] = [];

    constructor(bindings: StateBinding[], conditionalBindings: ConditionalStateBinding<EventListenerLink>[]) {
        super(bindings);
        this.conditionalBindings = conditionalBindings;
    }

    init(): void {
        this.update();
    }

    update(): void {
        for (const binding of this.conditionalBindings) {
            if (binding.condition.eval()) {
                binding.value.init();
            } else {
                binding.value.destroy();
            }
        }
    }

    destroy(): void {
        for (const binding of this.conditionalBindings) {
            binding.value.destroy();
        }
    }
};