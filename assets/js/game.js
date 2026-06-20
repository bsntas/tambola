'use strict';

const TambolaGame = (() => {
    const COLUMN_RANGES = [
        [1, 9], [10, 19], [20, 29], [30, 39], [40, 49],
        [50, 59], [60, 69], [70, 79], [80, 90]
    ];

    const CLAIM_TYPES = [
        { id: 'top_row',    label: 'Top Row',    icon: '⬆️',  desc: 'All 5 numbers in the top row' },
        { id: 'middle_row', label: 'Middle Row', icon: '➡️',  desc: 'All 5 numbers in the middle row' },
        { id: 'bottom_row', label: 'Bottom Row', icon: '⬇️',  desc: 'All 5 numbers in the bottom row' },
        { id: 'early_five', label: 'Early Five', icon: '✋',  desc: 'Any 5 numbers on the ticket' },
        { id: 'full_house', label: 'Full House', icon: '🏠',  desc: 'All 15 numbers on the ticket' },
    ];

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function generateGrid() {
        while (true) {
            const row0 = shuffle([0,1,2,3,4,5,6,7,8]).slice(0, 5);
            const row1 = shuffle([0,1,2,3,4,5,6,7,8]).slice(0, 5);

            const colCount = Array(9).fill(0);
            row0.forEach(c => colCount[c]++);
            row1.forEach(c => colCount[c]++);

            const mustInclude = [];
            const canInclude = [];
            for (let c = 0; c < 9; c++) {
                if (colCount[c] === 0) mustInclude.push(c);
                else if (colCount[c] === 1) canInclude.push(c);
            }

            if (mustInclude.length > 5) continue;
            const needed = 5 - mustInclude.length;
            if (canInclude.length < needed) continue;

            const row2 = [...mustInclude, ...shuffle(canInclude).slice(0, needed)];

            const grid = Array.from({ length: 3 }, () => Array(9).fill(false));
            row0.forEach(c => (grid[0][c] = true));
            row1.forEach(c => (grid[1][c] = true));
            row2.forEach(c => (grid[2][c] = true));
            return grid;
        }
    }

    function generateTicket() {
        const grid = generateGrid();
        const ticket = Array.from({ length: 3 }, () => Array(9).fill(0));

        for (let col = 0; col < 9; col++) {
            const [min, max] = COLUMN_RANGES[col];
            const rows = [0, 1, 2].filter(r => grid[r][col]).sort((a, b) => a - b);

            const pool = [];
            for (let n = min; n <= max; n++) pool.push(n);
            const chosen = shuffle(pool).slice(0, rows.length).sort((a, b) => a - b);

            rows.forEach((r, i) => (ticket[r][col] = chosen[i]));
        }
        return ticket;
    }

    function encodeTicket(ticket) {
        return btoa(ticket.flat().join(','));
    }

    function decodeTicket(code) {
        try {
            const flat = atob(code.trim()).split(',').map(Number);
            if (flat.length !== 27 || flat.some(n => isNaN(n) || n < 0 || n > 90)) return null;
            return [flat.slice(0, 9), flat.slice(9, 18), flat.slice(18, 27)];
        } catch {
            return null;
        }
    }

    function getRowNums(ticket, row) {
        return ticket[row].filter(n => n > 0);
    }

    function getAllNums(ticket) {
        return ticket.flat().filter(n => n > 0);
    }

    function checkWin(ticket, drawn, claimId) {
        const ds = new Set(drawn);
        if (claimId === 'top_row')    return getRowNums(ticket, 0).every(n => ds.has(n));
        if (claimId === 'middle_row') return getRowNums(ticket, 1).every(n => ds.has(n));
        if (claimId === 'bottom_row') return getRowNums(ticket, 2).every(n => ds.has(n));
        if (claimId === 'early_five') return getAllNums(ticket).filter(n => ds.has(n)).length >= 5;
        if (claimId === 'full_house') return getAllNums(ticket).every(n => ds.has(n));
        return false;
    }

    function winStatus(ticket, drawn) {
        const out = {};
        for (const ct of CLAIM_TYPES) out[ct.id] = checkWin(ticket, drawn, ct.id);
        return out;
    }

    function ticketId(ticket) {
        return encodeTicket(ticket).slice(0, 8).toUpperCase();
    }

    return { COLUMN_RANGES, CLAIM_TYPES, shuffle, generateTicket, encodeTicket, decodeTicket, getRowNums, getAllNums, checkWin, winStatus, ticketId };
})();
