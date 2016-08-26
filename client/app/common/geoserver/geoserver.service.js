class GeoServer{

  constructor(){
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

    }
  }

  getServices(){
    return ["	tis:GEO_SHP_LICENSES", "tis:GEO_SHP_FIELD", "tis:GEO_SHP_SEISPROF"]
  }

  getBadAttrField(){
    return ["GUID", "NSI_ID", "SHAPE_AREA", "SHAPE_LEN", "OBJECTID"]
  }

  getAliasByAttrField(layer, attrField){
    return this.aliasAttrField[layer][attrField];
  }



}

export default GeoServer
