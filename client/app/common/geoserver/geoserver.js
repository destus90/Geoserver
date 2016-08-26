import angular from 'angular';
import Geoserver from "./geoserver.service";

let geoserverModule = angular.module('geoserver', [])

.service('Geoserver', Geoserver)

.name;

export default geoserverModule;
