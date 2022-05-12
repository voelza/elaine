import { component } from "../../../lib/Elaine";

export default component({
    name: "Home",
    template: "<h3>Hello @@{name}! This is my home!</h3><hr/>",
    props: [
        {
            name: "name",
            type: String
        }
    ]
})