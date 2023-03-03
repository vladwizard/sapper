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
  constructor(element, click, smiley) {
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
}

class Sapper {
  paths = [
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

  mat = [];
  timer = new Timer(document.getElementById("timer"));
  minesCounter = new MinesCounter(document.getElementById("minesCounter"));
  smiley = document.getElementById("smiley");
  area = document.querySelector("main");
  constructor() {
    this.timer.Start();
    this.minesCounter.SetNumber(this.startMines);
    this.BuildArea();
    this.smiley.onclick = () => this.Reset();
    this.unopenedCell = this.size * this.size - this.startMines;
  }
  Reset() {
    this.unopenedCell = this.size * this.size - this.startMines;
    this.timer.Start();
    this.minesCounter.SetNumber(this.startMines);
    this.firstClick = true;
    this.smiley.className = "";
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.mat[i][j] = new Cell(
          this.mat[i][j].element,
          () => {
            this.Click(i, j);
          },

          this.smiley
        );
        this.mat[i][j].oncontextmenu = (e) => {
          e.preventDefault();
          console.log(this.minesCounter);
          this.mat[i][j].RightClick(this.minesCounter);
        };
      }
    }
  }
  firstClick = true;
  Click(i, j) {
    if (this.firstClick) {
      this.firstClick = false;
      this.FillByMines({ i, j });
      this.CountMinesInAllCells();
      this.unopenedCell--;
    }
    let cell = this.mat[i][j];
    if (cell.mined) {
      cell.Show();
      cell.element.className = "explosion";
      this.Lose();
    } else if (cell.minesAround == 0) {
      function aroundHandle(i, j, mat, paths, reduce, further = true) {
        mat[i][j].Show();
        reduce();
        if (further) {
          for (let path of paths) {
            let row = mat[i + path.i];
            if (row) {
              let current = row[j + path.j];
              if (current) {
                if (current.hiden == true) {
                  if (current.minesAround == 0) {
                    aroundHandle(
                      i + path.i,
                      j + path.j,
                      mat,
                      paths,
                      reduce,
                      true
                    );
                  } else {
                    aroundHandle(
                      i + path.i,
                      j + path.j,
                      mat,
                      paths,
                      reduce,
                      false
                    );
                  }
                }
              }
            }
          }
        }
      }
      aroundHandle(i, j, this.mat, this.paths, () => this.unopenedCell--);
    } else {
      cell.Show();
      this.unopenedCell--;
    }
    if (this.unopenedCell == -1) this.Win();
  }

  Show() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        this.mat[i][j].Show();
      }
    }
  }
  Win() {
    this.smiley.className = "cool";
    this.timer.Stop();
  }
  Lose() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let cell = this.mat[i][j];
        if (cell.hiden) {
          if (cell.flaged && !cell.mined) cell.element.className = "mistake";
          else if (cell.mined) cell.element.className = "mined";
        }
        cell.Stop();
      }
    }
    this.timer.Stop();
    this.smiley.className = "sad";
  }
  BuildArea() {
    for (let i = 0; i < this.size; i++) {
      let newArr = [];
      for (let j = 0; j < this.size; j++) {
        let newCell = new Cell(
          document.createElement("div"),
          () => {
            this.Click(i, j);
          },

          this.smiley
        );
        newCell.element.oncontextmenu = (e) => {
          e.preventDefault();
          this.mat[i][j].RightClick(this.minesCounter);
        };
        this.area.append(newCell.element);
        newArr.push(newCell);
      }
      this.mat.push(newArr);
    }
  }
  FillByMines(except) {
    let r = Array.from(Array(this.size * this.size).keys());
    r.splice(except.i * this.size + except.j, 1);
    for (let i = 0; i < this.startMines; i++) {
      let index = r.splice(randomInteger(0, r.length - 1), 1);
      let ost = index % this.size;
      this.mat[(index - ost) / this.size][ost].Mine();
    }
    function randomInteger(min, max) {
      let rand = min - 0.5 + Math.random() * (max - min + 1);
      return Math.round(rand);
    }
  }

  CountMinesInAllCells() {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let number = 0;
        for (let path of this.paths) {
          let row = this.mat[i + path.i];
          if (row) if (row[j + path.j]?.mined) number++;
        }
        this.mat[i][j].minesAround = number;
      }
    }
  }
}

let sapper = new Sapper();
