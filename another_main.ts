function state(value: number): any {
    value++;
}
function textLinK(element: Element, text: string, ...states: any): any {
}
function attributeLinK(element: Element, attributeName: string, template: string, ...states: any): any {
}
function modelLink(element: Element, state: any) {

}
function onClick(element: Element, callback: () => void): any {
}
function rendered(element: Element, condition: () => boolean, ...states: any) { }

function computed(valueFunction: () => any, ...states: any) {
}

const counter = state(0);
const counterDouble = computed(() => {
    return counter.value * 2;
}, counter);
const yoElement = document.getElementById("yo")!

modelLink(yoElement, counter);
textLinK(yoElement, "@@counter times clicked", counter);
attributeLinK(yoElement, "style", "font-size: @@counter;", counter);
onClick(yoElement, () => { });
rendered(yoElement, () => { return true }, counter);

const yo2Element = document.getElementById("yo2")!
textLinK(yo2Element, "@@counter * 2 = @@counterDouble", counterDouble, counter);