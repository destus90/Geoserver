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

    this.map.on('click', e => {
      let services = [];
      angular.forEach(this.indexOfVisibleWMS, index => services.push(this.services[index]));
      this.MapHelperService.getFeatureInfo(e.latlng, this.map, services).then(
        response => {
          let attributes = this.MapHelperService.parseFeatureInfo(response.data.features);
          let ds = [];
          let badAttrField = this.Geoserver.getBadAttrField();
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
                          <kendo-grid options="$ctrl.gridOptions[${index}]" k-on-change="handleChange(data)">
                            <div></div>
                          </kendo-grid>
                        </div>
              `
            })
          });

          this.tabStripDataSourceForAttributeWin = ds;
          this.winAttribute.open();
        },
        error => {
          console.log(error);
        }
      )
    })

  }

  $onDestroy(){
    this.map.off("click");
  }

  set winAttributeVisible(val){
    this.$timeout(() => this.tabStripForAttributeWin.select(0))
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

      if (layerNotChecked){
        this.map.removeLayer(this.wms[index]);
      } else {
        visibleLayers.push(index);
      }
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


  }

  openModal(type, attributes){
    this.MapHelperService.openModal(type, attributes);
  }

  openServiceWin(){
    this.winService.open();
  }

  show(tabStripDataSource){
    let childScope = angular.element(this.win2.element).scope();

    childScope.tabStripDataSource = tabStripDataSource;
    this.tabStripDataSource = tabStripDataSource;
    this.win2.open();

  }

}

export default MapController;
