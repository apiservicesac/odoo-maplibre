/* global maplibregl, pmtiles */

/**
 * Enables "pmtiles://" URLs in styles and sources (self-hosted vector tiles).
 */
class PmtilesProtocolRegistrar {
    static register() {
        if (typeof maplibregl === "undefined" || typeof pmtiles === "undefined") {
            return;
        }
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol("pmtiles", protocol.tile);
    }
}

PmtilesProtocolRegistrar.register();
