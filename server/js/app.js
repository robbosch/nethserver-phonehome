function initMap() {
    google.load("visualization", "1", {
        packages: ["geochart"]
    });
    google.setOnLoadCallback(initialize);
    // ip server with api
    var server_ip = '__serverip__';

    function initialize() {

        var center = new google.maps.LatLng(27.9027835, 17.4963655);

        // create an array of styles.
        var styles = [{
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "color": "#193341"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry",
            "stylers": [{
                "color": "#2c5a71"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                "color": "#29768a"
            }, {
                "lightness": -37
            }]
        }, {
            "featureType": "poi",
            "elementType": "geometry",
            "stylers": [{
                "color": "#406d80"
            }]
        }, {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [{
                "color": "#406d80"
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#3e606f"
            }, {
                "weight": 2
            }, {
                "gamma": 0.84
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{
                "weight": 0.6
            }, {
                "color": "#1a3541"
            }]
        }, {
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{
                "color": "#2c5a71"
            }]
        }];

        //var styles = [{"featureType":"all","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"},{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.text.stroke","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels.icon","stylers":[{"visibility":"on"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"},{"visibility":"on"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.attraction","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.government","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"poi.medical","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.place_of_worship","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.school","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"poi.sports_complex","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#5c96bc"},{"visibility":"on"}]}];

        // create a new StyledMapType object, passing it the array of styles,
        // as well as the name to be displayed on the map type control.
        var styledMap = new google.maps.StyledMapType(styles, {
            name: "Styled Map"
        });

        // creating the map centered
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 3,
            minZoom: 2,
            maxZoom: 6,
            center: center,
            streetViewControl: false,
            disableDoubleClickZoom: true,
            mapTypeControl: false
        });

        var prec_center_lat = 0;

        function changeMapBackground(color) {
            var dom = document.getElementById('map');

            if (color)
                dom.style.backgroundColor = "#193341";
            else
                dom.style.backgroundColor = "#2c5a71";
        }

        // associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('map_style', styledMap);
        map.setMapTypeId('map_style');
        changeMapBackground(1);

        map.addListener('center_changed', function() {
            center = map.getCenter();

            if (prec_center_lat >= 0 && center.lat() < 0)
                changeMapBackground(0);
            else if (prec_center_lat < 0 && center.lat() >= 0)
                changeMapBackground(1);
            else
                return 0;
            prec_center_lat = center.lat();
        });

        // using API to get installation info
        var interval;
        var interval_menu = document.getElementById('current_interval');
        var interval = sessionStorage.getItem("interval_value");
        if (interval == '7')
            interval_menu.innerHTML = "Last week";
        else if (interval == '30')
            interval_menu.innerHTML = "Last month";
        else if (interval == '180')
            interval_menu.innerHTML = "Last 6 months";
        else if (interval == '365')
            interval_menu.innerHTML = "Last year";
        else {
            interval = '1';
            interval_menu.innerHTML = "All";
        }
        
        $.ajax({
            url: "http://" + server_ip + "/phonehome/index.php",
            type: "GET",
            data: "method=get_info&interval=" + interval,
            success: function(resp) {

                var conquered_country = [];
                var nethservers = resp;
                var installations_global = 0;

                for (var i = 0; i < nethservers.length; i++) {

                    var installations = nethservers[i].installations;
                    var country_code = nethservers[i].country_code.trim();
                    var country_name = nethservers[i].country_name;
                    var total_installations = 0;
                    var text_to_show = '';

                    var values = installations.split(',');
                    values.sort();

                    for (var j = 0; j < values.length; j++) {

                        var result = values[j].split('#');
                        var release_tag = result[0];

                        var num = result[1];
                        total_installations += parseInt(num);

                        text_to_show += '<tr><td><b>' + release_tag + '</b></td><td><b>' + num + '</b></td></tr>';
                    }

                    installations_global += total_installations;
                    if (country_name != '' && country_code != '') {
                        var content = '<div id="content" style="">' +
                            '<div id="siteNotice"></div>' +
                            '<div id="bodyContent">' +
                            '<table class="example-table-content">' +
                            '<thead><tr><th style="background-color: white; color: black; font-size: 18;" colspan="2">' + country_name + '</th></tr></thead>' +
                            '<tbody><tr><th>Release</th><th>Installations</th></tr></tbody>' +
                            text_to_show +
                            '</table>' +
                            '</div>' +
                            '</div>';

                        if (total_installations >= 1000) {
                            total_installations = Math.floor(total_installations / 1000).toString() + 'K+';
                        }
                        createMarker(content, country_name, map, total_installations);
                        conquered_country.push("" + country_code + "")
                    }
                }

                $('#resume').text(installations_global.toString());

                var world_geometry = new google.maps.FusionTablesLayer({
                    query: {
                        select: 'geometry',
                        from: '1-d8ajjL0fDhYxx1lYoISmYfOryQX6uYdTK-bmmuK',
                        where: "ISO2 IN ('" + conquered_country.join("', '") + "')"
                    },
                    map: map,
                    suppressInfoWindows: true
                });
            },
            error: function(e) {
                console.log("Get info API error.");
            }
        });
    }

    function createMarker(content, country_name, map, total_installations) {

        if (total_installations >= 1000)
            total_installations = total_installations / 1000 + 'K';

        total_installations = total_installations.toString();

        if (!window.infowindow)
            window.infowindow = new google.maps.InfoWindow();

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': country_name
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var marker = new MarkerWithLabel({
                    position: results[0].geometry.location,
                    map: map,
                    icon: 'images/m1.png',
                    labelContent: total_installations,
                    labelAnchor: new google.maps.Point(total_installations.length * 4, 32),
                    labelClass: "labels",
                });
                google.maps.event.addListener(marker, "click", function(e) {
                    infowindow.close();
                    infowindow.setContent(content);
                    infowindow.open(map, marker);
                });
            } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                setTimeout(function() {
                    createMarker(content, country_name, map, total_installations);
                }, 200);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

    function refresh_interval() {
        var interval_menu = document.getElementById('current_interval');
        var toStore = 0;
        if (interval_menu.innerHTML == "Last week")
            toStore = 7;
        else if (interval_menu.innerHTML == "Last month")
            toStore = 30;
        else if (interval_menu.innerHTML == "Last 6 months")
            toStore = 180;
        else if (interval_menu.innerHTML == "Last year")
            toStore = 365;
        else if (interval_menu.innerHTML == "All")
            toStore = 1;

        sessionStorage.setItem("interval_value", toStore);
        location.reload();
    }

    document.getElementById("interval_week").addEventListener("click", function() {
        var interval_menu = document.getElementById('current_interval');
        interval_menu.innerHTML = "Last week";
        refresh_interval();
    });

    document.getElementById("interval_month").addEventListener("click", function() {
        var interval_menu = document.getElementById('current_interval');
        interval_menu.innerHTML = "Last month";
        refresh_interval();
    });

    document.getElementById("interval_6months").addEventListener("click", function() {
        var interval_menu = document.getElementById('current_interval');
        interval_menu.innerHTML = "Last 6 months";
        refresh_interval();
    });

    document.getElementById("interval_year").addEventListener("click", function() {
        var interval_menu = document.getElementById('current_interval');
        interval_menu.innerHTML = "Last year";
        refresh_interval();
    });

    document.getElementById("interval_all").addEventListener("click", function() {
        var interval_menu = document.getElementById('current_interval');
        interval_menu.innerHTML = "All";
        refresh_interval();
    });

    google.maps.event.addDomListener(window, 'load', initialize);
}
