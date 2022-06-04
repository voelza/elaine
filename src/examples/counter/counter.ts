import { component, setup, state } from "../../../lib/Elaine";

const counterComponent = component({
    name: "counter",
    template: `
        <div class="counter">
            @@{counter}
            <button ++click="increaseCounter">Count</button>
        </div>
    `,
    setup: () => {
        const counter = state(0);
        const increaseCounter = () => {
            counter.value++;
        };

        return {
            state: {
                counter, increaseCounter
            }
        }
    }
});


setup(document.getElementById("app")!,
    {
        state: {},
        components: [counterComponent]
    }
);