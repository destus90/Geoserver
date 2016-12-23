class GeoServer{

  constructor($http, $q){
    "ngInject";

    this.$http = $http;
    this.$q = $q;

    this.aliasAttrField = {
      'GEO_SHP_LICENSES': {
        LIC_VID: 'Вид лицензии',
        NUM_LIC: 'Полный номер лицензии',
        LIC_NAME: 'Название лицензионного участка',
        L_USE: 'Компания-владелец',
        PURPOSE: 'Целевое назначение лицензии',
        LIC_AREA: 'Площадь лицензионного участка в км2',
        LIC_BEGIN: 'Дата начала действия лицензии',
        LIC_END: 'Дата окончания действия лицензии',
        DATE_CLOSE: 'Дата переоформления лицензии',
        NUM_MAP: 'Номер лицензионного участка на карте',
        LIC_STATE: 'Статус лицензии',
        VIK: 'Вертикально интегрированная компания'
      },
      'GEO_SHP_FIELD': {
        NAME_FEALD: 'Название месторождения',
        S_STATE: 'Состояние',
        YEAR_DISCO: 'Год открытия',
        YEAR_PAS_W: 'Дата ввода в разработку',
        YEAR_WORKI: 'Год начала разработки',
        YEAR_CLOSE: 'Год консервации',
        TYPE_UV: 'Тип месторождения по УВ составу'
      },
      'GEO_SHP_SEISPROF': {
        NAME_PROF: 'Номер профиля',
        NAME_REGPR: 'Номер регионального профиля'
      }
    };


    this.aliasLayerName = {
      "GEO_SHP_LICENSES": "Лицензионные участки",
      "GEO_SHP_FIELD": "Месторождения углеводородов",
      "GEO_SHP_SEISPROF": "Региональные сейсморазведочные профили"
    };

    this.describeService = {};

    angular.forEach(this.getServices(), service_name => this.describeService[service_name] = []);

  }

  get wfs(){
    return "http://178.46.155.246:8082/geoserver/tis/wfs";
  }

  findFeatureByText(services, text){

    return this.$q((resolve, reject) => {
      this.geDescribeService(services).then(
        response => {
          let array_of_promise = [];

          angular.forEach(response, (service_description, service_name) => {
            let query = [];

            if (services.indexOf(service_name) !== -1){
              // if service is active
              angular.forEach(service_description, prop => {
                query.push(`
                      strToLowerCase(${prop}) LIKE '%${text}%' 
                `);
              });
              array_of_promise.push(this.$http({
                url: this.wfs,
                params: {
                  version: "1.1.1",
                  outputFormat: 'application/json',
                  typeNames: `tis:${service_name}`,
                  request: 'GetFeature',
                  srsName: 'EPSG:4326',
                  CQL_FILTER: query.join(" OR ")
                }
              }))
            }
          });

          this.$q.all(array_of_promise).then(
            response => resolve(response),
            error => reject(error)
          )

        },
        error => reject(error)
      );
    });



    // this.$http({
    //   url: "http://95.167.215.210:8082/geoserver/tis/wfs",
    //   params: {
    //     service: "wfs",
    //     version: "1.1.1",
    //     outputFormat: 'application/json',
    //     typeNames: 'tis:GEO_SHP_LICENSES',
    //     request: 'GetFeature',
    //     CQL_FILTER: "LIC_NAME LIKE '%-%'"
    //   }
    //
    // }).then(
    //   response => console.log(response)
    // )
  }

  geDescribeService(services){
    return this.$q((resolve, reject) => {
      let array_of_promise = [],
        serviceWithoutDescription = [];

      angular.forEach(services, service_name => {
        if (this.describeService[service_name].length === 0){
          serviceWithoutDescription.push(`tis:${service_name}`)
        }
      });
      if (serviceWithoutDescription.length === 0) {
        resolve(this.describeService)
      } else {
        this.$http({
          url: this.wfs,
          params: {
            service: "wfs",
            version: "1.1.1",
            request: "DescribeFeatureType",
            outputFormat: "application/json",
            typeName: serviceWithoutDescription.join(',')
          }
        }).then(
          response => {
            let badProp = this.getBadAttrField();

            angular.forEach(response.data.featureTypes, feature => {
              let describe_service = [];

              angular.forEach(feature.properties, prop => {
                if (badProp.indexOf(prop.name) === -1){
                  describe_service.push(prop.name);
                }
              });

              this.describeService[feature.typeName] = describe_service;
            });

            resolve(this.describeService);
          },
          error => reject(error)
        )
      }

    })
  }

  getServices(){
    return ["GEO_SHP_LICENSES", "GEO_SHP_FIELD", "GEO_SHP_SEISPROF"]
  }

  getBadAttrField(){
    return ["GUID",  "SHAPE_AREA", "SHAPE_LEN", "OBJECTID", "id"]
  }

  getAliasByAttrField(layer, attrField){
    return this.aliasAttrField[layer][attrField];
  }

  getAliasByLayerName(layer){
    return this.aliasLayerName[layer];
  }

  getFeature(featureID){
    return this.$http({
      url: this.wfs,
      params: {
        service: "wfs",
        version: "1.1.0",
        request: "GetFeature",
        featureID: featureID,
        outputFormat: "application/json",
        srsName: 'EPSG:4326'
      }
    })
  }

  getLayerNameByAlias(alias){
    let serviceName;

    angular.forEach(this.aliasLayerName, (curr_alias, service_name) => {
      if (curr_alias === alias) {
        serviceName = service_name;
      }
    });

    return serviceName;
  }



}

export default GeoServer
