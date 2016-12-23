import L from 'leaflet';

class MapHelper{

  constructor($http){
    "ngInject";
    this.$http = $http;
  }

  createMap(mapController){
    const osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    });

    const tis = L.tileLayer.wms("http://178.46.155.246:8082/geoserver/wms", {
      layers: '	MAP_TOPO',
      format: 'image/png',
      transparent: true,
      // attribution: "© Топографическая основа, Росреестр, 2010 - 2015 гг"
    });

    let map = L.map('map', {
      center: [61.000000, 69.000000],
      zoom: 7,
      layers: [osm]
    });

    map.zoomControl.setPosition('topright');

    var baseMaps = {
      "OSM": osm,
      "TIS": tis
    };

    L.control.layers(baseMaps).addTo(map);

    map.on('baselayerchange', ({layer}) => layer.bringToBack());

    osm.bringToBack();

    return map;
  }

  get wmsUrl(){
    return "http://178.46.155.246:8082/geoserver/tis/wms";
  }

  get styleForHighlightObject(){
    return {
      color: "#00a2eb",
      fillColor: "#1E90FF",
    }
  }

  get styleForSelectObject(){
    return {
      color: "#AA000A",
      fillColor: "#FDA8A8",
    }
  }

  getLegendGraphic(service_name){
    return `${this.wmsUrl}?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=${service_name}`
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

  /**
   *
   * @param {Object} data
   * @param {String} action
   * action must be in (select, highlight)
   */
  createGeoJson(data, action){
    return L.geoJson(data, action === 'highlight' ? this.styleForHighlightObject : this.styleForSelectObject);
  }
}

export default MapHelper;
