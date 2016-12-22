import angular from 'angular';
import MapHelper from "./map-helper.service";


let mapHelperModule = angular.module('mapHelper', [
  "geoserver"
])

.service('MapHelperService', MapHelper)

.name;

export default mapHelperModule;
