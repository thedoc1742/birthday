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

var nM = null;

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
              updateAll(false);
            });
            myDragListener = google.maps.event.addListener(map, 'drag', function(event) {
              moveMe(map,marker,event.latLng);
              updateAll(false);
            });
        }, 
        showError, 
        {

                enableHighAccuracy  : true,
                maximumAge          : 2000
                //maximumAge:Infinity
        });
})  

function toggleTaschenlampe() {
 window.plugins.flashlight.available(function(isAvailable) {
  if (isAvailable) {

    // switch on
    window.plugins.flashlight.toggle(); // success/error callbacks may be passed

    // switch off after 3 seconds
 
  } else {
    alert("Flashlight not available on this device");
  }
 });
}

document.addEventListener("backbutton", function() {
  // pass exitApp as callbacks to the switchOff method
  window.plugins.flashlight.switchOff(exitApp, exitApp);
}, false);

function exitApp() {
  navigator.app.exitApp();
}

function updateAll(trigger) {
            var latT = marker.position.lat();
            var longT = marker.position.lng();

            var latLng = new google.maps.LatLng(latT,longT);
            
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
            
            if (nM == null || trigger) {
              
                  nM = new google.maps.Marker({
                    position: markerposition,
                    map: map,
                    title: nextMarker.title,
                    icon: seticon
                  });
            
            }
            
            var acc = parseInt(window.localStorage.getItem('accurancy'));
           
            var nextMarkerPosition = new google.maps.LatLng(nextMarker.latitude,nextMarker.longitude)
            var dist = gps_distance(latT,longT,nextMarker.latitude,nextMarker.longitude);
            console.log(nextMarker.latitude+' '+nextMarker.longitude+' '+dist);
            var nextMarkerPopup = '#popup'+nextMarker.id;
            
            if(dist < acc && $(nextMarkerPopup).parent().hasClass('ui-popup-hidden')) {
            
                  $(nextMarkerPopup).popup("open");
                  setVisited(nextMarker.id);
                  
            } 
            
            $('#distance').html(dist);

}

$('#newhome').live("pageshow", function() {
        
        // Place and move the marker regarding to my position and deplacement
        $('#flashlight').click(function() {
           toggleTaschenlampe();
        });
        
        $('#antwort11').click(function() {
           console.log("antwort11");
           $('#antwortlayer1').hide();
           $('#correctlayer1').show();
        });
        $('#antwort12').click(function() {
           console.log("antwort12");
           $('#antwortlayer1').hide();
           $('#errorlayer1').show();
        });
        $('#antwort13').click(function() {
           console.log("antwort13");
           $('#antwortlayer1').hide();
           $('#errorlayer1').show();
        });
        $('#again1').click(function() {
           console.log("again1");
           $('#errorlayer1').hide();
           $('#antwortlayer1').show();
        });
        $('#home1').click(function() {
           console.log("home1");
           $('#errorlayer1').hide();
           $('#antwortlayer1').show();
        });
        $('#close1').click(function() {
           console.log("close1");
           $('#popup1').popup("close");
           setNextMarker(2);
        });
        
        $('#antwort21').click(function() {
           console.log("antwort21");
           $('#antwortlayer2').hide();
           $('#errorlayer2').show();
        });
        $('#antwort22').click(function() {
           console.log("antwort22");
           $('#antwortlayer2').hide();
           $('#correctlayer2').show();
        });
        $('#again2').click(function() {
           console.log("again2");
           $('#errorlayer2').hide();
           $('#antwortlayer2').show();
        });
        $('#home2').click(function() {
           console.log("home2");
           $('#errorlayer2').hide();
           $('#antwortlayer2').show();
        });
        $('#close2').click(function() {
           console.log("close2");
           $('#popup2').popup("close");
           setNextMarker(3);
        });
        
        $('#antwort31').click(function() {
           console.log("antwort31");
           $('#antwortlayer3').hide();
           $('#errorlayer3').show();
        });
        $('#antwort33').click(function() {
           console.log("antwort33");
           $('#antwortlayer3').hide();
           $('#errorlayer3').show();
        });
        $('#antwort32').click(function() {
           console.log("antwort32");
           $('#antwortlayer3').hide();
           $('#correctlayer3').show();
        });
        $('#again3').click(function() {
           console.log("again3");
           $('#errorlayer3').hide();
           $('#antwortlayer3').show();
        });
        $('#home3').click(function() {
           console.log("home3");
           $('#errorlayer3').hide();
           $('#antwortlayer3').show();
        });
        $('#close3').click(function() {
           console.log("close3");
           $('#popup3').popup("close");
           setNextMarker(4);
        });
        
        $('#antwort41').click(function() {
           console.log("antwort41");
           $('#antwortlayer4').hide();
           $('#correctlayer4').show();
        });
        $('#antwort43').click(function() {
           console.log("antwort43");
           $('#antwortlayer4').hide();
           $('#errorlayer4').show();
        });
        $('#antwort42').click(function() {
           console.log("antwort42");
           $('#antwortlayer4').hide();
           $('#errorlayer4').show();
        });
        $('#again4').click(function() {
           console.log("again4");
           $('#errorlayer4').hide();
           $('#antwortlayer4').show();
        });
        $('#home4').click(function() {
           console.log("home4");
           $('#errorlayer4').hide();
           $('#antwortlayer4').show();
        });
        $('#close4').click(function() {
           console.log("close4");
           $('#popup4').popup("close");
           setNextMarker(5);
        });
        
        $('#antwort51').click(function() {
           console.log("antwort51");
           $('#antwortlayer5').hide();
           $('#errorlayer5').show();
        });
        $('#antwort52').click(function() {
           console.log("antwort52");
           $('#antwortlayer5').hide();
           $('#errorlayer5').show();
        });
        $('#antwort53').click(function() {
           console.log("antwort53");
           $('#antwortlayer5').hide();
           $('#correctlayer5').show();
        });
        $('#again5').click(function() {
           console.log("again5");
           $('#errorlayer5').hide();
           $('#antwortlayer5').show();
        });
        $('#home5').click(function() {
           console.log("home5");
           $('#errorlayer5').hide();
           $('#antwortlayer5').show();
        });
        $('#close5').click(function() {
           console.log("close5");
           $('#popup5').popup("close");
           setNextMarker(6);
        });
        
    
        //var track_id = "me";
        watch_id = navigator.geolocation.watchPosition(
        // Success
        function(position){

            var latT = position.coords.latitude;
            var longT = position.coords.longitude;

            var latLng = new google.maps.LatLng(latT,longT);
            
            var rt = window.localStorage.getItem('runtype');
            
            if(rt == "debug") {
              latT  = marker.position.lat();
              longT = marker.position.lng();
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
            
            if(nM == null) {
              
                  nM = new google.maps.Marker({
                    position: markerposition,
                    map: map,
                    title: nextMarker.title,
                    icon: seticon
                  });
                  
            }
            
            
            var acc = parseInt(window.localStorage.getItem('accurancy'));
           
            var nextMarkerPosition = new google.maps.LatLng(nextMarker.latitude,nextMarker.longitude)
            var dist = gps_distance(latT,longT,nextMarker.latitude,nextMarker.longitude);
            console.log(nextMarker.latitude+' '+nextMarker.longitude+' '+dist);
            if(dist < acc) {
            
                  var nextMarkerPopup = '#popup'+nextMarker.id;
            
                  $(nextMarkerPopup).popup("open");
                  
                  setVisited(nextMarker.id);
                  
                  
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
      updateAll(true);
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


