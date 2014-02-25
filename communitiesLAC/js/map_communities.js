// initialize map
var map_communities = L.map('map_communities', {scrollWheelZoom: true}).setView([-12.043333, -77.028333], 4);


// function that returns which color to display for point
function getColor(d) {
    return d == "LARRA" ? '#E6976A' :
           d == "LARRA II" ? '#FE5278' :
		   d == "RITA"  ? '#C57AFA' :
           d == "LARRITA" ? '#E1ED19' :
		   d == "Past DDR Community"  ? '#6C84FD' :
		   '#F4F4F4';
}

function communitiesLayerStyle(feature) {
	return {
    "color": '#FFFFFF',
    "weight": .5,
    "opacity": .5,
	"fillOpacity": .8,
	"fillColor": getColor(feature.properties.Type),
	};
}

var communitiesLayer = L.geoJson(undefined,{
	style:communitiesLayerStyle,
	pointToLayer: function(feature, latlng){
		return new L.CircleMarker(latlng, {radius: 7});
	},
	onEachFeature: function (feature, layer) {
         layer.bindPopup("<b>Community: </b>" + feature.properties.Place + "</br><b>Country: </b>" + feature.properties.Admin_0);
    }
}).addTo(map_communities);

// add OSM base layer
var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors.',
    maxZoom: 18
});

// add MapBox base layer of terrain plus streets
var mapboxLayer = L.mapbox.tileLayer('americanredcross.hc5olfpa').addTo(map_communities);

// add data from respective geojson file to communitiesLayer
$.getJSON( "data/communities.geojson", function( data ) {communitiesLayer.addData(data);});

// initialize legend control
var legend = L.control({position: 'bottomright'});

//initialize html code
legend.onAdd = function (map_communities) {
    var div = L.DomUtil.create('div', 'info legend');
	div.innerHTML += '<i style="background: #E6976A"></i>LARRA<br></br>';
	div.innerHTML += '<i style="background: #FE5278"></i>LARRA II<br></br>';
	div.innerHTML += '<i style="background: #C57AFA"></i>RITA<br></br>';
	div.innerHTML += '<i style="background: #E1ED19"></i>LARITA<br></br>';
	div.innerHTML += '<i style="background: #6C84FD"></i>Past DDR Community<br></br>';
	div.innerHTML += '<span style="font-size: 12px; font-style: italic;"> Some program locations may be misplaced or missing.</br>As data is submitted the map can be updated</span>';
    return div;
};

//add the legend html code to the map
legend.addTo(map_communities);

// reset map bounds using Zoom to Extent button
function zoomOut() {
    map_communities.fitBounds(communitiesLayer);
}