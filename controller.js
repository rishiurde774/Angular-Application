//Angular App Module and controller
angular.module('myApp', []).controller('mapCtrl', function($scope){

	var createMarker = function(city, index){
		var latLon = city.latLon.split(',')
		var lat = latLon[0];
		var lon = latLon[1];
		var icon = ''
		if(index == 0){
			icon = 'assets/images/1.png';
		} else if(index == 38){
			icon = 'assets/images/atl.png';
		}else{
			icon = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=•%7CFE7569';
		}
		var marker = new google.maps.Marker({
			map: $scope.map,
			position: new google.maps.LatLng(lat,lon),
			title: city.city,
			icon: icon
		});

		markerContentHTML = '<div class="infoWindowContent">';
		markerContentHTML += '<div class="total-pop">Total Population: ' + city.yearEstimate + '</div>';
		markerContentHTML += '<div class="pop-dens-last-year">2010 Census: ' + city.lastCensus + '</div>';
		markerContentHTML += '<div class="pop-change">Population Change %: ' + city.change + '</div>';
		markerContentHTML += '<div class="pop-dens">Population Density: ' + city.lastPopDensity + '</div>';
		markerContentHTML += '<div class="state">State: ' + city.state + '</div>';
		markerContentHTML += '<div class="land-area">Land Area: ' + city.landArea + '</div>';
		markerContentHTML += '<a href="#" onclick="getDirections('+lat+','+lon+')">Get directions</a><br>';
		markerContentHTML += '<a href="#" onclick="displayBooze('+lat+','+lon+')">Booze</a><br>';
		markerContentHTML += '<a href="#" onclick="displayBar('+lat+','+lon+')">Bars</a>';
		markerContentHTML += '</div>';

		marker.content = markerContentHTML;

		google.maps.event.addListener(marker, 'click', function(){
			infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content)
			infoWindow.open($scope.map, marker)
		});

		$scope.markers.push(marker);
	}

	var createCityMarkers = function(){
    	$scope.cities = cities
	    for( i=0; i < cities.length; i++){
	    	createMarker(cities[i], i)
	    }
    }

	$scope.resetMap = function(){
			var mapOptions = {
				zoom: 4,
			//Center of the US
			center: new google.maps.LatLng(40.0000, -98.0000)
		}

		$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
		$scope.markers = [];

		createCityMarkers();
	}

	$scope.resetMap();

	var infoWindow = new google.maps.InfoWindow()

	

	$scope.triggerClick = function(i){
		$scope.resetMap();
		google.maps.event.trigger($scope.markers[i-1], "click")
	}

	//function that adds the default google icon for the place searched for
	function createSelectedMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			icon: place.icon
		});
		google.maps.event.addListener(marker, 'click', function() {
			createMarkerContent(place, this);
		});
	}

	// function that creates content for the markers to include more info about the place
	function createMarkerContent(place, fakethis){
		
		var request = {
			placeId: place.place_id
		};

		console.log(place);
		var detailsReturned = false;
		service = new google.maps.places.PlacesService(map);
		service.getDetails(request, callback);
		function callback(results, status) {
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				place = results
				console.log(place)
				detailsReturned = true;
				date = new Date();
				var weekDay = date.getDay()-1;
				if (weekDay < 0) {
					weekDay = 6;
				}
				markerContentHTML = '<div class="markerWindowContent">';
				if (place.photos != undefined){
					markerContentHTML += '<div class="markerPhoto"><img src="'+place.photos[0].getUrl({'maxWidth': 200, 'maxHeight': 200})+'"/></div>';
				}
				var weatherURL = 'http://api.openweathermap.org/data/2.5/weather?lat='+fakethis.position.lat()+'&lon='+fakethis.position.lng()+'&units=imperial&APPID=1d04e62091eabb4695bb6e9993976418';
				$.getJSON(weatherURL, function(weatherData){
					console.log(weatherData)
					var weatherIconURL = 'http://openweathermap.org/img/w/'
					var weatherIcon = weatherIconURL + weatherData.weather[0].icon + '.png';

					markerContentHTML += '<div class ="weather"><img src="'+weatherIcon+'">Current Temp: '+weatherData.main.temp+'&degF</div>'
					infowindow.setContent(markerContentHTML);
					infowindow.open(map, fakethis);
				});
				markerContentHTML += '<div class="name">Name: ' + place.name + '</div>';
				markerContentHTML += '<div class="address">'+place.adr_address+'</div>';
				markerContentHTML += '<div class="phoneNumber">Phone Number: '+place.formatted_phone_number + '</div>';
				if (place.opening_hours != undefined){
					markerContentHTML += '<div class="hours">Open Hours: ' + place.opening_hours.weekday_text[weekDay] + '</div>';
				}
				if (place.rating != undefined){
				markerContentHTML += '<div class="rating">Rating: ' + place.rating + '</div>';
				}
				// markerContentHTML += '<a href="#" onclick="getDirections('+lat+','+lon+')">Get directions</a><br>';
				markerContentHTML += '</div>';
				
				
			}
		}
		
	}
	// function to display the type:liquor_store when the link in the info box is clicked
	displayBooze = function(lat, lon){
		
		var pyrmont = {lat: lat, lng: lon};

		map = new google.maps.Map(document.getElementById('map'), {
			center: pyrmont,
			zoom: 14
		});

		infowindow = new google.maps.InfoWindow();

		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: pyrmont,
			radius: "50000",
			types: ['liquor_store']
		}, callback);


		function callback(results, status) {
			
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					console.log(results[i]);
					createSelectedMarker(results[i]);
				}
			}
		}
	}	

	// function to display the type:bar when the link in the info box is clicked
	displayBar = function(lat, lon){

		var something = {lat: lat, lng: lon};

		map = new google.maps.Map(document.getElementById('map'), {
			center: something,
			zoom: 14
		});

		infowindow = new google.maps.InfoWindow();

		var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
			location: something,
			radius: "5000",
			types: ['bar']
		}, callback);


		function callback(results, status) {
			console.log(results);
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					createSelectedMarker(results[i]);
				}
			}
		}
	}

	$scope.updateMarkers = function(cities){
		for(i = 0; i < $scope.markers.length; i++){
			$scope.markers[i].setMap(null);
		}
		for(i = 0; i < $scope.filteredCities.length; i++){
			createMarker($scope.filteredCities[i], i);
		}
	}



	getDirections = function(lat, lon){
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 7,
			mapType: google.maps.MapTypeId.ROADMAP})
		directionsDisplay.setMap(map);
		directionsDisplay.setPanel(document.getElementById('list-window'));
		var request = {
           	//Origin hardcoded to Atlanta. Require geocode current loc,
        	//or give user input
        	origin: 'Atlanta, GA', 
        	destination:new google.maps.LatLng(lat,lon), 
        	travelMode: google.maps.DirectionsTravelMode.DRIVING
        };

        directionsService.route(request, function(response, status) {
        	if (status == google.maps.DirectionsStatus.OK) {
        		directionsDisplay.setDirections(response);
        	}
        });
    }

    createCityMarkers();
    
    
});




