/**
 * Single place for every constant used by the MapLibre map view.
 */
export class MaplibreMapDefaults {
    // Map sources and layers
    static SOURCE_ID = "records";
    static CLUSTER_LAYER_ID = "records-clusters";
    static CLUSTER_COUNT_LAYER_ID = "records-cluster-count";
    static POINT_LAYER_ID = "records-points";

    // View attributes (can be overridden in the arch)
    static DEFAULT_ZOOM = 7;
    static MAX_ZOOM = 19;
    static RECORD_LIMIT = 5000;
    static PITCH = 45;
    static MAX_PITCH = 60;
    // Below this zoom the map is kept flat, a tilted map would show empty borders.
    static MIN_ZOOM_FOR_PITCH = 5;

    // Viewport
    static WORLD_BOUNDS = [
        [-180, -60],
        [180, 80],
    ];
    static FIT_PADDING = 60;
    static FIT_MAX_ZOOM = 16;

    // Clustering
    static CLUSTER_MAX_ZOOM = 14;
    static CLUSTER_RADIUS = 50;
    static CLUSTER_STYLE_STEPS = [
        {fromCount: 0, color: "#51bbd6", radius: 16},
        {fromCount: 20, color: "#f1f075", radius: 22},
        {fromCount: 100, color: "#f28cb1", radius: 28},
    ];
    static CLUSTER_LABEL_FONT = ["Noto Sans Regular"];
    static CLUSTER_LABEL_SIZE = 12;

    // Single points
    static POINT_COLOR = "#714b67";
    static POINT_RADIUS = 8;
    static STROKE_COLOR = "#ffffff";
    static STROKE_WIDTH = 2;

    // Popup
    static POPUP_OFFSET = 12;
}
