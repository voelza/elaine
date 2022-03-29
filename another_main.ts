function state(value: number): any {
    value++;
}
function textLinK(element: Element, valueFunction: () => string, ...states: any): any {
}
function attributeLinK(element: Element, attributeName: string, valueFunction: () => string, ...states: any): any {
}
function modelLink(element: Element, state: any) {

}
function onClick(element: Element, callback: () => void): any {
}
function rendered(element: Element, condition: () => boolean, ...states: any) { }

function computed(valueFunction: () => any, ...states: any): any {
}

const counter = state(0);
const counterDouble = computed(() => {
    return counter.value * 2;
}, counter);
const yoElement = document.getElementById("yo")!

modelLink(yoElement, counter);
textLinK(yoElement, () => counter.value + " times clicked", counter);
attributeLinK(yoElement, "style", () => "font-size: " + counter.value + ";", counter);
onClick(yoElement, () => { });
rendered(yoElement, () => { return true }, counter);

const yo2Element = document.getElementById("yo2")!
textLinK(yo2Element, () => counter.value + " * 2 " + counterDouble.value, counterDouble, counter);