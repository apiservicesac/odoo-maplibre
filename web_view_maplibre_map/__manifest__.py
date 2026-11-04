# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "MapLibre Map View (vector tiles)",
    "summary": "Add a 'maplibre_map' view: WebGL map with vector tiles and clustering.",
    "version": "19.0.1.0.0",
    "author": "API SERVICE SAC",
    "website": "https://github.com/apiservicesac/odoo-maplibre",
    "license": "AGPL-3",
    "category": "Extra Tools",
    "depends": ["base_geolocalize", "web_maplibre_lib"],
    "assets": {
        "web.assets_backend": [
            "web_view_maplibre_map/static/src/views/maplibre_map/*",
        ],
    },
    "installable": True,
    "uninstall_hook": "uninstall_hook",
}
