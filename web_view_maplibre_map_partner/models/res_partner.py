from odoo import fields, models


class ResPartner(models.Model):
    _inherit = "res.partner"

    display_address = fields.Char(compute="_compute_display_address")

    def _compute_display_address(self):
        for partner in self:
            partner.display_address = partner._display_address(without_company=True)
