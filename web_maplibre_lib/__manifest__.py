# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "MapLibre GL Javascript Library",
    "summary": "Bring MapLibre GL JS (vector tiles, WebGL) and PMTiles in Odoo.",
    "version": "19.0.1.0.0",
    "author": "API SERVICE SAC",
    "website": "https://github.com/apiservicesac/odoo-maplibre",
    "license": "AGPL-3",
    "category": "Extra Tools",
    "depends": ["base"],
    "data": ["data/ir_config_parameter.xml"],
    "assets": {
        "web.assets_backend": [
            "web_maplibre_lib/static/lib/maplibre-gl/maplibre-gl.css",
            "web_maplibre_lib/static/lib/maplibre-gl/maplibre-gl.js",
            "web_maplibre_lib/static/lib/pmtiles/pmtiles.js",
            "web_maplibre_lib/static/src/maplibre_setup.esm.js",
        ],
    },
    "installable": True,
}
