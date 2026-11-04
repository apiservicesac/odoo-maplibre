from odoo import api, models


class ResUsers(models.Model):
    _inherit = "res.users"

    @api.model
    def get_default_maplibre_position(self, model_name):
        """Initial map center. Override globally or per model."""
        partner = self.env.company.partner_id
        return {"lat": partner.partner_latitude, "lng": partner.partner_longitude}
