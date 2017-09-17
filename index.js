'use strict'

const gl = require('mapbox-gl')
const {fetch} = require('fetch-ponyfill')()

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

const speedup = 10

const buildMeasurementPoint = (measurement) => {
	return {
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: [
				measurement.longitude + Math.random() * .1,
				measurement.latitude + Math.random() * .1
			]
		},
		properties: {
			"toxicity": Math.round(Math.random() * 2)
		}
	}
}

const createAnimation = (measurements, featureCollection) => {
	const startAnimateTime = Date.now()
	let measurementsI = 0

	const render = () => {
		map.getSource('measurements').setData(featureCollection)
	}

	const animate = function() {
		const elapsed = (Date.now() - startAnimateTime) / 1000 * speedup
		const measurement = measurements[measurementsI]
		const threshold = measurement.timestamp - measurements[0].timestamp
		if (elapsed > threshold) {
			measurementsI++

			const point = buildMeasurementPoint(measurements[measurementsI])
			featureCollection.features.push(point)
			render()
		}

		requestAnimationFrame(animate)
	}

	requestAnimationFrame(animate)
}

map.on('load', function() {
	fetch('https://cyclehack-2017-lora-backend.jannisr.de/measurements')
	.then((res) => {
		if (!res.ok) {
			const err = new Error(res.statusText)
			err.statusCode = res.status
			throw err
		}
		return res.json()
	})
	.then((measurements) => {
		const featureCollection = {
			type: "FeatureCollection",
			features: []
		}
		map.addSource('measurements', {
			type: "geojson",
			data: featureCollection,
		})

		map.addLayer({
			"id": "path",
			"source": "measurements",
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

		createAnimation(measurements, featureCollection)
	})
	.catch(console.error)
})
