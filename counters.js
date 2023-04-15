class Counter {
    children = [];
    number = 0;
    constructor(parent) {
      this.children = parent.children;
    }
  
    Refresh() {
      let number = this.number;
      for (let i = this.children.length - 1; i >= 0; i--) {
        let ost = number % 10;
        number = (number - ost) / 10;
        this.children[i].className = "counter" + ost;
      }
    }   
  }
  export class Timer extends Counter {
    constructor() {
      super(document.getElementById("timer"));
    }   
    Stop() {
      clearInterval(this.interval);
    }
    Start() {
      if (this.interval) this.Stop();
      this.number = 0;
      this.Refresh();
      this.interval = setInterval(() => {
        this.number += 1;
        this.Refresh();
      }, 1000);
    }
  }
  export class MinesCounter extends Counter {
    constructor() {
      super(document.getElementById("minesCounter"));
    }
    Increase() {
      this.SetNumber(this.number + 1);
    }
    Decrease() {
      this.SetNumber(this.number - 1);
    }
    SetNumber(x) {
      this.number = x;
      this.Refresh();
    }
  }