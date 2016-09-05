class MapHelper{

  constructor($http){
    "ngInject";
    this.$http = $http;

    let image = new Image();
    image.src= `${this.wmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=GEO_SHP_FIELD`;
    document.body.appendChild(image);

  }

  createMap(mapController){
    let map = L.map('map').setView([61.000000, 69.000000], 6);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.zoomControl.setPosition('topright');
    return map;
  }

  get wmsUrl(){
    return "http://95.167.215.210:8082/geoserver/tis/wms";
  }

  get styleForObject(){
    return {
      color: "#00a2eb",
      fillOpacity: 0,
      opacity: 1
    }
  }

  createWMS(serviceName){
    let wms =  L.tileLayer.wms(this.wmsUrl, {
      layers: serviceName,
      format: 'image/png',
      transparent: true,
      version: "1.1.0"
    });

    return wms;
  }

  getFeatureInfoUrl(latlng, map, services){
    // Construct a GetFeatureInfo request URL given a point
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
      size = map.getSize(),

    // this crs is used to show layer added to map
      crs = map.options.crs,

    // these are the SouthWest and NorthEast points
    // projected from LatLng into used crs
      sw = crs.project(map.getBounds().getSouthWest()),
      ne = crs.project(map.getBounds().getNorthEast()),

      params = {
        request: 'GetFeatureInfo',
        service: 'WMS',

        // this is the code of used crs
        srs: crs.code,

        // these are bbox defined by SouthWest and NorthEast coords
        bbox: sw.x + ',' + sw.y + ',' + ne.x + ',' + ne.y,
        height: size.y,
        width: size.x,
        layers: services.join(','),
        query_layers: services.join(','),
        info_format: 'application/json',
        feature_count: 999
      };

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return this.wmsUrl + L.Util.getParamString(params, this.wmsUrl, true);
  }

  getFeatureInfo(latlng, map, services){
    // Make an AJAX request to the server
    var url = this.getFeatureInfoUrl(latlng, map, services);

    return this.$http({
      url
    });
  }

  parseFeatureInfo(features){
    let attributes = {};
    angular.forEach(features, feature => {
      let dotSymbolPos = feature.id.indexOf("."),
        layerName = feature.id.substring(0, dotSymbolPos);

      (!attributes[layerName]) && (attributes[layerName] = []);
      feature.properties.id = feature.id;
      attributes[layerName].push(feature.properties);
    });
    return attributes;
  }

  createGeoJsonObject(data){
    return L.geoJson(data, this.styleForObject);
  }
}

export default MapHelper;
