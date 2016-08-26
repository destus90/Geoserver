import ControlModule from './control'
import ControlController from './control.controller';
import ControlComponent from './control.component';
import ControlTemplate from './control.html';

describe('Control', () => {
  let $rootScope, makeController;

  beforeEach(window.module(ControlModule));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new ControlController();
    };
  }));

  describe('Module', () => {
    // top-level specs: i.e., routes, injection, naming
  });

  describe('Controller', () => {
    // controller specs
    it('has a name property [REMOVE]', () => { // erase if removing this.name from the controller
      let controller = makeController();
      expect(controller).to.have.property('name');
    });
  });

  describe('Template', () => {
    // template specs
    // tip: use regex to ensure correct bindings are used e.g., {{  }}
    it('has name in template [REMOVE]', () => {
      expect(ControlTemplate).to.match(/{{\s?\$ctrl\.name\s?}}/g);
    });
  });

  describe('Component', () => {
      // component/directive specs
      let component = ControlComponent;

      it('includes the intended template',() => {
        expect(component.template).to.equal(ControlTemplate);
      });

      it('invokes the right controller', () => {
        expect(component.controller).to.equal(ControlController);
      });
  });
});
