/*eslint-disable*/
import  { useEffect, useRef } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import WKT from "ol/format/WKT";

export const MyMap = ({ wktData }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const vectorLayerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = new Map({
        target: mapContainer.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: new VectorSource(),
          }),
        ],
        view: new View({
          center: fromLonLat([50.32500619720577, 40.39007045577375]),
          zoom: 12,
        }),
      });
      mapRef.current = map;
      vectorLayerRef.current = map.getLayers().getArray()[1];
    }

    if (wktData) {
    
      const format = new WKT();
      const feature = format.readFeature(wktData);
      vectorLayerRef.current.getSource().clear();
      vectorLayerRef.current.getSource().addFeature(feature);
    }
  }, [wktData]);

  return <div ref={mapContainer} style={{ height: "100vh" }}></div>;
};


