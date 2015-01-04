<?php

require_once('configuration.php');

/**
 * Class managing the DB connection
 */
class Db {

	public static function connect() {
		if(!mysql_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD)) {
			throw new Exception('Could not connect to the database ('.mysql_error().')');
		}
		if(!mysql_select_db(DB_NAME)) {
			throw new Exception('Could not select the appropriate database ('.mysql_error().')');
		}
	}

}


/**
 * Class rendering the model for Location
 */
class Location {

	/**
	 * Add a new location to the database
	 * @param string $name
	 * @param string $lng
	 * @param string $lat
	 * @throws Exception
	 */
	public static function add($name, $lng, $lat) {
		Db::connect();
		// If no coordinate is sent, the location is regarded as invalid
		// NB : 
		$invalid = ($lng || $lat) ? 0 : 1;
		if(empty($lng)) $lng = 'NULL';
		if(empty($lat)) $lat = 'NULL';
		$q = "INSERT INTO `locations` (`name`, `lng`, `lat`, `invalid`) VALUES ('$name', $lng, $lat, $invalid);";
		if(!mysql_query($q)) {
			throw new Exception('A MySQL error occurred : '.mysql_error().' - '.$q);
		}
	}
	
	/**
	 * List all locations in the database
	 * @throws Exception
	 * @return array
	 */
	public static function listing() {
		Db::connect();
		$q = "SELECT * FROM `locations` ORDER BY `name`";
		$res = mysql_query($q);
		if(mysql_error()) {
			throw new Exception('A MySQL error occurred : '.mysql_error().' - '.$q);
		}
		$ret = array();
		while($row = mysql_fetch_assoc($res)) {
			$ret[] = $row;
		}
		return $ret;
	}

}


/**
 * Class of the Locations Controller
 */
class LocationsController {

	/**
	 * This function determines the action according to the GET parameters
	 */
	public static function dispatch() {
		$action = $name = $lng = $lat = null;
		foreach($_GET as $key => $value) {
			$$key = $value;
		}
		foreach($_POST as $key => $value) {
			$$key = $value;
		}
		try {
			switch($action) {
				case 'add':
					self::add($name, $lng, $lat);
					break;
				case 'listing':
					self::listing();
					break;
				default:
					throw new Exception("This action is unavailable.");
					break;
			}
		}
		catch(Exception $e) {
			echo '{error:"'.(DEBUG ? $e->getMessage() : 'An error occurred.').'"}';
		}
	}
	
	/**
	 * Add a location after checking the parameters
	 * @param string $name
	 * @param string $lng
	 * @param string $lat
	 * @throws Exception
	 */
	public static function add($name, $lng, $lat) {
		if(empty($name)) {
			throw new Exception('The location name is missing.');
		}
		Location::add($name, $lng, $lat);
	}
	
	/**
	 * List all locations and display them in JSON
	 */
	public static function listing() {
		$res = Location::listing();
		$cnt = count($res);
		echo '{"locations":[';
		for($i=0; $i<$cnt; $i++) {
			if($i>0) echo ',';
			echo '{"id":'.$res[$i]['id'].',"name":"'.$res[$i]['name'].'","lng":'.($res[$i]['lng']?$res[$i]['lng']:'null').',"lat":'.($res[$i]['lat']?$res[$i]['lat']:'null').',"invalid":'.($res[$i]['invalid']?'true':'false').'}';
		}
		echo ']}';
	}

}


LocationsController::dispatch();