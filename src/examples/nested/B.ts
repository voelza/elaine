import { component } from "../../../lib/Elaine";
import C from "./C";

export default component({
    name: "B",
    template: `
    <div>
        B
        <C></C>
    </div>`,
    css: `div {color: red;}`,
    components: [C]
})