import Elaine from "../../../../lib/Elaine";
import { cells, evalCell } from "./store";

export default Elaine.component({
    name: "cell",
    template: `
    <div class="cell" @@title="@@getCell(@@c,@@r)" ++click="setEditing">
      <input
        @@if="@@editing"
        @@value="@@getCell(@@c,@@r)"
        ++change="update"
        ++blur="update"
      >
      <span @@if="!@@editing">@@{evalC(@@cells, @@c, @@r)}</span>
    </div>
    `,
    props: [
        {
            name: "c",
            type: Number
        },
        {
            name: "r",
            type: "Number"
        }
    ],
    setup: (state) => {
        const editing = Elaine.state(false);

        function setEditing() {
            editing.value = true;
        }

        function update(e: any) {
            editing.value = false
            cells.value[state.data.c.value][state.data.r.value] = e.target.value.trim()
            cells.notify();
        }

        function getCell(c: number, r: number) {
            return cells.value[c][r];
        }

        function evalC(cells: any, c: number, r: number) {
            console.log(cells, c + " " + r);
            return evalCell(cells[c][r]);
        }

        return {
            state: {
                evalC,
                cells,
                editing,
                evalCell,
                update,
                getCell,
                setEditing
            }
        }
    },
})