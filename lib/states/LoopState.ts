import ComputedState from "./ComputedState";
import MutableState from "./MutableState";
import State from "./State";


export default class LoopState extends MutableState {
    private list: State<any>;

    constructor(value: any, list: State<any>) {
        super(value);
        this.list = list;
    }

    notify(): void {
        super.notify();
        if (this.list instanceof ComputedState) {
            this.list.notifyParents();
        } else {
            this.list.notify();
        }
    }

}