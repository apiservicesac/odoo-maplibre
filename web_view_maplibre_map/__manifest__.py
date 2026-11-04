{
    "name": "MapLibre Map View (vector tiles)",
    "version": "19.0.1.0.0",
    "category": "API SERVICE SAC/MAPLIBRE",
    "summary": "'maplibre_map' view: tilted WebGL map with vector tiles",
    "description": """
MapLibre Map View (vector tiles)
================================

Adds the `maplibre_map` view type. Records with GPS coordinates are displayed
on a WebGL map with vector tiles.

Content:
--------
- Clusters of nearby records, click on a cluster to zoom into it.
- Popup with the title and the address, linked to the record form.
- Tilted map (`pitch` attribute) with 3D buildings when the view is close.
- Integration with the search bar and the filters.
- The whole world is displayed when no record has coordinates.
- Map source configurable, see `web_maplibre_lib`.
    """,
    "author": "API SERVICE S.A.C., Josue Salazar",
    "website": "https://www.apiservicesac.com",
    "license": "AGPL-3",
    "depends": ["base_geolocalize", "web_maplibre_lib"],
    "assets": {
        "web.assets_backend": [
            "web_view_maplibre_map/static/src/views/maplibre_map/*",
        ],
        "web.assets_unit_tests": [
            "web_view_maplibre_map/static/tests/**/*",
        ],
    },
    "installable": True,
    "auto_install": False,
    "application": False,
    "uninstall_hook": "uninstall_hook",
}
