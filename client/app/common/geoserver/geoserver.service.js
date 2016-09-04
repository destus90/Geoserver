class GeoServer{

  constructor($http){
    "ngInject";

    this.$http = $http;

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
    }

  }

  getServices(){
    return ["GEO_SHP_LICENSES", "GEO_SHP_FIELD", "GEO_SHP_SEISPROF"]
  }

  getBadAttrField(){
    return ["GUID", "NSI_ID", "SHAPE_AREA", "SHAPE_LEN", "OBJECTID", "id"]
  }

  getAliasByAttrField(layer, attrField){
    return this.aliasAttrField[layer][attrField];
  }

  getAliasByLayerName(layer){
    return this.aliasLayerName[layer];
  }

  getFeature(featureID){
    return this.$http({
      url: "http://95.167.215.210:8082/geoserver/tis/wfs",
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



}

export default GeoServer
