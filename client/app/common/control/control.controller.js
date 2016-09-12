class ControlController {

  showModal(type){
    switch (type){
      case 'service': {
        this.openServiceWin();
        break;
      }
      case 'legend': {
        this.openLegendWin();
      }
    }
  }
}

export default ControlController;
