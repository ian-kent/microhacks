var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, 640 / 480, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#threeCanvas")});
renderer.setSize( 640, 480 );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
	renderer.render( scene, camera );
}
animate();