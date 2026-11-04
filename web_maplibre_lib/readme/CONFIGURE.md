System parameters (Settings > Technical > System Parameters):

| Key | Description |
|---|---|
| `maplibre.style_url` | URL of a MapLibre `style.json`. Default: OpenFreeMap Liberty (OpenStreetMap data, no API key). |
| `maplibre.api_key` | Optional. Replaces the `{key}` placeholder in the style URL (e.g. MapTiler). |

Examples:

- OpenFreeMap (default): `https://tiles.openfreemap.org/styles/liberty`
- MapTiler: `https://api.maptiler.com/maps/streets-v2/style.json?key={key}`
- Self-hosted Protomaps: host your own `style.json` that points to a `pmtiles://` source.

MapLibre GL requires WebGL. Browser-side keys are visible to logged users; restrict them by domain at the provider.
