import React, {useEffect, useMemo, useState} from 'react';
import './App.css';
import {
  Layer, UnfoldedMap
} from '@unfolded/map-sdk';

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
      await map.setTimelineConfig({ idx: 0, isVisible: layerId === aiqLayerId });
    }
    for (const {id} of layers) {
      const isVisible = id === layerId;
      await map.setLayerVisibility(id, isVisible);
    }
  };
  useEffect(() => {
    const _map = new UnfoldedMap({
      mapUUID: '84c26003-2d8c-4b61-b55d-964c1a043e35',
      appendToDocument: true,
      width: window.innerWidth,
      height: window.innerHeight,
      embed: true,
      onLoad: async function () {
        const mapLayers = await _map.getLayers();
        setLayers(mapLayers);
        if (mapLayers?.length > 0) {
          await handleSelectLayer(mapLayers[0].id);
        }
        await _map.setMapControlVisibility({panelId: 'mapLegend', isVisible: false});
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

export default App;
