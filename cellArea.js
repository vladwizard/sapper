export default class CellArea {
    domElement = document.getElementById("area")

    size = 16;
    pathsAround = [-this.size - 1, -this.size, -this.size + 1, -1, +1, this.size - 1, this.size, this.size + 1];
    cells = new Array(this.size * this.size);

    startMines = 40;

    unopenedCell = this.cellCount - this.startMines;
    firstClick = true

    constructor(Win, Lose, mineCounter, smiley) {
        this.smiley = smiley
        this.Win = Win
        this.Lose = Lose
        this.mineCounter = mineCounter

        this.BuildArea()

    }
    Stop() {
        for (let cell of this.cells) {
            cell.Stop();
        }
    }

    LeftClick(i) {
        if (this.firstClick) {
            this.firstClick = false;
            this.FillByMines(i);
            this.CountMinesAroundInAllCells();
        }
        let cell = this.cells[i];
        if (cell.mined) {
            cell.Show();
            cell.domElement.className = "explosion";
            this.Lose();
        } else if (cell.minesAround == 0) {
            function openAroundEmty(i, further = true) {
                this.cells[i].Show();
                this.unopenedCell--;
                if (further) {
                    for (let path of this.pathsAround) {
                        let currentCell = this.cells[i + path];
                        if (currentCell) {
                            if (currentCell.hiden == true) {
                                if (currentCell.minesAround == 0) {
                                    openAroundEmty.call(this, i + path, true);
                                } else {
                                    openAroundEmty.call(this, i + path, false);
                                }
                            }
                        }
                    }
                }
            }
            openAroundEmty.call(this, i);
        } else {
            cell.Show();
            this.unopenedCell--;
        }
        if (this.unopenedCell == 0) this.Win();
    }

    BuildArea() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i] = new Cell(document.createElement("div"), this.smiley, this.minesCounter);

            this.cells[i].domElement.onclick = () => this.LeftClick(i)

            this.domElement.append(this.cells[i].domElement)
        }
    }

    Reset() {
        this.unopenedCell = this.cellCount - this.startMines;
        this.minesCounter.SetNumber(this.startMines);
        this.firstClick = true;

        this.SetInitialValues();

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
    FillByMines(except) {
        let r = Array.from(Array(this.cells.length).keys());
        r.splice(except, 1);
        for (let i = 0; i < this.startMines; i++) {
            let index = r.splice(randomInteger(0, r.length - 1), 1)[0];
            this.cells[index].mined = true;
        }
        function randomInteger(min, max) {
            let rand = min - 0.5 + Math.random() * (max - min + 1);
            return Math.round(rand);
        }
    }

    CountMinesAroundInAllCells() {
        for (let i in this.cells) {
            for (let path of this.pathsAround) {
                let index = +i + path
                if (index >= 0 && index <= this.cells.length - 1 && this.cells[index].mined) this.cells[i].minesAround++;
            }
        }
    }
    Reset() {
        this.unopenedCell = this.cellCount - this.startMines;
        this.minesCounter.SetNumber(this.startMines);
        this.firstClick = true;
    }
    Open() {
        for (let cell of this.cells) {
            cell.Show()
        }
    }
}
class Cell {
    minesAround = 0;
    mined = false;
    hiden = true;
    domElement = null;

    RightClick = function () {
        let gear = 0
        let classes = {
            0: () => {
                this.domElement.className = "hiden"
                this.minesCounter.Decrease();
            },
            1: () => {  
                this.domElement.classList.add("flaged")
                this.minesCounter.Increase();
            },
            2: () => {
                this.domElement.classList.remove("flaged")
                this.domElement.classList.add("quetion");
            }
        }
        return () => {
            gear++
            if (gear == 3) gear = 0
            classes[gear].call(this)
        }
    }.call(this)

    constructor(domElement, smiley, minesCounter) {
        this.minesCounter = minesCounter
        this.domElement = domElement;
        this.domElement.oncontextmenu = (e) => {
            this.RightClick.call(this)
            e.preventDefault(e);
        };
        function Reset() {
            smiley.className = "";
            this.domElement.onmouseout = null;
        }
        this.domElement.onmousedown = (e) => {
            if (e.button == 0) {
                smiley.className = "fear";
                this.domElement.onmouseout = () => {
                    Reset.call(this);
                };
            }
        };
        this.domElement.onmouseup = (e) => {
            if (e.button == 0) {
                smiley.className = "";
                Reset.call(this);
            }
        };
        this.domElement.className = "hiden";
    }

    Show() {
        this.domElement.classList.remove('hiden')
        if (this.mined) {
            this.domElement.classList.add("mined");
        } else {
            this.domElement.className = "number" + this.minesAround;
        }
        this.hiden = false;
        this.Stop();
    }

    Stop() {
        this.domElement.onclick = () => { };
        this.domElement.onmousedown = () => { };
        this.domElement.onmouseup = () => { };
        this.domElement.oncontextmenu = (e) => {
            e.preventDefault();
        };
    }
}