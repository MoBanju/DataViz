export const WeatherLayer = {
    id: "TempCircle",
    maxzoom:12,
    type: "circle",
    'paint': {
        'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            -15,
            '#000137',
            -10,
            '#02198B',
            -5,
            '#fff',
            0,
            '#ffffe0',
            5,
            '#FFD580',
            10,
            '#FF8c00',
            15,
            '#7F3121'
        ],
        'circle-opacity': 1,
        'circle-radius':5,
    }
}
export const RasterLayer = {
    id: "TempRaster",
    maxzoom:12,
    type: "raster",
    'paint': {
        'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            -15,
            '#000137',
            -10,
            '#02198B',
            -5,
            '#fff',
            0,
            '#ffffe0',
            5,
            '#FFD580',
            10,
            '#FF8c00',
            15,
            '#7F3121'
        ],
        'circle-opacity': 1,
        'circle-radius':5,
    }
}