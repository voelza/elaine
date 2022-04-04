import Elaine from "../../../../lib/Elaine";


const counter = Elaine.state(0);
const increaseCounter = () => {
    counter.value++;
};

Elaine.setup(document.getElementById("app")!, {
    state: {
        counter, increaseCounter
    }
});