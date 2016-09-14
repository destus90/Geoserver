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

  find(){
    this.findFeatureByText({text: this.findText})
  }
}

export default ControlController;
