
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJzY2hyZXRsZW4iLCJhIjoiY2oyZHIxZ2diMDZrZjJ3cXl1bDVpY3FwZyJ9.D1guBUz1ULS2LBCltPeYOg';

//center on toronto
var center = new mapboxgl.LngLat(-79.3159696, 43.6851244);

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/peterschretlen/cj6a06kla2tfq2sr1ms6xkh62',
  center: center,
  zoom: 14,
  scrollZoom: true
});

map.on('load', () => {

    map.addLayer({
        'id':'boundaries 2017',
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj69f4y5m0rkm2wlmt4d9qb0h-48xqd'
        },
        'source-layer': 'DECA_-_Danforth', // name of tileset
        'paint': {
            'fill-color': `rgba(255, 0, 0, 0.5)`,
            //'fill-opacity': 0.5,
            'fill-outline-color' : `rgba(255, 0, 0, 1)`,

        }
    });

    map.addLayer({
        'id':'boundaries 2007',
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj69f4y5m0rkm2wlmt4d9qb0h-48xqd'
        },
        'source-layer': 'DECA_-_Danforth', // name of tileset
        'paint': {
            'fill-color': `rgba(0, 255, 0, 0.5)`,
            //'fill-opacity': 0.5,
            'fill-outline-color' : `rgba(0, 255, 0, 1)`,

        }
    });

    const toggleableLayerIds = [ 'boundaries 2007',  'boundaries 2017', ];
    addLayerToggles( toggleableLayerIds )

} )

//from: https://www.mapbox.com/mapbox-gl-js/example/toggle-layers/
function addLayerToggles( ids ){

    ids.forEach( id => {

        const link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = id;

        link.onclick = e => {
            const clickedLayer = e.target.textContent;
            e.preventDefault();
            e.stopPropagation();

            const visibility = map.getLayoutProperty(clickedLayer, 'visibility');

            if (visibility === 'visible') {
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                e.target.className = '';
            } else {
                e.target.className = 'active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
            }
        };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
    });

}

