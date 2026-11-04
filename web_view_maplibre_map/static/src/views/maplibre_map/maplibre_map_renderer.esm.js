import {
    Component,
    onMounted,
    onWillStart,
    onWillUnmount,
    onWillUpdateProps,
    useRef,
    useState,
} from "@odoo/owl";
import {_t} from "@web/core/l10n/translation";
import {session} from "@web/session";
import {useService} from "@web/core/utils/hooks";

/* global maplibregl */

const SOURCE = "records";
const LAYER_CLUSTERS = "records-clusters";
const LAYER_COUNT = "records-cluster-count";
const LAYER_POINTS = "records-points";

function hasWebGL() {
    try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
        return false;
    }
}

export class MapRenderer extends Component {
    static template = "web_view_maplibre_map.MapRenderer";
    static props = ["*"];

    setup() {
        this.orm = useService("orm");
        this.action = useService("action");
        this.mapRef = useRef("mapContainer");
        this.state = useState({error: ""});

        const attrs = this.props.archInfo.arch.attributes;
        const attr = (name) => attrs.getNamedItem(name)?.value;

        this.resModel = this.props.resModel;
        this.defaultZoom = parseFloat(attr("default_zoom")) || 7;
        this.maxZoom = parseFloat(attr("max_zoom")) || 19;
        this.recordLimit = parseInt(attr("limit"), 10) || 5000;
        this.fieldLatitude = attr("field_latitude");
        this.fieldLongitude = attr("field_longitude");
        this.fieldTitle = attr("field_title");
        this.fieldAddress = attr("field_address");

        this.map = null;
        this.records = [];

        onWillStart(async () => {
            this.defaultCenter = await this.orm.call(
                "res.users",
                "get_default_maplibre_position",
                [this.resModel]
            );
            await this.loadRecords(this.props.domain);
        });
        onMounted(() => this.initMap());
        onWillUpdateProps(async (nextProps) => {
            if (
                JSON.stringify(this.props.domain || []) !==
                JSON.stringify(nextProps.domain || [])
            ) {
                await this.loadRecords(nextProps.domain);
                this.updateData();
            }
        });
        onWillUnmount(() => {
            this.map?.remove();
            this.map = null;
        });
    }

    get styleUrl() {
        const url = session["maplibre.style_url"] || "";
        return url.replace("{key}", encodeURIComponent(session["maplibre.api_key"] || ""));
    }

    getFields() {
        const fields = new Set(["id", "display_name"]);
        for (const name of [
            this.fieldLatitude,
            this.fieldLongitude,
            this.fieldTitle,
            this.fieldAddress,
        ]) {
            if (name) fields.add(name);
        }
        return [...fields];
    }

    async loadRecords(domain) {
        try {
            this.records = await this.orm.searchRead(
                this.resModel,
                domain || [],
                this.getFields(),
                {limit: this.recordLimit, context: this.props.context || {}}
            );
        } catch (error) {
            console.error("MapLibre view: error loading records", error);
            this.records = [];
        }
    }

    /**
     * GeoJSON FeatureCollection of the records that have valid coordinates.
     */
    toGeoJSON() {
        const features = [];
        for (const rec of this.records) {
            const lat = Number(rec[this.fieldLatitude]);
            const lng = Number(rec[this.fieldLongitude]);
            if (!lat && !lng) continue;
            if (Number.isNaN(lat) || Number.isNaN(lng)) continue;
            features.push({
                type: "Feature",
                geometry: {type: "Point", coordinates: [lng, lat]},
                properties: {
                    id: rec.id,
                    title: rec[this.fieldTitle] || rec.display_name || "",
                    address: rec[this.fieldAddress] || "",
                },
            });
        }
        return {type: "FeatureCollection", features};
    }

    initMap() {
        if (typeof maplibregl === "undefined" || !hasWebGL()) {
            this.state.error = _t(
                "This map needs WebGL, which is not available in this browser. " +
                    "Use the Leaflet map view instead."
            );
            return;
        }
        if (!this.styleUrl) {
            this.state.error = _t(
                "No map style configured (system parameter maplibre.style_url)."
            );
            return;
        }
        const center = [
            this.defaultCenter?.lng || 0,
            this.defaultCenter?.lat || 0,
        ];
        this.map = new maplibregl.Map({
            container: this.mapRef.el,
            style: this.styleUrl,
            center,
            zoom: this.defaultZoom,
            maxZoom: this.maxZoom,
        });
        this.map.addControl(new maplibregl.NavigationControl(), "top-right");
        this.map.addControl(new maplibregl.FullscreenControl(), "top-right");
        this.map.on("error", (ev) => console.warn("MapLibre:", ev.error));
        this.map.on("load", () => {
            this.addLayers();
            this.updateData(true);
        });
    }

    addLayers() {
        const map = this.map;
        map.addSource(SOURCE, {
            type: "geojson",
            data: this.toGeoJSON(),
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
        });
        map.addLayer({
            id: LAYER_CLUSTERS,
            type: "circle",
            source: SOURCE,
            filter: ["has", "point_count"],
            paint: {
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#51bbd6",
                    20,
                    "#f1f075",
                    100,
                    "#f28cb1",
                ],
                "circle-radius": ["step", ["get", "point_count"], 16, 20, 22, 100, 28],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
            },
        });
        // Labels need glyphs, provided by the style. Skip when absent.
        if (map.getStyle().glyphs) {
            map.addLayer({
                id: LAYER_COUNT,
                type: "symbol",
                source: SOURCE,
                filter: ["has", "point_count"],
                layout: {
                    "text-field": ["get", "point_count_abbreviated"],
                    "text-size": 12,
                    "text-font": ["Noto Sans Regular"],
                },
            });
        }
        map.addLayer({
            id: LAYER_POINTS,
            type: "circle",
            source: SOURCE,
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#714b67",
                "circle-radius": 8,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#fff",
            },
        });

        map.on("click", LAYER_CLUSTERS, async (ev) => {
            const feature = ev.features[0];
            const zoom = await map
                .getSource(SOURCE)
                .getClusterExpansionZoom(feature.properties.cluster_id);
            map.easeTo({center: feature.geometry.coordinates, zoom});
        });
        map.on("click", LAYER_POINTS, (ev) => this.showPopup(ev.features[0]));
        for (const layer of [LAYER_CLUSTERS, LAYER_POINTS]) {
            map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
            map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
        }
    }

    /**
     * Popup content is built with DOM nodes (textContent) so record data
     * is never interpreted as HTML.
     */
    showPopup(feature) {
        const {id, title, address} = feature.properties;
        const root = document.createElement("div");
        root.className = "o_maplibre_popup";
        const bold = document.createElement("b");
        bold.textContent = title;
        root.appendChild(bold);
        if (address) {
            root.appendChild(document.createElement("br"));
            root.appendChild(document.createTextNode(address));
        }
        root.addEventListener("click", () => this.openRecord(id));
        new maplibregl.Popup({closeButton: false, offset: 12})
            .setLngLat(feature.geometry.coordinates)
            .setDOMContent(root)
            .addTo(this.map);
    }

    updateData(fit = false) {
        const source = this.map?.getSource(SOURCE);
        if (!source) return;
        const data = this.toGeoJSON();
        source.setData(data);
        if (fit && data.features.length) {
            const bounds = new maplibregl.LngLatBounds();
            for (const f of data.features) bounds.extend(f.geometry.coordinates);
            this.map.fitBounds(bounds, {padding: 60, maxZoom: 15, duration: 0});
        }
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
