
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

const nav = new mapboxgl.NavigationControl()

map.on('load', () => {

    map.addControl(nav, 'top-left');

    map.addLayer({
        'id':'Jul 2016',
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
        'id':'Sep 2007',
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj6sojsfc03se32rpfhz1l04e-9dm5e'
        },
        'source-layer': 'Danforth_-_2007_-_09', // name of tileset
        'paint': {
            'fill-color': `rgba(0, 255, 0, 0.5)`,
            //'fill-opacity': 0.5,
            'fill-outline-color' : `rgba(0, 255, 0, 1)`,

        }
    });

    const toggleableLayerIds = [ 'Sep 2007',  'Jul 2016', ];
    addLayerToggles( toggleableLayerIds )

    // When a click event occurs near a place, open a popup at the location of
    // the feature, with HTML description from its properties
    map.on('click', e => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['Jul 2016', 'Sep 2007'] });

        // if the features have no info, return nothing
        if (!features.length) {
            return;
        }


        let popupHtml = `<div id=\'popup\' class=\'popup\' style=\'z-index: 10;\'>`;

        features.forEach( f => {

            //extract out the values for a streetview request
            const streetViewUrl = f.properties['svurl'];
            const heading = parseFloat( /(\d+\.?\d*)h/g.exec(streetViewUrl)[1] );
            const pitch = parseFloat( /(\d+\.?\d*)t/g.exec(streetViewUrl)[1] ) - 90;
            const fov = parseFloat( /(\d+\.?\d*)y/g.exec(streetViewUrl)[1] ) * 2.0 ;
            const pano = /!1s([^!]*)!/g.exec(streetViewUrl)[1];
            const imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=300x150&pano=${pano}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=AIzaSyAyLX6I61lDqBMEVnU4QqLajosJbtiTvQM`;

            popupHtml += `<div>
                        <span> ${f.properties['date']} | </span> 
                        <span> ${f.properties['address']} | </span> 
                        <span> ${f.properties['status']} | </span> 
                        <span> ${f.properties['name']} ( ${f.properties['class']} ) </span>
                        <img src=${imageUrl}>
                    </div>`;

        });

        popupHtml += "</div>";

        const popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(popupHtml)
            .addTo(map);
    });

    // Use the same approach as above to indicate that the symbols are clickable
    // by changing the cursor style to 'pointer'
    map.on('mousemove', e => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['Jul 2016', 'Sep 2007'] });
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

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

