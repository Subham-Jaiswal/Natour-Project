/* eslint-disable*/


console.log('Hello from Client Side :D');

export const displayMap = (locations) => {

    mapboxgl.accessToken = 'pk.eyJ1Ijoic3ViaGFtLWphaXN3YWwiLCJhIjoiY2t2bXRkOHE4OWpyejJvczc2ajl3YjZkayJ9.9DhpmTx2GCsa7ocd9-36MQ';
var map = new mapboxgl.Map({
    container: 'map', // Here this container will be set to element with ID map
    style: 'mapbox://styles/subham-jaiswal/ckvmuhmhw3gks14pirhkrwtlo',
    scrollZoom: false
});
// Map Creation
const bounds = new mapboxgl.LngLatBounds(); // SYNTACTICAL

locations.forEach(loc => {
    const el = document.createElement('div'); // Craeting those green arrow points used marker class
    el.className = 'marker';

    new mapboxgl.Marker({
        element:el,
        anchor:'bottom'
    }).setLngLat(loc.coordinates).addTo(map) // Setting it to the correct Position

    new mapboxgl.Popup({offset:30}).setLngLat(loc.coordinates).setHTML(`<p> Day ${loc.day}: ${loc.description}</p>`).addTo(map) // Creating Pop-ups 

    bounds.extend(loc.coordinates); // SYNTACTICAL

});
map.fitBounds(bounds , {
    padding:{
        top:100,
        bottom:100,
        left:100,
        right:100
        
    }
}); //Final Fitting

}
