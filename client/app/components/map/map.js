import angular from 'angular';
import uiRouter from 'angular-ui-router';
import mapComponent from './map.component';

let mapModule = angular.module('map', [
  uiRouter
])

.config(($stateProvider) => {
  "ngInject";
  $stateProvider
    .state('map', {
      url: '/',
      component: 'map'
    });
})

.component('map', mapComponent)

.name;

export default mapModule;
