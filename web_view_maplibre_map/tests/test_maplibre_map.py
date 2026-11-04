# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase

from ..hooks import uninstall_hook


class TestMaplibreMap(TransactionCase):
    def test_view_info(self):
        info = self.env["ir.ui.view"]._get_view_info()
        self.assertEqual(info["maplibre_map"]["icon"], "fa fa-map-o")

    def test_default_position(self):
        partner = self.env.company.partner_id
        partner.write({"partner_latitude": -12.04, "partner_longitude": -77.03})
        pos = self.env["res.users"].get_default_maplibre_position("res.partner")
        self.assertEqual(pos, {"lat": -12.04, "lng": -77.03})

    def test_uninstall_hook(self):
        action = self.env["ir.actions.act_window"].create(
            {"name": "t", "res_model": "res.partner", "view_mode": "list,maplibre_map"}
        )
        uninstall_hook(self.env)
        action.invalidate_recordset()
        self.assertEqual(action.view_mode, "list")
