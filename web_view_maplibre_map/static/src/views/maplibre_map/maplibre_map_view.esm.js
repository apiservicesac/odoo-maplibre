import {MapController} from "./maplibre_map_controller.esm";
import {MapRenderer} from "./maplibre_map_renderer.esm";
import {registry} from "@web/core/registry";

function normalizeArch(arch) {
    if (arch && typeof arch !== "string") return arch;
    const doc = new DOMParser().parseFromString(String(arch || ""), "text/xml");
    return doc.documentElement;
}

export const maplibreMapView = {
    type: "maplibre_map",
    display_name: "MapLibre Map",
    icon: "fa fa-map-o",
    multiRecord: true,
    Controller: MapController,
    Renderer: MapRenderer,
    searchMenuTypes: ["filter", "favorite"],

    props: (genericProps) => ({
        ...genericProps,
        Renderer: MapRenderer,
        archInfo: {
            ...genericProps.archInfo,
            arch: normalizeArch(genericProps.arch),
        },
    }),
};

registry.category("views").add("maplibre_map", maplibreMapView);
