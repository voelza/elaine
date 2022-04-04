import Elaine from "../../../../lib/Elaine";
import State from "../../../../lib/states/State";


const history: State<any> = Elaine.state([[]])
const index: State<any> = Elaine.state(0)
const circles: State<any> = Elaine.state([])
const selected: State<any> = Elaine.state(null)
const adjusting: State<any> = Elaine.state(false)

// @ts-ignore: Unreachable code error
function onClick({ clientX: x, clientY: y }) {
    if (adjusting.value) {
        adjusting.value = false
        selected.value = null
        push()
        return
    }
    // @ts-ignore: Unreachable code error
    selected.value = circles.value.find(({ cx, cy, r }) => {
        const dx = cx - x
        const dy = cy - y
        return Math.sqrt(dx * dx + dy * dy) <= r
    })

    if (!selected.value) {
        circles.value.push({
            cx: x,
            cy: y,
            r: 50
        })
        push()
        circles.notify();
    }
}

function adjust(circle: any, e: any) {
    e.preventDefault();
    selected.value = circle
    adjusting.value = true
}

function push() {
    history.value.length = ++index.value
    history.value.push(clone(circles.value))
}

function undo() {
    circles.value = clone(history.value[--index.value])
}

function redo() {
    circles.value = clone(history.value[++index.value])
}

function clone(circles: any) {
    return circles.map((c: any) => ({ ...c }))
}

function setSelected(circle: any) {
    selected.value = circle;
}

const isAtFirstIndex = Elaine.computed(() => index.value <= 0, index);
const isAtLastIndex = Elaine.computed(() => index.value >= history.value.length - 1, history, index);
Elaine.setup(document.getElementById("app")!,
    {
        state: {
            setSelected,
            isAtFirstIndex,
            isAtLastIndex,
            history,
            index,
            circles,
            selected,
            adjusting,
            onClick,
            adjust,
            undo,
            redo
        }
    });