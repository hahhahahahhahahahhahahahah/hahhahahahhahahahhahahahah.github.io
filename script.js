const boardEl = document.getElementById('board');
const btnNew = document.getElementById('btn-new');

btnNew.onclick = () => {
  const R = +document.getElementById('rows').value;
  const C = +document.getElementById('cols').value;
  const M = +document.getElementById('mines').value;
  init(R, C, M);
};

function init(R, C, M) {
  boardEl.innerHTML = '';
  boardEl.style.gridTemplate = `repeat(${R}, 1fr) / repeat(${C}, 1fr)`;

  // Tạo mảng cell objects
  const cells = Array(R).fill().map((_, i) => 
    Array(C).fill().map((__, j) => ({
      i, j, mine: false, near: 0, opened: false, flagged: false
    }))
  );

  // Đặt ngẫu nhiên M quả mìn
  let placed = 0;
  while (placed < M) {
    const i = Math.floor(Math.random() * R);
    const j = Math.floor(Math.random() * C);
    if (!cells[i][j].mine) {
      cells[i][j].mine = true; placed++;
    }
  }

  // Tính số neighbor mines
  const dirs = [-1,0,1];
  for (let i=0; i<R; i++) for (let j=0; j<C; j++) {
    if (cells[i][j].mine) continue;
    let cnt = 0;
    dirs.forEach(di => dirs.forEach(dj => {
      if (!di && !dj) return;
      const x = i+di, y = j+dj;
      if (cells[x]?.[y]?.mine) cnt++;
    }));
    cells[i][j].near = cnt;
  }

  // Vẽ board
  for (let i=0; i<R; i++) for (let j=0; j<C; j++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.oncontextmenu = e => {
      e.preventDefault();
      if (cellOpenable(cellObj)) {
        cellObj.flagged = !cellObj.flagged;
        cell.classList.toggle('flag');
      }
    };
    cell.onclick = () => openCell(cellObj, cell);
    const cellObj = cells[i][j];
    boardEl.append(cell);
  }

  function cellOpenable(o) {
    return !o.opened;
  }

  function openCell(o, el) {
    if (o.flagged || o.opened) return;
    o.opened = true;
    el.classList.add('open');
    if (o.mine) {
      el.classList.add('mine');
      alert('Game Over!');
      // Mở hết mìn
      cells.flat().forEach(c => {
        if (c.mine) boardEl.children[c.i*C + c.j].classList.add('mine');
      });
      return;
    }
    if (o.near) {
      el.textContent = o.near;
    } else {
      // flood fill
      dirs.forEach(di => dirs.forEach(dj => {
        const x = o.i+di, y = o.j+dj;
        const nb = cells[x]?.[y];
        if (nb && !nb.opened && !nb.mine) {
          openCell(nb, boardEl.children[x*C + y]);
        }
      }));
    }
    // Win check
    const openedCount = cells.flat().filter(c => c.opened).length;
    if (openedCount === R*C - M) {
      alert('Bạn đã thắng!');
    }
  }
}

// Khởi động mặc định
btnNew.click();
