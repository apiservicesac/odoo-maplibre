import {MaplibreMapDefaults} from "./maplibre_map_defaults.esm";

/**
 * Reads the attributes of the <maplibre_map> arch node.
 */
export class MaplibreMapArchParser {
    /**
     * @param {string|Element} arch the arch of the view
     * @returns {Object} the view configuration
     */
    parse(arch) {
        const archNode = this.toElement(arch);
        return {
            fieldLatitude: archNode.getAttribute("field_latitude"),
            fieldLongitude: archNode.getAttribute("field_longitude"),
            fieldTitle: archNode.getAttribute("field_title"),
            fieldAddress: archNode.getAttribute("field_address"),
            defaultZoom:
                parseFloat(archNode.getAttribute("default_zoom")) ||
                MaplibreMapDefaults.DEFAULT_ZOOM,
            maxZoom:
                parseFloat(archNode.getAttribute("max_zoom")) ||
                MaplibreMapDefaults.MAX_ZOOM,
            pitch: this.parseNumber(
                archNode.getAttribute("pitch"),
                MaplibreMapDefaults.PITCH
            ),
            recordLimit:
                parseInt(archNode.getAttribute("limit"), 10) ||
                MaplibreMapDefaults.RECORD_LIMIT,
        };
    }

    parseNumber(value, defaultValue) {
        const number = parseFloat(value);
        return Number.isNaN(number) ? defaultValue : number;
    }

    toElement(arch) {
        if (arch && typeof arch !== "string") {
            return arch;
        }
        const xmlDocument = new DOMParser().parseFromString(
            String(arch || ""),
            "text/xml"
        );
        return xmlDocument.documentElement;
    }
}
