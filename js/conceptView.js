window.BBLab = window.BBLab || {};

BBLab.ConceptView = (() => {

    // 볼린저밴드 해부도 SVG
    function anatomySvg() {
        return `
<svg class="diagram-svg" viewBox="0 0 760 340" role="img" aria-label="볼린저밴드 구조도">
    <defs>
        <linearGradient id="bandfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#5b8cff" stop-opacity="0.22"/>
            <stop offset="1" stop-color="#5b8cff" stop-opacity="0.05"/>
        </linearGradient>
    </defs>

    <path d="M 40 110 C 180 60, 320 150, 470 100 C 580 66, 660 96, 720 80
             L 720 260 C 660 276, 580 246, 470 280 C 320 330, 180 240, 40 290 Z"
          fill="url(#bandfill)"/>

    <path d="M 40 110 C 180 60, 320 150, 470 100 C 580 66, 660 96, 720 80"
          fill="none" stroke="#5b8cff" stroke-width="2.5"/>

    <path d="M 40 290 C 180 240, 320 330, 470 280 C 580 246, 660 276, 720 260"
          fill="none" stroke="#5b8cff" stroke-width="2.5"/>

    <path d="M 40 200 C 180 150, 320 240, 470 190 C 580 156, 660 186, 720 170"
          fill="none" stroke="#55d8ff" stroke-width="2" stroke-dasharray="7 5"/>

    <path d="M 40 215 C 120 190, 170 150, 230 178 C 290 205, 340 245, 400 205
             C 460 165, 520 130, 580 165 C 640 200, 690 175, 720 178"
          fill="none" stroke="#f4f6fb" stroke-width="2.5"/>

    <line x1="560" y1="138" x2="560" y2="171" stroke="#ffad5a" stroke-width="1.6"/>
    <line x1="560" y1="171" x2="560" y2="238" stroke="#ffad5a" stroke-width="1.6"/>
    <text x="572" y="158" fill="#ffad5a" font-size="11" font-weight="700">+2σ</text>
    <text x="572" y="212" fill="#ffad5a" font-size="11" font-weight="700">−2σ</text>

    <text x="60" y="88" fill="#7aa2ff" font-size="12" font-weight="800">상단밴드 = 중심선 + 2σ</text>
    <text x="60" y="322" fill="#7aa2ff" font-size="12" font-weight="800">하단밴드 = 중심선 − 2σ</text>
    <text x="60" y="196" fill="#55d8ff" font-size="12" font-weight="800">중심선 = 20일선 (최근 20일 평균)</text>
    <text x="60" y="228" fill="#f4f6fb" font-size="11" font-weight="700">주가</text>

    <rect x="470" y="24" width="250" height="46" rx="10"
          fill="rgba(85,216,255,0.07)" stroke="rgba(85,216,255,0.3)"/>
    <text x="484" y="43" fill="#55d8ff" font-size="12" font-weight="800">밴드 내부에 주가가 위치할 확률</text>
    <text x="484" y="61" fill="#f4f6fb" font-size="13" font-weight="800">약 95.44% (밖은 약 4.5%)</text>
</svg>`;
    }

    // 수렴↔확장 사이클 SVG
    function cycleSvg() {
        return `
<svg class="diagram-svg" viewBox="0 0 760 300" role="img" aria-label="수렴과 확장의 사이클">
    <defs>
        <marker id="arrG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="#41d695"/>
        </marker>
        <marker id="arrC" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="#55d8ff"/>
        </marker>
    </defs>

    <rect x="30" y="70" width="240" height="160" rx="14"
          fill="rgba(85,216,255,0.05)" stroke="rgba(85,216,255,0.35)" stroke-dasharray="5 4"/>
    <path d="M 50 120 L 250 116" stroke="#5b8cff" stroke-width="2.5"/>
    <path d="M 50 180 L 250 184" stroke="#5b8cff" stroke-width="2.5"/>
    <path d="M 50 150 L 250 150" stroke="#55d8ff" stroke-width="1.6" stroke-dasharray="6 4"/>
    <path d="M 55 155 L 90 132 L 125 168 L 160 128 L 195 172 L 230 138 L 250 152"
          fill="none" stroke="#f4f6fb" stroke-width="2.2"/>
    <text x="150" y="52" text-anchor="middle" fill="#55d8ff" font-size="14" font-weight="800">수렴 (Squeeze)</text>
    <text x="150" y="255" text-anchor="middle" fill="#a8afbd" font-size="11">횡보 · 표준편차 감소 · 박스권 매매 구간</text>

    <line x1="282" y1="150" x2="330" y2="150" stroke="#41d695" stroke-width="2.4" marker-end="url(#arrG)"/>
    <text x="306" y="136" text-anchor="middle" fill="#41d695" font-size="10" font-weight="800">변동성 폭발</text>

    <rect x="342" y="70" width="240" height="160" rx="14"
          fill="rgba(65,214,149,0.05)" stroke="rgba(65,214,149,0.35)" stroke-dasharray="5 4"/>
    <path d="M 360 130 C 420 118, 500 70, 565 48" fill="none" stroke="#5b8cff" stroke-width="2.5"/>
    <path d="M 360 172 C 420 180, 500 220, 565 245" fill="none" stroke="#5b8cff" stroke-width="2.5"/>
    <path d="M 360 150 C 420 148, 500 145, 565 146" fill="none" stroke="#55d8ff" stroke-width="1.6" stroke-dasharray="6 4"/>
    <path d="M 362 155 L 400 140 L 435 128 L 470 108 L 505 92 L 540 68 L 562 56"
          fill="none" stroke="#f4f6fb" stroke-width="2.2"/>
    <text x="462" y="52" text-anchor="middle" fill="#41d695" font-size="14" font-weight="800">확장 (Expansion)</text>
    <text x="462" y="278" text-anchor="middle" fill="#a8afbd" font-size="11">추세 발생 · 표준편차 증가 · 추세 매매 구간</text>

    <path d="M 590 210 C 640 240, 640 90, 596 110" fill="none" stroke="#55d8ff"
          stroke-width="2" stroke-dasharray="6 5" marker-end="url(#arrC)"/>
    <text x="676" y="150" fill="#55d8ff" font-size="10" font-weight="800">과열 후</text>
    <text x="676" y="164" fill="#55d8ff" font-size="10" font-weight="800">다시 수렴</text>
</svg>`;
    }

    function render(container) {
        container.innerHTML = `
            <div class="concept-grid">
                <article class="panel concept-card">
                    <h3><span class="num">01</span>확장 구간 = 추세 매매</h3>
                    <p>밴드가 벌어지기 시작하면 한쪽 방향으로 <strong>추세가 터지는 구간</strong>입니다.
                    이때는 밴드 상단 이탈이 매도 신호가 아니라 <strong>추세 추종</strong>의 근거가 됩니다.</p>
                </article>

                <article class="panel concept-card">
                    <h3><span class="num">02</span>수렴 구간 = 박스권 매매</h3>
                    <p>밴드가 좁게 모이면 <strong>횡보(기간조정)</strong> 구간입니다.
                    이때만 <strong>하단 매수 · 상단 매도</strong>의 박스권 매매가 확률적으로 유효합니다.</p>
                </article>

                <article class="panel concept-card">
                    <h3><span class="num">03</span>이평선과 함께 본다</h3>
                    <p><strong>10일선(단기) · 20일선(중심) · 60일선(추세)</strong>을 겹쳐 보면
                    수렴과 확장의 <strong>타이밍을 미리</strong> 읽을 수 있습니다.</p>
                </article>

                <article class="panel concept-card">
                    <h3><span class="num">★</span>가장 중요한 것</h3>
                    <p>밴드가 <strong>언제 수렴하고 언제 확장하는지</strong>를 모르면
                    "하단 매수·상단 매도"는 손실 제조기가 됩니다.
                    이 앱의 핵심은 그 <strong>타이밍</strong>입니다.</p>
                </article>
            </div>

            <section class="panel diagram-panel">
                <p class="panel-label">ANATOMY</p>

                <h2>볼린저밴드의 구조</h2>

                <p>중심선(20일선)에서 위아래로 표준편차(σ)의 2배만큼 떨어진 선이 상단·하단밴드입니다.
                주가의 변동폭이 줄면 σ가 작아져 밴드가 <strong>수렴</strong>하고,
                커지면 σ가 커져 <strong>확장</strong>합니다.</p>

                <div class="diagram-scroll">${anatomySvg()}</div>
            </section>

            <section class="panel diagram-panel" style="margin-top:18px;">
                <p class="panel-label">THE CYCLE</p>

                <h2>수렴 ↔ 확장은 반복된다</h2>

                <p>문제는 "수렴한다/확장한다"가 아니라 <strong>그 전환이 언제 일어나는가</strong>입니다.
                그 답은 이평선에 있습니다 — <strong>이격도</strong>가 수렴을 예고하고,
                <strong>10일선의 쌍바닥/쌍봉이 60일선의 기울기</strong>를 돌려 확장 방향을 알려줍니다.
                다음 메뉴의 시뮬레이터에서 직접 확인해 보세요.</p>

                <div class="diagram-scroll">${cycleSvg()}</div>
            </section>

            <div class="helper-card">
                <span class="helper-icon">!</span>
                <span>왜 "하단 터치 = 매수"가 위험한가요? 하단에 닿은 직후 밴드가 <strong>하방 확장</strong>하면
                주가는 하단선을 따라 계속 미끄러집니다. 반대로 상단 돌파 직후 밴드가 <strong>상방 확장</strong>하면
                추격매수가 오히려 정답이 됩니다. 같은 신호라도 <strong>밴드가 수렴 중인지 확장 중인지</strong>가
                결과를 가릅니다.</span>
            </div>
        `;
    }

    return Object.freeze({
        render
    });
})();
