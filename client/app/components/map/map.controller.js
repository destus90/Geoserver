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

    angular.forEach(this.services, (service, idx) => {
      dataSourceForServices.data[0].items.push({
        id: idx,
        text: this.Geoserver.getAliasByLayerName(service)
      });
    });

    this.treeDataForServiceWin = new kendo.data.HierarchicalDataSource(dataSourceForServices);

    this.map = this.MapHelperService.createMap();
    this.indexOfVisibleWMS = [];
    this.wms = [];
    this.gridOptions = [];

    this.map.on('click', this.handlerForMapClick.bind(this));
  }

  $onDestroy(){
    this.map.off("click");
  }

  findFeatureByText(text){
    this.Geoserver.findFeatureByText(this.activeService, text).then(
      response => {
        let features = [];

        angular.forEach(response, object => features.push(...object.data.features));
        this.openAttributeWin(features);
      },
      error => console.log(error)
    );
  }

  handlerForMapClick(e){
    this.clearMap();
    this.MapHelperService.getFeatureInfo(e.latlng, this.map, this.activeService).then(
      response => {console.log(response); this.openAttributeWin(response.data.features)},
      error => console.log(error)
    )
  }

  clearMap(){
    !!this.geoJsonObjectLayer && this.map.removeLayer(this.geoJsonObjectLayer)
  }

  get activeService(){
    let active_service = [];

    this.indexOfVisibleWMS.sort();

    angular.forEach(this.indexOfVisibleWMS, index => active_service.push(this.services[index]));

    return active_service;
  }

  set winAttributeVisible(val){
    this.$timeout(() => this.tabStripForAttributeWin.select(0));
    if (val === false){
      this.clearMap();
    }
  }

  handlerForObjectClick(object){
    if (!!object){
      this.Geoserver.getFeature(object.id).then(
        response => this.highlightObject(response.data),
        error => console.log(error)
      )
    }
  }

  highlightObject(data){
    this.clearMap();
    this.geoJsonObjectLayer = this.MapHelperService.createGeoJsonObject(data).addTo(this.map);
    this.map.fitBounds(this.geoJsonObjectLayer.getBounds())
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

  setContentForLegendWin(){
    let ds = {
      data: []
    };

    angular.forEach(this.activeService, service => ds.data.push({
      text: this.Geoserver.getAliasByLayerName(service),
      items: [
        {text: '', imageUrl: this.MapHelperService.getLegendGraphic(service)}
      ]
    }));
    this.treeDataForLegendWin = new kendo.data.HierarchicalDataSource(ds);
  }

  openServiceWin(){
    this.winService.open();
  }

  openLegendWin(){
    this.setContentForLegendWin();
    this.winLegend.open();
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
        dataSource: {
          data: []
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

  tabActivate(){
    angular.forEach(this.grid, grid => {
      if (grid.select().length !== 0) {
        this.clearMap();
        grid.clearSelection();
      }
    });
  }

}

export default MapController;
