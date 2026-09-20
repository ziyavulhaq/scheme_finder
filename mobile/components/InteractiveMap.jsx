import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform, Text } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS } from "../constants/theme";

export const InteractiveMap = ({
  userLocation = { lat: 11.01515, lng: 76.976618 },
  partners = [],
  selectedPartner = null,
  onSelectPartner = () => {},
  height = 280,
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef(null);

  // Generate HTML for Leaflet Map
  const generateMapHtml = () => {
    const safeUserLat = Number(userLocation?.lat) || 11.01515;
    const safeUserLng = Number(userLocation?.lng) || 76.976618;

    const partnersJson = JSON.stringify(
      partners
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          id: p.id,
          name: p.name,
          shortName: p.shortName || p.name,
          type: p.type,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          dist: p.distance,
          addr: p.address,
          phone: p.phone,
          status: p.utilizationStatus || "Available",
          directionsUrl:
            p.directionsUrl ||
            `https://www.google.com/maps/dir/?api=1&origin=${safeUserLat},${safeUserLng}&destination=${p.latitude},${p.longitude}&travelmode=driving`,
        }))
    );

    const selectedPartnerId = selectedPartner ? String(selectedPartner.id) : "";

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; background: #F1ECE0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    /* User Location Pulsing Pin */
    .user-pulse-pin {
      position: relative;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-pulse-circle {
      position: absolute;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(185, 122, 28, 0.4);
      animation: pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    .user-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #B97A1C;
      border: 2px solid #FFFFFF;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      z-index: 2;
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Teardrop Partner Pin */
    .partner-pin {
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .partner-pin-letter {
      transform: rotate(45deg);
      color: white;
      font-weight: 800;
      font-size: 11px;
      font-family: sans-serif;
    }

    /* Popup Styling */
    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      padding: 0;
      border: 1px solid #D8D2C4;
      overflow: hidden;
    }
    .leaflet-popup-content {
      margin: 10px 12px;
      font-size: 11.5px;
      line-height: 1.4;
      color: #2B2A28;
      max-width: 220px;
    }
    .popup-title {
      font-weight: 800;
      font-size: 12.5px;
      color: #1F3A5F;
      margin-bottom: 3px;
    }
    .popup-type {
      font-size: 10px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }
    .type-sca { background: #E4EEE7; color: #3B6E52; }
    .type-bank { background: #E6ECF5; color: #1F3A5F; }
    .type-rrb { background: #FBEBD2; color: #B97A1C; }
    .popup-dist {
      color: #3B6E52;
      font-weight: 800;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .popup-addr {
      color: #6B6558;
      font-size: 10.5px;
      margin-bottom: 6px;
      line-height: 1.3;
    }
    .popup-btn-row {
      display: flex;
      gap: 6px;
      margin-top: 6px;
    }
    .popup-btn {
      flex: 1;
      text-align: center;
      padding: 5px 8px;
      border-radius: 6px;
      font-size: 10.5px;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      display: inline-block;
    }
    .btn-select {
      background: #1F3A5F;
      color: white;
      border: none;
    }
    .btn-directions {
      background: #3B6E52;
      color: white;
      border: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${safeUserLat}, ${safeUserLng}],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // User Marker
    var userIcon = L.divIcon({
      className: '',
      html: '<div class="user-pulse-pin"><div class="user-pulse-circle"></div><div class="user-dot"></div></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    L.marker([${safeUserLat}, ${safeUserLng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div class="popup-title">Your Search Origin</div><div class="popup-addr">GPS / Search Coordinates</div>');

    // Partner Markers
    var partners = ${partnersJson};
    var selectedId = "${selectedPartnerId}";
    var markersMap = {};

    partners.forEach(function(p) {
      var isSCA = p.type && p.type.indexOf("State Channelizing") !== -1;
      var isRRB = p.type && p.type.indexOf("Rural") !== -1;
      var bg = isSCA ? "#3B6E52" : (isRRB ? "#B97A1C" : "#1F3A5F");
      var letter = isSCA ? "S" : (isRRB ? "R" : "B");
      var typeClass = isSCA ? "type-sca" : (isRRB ? "type-rrb" : "type-bank");

      var pIcon = L.divIcon({
        className: '',
        html: '<div class="partner-pin" style="background: ' + bg + ';"><span class="partner-pin-letter">' + letter + '</span></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -26]
      });

      var popupHtml = '<div class="popup-title">' + (p.shortName || p.name) + '</div>' +
        '<span class="popup-type ' + typeClass + '">' + p.type + '</span>' +
        '<div class="popup-dist">' + p.dist + ' km away (Shortest Route)</div>' +
        '<div class="popup-addr">' + p.addr + '</div>' +
        '<div class="popup-btn-row">' +
          '<a href="' + p.directionsUrl + '" target="_blank" class="popup-btn btn-directions">Directions</a>' +
          '<button onclick="selectBranch(\\'' + p.id + '\\')" class="popup-btn btn-select">Select</button>' +
        '</div>';

      var marker = L.marker([p.lat, p.lng], { icon: pIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', function() {
        selectBranch(p.id);
      });

      markersMap[p.id] = marker;

      if (p.id === selectedId) {
        marker.openPopup();
      }
    });

    function selectBranch(id) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_PARTNER', id: id }));
      }
      if (markersMap[id]) {
        markersMap[id].openPopup();
        map.panTo(markersMap[id].getLatLng());
      }
    }

    // Auto fit bounds if partners exist
    if (partners.length > 0) {
      var bounds = L.latLngBounds([[${safeUserLat}, ${safeUserLng}]]);
      partners.slice(0, 8).forEach(function(p) {
        bounds.extend([p.lat, p.lng]);
      });
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
    }

    // Inform host webview that map is ready
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
    }
  </script>
</body>
</html>`;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "MAP_READY") {
        setMapLoaded(true);
      } else if (data.type === "SELECT_PARTNER") {
        const found = partners.find((p) => String(p.id) === String(data.id));
        if (found) {
          onSelectPartner(found);
        }
      }
    } catch (err) {}
  };

  const mapHtml = generateMapHtml();

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { height }]}>
        <iframe
          srcDoc={mapHtml}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="Interactive Bank Locator Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHtml }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        onLoadEnd={() => setMapLoaded(true)}
      />
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primaryNavy} />
          <Text style={styles.loadingText}>Loading OpenStreetMap...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
    position: "relative",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  loadingText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
});
