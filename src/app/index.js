
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJzY2hyZXRsZW4iLCJhIjoiY2oyZHIxZ2diMDZrZjJ3cXl1bDVpY3FwZyJ9.D1guBUz1ULS2LBCltPeYOg';

//center on toronto
var center = new mapboxgl.LngLat(-79.3159696, 43.6851244);

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/peterschretlen/cj6a06kla2tfq2sr1ms6xkh62',
  center: center,
  bearing: -17,
  zoom: 14,
  scrollZoom: true
});

//taken from tableau 20 color palette
const statusToColorActive = [
    ['occupied', 'rgba(84, 162, 75, 0.5)'],
    ['vacant', 'rgba(228, 87, 86, 0.5)'],
    ['construction', 'rgba(183, 154, 32, 0.5)'],
    ['unknown', 'rgba(121, 112, 110, 0.7)'],
    ['N/A', 'rgba(0, 0, 0, 0)']
];

const layerNames = [
    'Jul 2016',
    'Aug 2011',
    'Apr 2009',
    'Sep 2007'
];


const nav = new mapboxgl.NavigationControl()

map.on('load', () => {

    map.addControl(nav, 'top-left');

    map.addLayer({
        'id': layerNames[0],
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj69f4y5m0rkm2wlmt4d9qb0h-48xqd'
        },
        'source-layer': 'DECA_-_Danforth', // name of tileset
        'paint': {
            'fill-opacity' : 1.0,
            'fill-color' : {
                'property' : 'status',
                'type' : 'categorical',
                'stops' : statusToColorActive
            },
            'fill-outline-color' : `rgba(55, 55, 55, 0.5)`,

        }
    });

    map.addLayer({
        'id': layerNames[1],
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj78a4ani005z2wmp1r84kwvt-10x7n'
        },
        'source-layer': 'Danforth_-_2011_-_08', // name of tileset
        'paint': {
            'fill-opacity' : 0.0,
            'fill-color' : {
                'property' : 'status',
                'type' : 'categorical',
                'stops' : statusToColorActive
            },
            'fill-outline-color' : `rgba(55, 55, 55, 0.5)`,
        }
    });

    map.addLayer({
        'id': layerNames[2],
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj76725b61j0i33pi5oo4e4gh-6uwk7'
        },
        'source-layer': 'Danforth_-_2009_-_04', // name of tileset
        'paint': {
            'fill-opacity' : 0.0,
            'fill-color' : {
                'property' : 'status',
                'type' : 'categorical',
                'stops' : statusToColorActive
            },
            'fill-outline-color' : `rgba(55, 55, 55, 0.5)`,
        }
    });

    map.addLayer({
        'id': layerNames[3],
        'type':'fill',
        'source':{
            'type':'vector',
            'url': 'mapbox://peterschretlen.cj6sojsfc03se32rpfhz1l04e-9dm5e'
        },
        'source-layer': 'Danforth_-_2007_-_09', // name of tileset
        'paint': {
            'fill-opacity' : 0.0,
            'fill-color' : {
                'property' : 'status',
                'type' : 'categorical',
                'stops' : statusToColorActive
            },
            'fill-outline-color' : `rgba(55, 55, 55, 0.5)`,
        }
    });

    const toggleableLayerIds = layerNames;
    addLayerToggles( toggleableLayerIds )

    // When a click event occurs near a place, open a popup at the location of
    // the feature, with HTML description from its properties
    map.on('click', e => {
        const features = map.queryRenderedFeatures(e.point, { layers: layerNames });

        // if the features have no info, return nothing
        if (!features.length) {
            return;
        }


        let infoHTML = `<div id=\'storefront-info\' class=\'storefront-info\'>`;

        features.forEach( f => {

            //extract out the values for a streetview request
            const streetViewUrl = f.properties['svurl'];
            let imageUrl = "http://via.placeholder.com/300x150";
            if(streetViewUrl){
                const heading = parseFloat( /(\d+\.?\d*)h/g.exec(streetViewUrl)[1] );
                const pitch = parseFloat( /(\d+\.?\d*)t/g.exec(streetViewUrl)[1] ) - 90;
                const fov = parseFloat( /(\d+\.?\d*)y/g.exec(streetViewUrl)[1] ) * 1.8 ;
                const pano = /!1s([^!]*)!/g.exec(streetViewUrl)[1];
                imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=300x150&pano=${pano}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=AIzaSyAyLX6I61lDqBMEVnU4QqLajosJbtiTvQM`;
            }

            infoHTML += `<div class="infotile" style="background-color:${ statusToColorActive.find( e => e[0] === f.properties['status'] )[1] }">
                        <img src=${imageUrl}>
                        <table style="width:100%">
                          <colgroup>
                            <col width="30%">
                            <col width="70%">
                          </colgroup>
                          <tr>
                            <td>Date</td>
                            <td><span>${f.properties['date']} </span></td>
                          </tr>
                          <tr style="width:70%"> 
                            <td>Address</td> 
                            <td><span>${f.properties['address']} </span></td>
                          </tr>
                          <tr>
                            <td>Status</td> 
                            <td><span>${f.properties['status']} </span></td>
                          </tr>
                          <tr>
                            <td>Name</td> 
                            <td><span>${f.properties['name']}</span></td>
                          </tr>
                          <tr>
                            <td>Class</td> 
                            <td><span>${f.properties['class']}</span></td>
                          </tr>
                        </table>
                    </div>`;

        });

        infoHTML += "</div>";

        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = infoHTML;

    });

    // Use the same approach as above to indicate that the symbols are clickable
    // by changing the cursor style to 'pointer'
    map.on('mousemove', e => {
        const features = map.queryRenderedFeatures(e.point, { layerNames });
        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

} )


//from: https://www.mapbox.com/mapbox-gl-js/example/toggle-layers/
function addLayerToggles( ids ){

    ids.forEach( id => {

        const link = document.createElement('a');
        link.href = '#';
        link.className = id === layerNames[0] ? 'active' : '';
        link.textContent = id;
        link.id = `l-${id.replace(/ /g,'-')}`;

        link.onclick = e => {
            const clickedLayer = e.target.textContent;
            e.preventDefault();
            e.stopPropagation();

            //turn on the clicked layer, turn others off
            ids.forEach( layerId => {

                const elem = document.getElementById( `l-${layerId.replace(/ /g,'-')}`);

                if (clickedLayer === layerId) {
                    elem.className = 'active';
                    map.setPaintProperty(layerId, 'fill-opacity', 1.0);
                    return;
                }

                map.setPaintProperty(layerId, 'fill-opacity', 0.0);
                elem.className = '';

            })
        };

        const layers = document.getElementById('menu');
        layers.appendChild(link);
    });

}

