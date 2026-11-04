{
    "name": "MapLibre GL Javascript Library",
    "version": "19.0.1.0.0",
    "category": "API SERVICE SAC/MAPLIBRE",
    "summary": "MapLibre GL JS (vector tiles, WebGL) and PMTiles in the Odoo backend",
    "description": """
MapLibre GL Javascript Library
==============================

Bundles MapLibre GL JS 5.9.0 and the PMTiles protocol in the Odoo backend and
stores the map style configuration used by the MapLibre view modules.

Content:
--------
- MapLibre GL JS and PMTiles loaded in the backend assets (no CDN).
- System parameter `maplibre.style_url`: any MapLibre style.json. The default
  is OpenFreeMap (OpenStreetMap data, no API key).
- System parameter `maplibre.api_key`: optional key, replaces the `{key}`
  placeholder of the style URL (MapTiler, Stadia, ...).
- Self-hosted vector tiles with `pmtiles://` sources.
    """,
    "author": "API SERVICE S.A.C., Josue Salazar",
    "website": "https://www.apiservicesac.com",
    "license": "AGPL-3",
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
    "auto_install": False,
    "application": False,
}
