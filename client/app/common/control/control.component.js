import template from './control.html';
import controller from './control.controller';
import './control.styl';

let controlComponent = {
  restrict: 'E',
  bindings: {
    openModal: "&"
  },
  template,
  controller
};

export default controlComponent;
