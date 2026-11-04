{
    "name": "MapLibre Map View for Partners",
    "version": "19.0.1.0.0",
    "category": "API SERVICE SAC/MAPLIBRE",
    "summary": "MapLibre (vector tiles) map view in Contacts",
    "description": """
MapLibre Map View for Partners
==============================

Adds a MapLibre map view to the Contacts app.

Content:
--------
- Map icon in the view switcher of Contacts.
- The partners that have a latitude and a longitude (see `base_geolocalize`)
  are displayed on the map, with clusters, popup and 3D buildings.
- Demo data with partners that have coordinates.
    """,
    "author": "API SERVICE S.A.C., Josue Salazar",
    "website": "https://www.apiservicesac.com",
    "license": "AGPL-3",
    "depends": ["web_view_maplibre_map", "contacts"],
    "data": ["views/res_partner.xml"],
    "demo": ["demo/res_partner.xml"],
    "installable": True,
    "auto_install": False,
    "application": False,
}
