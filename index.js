'use strict'

const gl = require('mapbox-gl')

gl.accessToken = 'pk.eyJ1IjoiZ3JlZndkYSIsImEiOiJjaXBxeDhxYm8wMDc0aTZucG94d29zdnRyIn0.oKynfvvLSuyxT3PglBMF4w'
const map = new gl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v9',
	zoom: 13,
	hash: true,
	center: [13.5, 52.5]
})
map.addControl(new gl.NavigationControl(), 'top-left')

const el = document.getElementById('map')

var x = 13.5, y = 52.5, pm = 10, toxicity = 0

var path = {
	"type": "FeatureCollection",
	"features": [
		{
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [x, y]
			},
			"properties": {
				"pm": pm,
				"toxicity": 0
			},
		},
	]
}

map.on('load', function() {

	map.addSource('path', {
		"type": "geojson",
		"data": path
	})

	map.addLayer({
		"id": "path",
		"source": "path",
		"type": "circle",
		"paint": {
			"circle-color": {
				"property": "toxicity",
				"type": "categorical",
				"stops": [
					[0, "blue"],
					[1, "yellow"],
					[2, "red"],
				]
			},
			"circle-blur": 1,
			"circle-radius": {
				"property": "pm",
				"type": "identity"
			}
		}
	})

	const animate = function() {
		x = x + (Math.random() - 0.2) * 0.00005
		y = y + (Math.random() - 0.2) * 0.00005
		pm = pm + (Math.random() - 0.5) * 3
		toxicity = Math.round(Math.random() * 3)

		path.features.push({
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [x, y]
			},
			"properties": {
				"pm": pm,
				"toxicity": toxicity
			}
		})

		map.getSource('path').setData(path)
		requestAnimationFrame(animate)
	}

	animate()
})
