function traffic() {
    var trafficProvider = new ymaps.traffic.provider.Actual({}, {
        infoLayerShown: true
    });
    trafficProvider.setMap(this._yandex);
};

L.Yandex.addInitHook('on','load', function(){
    this._setStyle(this._yandex.controls.getContainer(), {
        right: '50px',
        top: '11px',
        width: 'auto'
    });
});

function trafficControl(){
    this._yandex.controls
        .add('trafficControl', {size: 'auto'})
        .get('trafficControl').state.set('trafficShow', true)
};

var osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.og/copyright">OpenStreetMap</a>'
}),
    osmOutdoor = L.tileLayer('https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png', {
        attribution: 'Туристическая карта OSM'
    }),
    googleSat = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Гугол спутнык',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }),
    yandexSat1 = L.tileLayer('https://sat02.maps.yandex.net/tiles?l=sat&v=3.1493.0&x={x}&y={y}&z={z}&scale=1&lang=ru_RU', {
        attribution: 'Тындекс',
    }),
    yandexMap = L.yandex('map', {
        attribution: 'Данные Yandex-карт',
    }),
    yandexTraffic = L.yandex('overlay', {
        attribution: 'Данные дорожной обстановки Yandex',
    })
        .on('load', traffic),
    yandexTrafficControl = L.yandex('overlay', {
        attribution: 'Данные дорожной обстановки Yandex',
    })
        .on('load', trafficControl)
    ooptWMSLayer = L.tileLayer.wms('http://trolleway.nextgis.com/api/resource/988/wms', {
        layers: 'oopt_russia_2011',      //'layer1,layer2,layer3'
        format: 'image/png',
        transparent: true,
        attribution: '',
    })
var myMap = L.map('map', {
    center: [55.7674, 37.6593],
    zoom: 13,
    layers: [yandexMap],
});


var myParkIcon = L.icon({
    iconUrl:'./data/icons/park.png',
    iconSize:[32,32],
    IconAnchor: [16,32],
    popupAnchor: [0,0],
});

var parkIconClass = L.Icon.extend({
    options:{
        iconSize:[32,32],
        IconAnchor: [16,32],
        popupAnchor: [0,0],
    }
})

var parkIconArray = [
    new parkIconClass({iconUrl:'./data/icons/park_1.png'}),
    new parkIconClass({iconUrl:'./data/icons/park_2.png'}),
    new parkIconClass({iconUrl:'./data/icons/park_3.png'}),
    new parkIconClass({iconUrl:'./data/icons/park_4.png'}),
    new parkIconClass({iconUrl:'./data/icons/park_5.png'}),
]

var parksLayer = L.layerGroup([

    L.marker([55.7674363, 37.6593733], {
        title: 'Сад имени Баумана',
        icon:parkIconArray[0],
    })
    .bindPopup('<b>Название:</b><i> Сад имени Баумана</i><br><b>Год открытия: 1920</b><br><img src="https://yandex.ru/favicon.ico" width=280px>'),

    L.marker([55.7581344, 37.6739216], {
        title: 'Парк имени 1го Мая',
        icon:parkIconArray[1],
    })
    .bindPopup('<b>Название:</b><i> Парк имени 1го Мая</i><br><b>Год открытия: 1920</b><br><img src="https://yandex.ru/favicon.ico" width=280px>'),
    
    L.marker([55.7529845, 37.674855], {
        title: 'Парк усадьбы Строгановых',
        icon:parkIconArray[2],
    })
    .bindPopup('<b>Название:</b><i> Парк усадьбы Строгановых</i><br><b>Год открытия: 1920</b><br><img src="https://yandex.ru/favicon.ico" width=280px>'),
])

// L.polygon([
//     [55.7633243, 37.6607627],
//     [55.7634179, 37.6611248],
//     [55.7636246, 37.6609558],
//     [55.7635341, 37.6605883],
// ],{
//     fillColor: 'orange',
//     fillOpacity: 0.9,
//     color: 'brown',
//     stroke: true,
//     weight: 2,
//     dashArray: '5 5',
// })
// .bindPopup('Общежитие МИИГАиК')
// .addTo(myMap)

// L.polyline([
//     [55.7648485, 37.6615083],
//     [55.7645285, 37.6617658],
//     [55.7637967, 37.6616961],
//     [55.7636548, 37.661806],
// ],{
//     color: 'gray',
//     weight: 4,
// })
// .bindPopup('Подъезд с Гороховского')
// .addTo(myMap)

var rwsPoints = L.geoJSON(rws, {
    pointToLayer: function(feature,latlng) {
        let yearOpen = feature.properties.yearOpen
        yearOpen < 1900 ? icn = parkIconArray[1] :
        yearOpen > 1900 && yearOpen < 2000 ? icn = parkIconArray[2] :
            icn = parkIconArray[4];
        return L.marker(latlng, {
            title: feature.properties.name,
            icon: icn
        })
    }
}).bindPopup(function(rws){
    let rwsPhoto = '';
    if (rws.feature.properties.photo_link != null) {
        rwsPhoto = '<img src = "./data/images/' + rws.feature.properties.photo_link+ '.jpg" width = 280px>'
    }
    return '<b>Название вокзала: </b><i>' + rws.feature.properties.name + '</i><br>' + rwsPhoto
});

var bldsArea = L.geoJSON(blds, {
    style: function(feature){
        feature.properties.material == 'кирпич' ? colorFill = 'red' : colorFill = 'grey';
        return {
            color: colorFill
        }
    }
});

var baseLayers = {
    'OSM карта': osmLayer,
    'Туристическая карта OSM': osmOutdoor,
    'Гугл спутник': googleSat,
    'Яндекс спутник': yandexSat1,
    'Яндекс схема': yandexMap,
},
    overlayLayers = {
        'Яндекс_пробки': yandexTraffic,
        'Яндекс пробки с элементом управления':yandexTrafficControl,
        'Объекты ООПТ': ooptWMSLayer,
        'Парки Москвы': parksLayer,
        'Вокзалы Москвы':rwsPoints,
        'Здания кампуса МИИГАиК':bldsArea
    };
// layer switching
L.control.layers(baseLayers, overlayLayers).addTo(myMap);

L.control.scale({
    imperial: false,
    maxWidth: 200,
    position: 'bottomleft'
}).addTo(myMap);

myMap.attributionControl.setPrefix('&copy; <a href="https://github.com/LazySlav">by LazySlav</a>');

var msrCtrl = new L.Control.Measure({
    localization: 'ru',
    primaryLengthUnit: 'kilometers',
    secondaryLengthUnit: 'meters',
    primaryAreaUnit: 'hectares',
    secondaryAreaUnit: 'sqmeters',
    thousandsSep: ' ',
    decPoint: ',',
    activeColor: '#4f16e2',
    completedColor: '#bfaded'

});
msrCtrl.addTo(myMap);

//  Создание своего элемента интерфейса Легенда для определённого слоя
var legendControl = L.control({
	position: 'bottomright'
});

	// Наполнение элемента интерфейса Легенда
legendControl.onAdd = function (myMap) {
	let legendDiv = L.DomUtil.create('div', 'legendMap'),
		labels = [];
	L.DomEvent
		.disableScrollPropagation(legendDiv)
		.disableClickPropagation(legendDiv);
	labels.push('<center><b>Легенда для ж/д вокзалов</b></center>');
	labels.push('<img src="./data/icons/park_1.png" height="14"> - Вокзалы XXI века');
	labels.push('<img src="./data/icons/park_3.png" height="14"> - Вокзалы XX века');
	labels.push('<img src="./data/icons/park_5.png" height="14"> - Вокзалы XIX века');
	legendDiv.innerHTML = labels.join('<br>');
	return legendDiv
};

	// Добавление legendControl на карту
// legendControl.addTo(myMap);

	// Реализация возможности отображения/скрытия элеиента интерфейса "Легенда" при выборе слоя rwsPoints
function legendAdd(){
	legendControl.addTo(myMap)
};

function legendRemove(){
	legendControl.remove(myMap)
};

rwsPoints.on('add', legendAdd);
rwsPoints.on('remove', legendRemove);