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
class Timer extends Counter {
  constructor(element) {
    super(element);
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
class MinesCounter extends Counter {
  constructor(element) {
    super(element);
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
class Cell {
  minesAround = 0;
  mined = false;
  hiden = true;
  flaged = false;
  quetion = false;
  element = null;
  constructor(element, minesCounter, smiley) {
    this.element = element;

    this.element.oncontextmenu = (e) => {
      e.preventDefault(e);
      this.RightClick(minesCounter);
    };

    function Reset() {
      smiley.className = "";
      this.element.onmouseout = null;
    }
    this.element.onmousedown = (e) => {
      if (e.button == 0) {
        smiley.className = "fear";
        this.element.onmouseout = () => {
          Reset.call(this);
        };
      }
    };
    this.element.onmouseup = (e) => {
      if (e.button == 0) {
        smiley.className = "";
        Reset.call(this);
      }
    };
    this.element.className = "hiden";
  }

  Show() {
    if (this.mined) {
      this.element.className = "mined";
    } else {
      if (this.minesAround == 0) {
        if (this.quetion) this.element.className = "quetion";
        else this.element.className = "empty";
      } else this.element.className = "number" + this.minesAround;
    }
    this.hiden = false;
    this.Stop();
  }
  Mine() {
    this.mined = true;
  }

  Stop() {
    this.element.onclick = () => {};
    this.element.onmousedown = () => {};
    this.element.onmouseup = () => {};
    this.element.oncontextmenu = (e) => {
      e.preventDefault();
    };
  }
  RightClick(minesCounter) {
    if (this.hiden) {
      if (this.flaged) {
        minesCounter.Increase();
        this.flaged = false;
        this.quetion = true;
        this.element.className = "quetionHide";
      } else if (this.quetion) {
        this.quetion = false;
        this.element.className = "hiden";
      } else {
        if (minesCounter.number > 0) {
          this.flaged = true;
          this.element.className = "flaged";
          minesCounter.Decrease();
        }
      }
    }
  }
}

class Sapper {
  timer = new Timer(document.getElementById("timer"));
  minesCounter = new MinesCounter(document.getElementById("minesCounter"));
  smiley = document.getElementById("smiley");
  area = document.querySelector("main");

  pathsAround = [
    { i: -1, j: -1 },
    { i: -1, j: 0 },
    { i: -1, j: 1 },
    { i: 0, j: -1 },
    { i: 0, j: 1 },
    { i: 1, j: -1 },
    { i: 1, j: 0 },
    { i: 1, j: 1 },
  ];
  size = 16;
  startMines = 40;
  cellsMat = [];

  constructor() {
    this.cellCount = this.size * this.size;
    this.smiley.onclick = () => this.ResetCells();
    this.BuildArea();
    this.SetInitialValues();
  }
  BuildArea() {
    for (let i = 0; i < this.size; i++) {
      let newArr = [];
      for (let j = 0; j < this.size; j++) {
        let newCell = this.CreateCell(document.createElement("div"), i, j);
        this.area.append(newCell.element);
        newArr.push(newCell);
      }
      this.cellsMat.push(newArr);
    }
  }
  CreateCell(element, i, j) {
    let cell = new Cell(element, this.minesCounter, this.smiley);

    cell.element.onclick = () => this.LeftClick(i, j);

    return cell;
  }
  LeftClick(i, j) {
    if (this.firstClick) {
      this.firstClick = false;
      this.FillByMines({ i, j });
      this.CountMinesAroundInAllCells();
    }
    let cell = this.cellsMat[i][j];
    if (cell.mined) {
      cell.Show();
      cell.element.className = "explosion";
      this.Lose();
    } else if (cell.minesAround == 0) {
      function openAroundEmty(i, j, further = true) {
        this.cellsMat[i][j].Show();
        this.unopenedCell--;
        if (further) {
          for (let path of this.pathsAround) {
            let currentCell = this.cellsMat[i + path.i]?.[j + path.j];
            if (currentCell) {
              if (currentCell.hiden == true) {
                if (currentCell.minesAround == 0) {
                  openAroundEmty.call(this, i + path.i, j + path.j, true);
                } else {
                  openAroundEmty.call(this, i + path.i, j + path.j, false);
                }
              }
            }
          }
        }
      }
      openAroundEmty.call(this, i, j);
    } else {
      cell.Show();
      this.unopenedCell--;
    }
    if (this.unopenedCell == 0) this.Win();
  }

  SetInitialValues() {
    this.timer.Start();
    this.unopenedCell = this.cellCount - this.startMines;
    this.minesCounter.SetNumber(this.startMines);
    this.firstClick = true;
  }
  ResetCells() {
    this.SetInitialValues();
    this.smiley.className = "";
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.cellsMat[i][j] = this.CreateCell(
          this.cellsMat[i][j].element,
          i,
          j
        );
      }
    }
  }

  Win() {
    this.smiley.className = "cool";
    this.timer.Stop();
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.cellsMat[i][j].Stop();
      }
    }
  }
  Lose() {
    this.smiley.className = "sad";
    this.timer.Stop();
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let cell = this.cellsMat[i][j];
        if (cell.hiden) {
          if (cell.flaged && !cell.mined) cell.element.className = "mistake";
          else if (cell.mined) cell.element.className = "mined";
        }
        cell.Stop();
      }
    }
  }

  FillByMines(except) {
    let r = Array.from(Array(this.cellCount).keys());
    r.splice(except.i * this.size + except.j, 1);
    for (let i = 0; i < this.startMines; i++) {
      let index = r.splice(randomInteger(0, r.length - 1), 1);
      let ost = index % this.size;
      this.cellsMat[(index - ost) / this.size][ost].Mine();
    }
    function randomInteger(min, max) {
      let rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
    }
  }

  CountMinesAroundInAllCells() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let number = 0;
        for (let path of this.pathsAround) {
          if (this.cellsMat[i + path.i]?.[j + path.j]?.mined) number++;
        }
        this.cellsMat[i][j].minesAround = number;
      }
    }
  }
}

new Sapper();
