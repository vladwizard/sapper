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
  constructor(element, click, minesCounter, smiley) {
    this.element = element;
    this.element.onclick = click;
    this.smiley = smiley;
    this.element.onmousedown = (e) => {
      if (e.button == 0) {
        smiley.className = "fear";
        this.element.onmouseout = () => {
          this.Reset(smiley);
        };
      }
    };
    this.element.onmouseup = (e) => {
      if (e.button == 0) {
        smiley.className = "";
        this.Reset(smiley);
      }
    };
    this.element.oncontextmenu = (e) => {
      e.preventDefault();
      this.RightClick(minesCounter);
    };
    this.Hide();
  }
  Hide() {
    this.element.className = "hiden";
  }
  Show() {
    if (this.mined) {
      this.element.className = "mined";
    } else {
      if (this.minesAround == 0) this.element.className = "empty";
      else this.element.className = "number" + this.minesAround;
    }
    this.hiden = false;
    this.Stop();
  }
  Mine() {
    this.mined = true;
  }
  Reset() {
    this.smiley.className = "";
    this.element.onmouseout = null;
  }
  Stop() {
    this.element.onclick = () => {};
    this.element.onmousedown = () => {};
    this.element.onmouseup = () => {};
    this.element.oncontextmenu = (e) => {
      e.preventDefault();
    };
  }
  RightClick(counter) {
    if (this.hiden) {
      if (this.flaged) {
        counter.SetNumber(counter.number + 1);
        this.flaged = false;
        this.quetion = true;
        this.element.className = "quetionHide";
      } else if (this.quetion) {
        this.flaged = false;
        this.quetion = false;
        this.element.className = "hiden";
      } else {
        this.flaged = true;
        this.element.className = "flaged";
        counter.SetNumber(counter.number - 1);
      }
    }
  }
  LeftClick(counter) {
    if (this.hiden) {
      if (this.flaged) {
        counter.SetNumber(counter.number + 1);
        this.flaged = false;
        this.quetion = true;
        this.element.className = "quetionHide";
      } else if (this.quetion) {
        this.flaged = false;
        this.quetion = false;
        this.element.className = "hiden";
      } else {
        this.flaged = true;
        this.element.className = "flaged";
        counter.SetNumber(counter.number - 1);
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
    return new Cell(
      element,
      () => {
        this.Click(i, j);
      },
      this.minesCounter,
      this.smiley
    );
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
  Click(i, j) {
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
      function aroundHandle(i, j, cellsMat, pathsAround, reduce, further = true) {
        cellsMat[i][j].Show();
        reduce();
        if (further) {
          for (let path of pathsAround) {
            let current = cellsMat[i + path.i]?.[j + path.j];
            if (current) {
              if (current.hiden == true) {
                if (current.minesAround == 0) {
                  aroundHandle(
                    i + path.i,
                    j + path.j,
                    cellsMat,
                    pathsAround,
                    reduce,
                    true
                  );
                } else {
                  aroundHandle(
                    i + path.i,
                    j + path.j,
                    cellsMat,
                    pathsAround,
                    reduce,
                    false
                  );
                }
              }
            }
          }
        }
      }
      let byMe = aroundHandle(i, j, this.cellsMat, this.pathsAround, () => this.unopenedCell--);
    } else {
      cell.Show();
      this.unopenedCell--;
    }
    if (this.unopenedCell == 0) this.Win();
  }

  Win() {
    this.smiley.className = "cool";
    this.timer.Stop();
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        cell.Stop();
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
