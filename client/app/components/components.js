import angular from 'angular';
import Map from './map/map';

let componentModule = angular.module('app.components', [
  Map
])

.name;

export default componentModule;
