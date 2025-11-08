import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Papa from 'papaparse';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { MAPBOX_ACCESS_TOKEN, MAPBOX_STYLE } from './mapboxConfig';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker colors - circles with no border
const createCustomIcon = (color, size = 3, opacity = 1) => {
  // Make interactive area larger for easier clicking
  const interactiveSize = Math.max(size, 20);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; opacity: ${opacity}; pointer-events: auto; cursor: pointer;"></div>`,
    iconSize: [interactiveSize, interactiveSize],
    iconAnchor: [interactiveSize / 2, interactiveSize / 2],
  });
};

const greenIcon = createCustomIcon('#32CD32', 10, 0.5); // Públic - bright green, 10px, 50% transparent
const orangeIcon = createCustomIcon('#ff8c00', 10, 0.5); // Privat - orange, 10px, 50% transparent

function App() {
  const [schools, setSchools] = useState([]);
  const [allSchools, setAllSchools] = useState([]); // Store all schools for filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]); // Track active filters in order
  const [filterExpanded, setFilterExpanded] = useState(false); // Track if filter section is expanded

  useEffect(() => {
    // Fetch CSV file with Latin-1 encoding and parse it
    fetch('/totcat-centres-educatius.csv')
      .then(response => response.arrayBuffer())
      .then(buffer => {
        // Decode as Latin-1 (ISO-8859-1)
        const decoder = new TextDecoder('iso-8859-1');
        const text = decoder.decode(buffer);
        
        Papa.parse(text, {
          header: true,
          delimiter: ';',
          complete: (results) => {
        // Debug: Check available columns and sample values
        if (results.data.length > 0) {
          const firstRow = results.data[0];
          const keys = Object.keys(firstRow);
          console.log('Available column keys:', keys);
          console.log('Sample row:', firstRow);
          
          // Find the actual column names (handle encoding issues)
          const nameKey = keys.find(k => k.toLowerCase().includes('denominaci') && k.toLowerCase().includes('completa')) || 
                         keys.find(k => k.includes('Denominaci')) || 
                         'Denominació_completa';
          const addressKey = keys.find(k => k.toLowerCase().includes('adre')) || 
                            keys.find(k => k.includes('Adre')) || 
                            'Adreça';
          
          console.log('Using nameKey:', nameKey, 'addressKey:', addressKey);
        }

        const parsedSchools = results.data
          .filter(row => {
            // Filter out rows with missing coordinates
            const lat = parseFloat(row.Coordenades_GEO_Y?.replace(',', '.'));
            const lng = parseFloat(row.Coordenades_GEO_X?.replace(',', '.'));
            // Get nature code: 1 = Públic, 2 = Privat
            const natureCode = parseInt(row.Codi_naturalesa);
            
            // Only include schools with valid coordinates and code 1 or 2
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
                   (natureCode === 1 || natureCode === 2);
          })
          .map(row => {
            const lat = parseFloat(row.Coordenades_GEO_Y?.replace(',', '.'));
            const lng = parseFloat(row.Coordenades_GEO_X?.replace(',', '.'));
            // Get nature code: 1 = Públic, 2 = Privat
            const natureCode = parseInt(row.Codi_naturalesa);
            
            // Determine marker color based on school type code
            const isPublic = natureCode === 1;
            const markerIcon = isPublic ? greenIcon : orangeIcon;
            const displayNature = isPublic ? 'Públic' : 'Privat';

            // Find the actual column names dynamically
            const keys = Object.keys(row);
            const nameKey = keys.find(k => k.toLowerCase().includes('denominaci') && k.toLowerCase().includes('completa')) || 
                           keys.find(k => k.includes('Denominaci')) || 
                           'Denominació_completa';
            const addressKey = keys.find(k => k.toLowerCase().includes('adre')) || 
                              keys.find(k => k.includes('Adre')) || 
                              'Adreça';

            // Get all program columns from ESO to ADULTS
            const programColumns = ['ESO', 'BATX', 'AA01', 'CFPM', 'PPAS', 'AA03', 'CFPS', 'EE', 'IFE', 'PFI', 'PA01', 'CFAM', 'PA02', 'CFAS', 'ESDI', 'ESCM', 'ESCS', 'ADR', 'CRBC', 'IDI', 'DANE', 'DANP', 'DANS', 'MUSE', 'MUSP', 'MUSS', 'TEGM', 'TEGS', 'ESTR', 'ADULTS'];
            const programs = programColumns
              .map(col => row[col] || '')
              .filter(val => val.trim() !== '')
              .join(' / ');

            return {
              id: row.Codi_centre,
              name: row[nameKey] || '',
              nature: displayNature,
              address: row[addressKey] || '',
              municipality: row.Nom_municipi || '',
              lat: lat,
              lng: lng,
              icon: markerIcon,
              programs: programs, // Store all programs as a joined string
              // Store filter columns
              EPRI: row.EPRI || '',
              ESO: row.ESO || '',
              BATX: row.BATX || '',
              AA01: row.AA01 || '',
              CFPM: row.CFPM || '',
              PPAS: row.PPAS || '',
              AA03: row.AA03 || '',
              CFPS: row.CFPS || '',
              EE: row.EE || '',
              IFE: row.IFE || '',
            };
          });
        
        // Debug: Count schools by type
        const publicCount = parsedSchools.filter(s => s.nature === 'Públic').length;
        const privateCount = parsedSchools.filter(s => s.nature === 'Privat').length;
        console.log(`Total schools: ${parsedSchools.length} (Públic: ${publicCount}, Privat: ${privateCount})`);
        
        setAllSchools(parsedSchools);
        setSchools(parsedSchools);
        setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching CSV:', error);
        setError('Failed to load school data. Please refresh the page.');
        setLoading(false);
      });
  }, []);

  // Filter schools based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) {
      setSchools(allSchools);
      return;
    }

    // Filter schools: each active filter must match (AND logic, in sequence)
    const filtered = allSchools.filter(school => {
      return activeFilters.every(filter => {
        // Check if the school has this filter column value (non-empty)
        return school[filter] && school[filter].trim() !== '';
      });
    });

    setSchools(filtered);
  }, [activeFilters, allSchools]);

  // Toggle filter function
  const toggleFilter = (filterName) => {
    setActiveFilters(prev => {
      if (prev.includes(filterName)) {
        // Remove filter
        return prev.filter(f => f !== filterName);
      } else {
        // Add filter (maintain order)
        return [...prev, filterName];
      }
    });
  };

  // Filter button abbreviations with explanations
  const filterButtons = [
    { 
      code: 'EPRI', 
      title: 'Educació Primària - Primary Education – ages roughly 6–12, equivalent to elementary school.' 
    },
    { 
      code: 'ESO', 
      title: 'Educació Secundària Obligatòria - Compulsory Secondary Education – ages 12–16, equivalent to middle + early high school.' 
    },
    { 
      code: 'BATX', 
      title: 'Batxillerat - Baccalaureate / Upper Secondary Education – ages 16–18, pre-university stage.' 
    },
    { 
      code: 'AA01', 
      title: 'Ensenyaments d\'Arts Plàstiques i Disseny - Art and Design Education (official artistic vocational programs).' 
    },
    { 
      code: 'CFPM', 
      title: 'Cicle Formatiu de Grau Mitjà - Intermediate Vocational Training (VET) – post-16 professional training (similar to Level 3 qualifications).' 
    },
    { 
      code: 'PPAS', 
      title: 'Programes Professionals Adaptats - Adapted Professional Programs – vocational programs for students with special educational needs.' 
    },
    { 
      code: 'AA03', 
      title: 'Ensenyaments Artístics Superiors - Higher Artistic Education – equivalent to higher education in art, design, music, or dance.' 
    },
    { 
      code: 'CFPS', 
      title: 'Cicle Formatiu de Grau Superior - Advanced Vocational Training (Higher VET) – post-secondary professional qualification (similar to associate degree).' 
    },
    { 
      code: 'EE', 
      title: 'Educació Especial - Special Education – for students with significant learning or developmental needs.' 
    },
    { 
      code: 'IFE', 
      title: 'Itinerari Formatiu Específic - Specific Training Itinerary – specialized education paths for students with intellectual disabilities.' 
    }
  ];

  // Map updater component to handle zoom/pan
  // This component updates the map view when center or zoom changes
  function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView(center, zoom || 15);
      }
    }, [center, zoom, map]);
    return null;
  }

  // Calculate center point (Barcelona area)
  const center = [41.3851, 2.1734]; // Barcelona coordinates
  const zoom = 10;

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading schools data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="dashboard">
        <div className="legend">
          <h3 className="legend-title">School Types</h3>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#32CD32', opacity: 0.5, width: '10px', height: '10px' }}></span>
            <span>Públic</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#ff8c00', opacity: 0.5, width: '10px', height: '10px' }}></span>
            <span>Privat</span>
          </div>
          <div className="legend-count">
            Total: {schools.length} schools
          </div>
        </div>
        
        <div className="filter-dashboard">
          <div className="filter-header" onClick={() => setFilterExpanded(!filterExpanded)}>
            <h3 className="legend-title">Filter schools by program types</h3>
            <span className="filter-toggle">{filterExpanded ? '▼' : '▶'}</span>
          </div>
          {filterExpanded && (
            <div className="filter-buttons">
              {filterButtons.map((filter) => (
                <button
                  key={filter.code}
                  className={`filter-button ${activeFilters.includes(filter.code) ? 'active' : ''}`}
                  onClick={() => toggleFilter(filter.code)}
                  title={filter.title}
                >
                  {filter.code}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
          tileSize={512}
          zoomOffset={-1}
        />
        {schools.map((school) => (
          <Marker
            key={school.id}
            position={[school.lat, school.lng]}
            icon={school.icon}
            zIndexOffset={10}
          >
            <Popup>
              <div className="popup-content">
                <h3>{school.name || 'Unknown School'}</h3>
                <p><strong>Type:</strong> {school.nature}</p>
                {school.municipality && <p><strong>Location:</strong> {school.municipality}</p>}
                <p style={{ marginTop: '10px' }}>{school.address || 'No address available'}</p>
                {school.programs && <p style={{ marginTop: '10px' }}><strong>Programs:</strong> {school.programs}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;

