'use strict';

const TambolaGame = (() => {
    const COLUMN_RANGES = [
        [1,9],[10,19],[20,29],[30,39],[40,49],[50,59],[60,69],[70,79],[80,90]
    ];
    const COL_SIZES   = [9,10,10,10,10,10,10,10,11]; // numbers per column across all 90
    const HOUSES      = 5;
    const ROWS        = 3;  // rows per house
    const COLS        = 9;
    const NUMS_PER_ROW = 6; // 5 houses × 3 rows × 6 = 90

    /* ── shuffle ── */
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /* ── column-count matrix ──────────────────────────────────────────────
       Returns a HOUSES×COLS matrix where:
         colCounts[h][c] = how many numbers from column c go into house h
       Row sums = 18 (NUMS_PER_ROW × ROWS), col sums = COL_SIZES.

       Cols 1-7 divide evenly: 10 / 5 = 2 each.
       Col 0 has 9 = 4×2 + 1×1  → one house gets 1, rest get 2.
       Col 8 has 11 = 4×2 + 1×3 → one house gets 3, rest get 2.
       The same house carries the deficit and surplus so its row sum stays 18.
    ── */
    function generateColCounts() {
        const special = Math.floor(Math.random() * HOUSES);
        return Array.from({ length: HOUSES }, (_, h) => {
            const row = Array(COLS).fill(2);
            if (h === special) { row[0] = 1; row[8] = 3; }
            return row;
        });
    }

    /* ── house grid ───────────────────────────────────────────────────────
       Given colCounts[c] ∈ {1,2,3} for each column (summing to 18),
       returns a ROWS×COLS boolean grid where:
         col c has colCounts[c] true values (= that many numbers)
         every row has exactly NUMS_PER_ROW (6) true values

       Strategy: think in terms of blank slots.
         blanks[c] = ROWS - colCounts[c]  ∈ {0,1,2}
         each row needs exactly (COLS - NUMS_PER_ROW) = 3 blanks
         total blanks = ROWS×3 = 9 = sum of blanks[c] ✓

       Process columns highest-blanks first (avoids dead-ends).
    ── */
    function generateHouseGrid(colCounts) {
        const blanksNeeded = colCounts.map(n => ROWS - n);

        // sort cols: most blanks first, shuffle within same group
        const colOrder = shuffle(
            Array.from({ length: COLS }, (_, i) => i)
        ).sort((a, b) => blanksNeeded[b] - blanksNeeded[a]);

        const grid     = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
        const rowBlanks = Array(ROWS).fill(0); // blanks so far per row

        for (const c of colOrder) {
            const nb = blanksNeeded[c];
            if (nb === 0) {
                for (let r = 0; r < ROWS; r++) grid[r][c] = true;
                continue;
            }
            const avail = Array.from({ length: ROWS }, (_, r) => r)
                .filter(r => rowBlanks[r] < COLS - NUMS_PER_ROW); // < 3
            const blankRows = shuffle(avail).slice(0, nb);
            const blankSet  = new Set(blankRows);
            blankRows.forEach(r => rowBlanks[r]++);
            for (let r = 0; r < ROWS; r++) grid[r][c] = !blankSet.has(r);
        }
        return grid;
    }

    /* ── book ticket ──────────────────────────────────────────────────────
       Returns array of HOUSES grids, each ROWS×COLS with actual numbers.
       Numbers 1-90 appear exactly once across all houses.
    ── */
    function generateBookTicket() {
        const colCounts = generateColCounts();
        const grids     = colCounts.map(cc => generateHouseGrid(cc));
        const houses    = grids.map(() =>
            Array.from({ length: ROWS }, () => Array(COLS).fill(0))
        );

        for (let c = 0; c < COLS; c++) {
            const [min, max] = COLUMN_RANGES[c];
            const pool = shuffle(Array.from({ length: max - min + 1 }, (_, i) => min + i));
            let idx = 0;
            for (let h = 0; h < HOUSES; h++) {
                const count    = colCounts[h][c];
                const hNums    = pool.slice(idx, idx + count).sort((a, b) => a - b);
                idx += count;
                const filled   = Array.from({ length: ROWS }, (_, r) => r)
                    .filter(r => grids[h][r][c]).sort((a, b) => a - b);
                filled.forEach((r, i) => houses[h][r][c] = hNums[i]);
            }
        }
        return houses;
    }

    /* ── encode / decode ── */
    function encodeBook(houses) {
        // 5 × 3 × 9 = 135 bytes, each 0-90
        const flat  = houses.flatMap(h => h.flat());
        const bytes = new Uint8Array(flat);
        let   bin   = '';
        bytes.forEach(b => (bin += String.fromCharCode(b)));
        return btoa(bin);
    }

    function decodeBook(code) {
        try {
            const bin  = atob(code.trim());
            const SIZE = HOUSES * ROWS * COLS; // 135
            if (bin.length !== SIZE) return null;
            const flat   = Array.from(bin, c => c.charCodeAt(0));
            const hSize  = ROWS * COLS;
            return Array.from({ length: HOUSES }, (_, h) => {
                const hFlat = flat.slice(h * hSize, (h + 1) * hSize);
                return Array.from({ length: ROWS }, (_, r) =>
                    hFlat.slice(r * COLS, (r + 1) * COLS)
                );
            });
        } catch { return null; }
    }

    /* ── win checking ── */
    function houseNums(house) { return house.flat().filter(n => n > 0); }
    function rowNums(house, r) { return house[r].filter(n => n > 0); }

    function checkHouseWin(house, drawn, claimId) {
        const ds = new Set(drawn);
        if (claimId === 'top_row')    return rowNums(house,0).every(n => ds.has(n));
        if (claimId === 'middle_row') return rowNums(house,1).every(n => ds.has(n));
        if (claimId === 'bottom_row') return rowNums(house,2).every(n => ds.has(n));
        if (claimId === 'full_house') return houseNums(house).every(n => ds.has(n));
        return false;
    }

    function checkEarlyFive(houses, drawn) {
        const ds = new Set(drawn);
        return houses.some(h => houseNums(h).filter(n => ds.has(n)).length >= 5);
    }

    function bookWinStatus(houses, drawn) {
        return {
            early_five: checkEarlyFive(houses, drawn),
            houses: houses.map(h => ({
                top_row:    checkHouseWin(h, drawn, 'top_row'),
                middle_row: checkHouseWin(h, drawn, 'middle_row'),
                bottom_row: checkHouseWin(h, drawn, 'bottom_row'),
                full_house: checkHouseWin(h, drawn, 'full_house'),
            }))
        };
    }

    function bookId(houses) {
        return encodeBook(houses).slice(0, 8).toUpperCase();
    }

    const HOUSE_CLAIM_TYPES = [
        { id:'top_row',    label:'Top Row',    icon:'⬆️', desc:'All 6 numbers in the top row' },
        { id:'middle_row', label:'Middle Row', icon:'➡️', desc:'All 6 numbers in the middle row' },
        { id:'bottom_row', label:'Bottom Row', icon:'⬇️', desc:'All 6 numbers in the bottom row' },
        { id:'full_house', label:'Full House', icon:'🏠', desc:'All 18 numbers in this house' },
    ];
    const TICKET_CLAIM_TYPES = [
        { id:'early_five', label:'Early Five', icon:'✋', desc:'First 5 numbers marked in any single house' },
    ];

    return {
        COLUMN_RANGES, COL_SIZES, HOUSES, ROWS, COLS, NUMS_PER_ROW,
        HOUSE_CLAIM_TYPES, TICKET_CLAIM_TYPES,
        shuffle,
        generateBookTicket, encodeBook, decodeBook,
        checkHouseWin, checkEarlyFive, bookWinStatus, bookId,
        houseNums, rowNums,
    };
})();
