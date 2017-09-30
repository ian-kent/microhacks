fetch('../osterrain/data/SN98.asc.json').then(response => {
	return response.text();
}).then(text => {
	console.log(json)
});