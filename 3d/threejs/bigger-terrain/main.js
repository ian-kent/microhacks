var renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#threeCanvas")});
renderer.setSize( 640, 480 );

var camera = new THREE.PerspectiveCamera( 75, 640 / 480, 0.1, 100000 );
camera.position.set(0, -500, 500);
camera.up = new THREE.Vector3(0,0,1);
camera.lookAt(new THREE.Vector3(0, 5000, 500));

const dataFiles = [
	"SN00", "SN01", "SN02", "SN03", "SN04",
	"SN10", "SN11", "SN12", "SN13", "SN14", "SN15",
	// "SN20", "SN21", "SN22", "SN23", "SN24", "SN25",
	// "SN30", "SN31", "SN32", "SN33", "SN34", "SN35", "SN36",
	// "SN40", "SN41", "SN42", "SN43", "SN44", "SN45", "SN46",
	// "SN50", "SN51", "SN52", "SN53", "SN54", "SN55", "SN56", "SN57", "SN58", "SN59",
	// "SN60", "SN61", "SN62", "SN63", "SN64", 'SN65', "SN66", "SN67", "SN68", "SN69",
	// "SN70", "SN71", "SN72", "SN73", "SN74", "SN75", "SN76", "SN77", "SN78", "SN79",
	// "SN80", "SN81", "SN82", "SN83", "SN84", "SN85", "SN86", "SN87", "SN88", "SN89",
	// "SN90", "SN91", "SN92", "SN93", "SN94", "SN95", "SN96", "SN97", "SN98", "SN99"
];

var scene = new THREE.Scene();

function asciiToObject(ascii) {
	const lines = ascii.split("\n");
	const output = {};

	for(let i = 0; i < 5; i++) {
		const parts = lines[i].split(" ");
		switch(parts[0]) {
			case "ncols":
				output.ncols = parseInt(parts[1], 10);
			case "nrows":
				output.nrows = parseInt(parts[1], 10);
			case "xllcorner":
				output.xllcorner = parseInt(parts[1], 10);
			case "yllcorner":
				output.yllcorner = parseInt(parts[1], 10);
			case "cellsize":
				output.cellsize = parseInt(parts[1], 10);
		}
	}

	output.data = [];
	for(let i = 5; i < 205; i++) {
		const data = lines[i].split(" ");
		for(let j = 0; j < data.length; j++) {
			output.data.push(parseFloat(data[j]));
		}
	}

	console.log(output.xllcorner, output.yllcorner);

	return output;
}

let loaded = false;
let items = dataFiles.length;
let loadedItems = 0;
let planes = [];
let added = false;

{
	dataFiles.forEach(item => {
		fetch('data/' + item + '.asc').then(response => {
			return response.text();
		}).then(text => {
			const json = asciiToObject(text);

			var geometry = new THREE.PlaneGeometry(1000, 1000, 199, 199);
			for (var i = 0, l = geometry.vertices.length; i < l; i++) {
				geometry.vertices[i].z = json.data[i];
			}
			geometry.computeFaceNormals();
			geometry.computeVertexNormals();
			
			var material = new THREE.MeshPhongMaterial({
				color: 0xdddddd, 
			});

			var plane = new THREE.Mesh(geometry, material);
			plane.castShadow = true;
			plane.receiveShadow = true;
			plane.position.set((json.xllcorner - 200000) / 10, (json.yllcorner - 200000) / 10, 0);
			planes.push(plane);

			loadedItems++;
			if(loadedItems == items) {
				loaded = true;
			}
		});
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
	if(loaded && !added) {
		planes.forEach(plane => {
			scene.add(plane);
		})
		added = true;
		document.querySelector("#loading").remove();
	}
	renderer.render( scene, camera );
}
animate();