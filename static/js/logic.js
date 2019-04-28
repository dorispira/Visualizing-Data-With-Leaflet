// Store earthquakes and tectonic plates GeoJSON URLs as variables
var quakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Create earthquakes and tectonic plates layer groups
var tectonicPlates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Define variables for tile layers
var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.outdoors",
  accessToken: API_KEY
});

// Define a baseMaps object to hold base layers
var baseMaps = {
  "Satellite": satellite,
  "Gray Scale": grayscale,
  "Outdoors": outdoors
};

// Create overlay object to hold overlay layers
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Fault Lines": tectonicPlates,
};

// Create our map, passing in satellite, grayscale, and outdoors layers to display on load
var myMap = L.map("map", {
  center: [37.09, -95.71],
  zoom: 4,
  layers: [satellite, earthquakes]
});

// Create a layer control to pass in the baseMaps and overlayMaps
// Add layer control to map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);


// Use D3 to retrieve earthquake data from the query URL
d3.json(quakesUrl, function(quakesData) {
  
  // Function to determine marker size based on earthquake magnitude
  function markerSize(mag) {
    if (mag === 0) {
      return 1;
    }
    return mag * 3;
  }
  // Function to determine marker style based on earthquake magnitude
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: chooseColor(feature.properties.mag),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }
  // Function to determine color of marker based on earthquake magnitude
  function chooseColor(mag) {
    switch (true) {
    case mag > 5:
        return "#c4058b";
    case mag > 4:
        return "#93b7ed";
    case mag > 3:
        return "#007fba";
    case mag > 2:
        return "#ba62e0";
    case mag > 1:
        return "#d679e0";
    default:
        return "#a5f7da";
    }
  }
  
  // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
  L.geoJSON(quakesData, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: styleInfo,
    
    // Function runs once for each feature in features array
    // Provide each feature a pop-up with time and place details of the earthquake
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h4>Location: " + feature.properties.place + 
        "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
        "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }
  // Add quakesData to earthquakes LayerGroups 
  }).addTo(earthquakes);
  
  // Add earthquakes layer to map
  earthquakes.addTo(myMap);

  // Use D3 to retrieve tectonic plates data from the plates URL
  d3.json(platesURL, function(plateData) {
      
    // Create a GeoJSON layer for plateData
      L.geoJson(plateData, {
          color: "#e55e79",
          weight: 2
      
      // Add plateData to tectonicPlates LayerGroups
      }).addTo(tectonicPlates);
      
      // Add tectonicPlates layer to the Map
      tectonicPlates.addTo(myMap);
  });

  // Create legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
      var div = L.DomUtil.create("div", "info legend"), 
      magnitudeLevels = [0, 1, 2, 3, 4, 5],
      labels = [];

      div.innerHTML += "<h3>Magnitude</h3>"

      for (var i = 0; i < magnitudeLevels.length; i++) {
          div.innerHTML +=
              '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
              magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
      }
      return div;
  };
  // Add Legend to the Map
  legend.addTo(myMap);

});