import StateLink from "./StateLink";
import { StateBinding } from "../states/StateBinding";

export default abstract class DefaultLink {
    bindings: StateBinding[] = [];

    constructor(bindings: StateBinding[]) {
        this.bindings = bindings;
    }

    bind(link: StateLink): void {
        const uniqueBindings: StateBinding[] = this.bindings.reduce((result, binding) => {
            if (result.find(b => b.stateName === binding.stateName) === undefined) {
                result.push(binding);
            }
            return result;
        }, [] as StateBinding[]);
        for (const binding of uniqueBindings) {
            binding.state?.subscribe(link);
        }
    }
}