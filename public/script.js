const map = L.map("map").setView([25,40],3);

L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",{
maxZoom:20
}).addTo(map);

let markers=[];

function clearMarkers(){
markers.forEach(m=>map.removeLayer(m));
markers=[];
}

function createPlaneIcon(flight,heading){

return L.divIcon({
className:"",
html:`

<div style="text-align:center">
<div style="
background:black;
color:white;
padding:3px 8px;
border-radius:4px;
font-size:13px;
margin-bottom:4px;
display:inline-block;">
${flight}
</div>
<div style="
color:red;
font-size:34px;
transform:rotate(${heading}deg);
">
✈
</div>
</div>
`,
iconSize:[60,60],
iconAnchor:[30,30]
});

}

async function updateFlights(){

try{

const res = await fetch(
"https://api.adsbexchange.com/v2/lat/0/lon/0/dist/25000/"
);

const data = await res.json();

clearMarkers();

let trackedFlights = ["UAE28","UAE376","UAE375","UAE27"];

data.ac.forEach(ac=>{

if(!trackedFlights.includes(ac.flight)) return;

let lat = ac.lat;
let lon = ac.lon;

if(!lat || !lon) return;

let heading = ac.track || 0;

let marker = L.marker(
[lat,lon],
{icon:createPlaneIcon(ac.flight.replace("UAE","EK"),heading)}
).addTo(map);

markers.push(marker);

});

}catch(e){

console.log("Flight fetch error");

}

}

updateFlights();

setInterval(updateFlights,10000);
