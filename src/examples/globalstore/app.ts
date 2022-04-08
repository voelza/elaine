import Elaine from "../../../lib/Elaine";
import { ElaineOptions } from "../../../lib/Options";


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
        <test @@style="font-size: @@$store.constant##px;"></test>
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
const constant = 20;
store.add({ counter, counterDoubled, constant });
store.watch("counter", (c) => {
    counterDoubled.value = c * 2;
});


Elaine.withOptions({
    dateFormats: [
        {
            name: "shortLong",
            format: {
                timeStyle: "long",
                dateStyle: "short"
            }
        }
    ]
});

const date = new Date();
const dateStr = '2022-04-08T20:00:00';
Elaine.setup(document.getElementById("app")!, {
    state: {
        date,
        dateStr
    },
    components: [component]
}
);