import { DateFormat } from "./Functions";
import MutableState from "./states/MutableState";
import State from "./states/State";

export type ElaineOptions = {
    locale?: string,
    dateFormats?: DateFormat[]
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

let appOptions: State<ElaineOptions> = new MutableState({
    dateFormats: defaultDateFormats
});

export function setAppOptions(options: ElaineOptions): void {
    options.dateFormats = [...options.dateFormats || [], ...defaultDateFormats];
    appOptions.value = options;
    console.log(appOptions);
}

export default appOptions;