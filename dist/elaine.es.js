var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const BINDING = "@@";
const EVENT_LISTENER_BINDING = "++";
const TEMPLATE_PARENT_CALL = "~";
const EVENT_LISTENER_PARENT_CALL_ID = "!++";
const REACTIVE_CONCAT = "##";
const TEXT_BINDER = (binding) => new RegExp(BINDING + "{" + binding.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&") + "}", "g");
const ATTRIBUTE_BINDER = (binding) => new RegExp(BINDING + binding.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
const ATTRIBUTE_ELEMENT_STATE_BINDING = new RegExp(BINDING + "([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|']+)", "g");
const TEXT_STATE_BINDING = new RegExp(BINDING + `\\{([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|'"]+)\\}`, "g");
const TEXT_CONDITIONAL_STATE_BINDING = new RegExp(BINDING + "\\{(\\{.+\\})\\}", "g");
const LOOP_BINDING = new RegExp("(.+) in (.+)", "g");
const OBJECT_FUNCTION_CALL = "|";
function getValue(keyPath, value) {
  if (!value) {
    return value;
  }
  if (value instanceof Object) {
    let val = value;
    let dotIndex = keyPath.indexOf(".");
    if (dotIndex !== -1) {
      keyPath = keyPath.substring(dotIndex + 1);
      val = val.getValueForKeyPath(keyPath);
    }
    return val;
  } else {
    return value;
  }
}
function getBindingNameFromKeyPath(keyPath) {
  let bindingName = keyPath;
  let dotIndex = bindingName.indexOf(".");
  if (dotIndex !== -1) {
    bindingName = bindingName.substring(0, dotIndex);
  }
  return bindingName;
}
function getValuePath(keyPath) {
  let valuePath = keyPath;
  let dotIndex = valuePath.indexOf(".");
  if (dotIndex !== -1) {
    valuePath = valuePath.substring(dotIndex + 1);
  }
  return valuePath;
}
class Condition {
  constructor(conditionStr, bindings) {
    __publicField(this, "bindingsMap");
    __publicField(this, "parseTokens");
    this.bindingsMap = /* @__PURE__ */ new Map();
    const tns = [];
    for (const token of conditionStr.split(" ").filter((t) => t)) {
      let t = token;
      if (t.startsWith("!") && t !== "!=") {
        t = t.substring(1);
        tns.push("!");
      }
      tns.push(t);
      if (t.startsWith(BINDING)) {
        const bindingName = t.substring(BINDING.length);
        const binding = bindings.find((b) => b.binding === bindingName);
        if (binding) {
          this.bindingsMap.set(bindingName, binding);
        }
      }
    }
    this.parseTokens = tns;
  }
  getBindings() {
    return Array.from(this.bindingsMap.values());
  }
  eval() {
    var _a;
    const tokens = [];
    for (const token of this.parseTokens) {
      if (token.startsWith(BINDING)) {
        const bindingName = token.substring(BINDING.length);
        const binding = this.bindingsMap.get(bindingName);
        if (binding) {
          tokens.push(getValue(bindingName, (_a = binding.state) == null ? void 0 : _a.value));
        }
      } else {
        tokens.push(token);
      }
    }
    let truths = [];
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
    let result = truths[0];
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
  isOperator(text) {
    return text === "<" || text === "<=" || text === ">" || text === ">=" || text === "==" || text === "!=" || text === "!==" || text === "===";
  }
  parseValue(value) {
    if (value === "null") {
      return null;
    } else if (value === "undefined") {
      return void 0;
    }
    return value;
  }
  evalCondition(first, operator, second) {
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
      if (f instanceof Object && s instanceof Object) {
        return JSON.stringify(f) == JSON.stringify(s);
      }
      return f == s;
    } else if (operator === "===") {
      if (f instanceof Object && s instanceof Object) {
        return JSON.stringify(f) === JSON.stringify(s);
      }
      return f === s;
    } else if (operator === "!=") {
      if (f instanceof Object && s instanceof Object) {
        return JSON.stringify(f) != JSON.stringify(s);
      }
      return f != s;
    } else if (operator === "!==") {
      if (f instanceof Object && s instanceof Object) {
        return JSON.stringify(f) !== JSON.stringify(s);
      }
      return f !== s;
    } else {
      return false;
    }
  }
}
class MutableState {
  constructor(value) {
    __publicField(this, "_value");
    __publicField(this, "subscribers", []);
    this._value = value;
    if (this._value instanceof Array) {
      this._value = new Proxy(this._value, {
        get: (target, property, receiver) => {
          const result = Reflect.get(target, property, receiver);
          if (property === "push" || property === "shift" || property === "unshift" || property === "pop" || property === "sort") {
            return (...args) => {
              target[property](...args);
              this.notify();
            };
          } else if (property === "splice") {
            return (pos, amount) => {
              target[property](pos, amount);
              this.notify();
            };
          }
          return result;
        }
      });
    } else if (this._value instanceof Object) {
      this._value = new Proxy(this._value, {
        set: (target, property, value2, receiver) => {
          const result = Reflect.set(target, property, value2, receiver);
          this.notify();
          return result;
        }
      });
    }
  }
  set value(newValue) {
    this.set(newValue);
  }
  get value() {
    return this._value;
  }
  set(newValue) {
    if (this._value !== newValue) {
      this._value = newValue;
      this.notify();
    }
  }
  setPathValue(keyPath, newValue) {
    this._value.setValueForKeyPath(keyPath, newValue);
    this.notify();
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  notify() {
    for (const subscriber of this.subscribers) {
      subscriber.update();
    }
  }
}
class ImmutableState {
  constructor(value) {
    __publicField(this, "value");
    __publicField(this, "subscribers", []);
    this.value = value;
  }
  set() {
  }
  setPathValue() {
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  notify() {
  }
}
class ComputedState {
  constructor(computer, parents) {
    __publicField(this, "value");
    __publicField(this, "computer");
    __publicField(this, "parents", []);
    __publicField(this, "subscribers", []);
    this.computer = computer;
    this.value = this.computer();
    this.parents = parents;
  }
  init() {
  }
  update() {
    this.value = this.computer();
    this.notify();
  }
  destroy() {
    for (const parent of this.parents) {
      parent.unsubscribe(this);
    }
  }
  notify() {
    for (const subscriber of this.subscribers) {
      subscriber.update();
    }
  }
  notifyParents() {
    for (const parent of this.parents) {
      parent.notify();
    }
  }
  set() {
  }
  setPathValue() {
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
}
function insertAfter(newNode, referenceNode) {
  const referenceParent = referenceNode.parentElement;
  if (!referenceParent) {
    return;
  }
  const refrenceSibling = referenceNode.nextSibling;
  referenceParent.insertBefore(newNode, refrenceSibling);
}
function insertBefore(newNode, referenceNode) {
  const referenceParent = referenceNode.parentElement;
  if (!referenceParent) {
    return;
  }
  referenceParent.insertBefore(newNode, referenceNode);
}
class FunctionImmutableState extends ImmutableState {
}
class DefaultLink {
  constructor(bindings) {
    __publicField(this, "bindings", []);
    this.bindings = bindings;
  }
  bind(link2) {
    var _a;
    const uniqueBindings = this.bindings.reduce((result, binding) => {
      if (result.find((b) => b.stateName === binding.stateName) === void 0) {
        result.push(binding);
      }
      return result;
    }, []);
    for (const binding of uniqueBindings) {
      (_a = binding.state) == null ? void 0 : _a.subscribe(link2);
    }
  }
}
class ConditionalEventListenerLink extends DefaultLink {
  constructor(bindings, conditionalBindings) {
    super(bindings);
    __publicField(this, "conditionalBindings", []);
    this.conditionalBindings = conditionalBindings;
  }
  init() {
    this.update();
  }
  update() {
    for (const binding of this.conditionalBindings) {
      if (binding.condition.eval()) {
        binding.value.init();
      } else {
        binding.value.destroy();
      }
    }
  }
  destroy() {
    for (const binding of this.conditionalBindings) {
      binding.value.destroy();
    }
  }
}
function parseConditionalBinding(templateWithoutBrackets, bindings) {
  const conditionalBindings = [];
  for (const conditionalBinding of templateWithoutBrackets.split(";")) {
    const conditionalBindingSplit = conditionalBinding.split(":");
    const conditionStr = conditionalBindingSplit[0].trim();
    const condition = new Condition(conditionStr, bindings);
    const valueTemplate = conditionalBindingSplit[1].trim();
    conditionalBindings.push({
      condition,
      value: valueTemplate,
      stateBindings: []
    });
  }
  return conditionalBindings;
}
function parseConditionalBindingWithoutBindings(instance, templateWithoutBrackets) {
  const conditionalBindings = [];
  for (const conditionalBinding of templateWithoutBrackets.split(";")) {
    const conditionalBindingSplit = conditionalBinding.split(":");
    const conditionStr = conditionalBindingSplit[0].trim();
    const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, conditionStr);
    const condition = new Condition(conditionStr, bindings);
    const valueTemplate = conditionalBindingSplit[1].trim();
    conditionalBindings.push({
      condition,
      stateBindings: bindings,
      value: valueTemplate
    });
  }
  return conditionalBindings;
}
class EventListenerSubscriber extends DefaultLink {
  constructor(element, bindings, eventName, callback) {
    super(bindings);
    __publicField(this, "element");
    __publicField(this, "eventName");
    __publicField(this, "listener");
    var _a;
    this.bind(this);
    this.element = element;
    this.eventName = eventName;
    this.listener = (event) => {
      var _a2;
      const args = [];
      for (const param of bindings) {
        args.push(getValue(param.binding, (_a2 = param.state) == null ? void 0 : _a2.value));
      }
      args.push(event);
      return callback(...args);
    };
    (_a = this.element) == null ? void 0 : _a.removeAttribute(EVENT_LISTENER_BINDING + this.eventName);
    if (this.immediateInitNeeded()) {
      this.init();
    }
  }
  immediateInitNeeded() {
    if (this.bindings.length === 0) {
      return true;
    }
    if (this.bindings.filter((b) => b.state instanceof FunctionImmutableState).length === this.bindings.length) {
      return true;
    }
    return false;
  }
  init() {
    var _a;
    (_a = this.element) == null ? void 0 : _a.addEventListener(this.eventName, this.listener);
  }
  update() {
  }
  destroy() {
    var _a;
    (_a = this.element) == null ? void 0 : _a.removeEventListener(this.eventName, this.listener);
  }
}
function getFunctionInfo(functionCall, instance) {
  const params = [];
  let name = functionCall;
  const paramStart = name.indexOf("(");
  if (paramStart !== -1) {
    name = functionCall.substring(0, paramStart);
    const callParams = functionCall.substring(paramStart + 1, functionCall.length - 1).split(",").map((p) => p.trim());
    for (const callParam of callParams) {
      const paramName = callParam.replace(BINDING, "");
      let stateName = void 0;
      let state2 = void 0;
      if (callParam.startsWith(BINDING)) {
        stateName = getBindingNameFromKeyPath(paramName);
        state2 = stateName.startsWith(TEMPLATE_PARENT_CALL) ? instance.parent.getState(stateName.substring(TEMPLATE_PARENT_CALL.length)) : instance.getState(stateName);
      } else {
        stateName = paramName;
        let stateValue = paramName;
        if (stateName.startsWith(OBJECT_FUNCTION_CALL)) {
          const stateAsJSON = paramName.replace(/\|/, "{").replace(/\|/, "}").replace(/~/g, ":").replaceAll(/(')([\s]+)(')/g, "$1,$3").replaceAll(/'/g, '"');
          stateValue = JSON.parse(stateAsJSON);
        }
        state2 = new FunctionImmutableState(stateValue);
      }
      params.push({
        binding: paramName,
        stateName,
        stateSubPath: getValuePath(paramName),
        state: state2
      });
    }
  }
  return {
    name,
    params
  };
}
function createEventListener(instance, element, eventName, functionCall) {
  const functionInfo = getFunctionInfo(functionCall, instance);
  const listenerName = functionInfo.name;
  const bindings = functionInfo.params;
  const method = instance.getMethod(listenerName);
  if (method) {
    return new EventListenerSubscriber(element, bindings, eventName, method);
  }
  return void 0;
}
function createConditionalFunction(instance, element, eventName, functionCall) {
  const conditionalStateBindings = parseConditionalBindingWithoutBindings(instance, functionCall.substring(1, functionCall.length - 1));
  const conditionalEventListenerBindings = [];
  for (const binding of conditionalStateBindings) {
    const listener = createEventListener(instance, element, eventName, binding.value);
    if (listener) {
      conditionalEventListenerBindings.push({
        condition: binding.condition,
        stateBindings: binding.stateBindings,
        value: listener
      });
    }
  }
  const bindings = [];
  for (const binding of conditionalEventListenerBindings) {
    const conditionBindings = binding.stateBindings;
    if (conditionBindings) {
      for (const b of conditionBindings) {
        bindings.push(b);
      }
    }
    const listener = binding.value;
    for (const b of listener.bindings) {
      if (bindings.find((bind) => bind.binding === b.binding) === void 0) {
        bindings.push(b);
      }
    }
  }
  instance.addLink(new ConditionalEventListenerLink(bindings, conditionalEventListenerBindings));
}
function linkEventListener(instance, element, attribute, parent = void 0) {
  const eventName = attribute.name.substring(BINDING.length);
  const functionCall = attribute.value;
  if (functionCall.startsWith("{") && functionCall.endsWith("}")) {
    createConditionalFunction(instance, element, eventName, functionCall);
  } else if (functionCall.startsWith(EVENT_LISTENER_PARENT_CALL_ID) && parent !== void 0) {
    return createEventListener(parent, element, eventName, functionCall.substring(EVENT_LISTENER_PARENT_CALL_ID.length));
  } else {
    return createEventListener(instance, element, eventName, functionCall);
  }
  return void 0;
}
function regexMatches(regex, str, group = 0) {
  const foundMatches = [];
  let match = regex.exec(str);
  while (match !== null) {
    foundMatches.push(match[group]);
    match = regex.exec(str);
  }
  return foundMatches;
}
function getMatchingReactiveBindings(regex, str, group = 1) {
  const matches = regexMatches(regex, str, group);
  return matches.map((match) => {
    const bindingName = match.trim();
    const stateName = getBindingNameFromKeyPath(bindingName).trim();
    const stateSubPath = getValuePath(bindingName).trim();
    const reactiveBinding = {
      binding: bindingName,
      stateName,
      stateSubPath
    };
    return reactiveBinding;
  });
}
function regexMatchesGroups(regex, str, groups = [0]) {
  const foundMatchRequets = [];
  let match = regex.exec(str);
  while (match !== null) {
    const matches = [];
    for (const group of groups) {
      const matchValue = match[group];
      if (matchValue) {
        matches.push({
          group,
          value: matchValue
        });
      }
    }
    foundMatchRequets.push({
      matches
    });
    match = regex.exec(str);
  }
  return foundMatchRequets;
}
function retrieveBindings(instance, regex, str, group = 1) {
  return getMatchingReactiveBindings(regex, str, group).filter((binding) => {
    const name = binding.stateName;
    const state2 = instance.getState(name);
    if (state2) {
      binding.state = state2;
      return true;
    }
    const methodName = name.substring(0, name.indexOf("(")).trim();
    const method = instance.getMethod(methodName);
    if (!method) {
      return false;
    }
    const eventListener = createEventListener(instance, void 0, "", binding.binding);
    if (!eventListener) {
      return false;
    }
    const eventListenerBindings = [];
    for (const b of eventListener.bindings) {
      if (b.state) {
        eventListenerBindings.push(b.state);
      }
    }
    const computed2 = new ComputedState(() => {
      return eventListener.listener(void 0);
    }, eventListenerBindings);
    for (const state22 of eventListenerBindings) {
      state22.subscribe(computed2);
    }
    instance.addLink(computed2);
    binding.stateName = methodName;
    binding.state = computed2;
    return true;
  });
}
function createComputedShell(instance, str) {
  if (str.startsWith(BINDING)) {
    const bindingName = str.substring(BINDING.length);
    const stateName = getBindingNameFromKeyPath(bindingName);
    const state2 = instance.getState(stateName);
    if (state2) {
      return {
        computer: () => getValue(bindingName, state2.value),
        states: [state2]
      };
    }
  }
  const methodName = str.substring(0, str.indexOf("(")).trim();
  const method = instance.getMethod(methodName);
  if (method) {
    const eventListener = createEventListener(instance, void 0, "", str);
    const eventListenerBindings = [];
    for (const b of eventListener.bindings) {
      if (b.state) {
        eventListenerBindings.push(b.state);
      }
    }
    return {
      computer: () => {
        return eventListener.listener(void 0);
      },
      states: eventListenerBindings
    };
  }
  return {
    computer: () => str,
    states: []
  };
}
function createTemplateStates(instance, str) {
  const shell = createComputedShell(instance, str);
  const computed2 = new ComputedState(shell.computer, shell.states);
  for (const state2 of shell.states) {
    state2.subscribe(computed2);
  }
  instance.addLink(computed2);
  return computed2;
}
class DefaultTemplateLink extends DefaultLink {
  constructor(bindings, template, valueObjectsToStrConverter = void 0) {
    super(bindings);
    __publicField(this, "template");
    __publicField(this, "isConditional");
    __publicField(this, "conditionalBindings", []);
    __publicField(this, "valueObjectsToStrConverter");
    this.bind(this);
    this.isConditional = template.startsWith("{") && template.endsWith("}");
    this.template = this.isConditional ? template.substring(1, template.length - 1) : template;
    this.valueObjectsToStrConverter = valueObjectsToStrConverter;
    if (this.isConditional) {
      this.conditionalBindings = parseConditionalBinding(this.template, bindings);
    }
  }
  init() {
    this.update();
  }
  destroy() {
    var _a;
    for (const binding of this.bindings) {
      (_a = binding.state) == null ? void 0 : _a.unsubscribe(this);
    }
  }
  update() {
    if (this.isConditional) {
      let updateResult = "";
      for (const conditionalBinding of this.conditionalBindings) {
        if (conditionalBinding.condition.eval()) {
          updateResult += this.applyBindingsToTemplate(conditionalBinding.value) + " ";
        }
      }
      this.updateBinding(updateResult);
    } else {
      this.updateBinding(this.applyBindingsToTemplate(this.template));
    }
  }
  applyBindingsToTemplate(template) {
    let updateResult = template;
    for (const binding of this.bindings) {
      updateResult = this.updateTemplate(updateResult, binding);
    }
    return updateResult.replaceAll(new RegExp(REACTIVE_CONCAT, "g"), "");
  }
  updateTemplate(text, binding) {
    var _a;
    let result = text;
    if (!binding.binding) {
      return result;
    }
    const bindingRegex = this.bindingRegex(binding.binding);
    const reactiveValue = (_a = binding.state) == null ? void 0 : _a.value;
    const value = getValue(binding.binding, reactiveValue);
    result = result.replaceAll(bindingRegex, this.valueAsString(value));
    return result;
  }
  valueAsString(value) {
    if (value instanceof Object) {
      if (this.valueObjectsToStrConverter) {
        return this.valueObjectsToStrConverter(value);
      }
      return JSON.stringify(value);
    }
    return value;
  }
  bindingRegex(binding) {
    return ATTRIBUTE_BINDER(binding);
  }
}
class TextLink extends DefaultTemplateLink {
  constructor(element, bindings, text) {
    super(bindings, text.trim());
    __publicField(this, "text");
    this.text = element;
  }
  bindingRegex(binding) {
    return TEXT_BINDER(binding);
  }
  updateBinding(updateResult) {
    this.text.textContent = updateResult;
  }
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
class ModelLink {
  constructor(instance, element, binding) {
    __publicField(this, "element");
    __publicField(this, "binding");
    __publicField(this, "isPathValue");
    __publicField(this, "inputListener");
    __publicField(this, "targetAttribute");
    __publicField(this, "eventListener");
    this.element = element;
    this.binding = binding;
    this.isPathValue = binding.binding !== binding.stateName;
    this.inputListener = this.getInputListener(binding);
    this.element.removeAttribute(BINDING + "model");
    this.targetAttribute = element.getAttribute("type") === "checkbox" ? "checked" : "value";
    this.eventListener = this.createInputListener(instance);
  }
  getInputListener(binding) {
    if (this.isPathValue) {
      return (e) => {
        var _a;
        const target = e.target;
        if (target) {
          (_a = binding.state) == null ? void 0 : _a.setPathValue(binding.stateSubPath, target[this.targetAttribute]);
        }
      };
    }
    return (e) => {
      const target = e.target;
      if (target && binding.state) {
        binding.state.value = target[this.targetAttribute];
      }
    };
  }
  createInputListener(instance) {
    const listenerName = this.binding.binding + "-" + uuid();
    instance.addMethod(listenerName, this.inputListener);
    return linkEventListener(instance, this.element, {
      name: "++input",
      value: listenerName
    });
  }
  init() {
    var _a;
    this.update();
    (_a = this.eventListener) == null ? void 0 : _a.init();
  }
  update() {
    var _a, _b, _c;
    if (this.isPathValue) {
      this.element[this.targetAttribute] = (_b = (_a = this.binding.state) == null ? void 0 : _a.value) == null ? void 0 : _b.getValueForKeyPath(this.binding.stateSubPath);
    } else {
      this.element[this.targetAttribute] = (_c = this.binding.state) == null ? void 0 : _c.value;
    }
  }
  destroy() {
    var _a, _b;
    (_a = this.eventListener) == null ? void 0 : _a.destroy();
    (_b = this.binding.state) == null ? void 0 : _b.unsubscribe(this);
  }
}
class LoopState extends MutableState {
  constructor(value, list) {
    super(value);
    __publicField(this, "list");
    this.list = list;
  }
  notify() {
    super.notify();
    if (this.list instanceof ComputedState) {
      this.list.notifyParents();
    } else {
      this.list.notify();
    }
  }
}
class LoopLink {
  constructor(instance, element, loopValueName, binding) {
    __publicField(this, "id", uuid());
    __publicField(this, "instance");
    __publicField(this, "loopValueName");
    __publicField(this, "binding");
    __publicField(this, "forComment");
    __publicField(this, "loopTemplate");
    __publicField(this, "initDone");
    __publicField(this, "loopInstances");
    this.initDone = false;
    this.instance = instance;
    this.loopValueName = loopValueName;
    this.binding = binding;
    this.forComment = document.createComment("for-" + this.id);
    insertAfter(this.forComment, element);
    element.remove();
    this.loopTemplate = element.cloneNode(true);
    element.removeAttribute(BINDING + "for");
    this.loopTemplate.removeAttribute(BINDING + "for");
    this.loopInstances = [];
  }
  init() {
    var _a;
    if (this.initDone) {
      return;
    }
    this.initDone = true;
    this.insertLoopChildren(getValue(this.binding.binding, (_a = this.binding.state) == null ? void 0 : _a.value));
  }
  update() {
    var _a;
    this.resetLoop();
    this.insertLoopChildren(getValue(this.binding.binding, (_a = this.binding.state) == null ? void 0 : _a.value));
  }
  destroy() {
    var _a;
    for (const loopInstance of this.loopInstances) {
      loopInstance.destroy();
    }
    (_a = this.binding.state) == null ? void 0 : _a.unsubscribe(this);
  }
  resetLoop() {
    for (const instance of this.loopInstances) {
      instance.unmount();
      instance.destroy();
    }
    this.loopInstances = [];
  }
  insertLoopChildren(list) {
    if (!list) {
      return;
    }
    for (let i = list.length - 1; i >= 0; i--) {
      const loopValue = list[i];
      const loopInstance = new Instance(Origin.LOOP, this.loopTemplate, this.loopTemplate, this.instance);
      loopInstance.merge(this.instance);
      loopInstance.addState(this.loopValueName, new LoopState(loopValue, this.binding.state));
      loopInstance.addState("_index", new ImmutableState(i));
      loopInstance.appendMount(this.forComment);
      this.loopInstances.push(loopInstance);
    }
  }
}
const booleanAttributes = [
  "allowfullscreen",
  "allowpaymentrequest",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected",
  "truespeed"
];
class AttributeLink extends DefaultTemplateLink {
  constructor(element, bindings, attribute, template) {
    super(bindings, template, (value) => {
      if (value instanceof Array) {
        return value.join(" ");
      }
      let str = "";
      for (const prop in value) {
        str += prop + ":" + value[prop] + ";";
      }
      return str;
    });
    __publicField(this, "element");
    __publicField(this, "attribute");
    __publicField(this, "staticValue");
    __publicField(this, "isBooleanAttribute");
    this.element = element;
    this.attribute = attribute;
    this.isBooleanAttribute = booleanAttributes.includes(this.attribute);
    this.element.removeAttribute(BINDING + this.attribute);
    this.staticValue = this.element.getAttribute(this.attribute);
  }
  updateBinding(updateResult) {
    this.element.removeAttribute(this.attribute);
    let newAttributeValue = "";
    if (this.staticValue !== null) {
      newAttributeValue += this.staticValue;
      newAttributeValue += " ";
    }
    newAttributeValue += updateResult;
    if (!this.isBooleanAttribute || newAttributeValue === "true") {
      this.element.setAttribute(this.attribute, newAttributeValue);
    }
  }
}
class Renderlink extends DefaultLink {
  constructor(element, bindings, condition, parent, orignalInstance = void 0) {
    super(bindings);
    __publicField(this, "id", uuid());
    __publicField(this, "ifComment");
    __publicField(this, "element");
    __publicField(this, "instance");
    __publicField(this, "condition");
    __publicField(this, "isElementRendered");
    this.bind(this);
    this.condition = condition;
    this.ifComment = document.createComment("if-" + this.id);
    insertBefore(this.ifComment, element);
    this.element = element;
    this.element.removeAttribute(BINDING + "if");
    this.instance = orignalInstance != null ? orignalInstance : new Instance(Origin.IF, this.element, this.element).merge(parent);
    this.element.remove();
  }
  init() {
    this.eval();
  }
  update() {
    this.eval();
  }
  destroy() {
    var _a;
    for (const binding of this.bindings) {
      (_a = binding.state) == null ? void 0 : _a.unsubscribe(this);
    }
    this.instance.destroy();
  }
  eval() {
    const result = this.condition.eval();
    if (result) {
      if (!this.isElementRendered || this.isElementRendered === void 0) {
        this.isElementRendered = result;
        this.instance.appendMount(this.ifComment);
      }
    } else {
      if (this.isElementRendered || this.isElementRendered === void 0) {
        this.isElementRendered = result;
        this.instance.unmount();
      }
    }
  }
}
function link(instance, element, parent = void 0) {
  if (element.tagName === "SCRIPT" || element instanceof Comment) {
    return;
  }
  if (element.tagName === "TEMPLATE-STATE") {
    addStateFromTemplate(instance, element);
    return;
  }
  if (element.hasAttribute && element.hasAttribute(SLOT_INDICATOR)) {
    resolveSlots(instance, element, parent);
    return;
  }
  let shouldLinkChildren = true;
  if (!(element instanceof Text) && element.hasAttributes()) {
    shouldLinkChildren = linkAttributes(instance, element, parent);
  }
  if (element instanceof Text) {
    linkTextNode(instance, element);
  }
  if (shouldLinkChildren && element.hasChildNodes() && !instance.isComponentElement(element.tagName)) {
    linkChildren(instance, element.childNodes, parent);
  }
}
function linkChildren(instance, elements, parent = void 0) {
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    link(instance, element, parent);
  }
}
function linkTextNode(instance, textNode) {
  const textContent = textNode.textContent;
  if (!textContent) {
    return;
  }
  let bindings = [];
  const conditionalBinding = regexMatches(TEXT_CONDITIONAL_STATE_BINDING, textContent, 1);
  let text = textContent;
  if (conditionalBinding.length === 1) {
    text = conditionalBinding[0];
    bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, text);
  } else {
    bindings = retrieveBindings(instance, TEXT_STATE_BINDING, textContent);
  }
  if (bindings.length !== 0) {
    instance.addLink(new TextLink(textNode, bindings, text));
  }
}
function linkAttributes(instance, element, parent = void 0) {
  let linkChildren2 = true;
  for (const attribute of Array.from(element.attributes)) {
    if (attribute.name === BINDING + "for") {
      linkLoop(instance, element, attribute);
      linkChildren2 = false;
    } else if (attribute.name === BINDING + "model") {
      linkModel(instance, element, attribute);
    } else if (attribute.name === BINDING + "if") {
      linkConditionalRendering(instance, element, attribute);
      linkChildren2 = false;
    } else if (attribute.name.startsWith(BINDING)) {
      linkAttribute(instance, element, attribute);
    } else if (attribute.name.startsWith(EVENT_LISTENER_BINDING)) {
      const elementIsComponent = instance.getComponent(element.tagName) !== void 0;
      if (elementIsComponent) {
        if (attribute.value.startsWith(EVENT_LISTENER_PARENT_CALL_ID)) {
          attribute.value = attribute.value.substring(EVENT_LISTENER_PARENT_CALL_ID.length);
        }
        attribute.value = EVENT_LISTENER_PARENT_CALL_ID + attribute.value;
      } else {
        const listener = linkEventListener(instance, element, attribute, parent);
        if (listener) {
          instance.addLink(listener);
        }
      }
    }
  }
  return linkChildren2;
}
function linkLoop(instance, element, attribute) {
  var _a, _b, _c;
  const loopPatternMatches = regexMatchesGroups(LOOP_BINDING, attribute.value, [1, 2]);
  if (loopPatternMatches.length !== 1) {
    return;
  }
  const matches = loopPatternMatches[0].matches;
  const loopValueName = (_a = matches.find((m) => m.group === 1)) == null ? void 0 : _a.value.trim();
  const listValueName = (_b = matches.find((m) => m.group === 2)) == null ? void 0 : _b.value.trim();
  if (!loopValueName || !listValueName) {
    return;
  }
  const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, listValueName);
  if (bindings.length === 1) {
    const binding = bindings[0];
    const loopLink = new LoopLink(instance, element, loopValueName, binding);
    (_c = binding.state) == null ? void 0 : _c.subscribe(loopLink);
    instance.addLink(loopLink);
  }
}
function linkModel(instance, element, attribute) {
  const attrValue = attribute.value.replaceAll(BINDING, "").trim();
  const isParentCall = attrValue.startsWith(TEMPLATE_PARENT_CALL);
  const bindingName = isParentCall ? attrValue.substring(TEMPLATE_PARENT_CALL.length) : attrValue;
  const lookupInstance = isParentCall ? instance.parent : instance;
  const stateName = getBindingNameFromKeyPath(bindingName);
  const state2 = lookupInstance.getState(stateName);
  if (!state2) {
    return;
  }
  const reactiveSubPath = getValuePath(bindingName);
  const binding = {
    binding: bindingName,
    stateName,
    stateSubPath: reactiveSubPath,
    state: state2
  };
  const modelLink = new ModelLink(lookupInstance, element, binding);
  state2.subscribe(modelLink);
  lookupInstance.addLink(modelLink);
}
function linkConditionalRendering(instance, element, attribute) {
  if (instance.getComponent(element.tagName)) {
    return;
  }
  const condition = attribute.value;
  const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, condition);
  if (bindings.length !== 0) {
    instance.addLink(new Renderlink(element, bindings, new Condition(condition, bindings), instance));
  }
}
function linkAttribute(instance, element, attribute) {
  const attributeName = attribute.name.substring(BINDING.length);
  const template = attribute.value;
  const bindings = retrieveBindings(instance, ATTRIBUTE_ELEMENT_STATE_BINDING, template);
  if (bindings.length !== 0) {
    instance.addLink(new AttributeLink(element, bindings, attributeName, template));
  }
}
function addStateFromTemplate(instance, element) {
  for (const attribute of Array.from(element.attributes)) {
    instance.addState(attribute.name, createTemplateStates(instance, attribute.value));
  }
  element.remove();
}
function resolveSlots(instance, element, parent) {
  const resolver = element.getAttribute(SLOT_RESOLVER);
  const resolveState = createTemplateStates(instance, resolver);
  let displaySlot = null;
  for (const slot of Array.from(element.children)) {
    const slotVariant = slot.tagName.toLowerCase();
    if (slotVariant == (resolveState == null ? void 0 : resolveState.value)) {
      displaySlot = slot;
      break;
    } else if (displaySlot === null && slotVariant === "default") {
      displaySlot = slot;
    }
    slot.remove();
  }
  if (!displaySlot) {
    throw "Slot-Resolve-Error: Slots with variants must provide a default slot!";
  }
  const displaySlotChildren = Array.from(displaySlot.childNodes);
  for (const child of displaySlotChildren) {
    insertBefore(child, element);
    link(instance, child, parent);
  }
  element.remove();
}
class EventHubInstance {
  constructor() {
    __publicField(this, "listeners", /* @__PURE__ */ new Map());
  }
  dispatchEvent(eventName, payload) {
    var _a;
    for (const listener of (_a = this.listeners.get(eventName)) != null ? _a : []) {
      listener(payload);
    }
  }
  addListener({ eventName, listener }) {
    let eventListeners = this.listeners.get(eventName);
    if (eventListeners === void 0) {
      eventListeners = [];
    }
    eventListeners.push(listener);
    this.listeners.set(eventName, eventListeners);
  }
  removeListener({ eventName, listener }) {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners === void 0) {
      return;
    }
    const indexOfListener = eventListeners.indexOf(listener);
    if (indexOfListener !== -1) {
      eventListeners.splice(eventListeners.indexOf(listener), 1);
    }
  }
}
var EventHub = new EventHubInstance();
class StoreInstance {
  constructor(notify) {
    __publicField(this, "notify");
    this.notify = notify;
  }
  add(states) {
    for (const name of Object.keys(states)) {
      let state2 = states[name];
      if (!(state2 instanceof MutableState) && !(state2 instanceof ComputedState) && !(state2 instanceof ImmutableState)) {
        state2 = new ImmutableState(state2);
      }
      this["_" + name] = state2;
      Object.defineProperty(this, name, {
        get: () => {
          return state2.value;
        },
        set: (value) => {
          state2.value = value;
          this.notify();
        }
      });
    }
  }
  watch(property, watcher) {
    const state2 = this["_" + property];
    if (state2) {
      Elaine.watch(() => {
        watcher(state2.value);
      }, state2);
    }
  }
}
function createTriggerNotify(subscribers) {
  return () => {
    for (const subscriber of subscribers) {
      subscriber.update();
    }
  };
}
class StoreState {
  constructor() {
    __publicField(this, "_value");
    __publicField(this, "subscribers");
    __publicField(this, "triggerNotify");
    this.subscribers = [];
    this.triggerNotify = createTriggerNotify(this.subscribers);
    this._value = new StoreInstance(this.triggerNotify);
  }
  set value(_) {
    throw "Not allowed to change Store value";
  }
  get value() {
    return this._value;
  }
  set() {
  }
  setPathValue() {
  }
  subscribe(subscriber) {
    this.subscribers.push(subscriber);
  }
  unsubscribe(subscriber) {
    const index = this.subscribers.indexOf(subscriber);
    if (index !== -1) {
      this.subscribers.splice(index, 1);
    }
  }
  notify() {
    this.triggerNotify();
  }
}
var Store = new StoreState();
class WatcherLink {
  constructor(watcher, ...states) {
    __publicField(this, "watcher");
    __publicField(this, "states");
    this.watcher = watcher;
    this.states = states;
  }
  init() {
  }
  update() {
    this.watcher();
  }
  destroy() {
    for (const state2 of this.states) {
      state2.unsubscribe(this);
    }
  }
}
const defaultDateFormats = [
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
const defaultNumberFormats = [
  {
    name: "int",
    format: {
      minFractions: 0,
      maxFractions: 0
    }
  },
  {
    name: "twoDigits",
    format: {
      minFractions: 2,
      maxFractions: 2
    }
  }
];
let appOptions = new MutableState({
  dateFormats: defaultDateFormats,
  translations: {}
});
function setAppOptions(options) {
  options.dateFormats = [...options.dateFormats || [], ...defaultDateFormats];
  options.numberFormats = [...options.numberFormats || [], ...defaultNumberFormats];
  appOptions.value = options;
}
let locale = appOptions.value.locale;
const dateFormats = /* @__PURE__ */ new Map();
const numberFormats = /* @__PURE__ */ new Map();
const translations = /* @__PURE__ */ new Map();
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
  const t = appOptions.value.translations[locale != null ? locale : navigator.language.split("-")[0]];
  if (t) {
    for (const key of Object.keys(t)) {
      translations.set(key, t[key]);
    }
  }
};
setOptions();
const watcherLink = new WatcherLink(setOptions, appOptions);
appOptions.subscribe(watcherLink);
function dateToDateTimeStr(date, format = void 0) {
  const options = format ? dateFormats.get(format) : void 0;
  return new Intl.DateTimeFormat(locale, { dateStyle: options == null ? void 0 : options.dateStyle, timeStyle: options == null ? void 0 : options.timeStyle }).format(date);
}
function strDateToDateTimeStr(date, format = void 0) {
  return dateToDateTimeStr(new Date(date), format);
}
function localeNumber(number, format = void 0) {
  const options = format ? numberFormats.get(format) : void 0;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: options == null ? void 0 : options.maxFractions, minimumFractionDigits: options == null ? void 0 : options.minFractions }).format(number);
}
function translate(key) {
  const value = translations.get(key);
  return value != null ? value : key;
}
var Origin = /* @__PURE__ */ ((Origin2) => {
  Origin2[Origin2["SETUP"] = 0] = "SETUP";
  Origin2[Origin2["COMPONENT"] = 1] = "COMPONENT";
  Origin2[Origin2["IF"] = 2] = "IF";
  Origin2[Origin2["LOOP"] = 3] = "LOOP";
  return Origin2;
})(Origin || {});
const SLOT_INDICATOR = "elaine-slot";
const SLOT_RESOLVER = "elaine-slot-resolver";
const SLOT_PARENT_COMPONENT = "elaine-parent-component";
const componentElements = [];
class Instance {
  constructor(origin, element, template, parent = void 0, props = [], slots = [], setup2 = void 0, onMounted = void 0, beforeUnmounted = void 0, onUnmounted = void 0, beforeDestroyed = void 0, onDestroyed = void 0, components = void 0) {
    __publicField(this, "origin");
    __publicField(this, "element");
    __publicField(this, "parent");
    __publicField(this, "template");
    __publicField(this, "states", /* @__PURE__ */ new Map());
    __publicField(this, "methods", /* @__PURE__ */ new Map());
    __publicField(this, "components", /* @__PURE__ */ new Map());
    __publicField(this, "links", []);
    __publicField(this, "childInstances", []);
    __publicField(this, "condition");
    __publicField(this, "conditionLink");
    __publicField(this, "props", []);
    __publicField(this, "slots", []);
    __publicField(this, "setup");
    __publicField(this, "onMounted");
    __publicField(this, "beforeUnmounted");
    __publicField(this, "onUnmounted");
    __publicField(this, "beforeDestroyed");
    __publicField(this, "onDestroyed");
    __publicField(this, "internalState");
    __publicField(this, "wasCreated");
    __publicField(this, "dispatchEvent");
    __publicField(this, "globalEventListeners", []);
    __publicField(this, "dispatchGlobalEvent");
    __publicField(this, "addGlobalEventListener");
    __publicField(this, "styleElement");
    this.origin = origin;
    this.element = element;
    this.template = template.cloneNode(true);
    this.parent = parent;
    this.props = props;
    this.slots = slots;
    this.setup = setup2;
    this.onMounted = onMounted;
    this.beforeUnmounted = beforeUnmounted;
    this.onUnmounted = onUnmounted;
    this.beforeDestroyed = beforeDestroyed;
    this.onDestroyed = onDestroyed;
    for (const componentFromOutside of components != null ? components : []) {
      this.components.set(componentFromOutside.name, componentFromOutside);
    }
    this.dispatchEvent = (eventName, payload) => {
      const event = new CustomEvent(eventName, {
        detail: payload
      });
      this.template.dispatchEvent(event);
    };
    this.dispatchGlobalEvent = (eventName, payload) => {
      EventHub.dispatchEvent(eventName, payload);
    };
    this.addGlobalEventListener = (eventName, listener) => {
      const globalEventListener = { eventName, listener };
      EventHub.addListener(globalEventListener);
      this.globalEventListeners.push(globalEventListener);
    };
    this.internalState = {
      element: this.template,
      data: {},
      methods: {},
      refs: {},
      $store: Store.value,
      dispatchEvent: this.dispatchEvent,
      dispatchGlobalEvent: this.dispatchGlobalEvent,
      addGlobalEventListener: this.addGlobalEventListener
    };
    this.condition = this.extractCondition(element);
    if (this.condition) {
      this.conditionLink = new Renderlink(element, this.condition.getBindings(), this.condition, void 0, this);
      this.conditionLink.init();
    }
    this.wasCreated = false;
    this.methods.set("$date", dateToDateTimeStr);
    this.methods.set("$strDate", strDateToDateTimeStr);
    this.methods.set("$number", localeNumber);
    this.methods.set("$t", translate);
    this.states.set("$store", Store);
    if (this.components.size > 0) {
      for (const component2 of this.components.values()) {
        componentElements.push(component2.name);
        for (const elementName of component2.slots) {
          componentElements.push(elementName.toUpperCase());
        }
      }
    }
  }
  isComponentElement(tagName) {
    return componentElements.includes(tagName);
  }
  setupIfNeeded() {
    if (this.wasCreated) {
      return;
    }
    this.resolveProps(this.element, this.parent);
    this.resolveSetup();
    this.resolveSlots(this.element);
    if (this.origin === 1) {
      for (const elementAttr of Array.from(this.element.attributes)) {
        if (elementAttr.name.startsWith(COMPONENT_CSS_SCOPE)) {
          continue;
        }
        const transferAttr = elementAttr.cloneNode(true);
        const attrOnTemplate = this.template.attributes.getNamedItem(transferAttr.name);
        if (attrOnTemplate) {
          transferAttr.value += ` ${attrOnTemplate.value}`;
        }
        this.template.attributes.setNamedItem(transferAttr);
      }
    }
    link(this, this.template, this.parent);
    for (const link2 of this.links) {
      link2.init();
    }
    this.initComponents([this.template]);
    if (this.origin === 0) {
      const css = this.gatherAllComponents().map((c) => c.css).filter((c) => c !== void 0).reduce((cssAll, css2) => cssAll + " " + css2, "");
      if (css) {
        this.styleElement = document.createElement("style");
        this.styleElement.textContent = css;
      }
    }
    this.wasCreated = true;
  }
  gatherAllComponents() {
    return [...this.components.values(), ...this.childInstances.map((i) => i.components.values()).flatMap((c) => Array.from(c))];
  }
  addLink(link2) {
    this.links.push(link2);
  }
  getState(name) {
    var _a;
    if (name.startsWith(TEMPLATE_PARENT_CALL)) {
      return (_a = this.parent) == null ? void 0 : _a.getState(name.substring(TEMPLATE_PARENT_CALL.length));
    }
    const foundState = this.states.get(name);
    if (!name.startsWith("!")) {
      return foundState;
    }
    const originalState = this.states.get(name.substring(1));
    if (!originalState) {
      return void 0;
    }
    const negateState = new ComputedState(() => !originalState.value, [originalState]);
    originalState.subscribe(negateState);
    this.states.set(name, negateState);
    this.addLink(negateState);
    return negateState;
  }
  addState(name, state2) {
    this.states.set(name, state2);
  }
  merge(instance) {
    if (!instance) {
      return this;
    }
    for (const state2 of instance.states.entries()) {
      this.states.set(state2[0], state2[1]);
    }
    for (const method of instance.methods.entries()) {
      this.addMethod(method[0], method[1]);
    }
    for (const component2 of instance.components.entries()) {
      this.registerComponent(component2[0], component2[1]);
    }
    this.parent = instance.parent;
    return this;
  }
  getMethod(methodName) {
    var _a;
    if (methodName.startsWith(TEMPLATE_PARENT_CALL)) {
      return (_a = this.parent) == null ? void 0 : _a.getMethod(methodName.substring(TEMPLATE_PARENT_CALL.length));
    }
    return this.methods.get(methodName);
  }
  addMethod(name, method) {
    this.methods.set(name, method);
  }
  registerComponent(name, component2) {
    this.components.set(name, component2);
  }
  getComponent(name) {
    return this.components.get(name);
  }
  mount() {
    if (this.condition && !this.condition.eval()) {
      return;
    }
    insertAfter(this.template, this.element);
    this.element.remove();
    this.setupIfNeeded();
    if (this.styleElement) {
      document.body.prepend(this.styleElement);
    }
    if (this.onMounted) {
      this.onMounted(this.internalState);
    }
  }
  appendMount(comment) {
    if (this.condition && !this.condition.eval()) {
      return;
    }
    insertAfter(this.template, comment);
    this.setupIfNeeded();
    if (this.onMounted) {
      this.onMounted(this.internalState);
    }
  }
  extractCondition(element) {
    var _a;
    const condition = element.getAttribute(BINDING + "if");
    if (!condition) {
      return void 0;
    }
    const bindings = retrieveBindings((_a = this.parent) != null ? _a : this, ATTRIBUTE_ELEMENT_STATE_BINDING, condition);
    return new Condition(condition, bindings);
  }
  resolveSlots(element) {
    var _a;
    for (const slotName of this.slots) {
      const slotOnComponent = this.template.querySelector(slotName);
      if (!slotOnComponent) {
        continue;
      }
      const variant = slotOnComponent.getAttribute("variant");
      const slotOnElement = element.querySelector(slotName);
      if (slotOnElement) {
        invertParentCalls(slotOnElement, (_a = this.parent) == null ? void 0 : _a.components);
        if (variant) {
          slotOnElement.setAttribute(SLOT_INDICATOR, "");
          slotOnElement.setAttribute(SLOT_RESOLVER, variant);
          insertBefore(slotOnElement, slotOnComponent);
        } else {
          for (const child of Array.from(slotOnElement.childNodes)) {
            insertBefore(child, slotOnComponent);
          }
        }
      }
      slotOnComponent.remove();
    }
  }
  resolveProps(element, parent) {
    for (const prop of this.props) {
      const propName = prop.name;
      const propAttr = element.getAttribute(propName);
      if (propAttr) {
        const stateName = propAttr.substring(BINDING.length);
        const state2 = parent == null ? void 0 : parent.getState(stateName);
        if (state2 && state2 instanceof MutableState || state2 instanceof ImmutableState || state2 instanceof ComputedState) {
          this.states.set(propName, state2);
          this.internalState.data[propName] = state2;
        } else if (propAttr) {
          const immutableState = new ImmutableState(this.parseIntoType(prop.type, propAttr));
          this.states.set(propName, immutableState);
          this.internalState.data[propName] = state2;
        }
        element.removeAttribute(propName);
      } else {
        if (prop.required || prop.required === void 0) {
          throw `Prop-Read-Error: "${propName}" is a required prop and was not provided.`;
        } else {
          const defaultState = new ImmutableState(prop.default);
          this.states.set(propName, defaultState);
          this.internalState.data[propName] = prop.default;
        }
      }
    }
  }
  parseIntoType(type, value) {
    if (value === "null") {
      return null;
    } else if (value === "undefined") {
      return void 0;
    } else if (type === Number) {
      if (value.includes(".")) {
        return Number.parseFloat(value);
      }
      return Number.parseInt(value);
    } else if (type === Boolean) {
      return value === "true";
    } else if (type === Object || type === Array) {
      return JSON.parse(value);
    }
    return value;
  }
  resolveSetup() {
    var _a;
    if (!this.setup) {
      return;
    }
    const setupResult = this.setup(this.internalState);
    if (setupResult) {
      for (const component2 of setupResult.components || []) {
        this.registerComponent(component2.name, component2);
      }
      for (const propName in (_a = setupResult.state) != null ? _a : {}) {
        const state2 = setupResult.state[propName];
        if (state2 instanceof Function) {
          this.methods.set(propName, state2);
          this.internalState.methods[propName] = state2;
        } else if (state2 instanceof MutableState || state2 instanceof ComputedState || state2 instanceof ImmutableState) {
          this.states.set(propName, state2);
          this.internalState.data[propName] = state2;
        } else {
          this.states.set(propName, new ImmutableState(state2));
          this.internalState.data[propName] = state2;
        }
      }
    }
  }
  initComponents(elements) {
    var _a;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const isParentComponent = element.getAttribute && element.getAttribute(SLOT_PARENT_COMPONENT) !== null;
      const componentByThatName = isParentComponent ? (_a = this.parent) == null ? void 0 : _a.getComponent(element.tagName) : this.getComponent(element.tagName);
      if (componentByThatName !== void 0) {
        const componentInstance = componentByThatName.toInstance(element, this);
        this.childInstances.push(componentInstance);
        const ref = element.getAttribute("ref");
        if (ref) {
          this.internalState.refs[ref] = componentInstance.internalState;
        }
        if (componentInstance.condition === void 0) {
          componentInstance.mount();
        }
        continue;
      }
      if (element.hasChildNodes()) {
        this.initComponents(element.childNodes);
      }
    }
  }
  unmount() {
    var _a;
    if (this.beforeUnmounted) {
      this.beforeUnmounted(this.internalState);
    }
    this.template.remove();
    (_a = this.styleElement) == null ? void 0 : _a.remove();
    for (const instance of this.childInstances) {
      instance.unmount();
    }
    if (this.onUnmounted) {
      this.onUnmounted(this.internalState);
    }
  }
  destroy() {
    var _a;
    if (this.beforeDestroyed) {
      this.beforeDestroyed(this.internalState);
    }
    for (const instance of this.childInstances) {
      instance.destroy();
    }
    this.childInstances = [];
    for (const link2 of this.links) {
      link2.destroy();
    }
    (_a = this.conditionLink) == null ? void 0 : _a.destroy();
    for (const globalEventListener of this.globalEventListeners) {
      EventHub.removeListener(globalEventListener);
    }
    this.globalEventListeners = [];
    if (this.onDestroyed) {
      this.onDestroyed(this.internalState);
    }
  }
}
function invertParentCalls(slot, parentComponents) {
  if (parentComponents == null ? void 0 : parentComponents.get(slot.tagName)) {
    slot.setAttribute(SLOT_PARENT_COMPONENT, "");
  }
  if (slot instanceof Text && slot.textContent && slot.textContent.length !== 0) {
    const newText = slot.textContent.replaceAll(TEXT_STATE_BINDING, (_, g) => BINDING + "{" + invertParentCall(g) + "}").replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
    slot.textContent = newText;
  } else if (slot.hasAttributes()) {
    for (const attribute of Array.from(slot.attributes)) {
      if (attribute.name === BINDING + "model") {
        attribute.value = invertParentCall(attribute.value.replace(BINDING, ""));
      } else if (attribute.name.startsWith(EVENT_LISTENER_BINDING)) {
        attribute.value = invertParentCall(attribute.value).replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
      } else {
        attribute.value = attribute.value.replaceAll(ATTRIBUTE_ELEMENT_STATE_BINDING, (_, a) => BINDING + invertParentCall(a));
      }
    }
  }
  if (slot.hasChildNodes()) {
    invertChildrentParentCalls(slot.childNodes, parentComponents);
  }
}
function invertChildrentParentCalls(slotChildren, parentComponents) {
  for (let i = 0; i < slotChildren.length; i++) {
    const element = slotChildren[i];
    invertParentCalls(element, parentComponents);
  }
}
function invertParentCall(template) {
  return template.startsWith(TEMPLATE_PARENT_CALL) ? template.substring(TEMPLATE_PARENT_CALL.length) : TEMPLATE_PARENT_CALL + template;
}
const COMPONENT_CSS_SCOPE = "data-elaine-c-";
class Component {
  constructor(name, element, props = [], slots = [], setup2 = void 0, onMounted = void 0, beforeUnmounted = void 0, onUnmounted = void 0, beforeDestroyed = void 0, onDestroyed = void 0, css = void 0) {
    __publicField(this, "name");
    __publicField(this, "template");
    __publicField(this, "props", []);
    __publicField(this, "slots", []);
    __publicField(this, "setup");
    __publicField(this, "onMounted");
    __publicField(this, "beforeUnmounted");
    __publicField(this, "onUnmounted");
    __publicField(this, "beforeDestroyed");
    __publicField(this, "onDestroyed");
    __publicField(this, "css");
    this.name = name;
    this.template = element.cloneNode(true);
    this.props = props;
    this.slots = slots;
    this.setup = setup2;
    this.onMounted = onMounted;
    this.beforeUnmounted = beforeUnmounted;
    this.onUnmounted = onUnmounted;
    this.beforeDestroyed = beforeDestroyed;
    this.onDestroyed = onDestroyed;
    if (css) {
      const componentDataAttribute = COMPONENT_CSS_SCOPE + name.toLowerCase();
      this.css = css.replaceAll(/.*\{/g, (p) => {
        const selector = p.substring(0, p.length - 1).trim();
        return `${selector}[${componentDataAttribute}] {`;
      }).replace(/  |\r\n|\n|\r/gm, "");
      this.addAttributeToAllElements(this.template, componentDataAttribute);
    }
  }
  addAttributeToAllElements(element, attribute) {
    element.setAttribute(attribute, "");
    if (element.children.length > 0) {
      for (const child of Array.from(element.children)) {
        this.addAttributeToAllElements(child, attribute);
      }
    }
  }
  toInstance(element, parent) {
    return new Instance(Origin.COMPONENT, element, this.template, parent, this.props, this.slots, this.setup, this.onMounted, this.beforeUnmounted, this.onUnmounted, this.beforeDestroyed, this.onDestroyed);
  }
}
Object.defineProperty(Object.prototype, "setValueForKey", {
  value: function(value, key) {
    this[key] = value;
  }
});
Object.defineProperty(Object.prototype, "setValueForKeyPath", {
  value: function(keyPath, value) {
    if (keyPath == null) {
      return;
    }
    if (keyPath.indexOf(".") === -1) {
      this.setValueForKey(value, keyPath);
      return;
    }
    const chain = keyPath.split(".");
    const firstKey = chain.shift();
    const shiftedKeyPath = chain.join(".");
    if (firstKey) {
      this[firstKey].setValueForKeyPath(shiftedKeyPath, value);
    }
  }
});
Object.defineProperty(Object.prototype, "getValueForKey", {
  value: function(key) {
    return this[key];
  }
});
Object.defineProperty(Object.prototype, "getValueForKeyPath", {
  value: function(keyPath) {
    if (keyPath == null)
      return;
    if (keyPath.indexOf(".") === -1) {
      return this.getValueForKey(keyPath);
    }
    var chain = keyPath.split(".");
    var firstKey = chain.shift();
    var shiftedKeyPath = chain.join(".");
    if (firstKey) {
      return this[firstKey].getValueForKeyPath(shiftedKeyPath);
    }
  }
});
function setup(element, setupState = void 0) {
  const instance = new Instance(Origin.SETUP, element, element, void 0, [], [], () => {
    return setupState;
  }, setupState == null ? void 0 : setupState.onMounted, setupState == null ? void 0 : setupState.beforeUnmounted, setupState == null ? void 0 : setupState.onUnmounted, setupState == null ? void 0 : setupState.beforeDestroyed, setupState == null ? void 0 : setupState.onDestroyed, setupState == null ? void 0 : setupState.components);
  instance.mount();
  console.log(instance);
  return instance.internalState;
}
function state(value) {
  return new MutableState(value);
}
function watch(watcher, ...states) {
  const watcherLink2 = new WatcherLink(watcher, ...states);
  for (const state2 of states) {
    state2.subscribe(watcherLink2);
  }
}
function computed(computer, ...states) {
  const computedValue = new ComputedState(computer, states);
  for (const state2 of states) {
    state2 == null ? void 0 : state2.subscribe(computedValue);
  }
  return computedValue;
}
function templateToElement(templateCode) {
  const template = document.createElement("template");
  templateCode = templateCode.trim();
  template.innerHTML = templateCode;
  return template.content.firstChild;
}
function component(componentData) {
  const name = componentData.name.toUpperCase();
  const element = typeof componentData.template === "string" ? templateToElement(componentData.template) : componentData.template;
  return new Component(name, element, componentData.props, componentData.slots, componentData.setup, componentData.onMounted, componentData.beforeUnmounted, componentData.onUnmounted, componentData.beforeDestroyed, componentData.onDestroyed, componentData.css);
}
function eventHub() {
  return EventHub;
}
function store() {
  return Store.value;
}
function withOptions(options) {
  setAppOptions(options);
}
var Elaine = {
  setup,
  state,
  watch,
  computed,
  component,
  eventHub,
  store,
  withOptions
};
export { component, computed, Elaine as default, eventHub, setup, state, store, templateToElement, watch, withOptions };
