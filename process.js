"use strict";

var ogr2ogr = require('ogr2ogr');
var OgrJsonStream = require('ogr-json-stream');
var fs = require('fs');
var through = require('through2');
var pipe = require('pump');

var tmp_trees_geojson = "./data/tmp/property_boundaries.geojson";
var raw_shape = "./data/raw/property_bnds_gcc_wgs84.zip";
var geojson_start = "{ \"type\": \"FeatureCollection\", \"features\": [";
var geojson_end = "]}";

const bounds = [
	-79.33204, 43.68944,  //top left
	-79.30104, 43.68020   //bottom right
	];

let count = 0; 

var through = require('through2');
function transformGeoJsonFeature() {
	var firstFeature = true; 
	return through.obj( function(feature, encoding, callback) {

		const insideBounds = p => {

			const lonMatch =  	parseFloat(p[0]) > bounds[0] && 
								parseFloat(p[0]) < bounds[2];

			const latMatch = 	parseFloat(p[1]) < bounds[1] && 
								parseFloat(p[1]) > bounds[3];	

			//if(lonMatch || latMatch) console.log(p, lonMatch, latMatch);

			return lonMatch && latMatch;
		} 

		count++;   
		if(count % 10000 === 0){
			console.log("Processed", count);
		}

		//filter any features with coordinates outside the boudaries
		if( feature.geometry.coordinates.some( x => x.some( p => !insideBounds(p) ) ) ){
			return callback();
		}

		this.push( (firstFeature ? "" : ",") + JSON.stringify(feature, null, 2) );
		firstFeature = false;
		console.log( JSON.stringify(feature)  );
		return callback();
	});
}


//skip conversion if the file exists already
fs.stat(tmp_trees_geojson, function(err){
	console.log("converting shape to geojson...", raw_shape, tmp_trees_geojson);

 	if( err === null || err.code != 'ENOENT') {
		console.log(tmp_trees_geojson, "exists, skipping conversion");
		return;
	}

	var tmp_geojson = fs.createWriteStream(tmp_trees_geojson);
	tmp_geojson.write(geojson_start);

	var timeout_ms = 1200000; //twenty minutes
	var ogr = ogr2ogr(raw_shape).timeout(timeout_ms);


	pipe(   ogr.stream(),
			OgrJsonStream(),
			transformGeoJsonFeature(),
			tmp_geojson,
			function(err){
				if(err){
					return console.error('Shapefile to GeoJSON conversion error:', err);
				} else {
					fs.appendFile(tmp_trees_geojson,geojson_end, function (err) {
						if(err)	return console.error('Shapefile to GeoJSON conversion error:', err);
							console.log("Conversion Complete");
					});
				}
			});

});