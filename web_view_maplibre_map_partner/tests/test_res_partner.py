# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).

from odoo.tests.common import TransactionCase


class TestResPartner(TransactionCase):
    def test_display_address(self):
        partner = self.env["res.partner"].create(
            {"name": "Test", "street": "Calle 1", "city": "Lima"}
        )
        self.assertEqual(
            partner.display_address, partner._display_address(without_company=True)
        )

    def test_contacts_action_has_map(self):
        action = self.env.ref("contacts.action_contacts")
        self.assertIn("maplibre_map", action.view_mode)
        self.assertTrue(
            action.view_ids.filtered(lambda v: v.view_mode == "maplibre_map")
        )
        view = self.env.ref("web_view_maplibre_map_partner.view_res_partner_maplibre_map")
        self.assertEqual(view.type, "maplibre_map")
