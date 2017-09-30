var renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#threeCanvas")});
renderer.setSize( 640, 480 );

var camera = new THREE.PerspectiveCamera( 75, 640 / 480, 0.1, 1000 );
camera.position.set(0, -100, 100);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(1000, 10000, 0));

var scene = new THREE.Scene();

{
	var loader = new THREE.TextureLoader();
	loader.load('../geodata/SN98.png', texture => {
		var canvas = document.createElement( 'canvas' );
		var context = canvas.getContext( '2d' );
		context.drawImage( texture.image, 0, 0 );
		let imgdata = context.getImageData(0,0,200,200).data;

		var geometry = new THREE.PlaneGeometry(1000, 1000, 199, 199);
		for (var i = 0, l = geometry.vertices.length; i < l; i++) {
			geometry.vertices[i].z = -imgdata[(i*4)];
		}
		geometry.computeFaceNormals();
        geometry.computeVertexNormals();
		
		var material = new THREE.MeshPhongMaterial({
			color: 0xdddddd, 
		});

		var plane = new THREE.Mesh(geometry, material);
		plane.castShadow = true;
        plane.receiveShadow = true;
		scene.add(plane);

		scene.add(new THREE.AmbientLight(0x222222));
        var light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0,100,100);
		new THREE.CameraHelper( light.shadow.camera );
        scene.add(light);
	});
}

new THREE.OrbitControls( camera, renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();