class MapController {
  constructor($timeout, MapHelperService, Geoserver) {
    "ngInject";

    this.$timeout = $timeout;
    this.MapHelperService = MapHelperService;
    this.Geoserver = Geoserver;
  }

  $onInit(){

    let dataSourceForServices = {
      data: [
        {
          text: "ТИС Сервисы", expanded: true, items: []
        }
      ]
    };

    this.services = this.Geoserver.getServices();

    this.geoJsonSelectFeatureServiceLayer = {};

    angular.forEach(this.services, (service, idx) => {
      dataSourceForServices.data[0].items.push({
        id: idx,
        text: this.Geoserver.getAliasByLayerName(service)
      });
      this.geoJsonSelectFeatureServiceLayer[service] = null;
    });

    this.treeDataForServiceWin = new kendo.data.HierarchicalDataSource(dataSourceForServices);

    this.map = this.MapHelperService.createMap();
    this.indexOfVisibleWMS = [];
    this.wms = [];
    this.gridOptions = [];
    this._winAttributeVisible = false;
    this.mapClick = false;

    this.tabMode = 'service';

    this.map.on('click', this.handlerForMapClick.bind(this));
  }

  $onDestroy(){
    this.map.off("click");
  }

  findFeatureByText(text){
    this.unSelectObject();
    this.mapClick = false;

    this.Geoserver.findFeatureByText(this.activeService, text.toLowerCase()).then(
      response => {
        let features = [];

        angular.forEach(response, object => {
          if (object.data.features.length !== 0){
            //create geojson layer for active service and select features
            let feature = object.data.features[0],
                dotSymbolPos = feature.id.indexOf("."),
                layerName = feature.id.substring(0, dotSymbolPos);

            this.geoJsonSelectFeatureServiceLayer[layerName] = this.MapHelperService.createGeoJson(object.data, 'select');

            //for grid in kendo window
            features.push(...object.data.features)
          }
        });

        this.openAttributeWin(features);
      },
      error => console.log(error)
    );
  }

  handlerForMapClick(e){
    this.clearMap();
    this.mapClick = true;
    this.MapHelperService.getFeatureInfo(e.latlng, this.map, this.activeService).then(
      response => {
        console.log('get feature info');
        this.openAttributeWin(response.data.features);
      },
      error => console.log(error)
    )
  }

  highlightObject(data){
    this.unHighlightObject();
    this.geoJsonObjectLayer = this.MapHelperService.createGeoJson(data, 'highlight').addTo(this.map);
    this.map.fitBounds(this.geoJsonObjectLayer.getBounds())
  }

  selectObject(service_name){
    let geoJson = this.geoJsonSelectFeatureServiceLayer[service_name];
    if (geoJson){
      this.unSelectObject();
      this.map.addLayer(geoJson);
    }

  }

  unHighlightObject(){
    !!this.geoJsonObjectLayer && this.map.removeLayer(this.geoJsonObjectLayer)
  }

  unSelectObject(){
    angular.forEach(this.geoJsonSelectFeatureServiceLayer, (geojson, i) => {
      if (geojson){
        this.map.removeLayer(geojson);
      }
    });
    console.log(this.geoJsonSelectFeatureServiceLayer);
  }

  clearMap(){
    this.unHighlightObject();
    this.unSelectObject();
  }

  get activeService(){
    let active_service = [];

    this.indexOfVisibleWMS.sort();

    angular.forEach(this.indexOfVisibleWMS, index => active_service.push(this.services[index]));

    return active_service;
  }

  get winAttributeVisible(){
    return this._winAttributeVisible;
  }

  set winAttributeVisible(val){
    this.$timeout(() => this.tabStripForAttributeWin.select(0));
    if (val === false){
      this.clearMap();
      this.mapClick = false;
    }
    this._winAttributeVisible = val;
  }

  handlerForObjectClick(object){
    if (!!object){
      this.Geoserver.getFeature(object.id).then(
        response => this.highlightObject(response.data),
        error => console.log(error)
      )
    }
  }

  onCheckService(){
    let checkedNodes = [];

    // function that gathers IDs of checked nodes
    let checkedNodeIds = (nodes, checkedNodes) => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].checked) {
          if (nodes[i].id != undefined){
            checkedNodes.push(nodes[i].id);
          }
        }

        if (nodes[i].hasChildren) {
          checkedNodeIds(nodes[i].children.view(), checkedNodes);
        }
      }
    };

    checkedNodeIds(this.treeDataForServiceWin.view(), checkedNodes);

    //delete service which not checked
    let visibleLayers = [];
    angular.forEach(this.indexOfVisibleWMS, index => {
      let layerNotChecked = checkedNodes.indexOf(index) === -1;

      layerNotChecked ? this.map.removeLayer(this.wms[index]) : visibleLayers.push(index);
    });

    this.indexOfVisibleWMS = visibleLayers;

    //show visible service
    angular.forEach(checkedNodes, serviceIndex => {
      let layerExistOnMap = this.indexOfVisibleWMS.indexOf(serviceIndex) !== -1;

      if (!layerExistOnMap){
        this.indexOfVisibleWMS.push(serviceIndex);
        this.wms[serviceIndex] = this.MapHelperService.createWMS(this.services[serviceIndex]).addTo(this.map);
      }
    });

    //update legend window content, if open
    this.winLegendVisible && this.setContentForLegendWin();
  }

  /**
   *
   * @param {string} type
   */
  switchTab({type}){
    switch (type){

      case 'service':
        this.tabMode = 'service';
        break;

      case 'legend':
        this.setContentForLegendWin();
        this.tabMode = 'legend';
        break;
    }
  }

  setContentForLegendWin(){
    let ds = {
      data: []
    };

    angular.forEach(this.activeService, service => ds.data.push({
      text: this.Geoserver.getAliasByLayerName(service),
      items: [
        {text: '', imageUrl: this.MapHelperService.getLegendGraphic(service)}
      ],
      expanded: true
    }));
    this.treeDataForLegendWin = new kendo.data.HierarchicalDataSource(ds);
  }

  openAttributeWin(features){
    let attributes = this.MapHelperService.parseFeatureInfo(features),
      ds = [],
      badAttrField = this.Geoserver.getBadAttrField();

    this.grid = [];
    this.gridOptions = [];

    angular.forEach(attributes, (arrayOfObject, layerName) => {
      let gridOptions = {
        sortable: true,
        columns: [],
        pageable: {
          buttonCount: 5
        },
        dataSource: {
          data: [],
          pageSize: 20
        },
        selectable: "row"
      };

      if (gridOptions.columns.length === 0){
        angular.forEach(arrayOfObject[0], (attrVal, attrKey) => {
          if (!~badAttrField.indexOf(attrKey)){
            if (attrKey === 'LIC_BEGIN' || attrKey === 'LIC_END'){
              gridOptions.columns.push({
                field: attrKey,
                title: this.Geoserver.getAliasByAttrField(layerName, attrKey),
                width: 200,
                format: "{0: dd.MM.yyyy}"
              })
            } else
              gridOptions.columns.push({
                field: attrKey,
                title: this.Geoserver.getAliasByAttrField(layerName, attrKey),
                width: 200
              })
          }
        })
      }

      angular.forEach(arrayOfObject, object => {
        object['LIC_END'] = new Date(object['LIC_END']);
        object['LIC_BEGIN'] = new Date(object['LIC_BEGIN']);
        gridOptions.dataSource.data.push(object);
      });

      this.gridOptions.push(gridOptions);

      let index = this.gridOptions.indexOf(gridOptions);

      ds.push({
        text: this.Geoserver.getAliasByLayerName(layerName),
        content: `
                        <div style="padding: 1em">
                          <kendo-grid k-scope-field="$ctrl.grid[${index}]" options="$ctrl.gridOptions[${index}]" k-on-change="$ctrl.handlerForObjectClick(data)">
                            <div></div>
                          </kendo-grid>
                        </div>
              `
      })
    });

    this.tabStripDataSourceForAttributeWin = ds;
    this.winAttribute.open();
  }

  tabActivate(e){
    console.log('tab active');
    if (this.winAttributeVisible && !this.mapClick){
      let serviceName = this.Geoserver.getLayerNameByAlias($(e.item).find("> .k-link").text());

      this.selectObject(serviceName);

      angular.forEach(this.grid, grid => {
        if (grid.select().length !== 0) {
          this.unHighlightObject();
          grid.clearSelection();
        }
      });
    }
  }

}

export default MapController;
