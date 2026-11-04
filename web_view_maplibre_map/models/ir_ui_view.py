# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo import fields, models


class IrUiView(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[("maplibre_map", "MapLibre Map")])

    def _get_view_info(self):
        return {"maplibre_map": {"icon": "fa fa-map-o"}} | super()._get_view_info()
