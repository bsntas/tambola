'use strict';

const PlayerMode = (() => {
    const STORAGE_KEY = 'tambola_player_v2'; // v2 for 5-house book format

    let books  = [];   // array of books; each book = array of 5 houses (3×9 grids)
    let marked = [];   // array of Set — one per book (numbers are unique across houses)
    let activeIdx = 0;

    /* ── persistence ── */
    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                books,
                marked: marked.map(s => [...s]),
            }));
        } catch {}
    }

    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (Array.isArray(d.books) && d.books.length) {
                books  = d.books;
                marked = d.marked.map(m => new Set(m));
                return;
            }
        } catch {}
        books  = [];
        marked = [];
    }

    /* ── book management ── */
    function addBook(prebuilt) {
        const book = prebuilt || TambolaGame.generateBookTicket();
        books.push(book);
        marked.push(new Set());
        activeIdx = books.length - 1;
        save();
        renderTabs();
        renderBook(activeIdx);
        updateTicketCount();
    }

    function removeBook(idx) {
        if (books.length <= 1) { showToast('Need at least one ticket.', 'warn'); return; }
        if (!confirm('Remove this ticket?')) return;
        books.splice(idx, 1);
        marked.splice(idx, 1);
        activeIdx = Math.min(activeIdx, books.length - 1);
        save();
        renderTabs();
        renderBook(activeIdx);
        updateTicketCount();
    }

    function switchTab(idx) {
        activeIdx = idx;
        renderTabs();
        renderBook(activeIdx);
    }

    function toggleMark(bookIdx, num) {
        const s = marked[bookIdx];
        s.has(num) ? s.delete(num) : s.add(num);
        save();
        renderBook(bookIdx);
    }

    /* ── tabs ── */
    function renderTabs() {
        const bar = document.getElementById('tabBar');
        bar.innerHTML = '';
        books.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (i === activeIdx ? ' active' : '');
            btn.textContent = `#${i + 1}`;
            btn.addEventListener('click', () => switchTab(i));
            bar.appendChild(btn);
        });
        const add = document.createElement('button');
        add.className = 'tab-btn add-tab';
        add.title = 'Add new ticket';
        add.textContent = '＋';
        add.addEventListener('click', () => {
            if (books.length >= 6) { showToast('Maximum 6 tickets.', 'warn'); return; }
            addBook();
        });
        bar.appendChild(add);
    }

    /* ── book render ── */
    function renderBook(idx) {
        const book      = books[idx];
        const markedSet = marked[idx];
        const status    = TambolaGame.bookWinStatus(book, [...markedSet]);

        const container = document.getElementById('ticketContainer');
        container.innerHTML = '';

        const wrap = document.createElement('div');
        wrap.className = 'book-wrap';

        // book header
        const bHdr = document.createElement('div');
        bHdr.className = 'book-header';
        const markedCount = [...markedSet].filter(n =>
            book.some(h => TambolaGame.houseNums(h).includes(n))
        ).length;
        bHdr.innerHTML = `
          <span class="book-title">TAMBOLA</span>
          <span class="book-meta">Ticket #${idx+1} &nbsp;·&nbsp; ID: ${TambolaGame.bookId(book)}</span>
          <span class="book-marked">${markedCount} / 90 marked</span>
        `;

        // early five badge (whole ticket)
        const ef = document.createElement('div');
        ef.className = 'early-five-strip';
        const efBadge = document.createElement('span');
        efBadge.className = 'ef-badge' + (status.early_five ? ' won' : '');
        efBadge.textContent = '✋ Early Five';
        efBadge.title = 'Any 5 numbers from the entire ticket';
        if (status.early_five) efBadge.addEventListener('click', () => openClaimModal(idx, null, 'early_five'));
        ef.appendChild(efBadge);

        wrap.appendChild(bHdr);
        wrap.appendChild(ef);

        // 5 houses
        const HOUSE_COLORS = ['#c0392b','#2980b9','#27ae60','#8e44ad','#d35400'];

        book.forEach((house, hIdx) => {
            const hs = status.houses[hIdx];
            const hDiv = document.createElement('div');
            hDiv.className = 'house-block';

            // house header
            const hHdr = document.createElement('div');
            hHdr.className = 'house-header';
            hHdr.style.background = HOUSE_COLORS[hIdx];

            const hLabel = document.createElement('span');
            hLabel.className = 'house-label';
            hLabel.textContent = `House ${hIdx + 1}`;

            const hBadges = document.createElement('div');
            hBadges.className = 'house-badges';
            TambolaGame.HOUSE_CLAIM_TYPES.forEach(ct => {
                const b = document.createElement('button');
                b.className = 'hbadge' + (hs[ct.id] ? ' won' : '');
                b.title = ct.label;
                b.textContent = ct.icon;
                if (hs[ct.id]) b.addEventListener('click', () => openClaimModal(idx, hIdx, ct.id));
                hBadges.appendChild(b);
            });

            hHdr.appendChild(hLabel);
            hHdr.appendChild(hBadges);
            hDiv.appendChild(hHdr);

            // grid
            const grid = document.createElement('div');
            grid.className = 'house-grid';

            const ROW_LABELS = ['T','M','B'];
            const ROW_WINS   = ['top_row','middle_row','bottom_row'];

            for (let r = 0; r < TambolaGame.ROWS; r++) {
                const rowWon = hs[ROW_WINS[r]];
                const rowDiv = document.createElement('div');
                rowDiv.className = 'house-row' + (rowWon ? ' row-win' : '');

                for (let c = 0; c < TambolaGame.COLS; c++) {
                    const n = house[r][c];
                    const cell = document.createElement('div');
                    if (n === 0) {
                        cell.className = 'hcell blank';
                    } else {
                        const isMark = markedSet.has(n);
                        cell.className = 'hcell num' + (isMark ? ' marked' : '');
                        cell.textContent = n;
                        cell.setAttribute('role', 'button');
                        cell.setAttribute('tabindex', '0');
                        cell.setAttribute('aria-label', `${n}${isMark ? ', marked' : ''}`);
                        cell.addEventListener('click', () => toggleMark(idx, n));
                        cell.addEventListener('keydown', e => {
                            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMark(idx, n); }
                        });
                    }
                    rowDiv.appendChild(cell);
                }
                grid.appendChild(rowDiv);
            }

            hDiv.appendChild(grid);
            wrap.appendChild(hDiv);
        });

        container.appendChild(wrap);
    }

    /* ── claim modal ── */
    function openClaimModal(bookIdx, houseIdx, claimId) {
        const book = books[bookIdx];
        const code = TambolaGame.encodeBook(book);
        const ct   = houseIdx === null
            ? TambolaGame.TICKET_CLAIM_TYPES.find(c => c.id === claimId)
            : TambolaGame.HOUSE_CLAIM_TYPES.find(c => c.id === claimId);
        const markedSet = marked[bookIdx];

        document.getElementById('claimWinType').textContent =
            `${ct.icon} ${ct.label}` + (houseIdx !== null ? ` — House ${houseIdx + 1}` : ' (Whole Ticket)');
        document.getElementById('claimTicketId').textContent = TambolaGame.bookId(book);
        document.getElementById('claimTicketCode').textContent = code;

        // mini preview: show only the relevant house (or all for early five)
        const miniEl = document.getElementById('claimTicketMini');
        miniEl.innerHTML = '';

        const housesToShow = houseIdx !== null ? [houseIdx] : book.map((_, i) => i);
        const ds = markedSet;

        housesToShow.forEach(hi => {
            const hDiv = document.createElement('div');
            hDiv.className = 'claim-house-mini';
            hDiv.innerHTML = `<div class="claim-house-label">House ${hi+1}</div>`;
            const mini = document.createElement('div');
            mini.className = 'ticket-mini';
            for (let r = 0; r < TambolaGame.ROWS; r++) {
                const row = document.createElement('div');
                row.className = 'ticket-row';
                for (let c = 0; c < TambolaGame.COLS; c++) {
                    const n = book[hi][r][c];
                    const cell = document.createElement('div');
                    cell.className = 'tcell ' + (n === 0 ? 'blank' : ds.has(n) ? 'hit' : 'miss');
                    cell.textContent = n || '';
                    row.appendChild(cell);
                }
                mini.appendChild(row);
            }
            hDiv.appendChild(mini);
            miniEl.appendChild(hDiv);
        });

        document.getElementById('claimModal').classList.remove('hidden');
    }

    function closeClaimModal() {
        document.getElementById('claimModal').classList.add('hidden');
    }

    /* ── sharing ── */
    function shareBook() {
        const code = TambolaGame.encodeBook(books[activeIdx]);
        const url  = `${location.origin}${location.pathname}#ticket=${encodeURIComponent(code)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => showToast('Share link copied!', 'success'));
        } else {
            prompt('Copy this link:', url);
        }
    }

    function copyCode() {
        const code = TambolaGame.encodeBook(books[activeIdx]);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => showToast('Ticket code copied!', 'success'));
        } else {
            prompt('Copy your ticket code:', code);
        }
    }

    function checkUrlTicket() {
        const m = location.hash.match(/[#&]ticket=([^&]+)/);
        if (!m) return;
        const code = decodeURIComponent(m[1]);
        const book = TambolaGame.decodeBook(code);
        if (!book) { showToast('Invalid ticket in URL.', 'warn'); return; }
        const existing = books.find(b => TambolaGame.encodeBook(b) === code);
        if (!existing) { addBook(book); showToast('Ticket loaded from link!', 'success'); }
        history.replaceState(null, '', location.pathname);
    }

    function updateTicketCount() {
        const el = document.getElementById('ticketCount');
        if (el) el.textContent = books.length;
    }

    /* ── toast ── */
    function showToast(msg, type = 'info') {
        const t = document.getElementById('toast');
        t.textContent  = msg;
        t.className    = `toast show ${type}`;
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 3000);
    }

    /* ── init ── */
    function init() {
        load();
        if (books.length === 0) addBook();
        checkUrlTicket();
        renderTabs();
        renderBook(activeIdx);
        updateTicketCount();

        document.getElementById('btnNewTicket').addEventListener('click', () => {
            if (books.length >= 6) { showToast('Maximum 6 tickets.', 'warn'); return; }
            addBook();
        });
        document.getElementById('btnRemoveTicket').addEventListener('click', () => removeBook(activeIdx));
        document.getElementById('btnResetMarks').addEventListener('click', () => {
            if (!confirm('Clear all marks on this ticket?')) return;
            marked[activeIdx].clear();
            save();
            renderBook(activeIdx);
        });
        document.getElementById('btnShareTicket').addEventListener('click', shareBook);
        document.getElementById('btnCopyCode').addEventListener('click', copyCode);
        document.getElementById('btnPrint').addEventListener('click', () => window.print());
        document.getElementById('btnCloseClaim').addEventListener('click', closeClaimModal);
        document.getElementById('claimModal').addEventListener('click', e => {
            if (e.target === document.getElementById('claimModal')) closeClaimModal();
        });
        document.getElementById('btnCopyClaimCode').addEventListener('click', () => {
            const code = document.getElementById('claimTicketCode').textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code)
                    .then(() => showToast('Code copied!', 'success'));
            } else {
                prompt('Copy your ticket code:', code);
            }
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', PlayerMode.init);
