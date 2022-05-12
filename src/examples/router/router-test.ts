import { createRouter, setup } from "../../../lib/Elaine";
import About from "./About";
import Carousel from "./Carousel";
import Home from "./Home";

const { router, routerComponent } = createRouter([
    {
        path: '/',
        component: Home
    },
    {
        path: "/about",
        component: About
    },
    {
        path: "/carousel",
        component: Carousel
    }
]);

setup(document.getElementById("app")!, {
    state: {
        toHome: () => {
            router.changeRoute("/")
        }
    },
    components: [routerComponent]
});