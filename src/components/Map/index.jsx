import * as ol from "ol";
import { useEffect, useRef } from "react";

export const MyMap = ({ wktData }) => {
  const mapContainer = useRef(null);

  useEffect(() => {
    // OpenLayers harita oluşturma
    const map = new ol.MapBrowser({
      target: mapContainer.current,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // WKT formatını okuma ve geometri oluşturma
    const format = new ol.format.WKT();
    const features = wktData.map((wkt) => format.readFeature(wkt));

    // Vektör katmanı oluşturma
    const vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: features,
      }),
    });

    map.addLayer(vectorLayer);
  }, [wktData]);

  return <div ref={mapContainer} style={{ height: "400px" }}></div>;
};
