import { component, state, setup } from "../../../lib/Elaine";

const modal = component({
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
    setup: (stupState) => {
        const modal = stupState.element;
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

        stupState.addGlobalEventListener(`openmodal${stupState.data.modalid.value}`, open);

        backdrop.addEventListener("click", close);

        return {
            state: {
                close,
                backdrop
            },
            onMounted: (mountState) => {
                const modal = mountState.element;
                modal.parentNode?.removeChild(modal);
            }
        };
    }
});


const TheCarousel = component({
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
            <div class="display-image-container">
                <img @@src="@@image1.src" @@alt="@@image1.alt"  class="display-image" @@style="opacity: @@opacity1##;" />
                <img @@src="@@image2.src" @@alt="@@image2.alt"  class="display-image" @@style="opacity: @@opacity2##;"/>
            </div>
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

        .image-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
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

        .display-image-container {
            position:relative;
            width: 810px;
            height: 480px;
        }

        .display-image {
            position:absolute;
            left:0;
            width: 800px;
            max-width: 85vw;
            border: 3px solid white;
            border-radius: 2.5px;
            box-shadow: 5px 5px 5px lightgray;
            transition: opacity 1s ease-in-out;
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
            margin-top: -20px;
        }
    `,
    props: [
        {
            name: "images",
            type: Array
        }
    ],
    setup: (setupState) => {
        const getPreviousIndex = (index) => {
            let i = index;
            i--;
            if (i < 0) {
                i = setupState.data.images.value.length - 1;
            }
            return i;
        }

        const getNextIndex = (index) => {
            let i = index;
            i++;
            if (i === setupState.data.images.value.length) {
                i = 0;
            }
            return i;
        }

        let currentIndex = 0;
        const selectedImage = state(setupState.data.images.value[currentIndex]);

        const image1 = state(selectedImage.value);
        const opacity1 = state(0);
        const image2 = state(setupState.data.images.value[getNextIndex(currentIndex)]);
        const opacity2 = state(0);

        const swapImages = (imgFromBefore) => {
            if (image1.value === imgFromBefore) {
                image2.value = selectedImage.value;
                opacity1.value = 0;
                opacity2.value = 1;
            } else {
                image1.value = selectedImage.value;
                opacity1.value = 1;
                opacity2.value = 0;
            }
        }


        swapImages(selectedImage.value);

        const prevImage = () => {
            const imgFromBefore = selectedImage.value;

            currentIndex = getPreviousIndex(currentIndex);
            selectedImage.value = setupState.data.images.value[currentIndex];

            swapImages(imgFromBefore);
        };

        const nextImage = () => {
            const imgFromBefore = selectedImage.value;

            currentIndex = getNextIndex(currentIndex);
            selectedImage.value = setupState.data.images.value[currentIndex];

            swapImages(imgFromBefore);
        };

        const setSelected = (image, index) => {
            const imgFromBefore = selectedImage.value;

            currentIndex = index;
            selectedImage.value = image;

            swapImages(imgFromBefore);
        }

        const interval = setInterval(nextImage, 5000);
        return {
            state: {
                selectedImage,
                prevImage,
                nextImage,
                setSelected,
                image1,
                image2,
                opacity1,
                opacity2
            },
            onUnmounted: () => {
                console.log("destroy");
                clearInterval(interval);
            }
        }
    }
});

const app = component({
    name: "app",
    template: `
    <div>
        <button ++click="openModal">Open the Modal</button>

        <modal title="This is a modal!" modalid="@@modalid">
            <header>
                Yo yo yo yo
            </header>
            <content>
                <TheCarousel images="@@images" class="carousel"></TheCarousel>
            </content>
        </modal>

        <button ++click="openDifferentModal">Open the Differnt Modal</button>

        <modal title="This is a different modal!" modalid="@@modalid2">
            <content>
                This is a different modal!
            </content>
        </modal>

        <TheCarousel images="@@images" class="carousel"></TheCarousel>
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
    setup: (setupState) => {

        const modalid = "carouselModal";
        const openModal = () => {
            setupState.dispatchGlobalEvent(`openmodal${modalid}`);
        };

        const modalid2 = "modalid2";
        const openDifferentModal = () => {
            setupState.dispatchGlobalEvent(`openmodal${modalid2}`);
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
            }
        }
    },
    components: [modal, TheCarousel]
});


setup(document.getElementById("app"), {
    state: {},
    components: [app]
});