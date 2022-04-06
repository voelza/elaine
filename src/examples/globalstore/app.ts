import Elaine from "../../../lib/Elaine";


const componentWithin = Elaine.component({
    name: "test",
    template: `
    <div>
        Counter in Component within Component: @@{$store.counter}
    </div>
    `
});

const component = Elaine.component({
    name: "test",
    template: `
    <div>
        Counter in Component: @@{$store.counter}
        <button ++click="count">Count</button>
        <test></test>
    </div>
    `,
    setup: (state) => {

        const count = () => {
            // @ts-ignore
            state.$store.counter++;
        }

        state.$store.watch("counterDoubled", (c) => {
            console.log("counterDoubled", c);
        });

        return {
            state: {
                count
            },
            components: [componentWithin]
        }
    }
});


const store = Elaine.store();
const counter = Elaine.state(0);
const counterDoubled = Elaine.state(0);
store.add({ counter, counterDoubled });
store.watch("counter", (c) => {
    counterDoubled.value = c * 2;
});


Elaine.setup(document.getElementById("app")!, {
    components: [component]
}
);