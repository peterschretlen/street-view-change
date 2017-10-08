"use strict";

const fs = require('fs');
const turf = require('@turf/turf');

const dateToProcess = [
	'2016_07',
	'2011_08',
	'2009_04',
	'2007_09',
	];

const clipRegionJSON = fs.readFileSync('./data/mapbox/danforth_clip.geojson', "utf8");
const clipRegion = JSON.parse(clipRegionJSON.trim());

const roadJSON = fs.readFileSync('./data/mapbox/danforth_road.geojson', "utf8");
const roadObj = JSON.parse(roadJSON.trim());

dateToProcess.forEach( (date, idx) => {

	console.log(date);

	const storefrontsJSON = fs.readFileSync(`./data/mapbox/storefronts_${date}.geojson`, "utf8");
	const storefronts = JSON.parse(storefrontsJSON.trim());

	const clipPolygon = turf.polygon( clipRegion.features[0].geometry.coordinates );

	storefronts.features.forEach( f => {

		const fPoly = turf.polygon( f.geometry.coordinates );
		const fClipped = turf.intersect( fPoly, clipPolygon );

		if(!fClipped) return;

		f.geometry.coordinates = fClipped.geometry.coordinates;

	})

	//apply translation to each clipped polygon

	// determine the direction
	// 1. Get point of storefront nearest to main road:  http://turfjs.org/docs/#pointonline
	// 2. Get the bearing from road point to storeftront: http://turfjs.org/docs/#bearing
	// 3. Apply translation

	const roadGeom = turf.lineString( roadObj.features[0].geometry.coordinates );

	const translatedFeatures = [];
	storefronts.features.forEach( f => {

		//Get nearest point to the line for all points. 
		const nearestPoints = f.geometry.coordinates[0].map( c =>  turf.pointOnLine(roadGeom, turf.point( c ), 'kilometers') )

		//Get the nearest and furthest points
		const distances = { min : Number.MAX_VALUE, max : 0 }; 

		//Find the shortest & longest distance.
		nearestPoints.forEach( p => {
			if( p.properties.dist < distances.min ) distances.min = p.properties.dist;
			if( p.properties.dist > distances.max ) distances.max = p.properties.dist;
		})

		console.log(distances);

		//Apply the difference as the translation distance
		const dist = (idx)*(distances.max - distances.min);

		//apply translation
		const bearing = turf.bearing(nearestPoints[0], turf.point( f.geometry.coordinates[0][0] ));
		translatedFeatures.push( turf.transformTranslate(f, dist, bearing, 'kilometers') );

	})

	fs.writeFileSync(`./data/processed/clipped_storefronts_translated_${date}.geojson`, JSON.stringify(turf.featureCollection(translatedFeatures)));
	
});
