from odoo.tests.common import TransactionCase


class TestResPartner(TransactionCase):
    def test_display_address(self):
        partner = self.env["res.partner"].create(
            {"name": "Test", "street": "Calle 1", "city": "Lima", "zip": "15001"}
        )
        self.assertEqual(
            partner.display_address, partner._display_address(without_company=True)
        )
        self.assertIn("Lima", partner.display_address)

    def test_contacts_action_has_map(self):
        action = self.env.ref("contacts.action_contacts")
        self.assertIn("maplibre_map", action.view_mode)
        self.assertTrue(
            action.view_ids.filtered(lambda v: v.view_mode == "maplibre_map")
        )

    def test_partner_view_definition(self):
        view = self.env.ref(
            "web_view_maplibre_map_partner.view_res_partner_maplibre_map"
        )
        self.assertEqual(view.type, "maplibre_map")
        self.assertIn("partner_latitude", view.arch_db)

    def test_demo_partners_have_coordinates(self):
        if not self.env.ref("base.module_base").demo:
            self.skipTest("demo data not loaded")
        partner = self.env.ref("base.res_partner_12")
        self.assertTrue(partner.partner_latitude)
        self.assertTrue(partner.partner_longitude)
