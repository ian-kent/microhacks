var renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#threeCanvas")});
renderer.setSize( 640, 480 );

var camera = new THREE.PerspectiveCamera( 75, 640 / 480, 0.1, 100000 );
camera.position.set(0, -8000, 15000);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(5000, 5000, 1000));

var scene = new THREE.Scene();

{
	fetch('data/wales.json').then(response => {
		return response.json();
	}).then(json => {
		console.log("got json");
		var div = 10;

		var geometry = new THREE.PlaneGeometry(30000, 30000, (6000 / div)-1, (6000 / div)-1);
		console.log("created geometry");

		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
			geometry.vertices[i].z = json[i];
		}
		console.log("built geometry");

		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		
		var material = new THREE.MeshPhongMaterial({
			map: THREE.ImageUtils.loadTexture('texture.png')
		});

		var plane = new THREE.Mesh(geometry, material);
		plane.castShadow = true;
		plane.receiveShadow = true;
		scene.add(plane);
	});
}

scene.add(new THREE.AmbientLight(0x222222));
var light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0,100,100);
new THREE.CameraHelper( light.shadow.camera );
scene.add(light);

new THREE.OrbitControls( camera, renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();