import angular from 'angular';
import uiRouter from 'angular-ui-router';
import "imports?angular!kendo/js/kendo.all.min";
import mapComponent from './map.component';
import "leaflet";
import "leaflet-control-window";

let mapModule = angular.module('map', [
  uiRouter,
  "kendo.directives"
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
