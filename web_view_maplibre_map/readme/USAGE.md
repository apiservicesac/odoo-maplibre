Create a view:

```xml
<record id="view_my_model_maplibre_map" model="ir.ui.view">
    <field name="model">my.model</field>
    <field name="arch" type="xml">
        <maplibre_map
            field_latitude="latitude"
            field_longitude="longitude"
            field_title="name"
            field_address="address"
        />
    </field>
</record>
```

Then add `maplibre_map` to the `view_mode` of the action of your model.

View attributes:

| Attribute | Description |
|---|---|
| `field_latitude`, `field_longitude` | Fields that contain the GPS coordinates. |
| `field_title` | Field displayed as the title of the popup. |
| `field_address` | (optional) Field displayed under the title. |
| `default_zoom` | (optional) Initial zoom before the records are loaded (7). |
| `max_zoom` | (optional) Maximum zoom level (19). |
| `pitch` | (optional) Tilt of the map in degrees, from 0 to 60 (45). The map stays flat when the whole world is displayed. |
| `limit` | (optional) Maximum number of records displayed (5000). |

When no record has coordinates, the whole world is displayed. Otherwise the map
fits the displayed records.

The initial position of the map is returned by
`res.users.get_default_maplibre_position`. Override it to change it globally or
per model.
