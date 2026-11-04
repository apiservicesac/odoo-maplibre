# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

{
    "name": "MapLibre Map View for Partners",
    "summary": "Add a MapLibre (vector tiles) map view to Contacts.",
    "version": "19.0.1.0.0",
    "author": "API SERVICE SAC",
    "website": "https://github.com/apiservicesac/odoo-maplibre",
    "license": "AGPL-3",
    "category": "Extra Tools",
    "depends": ["web_view_maplibre_map", "contacts"],
    "data": ["views/res_partner.xml"],
    "demo": ["demo/res_partner.xml"],
    "installable": True,
}
