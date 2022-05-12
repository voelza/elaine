import Component from "./Component";
import { component, computed, state, templateToElement, watch } from "./Elaine";
import Instance from "./Instance";
import ComputedState from "./states/ComputedState";
import State from "./states/State";

export type Route = {
    path: string,
    component: Component
};

export class Router {
    private routes: Route[];
    private currentPath: State<string>;
    currentView: ComputedState<Component>;

    constructor(routes: Route[], NotFound: Component) {
        this.routes = routes;

        this.currentPath = state(window.location.hash);

        this.currentView = computed(() => {
            const path = this.currentPath.value.slice(1) || '/';
            return this.routes.find(route => route.path === path)?.component || NotFound;
        }, this.currentPath);
        window.addEventListener('hashchange', () => {
            this.currentPath.value = window.location.hash;
        });
    }

    changeRoute(route: string) {
        window.location.hash = route;
    }
}

export type RouterResult = {
    router: Router,
    routerComponent: Component
}

export function router(routes: Route[], NotFound: Component | undefined = undefined): RouterResult {
    if (!NotFound) {
        NotFound = component({
            name: "DefaultNotFound",
            template: "<div>Route not found.</div>"
        });
    }
    const router = new Router(routes, NotFound);
    return {
        router,
        routerComponent: component({
            name: "router-view",
            template: "<!-- router -->",
            setup: (setupState) => {
                let currentInstance: Instance | undefined;
                function changeRoute() {
                    currentInstance?.unmount();
                    currentInstance?.destroy();

                    const currentViewComponent = router.currentView.value;
                    currentInstance = currentViewComponent.toInstance(templateToElement(`<${currentViewComponent.name}></${currentViewComponent.name}>`));
                    currentInstance.appendMount(setupState.element as Node as Comment);
                }
                watch(changeRoute, router.currentView);

                changeRoute();
                return {
                    state: {
                        currentInstance
                    },
                    components: routes.map(route => route.component).concat([NotFound!])
                }
            },
            beforeDestroyed: (state) => {
                state.data.currentInstance?.destroy();
            }
        })
    };
}