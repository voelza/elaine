import { component, setup, state, getStore, withOptions } from "../../../lib/Elaine";

const componentWithin = component({
    name: "test",
    template: `
    <div>
        Counter in Component within Component: @@{$store.counter}
    </div>
    `
});

const comp = component({
    name: "test",
    template: `
    <div>
        Counter in Component: @@{$store.counter}
        <button ++click="count">Count</button>
        <test @@style="font-size: @@$store.constant##px;"></test>
    </div>
    `,
    setup: (setupState) => {
        const count = () => {
            // @ts-ignore
            setupState.$store.counter++;
        }

        setupState.$store.watch("counterDoubled", (c) => {
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


const storeObj = getStore();
const counter = state(0);
const counterDoubled = state(0);
const constant = 20;
storeObj.add({ counter, counterDoubled, constant });
storeObj.watch("counter", (c) => {
    counterDoubled.value = c * 2;
});


withOptions({
    dateFormats: [
        {
            name: "shortLong",
            format: {
                timeStyle: "long",
                dateStyle: "short"
            }
        }
    ],
    numberFormats: [
        {
            name: "threeDigits",
            format: {
                minFractions: 3,
                maxFractions: 3
            }
        }
    ],
    translations: {
        "de": {
            "app.title": "Yo-Yo-Yo-Minator"
        },
        "en": {
            "app.title": "No-No-No-Minator"
        }
    }
});

const date = new Date();
const dateStr = '2022-04-08T20:00:00';
setup(document.getElementById("app")!, {
    state: {
        date,
        dateStr
    },
    components: [comp]
}
);