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
var birthdayinfowindows = [];
var birthdaymarkerpositions = [];
var map = null;
var marker = null;

var iconbirthdaymarkerimage = {
    url: 'icon_birthday.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(30, 32),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(16, 16)
};

var meicon = {
    url: 'group.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(60, 60),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(30, 30)
};

var iconbirthdayschatzimage = {
    url: 'schatz.png',
    // This marker is 20 pixels wide by 32 pixels tall.
    size: new google.maps.Size(50, 50),
    // The origin for this image is 0,0.
    origin: new google.maps.Point(0,0),
    // The anchor for this image is the base of the flagpole at 0,32.
    anchor: new google.maps.Point(25, 25)
};

$.getJSON( 'http://www.doc-richter.de/geo/birthday.json', function(data) { 
            $.each( data.markers, function(i, marker) {
              var markerposition = new google.maps.LatLng(marker.latitude,marker.longitude);
              birthdaymarkerpositions.push(markerposition);
            })
});

$('#newhome').live("pagebeforeshow", function() {

        navigator.geolocation.getCurrentPosition(function(position){

            //showMap('mapHome',position.coords.latitude, position.coords.longitude);// Canvas, lat, long

            var latLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

            // Google Map options
            var myOptions = {
                zoom: 16,
                disableDefaultUI: true,
                //zoomControl   : 1,
                center: latLng,
                mapTypeId: 'Birthday Style'////ROADMAP, SATELLITE, HYBRID and TERRAIN
            };      

            // Create the Google Map, set options
            map = new google.maps.Map(document.getElementById('google_map'), myOptions);

            

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

            marker = new google.maps.Marker({
               position: latLng,
               map: map,
               icon: meicon,
               title: 'Da sind wir!'
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
               
               var infowindow = new google.maps.InfoWindow({
                map: map,
                position: markerposition,
                content: '<div style="width:170px; height:20px">'+marker.content+'</div><div id="marker'+i+'">xxx</div>',
                maxWidth: 2000
               });
              
              birthdaymarkers.push(m);
              birthdayinfowindows.push(infowindow);
              
              
            });
            });

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

            var latT = position.coords.latitude;
            var longT = position.coords.longitude;

            var latLng = new google.maps.LatLng(latT,longT);
            
            moveMe(map,marker,latLng);
            console.log('MOVEd');
            console.log(birthdaymarkerpositions);
            for(i = 0; i<birthdaymarkerpositions.length; i++) {
              console.log('Drin '+i);
              $('#marker'+i).html(''+gps_distance(latT,longT,birthdaymarkerpositions[i].lat,birthdaymarkerpositions[i].lng));
            }            
            console.log('Draussen');
            
            
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


