'use strict'

const gl = require('mapbox-gl')
const fetch = require('fetch')

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

var path = null, featureCollection = null

var featureCollection = {
	"type": "FeatureCollection",
	"features": []
}

const speedup = 10

map.on('load', function() {
	var startAnimateTime = null

	const startAnimate = function() {
		startAnimateTime = new Date()
		animate()
	}

	const animate = function() {
		var elapsed = (new Date() - startAnimateTime) / 1000 * speedup,
			animated = currentEntry().timestamp - path[0].timestamp
		if (elapsed > animated) {
			pushFeature()
			map.getSource('path').setData(featureCollection)
		}
		requestAnimationFrame(animate)
	}

	var pathIndex = 0
	var toxicity = 0

	const currentEntry = function() {
		return path[pathIndex]
	}

	const pushFeature = function() {
		if (pathIndex >= path.length) return
		featureCollection.features.push({
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"coordinates": [currentEntry().longitude, currentEntry().latitude]
			},
			"properties": {
				"toxicity": toxicity
			}
		})
		pathIndex++
		toxicity = Math.round(Math.random() * 2)
	}

	fetch.fetchUrl(window.location.origin + '/path.json', (error, meta, body) => {
		path = JSON.parse(body.toString())
		console.log('loaded path', path.length)

		pushFeature()

		map.addSource('path', {
			"type": "geojson",
			"data": featureCollection,
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
						[0, "white"],
						[1, "blue"],
						[2, "red"],
					]
				},
				"circle-blur": 1,
				"circle-radius": 12
			}
		})

		startAnimate()
	})
})
