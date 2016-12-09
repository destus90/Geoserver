import angular from 'angular';
import "./common.styl";
import control from "./control/control";
import geoserver from "./geoserver/geoserver";
import mapHelper from "./map-helper/map-helper";
import header from './header/header';

let commonModule = angular.module('app.common', [
  control,
  geoserver,
  mapHelper,
  header
])

.name;

export default commonModule;
