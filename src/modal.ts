import Elaine from "../lib/Elaine";
import { InstanceState } from "../lib/PublicTypes";

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
    props: ["title"],
    slots: ["content", "header"],
    setup: (state: InstanceState) => {
        const modal: Element = state.element;
        modal.setAttribute("style", "position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 1000;");

        const backdrop = document.createElement("div");
        backdrop.setAttribute("style", "position: fixed; left: 0; top: 0; z-index: 999; width: 100vw; height: 100vw; background-color: #80808075;");

        const close = () => {
            modal.parentNode?.removeChild(modal);
            if (backdrop.parentNode)
                backdrop.parentNode.removeChild(backdrop);
            console.log("close");
        };

        const open = () => {
            document.body.appendChild(backdrop);
            document.body.appendChild(modal);
            console.log("open");
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