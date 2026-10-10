import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";


// BIT Sindri / Sindri area fallback location
const DEFAULT_LOCATION = [23.645, 86.475];


// --------------------------------------------------
// Handle map clicks
// --------------------------------------------------

function MapClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(event) {
      onSelectLocation({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}


// --------------------------------------------------
// Move map to current location
// --------------------------------------------------

function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (location) {
      map.flyTo(
        [location.lat, location.lng],
        17,
        {
          duration: 1.2,
        }
      );
    }
  }, [location, map]);

  return null;
}


// --------------------------------------------------
// Main component
// --------------------------------------------------

function EmergencyMap({
  selectedLocation,
  onSelectLocation,
}) {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [mapView, setMapView] = useState("street");

  // ------------------------------------------------
  // Find user's current location
  // ------------------------------------------------

  function findMyLocation() {

    setLocationMessage("Finding your location...");

    if (!navigator.geolocation) {
      setLocationMessage(
        "Location services are not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(location);

        onSelectLocation(location);

        setLocationMessage(
          "Location found. You can select the incident spot."
        );
      },

      () => {
        setLocationMessage(
          "Could not access your location. Please allow location permission."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }


  return (
    <section className="map-page">

      {/* ----------------------------------------- */}
      {/* HEADER */}
      {/* ----------------------------------------- */}

      <div className="map-page-header">

        <div className="map-title-icon">
          📍
        </div>

        <p className="eyebrow">
          CAMPUS SAFETY
        </p>

        <h1>
          Emergency Location Map
        </h1>

        <p className="map-subtitle">
          Select the location where an incident occurred.
          You can also use your current location.
        </p>

      </div>


      {/* ----------------------------------------- */}
      {/* MAP CARD */}
      {/* ----------------------------------------- */}

      <div className="map-card">


<div className="map-toolbar">

  <div className="map-status">
    <span className="map-live-dot"></span>

    <div>
      <strong>Safety Map Active</strong>
      <small>
        Click anywhere on the map to mark an incident
      </small>
    </div>
  </div>

  {/* Map view buttons */}
  <div className="map-view-toggle">

    <button
      className={`map-view-button ${
        mapView === "street" ? "active" : ""
      }`}
      onClick={() => setMapView("street")}
    >
      🗺️ Street
    </button>

    <button
      className={`map-view-button ${
        mapView === "satellite" ? "active" : ""
      }`}
      onClick={() => setMapView("satellite")}
    >
      🛰️ Satellite
    </button>

  </div>

  {/* Existing location button */}
  <button
    className="location-button"
    onClick={findMyLocation}
  >
    📍 Find My Location
  </button>

</div>




        {/* --------------------------------------- */}
        {/* ACTUAL MAP */}
        {/* --------------------------------------- */}

        <div className="map-wrapper">

          <MapContainer
            center={DEFAULT_LOCATION}
            zoom={16}
            scrollWheelZoom={true}
            style={{
              width: "100%",
              height: "520px",
              minHeight: "520px",
              borderRadius: "20px",
            }}
          >
           {/* 
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            /> */}
            <TileLayer key={mapView} attribution={ mapView === "satellite" ? '&copy; Esri, Maxar, Earthstar Geographics' : '&copy; OpenStreetMap contributors' } url={ mapView === "satellite" ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } />


            <MapClickHandler
              onSelectLocation={onSelectLocation}
            />


            <MapController
              location={currentLocation}
            />


            {/* Current location */}

            {currentLocation && (
              <CircleMarker
                center={[
                  currentLocation.lat,
                  currentLocation.lng,
                ]}
                radius={10}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.8,
                  weight: 3,
                }}
              >
                <Popup>
                  <strong>Your current location</strong>
                  <br />
                  You can now select the incident location.
                </Popup>
              </CircleMarker>
            )}


            {/* Selected incident */}

            {selectedLocation && (
              <CircleMarker
                center={[
                  selectedLocation.lat,
                  selectedLocation.lng,
                ]}
                radius={12}
                pathOptions={{
                  color: "#dc2626",
                  fillColor: "#ef4444",
                  fillOpacity: 0.9,
                  weight: 4,
                }}
              >
                <Popup>
                  <strong>🚨 Incident Location</strong>
                  <br />
                  Selected location
                </Popup>
              </CircleMarker>
            )}

          </MapContainer>

        </div>


        {/* --------------------------------------- */}
        {/* MAP STATUS */}
        {/* --------------------------------------- */}

        <div className="map-bottom">

          <div className="map-instruction">

            <span className="instruction-icon">
              👆
            </span>

            <div>
              <strong>
                Select an incident location
              </strong>

              <p>
                Click anywhere on the map to place the
                incident marker.
              </p>
            </div>

          </div>


          {locationMessage && (
            <div className="location-message">
              {locationMessage}
            </div>
          )}

        </div>


        {/* --------------------------------------- */}
        {/* SELECTED LOCATION */}
        {/* --------------------------------------- */}

        {selectedLocation && (

          <div className="selected-map-location">

            <div className="selected-map-icon">
              🚨
            </div>

            <div>

              <span>
                SELECTED INCIDENT LOCATION
              </span>

              <strong>
                Location successfully marked
              </strong>

              <p>
                Latitude:{" "}
                {selectedLocation.lat.toFixed(5)}
                {"  •  "}
                Longitude:{" "}
                {selectedLocation.lng.toFixed(5)}
              </p>

            </div>

          </div>

        )}

      </div>

    </section>
  );
}


export default EmergencyMap;