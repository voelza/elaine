# ELAINE Documentation

The frontend framework without a virtual DOM. This is not recommended for production use and was mainly build as a learning experience and to use it on small projects. There might be a lot of bugs. There are no plans to make any official releases right now.

## How to use
You can simple use the umd build like this:
```html
<script src="https://cdn.jsdelivr.net/gh/voelza/elaine@v0.1.8/dist/elaine.umd.js"></script>
```

NPM version is not available at the moment and is also not planned.

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
    <h1>@@{immutableState}</h1>
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
<div @@style="font-size: @@fontSizeState">@@{counter}</div>
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

By using the `component` function you can declare a component object which than can be passed to the `setup` function within an array with the field `components`. The component has to have a name by which it will be resolved within the DOM. It also has to have a template. The template can always only contain one HTML element.

There are also a few optional component properties which can be passed to the `component` function. 

```javascript
export type ComponentData = {
    name: string;
    template: string | Element;
    props?: Prop<any>[];
    slots?: string[];
    setup?: (state: InstanceState) => SetupState | void;
    onMounted?: (state: InstanceState) => void;
    beforeUnmounted?: (state: InstanceState) => void;
    onUnmounted?: (state: InstanceState) => void;
    beforeDestroyed?: (state: InstanceState) => void;
    onDestroyed?: (state: InstanceState) => void;
    css?: string | undefined;
};
```

#### Component Life-Cycle

Most of them are life-cycle functions which will be called in the life-cycle of the component. 

`setup` is called before the component ever enters the DOM. This function can return new states which will be linked to the components DOM.
`onMounted` will be called after the component was mounted to the parent DOM.
`beforeUnmounted` will be called before the component will be removed from the parent DOM (for whatever reason; this might als happen if the component element has a conditional rendering attribute `@@if`)
`onUnmounted` will be called after the component was removed from the parent DOM.
`beforeDestroyed` will be called before the component instance will be destroyed. A component instance will be destroyed if it is no longer used and will not be mounted to the DOM ever again.
`onDestroyed` will be called before the component instance was destroyed.

Within each of theses functions you have access to the internal component instance state at that given moment. The state looks like this:

```javascript
export type InstanceState = {
    element: Element,
    data: any,
    methods: any,
    refs: any,
    $store: StoreInstance,
    dispatchEvent: (eventName: string, payload: any | undefined) => void,
    dispatchGlobalEvent: (eventName: string, payload: any) => void,
    addGlobalEventListener: (eventName: string, listener: (payload: any) => void) => void
};
```

With `element` you have access to the top-level element of your template within the DOM.
Within `data` you have access to all the declared states of the instance.
With `methods` you can access all the passed methods of the instance.
With `refs` you can access underlining child-component-instances which you annotated with the `ref="name"` attribute in your template. 
Within `$store` you have access to the global store. For more informations see [Global Store](#global-store)
With `dispatchEvent` you can emit DOM events from your top-level template element which can be used to communicate back to the parent component.
With `dispatchGlobalEvent` you can emit global application events which can be listened on (see [EventHub](#EventHub)).
With `addGlobalEventListener` add a listener to the global [EventHub](#EventHub).

This can be used to build a modal-dialog component like this:

```javascript
export default Elaine.component({
    name: "modal",
    template: `
    <div class="modal">
        <div class="modal-header">
            <div @@if="@@title != null" class="modal-title">@@{title}</div>
            <div ++click="close" class="modal-close">x</div>
        </div>
        <div class="modal-body">
        </div>
    </div>
    `,
    setup: (state: InstanceState) => {
        const modal: Element = state.element;
        modal.setAttribute("style", "position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000;");

        const backdrop = document.createElement("div");
        backdrop.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: 999; width: 100vw; height: 100vw; background-color: #80808095;");

        const close = () => {
            modal.parentNode?.removeChild(modal);
            if (backdrop.parentNode)
                backdrop.parentNode.removeChild(backdrop);
        };

        const open = () => {
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
        };

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                open,
                backdrop
            }
        };
    },
    onMounted: (state: InstanceState) => {
        const modal = state.element;
        modal.parentNode?.removeChild(modal);
    }
});
```

#### Component Props

In a component you don't have direct access to the states of the parent instance. To pass states from the parent to a component instance you have to declare theses as props. As you can see in our modal example we need to pass the `title` from the parent to the modal component instance.
Props are declared within an array as objects which look like this: 

```javascript
export type Prop<T> = {
    name: string,
    required?: boolean,
    type: T,
    default?: T
}
```

To use them within your component add the `props` field to your component declaration. Afterwards you can access them within your life-cycle function within the `internalState.data` field or anywhere in the template.

```javascript
export default Elaine.component({
    name: "modal",
    template: `
    <div class="modal">
        <div class="modal-header">
            <div @@if="@@title != null" class="modal-title">@@{title}</div>
            <div ++click="close" class="modal-close">x</div>
        </div>
        <div class="modal-body">
        </div>
    </div>
    `,
    props: [{
        name: "title",
        type: String
    }],
    setup: (state: InstanceState) => {
        const modal: Element = state.element;
        modal.setAttribute("style", "position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000;");

        const backdrop = document.createElement("div");
        backdrop.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: 999; width: 100vw; height: 100vw; background-color: #80808095;");

        const close = () => {
            modal.parentNode?.removeChild(modal);
            if (backdrop.parentNode)
                backdrop.parentNode.removeChild(backdrop);
        };

        const open = () => {
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
        };

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                open,
                backdrop
            }
        };
    },
    onMounted: (state: InstanceState) => {
        const modal = state.element;
        modal.parentNode?.removeChild(modal);
    }
});
```

Props can be passed from the parent by declaring an attribute on the element with the same name.
```html
<modal title="Add a new tab!"></modal>
```

#### Component Slots

Sometimes it is necessary to define template elements outside your component template. This can be achieved with slots. Slots are elements within your component which will be replaced by the defined elements in the parent component. To use slots you have to declare them within your component definition as a string array. To place them into your template simply use an element with the same name anywhere you like.

```javascript
export default Elaine.component({
    name: "modal",
    template: `
    <div class="modal">
        <div class="modal-header">
            <div @@if="@@title != null" class="modal-title">@@{title}</div>
            <header></header>
            <div ++click="close" class="modal-close">x</div>
        </div>
        <div class="modal-body">
            <content></content>
        </div>
    </div>
    `,
    props: [{
        name: "title",
        type: String
    }],
    slots: ["content", "header"],
    setup: (state: InstanceState) => {
        const modal: Element = state.element;
        modal.setAttribute("style", "position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000;");

        const backdrop = document.createElement("div");
        backdrop.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: 999; width: 100vw; height: 100vw; background-color: #80808095;");

        const close = () => {
            modal.parentNode?.removeChild(modal);
            if (backdrop.parentNode)
                backdrop.parentNode.removeChild(backdrop);
        };

        const open = () => {
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
        };

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                open,
                backdrop
            }
        };
    },
    onMounted: (state: InstanceState) => {
        const modal = state.element;
        modal.parentNode?.removeChild(modal);
    }
});
```

On the parent side the template can be filled like this:
```html
<modal title="Add a new tab!">
    <header>
        I will be in the header!
    </header>  
    <content>
        <h2>@@{~title}</h2>
        <input @@model="@@todoTitle" type="text" placeholder="ToDo title" />
        <textarea @@model="@@todoContent" placeholder="ToDo content" rows="5"></textarea>
        <button ++click="addTodo" @@disabled="@@addTodoNotPossible">Add Todo</button>
    </content>
</modal>
```

### Component Slots with variants

It is also possible to have different variants of the same slot. To eplain the problem this sloves we have to use a different example. Imagine you want to write a table component like this:
```javascript
const table = ELAINE.component({
    name: "myTable",
    template: `
    <table>
        <thead>
            <tr>
                <th @@for="header in @@headers">
                    <div class="myTable-header">
                        <span>@@{header.label}</span>
                    </div>
               </th>
            </tr>
        </thead>
        <tbody>
        <tr @@for="row in @@rows">
            <td @@for="header in @@headers">
                 <mycolumn variant="@@header.key"></mycolumn>
            </td>
        </tr>
        </tbody>
    </table>
    `,
    props: [
        {
            name: "items",
            type: Array
        },
        {
            name: "headers",
            type: Array
        }
    ],
    slots: ["mycolumn"]
});
```
The slot `mycolumn` has to be different depending on which column it is within the table. Of course it could be achieved by using `@@if` but instead you can also use slots with variants by declaring a `variant` attribute to your slot within your component template. This will be evaluated and chose the right slot when the component instance is setting up.

```html
<myTable items="@@content" headers="@@headers">
    <mycolumn>
        <name>
            @@{getFirstName(@@~data)} @@{~data.lastname}
        </name>
        <birthdate>@@{$dateTime(@@~data)}</birthdate>
        <default>
            <div ++click="showData(@@~data, @@~constant)">@@{~data}</div>
        </default>
    </mycolumn>
</myTable>
```
To declare multiple variants of a slot you simply declare nested elements with the variant name within your parent DOM.

All the states references within a slots are by default the states from the parent instance and not from the component instance. To use states from the component instance you can use the `~` before the state name. So `@@~data` would refer to the `data` state of the component instance while `@@data` would refer to the `data` state of the parent instance.

#### Component CSS
You might also want to style your components. You can do this by declaring your CSS within the `css` field in your component declaration. All your CSS will be scoped to your component and will only affect your component. So don't worry!

```javascript
export default Elaine.component({
    name: "modal",
    template: `
    <div class="modal">
        <div class="modal-header">
            <div @@if="@@title != null" class="modal-title">@@{title}</div>
            <header></header>
            <div ++click="close" class="modal-close">x</div>
        </div>
        <div class="modal-body">
            <content></content>
        </div>
    </div>
    `,
    css: `
        .modal {
            border: 1px solid rgb(168, 164, 164);
            border-radius: 5px;
            padding: 5px;
            min-width: 500px;
            background-color: lightgray;
        }
        
        .modal-header {
            display: flex;
            flex-direction: row;
            align-items: center;
            border-bottom: 1px solid rgb(168, 164, 164);
            padding: 0px 5px;
        }
        
        .modal-title {
            font-family: monospace;
        }
        
        .modal-close {
            margin-left: auto;
            cursor: pointer;
        }
        
        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
    `,
    props: [{
        name: "title",
        type: String
    }],
    slots: ["content", "header"],
    setup: (state: InstanceState) => {
        const modal: Element = state.element;
        modal.setAttribute("style", "position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000;");

        const backdrop = document.createElement("div");
        backdrop.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: 999; width: 100vw; height: 100vw; background-color: #80808095;");

        const close = () => {
            modal.parentNode?.removeChild(modal);
            if (backdrop.parentNode)
                backdrop.parentNode.removeChild(backdrop);
        };

        const open = () => {
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
        };

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                open,
                backdrop
            }
        };
    },
    onMounted: (state: InstanceState) => {
        const modal = state.element;
        modal.parentNode?.removeChild(modal);
    }
});
```

#### Component Events
Custom component events are binded like normal events. They can be emitted with `dispatchEvent("event-name", "payload")`.
Beware that at the moment event names are always in lower-case.


### Refs on Components
Sometimes it is necessary to interact with the state of a child-component. To achieve this you can annotate the component with a `ref` attribute and give it a name. On every life-cycle-method you have the ability to get the internal states of theses underlining components by refering to them by their ref-name like this:
```html
<modal ref="usefulName" title="Modal">
    <content>
        Content of Modal
    </content>
</modal>
```
```javascript
setup: (state: InstanceState) => {
    const openModal = () => {
        state.refs.usefulName.methods.open();
    };

    return {
        state: {
            openModal
        }
    }
}
```


### Random stuff

Wait... there is more!

#### Concat

Sometimes no spaces are allowed in HTML attribute but you don't want to include certain parts of them in your states. You can use the `##` symbol to concatenate them together. So for example instead of writing this:
```javascript
const fontSize = Elaine.state("12px");
```
```html
<div @@style="font-size: @@fontSize">Hello World!</div>
```
You could write this:
```javascript
const fontSize = Elaine.state(12);
```
```html
<div @@style="font-size: @@fontSize##px">Hello World!</div>
```

Both will become:
```html
<div @@style="font-size: 12px">Hello World!</div>
```

#### Template declaration of states
Sometimes you want to declare new states on the fly within a template. This is useful in loops which don't allow you to call a setup function before the loop generation (yet). Instead you can use the `<template-state>` element within your template. All attributes on this element will be converted into states after the linker has visited this element.

For example:
```javascript
const header = {
    key: "The One To Rule Them All",
};
```
```html
@@{key}
<template-state 
    key="@@header.key"
></template-state>
@@{key}
```
Will result in:
```html
@@{key}
The One To Rule Them All
```

#### Passing objects within template as function paramter
You can do this but it's super ugly because we cannot use `{}` because of our syntax (I might need to change that at some point). To do this you have to use `|` and within you can declare the objects properties. You cannot use the comma `,` because it is also used to parse the function parameters which is why you have to simply use white spaces instead and we can not use `:` because it is part of conditions which is why we use `~` instead.

```html
@@{dateToLocaleDateStr(@@date,|'dateStyle'~'short' 'timeStyle'~'medium'|)}
```
While it works you should really not use it. This might get reworked in future releases.

## EventHub 
There is a global `EventHub` to dispatch events (with payloads) and listen to them. You have access to these in every life-cycle hook by calling the `dispatchGlobalEvent` method and the `addGlobalEventListener` method on the given internal instance state.

These can be used like this on the Modal Component example:
```javascript
setup: (state) => {
    const open = (payload) => {
        console.log(payload);

        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
     };

    state.addGlobalEventListener(`openmodal`, open);
``` 

And like this to trigger the global event:
```javascript
setup: (state) => {
const openModal = () => {
    state.dispatchGlobalEvent(`openmodal`, {data: "anyPayload"});
};
```

Global listeners which were registered by the `addGlobalEventListener` method of the internal state will automatically be removed after the instance was destroyed. If you want to use the `EventHub` outside life-cycle-methods you can use the `eventHub` function to fetch the global `EventHubInstance`. This would work pretty much the same but beware that the listeners are not automatically removed but you would have to call the method `removeListener` on the `EventHubInstance` yourself.
```javascript
const eventHub = Elaine.eventHub();
const listener = (payload) => {
    console.log(payload);
};

eventHub.addListener("openModal", listener);

evenHub.dispatchEvent("openModal", {data: "anyPayload"});

eventHub.removeListener("openModal", listener);
```

## Global Store
There is a global store which will be the same in every component. Within a template you can access it by using `$store` like this:
```html
@@{$store.counter}
```

To fill it with values you can call the `store` function which will give you the global store. Then you can add states to it by using the `add` method. You pass it by wrapping your states in an object and they will be available within the template with the same name like this: `$store.stateName`. Additionally you can use the store's `watch` method to watch a state on the store. For safety reasons the watcher callback will only get the `.value` of the state to avoid endless update-watch loops.

```javascript
const store = Elaine.store();
const counter = Elaine.state(0);
const counterDoubled = Elaine.state(0);
const constant = 10;
store.add({ counter, counterDoubled, constant });
store.watch("counter", (c) => {
    counterDoubled.value = c * 2;
});
```

Within life-cycle hooks you can also access the store via the given internal state:
```javascript
setup: (state) => {
    const count = () => {
        state.$store.counter++;
    }

    state.$store.watch("counterDoubled", (c) => {
        console.log("counterDoubled", c);
    });

    return {
        state: {
            count
        },
        components: [componentWithin]
    }
}
```

## Build-in Functions
There are multiple build-in functions which are useable within template. All theses functions are used to represent a certain value as a locale string.

To configure the input of theses functions you have to use the `withOptions` function and pass a `ElaineOption` object.
```javascript
export type ElaineOptions = {
    locale?: string,
    dateFormats?: DateFormat[],
    numberFormats?: NumberFormat[],
    translations?: Object
}
```

```html
@@{$number(10000.25)}
@@{$number(10000.25, int)}
@@{$number(10000, twoDigits)}
@@{$number(10000, threeDigits)}
```

The `$number` function is called with a number as first parameter and with the format as the second optional parameter. There are a few build-in formats like `int` and `twoDigits`. Additional formats can be added within the `ElaineOption` and the `withOptions` function.

```html
@@{$date(@@date)}
@@{$date(@@date, medium)}
```

The `$date` function is called with a date as first parameter and with the format as the second optional parameter. There are a few build-in formats like `short`, `medium`, `long` and `full`. Additional formats can be added within the `ElaineOption` and the `withOptions` function.

```html
@@{$strDate(@@dateStr, shortLong)}
@@{$strDate(@@dateStr, long)}
```
The `$strDate` function is called with a date-string as first parameter and with the format as the second optional parameter. There are a few build-in formats like `short`, `medium`, `long` and `full`. Additional formats can be added within the `ElaineOption` and the `withOptions` function.

```html
@@{$t(app.title)}
```
The `$t` function is to translate a given key with a given translation map and a given locale. The translations have to be deposited in the `ElaineOption` in the `withOptions`. You can do this like this:
```javascript
Elaine.withOptions({
    translations: {
        "de": {
            "app.title": "Yo-Yo-Yo-Minator"
        },
        "en": {
            "app.title": "No-No-No-Minator"
        }
    }
});
```
The key here is `app.title` will become the string `Yo-Yo-Yo-Minator` when you run `$t(app.title)`. If the key is not in the translation map the key will be displayed.