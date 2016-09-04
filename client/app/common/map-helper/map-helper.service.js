import serviceModalHTML from "./serviceModal.html";
import legendModalHTML from "./legendModal.html";
import attributeModal from "./attributeModal.html";

class MapHelper{

  constructor($http){
    "ngInject";
    this.$http = $http;
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
    console.log(map);
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

  // objectClick(objectAttributes){
  //   this.Geoserver.getFeature(objectAttributes.id).then(
  //     response => this.highlightObject(response.data),
  //     error => console.log(error)
  //   );
  // }
  //
  // getStyleForObject(){
  //   return {
  //     color: "black"
  //   }
  // }
  //
  // showLayers(){
  //   let visibleLayers = [];
  //
  //   angular.forEach(this.layers, (layerVisible, layerName) => {
  //     (layerVisible) && (visibleLayers.push(layerName));
  //   });
  //
  //   this.wms.setParams({
  //     layers: visibleLayers.join(",")
  //   }, false);
  // }
  //
  // unHighlightObject(){
  //   !!this.geoJsonObjectLayer && this.map.removeLayer(this.geoJsonObjectLayer);
  // }
  //
  // highlightObject(data){
  //   if (!!this.geoJsonObjectLayer){
  //     this.unHighlightObject();
  //   }
  //   this.geoJsonObjectLayer = L.geoJson(data, this.getStyleForObject()).addTo(this.map);
  // }
  //
  // openModal(type, attributes){
  //   if (type === 'service'){
  //     let linkFunction = this.$compile(angular.element(serviceModalHTML)),
  //         newScope = this.$scope.$new();
  //
  //     newScope.services = this.layers;
  //     newScope.showLayers = this.showLayers.bind(this);
  //     newScope.getAliasByLayerName = this.Geoserver.getAliasByLayerName.bind(this.Geoserver);
  //
  //     newScope.gridOptions = [];
  //
  //     L.control.window(this.map,{title:'Сервис', content: linkFunction(newScope)[0]})
  //       .showOn([140, 20])
  //   } else if (type === 'legend'){
  //     let linkFunction = this.$compile(angular.element(legendModalHTML)),
  //         newScope = this.$scope.$new();
  //
  //     L.control.window(this.map,{title:'Легенда', content: linkFunction(newScope)[0]})
  //       .showOn([140, 40])
  //   } else if (type === 'attributes'){
  //
  //     let ds = [],
  //         newScope = !!this.attributesModal ? angular.element(this.tabStrip.element[0]).scope() : this.$scope.$new(),
  //         badAttrField = this.Geoserver.getBadAttrField();
  //
  //     newScope.gridOptions = [];
  //
  //     angular.forEach(attributes, (arrayOfObject, layerName) => {
  //       let gridOptions = {
  //         sortable: true,
  //         columns: [],
  //         dataSource: {
  //           data: []
  //         },
  //         selectable: "row"
  //       };
  //
  //       if (gridOptions.columns.length === 0){
  //         angular.forEach(arrayOfObject[0], (attrVal, attrKey) => {
  //           if (!~badAttrField.indexOf(attrKey)){
  //             if (attrKey === 'LIC_BEGIN' || attrKey === 'LIC_END'){
  //               gridOptions.columns.push({
  //                 field: attrKey,
  //                 title: this.Geoserver.getAliasByAttrField(layerName, attrKey),
  //                 width: 200,
  //                 format: "{0: dd.MM.yyyy}"
  //               })
  //             } else
  //             gridOptions.columns.push({
  //               field: attrKey,
  //               title: this.Geoserver.getAliasByAttrField(layerName, attrKey),
  //               width: 200
  //             })
  //           }
  //         })
  //       }
  //
  //       angular.forEach(arrayOfObject, object => {
  //         object['LIC_END'] = new Date(object['LIC_END']);
  //         object['LIC_BEGIN'] = new Date(object['LIC_BEGIN']);
  //         gridOptions.dataSource.data.push(object);
  //       });
  //
  //       newScope.gridOptions.push(gridOptions);
  //
  //       let index = newScope.gridOptions.indexOf(gridOptions);
  //
  //       ds.push({
  //         text: this.Geoserver.getAliasByLayerName(layerName),
  //         content: `
  //                   <div style="padding: 1em">
  //                     <kendo-grid options="gridOptions[${index}]" k-on-change="handleChange(data)">
  //                       <div></div>
  //                     </kendo-grid>
  //                   </div>
  //         `
  //       })
  //     });
  //
  //     newScope.handleChange = this.objectClick.bind(this);
  //
  //     if (!this.attributesModal){
  //       let linkFunction = this.$compile(angular.element(attributeModal));
  //
  //       newScope.tabStripDataSource = ds;
  //
  //       window.setTimeout(() => newScope.tabStrip.select(0));
  //
  //       console.log(attributes);
  //
  //       this.attributesModal =  L.control.window(this.map,{
  //         title:'Атрибутика',
  //         content: linkFunction(newScope)[0],
  //         position: "left",
  //         maxWidth: '800'
  //       }).show();
  //
  //       this.attributesModal.on('hide', e =>  {
  //         this.attributesModal.off('hide');
  //         this.attributesModal = null;
  //         this.unHighlightObject();
  //       });
  //
  //       this.tabStrip = newScope.tabStrip;
  //
  //       this.mapComponent.show(newScope.tabStripDataSource);
  //
  //     } else {
  //       this.unHighlightObject();
  //
  //       var dataSource = kendo.data.DataSource.create(ds);
  //
  //       // angular.element(this.tabStrip.element[0]).scope().tabStripDataSource = [{text: "TAB", content: "CONTENT"}];
  //
  //       this.tabStrip.setDataSource(dataSource);
  //       this.tabStrip.select(0);
  //     }
  //   }
  // }
}

export default MapHelper;
