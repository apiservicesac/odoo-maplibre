import {MapController} from "./maplibre_map_controller.esm";
import {MapRenderer} from "./maplibre_map_renderer.esm";
import {MaplibreMapArchParser} from "./maplibre_map_arch_parser.esm";
import {registry} from "@web/core/registry";

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
        archInfo: new MaplibreMapArchParser().parse(genericProps.arch),
    }),
};

registry.category("views").add("maplibre_map", maplibreMapView);
