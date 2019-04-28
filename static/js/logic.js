// Function to handle marker change colors
function markerColor(mag) {
  if (mag <= 1) {
      return "#ADFF2F";
  } else if (mag <= 2) {
      return "#9ACD32";
  } else if (mag <= 3) {
      return "#FFFF00";
  } else if (mag <= 4) {
      return "#ffd700";
  } else if (mag <= 5) {
      return "#FFA500";
  } else {
      return "#FF0000";
  };
}


// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


API_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

var plateBoundary = new L.LayerGroup();

d3.json(API_plates, function (geoJson) {
   L.geoJSON(geoJson.features, {
       style: function (geoJsonFeature) {
           return {
               weight: 2,
               color: 'Red '
           }
       },
   }).addTo(plateBoundary);
})


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  

  var earthquakeMarkers = [];

  for (var i = 0; i < earthquakeData.length; i++) {
    //markerColor(earthquakeData[i].properties.mag);
    earthquakeMarkers.push(L.circle([earthquakeData[i].geometry.coordinates[1],earthquakeData[i].geometry.coordinates[0]], {
      fillOpacity: 0.75,
      color: markerColor(earthquakeData[i].properties.mag),
      fillColor: markerColor(earthquakeData[i].properties.mag),
      // Adjust radius
      radius: earthquakeData[i].properties.mag * 30000 
    }).bindPopup("<h1>Hello</h3>") 
    )

    // Now we can handle them as one group instead of referencing each individually
    var earthquakeLayer = L.layerGroup(earthquakeMarkers);
  }

    
    // Sending our earthquakes layer to the createMap function  
    createMap(earthquakeLayer);
  }
    

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
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

  var outdors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });



  
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellite,
    "Gray Scale Map": grayscale,
    "Outdors Map": outdors
  };


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Plates Boundary": plateBoundary,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [satellite, earthquakes, plateBoundary]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}




