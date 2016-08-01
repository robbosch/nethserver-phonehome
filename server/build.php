#!/usr/bin/env php
<?php

require_once "config.php";

$country_array = array();

$handle = @fopen("countries.txt", "r");
if ($handle) {
    while (($buffer = fgets($handle, 4096)) !== false) {
        array_push($country_array, $buffer);
    }
    if (!feof($handle)) {
        echo "Error: unexpected fgets() fail\n";
    }
    fclose($handle);
}
else {
  echo "Error: unable to open 'countries.txt'";
}

// create the connection to the db
$conn = new PDO("mysql:host=".$GLOBALS['$dbhost'].";dbname=".$GLOBALS['$dbname'].
                "", $GLOBALS['$dbuser'], $GLOBALS['$dbpass']);

// set the PDO error mode to exception
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

for($i=0; $i<=count($country_array)-1; $i++) {
    // put the data in the array
    $coords = array();

    // url encode the address
    $address = urlencode($country_array[$i]);

    // google map geocode api url
    $url = "http://maps.google.com/maps/api/geocode/json?address={$address}";

    // get the json response
    $resp_json = file_get_contents($url);

    // decode the json
    $resp = json_decode($resp_json, true);

    // response status will be 'OK', if able to geocode given address
    if($resp['status']=='OK'){

        // get the important data
        $lat = $resp['results'][0]['geometry']['location']['lat'];
        $lng = $resp['results'][0]['geometry']['location']['lng'];
        $code = $resp['results'][0]['address_components'][0]['short_name'];

        // verify if data is complete
        if($lat && $lng){

            array_push(
                $coords,
                    $lat,
                    $lng
                );

        }else{
            echo "Error: unable to geocode";
        }

    }else{
        echo "Error: unable to geocode";
    }
    try {
      // select query

      $sql = "INSERT INTO country_name_map

              VALUES ('$i','".trim($coords[0])."','".trim($coords[1])."','".str_replace("'","\\'",trim($country_array[$i]))."','".trim($code)."')";

      // prepare statement
      $stmt = $conn->prepare($sql);

      // execute query
      $stmt->execute();
    }
    catch(PDOException $e) {
      echo $e->getMessage();
    }
    sleep(1);
}

$sql = "UPDATE country_name_map

        SET code = 'CG'

        WHERE country_name = 'Congo, Republic of the'";

$stmt = $conn->prepare($sql);
$stmt->execute();

// close connession
$conn = null;
