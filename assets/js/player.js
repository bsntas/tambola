'use strict';

const PlayerMode = (() => {
    const STORAGE_KEY = 'tambola_player';

    let tickets = [];     // array of 3×9 grids
    let marked = [];      // array of Set
    let activeIdx = 0;

    /* ---------- persistence ---------- */

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                tickets,
                marked: marked.map(s => [...s]),
            }));
        } catch {}
    }

    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            if (Array.isArray(d.tickets) && d.tickets.length) {
                tickets = d.tickets;
                marked = d.marked.map(m => new Set(m));
                return;
            }
        } catch {}
        tickets = [];
        marked = [];
    }

    /* ---------- ticket management ---------- */

    function addTicket(prebuilt) {
        const t = prebuilt || TambolaGame.generateTicket();
        tickets.push(t);
        marked.push(new Set());
        activeIdx = tickets.length - 1;
        save();
        renderTabs();
        renderTicket(activeIdx);
        renderWinBadges(activeIdx);
        updateTicketCount();
    }

    function removeTicket(idx) {
        if (tickets.length <= 1) {
            showToast('You need at least one ticket.', 'warn');
            return;
        }
        if (!confirm('Remove this ticket?')) return;
        tickets.splice(idx, 1);
        marked.splice(idx, 1);
        activeIdx = Math.min(activeIdx, tickets.length - 1);
        save();
        renderTabs();
        renderTicket(activeIdx);
        renderWinBadges(activeIdx);
        updateTicketCount();
    }

    function switchTab(idx) {
        activeIdx = idx;
        renderTabs();
        renderTicket(activeIdx);
        renderWinBadges(activeIdx);
    }

    function toggleMark(ticketIdx, num) {
        const s = marked[ticketIdx];
        if (s.has(num)) s.delete(num);
        else s.add(num);
        save();
        renderTicket(ticketIdx);
        renderWinBadges(ticketIdx);
    }

    /* ---------- render tabs ---------- */

    function renderTabs() {
        const bar = document.getElementById('tabBar');
        bar.innerHTML = '';
        tickets.forEach((t, i) => {
            const btn = document.createElement('button');
            btn.className = 'tab-btn' + (i === activeIdx ? ' active' : '');
            btn.textContent = `#${i + 1}`;
            btn.addEventListener('click', () => switchTab(i));
            bar.appendChild(btn);
        });
        const addBtn = document.createElement('button');
        addBtn.className = 'tab-btn add-tab';
        addBtn.title = 'Add new ticket';
        addBtn.innerHTML = '＋';
        addBtn.addEventListener('click', () => {
            if (tickets.length >= 6) { showToast('Maximum 6 tickets per session.', 'warn'); return; }
            addTicket();
        });
        bar.appendChild(addBtn);
    }

    /* ---------- render ticket ---------- */

    function renderTicket(idx) {
        const ticket = tickets[idx];
        const markedSet = marked[idx];
        const status = TambolaGame.winStatus(ticket, [...markedSet]);
        const winRows = {
            0: status.top_row,
            1: status.middle_row,
            2: status.bottom_row,
        };

        const container = document.getElementById('ticketContainer');
        container.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'ticket-card' + (status.full_house ? ' full-house-glow' : '');

        // Header
        const hdr = document.createElement('div');
        hdr.className = 'ticket-header';
        hdr.innerHTML = `
            <span class="ticket-title">TAMBOLA</span>
            <span class="ticket-id">Ticket #${idx + 1} &nbsp;|&nbsp; ID: ${TambolaGame.ticketId(ticket)}</span>
        `;
        card.appendChild(hdr);

        // Grid
        const grid = document.createElement('div');
        grid.className = 'ticket-grid';

        for (let r = 0; r < 3; r++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'ticket-row' + (winRows[r] ? ' row-win' : '');

            for (let c = 0; c < 9; c++) {
                const n = ticket[r][c];
                const cell = document.createElement('div');

                if (n === 0) {
                    cell.className = 'tcell blank';
                } else {
                    const isMarked = markedSet.has(n);
                    cell.className = 'tcell number' + (isMarked ? ' marked' : '');
                    cell.textContent = n;
                    cell.setAttribute('role', 'button');
                    cell.setAttribute('tabindex', '0');
                    cell.setAttribute('aria-label', `Number ${n}${isMarked ? ', marked' : ''}`);
                    cell.addEventListener('click', () => toggleMark(idx, n));
                    cell.addEventListener('keydown', e => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMark(idx, n); }
                    });
                }
                rowDiv.appendChild(cell);
            }
            grid.appendChild(rowDiv);
        }
        card.appendChild(grid);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'ticket-footer';
        const markedCount = [...markedSet].filter(n => TambolaGame.getAllNums(ticket).includes(n)).length;
        footer.innerHTML = `<span>${markedCount} / ${TambolaGame.getAllNums(ticket).length} marked</span>`;
        card.appendChild(footer);

        container.appendChild(card);
    }

    /* ---------- win badges ---------- */

    function renderWinBadges(idx) {
        const ticket = tickets[idx];
        const markedSet = marked[idx];
        const status = TambolaGame.winStatus(ticket, [...markedSet]);
        const panel = document.getElementById('winPanel');
        panel.innerHTML = '';

        for (const ct of TambolaGame.CLAIM_TYPES) {
            const badge = document.createElement('div');
            const won = status[ct.id];
            badge.className = 'win-badge' + (won ? ' won' : '');
            badge.innerHTML = `<span class="badge-icon">${ct.icon}</span><span class="badge-label">${ct.label}</span>`;
            badge.title = ct.desc;

            if (won) {
                badge.addEventListener('click', () => openClaimModal(idx, ct.id));
            }
            panel.appendChild(badge);
        }
    }

    /* ---------- claim modal ---------- */

    function openClaimModal(ticketIdx, claimId) {
        const ticket = tickets[ticketIdx];
        const code = TambolaGame.encodeTicket(ticket);
        const ct = TambolaGame.CLAIM_TYPES.find(c => c.id === claimId);
        const markedSet = marked[ticketIdx];

        const modal = document.getElementById('claimModal');
        document.getElementById('claimWinType').textContent = `${ct.icon} ${ct.label}`;
        document.getElementById('claimTicketCode').textContent = code;
        document.getElementById('claimTicketId').textContent = TambolaGame.ticketId(ticket);

        const drawnSet = new Set([...markedSet]);
        const miniEl = document.getElementById('claimTicketMini');
        let html = '<div class="ticket-mini">';
        for (let r = 0; r < 3; r++) {
            html += '<div class="ticket-row">';
            for (let c = 0; c < 9; c++) {
                const n = ticket[r][c];
                const cls = n === 0 ? 'blank' : drawnSet.has(n) ? 'hit' : 'miss';
                html += `<div class="tcell ${cls}">${n === 0 ? '' : n}</div>`;
            }
            html += '</div>';
        }
        html += '</div>';
        miniEl.innerHTML = html;

        modal.classList.remove('hidden');
    }

    function closeClaimModal() {
        document.getElementById('claimModal').classList.add('hidden');
    }

    /* ---------- share / print ---------- */

    function shareTicket() {
        const code = TambolaGame.encodeTicket(tickets[activeIdx]);
        const url = `${location.origin}${location.pathname}#ticket=${encodeURIComponent(code)}`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => showToast('Share link copied!', 'success'));
        } else {
            prompt('Copy this link:', url);
        }
    }

    function copyCode() {
        const code = TambolaGame.encodeTicket(tickets[activeIdx]);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => showToast('Ticket code copied!', 'success'));
        } else {
            prompt('Copy your ticket code:', code);
        }
    }

    function printTicket() {
        window.print();
    }

    function resetMarks() {
        if (!confirm('Clear all marks on this ticket?')) return;
        marked[activeIdx].clear();
        save();
        renderTicket(activeIdx);
        renderWinBadges(activeIdx);
    }

    /* ---------- import from URL hash ---------- */

    function checkUrlTicket() {
        const hash = location.hash;
        const match = hash.match(/[#&]ticket=([^&]+)/);
        if (!match) return;
        const code = decodeURIComponent(match[1]);
        const ticket = TambolaGame.decodeTicket(code);
        if (!ticket) { showToast('Invalid ticket in URL.', 'warn'); return; }
        // Check if this ticket is already saved
        const existing = tickets.find(t => TambolaGame.encodeTicket(t) === code);
        if (!existing) {
            addTicket(ticket);
            showToast('Ticket loaded from link!', 'success');
        }
        history.replaceState(null, '', location.pathname);
    }

    function updateTicketCount() {
        const el = document.getElementById('ticketCount');
        if (el) el.textContent = tickets.length;
    }

    /* ---------- toast ---------- */

    function showToast(msg, type = 'info') {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className = `toast show ${type}`;
        clearTimeout(t._timer);
        t._timer = setTimeout(() => t.classList.remove('show'), 3000);
    }

    /* ---------- init ---------- */

    function init() {
        load();
        if (tickets.length === 0) addTicket();
        checkUrlTicket();
        renderTabs();
        renderTicket(activeIdx);
        renderWinBadges(activeIdx);
        updateTicketCount();

        document.getElementById('btnNewTicket').addEventListener('click', () => {
            if (tickets.length >= 6) { showToast('Maximum 6 tickets.', 'warn'); return; }
            addTicket();
        });
        document.getElementById('btnRemoveTicket').addEventListener('click', () => removeTicket(activeIdx));
        document.getElementById('btnResetMarks').addEventListener('click', resetMarks);
        document.getElementById('btnShareTicket').addEventListener('click', shareTicket);
        document.getElementById('btnCopyCode').addEventListener('click', copyCode);
        document.getElementById('btnPrint').addEventListener('click', printTicket);
        document.getElementById('btnCloseClaim').addEventListener('click', closeClaimModal);
        document.getElementById('claimModal').addEventListener('click', e => {
            if (e.target === document.getElementById('claimModal')) closeClaimModal();
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', PlayerMode.init);
