/*eslint-disable */
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";

import WKT from "ol/format/WKT";
import { useEffect, useRef } from "react";

export const MyMap = ({ wktData }) => {
  const mapContainer = useRef(null);
  const vectorLayer = useRef(null); // Vektor mənbəsini təyin etmək üçün

  useEffect(() => {
    const map = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        // Xəritə üçün yeni vektor mənbəsi
        new VectorLayer({
          source: new VectorSource(),
        }),
      ],
      view: new View({
        center: fromLonLat([50.32500619720577, 40.39007045577375]),
        zoom: 12,
      }),
    });

    if (wktData) {
      // Əgər wktData mövcuddursa, yeni məlumat əlavə et
      const format = new WKT();
      const feature = format.readFeature(wktData);
      vectorLayer.current = map.getLayers().getArray()[1];
      vectorLayer.current.getSource().clear(); // Əvvəlcədən mövcud məlumatı təmizlə
      vectorLayer.current.getSource().addFeature(feature);
    }
  }, [wktData]);

  return (
    <div ref={mapContainer} style={{ height: "400px" }}></div>
  );
};
