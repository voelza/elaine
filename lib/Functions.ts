import appOptions from "./Options";

const locale = appOptions.locale;

export type DateOptions = {
    dateStyle: "full" | "medium" | "short" | "long" | undefined,
    timeStyle: "full" | "medium" | "short" | "long" | undefined
}

export function dateToDateTimeStr(
    date: Date,
    options: DateOptions | undefined = undefined
): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: options?.dateStyle, timeStyle: options?.timeStyle }).format(date);
}

export function strDateToDateTimeStr(
    date: string,
    options: DateOptions | undefined = undefined
): string {
    return dateToDateTimeStr(new Date(date), options);
}

export type NumberOptions = {
    minFractions: number,
    maxFractions: number
}

export function localeNumber(
    number: number,
    options: NumberOptions | undefined = undefined
): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: options?.maxFractions, minimumFractionDigits: options?.minFractions }).format(number);
}