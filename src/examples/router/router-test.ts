import { createRouter, setup } from "../../../lib/Elaine";
import About from "./About";
import Carousel from "./Carousel";
import Home from "./Home";
import NotFound from "./404";

const { router, routerComponent } = createRouter([
    {
        path: '/',
        component: Home,
        props: {
            name: "Young Garwain"
        }
    },
    {
        path: "/about",
        component: About
    },
    {
        path: "/carousel",
        component: Carousel,
        props: {
            images: [
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
            ], yo: "yo"
        }
    }
],
    NotFound
);

setup(document.getElementById("app")!, {
    state: {
        toHome: () => {
            router.changeRoute("/")
        }
    },
    components: [routerComponent]
});