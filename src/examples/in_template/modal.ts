import { component } from "../../../lib/Elaine";
import { InstanceState } from "../../../lib/PublicTypes";

export default component({
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
            background-color: #efecec;
            box-shadow: 15px 15px 15px #999393;
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
            overflow: auto;
            max-width: 95vw;
            padding: 5px;
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
                open
            },
            onMounted: (state: InstanceState) => {
                const modal = state.element;
                modal.parentNode?.removeChild(modal);
            }
        };
    },
});