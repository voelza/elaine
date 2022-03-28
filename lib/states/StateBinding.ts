import State from "./State"

export type StateBinding = {
    binding: string,
    stateName: string,
    stateSubPath: string
    state?: State<any>
}