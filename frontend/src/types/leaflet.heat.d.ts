// Type declarations for leaflet.heat (no @types package available)
declare module "leaflet.heat" {
  import * as L from "leaflet";
  function heatLayer(
    latlngs: Array<[number, number] | [number, number, number]>,
    options?: {
      minOpacity?: number;
      maxZoom?: number;
      max?: number;
      radius?: number;
      blur?: number;
      gradient?: Record<string, string>;
    }
  ): L.Layer;
  export default heatLayer;
}
