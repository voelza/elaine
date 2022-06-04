import { state, setup } from "../../../../lib/Elaine";


const counter = state(0);
const increaseCounter = () => {
    counter.value++;
};

setup(document.getElementById("app")!, {
    state: {
        counter, increaseCounter
    }
});