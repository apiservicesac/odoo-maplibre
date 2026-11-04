import {
    Component,
    onMounted,
    onWillStart,
    onWillUnmount,
    onWillUpdateProps,
    useRef,
    useState,
} from "@odoo/owl";
import {MaplibreMapDefaults} from "./maplibre_map_defaults.esm";
import {_t} from "@web/core/l10n/translation";
import {session} from "@web/session";
import {useService} from "@web/core/utils/hooks";

/* global maplibregl */

export class MapRenderer extends Component {
    static template = "web_view_maplibre_map.MapRenderer";
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.mapContainerRef = useRef("mapContainer");
        this.state = useState({errorMessage: ""});

        this.viewConfig = this.props.archInfo;
        this.resModel = this.props.resModel;
        this.map = null;
        this.activePopup = null;
        this.records = [];

        onWillStart(async () => {
            this.initialCenter = await this.orm.call(
                "res.users",
                "get_default_maplibre_position",
                [this.resModel]
            );
            await this.loadRecords(this.props.domain);
        });
        onMounted(() => this.initMap());
        onWillUpdateProps(async (nextProps) => {
            if (this.hasDomainChanged(nextProps.domain)) {
                await this.loadRecords(nextProps.domain);
                this.refreshData();
            }
        });
        onWillUnmount(() => this.destroyMap());
    }

    static isWebGLSupported() {
        try {
            const canvas = document.createElement("canvas");
            return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
        } catch {
            return false;
        }
    }

    get styleUrl() {
        const styleUrl = session["maplibre.style_url"] || "";
        const apiKey = encodeURIComponent(session["maplibre.api_key"] || "");
        return styleUrl.replace("{key}", apiKey);
    }

    get fieldNames() {
        const {fieldLatitude, fieldLongitude, fieldTitle, fieldAddress} =
            this.viewConfig;
        return [
            ...new Set(
                ["id", "display_name", fieldLatitude, fieldLongitude]
                    .concat(fieldTitle, fieldAddress)
                    .filter(Boolean)
            ),
        ];
    }

    hasDomainChanged(nextDomain) {
        return (
            JSON.stringify(this.props.domain || []) !== JSON.stringify(nextDomain || [])
        );
    }

    async loadRecords(domain) {
        try {
            this.records = await this.orm.searchRead(
                this.resModel,
                domain || [],
                this.fieldNames,
                {limit: this.viewConfig.recordLimit, context: this.props.context || {}}
            );
        } catch (error) {
            console.error("MapLibre view: error loading records", error);
            this.records = [];
        }
    }

    /**
     * @returns {Object} GeoJSON FeatureCollection with the records that have
     * valid coordinates
     */
    buildGeoJson() {
        const {fieldLatitude, fieldLongitude, fieldTitle, fieldAddress} =
            this.viewConfig;
        const features = [];
        for (const record of this.records) {
            const latitude = Number(record[fieldLatitude]);
            const longitude = Number(record[fieldLongitude]);
            const hasCoordinates = Boolean(latitude || longitude);
            if (!hasCoordinates || Number.isNaN(latitude) || Number.isNaN(longitude)) {
                continue;
            }
            features.push({
                type: "Feature",
                geometry: {type: "Point", coordinates: [longitude, latitude]},
                properties: {
                    id: record.id,
                    title: record[fieldTitle] || record.display_name || "",
                    address: record[fieldAddress] || "",
                },
            });
        }
        return {type: "FeatureCollection", features};
    }

    initMap() {
        if (typeof maplibregl === "undefined" || !MapRenderer.isWebGLSupported()) {
            this.state.errorMessage = _t(
                "This map needs WebGL, which is not available in this browser. Use the Leaflet map view instead."
            );
            return;
        }
        if (!this.styleUrl) {
            this.state.errorMessage = _t(
                "No map style configured (system parameter maplibre.style_url)."
            );
            return;
        }
        this.map = new maplibregl.Map({
            container: this.mapContainerRef.el,
            style: this.styleUrl,
            center: [this.initialCenter?.lng || 0, this.initialCenter?.lat || 0],
            zoom: this.viewConfig.defaultZoom,
            maxZoom: this.viewConfig.maxZoom,
            maxPitch: MaplibreMapDefaults.MAX_PITCH,
        });
        this.map.addControl(
            new maplibregl.NavigationControl({visualizePitch: true}),
            "top-right"
        );
        this.map.addControl(new maplibregl.FullscreenControl(), "top-right");
        this.map.on("error", (event) => console.warn("MapLibre:", event.error));
        this.map.on("load", () => {
            this.addRecordsSource();
            this.addClusterLayers();
            this.addPointLayer();
            this.registerInteractions();
            this.refreshData();
        });
    }

    destroyMap() {
        this.map?.remove();
        this.map = null;
    }

    addRecordsSource() {
        this.map.addSource(MaplibreMapDefaults.SOURCE_ID, {
            type: "geojson",
            data: this.buildGeoJson(),
            cluster: true,
            clusterMaxZoom: MaplibreMapDefaults.CLUSTER_MAX_ZOOM,
            clusterRadius: MaplibreMapDefaults.CLUSTER_RADIUS,
        });
    }

    addClusterLayers() {
        const pointCount = ["get", "point_count"];
        const stepExpression = (property) => {
            const [firstStep, ...otherSteps] = MaplibreMapDefaults.CLUSTER_STYLE_STEPS;
            return [
                "step",
                pointCount,
                firstStep[property],
                ...otherSteps.flatMap((step) => [step.fromCount, step[property]]),
            ];
        };
        this.map.addLayer({
            id: MaplibreMapDefaults.CLUSTER_LAYER_ID,
            type: "circle",
            source: MaplibreMapDefaults.SOURCE_ID,
            filter: ["has", "point_count"],
            paint: {
                "circle-color": stepExpression("color"),
                "circle-radius": stepExpression("radius"),
                "circle-stroke-width": MaplibreMapDefaults.STROKE_WIDTH,
                "circle-stroke-color": MaplibreMapDefaults.STROKE_COLOR,
            },
        });
        // Labels need glyphs, which are provided by the style.
        if (this.map.getStyle().glyphs) {
            this.map.addLayer({
                id: MaplibreMapDefaults.CLUSTER_COUNT_LAYER_ID,
                type: "symbol",
                source: MaplibreMapDefaults.SOURCE_ID,
                filter: ["has", "point_count"],
                layout: {
                    "text-field": ["get", "point_count_abbreviated"],
                    "text-size": MaplibreMapDefaults.CLUSTER_LABEL_SIZE,
                    "text-font": MaplibreMapDefaults.CLUSTER_LABEL_FONT,
                },
            });
        }
    }

    addPointLayer() {
        this.map.addLayer({
            id: MaplibreMapDefaults.POINT_LAYER_ID,
            type: "circle",
            source: MaplibreMapDefaults.SOURCE_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": MaplibreMapDefaults.POINT_COLOR,
                "circle-radius": MaplibreMapDefaults.POINT_RADIUS,
                "circle-stroke-width": MaplibreMapDefaults.STROKE_WIDTH,
                "circle-stroke-color": MaplibreMapDefaults.STROKE_COLOR,
            },
        });
    }

    registerInteractions() {
        const clusterLayerId = MaplibreMapDefaults.CLUSTER_LAYER_ID;
        const pointLayerId = MaplibreMapDefaults.POINT_LAYER_ID;
        this.map.on("click", clusterLayerId, (event) =>
            this.zoomIntoCluster(event.features[0])
        );
        this.map.on("click", pointLayerId, (event) =>
            this.showPopup(event.features[0])
        );
        for (const layerId of [clusterLayerId, pointLayerId]) {
            this.map.on("mouseenter", layerId, () => this.setCursor("pointer"));
            this.map.on("mouseleave", layerId, () => this.setCursor(""));
        }
    }

    setCursor(cursor) {
        this.map.getCanvas().style.cursor = cursor;
    }

    async zoomIntoCluster(clusterFeature) {
        const zoom = await this.map
            .getSource(MaplibreMapDefaults.SOURCE_ID)
            .getClusterExpansionZoom(clusterFeature.properties.cluster_id);
        this.map.easeTo({center: clusterFeature.geometry.coordinates, zoom});
    }

    /**
     * The popup is built with DOM nodes (textContent), so record data is
     * never interpreted as HTML.
     */
    buildPopupContent({id, title, address}) {
        const container = document.createElement("div");
        container.className = "o_maplibre_popup";
        const titleElement = document.createElement("b");
        titleElement.textContent = title;
        container.appendChild(titleElement);
        if (address) {
            container.appendChild(document.createElement("br"));
            container.appendChild(document.createTextNode(address));
        }
        container.addEventListener("click", () => this.openRecord(id));
        return container;
    }

    showPopup(pointFeature) {
        this.closePopup();
        this.activePopup = new maplibregl.Popup({
            closeButton: false,
            offset: MaplibreMapDefaults.POPUP_OFFSET,
        })
            .setLngLat(pointFeature.geometry.coordinates)
            .setDOMContent(this.buildPopupContent(pointFeature.properties))
            .addTo(this.map);
    }

    closePopup() {
        this.activePopup?.remove();
        this.activePopup = null;
    }

    /**
     * Refresh the data and the viewport: fit the records when there are some,
     * otherwise show the whole world.
     */
    refreshData() {
        const source = this.map?.getSource(MaplibreMapDefaults.SOURCE_ID);
        if (!source) {
            return;
        }
        this.closePopup();
        const geoJson = this.buildGeoJson();
        source.setData(geoJson);
        this.fitViewport(geoJson.features);
    }

    fitViewport(features) {
        if (!features.length) {
            this.fitBounds(MaplibreMapDefaults.WORLD_BOUNDS, {padding: 0}, 0);
            return;
        }
        const bounds = new maplibregl.LngLatBounds();
        for (const feature of features) {
            bounds.extend(feature.geometry.coordinates);
        }
        const options = {
            padding: MaplibreMapDefaults.FIT_PADDING,
            maxZoom: MaplibreMapDefaults.FIT_MAX_ZOOM,
        };
        const flatCamera = this.map.cameraForBounds(bounds, options);
        const isCloseEnoughToTilt =
            flatCamera.zoom >= MaplibreMapDefaults.MIN_ZOOM_FOR_PITCH;
        this.fitBounds(
            bounds,
            options,
            isCloseEnoughToTilt ? this.viewConfig.pitch : 0
        );
    }

    /**
     * Moves the camera so that the bounds are visible with the given tilt.
     */
    fitBounds(bounds, options, pitch) {
        const camera = this.map.cameraForBounds(bounds, {...options, pitch});
        this.map.jumpTo({...camera, pitch, bearing: 0});
    }

    openRecord(resId) {
        this.action.doAction({
            type: "ir.actions.act_window",
            res_model: this.resModel,
            res_id: resId,
            views: [[false, "form"]],
            target: "current",
        });
    }
}
