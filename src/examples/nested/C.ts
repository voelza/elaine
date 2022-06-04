import { component } from "../../../lib/Elaine";
import D from "./D";

export default component({
    name: "C",
    template: `
    <div>
        C
        <D @@for="d in @@ds"></D>
    </div>`,
    css: `div {color: blue;}`,
    setup: () => {
        return {
            state: {
                ds: [1, 2]
            }
        }
    },
    components: [D]
})