import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface MapComponentProps {
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ className }) => {
  return (
    <div className={`bg-transparent p-6 rounded-3xl shadow-md border w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Patient Geographic Distribution</h2>
        <div className="text-sm text-muted-foreground">Global Reach</div>
      </div>
      
      <div className="h-64 relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20]
          }}
        >
          <ZoomableGroup zoom={1}>
            <Geographies geography="/features.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#374151"
                    stroke="#6B7280"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#18E614', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        
        {/* Mock patient location indicators */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#18E614] rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#F80D38] rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-[#6366F1] rounded-full animate-pulse" />
        <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-[#F59E0B] rounded-full animate-pulse" />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="font-medium text-foreground">Top Regions</div>
          <div className="text-muted-foreground">North America, Europe, Asia</div>
        </div>
        <div>
          <div className="font-medium text-foreground">Total Countries</div>
          <div className="text-muted-foreground">24 countries</div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
