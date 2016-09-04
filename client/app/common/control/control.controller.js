class ControlController {

  constructor() {
  }

  showModal(type){
    // this.openModal({type})
    type === 'service' ? this.openServiceWin() : null;
  }
}

export default ControlController;
