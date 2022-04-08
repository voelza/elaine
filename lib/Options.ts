export type ElaineOptions = {
    locale?: string
}

let appOptions: ElaineOptions = {};

export function setAppOptions(options: ElaineOptions): void {
    appOptions = options;
}

export default appOptions;