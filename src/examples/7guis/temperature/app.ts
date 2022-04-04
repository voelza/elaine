import Elaine from "../../../../lib/Elaine";

const celsius = Elaine.state(0);
const fahrenheit = Elaine.state(32);
function setCelsius(event: any) {
    const val = event.target.value;
    celsius.value = (val - 32) * (5 / 9);
}

function setFahrenheit(event: any) {
    const val = event.target.value;
    fahrenheit.value = val * (9 / 5) + 32
}

Elaine.setup(document.getElementById("app")!, {
    state: {
        celsius,
        fahrenheit,
        setCelsius,
        setFahrenheit
    }
});