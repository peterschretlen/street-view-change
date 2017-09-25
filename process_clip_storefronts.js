"use strict";

const fs = require('fs');
const turf = require('@turf/turf');

const clipRegionJSON = fs.readFileSync('./data/mapbox/danforth_clip.geojson', "utf8")
const storefrontsJSON = fs.readFileSync('./data/mapbox/storefronts_2009_04.geojson', "utf8");

const clipRegion = JSON.parse(clipRegionJSON.trim());
const storefronts = JSON.parse(storefrontsJSON.trim());

const clipPolygon = turf.polygon( clipRegion.features[0].geometry.coordinates );

storefronts.features.forEach( f => {

	const fPoly = turf.polygon( f.geometry.coordinates );
	const fClipped = turf.intersect( fPoly, clipPolygon );

	f.geometry.coordinates = fClipped.geometry.coordinates;

})

fs.writeFileSync('./data/processed/clipped_storefronts.geojson', JSON.stringify(storefronts));







