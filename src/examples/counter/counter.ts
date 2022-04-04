import Elaine from "../../../lib/Elaine";

const counterComponent = Elaine.component({
    name: "counter",
    template: `
        <div class="counter">
            @@{counter}
            <button ++click="increaseCounter">Count</button>
        </div>
    `,
    setup: () => {
        const counter = Elaine.state(0);
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


Elaine.setup(document.getElementById("app")!,
    {
        state: {},
        components: [counterComponent]
    }
);