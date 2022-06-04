import Instance, { Origin } from "./Instance";
import { InstanceState, Prop, SetupState } from "./PublicTypes";

export const COMPONENT_CSS_SCOPE = "data-elaine-c-";

export default class Component {
    name: string;
    private template: Element;
    private props: Prop<any>[] = [];
    slots: string[] = [];
    private setup: ((state: InstanceState) => SetupState | void) | undefined;
    css: string | undefined;
    components: Component[] | undefined;

    constructor(
        name: string,
        element: Element,
        props: Prop<any>[] = [],
        slots: string[] = [],
        setup: ((state: InstanceState) => SetupState | void) | undefined = undefined,
        css: string | undefined = undefined,
        components: Component[] | undefined) {
        this.name = name;
        this.template = element.cloneNode(true) as Element;
        this.props = props;
        this.slots = slots;
        this.setup = setup;
        this.components = components;

        if (css) {
            const componentDataAttribute = COMPONENT_CSS_SCOPE + name.toLowerCase();
            this.css = css.replaceAll(/.*\{/g, (p) => {
                const selector = p.substring(0, p.length - 1).trim();
                return `${selector}[${componentDataAttribute}] {`
            }).replace((/  |\r\n|\n|\r/gm), "");
            this.addAttributeToAllElements(this.template, componentDataAttribute);
        }
    }

    private addAttributeToAllElements(element: Element, attribute: string): void {
        element.setAttribute(attribute, "");
        if (element.children.length > 0) {
            for (const child of Array.from(element.children)) {
                this.addAttributeToAllElements(child, attribute);
            }
        }
    }

    gatherAllComponents(): Component[] {
        if (!this.components) {
            return [this];
        }
        const components: Component[] = [this];
        for (const c of this.components) {
            for (const cc of c.gatherAllComponents()) {
                components.push(cc);
            }
        }
        return components;
    }

    toInstance(element: Element, parent: Instance | undefined = undefined): Instance {
        return new Instance(
            Origin.COMPONENT,
            element,
            this.template,
            parent,
            this.props,
            this.slots,
            this.setup,
            this.components
        );
    }
}