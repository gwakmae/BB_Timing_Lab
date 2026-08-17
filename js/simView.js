window.BBLab = window.BBLab || {};

// 수렴/확장 체험 시뮬레이터 (일봉 기준)
BBLab.SimView = (() => {
    const D = BBLab.Data;

    const W = 1240;
    const H = 430;
    const PAD = { l: 14, r: 76, t: 24, b: 18 };
    const BW_H = 96; // 밴드폭 미니차트 높이

    const state = {
        progress: 60,
        showMA: true,
        showZones: true,
        showSupply: true,
        playing: false,
        timer: null
    };

    const JUMP_ZONES = [
        { label: "① 과열 → 수렴 진입", at: 58 },
        { label: "② 쌍바닥 → 상방 확장", at: 104 },
        { label: "③ 매물대 박스권", at: 150 },
        { label: "④ 쌍봉 → 하방 확장", at: 190 }
    ];

    function x(i) {
        return (
            PAD.l +
            (i / (D.N - 1)) * (W - PAD.l - PAD.r)
        );
    }

    function y(p) {
        return (
            PAD.t +
            (1 - (p - D.priceMin) / (D.priceMax - D.priceMin)) *
            (H - PAD.t - PAD.b)
        );
    }

    function linePath(arr, upto) {
        let d = "";
        let started = false;

        for (let i = 0; i < upto; i += 1) {
            if (arr[i] === null) continue;

            d +=
                (started ? " L " : "M ") +
                x(i).toFixed(1) + " " +
                y(arr[i]).toFixed(1);

            started = true;
        }

        return d;
    }

    function bandAreaPath(upto) {
        let top = "";
        let bot = "";
        let started = false;

        for (let i = 0; i < upto; i += 1) {
            if (D.upper[i] === null) continue;

            top +=
                (started ? " L " : "") +
                x(i).toFixed(1) + " " +
                y(D.upper[i]).toFixed(1);

            started = true;
        }

        if (!started) return "";

        for (let i = upto - 1; i >= 0; i -= 1) {
            if (D.lower[i] === null) continue;

            bot +=
                " L " +
                x(i).toFixed(1) + " " +
                y(D.lower[i]).toFixed(1);
        }

        return "M " + top + bot + " Z";
    }

    function squeezeZonesSvg(upto) {
        if (!state.showZones) return "";

        let out = "";
        let runStart = null;

        for (let i = 0; i < upto; i += 1) {
            const sq = D.isSqueeze(i);

            if (sq && runStart === null) {
                runStart = i;
            }

            if ((!sq || i === upto - 1) && runStart !== null) {
                const end = sq && i === upto - 1 ? i : i - 1;

                if (end - runStart >= 3) {
                    out += `
                        <rect
                            x="${x(runStart).toFixed(1)}"
                            y="${PAD.t}"
                            width="${(x(end) - x(runStart)).toFixed(1)}"
                            height="${H - PAD.t - PAD.b}"
                            fill="rgba(85,216,255,0.055)"
                            stroke="rgba(85,216,255,0.18)"
                            stroke-dasharray="4 4"
                        ></rect>`;
                }

                runStart = null;
            }
        }

        return out;
    }

    function candlesSvg(upto) {
        const cw = Math.max(
            2.2,
            ((W - PAD.l - PAD.r) / D.N) * 0.62
        );

        let out = "";

        for (let i = 0; i < upto; i += 1) {
            const c = D.candles[i];
            const up = c.c >= c.o;
            const col = up ? "#41d695" : "#ff6b78";
            const cx = x(i);

            const bodyTop = y(Math.max(c.o, c.c));
            const bodyH = Math.max(
                1.2,
                Math.abs(y(c.o) - y(c.c))
            );

            out += `
                <line
                    x1="${cx}" y1="${y(c.h)}"
                    x2="${cx}" y2="${y(c.l)}"
                    stroke="${col}" stroke-width="1"
                ></line>
                <rect
                    x="${(cx - cw / 2).toFixed(1)}"
                    y="${bodyTop.toFixed(1)}"
                    width="${cw.toFixed(1)}"
                    height="${bodyH.toFixed(1)}"
                    fill="${col}" rx="0.5"
                ></rect>`;
        }

        return out;
    }

    function supplySvg(upto) {
        if (!state.showSupply) return "";

        const start = Math.max(0, D.boxStart - 8);
        const end = Math.min(upto - 1, D.boxEnd + 6);

        if (upto <= start) return "";

        return `
            <rect
                x="${x(start)}"
                y="${y(D.supplyLevel) - 7}"
                width="${(x(end) - x(start)).toFixed(1)}"
                height="13"
                fill="rgba(255,107,120,0.16)"
                stroke="rgba(255,107,120,0.55)"
                stroke-dasharray="3 3"
            ></rect>
            <text
                x="${x(start) + 6}"
                y="${y(D.supplyLevel) - 13}"
                fill="#ff6b78"
                font-size="11"
                font-weight="800"
            >큰 매물대 (강한 저항)</text>`;
    }

    function cursorSvg(idx) {
        if (idx < 0) return "";

        const cx = x(idx);
        const price = D.candles[idx].c;

        let dots = `
            <circle
                cx="${cx}" cy="${y(price)}"
                r="4.5" fill="#f4f6fb"
                stroke="#090b10" stroke-width="1.5"
            ></circle>`;

        if (state.showMA && D.ma60[idx] !== null) {
            dots += `
                <circle cx="${cx}" cy="${y(D.ma10[idx])}" r="3.4" fill="#ffad5a"></circle>
                <circle cx="${cx}" cy="${y(D.ma60[idx])}" r="3.4" fill="#a97cff"></circle>`;
        }

        return `
            <line
                x1="${cx}" y1="${PAD.t}"
                x2="${cx}" y2="${H - PAD.b}"
                stroke="rgba(244,246,251,0.35)"
                stroke-dasharray="4 4"
            ></line>
            <rect
                x="${cx + 5}" y="${y(price) - 11}"
                width="64" height="21" rx="6"
                fill="rgba(22,26,35,0.95)"
                stroke="rgba(255,255,255,0.16)"
            ></rect>
            <text
                x="${cx + 12}" y="${y(price) + 4}"
                fill="#f4f6fb" font-size="11" font-weight="800"
            >${price.toFixed(1)}</text>
            ${dots}`;
    }

    // 밴드폭 미니차트
    function bandwidthSvg(upto) {
        const valid = D.bandwidth.filter(v => v !== null);
        const maxBw = Math.max(...valid);

        function bwY(v) {
            return BW_H - 16 - (v / maxBw) * (BW_H - 34);
        }

        let line = "";
        let fill = "";
        let started = false;

        for (let i = 0; i < upto; i += 1) {
            if (D.bandwidth[i] === null) continue;

            const px = x(i).toFixed(1);
            const py = bwY(D.bandwidth[i]).toFixed(1);

            line += (started ? " L " : "M ") + px + " " + py;

            fill += started
                ? " L " + px + " " + py
                : "M " + px + " " + (BW_H - 16) +
                " L " + px + " " + py;

            started = true;
        }

        let paths = "";

        if (started) {
            fill +=
                " L " + x(upto - 1).toFixed(1) +
                " " + (BW_H - 16) + " Z";

            const idx = upto - 1;

            const cursor = D.bandwidth[idx] !== null
                ? `
                    <line
                        x1="${x(idx)}" y1="6"
                        x2="${x(idx)}" y2="${BW_H - 16}"
                        stroke="rgba(244,246,251,0.35)"
                        stroke-dasharray="4 4"
                    ></line>
                    <circle
                        cx="${x(idx)}"
                        cy="${bwY(D.bandwidth[idx])}"
                        r="4" fill="#55d8ff"
                    ></circle>`
                : "";

            paths = `
                <path d="${fill}" fill="rgba(85,216,255,0.12)"></path>
                <path d="${line}" fill="none" stroke="#55d8ff" stroke-width="2"></path>
                ${cursor}`;
        }

        return `
        <svg
            class="bb-svg"
            viewBox="0 0 ${W} ${BW_H}"
            style="border-top:1px solid var(--border)"
            role="img"
            aria-label="밴드폭 지표"
        >
            <line
                x1="${PAD.l}" y1="${bwY(D.bwQ35)}"
                x2="${W - PAD.r}" y2="${bwY(D.bwQ35)}"
                stroke="rgba(85,216,255,0.5)"
                stroke-dasharray="5 5"
            ></line>
            <line
                x1="${PAD.l}" y1="${bwY(D.bwQ70)}"
                x2="${W - PAD.r}" y2="${bwY(D.bwQ70)}"
                stroke="rgba(65,214,149,0.5)"
                stroke-dasharray="5 5"
            ></line>
            <text x="${W - PAD.r + 8}" y="${bwY(D.bwQ35) + 4}"
                  fill="#55d8ff" font-size="10" font-weight="700">수렴선</text>
            <text x="${W - PAD.r + 8}" y="${bwY(D.bwQ70) + 4}"
                  fill="#41d695" font-size="10" font-weight="700">확장선</text>

            ${paths}

            <text x="${PAD.l + 4}" y="16" fill="#70798a" font-size="10" font-weight="700">
                밴드폭 % = (상단−하단) / 중심선(20일선)
            </text>
        </svg>`;
    }

    function chartSvg(upto) {
        const idx = upto - 1;

        return `
        <svg
            class="bb-svg"
            viewBox="0 0 ${W} ${H}"
            role="img"
            aria-label="볼린저밴드 시뮬레이션 차트"
        >
            <defs>
                <linearGradient id="bbfill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#5b8cff" stop-opacity="0.13"/>
                    <stop offset="1" stop-color="#5b8cff" stop-opacity="0.03"/>
                </linearGradient>
            </defs>

            ${[0.25, 0.5, 0.75].map(r => {
            const gy = PAD.t + r * (H - PAD.t - PAD.b);
            const gp = D.priceMax - r * (D.priceMax - D.priceMin);

            return `
                    <line
                        x1="${PAD.l}" y1="${gy}"
                        x2="${W - PAD.r}" y2="${gy}"
                        stroke="rgba(255,255,255,0.045)"
                    ></line>
                    <text
                        x="${W - PAD.r + 8}" y="${gy + 4}"
                        fill="#70798a" font-size="10"
                    >${gp.toFixed(0)}</text>`;
        }).join("")}

            ${squeezeZonesSvg(upto)}
            ${supplySvg(upto)}

            <path d="${bandAreaPath(upto)}" fill="url(#bbfill)"></path>
            <path d="${linePath(D.upper, upto)}" fill="none" stroke="#5b8cff" stroke-width="1.8"></path>
            <path d="${linePath(D.lower, upto)}" fill="none" stroke="#5b8cff" stroke-width="1.8"></path>
            <path d="${linePath(D.ma20, upto)}" fill="none" stroke="#55d8ff" stroke-width="1.5" stroke-dasharray="6 4"></path>

            ${state.showMA ? `
                <path d="${linePath(D.ma60, upto)}" fill="none" stroke="#a97cff" stroke-width="2.2"></path>
                <path d="${linePath(D.ma10, upto)}" fill="none" stroke="#ffad5a" stroke-width="1.8"></path>
            ` : ""}

            ${candlesSvg(upto)}
            ${cursorSvg(idx)}

            <rect
                id="bb-click-layer"
                x="${PAD.l}" y="${PAD.t}"
                width="${W - PAD.l - PAD.r}"
                height="${H - PAD.t - PAD.b}"
                fill="transparent"
                style="cursor:crosshair"
            ></rect>
        </svg>`;
    }

    /* ---- 우측 진단 패널 ---- */

    function diagnose(idx) {
        const bw = D.bandwidth[idx];
        const squeeze = D.isSqueeze(idx);
        const expand = D.isExpansion(idx);

        const slope60 = D.slopeOf(D.ma60, idx, 6);
        const slope10 = D.slopeOf(D.ma10, idx, 3);

        const gapNow = D.gap[idx];
        const gapPrev = idx > 6 ? D.gap[idx - 6] : null;

        const gapShrinking =
            gapNow !== null &&
            gapPrev !== null &&
            Math.abs(gapNow) < Math.abs(gapPrev);

        let stateCls = "neutral";
        let title = "전환 관찰 구간";
        let tip = "방향 신호를 기다리는 자리입니다.";

        if (squeeze) {
            stateCls = "squeeze";
            title = "수렴 구간 · 박스권 매매 모드";
            tip = "밴드 하단 접근 시 매수, 상단 접근 시 매도. 단, 박스 이탈 시 즉시 손절.";
        } else if (expand && slope60 !== null && slope60 > 0) {
            stateCls = "expand-up";
            title = "상방 확장 · 추세 추종(상승)";
            tip = "밴드 상단 이탈은 매도가 아니라 추세 신호. 눌림(20일선·60일선)에서 분할 매수.";
        } else if (expand && slope60 !== null && slope60 < 0) {
            stateCls = "expand-down";
            title = "하방 확장 · 추세 추종(하락)";
            tip = "밴드 하단 터치 매수 금지. 하단선을 타고 미끄러지는 구간입니다.";
        }

        const signals = [
            {
                label: "밴드 수렴 (밴드폭 하위 35%)",
                lit: squeeze
            },
            {
                label: "밴드 확장 (밴드폭 상위 30% + 증가)",
                lit: expand
            },
            {
                label: "이격도 축소 중 (20일선↔60일선 회귀)",
                lit: gapShrinking && gapNow !== null
            },
            {
                label: "60일선 기울기 상승 (추세선 상방)",
                lit: slope60 !== null && slope60 > 0
            },
            {
                label: "60일선 기울기 하락 (추세선 하방)",
                lit: slope60 !== null && slope60 < 0,
                warn: true
            },
            {
                label: "10일선 상승 반전 (쌍바닥 감지)",
                lit:
                    slope10 !== null &&
                    slope10 > 0 &&
                    slope60 !== null &&
                    slope60 <= 0.05
            }
        ];

        return {
            bw,
            gapNow,
            stateCls,
            title,
            tip,
            signals,
            tag: D.candles[idx].tag
        };
    }

    function renderDiag(idx) {
        const el = document.getElementById("diag-body");

        if (!el) return;

        const d = diagnose(idx);

        el.innerHTML = `
            <div class="diag-state ${d.stateCls}">
                ${d.title}
                <small>${d.tip}</small>
            </div>

            <div class="signal-list">
                ${d.signals.map(s => `
                    <div class="signal-item ${s.lit ? "lit" : ""} ${s.warn ? "warn" : ""}">
                        <span class="lamp"></span>
                        <span>${s.label}</span>
                    </div>
                `).join("")}
            </div>

            <div class="diag-metric">
                <span>현재 캔들</span>
                <strong>#${idx + 1} · ${d.tag}</strong>
            </div>

            <div class="diag-metric">
                <span>밴드폭</span>
                <strong>${d.bw === null ? "—" : d.bw.toFixed(2) + "%"}</strong>
            </div>

            <div class="diag-metric">
                <span>이격도 (20일선−60일선)</span>
                <strong>${d.gapNow === null
                ? "—"
                : (d.gapNow >= 0 ? "+" : "") +
                d.gapNow.toFixed(2) + "%"
            }</strong>
            </div>
        `;
    }

    function drawAll(container) {
        const upto = Math.max(2, Math.min(state.progress, D.N));

        const chartHost = document.getElementById("bb-chart-host");
        const bwHost = document.getElementById("bb-bw-host");

        if (!chartHost || !bwHost) return;

        chartHost.innerHTML = chartSvg(upto);
        bwHost.innerHTML = bandwidthSvg(upto);

        renderDiag(upto - 1);

        const layer = document.getElementById("bb-click-layer");

        if (layer) {
            layer.addEventListener("click", ev => {
                const rect = layer.getBoundingClientRect();

                const svgX =
                    ((ev.clientX - rect.left) / rect.width) * W;

                const ratio =
                    (svgX - PAD.l) / (W - PAD.l - PAD.r);

                state.progress = Math.max(
                    2,
                    Math.min(
                        D.N,
                        Math.round(ratio * (D.N - 1)) + 1
                    )
                );

                drawAll(container);
            });
        }
    }

    function stopPlay() {
        state.playing = false;

        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }

        const btn = document.getElementById("bb-play");

        if (btn) {
            btn.textContent = "▶ 재생";
        }
    }

    function render(container) {
        container.innerHTML = `
            <div class="sim-toolbar">
                <div class="play-controls">
                    <button id="bb-play" class="play-button" type="button">▶ 재생</button>

                    ${JUMP_ZONES.map(z => `
                        <button class="zone-button" type="button" data-jump="${z.at}">
                            ${z.label}
                        </button>
                    `).join("")}
                </div>

                <div class="chip-row">
                    <button
                        class="toggle-chip ${state.showMA ? "on" : ""}"
                        data-toggle="showMA"
                        type="button"
                    >
                        <span class="dot" style="color:var(--orange)"></span>
                        이평선 10일·60일
                    </button>

                    <button
                        class="toggle-chip ${state.showZones ? "on" : ""}"
                        data-toggle="showZones"
                        type="button"
                    >
                        <span class="dot" style="color:var(--cyan)"></span>
                        수렴 구간 음영
                    </button>

                    <button
                        class="toggle-chip ${state.showSupply ? "on" : ""}"
                        data-toggle="showSupply"
                        type="button"
                    >
                        <span class="dot" style="color:var(--red)"></span>
                        매물대
                    </button>
                </div>
            </div>

            <div class="sim-layout">
                <section class="panel chart-panel">
                    <div class="chart-head">
                        <strong>합성 일봉 차트 · 추세 → 수렴 → 확장의 전 과정</strong>
                        <span>차트를 클릭하면 해당 시점으로 이동</span>
                    </div>

                    <div class="bb-scroll">
                        <div id="bb-chart-host"></div>
                        <div id="bb-bw-host"></div>
                    </div>

                    <div class="chart-legend">
                        <span><i class="legend-line" style="background:#5b8cff"></i>볼린저 상·하단 (20일, 2σ)</span>
                        <span><i class="legend-line" style="background:#55d8ff"></i>중심선 = 20일선</span>
                        <span><i class="legend-line" style="background:#ffad5a"></i>단기선 = 10일선</span>
                        <span><i class="legend-line" style="background:#a97cff"></i>추세선 = 60일선</span>
                        <span><i class="legend-line" style="background:rgba(85,216,255,0.4)"></i>수렴 구간</span>
                    </div>
                </section>

                <aside class="panel diag-panel">
                    <p class="panel-label">LIVE DIAGNOSIS</p>
                    <div id="diag-body"></div>
                </aside>
            </div>

            <div class="helper-card">
                <span class="helper-icon">i</span>
                <span><strong>관찰 포인트</strong> — ① 주가가 급등해 이격도(20일선↔60일선)가 크게 벌어지면
                곧 횡보하며 밴드가 <strong>수렴</strong>합니다. ② 수렴 말미에 <strong>10일선이 쌍바닥</strong>을 그리며
                <strong>60일선 기울기를 위로</strong> 돌리면 밴드의 <strong>상방 확장</strong>이 시작됩니다.
                ③ 큰 매물대 아래에서는 돌파를 반복 실패하며 다시 <strong>수렴(박스권)</strong>이 나옵니다.</span>
            </div>
        `;

        drawAll(container);

        document.getElementById("bb-play").addEventListener("click", () => {
            if (state.playing) {
                stopPlay();
                return;
            }

            if (state.progress >= D.N) {
                state.progress = 2;
            }

            state.playing = true;
            document.getElementById("bb-play").textContent = "⏸ 일시정지";

            state.timer = setInterval(() => {
                state.progress += 1;

                if (state.progress >= D.N) {
                    stopPlay();
                }

                drawAll(container);
            }, 85);
        });

        container.querySelectorAll("[data-jump]").forEach(btn => {
            btn.addEventListener("click", () => {
                stopPlay();
                state.progress = Number(btn.dataset.jump);
                drawAll(container);
            });
        });

        container.querySelectorAll("[data-toggle]").forEach(btn => {
            btn.addEventListener("click", () => {
                const key = btn.dataset.toggle;

                state[key] = !state[key];

                btn.classList.toggle("on", state[key]);

                drawAll(container);
            });
        });
    }

    return Object.freeze({
        render,
        destroy: stopPlay
    });
})();
