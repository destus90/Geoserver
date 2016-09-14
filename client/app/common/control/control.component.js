import template from './control.html';
import controller from './control.controller';
import './control.styl';

let controlComponent = {
  restrict: 'E',
  bindings: {
    openServiceWin: "&",
    openLegendWin: "&",
    findFeatureByText: "&"
  },
  template,
  controller
};

export default controlComponent;
