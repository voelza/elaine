import WatcherLink from "./links/WatcherLink";
import appOptions from "./Options";

export type DateOptions = {
    dateStyle: "full" | "medium" | "short" | "long" | undefined,
    timeStyle: "full" | "medium" | "short" | "long" | undefined
}

export type DateFormat = {
    name: string,
    format: DateOptions
}

export type NumberOptions = {
    minFractions: number,
    maxFractions: number
}

export type NumberFormat = {
    name: string,
    format: NumberOptions
}


let locale = appOptions.value.locale;
const dateFormats = new Map<string, DateOptions>();
const numberFormats = new Map<string, NumberOptions>();
const translations = new Map<string, string>();

const setOptions = () => {
    locale = appOptions.value.locale;

    dateFormats.clear();
    for (const { name, format } of appOptions.value.dateFormats || []) {
        dateFormats.set(name, format);
    }

    numberFormats.clear();
    for (const { name, format } of appOptions.value.numberFormats || []) {
        numberFormats.set(name, format);
    }

    translations.clear();
    // @ts-ignore
    const t: Object | undefined = appOptions.value.translations[locale ?? navigator.language.split("-")[0]];
    if (t) {
        for (const key of Object.keys(t)) {
            // @ts-ignore
            translations.set(key, t[key]);
        }
    }
};

setOptions();
const watcherLink: WatcherLink = new WatcherLink(setOptions, appOptions);
appOptions.subscribe(watcherLink);

export function dateToDateTimeStr(
    date: Date,
    format: string | undefined = undefined
): string {
    const options = format ? dateFormats.get(format) : undefined;
    return new Intl.DateTimeFormat(locale, { dateStyle: options?.dateStyle, timeStyle: options?.timeStyle }).format(date);
}

export function strDateToDateTimeStr(
    date: string,
    format: string | undefined = undefined
): string {
    return dateToDateTimeStr(new Date(date), format);
}

export function localeNumber(
    number: number,
    format: string | undefined = undefined
): string {
    const options = format ? numberFormats.get(format) : undefined;
    return new Intl.NumberFormat(locale, { maximumFractionDigits: options?.maxFractions, minimumFractionDigits: options?.minFractions }).format(number);
}

export function translate(key: string): string {
    const value = translations.get(key);
    return value ?? key;
}