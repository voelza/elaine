export const BINDING: string = "@@";
export const EVENT_LISTENER_BINDING: string = "++";
export const TEMPLATE_PARENT_CALL: string = "~";
export const EVENT_LISTENER_PARENT_CALL_ID: string = "!++";
export const REACTIVE_CONCAT = "##";
export const TEXT_BINDER = (binding: string) => new RegExp(BINDING + "\{" + binding.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\}", "g");
export const ATTRIBUTE_BINDER = (binding: string) => new RegExp(BINDING + binding.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g");
export const ATTRIBUTE_ELEMENT_STATE_BINDING = new RegExp(BINDING + "([!]?[a-zA-Z0-9\\(@@\\)_$\.,\\s~\\|']+)", "g");
export const TEXT_STATE_BINDING = new RegExp(BINDING + "\\{([!]?[a-zA-Z0-9\\(@@\\)_$\.,\\s~\\|'\"]+)\\}", "g");
export const TEXT_CONDITIONAL_STATE_BINDING = new RegExp(BINDING + "\\{(\\{.+\\})\\}", "g");
export const LOOP_BINDING = new RegExp("(.+) in (.+)", "g");
export const OBJECT_FUNCTION_CALL = "|";