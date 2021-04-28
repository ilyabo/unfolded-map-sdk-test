import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {
  Layer, createMap, getLayers,
  setMapControlVisibility,
  setTimelineConfig,
  setLayerVisibility,
  MapInstance
} from '@unfolded/map-sdk';

function App() {
  const [map, setMap] = useState<MapInstance>();
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
      await setTimelineConfig(map, { idx: 0, isVisible: layerId === aiqLayerId });
    }
    for (const {id} of layers) {
      const isVisible = id === layerId;
      await setLayerVisibility(map, id, isVisible);
    }
  };
  useEffect(() => {
    const mapInstance = createMap({
      mapUUID: '84c26003-2d8c-4b61-b55d-964c1a043e35',
      appendToDocument: true,
      width: window.innerWidth,
      height: window.innerHeight,
      embed: true,
      onLoad: async function () {
        const mapLayers = await getLayers(mapInstance);
        setLayers(mapLayers);
        if (mapLayers?.length > 0) {
          await handleSelectLayer(mapLayers[0].id);
        }
        await setMapControlVisibility(mapInstance, {panelId: 'mapLegend', isVisible: false});
      }
    });
    setMap(mapInstance);
  }, []);

  console.log(selectedLayerId);
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

export default App;
