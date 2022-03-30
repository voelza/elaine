export function getValue(keyPath: string, value: any): any {
    if (!value) {
        return value;
    }

    if (value instanceof Object) {
        let val = value;
        let dotIndex: number = keyPath.indexOf(".");
        if (dotIndex !== -1) {
            keyPath = keyPath.substring(dotIndex + 1);
            val = val.getValueForKeyPath(keyPath);
        }
        return val;
    } else {
        return value;
    }

};

export function getBindingNameFromKeyPath(keyPath: string): string {
    let bindingName: string = keyPath;
    let dotIndex: number = bindingName.indexOf(".");
    if (dotIndex !== -1) {
        bindingName = bindingName.substring(0, dotIndex);
    }
    return bindingName;
}

export function getValuePath(keyPath: string): string {
    let valuePath: string = keyPath;
    let dotIndex: number = valuePath.indexOf(".");
    if (dotIndex !== -1) {
        valuePath = valuePath.substring(dotIndex + 1);
    }
    return valuePath;
}