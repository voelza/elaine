import ELAINE from "../../../lib/Elaine";

const modal = ELAINE.component({
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
    props: [
        {
            name: "title",
            type: String
        },
        {
            name: "modalid",
            type: String
        }
    ],
    slots: ["content", "header"],
    setup: (state) => {
        const modal = state.element;
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

        state.addGlobalEventListener(`openmodal${state.data.modalid.value}`, open);

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                backdrop
            }
        };
    },
    onMounted: (state) => {
        const modal = state.element;
        modal.parentNode?.removeChild(modal);

    }
});


const TheCarousel = ELAINE.component({
    name: "TheCarousel",
    template: `
    <div class="carousal">
        <div ++click="prevImage" class="btn prev-btn">&lang;</div>
        <div class="image-container">
            <div class="image-previews">
                <img 
                    @@for="img in @@images" 
                    @@src="@@img.src" 
                    @@alt="@@img.alt" 
                    class="preview-image" 
                    @@class="{@@selectedImage === @@img : selected}"
                    ++click="setSelected(@@img, @@_index)"
                    />
            </div>
            <img @@src="@@selectedImage.src" @@alt="@@selectedImage.alt"  class="display-image" />
            <p>@@{selectedImage.caption}</p>
        </div>
        <div ++click="nextImage" class="btn next-btn">&rang;</div>
    </div>
    `,
    css: `
        .carousal {
            display: flex;
            flex-direction: row;
            align-items: center;    
            gap: 10px;
        }

        .image-previews {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 5px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .preview-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 2.5px;
            border: 3px solid transparent;
            cursor: pointer;
        }

        .preview-image:hover, .preview-image.selected {
            border-color: white;
            box-shadow: 5px 5px 5px lightgray;
        }

        .display-image {
            width: 800px;
            max-width: 85vw;
            border: 3px solid white;
            border-radius: 2.5px;
            box-shadow: 5px 5px 5px lightgray;
        }

        .btn {
            height: 25px;
            cursor: pointer;
            background-color: lightgray;
            padding: 7.5px;
            font-size: 20px;
            border-radius: 5px;
        }

        .btn:hover {
            background-color: #a09e9e;
        }

        p {
            text-align: center;
            font-family: monospaced;
        }
    `,
    props: [
        {
            name: "images",
            type: Array
        }
    ],
    setup: (state) => {
        let currentIndex = 0;
        const selectedImage = ELAINE.state(state.data.images.value[currentIndex]);

        const prevImage = () => {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = state.data.images.value.length - 1;
            }
            selectedImage.value = state.data.images.value[currentIndex];
        };

        const nextImage = () => {
            currentIndex++;
            if (currentIndex === state.data.images.value.length) {
                currentIndex = 0;
            }
            selectedImage.value = state.data.images.value[currentIndex];
        };

        const setSelected = (image, index) => {
            currentIndex = index;
            selectedImage.value = image;
        }

        const interval = setInterval(nextImage, 5000);
        return {
            state: {
                selectedImage,
                prevImage,
                nextImage,
                interval,
                setSelected
            }
        }
    },
    onUnmounted: (state) => {
        console.log("destroy");
        clearInterval(state.data.interval);
    }
});

const app = ELAINE.component({
    name: "app",
    template: `
    <div>
        <button ++click="openModal">Open the Modal</button>

        <modal title="This is a modal!" modalid="@@modalid">
            <header>
                Yo yo yo yo
            </header>
            <content>
                <TheCarousel images="@@images" class="carousal"></TheCarousel>
            </content>
        </modal>

        <button ++click="openDifferentModal">Open the Differnt Modal</button>

        <modal title="This is a different modal!" modalid="@@modalid2">
            <content>
                This is a different modal!
            </content>
        </modal>

        <TheCarousel images="@@images" class="carousal"></TheCarousel>
    </div>
    `,
    css: `
        div {
            display: flex;
            flex-direction: column;
            gap: 15px;
            justify-content: center;
            align-items: center;
        }
    `,
    setup: (state) => {

        const modalid = "carouselModal";
        const openModal = () => {
            state.dispatchGlobalEvent(`openmodal${modalid}`);
        };

        const modalid2 = "modalid2";
        const openDifferentModal = () => {
            state.dispatchGlobalEvent(`openmodal${modalid2}`);
        };

        const images = [
            {
                src: "https://i.computer-bild.de/imgs/1/4/0/3/9/1/7/5/genshin-impact-alle-charaktere-b5ebcea61a7ff0d2.jpg?impolicy=full_content",
                alt: "genshin all characters",
                caption: "Genshin all characters"
            },
            {
                src: "https://images.mein-mmo.de/medien/2020/09/gen-780x438.jpg",
                alt: "genshin cute characters",
                caption: "genshin cute characters"
            },
            {
                src: "https://www.creocommunity.de/wp-content/uploads/2022/01/1643179003_Das-neue-fluechtige-Farben-Event-von-Genshin-Impact-Holen-Sie-sich.jpg",
                alt: "genshin chibis",
                caption: "genshin chibis"
            },
            {
                src: "https://c8x2z8i6.rocketcdn.me/wp-content/uploads/2021/07/genshin-impact-update-2.jpg",
                alt: "Genshin characters in japan land",
                caption: "Genshin characters in japan land"
            },
            {
                src: "https://c8x2z8i6.rocketcdn.me/wp-content/uploads/2020/09/genshin-impact-cover.jpg",
                alt: "crowded genshin picture",
                caption: "crowded genshin picture"
            },
            {
                src: "https://pbs.twimg.com/media/FBll6LvVQAQB3Qg?format=jpg&name=4096x4096",
                alt: "genshin girls",
                caption: "genshin girls"
            }
        ];

        return {
            state: {
                openModal,
                images,
                modalid,
                modalid2,
                openDifferentModal
            },
            components: [modal, TheCarousel]
        }
    }
});


ELAINE.setup(document.getElementById("app"), {
    state: {},
    components: [app]
});