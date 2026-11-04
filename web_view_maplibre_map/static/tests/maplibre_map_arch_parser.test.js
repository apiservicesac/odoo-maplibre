import {describe, expect, test} from "@odoo/hoot";
import {MaplibreMapArchParser} from "@web_view_maplibre_map/views/maplibre_map/maplibre_map_arch_parser.esm";
import {MaplibreMapDefaults} from "@web_view_maplibre_map/views/maplibre_map/maplibre_map_defaults.esm";

describe.current.tags("desktop");

describe("MaplibreMapArchParser", () => {
    const archParser = new MaplibreMapArchParser();

    test("reads the field attributes", () => {
        const archInfo = archParser.parse(`
            <maplibre_map
                field_latitude="partner_latitude"
                field_longitude="partner_longitude"
                field_title="display_name"
                field_address="contact_address"
            />`);
        expect(archInfo.fieldLatitude).toBe("partner_latitude");
        expect(archInfo.fieldLongitude).toBe("partner_longitude");
        expect(archInfo.fieldTitle).toBe("display_name");
        expect(archInfo.fieldAddress).toBe("contact_address");
    });

    test("uses the defaults when the numeric attributes are missing", () => {
        const archInfo = archParser.parse("<maplibre_map />");
        expect(archInfo.defaultZoom).toBe(MaplibreMapDefaults.DEFAULT_ZOOM);
        expect(archInfo.maxZoom).toBe(MaplibreMapDefaults.MAX_ZOOM);
        expect(archInfo.pitch).toBe(MaplibreMapDefaults.PITCH);
        expect(archInfo.recordLimit).toBe(MaplibreMapDefaults.RECORD_LIMIT);
    });

    test("reads the numeric attributes", () => {
        const archInfo = archParser.parse(
            '<maplibre_map default_zoom="4" max_zoom="12" pitch="30" limit="100" />'
        );
        expect(archInfo.defaultZoom).toBe(4);
        expect(archInfo.maxZoom).toBe(12);
        expect(archInfo.pitch).toBe(30);
        expect(archInfo.recordLimit).toBe(100);
    });

    test("accepts a flat map (pitch 0)", () => {
        const archInfo = archParser.parse('<maplibre_map pitch="0" />');
        expect(archInfo.pitch).toBe(0);
    });

    test("accepts an already parsed element", () => {
        const element = new DOMParser().parseFromString(
            '<maplibre_map field_title="name" />',
            "text/xml"
        ).documentElement;
        expect(archParser.parse(element).fieldTitle).toBe("name");
    });
});
