import { component } from "../../../lib/Elaine";
import B from "./B";

export default component({
    name: "A",
    template: `
    <div>
        A
        <B @@for="b in @@bs"></B>
    </div>`,
    css: `div {color: green;}`,
    setup: () => {
        return {
            state: {
                bs: [1, 1, 1, 1]
            }
        }
    },
    components: [B]
})