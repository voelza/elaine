# ELAINE Documentation

The frontend framework without a virtual DOM.

## Concepts
In this frontend framework everything is based around "states". States will be used to fill templates directly in the DOM and update them if they change. The main idea is to declare states on the JavaScript side and link them to DOM elements.

## Syntax
To link our states to a DOM element we have to call the `setup`function and give it the element which is our templated application. The template will be parsed and link states accordingly. To give states to the linker you have to declare the states insides an object like this:

```javascript
const counter = Elaine.state(0);
const increaseCounter = () => {
    counter.value++;
};
const immutableState = "This will never change";

Elaine.setup(document.getElementById("app"), {
    state: {
        counter, 
        increaseCounter,
        immutableStates
    }
});
```
States can be variables which where called by the `state(value)` method (as you can see with `counter`). If you don't wrap your states into the `state`function they will not be reactive and changes to them will not be deployed through links to the templated DOM elements. But if you need constant values which where determined in the script part of your program, you can still pass them to the linker like you would with reactive states. Also you can pass through methods which can be linked in the template for interactions (see `increaseCounter`).

The template portion of your application can be directly in the DOM itself.
```html
    <div id="app">
        <h1>@@{immutableState</h1>
        @@{counter}
        <button ++click="increaseCounter">Count</button>
    </div>
```
By using the `@@{counter}` you can link the `counter` state to a text node in the DOM. With the `++click="increaseCounter"` attribute on the button element we linked our `increaseCounter` function to the DOM element. This is how the linking process in this framework works.

### State Declaration
To declare a reactive state you have call the `state` function.
```javascript
const counter = Elaine.state(0);
```
This function wraps the given value into a proxy which will update all the links to it from the template if that value changes. Because it works with a proxy you cannot change the state directly but you have to use `state.value` instead.

```javascript
const counter = Elaine.state(0);
const increaseCounter = () => {
    counter.value++;
};
```
As you can see here the `.value` of `counter` is changed which will trigger the update-link-cycle of the framework and update your DOM. 
This should work for most cases but sometimes (while working with arrays and objects) not all changes can be detected directly or you might want to trigger the update-link-cycle manually. You can do this by using the `notify` method on all states.

```javascript
const counter = Elaine.state({count:0});
const increaseCounter = () => {
    counter.value["count"] = counter.value["count"]++;
    counter.notify();
};
```

To declare a immutable state you simply don't use the `state` function and pass the state as a simple variable. Beware that theses state are immutable and changes to them will not trigger the update-link-cycle.
```javascript
const immutableState = "This will never change";
```

To declare a state which depends on other states you can call the `computed` function.
```javascript
const duration = Elaine.state(15 * 1000)
const elapsed = Elaine.state(0);
const progress = Elaine.computed(() => elapsed.value / duration.value, elapsed, duration);
```
These states are computed a given function, which you have to provide. You also have to list all the states this computed state depends on. In this example the computed state `progress` is computed by the function `() => elapsed.value / duration.value` and depends on the two states `elapsed` and `duration`.

### Template Syntax
To link states to DOM elements you have to use a special syntax within your DOM template. 
To link text content of text nodes you have to use the following syntax:
```html
<div>@@{counter}</div>
```

To link a state to an attribute you have to use @@ before the attributes name to indicate that it is a templated attribute and @@ within the template of the attribute value to reference your desired state.
```html
<div @@style="fontSize: @@fontSizeState">@@{counter}</div>
```
In this example `@@fontSizeState` would reference a state in JavaScript given to the `setup` function. 

To use conditional rendering you have to use the `@@if` attribute. Within the value if this attribute you can give the condition where you can also use states from you application to evalute the given condition which will also update if the given states change.
```html
<div @@if="@@counter > 10">Only show if counter > 10</div>
```

You can also use for loops to put an element multiple times into your DOM by giving it a state which contains an array. Given the following application
```javascript
const fruits = ["apple", "banana", "orange"];
Elaine.setup(document.getElementId("app"), {
    state: {
        fruits
    }
});
```
```html
<div id="app">
    <div @@for="fruit in @@fruits">@@{fruit}</div>
</div>
```
The `div` with the `@@for` attribute will render three times for each fruit in our `fruits` array. Within this for-loop you have access to the `fruit` variable which in this case is simply displayed within the `div` block. This would result in this DOM:
```html
<div id="app">
    <div>apples</div>
    <div>banana</div>
    <div>orange</div>
</div>
```
In loops you also have access to the current index of the array traversal. To use this index you have to use the `_index` keyword within your template.
```html
<div id="app">
    <div @@for="fruit in @@fruits">@@{_index}: @@{fruit}</div>
</div>
```
would result in:
```html
<div id="app">
    <div>0: apples</div>
    <div>1: banana</div>
    <div>2: orange</div>
</div>
```

If you have methods within your application you can also link them directly to DOM elements within your template by using the `++` symbols. You simply have to define an attribute with `++` following by the event name. For example for a click event you need to use `++click` and for a change event you need to use `++change`. 

```javascript
const counter = Elaine.state(0);
const increaseCounter = () => {
    counter.value++;
};
```
```html
    <div id="app">
        @@{counter}
        <button ++click="increaseCounter">Count</button>
    </div>
```
This for example will call the `increaseCounter` method each time the button is clicked.

If you are using it on an input field it might look like this:
```javascript
const text = Elaine.state("This is the default text.");
const setText = (e) => {
    text.value = e.target.value;
};
```
```html 
    @@{text}
    <input type="text" ++input="setText" @@value="@@text" />
```

This would update the `text` state whenever the input field fires the `input` event. Because these kind of bindings are very common there is a shortcut to bind `input` and `select` elements to given reactive states like this:
```javascript
const text = Elaine.state("This is the default text.");
```
```html 
    @@{text}
    <input type="text" @@model="text" />
```

### Custom Components
To reuse components within your application you can define components like this:

```html
    <div id="app">
        <counter></counter>
    </div>
```
```javascript
const counterComponent = Elaine.component({
    name: "counter",
    template: `
        <div class="counter">
            @@{counter}
            <button ++click="increaseCounter">Count</button>
        </div>
    `,
    setup: () => {
        const counter = Elaine.state(0);
        const increaseCounter = () => {
            counter.value++;
        };

        return {
            state: {
                counter, increaseCounter
            }
        }
    }
});


Elaine.setup(document.getElementById("app")!,
    {
        state: {},
        components: [counterComponent]
    }
);
```

By using the `component` function you can declare a component object which than can be passed to the `setup` function within an array with the field `components`. The component has to have a name by which it will be resolved within the DOM. It also has to have a template.

#### Component Events
Custom component events are binded like normal events. They can be emitted with dispatchEvent("event-name", "payload").
Beware that at the moment event names are always in lower-case.