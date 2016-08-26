import angular from 'angular';
import uiRouter from 'angular-ui-router';
import mapComponent from './map.component';
import "leaflet";
import "leaflet-control-window";
import bootstrapTabs from "angular-ui-bootstrap/src/tabs";

let mapModule = angular.module('map', [
  uiRouter,
  bootstrapTabs
])

.config(($stateProvider) => {
  "ngInject";
  $stateProvider
    .state('map', {
      url: '/map',
      component: 'map'
    });
})

.component('map', mapComponent)

.name;

export default mapModule;
