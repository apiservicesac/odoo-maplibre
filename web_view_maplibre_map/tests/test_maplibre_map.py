from odoo.tests.common import TransactionCase

from ..hooks import uninstall_hook


class TestMaplibreMap(TransactionCase):
    VIEW_ARCH = """
        <maplibre_map
            field_latitude="partner_latitude"
            field_longitude="partner_longitude"
            field_title="display_name"
        />
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.view = cls.env["ir.ui.view"].create(
            {"name": "test maplibre", "model": "res.partner", "arch": cls.VIEW_ARCH}
        )

    def test_view_info(self):
        view_info = self.env["ir.ui.view"]._get_view_info()
        self.assertEqual(view_info["maplibre_map"]["icon"], "fa fa-map-o")

    def test_view_type_is_detected(self):
        self.assertEqual(self.view.type, "maplibre_map")

    def test_get_views(self):
        result = self.env["res.partner"].get_views([(self.view.id, "maplibre_map")])
        self.assertIn("maplibre_map", result["views"])
        self.assertIn("field_latitude", result["views"]["maplibre_map"]["arch"])

    def test_view_mode_selection(self):
        action = self.env["ir.actions.act_window"].create(
            {
                "name": "Test",
                "res_model": "res.partner",
                "view_mode": "list,maplibre_map",
            }
        )
        self.assertEqual(action.view_mode, "list,maplibre_map")
        link = self.env["ir.actions.act_window.view"].create(
            {
                "act_window_id": action.id,
                "view_mode": "maplibre_map",
                "view_id": self.view.id,
            }
        )
        self.assertEqual(link.view_mode, "maplibre_map")

    def test_default_position_uses_company_coordinates(self):
        self.env.company.partner_id.write(
            {"partner_latitude": -12.04, "partner_longitude": -77.03}
        )
        position = self.env["res.users"].get_default_maplibre_position("res.partner")
        self.assertEqual(position, {"lat": -12.04, "lng": -77.03})

    def test_default_position_without_coordinates(self):
        self.env.company.partner_id.write(
            {"partner_latitude": 0, "partner_longitude": 0}
        )
        position = self.env["res.users"].get_default_maplibre_position("res.partner")
        self.assertEqual(position, {"lat": 0, "lng": 0})

    def test_uninstall_hook_removes_view_mode(self):
        action_last = self.env["ir.actions.act_window"].create(
            {"name": "a", "res_model": "res.partner", "view_mode": "list,maplibre_map"}
        )
        action_first = self.env["ir.actions.act_window"].create(
            {"name": "b", "res_model": "res.partner", "view_mode": "maplibre_map,list"}
        )
        uninstall_hook(self.env)
        action_last.invalidate_recordset()
        action_first.invalidate_recordset()
        self.assertEqual(action_last.view_mode, "list")
        self.assertEqual(action_first.view_mode, "list")
