import { MinesCounter, Timer } from './counters.js'
import CellArea from './cellArea.js'

class Smiley {
  smiley = document.getElementById("smiley")
  constructor(ResetGame) {

    this.smiley.onclick = ResetGame;
  }
}
class Sapper {
  timer = new Timer();
  minesCounter = new MinesCounter();
  smiley = new Smiley(this.ResetGame);
  area = new CellArea(this.Win, this.Lose, this.minesCounter, this.smiley);

  constructor() {
    // this.SetInitialValues();
  }

  ResetGame() {
    this.smiley.className = "";
    this.timer.Start();
    this.area.Reset()
  }

  Win() {
    this.smiley.className = "cool";
    this.timer.Stop();
    this.area.Disable();
  }
  Lose() {
    this.smiley.className = "sad";
    this.timer.Stop();
    this.area.Open()
  }
}

new Sapper();