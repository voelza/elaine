import { StateBinding } from "./states/StateBinding";
import { BINDING } from "./Syntax";
import { getValue } from "./utils/PathHelper";

export default class Condition {

    private bindingsMap: Map<string, StateBinding>;
    private parseTokens: string[];

    constructor(conditionStr: string, bindings: StateBinding[]) {
        this.bindingsMap = new Map();

        const tns: string[] = [];
        for (const token of conditionStr.split(" ").filter(t => t)) {
            let t = token;
            if (t.startsWith("!") && t !== "!=") {
                t = t.substring(1);
                tns.push("!");
            }
            tns.push(t);

            if (t.startsWith(BINDING)) {
                const bindingName: string = t.substring(BINDING.length);
                const binding: StateBinding | undefined = bindings.find(b => b.binding === bindingName);
                if (binding) {
                    this.bindingsMap.set(bindingName, binding);
                }
            }
        }
        this.parseTokens = tns;
    }

    getBindings(): StateBinding[] {
        return Array.from(this.bindingsMap.values());
    }

    eval(): boolean {
        const tokens: string[] = [];
        for (const token of this.parseTokens) {
            if (token.startsWith(BINDING)) {
                const bindingName = token.substring(BINDING.length);
                const binding: StateBinding | undefined = this.bindingsMap.get(bindingName);
                if (binding) {
                    tokens.push(getValue(bindingName, binding.state?.value));
                }
            } else {
                tokens.push(token);
            }
        }

        let truths: any[] = [];
        let i = 0;
        while (i < tokens.length) {
            const first = tokens[i];

            if (first === "!") {
                const val = tokens[i + 1];
                truths.push(!val);
                i = i + 2;
            } else if (first === "&&") {
                truths.push("&&");
                i = i + 1;
            } else if (first === "||") {
                truths.push("||");
                i = i + 1;
            } else {
                const nextToken = tokens[i + 1];
                if (this.isOperator(nextToken)) {
                    const second = tokens[i + 2];
                    truths.push(this.evalCondition(first, nextToken, second));
                    i = i + 3;
                } else {
                    truths.push(first);
                    i = i + 1;
                }
            }
        }

        let result: any = truths[0];
        let j = 1;
        while (j < truths.length) {
            let truth = truths[j];
            if (truth === "&&") {
                const nextTruth = truths[j + 1];
                if (nextTruth != null) {
                    result = result && nextTruth;
                    j += 2;
                }
            } else if (truth === "||") {
                const nextTruth = truths[j + 1];
                if (nextTruth != null) {
                    result = result || nextTruth;
                    j += 2;
                }
            } else {
                j++;
            }
        }

        return result;
    }

    private isOperator(text: string): boolean {
        return text === "<" || text === "<=" || text === ">" || text === ">=" || text === "==" || text === "!=";
    }

    private parseValue(value: any): any {
        if (value === "null") {
            return null;
        } else if (value === "undefined") {
            return undefined;
        }
        return value;
    }

    private evalCondition(first: any, operator: string, second: any): boolean {
        let f = this.parseValue(first);
        let s = this.parseValue(second);

        if (operator === "<") {
            return f < s;
        } else if (operator === "<=") {
            return f <= s;
        } else if (operator === ">") {
            return f > s;
        } else if (operator === ">=") {
            return f >= s;
        } else if (operator === "==") {
            return f == s;
        } else if (operator === "!=") {
            return f != s;
        } else {
            return false;
        }
    }
}