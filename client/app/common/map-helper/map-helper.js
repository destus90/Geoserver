import angular from 'angular';
import L from "leaflet";
import MapHelper from "./map-helper.service";


let mapHelperModule = angular.module('mapHelper', [
  "geoserver"
])

.service('MapHelperService', MapHelper)

.name;

export default mapHelperModule;
