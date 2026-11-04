from odoo.tests.common import HttpCase, TransactionCase, tagged


class TestDefaultParameters(TransactionCase):
    def test_default_style_url(self):
        param = self.env["ir.config_parameter"].sudo().get_param("maplibre.style_url")
        self.assertEqual(param, "https://tiles.openfreemap.org/styles/liberty")

    def test_default_api_key_is_empty(self):
        param = self.env["ir.config_parameter"].sudo().get_param("maplibre.api_key")
        self.assertFalse(param)


@tagged("post_install", "-at_install")
class TestSessionInfo(HttpCase):
    def test_session_info_exposes_maplibre_config(self):
        """The logged user receives the map configuration in the session info."""
        config = self.env["ir.config_parameter"].sudo()
        config.set_param("maplibre.style_url", "https://example.com/{key}/style.json")
        config.set_param("maplibre.api_key", "secret-key")
        self.authenticate("admin", "admin")
        response = self.url_open("/odoo")
        self.assertEqual(response.status_code, 200)
        self.assertIn("maplibre.style_url", response.text)
        self.assertIn("secret-key", response.text)

    def test_session_info_not_exposed_to_public(self):
        """Anonymous visitors must not receive the map configuration."""
        self.env["ir.config_parameter"].sudo().set_param(
            "maplibre.api_key", "secret-key"
        )
        self.authenticate(None, None)
        response = self.url_open("/web/login")
        self.assertNotIn("secret-key", response.text)
