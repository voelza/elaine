import { DateFormat, NumberFormat } from "./Functions";
import MutableState from "./states/MutableState";
import State from "./states/State";

export type ElaineOptions = {
    locale?: string,
    dateFormats?: DateFormat[],
    numberFormats?: NumberFormat[],
    translations?: Object
}

const defaultDateFormats: DateFormat[] = [
    {
        name: "short",
        format: {
            dateStyle: "short",
            timeStyle: "short"
        }
    },
    {
        name: "long",
        format: {
            dateStyle: "long",
            timeStyle: "long"
        }
    },
    {
        name: "medium",
        format: {
            dateStyle: "medium",
            timeStyle: "medium"
        }
    },
    {
        name: "full",
        format: {
            dateStyle: "full",
            timeStyle: "full"
        }
    }
];

const defaultNumberFormats: NumberFormat[] = [
    {
        name: "int",
        format: {
            minFractions: 0,
            maxFractions: 0
        }
    },
    {
        name: "twoDigits",
        format: {
            minFractions: 2,
            maxFractions: 2
        }
    },
];

let appOptions: State<ElaineOptions> = new MutableState({
    dateFormats: defaultDateFormats,
    translations: {}
});

export function setAppOptions(options: ElaineOptions): void {
    options.dateFormats = [...options.dateFormats || [], ...defaultDateFormats];
    options.numberFormats = [...options.numberFormats || [], ...defaultNumberFormats];
    appOptions.value = options;
}

export default appOptions;