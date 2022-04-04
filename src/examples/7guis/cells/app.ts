import Elaine from "../../../../lib/Elaine";
import cell from "./cell";
import { cells } from "./store";

const cols = cells.value.map((_, i) => String.fromCharCode(65 + i));
const colsLengthAsArray = [];
for (let i = 0; i < cells.value[0].length; i++) {
    colsLengthAsArray.push(i);
}

Elaine.setup(document.getElementById("app")!, {
    state: {
        cols,
        colsLengthAsArray,
        cells
    },
    components: [cell]
});