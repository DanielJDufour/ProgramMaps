var geojson = L.geoJson();
var worldCountries = [];
var arcPrograms = [];
var sectorList = [];
var worldColored = [];
var displayedCountryNames = [];
var displayedProgramData = [];
var formattedSectorName = "";

var center = new L.LatLng(30, 0);
var bounds = new L.LatLngBounds([90, 200], [-80, -200]);

var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    // zoomControl: false,
    maxBounds: bounds,
    doubleClickZoom: false
});

// method to update the info div based on feature properties passed
info.update = function (props) {
    var infoContent = (props ? props.name : 'Click on a country') + "</p><ul class='programList'>";
    var selectedCountry = (props? props.name.toUpperCase() : 'none')   
    $.each(displayedProgramData, function (ai, program) {
            var pName = program.COUNTRY.toUpperCase();
            var imageCode = program.SECTOR_PRIMARY.toLowerCase().replace(/\s+/g, '').replace(/-/g, '').replace(/\//g, '');
            if (pName === selectedCountry) {
                infoContent += "<li class='programListItem'><img class='imageBullet' title='" + program.SECTOR_PRIMARY+ "'' src=images/" + imageCode + ".png>" + program.PROJECT_NAME + "</li>";
            }
    });
    infoContent += "</ul>";
    $('#programInfo').empty();     
    $('#programInfo').append(infoContent);
};

function mapStyle(feature) {
    return{
    fillColor: feature.properties.mapColor,
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 1
    };
}

var featureEvents = function (feature, layer) {
    layer.on({
        click: countryClick,
        mouseover: displayName,
        mouseout: clearName
    });       
}

function displayName (e) {    
    var country = e.target;
    var tooltipText = country.feature.properties.name;
    $('#tooltip').append(tooltipText);     
}
function clearName (e) {
    $('#tooltip').empty();
}

function countryClick (e) {
    geojson.setStyle(mapStyle);
    var country = e.target;    
    country.setStyle({
        weight: 5,
        color: '#fed53c',
        dashArray: '',
        fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        country.bringToFront();
    }
    info.update(country.feature.properties);  
}


function getWorld() {
    $.ajax({
        type: 'GET',
        url: 'data/worldCountries.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            worldCountries = json;
            getARC();   
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function getARC() {
    $.ajax({
        type: 'GET',
        url: 'data/arcPrograms.json',
        contentType: 'application/json',
        dataType: 'json',
        timeout: 10000,
        success: function(json) {
            arcPrograms = json;
            createSectorsDropdown();
            colorMap();
        },
        error: function(e) {
            console.log(e);
        }
    });
}

function createSectorsDropdown() {
    $.each(arcPrograms, function (ai, program) {
        var aSector = program.SECTOR_PRIMARY
        if ($.inArray(aSector, sectorList) === -1) {
            sectorList.push(aSector);
        };
    });
    var sectorsDropdown = document.getElementById("sectorInput");
    for(var i = 0; i < sectorList.length; i++) {
        var option = sectorList[i];
        formatSectorName(option);
        var el = document.createElement("option");
        el.textContent = formattedSectorName;
        el.value = option;
        sectorsDropdown.appendChild(el);
    }
}

function formatSectorName(option) {
    if (option == "Measles") {
        formattedSectorName = "Measles Vaccination Campaign";
    } else if (option == "OD"){
        formattedSectorName = "Organizational Development";
    } else {
        formattedSectorName = option;
    }
}


function colorMap() {
    map.removeLayer(geojson);
    info.update();    
    worldColored = worldCountries;
    displayedCountryNames = [];
    displayedProgramData = [];
    // get selected year
    var yearIndex = document.getElementById("yearInput").selectedIndex;
    var yearOptions = document.getElementById("yearInput").options;
    var year = yearOptions[yearIndex].value;
    var yearChoice = parseInt(year);
    // get selected sector
    var sectorIndex = document.getElementById("sectorInput").selectedIndex;
    var sectorOptions = document.getElementById("sectorInput").options;
    var sectorChoice = sectorOptions[sectorIndex].value;
    // populate arrays *data for displayed programs* and *names for displayed countries*
    $.each(arcPrograms, function (ai, program) {
        var currentCountry = program.COUNTRY.toUpperCase();
        var currentProgramSector = program.SECTOR_PRIMARY;
        var startYear = new Date(program["Project Period START_DT"]).getFullYear();
        var endYear = new Date (program["Project Period END_DT"]).getFullYear();
        if (yearChoice == startYear || yearChoice == endYear || (yearChoice < endYear && yearChoice > startYear)) {
            if (sectorChoice == currentProgramSector || sectorChoice == "ALL") {
                displayedProgramData.push(program);
                if ($.inArray(currentCountry, displayedCountryNames) === -1) {
                displayedCountryNames.push(currentCountry);
                };
            };            
        };       
    });
    // add map color property to each geojson country based on names list of displayed countries
    $.each(worldColored.features, function (ci, country) {
        var currentCountry = country.properties.name.toUpperCase();
        if ($.inArray(currentCountry, displayedCountryNames) === -1) {
            country.properties.mapColor = "#D7D7D8";
        } else {
            country.properties.mapColor = 'red';
        }
    });
    // Add country polygons to map
    geojson = L.geoJson(worldColored, {
        style: mapStyle,
        onEachFeature: featureEvents
    }).addTo(map);     
}



// doubleclick (not on a country) clears infobox (remove this?)
function clearCountry(e) {
    geojson.setStyle(mapStyle);
    info.update();    
}
   
map.on('dblclick', clearCountry);


// Trailing tooltip displays country name on mouseover
$(document).ready(function() {
    //Select all anchor tag with rel set to tooltip
    $('#container').mouseover(function(e) {        
        //Set the X and Y axis of the tooltip
        $('#tooltip').css('top', e.pageY + 10 );
        $('#tooltip').css('left', e.pageX + 20 );         
    }).mousemove(function(e) {    
        //Keep changing the X and Y axis for the tooltip, thus, the tooltip move along with the mouse
        $("#tooltip").css({top:(e.pageY+15)+"px",left:(e.pageX+20)+"px"});        
    }).mouseout(function() {    
        //Put back the title attribute's value
        $(this).attr('title',$('.tipBody').html());    
        //Remove the appended tooltip template
        $(this).children('div#tooltip').remove();   
    });
});



getWorld();
info.update();




