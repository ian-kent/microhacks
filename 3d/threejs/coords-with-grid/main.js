var renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#threeCanvas")});
renderer.setSize( 640, 480 );

var camera = new THREE.PerspectiveCamera( 75, 640 / 480, 0.1, 1000 );
camera.position.set(55, -75, 50);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0, 0, 0));

var scene = new THREE.Scene();

{
	var gridGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
	var gridMaterial = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.DoubleSide, wireframe: true} );
	var gridPlane = new THREE.Mesh( gridGeometry, gridMaterial );
	scene.add(gridPlane);
}

let textMesh1, textMesh2, textMesh3;

{
	var loader = new THREE.FontLoader();
	loader.load( 'helvetiker_regular.typeface.json', function ( font ) {
		const options = {
			font: font,
			size: 5,
			height: 1,
			curveSegments: 12,
		};
		
		var geometry = new THREE.TextGeometry( 'x', options );
		textMesh1 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ) ;
		textMesh1.position.set(55,0,0);
		textMesh1.up = new THREE.Vector3(0,0,1);
		scene.add(textMesh1);

		var geometry = new THREE.TextGeometry( 'y', options );
		textMesh2 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ) ;
		textMesh2.position.set(0,55,0);
		textMesh2.up = new THREE.Vector3(0,0,1);
		scene.add(textMesh2);

		var geometry = new THREE.TextGeometry( 'z', options );
		textMesh3 = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0xff0000 } ) ) ;
		textMesh3.position.set(0,0,55);
		textMesh3.up = new THREE.Vector3(0,0,1);
		scene.add(textMesh3);
	} );
	
	// Example text options : {'font' : 'helvetiker','weight' : 'normal', 'style' : 'normal','size' : 100,'curveSegments' : 300};
}

const lineColours = [0x33ff00, 0xff3300, 0x0033ff];
for (let i = 0; i < 3; i++) {
	const pos = [0, 0, 0];
	pos[i] +=75;

	const material = new THREE.LineBasicMaterial({
		color: lineColours[i]
	});

	const geometry = new THREE.Geometry();
	geometry.vertices.push(
		new THREE.Vector3( pos[0], pos[1], pos[2] ),
		new THREE.Vector3( 0, 0, 0 )
	);

	var line = new THREE.Line( geometry, material );
	scene.add( line );
}

new THREE.OrbitControls( camera, renderer.domElement );

function animate() {
	requestAnimationFrame( animate );
	if(textMesh1)textMesh1.lookAt(camera.position);
	if(textMesh2)textMesh2.lookAt(camera.position);
	if(textMesh3)textMesh3.lookAt(camera.position);
	renderer.render( scene, camera );
}
animate();