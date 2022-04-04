import Elaine from "../../../../lib/Elaine";

const duration = Elaine.state(15 * 1000)
const durationDisplay = Elaine.computed(() => (duration.value / 1000).toFixed(1), duration);
const elapsed = Elaine.state(0);
const elapseDisplay = Elaine.computed(() => (elapsed.value / 1000).toFixed(1), elapsed);
const progress = Elaine.computed(() => elapsed.value / duration.value, elapsed, duration);

let lastTime = performance.now()
let handle: number | undefined = undefined;
const update = () => {
    const time = performance.now()
    elapsed.value += Math.min(time - lastTime, duration.value - elapsed.value)
    lastTime = time
    handle = requestAnimationFrame(update)
}

update();

const reset = () => {
    elapsed.value = 0;
}

Elaine.setup(document.getElementById("app")!, {
    state: {
        duration,
        durationDisplay,
        elapsed,
        elapseDisplay,
        progress,
        reset
    },
    onUnmounted: () => {
        cancelAnimationFrame(handle!);
    }
});