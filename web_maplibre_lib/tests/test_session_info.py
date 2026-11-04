# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase


class TestSessionInfo(TransactionCase):
    def test_default_style_url(self):
        param = self.env["ir.config_parameter"].sudo().get_param("maplibre.style_url")
        self.assertIn("openfreemap", param)
