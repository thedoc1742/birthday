function gps_distance(lat1, lon1, lat2, lon2)
{
	// http://www.movable-type.co.uk/scripts/latlong.html
    var R = 6371; // km
    var dLat = (lat2-lat1) * (Math.PI / 180);
    var dLon = (lon2-lon1) * (Math.PI / 180);
    var lat1 = lat1 * (Math.PI / 180);
    var lat2 = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    
    return d;
}

document.addEventListener("deviceready", function(){
	
	if(navigator.network.connection.type == Connection.NONE){
		$("#home_network_button").text('No Internet Access')
								 .attr("data-icon", "delete")
								 .button('refresh');
	}

});

var track_id = '';      // Name/ID of the exercise
var watch_id = null;    // ID of the geolocation
window.tracking_data = []; // Array containing GPS position objects
var birthdaymarkers = [];
var map = null;
var marker = null;
var iconbirthdaymarkerimage = {
    url: 'icon_birthday.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(20, 30),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 30)
};
var iconbirthdayschatzimage = {
    url: 'schatz.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(0, 50)
};


$("#startTracking_start").live('click', function(){
	// Start tracking the User
    watch_id = navigator.geolocation.watchPosition(
    
    	// Success
        function(position){
            window.tracking_data.push(position);
            console.log(window.tracking_data);
        },
        
        // Error
        function(error){
            console.log(error);
        },
        
        // Settings
        { frequency: 3000, maximumAge: 3000, enableHighAccuracy: true });
    
    // Tidy up the UI
    track_id = $("#track_id").val();
    
    $("#track_id").hide();
    
    $("#startTracking_status").html("Tracking workout: <strong>" + track_id + window.tracking_data + "</strong>");
});

$("#startTracking_stop").live('click', function(){
	
	// Stop tracking the user
  navigator.geolocation.clearWatch(watch_id);
	
  console.log(window.tracking_data);	
	// Save the tracking data
	window.localStorage.setItem(track_id, JSON.stringify(window.tracking_data));

	// Reset watch_id and window.tracking_data 
	watch_id = null;
	window.tracking_data = [];

	// Tidy up the UI
	$("#track_id").val("").show();
	
	$("#startTracking_status").html("Stopped tracking workout: <strong>" + track_id + "</strong>");

});

$("#home_clearstorage_button").live('click', function(){
	window.localStorage.clear();
});

$("#home_seedgps_button").live('click', function(){

    watch_id = navigator.geolocation.watchPosition(
    
    	// Success
        function(position){
            window.tracking_data.push(position);
            window.localStorage.setItem('Sample block', JSON.stringify(window.tracking_data));
        },
        
        // Error
        function(error){
            console.log(error);
        },
        
        // Settings
        { frequency: 3000, maximumAge: 3000, enableHighAccuracy: true });
  
     window.tracking_data = [];
	
});

$('#newhome').live("pagebeforeshow", function() {

        navigator.geolocation.getCurrentPosition(function(position){

            //showMap('mapHome',position.coords.latitude, position.coords.longitude);// Canvas, lat, long

            var latLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

            // Google Map options
            var myOptions = {
                mapTypeControlOptions: {
                },zoom: 17,
                //zoomControl   : 1,
                center: latLng,
                mapTypeId: 'Birthday Style'////ROADMAP, SATELLITE, HYBRID and TERRAIN
            };      

            // Create the Google Map, set options
            map = new google.maps.Map(document.getElementById('google_map'), myOptions);

            marker = new google.maps.Marker({
               position: latLng,
               map: map,
               title: 'Da bin ich!'
            });
            
            $.getJSON( 'http://www.doc-richter.de/geo/birthday.json', function(data) { 
            $.each( data.markers, function(i, marker) {
              var markerposition = new google.maps.LatLng(marker.latitude,marker.longitude);
              console.log(i+' '+markerposition);
              var seticon = null;
              if(marker.type == "actionpoint") {
                seticon = iconbirthdaymarkerimage;
              } else {
                seticon = iconbirthdayschatzimage;
              } 
              
              var m = new google.maps.Marker({
                 position: markerposition,
                 map: map,
                 title: marker.title,
                 icon: seticon
               });
              
              birthdaymarkers.push(m);
            });
            });

            var featureOpts = [
  {
    "stylers": [
      { "color": "#a58080" },
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "simplified" },
      { "color": "#de80b8" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
  
];



    var styledMapOptions = {
      name: 'Birthday Style'
    };

    var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

    map.mapTypes.set('Birthday Style', customMapType);

            //addMarker(position.coords.latitude,position.coords.longitude);

        }, 
        showError, 
        {

                enableHighAccuracy  : true,
                maximumAge          : 2000
                //maximumAge:Infinity
        });
})  

$('#newhome').live("pageshow", function() {

        // Place and move the marker regarding to my position and deplacement
    
        //var track_id = "me";
        watch_id = navigator.geolocation.watchPosition(
        // Success
        function(position){

            var lat = position.coords.latitude;
            var long = position.coords.longitude;

            var latLng = new google.maps.LatLng(lat,long);
            
            moveMe(map,marker,latLng);
            
        },
        // Error
        showError,
        { 
            frequency: 1000

        });

        console.log('HW : WatchPosition called. Id:' + watch_id);

})

function moveMe( map, marker, position ) {

    marker.setPosition(position);
    map.panTo(position);

};

function showError() {

    alert("Error!!");

};

$('#newhome').live("pagebeforehide", function() {

        //track_id = "me";

        // Stop tracking the user

        if (watch_id != null) {
            navigator.geolocation.clearWatch(watch_id);
        }


        //navigator.geolocation.clearWatch(Tracking.watch_id);
});

// When the user views the history page
$('#history').live('pageshow', function () {
	
	// Count the number of entries in localStorage and display this information to the user
	tracks_recorded = window.localStorage.length;
	$("#tracks_recorded").html("<strong>" + tracks_recorded + "</strong> workout(s) recorded");
	
	// Empty the list of recorded tracks
	$("#history_tracklist").empty();
	
	// Iterate over all of the recorded tracks, populating the list
	for(i=0; i<tracks_recorded; i++){
		$("#history_tracklist").append("<li><a href='#track_info' data-ajax='false'>" + window.localStorage.key(i) + "</a></li>");
	}
	
	// Tell jQueryMobile to refresh the list
	$("#history_tracklist").listview('refresh');

});

// When the user clicks a link to view track info, set/change the track_id attribute on the track_info page.
$("#history_tracklist li a").live('click', function(){

	$("#track_info").attr("track_id", $(this).text());
	
});


// When the user views the Track Info page
$('#track_info').live('pageshow', function(){

	// Find the track_id of the workout they are viewing
	var key = $(this).attr("track_id");
	
	// Update the Track Info page header to the track_id
	$("#track_info div[data-role=header] h1").text(key);
	
	// Get all the GPS data for the specific workout
	var data = window.localStorage.getItem(key);
	
	// Turn the stringified GPS data back into a JS object
	data = JSON.parse(data);

	// Calculate the total distance travelled
	total_km = 0;

	for(i = 0; i < data.length; i++){
	    if(i == (data.length - 1)){
	        break;
	    }
	    total_km += gps_distance(data[i].coords.latitude, data[i].coords.longitude, data[i+1].coords.latitude, data[i+1].coords.longitude);
	}
	
	total_km_rounded = total_km.toFixed(2);
	
	// Calculate the total time taken for the track
	start_time = new Date(data[0].timestamp).getTime();
	end_time = new Date(data[data.length-1].timestamp).getTime();

	total_time_ms = end_time - start_time;
	total_time_s = total_time_ms / 1000;
	
	final_time_m = Math.floor(total_time_s / 60);
	final_time_s = total_time_s - (final_time_m * 60);

	// Display total distance and time
	$("#track_info_info").html('Travelled <strong>' + total_km_rounded + '</strong> km in <strong>' + final_time_m + 'm</strong> and <strong>' + final_time_s + 's</strong>');
	
	// Set the initial Lat and Long of the Google Map
	var myLatLng = new google.maps.LatLng(data[0].coords.latitude, data[0].coords.longitude);

	// Google Map options
	var myOptions = {
      mapTypeControlOptions: {
              mapTypeIds: ['custom_style']
      },
      zoom: 15,
      center: myLatLng,
      mapTypeId: 'custom_style'
    };

    var featureOpts = [
  {
    "stylers": [
      { "color": "#a58080" },
      { "visibility": "simplified" }
    ]
  },{
    "featureType": "road",
    "stylers": [
      { "visibility": "simplified" },
      { "color": "#de80b8" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      { "visibility": "on" }
    ]
  }
];


    // Create the Google Map, set options
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var styledMapOptions = {
      name: 'Birthday Style'
    };

    var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

    map.mapTypes.set('custom_style', customMapType);

    var trackCoords = [];
    
    // Add each GPS entry to an array
    for(i=0; i<data.length; i++){
    	trackCoords.push(new google.maps.LatLng(data[i].coords.latitude, data[i].coords.longitude));
    }
    
    // Plot the GPS entries as a line on the Google Map
    var trackPath = new google.maps.Polyline({
      path: trackCoords,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    // Apply the line to the map
    trackPath.setMap(map);
		
});

