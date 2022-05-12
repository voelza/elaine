import { component, state } from "../../../lib/Elaine";

export default component({
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
        const getPreviousIndex = (index: number) => {
            let i = index;
            i--;
            if (i < 0) {
                i = setupState.data.images.value.length - 1;
            }
            return i;
        }

        const getNextIndex = (index: number) => {
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

        const swapImages = (imgFromBefore: string) => {
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

        const setSelected = (image: string, index: number) => {
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
                opacity2,
                interval
            }
        }
    },
    onUnmounted: (state) => {
        console.log("destroy");
        clearInterval(state.data.interval);
    }
});