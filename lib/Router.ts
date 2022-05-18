import Component from "./Component";
import { component, computed, state, templateToElement, watch } from "./Elaine";
import Instance, { Origin } from "./Instance";
import ComputedState from "./states/ComputedState";
import State from "./states/State";

export type Route = {
    path: string,
    component: Component,
    props?: any
};

export class Router {
    private routes: Route[];
    private currentPath: State<string>;
    currentRoute: ComputedState<Route>;

    constructor(routes: Route[], NotFound: Component) {
        this.routes = routes;

        this.currentPath = state(window.location.hash);

        this.currentRoute = computed(() => {
            const path = this.currentPath.value.slice(1) || '/';
            return this.routes.find(route => route.path === path) || { path: "/404", component: NotFound };
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
                const parentElement = templateToElement("<span></span>")
                const parent: Instance = new Instance(Origin.COMPONENT, parentElement, parentElement, undefined, [], [], () => {
                    const currentRouteProps = computed(() => {
                        return router.currentRoute.value.props;
                    }, router.currentRoute);
                    return {
                        state: {
                            currentRouteProps
                        }
                    }
                });
                parent.setupIfNeeded();

                let currentInstance: Instance | undefined;
                function changeRoute() {
                    currentInstance?.unmount();
                    currentInstance?.destroy();

                    const currentRoute = router.currentRoute.value;
                    const props = currentRoute.props ? Object.keys(currentRoute.props).map(k => `${k}="@@currentRouteProps.${k}"`).join(" ") : "";
                    const componentElement = templateToElement(`<${currentRoute.component.name} ${props}></${currentRoute.component.name}>`);
                    currentInstance = currentRoute.component.toInstance(componentElement, parent);
                    currentInstance.appendMount(setupState.element as Node as Comment);
                }
                watch(changeRoute, router.currentRoute);

                changeRoute();
                return {
                    state: {
                        currentInstance
                    },
                    components: routes.map(route => route.component).concat([NotFound!])
                }
            },
            onUnmounted: (state) => {
                state.data.currentInstance?.value.unmount();
            },
            beforeDestroyed: (state) => {
                state.data.currentInstance?.value.destroy();
            }
        })
    };
}