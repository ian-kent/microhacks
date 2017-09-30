fetch('SN98.asc').then(response => {
	return response.text();
}).then(text => {
	const lines = text.split("\n");
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

	console.log(output);

	document.querySelector("#ncols").textContent = output.ncols;
	document.querySelector("#nrows").textContent = output.nrows;
	document.querySelector("#xllcorner").textContent = output.xllcorner;
	document.querySelector("#yllcorner").textContent = output.yllcorner;
	document.querySelector("#cellsize").textContent = output.cellsize;
	document.querySelector("#datapoints").textContent = output.data.length;
});