class MapController {
  constructor($compile, $scope, Geoserver) {
    "ngInject";
    this.$compile = $compile;
    this.$scope = $scope;
    this.Geoserver = Geoserver;

    this.layers = {};

    angular.forEach(this.Geoserver.getServices(), service => this.layers[service] = false);

    let map = L.map('map').setView([61.000000, 69.000000], 6);

    let ctrl = this;

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.zoomControl.setPosition('topright');

    L.TileLayer.BetterWMS = L.TileLayer.WMS.extend({

      onAdd: function (map) {
        // Triggered when the layer is added to a map.
        //   Register a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onAdd.call(this, map);
        map.on('click', this.getFeatureInfo, this);
      },

      onRemove: function (map) {
        // Triggered when the layer is removed from a map.
        //   Unregister a click listener, then do all the upstream WMS things
        L.TileLayer.WMS.prototype.onRemove.call(this, map);
        map.off('click', this.getFeatureInfo, this);
      },

      getFeatureInfo: function (evt) {
        // Make an AJAX request to the server and hope for the best
        var url = this.getFeatureInfoUrl(evt.latlng),
          showResults = L.Util.bind(this.showGetFeatureInfo, this);
        $.ajax({
          url: url,
          success: function (data, status, xhr) {
            var err = typeof data === 'object' ? null : data;
            showResults(err, evt.latlng, data);
          },
          error: function (xhr, status, error) {
            showResults(error);
          }
        });
      },

      getFeatureInfoUrl: function (latlng) {
        // Construct a GetFeatureInfo request URL given a point
        var point = this._map.latLngToContainerPoint(latlng, this._map.getZoom()),
          size = this._map.getSize(),

          params = {
            request: 'GetFeatureInfo',
            service: 'WMS',
            srs: 'EPSG:4326',
            styles: this.wmsParams.styles,
            transparent: this.wmsParams.transparent,
            version: this.wmsParams.version,
            format: this.wmsParams.format,
            bbox: this._map.getBounds().toBBoxString(),
            height: size.y,
            width: size.x,
            layers: this.wmsParams.layers,
            query_layers: this.wmsParams.layers,
            info_format: 'application/json',
            feature_count: 999
          };

        params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
        params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

        return this._url + L.Util.getParamString(params, this._url, true);
      },

      showGetFeatureInfo: function (err, latlng, content) {
        if (err) { console.log(err); return; } // do nothing if there's an error

        ctrl.parseFeatureInfo(content.features);

      }

    });

    L.tileLayer.betterWms = function (url, options) {
      return new L.TileLayer.BetterWMS(url, options);
    };

    let wms = L.tileLayer.betterWms("http://192.168.0.108:8082/geoserver/tis/wms", {
      // layers: 'nedra:licenses,nedra:mestor',
      format: 'image/png',
      transparent: true,
      version: "1.1.0"
    }).addTo(map);

    this.map = map;
    this.wms = wms;
  }

  showLayers(){
    let visibleLayers = [];

    angular.forEach(this.layers, (layerVisible, layerName) => {
      (layerVisible) && (visibleLayers.push(layerName));
    });

    this.wms.setParams({
      layers: visibleLayers.join(",")
    }, false)
  }

  parseFeatureInfo(features){
    let attributes = {},
        listOfBadAttrKey = this.Geoserver.getBadAttrField();

    angular.forEach(features, feature => {
      let dotSymbolPos = feature.id.indexOf("."),
          layerName = feature.id.substring(0, dotSymbolPos),
          goodFeature = {};
      
      (!attributes[layerName]) && (attributes[layerName] = []);
      angular.forEach(feature.properties, (attrVal, attrKey) => {
        (!~listOfBadAttrKey.indexOf(attrKey)) && (goodFeature[attrKey] = attrVal)
      });
      attributes[layerName].push(goodFeature);

    });
    this.$scope.$apply(() => this.openModal("attributes", attributes))
  }

  objectClick(objectAttributes){
    console.log(objectAttributes);
  }

  openModal(type, attributes){
    let geoserverLayers = this.Geoserver.getServices();

    let win;

    if (type === 'service'){

      let html = `
           <table>
              <tr ng-repeat="service in services track by $index">
                <td><input ng-model="layers[service]" ng-click="showLayers()" type="checkbox" /></td>
                <td>{{service}}</td>
              </tr>
           </table>
          `,
          linkFunction = this.$compile(angular.element(html)),
          newScope = this.$scope.$new();

      newScope.services = geoserverLayers;
      newScope.showLayers = this.showLayers.bind(this);
      newScope.layers = this.layers;

      win =  L.control.window(this.map,{title:'Сервис', content: linkFunction(newScope)[0]})
        .showOn([140, 20])
    } else if (type === 'legend'){
      let html = `
           <p>{{content}}</p>
          `,
        linkFunction = this.$compile(angular.element(html)),
        newScope = this.$scope.$new();

      newScope.content = "Some content...";

      win =  L.control.window(this.map,{title:'Легенда', content: linkFunction(newScope)[0]})
        .showOn([140, 40])
    } else if (type === 'attributes'){
      console.log("1111");
      let html = `
            <uib-tabset active="activePill" vertical="true" type="pills">
              <uib-tab index="$index" heading="{{layerName}}" ng-repeat="(layerName, layerAttributes) in attributes track by layerName">
                <table class="table table-bordered table-hover">
                    <thead>
                      <tr>
                      <!--<th>Вид лицензии</th>-->
                      <!--<th>Полный номер лицензии</th>-->
                                         <!--<th>Название лицензионного участка</th>-->
                      <!--<th>Компания-владелец</th>                   <th>Целевое назначение лицензии</th>-->
                      <!--<th>Площадь лицензионного участка в км2</th>                   <th>Дата начала действия лицензии</th>-->
                      <!--<th>Дата окончания действия лицензии</th>                   <th>Дата переоформления лицензии</th>-->
                      <!--<th>Номер лицензионного участка на карте</th>                   <th>Cтатус лицензии</th>-->
                      <!--<th>Вертикально интегрированная компания</th>               -->
                        <th ng-repeat="(attrKey, attrVal) in layerAttributes[0] track by $index">{{getAliasByAttrField(layerName, attrKey)}}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr ng-click="objectClick(objectAttributes)" ng-repeat="objectAttributes in layerAttributes track by $index">
                        <td ng-repeat="(attrKey, attrVal) in objectAttributes track by $index">
                          <!--{{ attrKey === 'LIC_BEGIN' ? (attrVal | date:'dd.MM.yyyy') : attrVal}}-->
                          {{ ( attrKey === 'LIC_BEGIN' || (attrKey === 'LIC_END') ) ? (attrVal | date:'dd.MM.yyyy') : attrVal}}
                        </td>
                      </tr>
                    </tbody>
                 </table>
              </uib-tab>
            </uib-tabset>
          `,
        linkFunction = this.$compile(angular.element(html)),
        newScope = this.$scope.$new();

      newScope.attributes = attributes;
      newScope.getAliasByAttrField = this.Geoserver.getAliasByAttrField.bind(this.Geoserver);
      newScope.objectClick = this.objectClick.bind(this);
      console.log(attributes);

      win =  L.control.window(this.map,{
        title:'Атрибутика',
        content: linkFunction(newScope)[0],
        position: "left",
        maxWidth: '100%'
      })
        .show();
    }
  }

}

export default MapController;
