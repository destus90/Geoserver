import angular from 'angular';
import controlComponent from './control.component';

let controlModule = angular.module('control', [])

.component('control', controlComponent)

.name;

export default controlModule;
