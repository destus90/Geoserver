import angular from 'angular';
import "./common.styl";
import control from "./control/control";
import geoserver from "./geoserver/geoserver";

let commonModule = angular.module('app.common', [
  control,
  geoserver
])

.name;

export default commonModule;
