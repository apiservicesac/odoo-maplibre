from odoo import models


class IrHttp(models.AbstractModel):
    _inherit = "ir.http"

    def session_info(self):
        result = super().session_info()
        if result.get("uid"):
            config = self.env["ir.config_parameter"].sudo()
            result.update(
                {
                    "maplibre.style_url": config.get_param("maplibre.style_url") or "",
                    "maplibre.api_key": config.get_param("maplibre.api_key") or "",
                }
            )
        return result
