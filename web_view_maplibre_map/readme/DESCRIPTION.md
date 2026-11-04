This module adds a new `maplibre_map` view type. Records with GPS
coordinates are displayed on a WebGL map with vector tiles. Nearby records are
grouped in clusters, and a click on a record opens a popup that links to its
form.

By default the map uses OpenFreeMap (OpenStreetMap data, no API key). The map
source is configurable, see `web_maplibre_lib`.
