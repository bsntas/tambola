'use strict';

const HostMode = (() => {
    const STORAGE_KEY = 'tambola_host';

    let drawn = [];
    let remaining = [];
    let autoTimer = null;
    let autoSpeed = 8000;
    let isAutoRunning = false;
    let lastDrawn = null;
    let verifyTicket = null;

    /* ---------- persistence ---------- */

    function save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ drawn, autoSpeed }));
        } catch {}
    }

    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            drawn = d.drawn || [];
            autoSpeed = d.autoSpeed || 8000;
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
        if (!confirm('Reset the game? All drawn numbers will be cleared.')) return;
        stopAuto();
        drawn = [];
        remaining = TambolaGame.shuffle(Array.from({ length: 90 }, (_, i) => i + 1));
        lastDrawn = null;
        save();
        renderBoard();
        renderDrawnStrip();
        updateCurrentDisplay(null);
        updateStats();
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
        // Strip emoji from the English phrase for cleaner TTS
        const phrase = call
            ? call.en.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2702}-\u{27B0}]/gu, '').trim()
            : '';
        const text = phrase ? `Number ${num}. ${phrase}` : `Number ${num}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.82;
        utterance.pitch = 1.1;
        utterance.lang = 'en-IN';
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
        document.getElementById('verifyModal').classList.remove('hidden');
    }

    function closeVerifyModal() {
        document.getElementById('verifyModal').classList.add('hidden');
    }

    function decodeVerifyTicket() {
        const code = document.getElementById('ticketCodeInput').value.trim();
        if (!code) return;
        const ticket = TambolaGame.decodeTicket(code);
        if (!ticket) {
            document.getElementById('ticketPreview').innerHTML =
                '<p class="error-text">Invalid ticket code. Please check and try again.</p>';
            verifyTicket = null;
            return;
        }
        verifyTicket = ticket;
        renderVerifyPreview(ticket);
    }

    function renderVerifyPreview(ticket) {
        const drawnSet = new Set(drawn);
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
        document.getElementById('ticketPreview').innerHTML = html;
    }

    function runVerification() {
        if (!verifyTicket) {
            showToast('Load a ticket code first.', 'warn');
            return;
        }
        const claimId = document.getElementById('claimTypeSelect').value;
        const won = TambolaGame.checkWin(verifyTicket, drawn, claimId);
        const claimLabel = TambolaGame.CLAIM_TYPES.find(c => c.id === claimId)?.label ?? claimId;
        const resEl = document.getElementById('verifyResult');

        if (won) {
            resEl.innerHTML = `<div class="verify-win">✅ VALID CLAIM! <span>${claimLabel}</span> is complete.</div>`;
        } else {
            resEl.innerHTML = `<div class="verify-fail">❌ NOT YET. <span>${claimLabel}</span> is not complete with drawn numbers.</div>`;
        }
        renderVerifyPreview(verifyTicket);
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

        /* populate claim type select */
        const sel = document.getElementById('claimTypeSelect');
        TambolaGame.CLAIM_TYPES.forEach(ct => {
            const opt = document.createElement('option');
            opt.value = ct.id;
            opt.textContent = `${ct.icon} ${ct.label}`;
            sel.appendChild(opt);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', HostMode.init);
