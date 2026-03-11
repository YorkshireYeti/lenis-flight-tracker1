const map = L.map("map").setView([30,20],3);

L.tileLayer("https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png",{
maxZoom:20
}).addTo(map);

let markers=[];

function clearMarkers(){
markers.forEach(m=>map.removeLayer(m));
markers=[];
}

function formatTime(t){

if(!t) return "Unknown";

let d=new Date(t);

return d.toLocaleString("en-GB",{
day:"numeric",
month:"short",
hour:"2-digit",
minute:"2-digit"
});

}

function calculateBearing(lat1,lon1,lat2,lon2){

const toRad=d=>d*Math.PI/180;
const toDeg=r=>r*180/Math.PI;

let y=Math.sin(toRad(lon2-lon1))*Math.cos(toRad(lat2));
let x=Math.cos(toRad(lat1))*Math.sin(toRad(lat2))-
Math.sin(toRad(lat1))*Math.cos(toRad(lat2))*Math.cos(toRad(lon2-lon1));

let brng=toDeg(Math.atan2(y,x));

return(brng+360)%360;

}

function createPlaneIcon(flightNumber,angle){

return L.divIcon({
className
