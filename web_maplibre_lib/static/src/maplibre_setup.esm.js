/* global maplibregl, pmtiles */

// Enable "pmtiles://" URLs in style.json / sources (self-hosted vector tiles).
if (typeof maplibregl !== "undefined" && typeof pmtiles !== "undefined") {
    const protocol = new pmtiles.Protocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
}
