class ControlController {

  // showModal(type){
  //   switch (type){
  //     case 'service': {
  //       this.openServiceWin();
  //       break;
  //     }
  //     case 'legend': {
  //       this.openLegendWin();
  //     }
  //   }
  // }

  switchTab(type){
    this.onSwitchTab({
      $event: {
        type
      }
    })
  }

  find(event){
    //user click enter key or button
    if ( (event.keyCode === 13 || event.type === 'click') && (this.findText) ) {
      this.findFeatureByText({text: this.findText});
    }
  }

}

export default ControlController;
