import { component } from "../../../lib/Elaine";

export default component({
    name: "about",
    template: "<div>Facts about me: ...</div>",
    setup: () => {
        console.log("Thanks for learning about me!")
    },
    onMounted: () => {
        console.log("heylo");
    }
});