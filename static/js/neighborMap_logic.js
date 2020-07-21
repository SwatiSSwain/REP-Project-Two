// Paths to the geoJSON files
let minNbrhoods = "../static/data/Minneapolis_Neighborhoods.geojson";

// Path to data
let useOfForceData = neighborhood_use_of_force;

console.log(useOfForceData);
// Call the neighborhood data
d3.json(minNbrhoods, function (data) {
  createFeatures(data.features)
});

// Creates colors for the map based on the neighborhood id
function getColor(id) {
  return id > 80 ? '#800026' :
         id > 70 ? '#BD0026' :
         id > 60 ? '#E31A1C' :
         id > 50 ? '#FC4E2A' :
         id > 40 ? '#FD8D3C' :
         id > 30 ? '#FEB24C' :
         id > 20 ? '#FED976' :
         id > 10 ? '#FFEDA0' :
                   '#99d8c9';
};

// Sets the style of the neighborhood
function style(feature) {
  return {
    fillColor: getColor(feature.properties.FID),
    weight: 2,
    opacity: 1,
    color: 'black',
    fillOpacity: 0.2
  };
};

/* severity: 2 most, 1 least
   type of resistance: 4 most, 1 least
*/

function incidentColor(severity, resistance) {
  if (severity == 2 && resistance == 4) {
    return "red";
  } else if (severity = 2 && resistance == 3) {
    return "orange";
  } else if (severity = 2 && resistance == 2) {
    return "yellow";
  } else if (severity = 2 && resistance == 1) {
    return "green";
  } else if (severity = 1 && resistance == 4) {
    return "purple";
  } else if (severity = 1 && resistance == 3) {
    return "indigo";
  } else if (severity = 1 && resistance == 2) {
    return "pink";
  } else {
    return "blue";
  };

  };

function createFeatures(neighborhoods) {
  // Create a GeoJSON layer for the neighborhood boundaries
  let minNeighborhoods = L.geoJSON(neighborhoods, {
  onEachFeature: function (feature, layer) {
      layer.bindPopup(`<h5> ${feature.properties.BDNAME} </h5>`)
  },
  pointToLayer: function (feature) {
      return L.polyline (feature.geometry.coordinates)
  },
  style: style
  });

  createMap(minNeighborhoods);
};

// Build the map
function createMap(neighborhoods) {
  // Adding tile layer
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
    });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  let incidentMarker = [];
  
  // Loop through data
  useOfForceData.forEach(function (incident) {
    // create the markers
    let marker = L.circleMarker([incident.lat, incident.long], {
      color: "white",
      fillColor: incidentColor(incident.severity_of_force, incident.severity_of_resistance),
      weight: 1,
      fillOpacity: 1,
      radius: 5
    })
    .bindPopup(`<h3> Force Type: ${incident.police_use_of_force_type}`)

    incidentMarker.push(marker);
  });

  let incidents = L.layerGroup(incidentMarker);
  
  // Define a baseMaps object to hold base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Neighborhoods: neighborhoods,
    Incidents: incidents
  };

  // Creating map object
  let myMap = L.map("map-neighborhood", {
    center: [useOfForceData[0].lat, useOfForceData[0].long],
    zoom: 13.5,
    layers: [darkmap, neighborhoods, incidents]
  });

  // Set the legend
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    // Code from StackExchange to build up the legend
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [1, 2, 3, 4, 5, 6, 7, 8],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + incidentColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    };

    return div;
  };
  
  legend.addTo(myMap);
 
  // Create layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

};