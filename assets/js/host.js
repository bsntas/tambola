'use strict';

const HostMode = (() => {
    const STORAGE_KEY = 'tambola_host';

    let drawn = [];
    let remaining = [];
    let winners = [];
    let autoTimer = null;
    let autoSpeed = 8000;
    let voiceLang = 'en';
    let isAutoRunning = false;
    let lastDrawn = null;
    let verifyTicket = null;

    /* ---------- persistence ---------- */

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawn, autoSpeed, voiceLang, winners }));
        } catch {}
    }

    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            drawn = d.drawn || [];
            autoSpeed = d.autoSpeed || 8000;
            voiceLang = d.voiceLang || 'en';
            winners = d.winners || [];
        } catch {}
        const drawnSet = new Set(drawn);
        remaining = TambolaGame.shuffle(
            Array.from({ length: 90 }, (_, i) => i + 1).filter(n => !drawnSet.has(n))
        );
        lastDrawn = drawn[drawn.length - 1] ?? null;
    }

    /* ---------- game logic ---------- */

    function drawNumber() {
        if (remaining.length === 0) {
            stopAuto();
            showToast('All 90 numbers have been drawn!', 'info');
            return;
        }
        const idx = Math.floor(Math.random() * remaining.length);
        const num = remaining.splice(idx, 1)[0];
        drawn.push(num);
        lastDrawn = num;
        save();
        renderBoard();
        renderDrawnStrip();
        updateCurrentDisplay(num);
        updateStats();
        announceNumber(num);
    }

    function resetGame() {
        if (!confirm('Reset the game? All drawn numbers and winner records will be cleared.')) return;
        stopAuto();
        drawn = [];
        winners = [];
        remaining = TambolaGame.shuffle(Array.from({ length: 90 }, (_, i) => i + 1));
        lastDrawn = null;
        save();
        renderBoard();
        renderDrawnStrip();
        updateCurrentDisplay(null);
        updateStats();
        renderWinners();
        showToast('Game reset!', 'info');
    }

    function startAuto() {
        if (remaining.length === 0) return;
        isAutoRunning = true;
        document.getElementById('btnAutoStart').classList.add('hidden');
        document.getElementById('btnAutoStop').classList.remove('hidden');
        autoTimer = setInterval(() => {
            if (remaining.length === 0) { stopAuto(); return; }
            drawNumber();
        }, autoSpeed);
    }

    function stopAuto() {
        isAutoRunning = false;
        clearInterval(autoTimer);
        autoTimer = null;
        document.getElementById('btnAutoStart').classList.remove('hidden');
        document.getElementById('btnAutoStop').classList.add('hidden');
    }

    function announceNumber(num) {
        if (!window.speechSynthesis) return;
        const call = (typeof NUMBER_CALLS !== 'undefined') ? NUMBER_CALLS[num] : null;
        const emojiRE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2702}-\u{27B0}️]/gu;

        let text, lang;
        if (call) {
            if (voiceLang === 'hi') {
                text = call.hi.replace(emojiRE, '').trim();
                lang = 'hi-IN';
            } else if (voiceLang === 'ne') {
                text = call.ne.replace(emojiRE, '').trim();
                lang = 'ne-NP';
            } else {
                const phrase = call.en.replace(emojiRE, '').trim();
                text = `Number ${num}. ${phrase}`;
                lang = 'en-IN';
            }
        } else {
            text = voiceLang === 'en' ? `Number ${num}` : `${num}`;
            lang = voiceLang === 'hi' ? 'hi-IN' : voiceLang === 'ne' ? 'ne-NP' : 'en-IN';
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.82;
        utterance.pitch = 1.1;
        utterance.lang = lang;
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    }

    function updateCallDisplay(num) {
        const card = document.getElementById('callCard');
        if (!card) return;
        if (num === null || typeof NUMBER_CALLS === 'undefined' || !NUMBER_CALLS[num]) {
            card.classList.add('hidden');
            return;
        }
        const call = NUMBER_CALLS[num];
        document.getElementById('callEn').textContent = call.en;
        document.getElementById('callHi').textContent = call.hi;
        document.getElementById('callNe').textContent = call.ne;
        card.classList.remove('hidden');
        card.classList.remove('call-slide-in');
        void card.offsetWidth;
        card.classList.add('call-slide-in');
    }

    /* ---------- render ---------- */

    function renderBoard() {
        const drawnSet = new Set(drawn);
        const board = document.getElementById('numberBoard');
        board.innerHTML = '';

        for (let n = 1; n <= 90; n++) {
            const cell = document.createElement('button');
            cell.className = 'board-cell' + (drawnSet.has(n) ? ' drawn' : '') + (n === lastDrawn ? ' latest' : '');
            cell.textContent = n;
            cell.setAttribute('aria-label', `Number ${n}${drawnSet.has(n) ? ' drawn' : ''}`);
            board.appendChild(cell);
        }
    }

    function renderDrawnStrip() {
        const strip = document.getElementById('drawnStrip');
        strip.innerHTML = '';
        const recent = [...drawn].reverse().slice(0, 20);
        recent.forEach((n, i) => {
            const span = document.createElement('span');
            span.className = 'strip-num' + (i === 0 ? ' latest' : '');
            span.textContent = n;
            strip.appendChild(span);
        });
    }

    function updateCurrentDisplay(num) {
        const el = document.getElementById('currentNumber');
        const empty = document.getElementById('emptyDraw');
        if (num === null) {
            el.classList.add('hidden');
            empty.classList.remove('hidden');
        } else {
            el.classList.remove('hidden');
            empty.classList.add('hidden');
            el.textContent = num;
            el.classList.remove('pop-in');
            void el.offsetWidth;
            el.classList.add('pop-in');
        }
        updateCallDisplay(num);
    }

    function updateStats() {
        const drawnEl = document.getElementById('drawnCount');
        const remEl = document.getElementById('remainingCount');
        if (drawnEl) drawnEl.textContent = drawn.length;
        if (remEl) remEl.textContent = remaining.length;
    }

    /* ---------- claim verification ---------- */

    function openVerifyModal() {
        verifyTicket = null;
        document.getElementById('ticketCodeInput').value = '';
        document.getElementById('verifyResult').innerHTML = '';
        document.getElementById('ticketPreview').innerHTML = '';
        document.getElementById('houseSelectRow').classList.add('hidden');
        document.getElementById('claimTypeSelect').innerHTML = '';
        document.getElementById('saveWinnerRow').classList.add('hidden');
        document.getElementById('winnerNameInput').value = '';
        document.getElementById('verifyModal').classList.remove('hidden');
    }

    function closeVerifyModal() {
        document.getElementById('verifyModal').classList.add('hidden');
    }

    function decodeVerifyTicket() {
        const code = document.getElementById('ticketCodeInput').value.trim();
        if (!code) return;
        const book = TambolaGame.decodeBook(code);
        if (!book) {
            document.getElementById('ticketPreview').innerHTML =
                '<p class="error-text">Invalid ticket code. Please check and try again.</p>';
            verifyTicket = null;
            return;
        }
        verifyTicket = book;
        renderVerifyPreview(book);
        populateHouseSelect(book);
    }

    function populateHouseSelect(book) {
        const hSel = document.getElementById('houseSelect');
        hSel.innerHTML = '';
        // Early Five option (whole ticket)
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = '✋ Early Five (whole ticket)';
        hSel.appendChild(allOpt);
        book.forEach((_, i) => {
            const opt = document.createElement('option');
            opt.value = String(i);
            opt.textContent = `House ${i + 1}`;
            hSel.appendChild(opt);
        });
        document.getElementById('houseSelectRow').classList.remove('hidden');
        updateClaimTypeSelect();
    }

    function updateClaimTypeSelect() {
        const hSel  = document.getElementById('houseSelect');
        const cSel  = document.getElementById('claimTypeSelect');
        const isAll = hSel.value === 'all';
        cSel.innerHTML = '';
        const types = isAll ? TambolaGame.TICKET_CLAIM_TYPES : TambolaGame.HOUSE_CLAIM_TYPES;
        types.forEach(ct => {
            const opt = document.createElement('option');
            opt.value = ct.id;
            opt.textContent = `${ct.icon} ${ct.label}`;
            cSel.appendChild(opt);
        });
    }

    function renderVerifyPreview(book) {
        const drawnSet = new Set(drawn);
        let html = '';
        book.forEach((house, hi) => {
            html += `<div class="claim-house-mini"><div class="claim-house-label">House ${hi + 1}</div><div class="ticket-mini">`;
            for (let r = 0; r < TambolaGame.ROWS; r++) {
                html += '<div class="ticket-row">';
                for (let c = 0; c < TambolaGame.COLS; c++) {
                    const n = house[r][c];
                    const cls = n === 0 ? 'blank' : drawnSet.has(n) ? 'hit' : 'miss';
                    html += `<div class="tcell ${cls}">${n || ''}</div>`;
                }
                html += '</div>';
            }
            html += '</div></div>';
        });
        document.getElementById('ticketPreview').innerHTML = html;
    }

    function runVerification() {
        if (!verifyTicket) {
            showToast('Load a ticket code first.', 'warn');
            return;
        }
        const hSel    = document.getElementById('houseSelect');
        const claimId = document.getElementById('claimTypeSelect').value;
        const isAll   = hSel.value === 'all';
        const resEl   = document.getElementById('verifyResult');

        let won, claimLabel;
        if (isAll) {
            won = TambolaGame.checkEarlyFive(verifyTicket, drawn);
            claimLabel = TambolaGame.TICKET_CLAIM_TYPES.find(c => c.id === claimId)?.label ?? claimId;
        } else {
            const hIdx = Number(hSel.value);
            won = TambolaGame.checkHouseWin(verifyTicket[hIdx], drawn, claimId);
            claimLabel = TambolaGame.HOUSE_CLAIM_TYPES.find(c => c.id === claimId)?.label ?? claimId;
        }

        if (won) {
            resEl.innerHTML = `<div class="verify-win">✅ VALID CLAIM! <span>${claimLabel}</span> is complete.</div>`;
            document.getElementById('saveWinnerRow').classList.remove('hidden');
            document.getElementById('winnerNameInput').focus();
        } else {
            resEl.innerHTML = `<div class="verify-fail">❌ NOT YET. <span>${claimLabel}</span> is not complete with drawn numbers.</div>`;
            document.getElementById('saveWinnerRow').classList.add('hidden');
        }
        renderVerifyPreview(verifyTicket);
    }

    /* ---------- winners ---------- */

    function saveWinner() {
        if (!verifyTicket) return;
        const name = document.getElementById('winnerNameInput').value.trim() || 'Anonymous';
        const hSel    = document.getElementById('houseSelect');
        const claimId = document.getElementById('claimTypeSelect').value;
        const isAll   = hSel.value === 'all';

        let prizeLabel, prizeIcon, scope;
        if (isAll) {
            const ct = TambolaGame.TICKET_CLAIM_TYPES.find(c => c.id === claimId);
            prizeLabel = ct?.label ?? claimId;
            prizeIcon  = ct?.icon  ?? '🏆';
            scope      = 'Whole Ticket';
        } else {
            const hIdx = Number(hSel.value);
            const ct   = TambolaGame.HOUSE_CLAIM_TYPES.find(c => c.id === claimId);
            prizeLabel = ct?.label ?? claimId;
            prizeIcon  = ct?.icon  ?? '🏆';
            scope      = `House ${hIdx + 1}`;
        }

        const ticketId = TambolaGame.bookId(verifyTicket);
        winners.push({ name, prizeLabel, prizeIcon, scope, ticketId, drawnAt: drawn.length });
        save();
        renderWinners();

        document.getElementById('saveWinnerRow').classList.add('hidden');
        document.getElementById('winnerNameInput').value = '';
        showToast(`${prizeIcon} ${name} recorded as winner!`, 'info');
    }

    function renderWinners() {
        const section = document.getElementById('winnersSection');
        const list    = document.getElementById('winnersList');
        if (!section) return;
        if (winners.length === 0) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');
        list.innerHTML = winners.map((w, i) => `
            <div class="winner-entry">
                <span class="winner-prize-icon">${w.prizeIcon}</span>
                <div class="winner-info">
                    <span class="winner-name">${esc(w.name)}</span>
                    <span class="winner-meta">${esc(w.prizeLabel)} &middot; ${esc(w.scope)} &middot; after ${w.drawnAt} numbers</span>
                </div>
                <span class="winner-ticket-id">#${esc(w.ticketId)}</span>
                <button class="winner-remove" data-idx="${i}" aria-label="Remove winner">×</button>
            </div>
        `).join('');
        list.querySelectorAll('.winner-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                winners.splice(Number(btn.dataset.idx), 1);
                save();
                renderWinners();
            });
        });
    }

    function esc(s) {
        return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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
        renderBoard();
        renderDrawnStrip();
        updateCurrentDisplay(lastDrawn);
        updateStats();

        /* speed selector */
        const speedSel = document.getElementById('autoSpeedSelect');
        speedSel.value = String(autoSpeed);
        speedSel.addEventListener('change', () => {
            autoSpeed = Number(speedSel.value);
            save();
            if (isAutoRunning) { stopAuto(); startAuto(); }
        });

        /* voice language selector */
        const voiceSel = document.getElementById('voiceLangSelect');
        voiceSel.value = voiceLang;
        voiceSel.addEventListener('change', () => {
            voiceLang = voiceSel.value;
            save();
        });

        document.getElementById('btnDraw').addEventListener('click', drawNumber);
        document.getElementById('btnReset').addEventListener('click', resetGame);
        document.getElementById('btnAutoStart').addEventListener('click', startAuto);
        document.getElementById('btnAutoStop').addEventListener('click', stopAuto);
        document.getElementById('btnVerify').addEventListener('click', openVerifyModal);
        document.getElementById('btnCloseVerify').addEventListener('click', closeVerifyModal);
        document.getElementById('btnDecodeTicket').addEventListener('click', decodeVerifyTicket);
        document.getElementById('btnRunVerify').addEventListener('click', runVerification);

        document.getElementById('ticketCodeInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') decodeVerifyTicket();
        });

        document.getElementById('verifyModal').addEventListener('click', e => {
            if (e.target === document.getElementById('verifyModal')) closeVerifyModal();
        });

        document.getElementById('houseSelect').addEventListener('change', updateClaimTypeSelect);

        document.getElementById('btnSaveWinner').addEventListener('click', saveWinner);
        document.getElementById('winnerNameInput').addEventListener('keydown', e => {
            if (e.key === 'Enter') saveWinner();
        });

        renderWinners();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', HostMode.init);
