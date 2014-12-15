<?php

  require_once "RestServer.php";

  // credentials
  $GLOBALS['$dbhost'] = "__dbhost__";
  $GLOBALS['$dbuser'] = "__dbuser__";
  $GLOBALS['$dbpass'] = "__dbpass__";
  $GLOBALS['$dbname'] = "__dbname__";

  class AddInfo {
     public function add_info($uuid, $release) {

		  // get ip from remote address
      $ip = $_SERVER['REMOTE_ADDR']; 

      // get country code from ip
      $country_code = file_get_contents("http://ipinfo.io/{$ip}/country");

      // get country name
      $country_infos = file_get_contents("http://restcountries.eu/rest/v1/alpha/".$country_code);
      $country_obj = json_decode($country_infos, true);
      $country_name = $country_obj['name'];

      //get coordinates
      $country_coordinates_infos = file_get_contents("http://maps.googleapis.com/maps/api/geocode/json?address=".$country_name);
      $country_coordinates = json_decode($country_coordinates_infos, true);
      $country_lat = $country_coordinates['results']['0']['geometry']['location']['lat'];
      $country_lng = $country_coordinates['results']['0']['geometry']['location']['lng'];

      try {
        // get connession
        $conn = new PDO("mysql:host=".$GLOBALS['$dbhost'].";dbname=".$GLOBALS['$dbname']."", $GLOBALS['$dbuser'], $GLOBALS['$dbpass']);

        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // insert query
        $sql = "REPLACE INTO phone_home_tb (uuid, release_tag, ip, country_code, country_name, country_location_lat, country_location_lng, reg_date)
                VALUES (:uuid, :release, :ip, :country_code, :country_name, :country_location_lat, :country_location_lng, NOW())";
        
        // prepare statement
        $stmt = $conn->prepare($sql);

        // execute query
        $stmt->execute(array( ':uuid'                 => $uuid,
                              ':release'              => $release,
                              ':ip'                   => $ip,
                              ':country_code'         => $country_code,
                              ':country_name'         => $country_name,
                              ':country_location_lat' => $country_lat,
                              ':country_location_lng' => $country_lng
                            ));

        // close connession
        $conn = null;

      }
      catch(PDOException $e) {
        echo $e->getMessage();
      }

     }
  }

  class GetInfo {
    public function get_info() {

      try {
        // get connession
        $conn = new PDO("mysql:host=".$GLOBALS['$dbhost'].";dbname=".$GLOBALS['$dbname']."", $GLOBALS['$dbuser'], $GLOBALS['$dbpass']);

        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // select query
        $sql = "SELECT    COUNT(country_name) AS num_installation, release_tag, country_name, country_location_lat, country_location_lng
                FROM      phone_home_tb
                GROUP BY  country_name, release_tag;";

        // prepare statement
        $stmt = $conn->prepare($sql);

        // execute query
        $stmt->execute();

        // create new empty array
        $infos = array();

        // set the resulting array to associative
        for($i=0; $row = $stmt->fetch(); $i++){
          array_push($infos, array( 'num_installation'      => $row['num_installation'],
                                    'release_tag'           => $row['release_tag'],
                                    'country_name'          => $row['country_name'],
                                    'country_location_lat'  => $row['country_location_lat'],
                                    'country_location_lng'  => $row['country_location_lng']
                                  ));
        }

        // close connession
        $conn = null;

        // return info inserted
        return '{"nethservers":'.json_encode($infos).'}';

      }
      catch(PDOException $e) {
        echo $e->getMessage();
      }

    }

  }

  $rest = new RestServer();
  $rest->addServiceClass(AddInfo);
  $rest->addServiceClass(GetInfo);
  $rest->handle();