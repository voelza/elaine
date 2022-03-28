export default interface StateLink {
    init(): void;
    update(): void;
    destroy(): void;
}