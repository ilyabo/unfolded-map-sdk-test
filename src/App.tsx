import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {Layer, UnfoldedMap} from '@unfolded/map-sdk';
import {csvParse} from 'd3-dsv';
import {extent} from 'd3-array';

function App() {
  const [map, setMap] = useState<UnfoldedMap>();
  const [layers, setLayers] = useState<Layer[]>();
  const [selectedLayerId, setSelectedLayer] = useState<string>();
  const aiqLayerId = useMemo(() =>
    layers?.find(({id, label}) => label === 'Air Quality (now)')?.id, [layers]
  );
  const handleSelectLayer = async (layerId: string) => {
    if (!map || !layers) return;
    if (layerId === selectedLayerId) return;
    setSelectedLayer(layerId);
    if (aiqLayerId != null) {
      await map.setTimelineConfig({idx: 0, isVisible: layerId === aiqLayerId});
    }
    for (const {id} of layers) {
      const isVisible = id === layerId;
      await map.setLayerVisibility(id, isVisible);
    }
  };
  useEffect(() => {
    const _map = new UnfoldedMap({
      // mapUUID: '84c26003-2d8c-4b61-b55d-964c1a043e35',
      mapUrl: 'http://localhost:8080/public/68a4fcdc-a625-4e33-b579-a98cbc4ab73b',
      appendToDocument: true,
      width: window.innerWidth,
      height: window.innerHeight,
      embed: true,
      onLoad: async function () {
        _map.setMapControlVisibility({panelId: 'mapLegend', isVisible: false});
        await addAirQualityLayer(_map);
        const mapLayers = await _map.getLayers();
        setLayers(mapLayers);
        if (mapLayers?.length > 0) {
          setSelectedLayer(mapLayers[0].id);
        }
      }
    });
    setMap(_map);
  }, []);

  return (
    <>
      {layers &&
      <ul className="Legend">
        {layers.map((layer: Layer) =>
          <li
            key={layer.id}
            onClick={() => handleSelectLayer(layer.id)}
          >
            {layer.id === selectedLayerId ? `> ${layer.label} <` : layer.label}
          </li>)}
      </ul>}
    </>
  );
}


async function addAirQualityLayer(map: UnfoldedMap) {
  const response = await fetch('https://cdn.unfolded.ai/examples/aqi2.csv');
  if (response.status === 200) {
    const text = await response.text();
    const rows = csvParse(text);
    const timeExtent = extent(rows, d => new Date(d.last_seen!).getTime())
    let datasetId = '94ed348e-8c98-4301-91ed-f6921dff09f1';
    await map.addDataset(
      {
        uuid: datasetId,
        label: 'Air Quality',
        data: text
      }, false
    );
    await map.addLayer({
      id: 'aiq-layer',
      type: 'point',
      config: {
        label: 'Air Quality (now)',
        dataId: datasetId,
        isVisible: false,
        columns: {
          lat: 'latitude',
          lng: 'longitude'
        },
        colorScale: 'quantile',
        colorField: {
          name: 'aqi',
          type: 'real'
        },
        visConfig: {
          colorRange: {
            colors:
              ["#1a9850" ,
                "#91cf60" ,
                "#d9ef8b" ,
                "#fee08b" ,
                "#fc8d59" ,
                "#d73027"
              ]
          }
        }
      }
    });
    await map.setFilter({
      id: 'aiq-timeline-filter',
      dataId: datasetId,
      field: 'last_seen',
      value: timeExtent
    });
    await map.setTimelineConfig({
      idx: 0,
      isVisible: false
    });
  }
}

export default App;
