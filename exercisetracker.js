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
    
    return Math.round(d*1000);
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
var distnext = null;
var nextmarker = null;
var nextmarkerposition = null;

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

window.localStorage.setItem('nextmarker', null);
window.localStorage.setItem('accurancy', '10');
window.localStorage.setItem('runtype', 'live');




$.getJSON( 'http://www.doc-richter.de/geo/birthday.json', function(data) {
            var setnext = false; 
            $.each( data.markers, function(i, marker) {
              if(marker.visited == "false" && !setnext) {
                 window.localStorage.setItem('nextmarker', JSON.stringify(marker));
                 setnext = true;
              }
              var markerposition = new google.maps.LatLng(marker.latitude,marker.longitude);
              birthdaymarkerpositions.push(markerposition);
            });
            var localData = JSON.stringify(data);
            window.localStorage.setItem('visitedmarkers', localData);
            window.localStorage.setItem('accurancy',''+data.accurancy);
            window.localStorage.setItem('runtype',''+data.runtype);
            
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
               title: 'Da sind wir!',
               draggable: true
            });
            
            myListener = google.maps.event.addListener(map, 'click', function(event) {
              moveMe(map,marker,event.latLng);
            });
            google.maps.event.addListener(map, 'drag', function(event) {
              placeMarker(map,marker,event.latLng);
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
            
            var rt = window.localStorage.getItem('runtype');
            
            alert(rt);
            
            if(rt == "debug") {
              alert('drin '+rt);
              latT  = marker.latitude;
              longT = marker.longitude;
              latLng = new google.maps.LatLng(latT,longT);
            } 
            
            moveMe(map,marker,latLng);
            
            console.log(window.localStorage.getItem('visitedmarkers'));
            
            vM = $.parseJSON( window.localStorage.getItem('visitedmarkers'));
            
            var nextMarker = JSON.parse(window.localStorage.getItem('nextmarker'));
            
            var markerposition = new google.maps.LatLng(nextMarker.latitude,nextMarker.longitude);
            var seticon = null;
              
                  if(nextMarker.type == "actionpoint") {
                    seticon = iconbirthdaymarkerimage;
                  } else {
                    seticon = iconbirthdayschatzimage;
                  } 
              
                  console.log(seticon);
              
                  var m = new google.maps.Marker({
                    position: markerposition,
                    map: map,
                    title: nextMarker.title,
                    icon: seticon
                  });
            
            
            var acc = parseInt(window.localStorage.getItem('accurancy'));
            var nextMarkerPosition = new google.maps.LatLng(nextMarker.latitude,nextMarker.longitude)
            var dist = gps_distance(latT,longT,nextMarker.latitude,nextMarker.longitude);
            console.log(nextMarker.latitude+' '+nextMarker.longitude+' '+dist);
            if(dist < acc) {
            
                  var infowindow = new google.maps.InfoWindow({
                    map: map,
                    position: nextMarkerPosition,
                    content: '<div id="nextmarker">'+nextMarker.title+'</div>',
                    maxWidth: 2000
                  });
                  
                  setVisited(nextMarker.id);
                  setNextMarker(nextMarker.id+1);
            } 
            
            $('#distance').html(dist);
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

function setVisited(id) {
    console.log('Set visited: '+id);
    var jsonObj = $.parseJSON( window.localStorage.getItem('visitedmarkers'));
    for (var i=0; i<jsonObj.markers.length; i++) {
    console.log(jsonObj.markers[i]);
    if (jsonObj.markers[i].id == id) {
      jsonObj.markers[i].visited = "true";
    }
    }
    window.localStorage.setItem('visitedmarkers',JSON.stringify(jsonObj));
}

function setNextMarker(id) {
    console.log('Set next marker: '+id);
    var jsonObj = $.parseJSON( window.localStorage.getItem('visitedmarkers'));
    for (var i=0; i<jsonObj.markers.length; i++) {
    if (jsonObj.markers[i].id == id) {
      window.localStorage.setItem('nextmarker',JSON.stringify(jsonObj.markers[i]));
      return;
    }
    }
    
}

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


