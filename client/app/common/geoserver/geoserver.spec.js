import GeoserverModule from './geoserver'
import GeoserverController from './geoserver.controller';
import GeoserverComponent from './geoserver.component';
import GeoserverTemplate from './geoserver.html';

describe('Geoserver', () => {
  let $rootScope, makeController;

  beforeEach(window.module(GeoserverModule));
  beforeEach(inject((_$rootScope_) => {
    $rootScope = _$rootScope_;
    makeController = () => {
      return new GeoserverController();
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
      expect(GeoserverTemplate).to.match(/{{\s?\$ctrl\.name\s?}}/g);
    });
  });

  describe('Component', () => {
      // component/directive specs
      let component = GeoserverComponent;

      it('includes the intended template',() => {
        expect(component.template).to.equal(GeoserverTemplate);
      });

      it('invokes the right controller', () => {
        expect(component.controller).to.equal(GeoserverController);
      });
  });
});
