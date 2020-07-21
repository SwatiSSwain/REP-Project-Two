// Paths to the geoJSON files
let minNbrhoods = "../static/data/Minneapolis_Neighborhoods.geojson";

// Path to data
let useOfForceData = neighborhood_use_of_force;

// Call the neighborhood data
d3.json(minNbrhoods, function (data) {
  createFeatures(data.features)
});

// Creates colors for the map based on the neighborhood id
function neighborhoodColor(id) {
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
    fillColor: neighborhoodColor(feature.properties.FID),
    weight: 2,
    opacity: 1,
    color: 'black',
    fillOpacity: 0.2
  };
};

function incidentColor(severity, resistance) {
  if (severity == 2 && resistance == 1) {
    return "#F4511E";
  } else if (severity = 2 && resistance == 2) {
    return "#FB8C00";
  } else if (severity = 2 && resistance == 3) {
    return "#FDD835";
  } else if (severity = 2 && resistance == 4) {
    return "#C0CA33";
  } else if (severity = 1 && resistance == 1) {
    return "#00897B";
  } else if (severity = 1 && resistance == 2) {
    return "#039BE5";
  } else if (severity = 1 && resistance == 3) {
    return "#9C27B0";
  } else if (severity = 1 && resistance == 4) {
    return "#F06292";
  }else {
    return "#ABB2B9";
  };
};

function legendColor(grade) {
  return grade > 8 ? "#F4511E" :
         grade > 7 ? "#FB8C00" :
         grade > 6 ? "#FDD835" :
         grade > 5 ? "#C0CA33" :
         grade > 4 ? "#00897B" :
         grade > 3 ? "#039BE5" :
         grade > 2 ? "#9C27B0" :
         grade > 1 ? "#F06292" :
                     "#ABB2B9"
}

function createFeatures(neighborhoods) {
  // Create a GeoJSON layer for the neighborhood boundaries
  let minNeighborhoods = L.geoJSON(neighborhoods, {
  // onEachFeature: function (feature, layer) {
  //     layer.bindPopup(`<h5> ${feature.properties.BDNAME} </h5>`)
  // },
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
    .bindPopup(`${incident.police_use_of_force_id}<h6><b> Police Use of Force Type: </b> ${incident.police_use_of_force_type} </h6>
    <h6><b> Police Use of Force Action: </b> ${incident.force_type_action} </h6><hr>
    <h6><b> Subject Type of Resistance: </b> ${incident.type_of_resistance} </h6>
    <h6><b> Subject Race: </b> ${incident.subject_race} </h6>
    <h6><b> Subject Sex: </b> ${incident.subject_sex} </h6>`)

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
    center: [useOfForceData[0].lat, (useOfForceData[0].long - (-0.015))],
    zoom: 13.5,
    layers: [darkmap, neighborhoods, incidents]
  });

  // Set the legend
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    // Code from StackExchange to build up the legend
    var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
    labels = ["Resistance Unspecified/Other", "Not Severe / Not Severe", "Not Severe / More Severe", 
    "Not Severe / Least Severe", "Not Severe / Severe", "Severe / Severe", "Severe /More Severe", 
    "Severe /Least Severe", "Severe / Not Severe"];
    div.innerHTML += `<h8><b><center> Severity of <br>Police Response / Subject Resistance</b></h8><br>`

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += 
          '<i style="background:' + legendColor(grades[i] + 1) + '"></i>' + 
          (labels[i]) + '<br>';
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