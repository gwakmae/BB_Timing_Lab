window.BBLab = window.BBLab || {};

// 언제 수렴하고 언제 확장하는가 — 타이밍 신호 6단계 (일봉 기준)
BBLab.StepsView = (() => {
    let step = 0;

    const ORANGE = "#ffad5a";
    const PURPLE = "#a97cff";
    const BLUE = "#5b8cff";
    const CYAN = "#55d8ff";
    const GREEN = "#41d695";
    const RED = "#ff6b78";
    const WHITE = "#f4f6fb";

    const defs = `
        <defs>
            <marker id="stG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill="${GREEN}"/>
            </marker>
            <marker id="stR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill="${RED}"/>
            </marker>
            <marker id="stC" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L7,3 L0,6 Z" fill="${CYAN}"/>
            </marker>
        </defs>`;

    const STEPS = [
        {
            title: `1단계 · <strong>이격도 과열</strong>이 수렴을 예고한다`,
            body: `주가가 급등하면 단기선(10일선·20일선)이 추세선(60일선)에서 크게 벌어집니다.
                이평선에는 <strong>회귀의 법칙</strong>이 있어서, 벌어진 이격은 다시 좁혀지려 합니다.
                이 좁혀지는 과정이 바로 <strong>기간조정 = 횡보 = 밴드 수렴</strong>입니다.
                즉, 이격이 크게 벌어진 것을 보는 순간 "곧 밴드가 모이겠구나"를 미리 알 수 있습니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="이격도 회귀">
                ${defs}
                <path d="M 40 240 C 150 200, 250 90, 360 55" fill="none" stroke="${ORANGE}" stroke-width="2.6"/>
                <path d="M 40 255 C 180 240, 280 190, 360 150" fill="none" stroke="${PURPLE}" stroke-width="2.6"/>
                <line x1="360" y1="58" x2="360" y2="147" stroke="${RED}" stroke-width="2" stroke-dasharray="5 4"/>
                <text x="372" y="105" fill="${RED}" font-size="12" font-weight="800">이격 과열!</text>
                <path d="M 360 55 C 440 60, 520 110, 590 145" fill="none" stroke="${ORANGE}" stroke-width="2.2" stroke-dasharray="7 5"/>
                <path d="M 360 150 C 440 148, 520 146, 590 145" fill="none" stroke="${PURPLE}" stroke-width="2.2" stroke-dasharray="7 5"/>
                <line x1="500" y1="96" x2="500" y2="146" stroke="${GREEN}" stroke-width="2.2" marker-end="url(#stG)"/>
                <text x="470" y="86" fill="${GREEN}" font-size="12" font-weight="800">회귀 = 횡보(수렴)</text>
                <text x="46" y="230" fill="${ORANGE}" font-size="11" font-weight="800">10·20일선</text>
                <text x="46" y="272" fill="${PURPLE}" font-size="11" font-weight="800">60일선</text>
            </svg>`
        },
        {
            title: `2단계 · <strong>큰 매물대</strong>도 수렴을 만든다`,
            body: `앞에 두꺼운 매물대(저항)가 버티고 있으면 주가는 한 번에 뚫지 못합니다.
                여러 번 두들기며 매물을 소화하는 과정에서 가격이 한 자리에 머물고,
                변동폭이 줄어 표준편차가 감소합니다 — <strong>밴드가 다시 수렴</strong>합니다.
                "앞에 큰 매물대가 있다"는 것만으로 곧 밴드가 모일 자리라고 예상할 수 있습니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="매물대 저항">
                ${defs}
                <rect x="50" y="58" width="540" height="34" rx="6"
                      fill="rgba(255,107,120,0.16)" stroke="${RED}" stroke-width="1.6" stroke-dasharray="4 3"/>
                <text x="60" y="79" fill="${RED}" font-size="13" font-weight="800">큰 매물대 (강한 저항)</text>
                <path d="M 50 220 L 110 150 L 165 205 L 225 140 L 285 200 L 345 138 L 405 196 L 465 142 L 525 195 L 590 165"
                      fill="none" stroke="${WHITE}" stroke-width="2.6"/>
                <line x1="225" y1="140" x2="225" y2="112" stroke="${RED}" stroke-width="2" marker-end="url(#stR)"/>
                <line x1="345" y1="138" x2="345" y2="112" stroke="${RED}" stroke-width="2" marker-end="url(#stR)"/>
                <line x1="465" y1="142" x2="465" y2="112" stroke="${RED}" stroke-width="2" marker-end="url(#stR)"/>
                <text x="300" y="270" fill="${CYAN}" font-size="12" font-weight="800">돌파 실패 반복 → 횡보 → 밴드 수렴</text>
            </svg>`
        },
        {
            title: `3단계 · 수렴이 완성되면 <strong>박스권 매매</strong>`,
            body: `밴드가 충분히 좁아진 것이 확인되면, 그제야 <strong>하단 매수 · 상단 매도</strong>의
                박스권 매매가 유효해집니다. 순서가 중요합니다 — 수렴을 <strong>미리 예상(1·2단계)</strong>하고,
                수렴을 <strong>확인</strong>한 뒤에 진입하는 것입니다.
                박스 이탈(확장 시작)이 확인되면 미련 없이 정리합니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="박스권 매매">
                ${defs}
                <path d="M 40 105 C 200 98, 420 112, 600 102" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 195 C 200 202, 420 188, 600 198" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 150 L 600 150" stroke="${CYAN}" stroke-width="1.6" stroke-dasharray="6 4"/>
                <path d="M 45 160 L 95 118 L 150 182 L 205 115 L 260 185 L 315 118 L 370 183 L 425 116 L 480 184 L 535 120 L 595 170"
                      fill="none" stroke="${WHITE}" stroke-width="2.4"/>
                <circle cx="150" cy="182" r="5" fill="${GREEN}"/>
                <circle cx="260" cy="185" r="5" fill="${GREEN}"/>
                <circle cx="370" cy="183" r="5" fill="${GREEN}"/>
                <circle cx="480" cy="184" r="5" fill="${GREEN}"/>
                <circle cx="205" cy="115" r="5" fill="${RED}"/>
                <circle cx="315" cy="118" r="5" fill="${RED}"/>
                <circle cx="425" cy="116" r="5" fill="${RED}"/>
                <text x="132" y="216" fill="${GREEN}" font-size="12" font-weight="800">매수</text>
                <text x="188" y="95" fill="${RED}" font-size="12" font-weight="800">매도</text>
                <text x="470" y="80" fill="${CYAN}" font-size="11" font-weight="800">밴드 수렴 확인 후 진입</text>
            </svg>`
        },
        {
            title: `4단계 · <strong>10일선 쌍바닥</strong>이 60일선을 위로 돌린다`,
            body: `수렴이 끝나고 어디로 터질지는 이평선 변곡 패턴이 알려줍니다.
                하락하던 단기선(10일선)이 <strong>쌍바닥(또는 삼바닥)</strong>을 만들면,
                그 힘이 추세선(60일선)의 기울기를 <strong>위로 돌려냅니다</strong>.
                60일선이 상방으로 향한다는 것은 곧 밴드의 <strong>상방 확장 예고 신호</strong>입니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="쌍바닥 패턴">
                ${defs}
                <path d="M 40 90 C 180 130, 330 180, 470 195 C 540 200, 585 185, 610 165"
                      fill="none" stroke="${PURPLE}" stroke-width="2.6"/>
                <path d="M 40 110 C 120 160, 180 225, 235 232 C 275 236, 295 195, 330 198
                         C 370 202, 390 235, 430 228 C 480 220, 540 165, 600 120"
                      fill="none" stroke="${ORANGE}" stroke-width="2.6"/>
                <circle cx="235" cy="232" r="5.5" fill="${GREEN}"/>
                <circle cx="430" cy="228" r="5.5" fill="${GREEN}"/>
                <text x="212" y="258" fill="${GREEN}" font-size="12" font-weight="800">1차 바닥</text>
                <text x="407" y="258" fill="${GREEN}" font-size="12" font-weight="800">2차 바닥</text>
                <line x1="585" y1="160" x2="608" y2="118" stroke="${GREEN}" stroke-width="2.4" marker-end="url(#stG)"/>
                <text x="455" y="72" fill="${PURPLE}" font-size="12" font-weight="800">60일선 기울기 상승 전환</text>
                <text x="46" y="100" fill="${ORANGE}" font-size="11" font-weight="800">10일선</text>
                <text x="46" y="80" fill="${PURPLE}" font-size="11" font-weight="800">60일선</text>
            </svg>`
        },
        {
            title: `5단계 · 상방 확장 — <strong>눌림이 매수 타점</strong>`,
            body: `60일선이 상승으로 돌아서며 밴드가 위로 벌어지면 <strong>추세 매매</strong>로 전환합니다.
                무작정 쫓아가지 말고, 추세 속 조정(가격조정)인 <strong>눌림목</strong>을 노립니다.
                눌림의 기준선은 <strong>20일선(중심선)</strong>, 깊으면 <strong>60일선(추세선)</strong>까지입니다.
                이 두 선이 곧 분할 매수의 타점이자 손절 기준입니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="상방 확장과 눌림">
                ${defs}
                <path d="M 40 120 C 150 118, 260 95, 380 55 C 470 28, 550 20, 610 18" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 185 C 150 190, 260 185, 380 165 C 470 148, 550 138, 610 132" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 152 C 150 152, 260 140, 380 110 C 470 88, 550 79, 610 75" fill="none" stroke="${CYAN}" stroke-width="1.7" stroke-dasharray="6 4"/>
                <path d="M 42 158 L 110 140 L 175 128 L 240 118 L 300 128 L 330 142 L 360 138
                         L 395 105 L 440 82 L 490 66 L 545 45 L 600 30"
                      fill="none" stroke="${WHITE}" stroke-width="2.4"/>
                <circle cx="345" cy="140" r="6" fill="${GREEN}" stroke="${WHITE}" stroke-width="1.5"/>
                <line x1="345" y1="152" x2="345" y2="176" stroke="${GREEN}" stroke-width="2.2" marker-end="url(#stG)"/>
                <text x="270" y="200" fill="${GREEN}" font-size="12" font-weight="800">눌림 매수 (20일선)</text>
                <text x="430" y="250" fill="${CYAN}" font-size="11" font-weight="800">밴드 상방 확장 = 추세 진행</text>
                <text x="46" y="112" fill="${BLUE}" font-size="11" font-weight="800">상단</text>
                <text x="46" y="205" fill="${BLUE}" font-size="11" font-weight="800">하단</text>
            </svg>`
        },
        {
            title: `6단계 · 반대 신호 — <strong>쌍봉과 하방 확장</strong>`,
            body: `모든 규칙은 거울처럼 반대로도 작동합니다. 상승하던 10일선이 <strong>쌍봉</strong>을 그리면
                60일선의 기울기를 <strong>아래로</strong> 꺾고, 밴드는 <strong>하방 확장</strong>을 시작합니다.
                이때 "밴드 하단에 닿았으니 매수"는 가장 위험한 행동입니다.
                하방 확장 중 하단선은 지지가 아니라 <strong>주가가 타고 내려가는 레일</strong>입니다.`,
            svg: `
            <svg class="diagram-svg" viewBox="0 0 640 300" role="img" aria-label="쌍봉과 하방 확장">
                ${defs}
                <path d="M 40 60 C 150 65, 260 88, 360 130 C 450 165, 540 200, 610 232" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 128 C 150 128, 260 150, 360 205 C 450 248, 540 272, 610 285" fill="none" stroke="${BLUE}" stroke-width="2.4"/>
                <path d="M 40 95 C 150 96, 260 118, 360 168 C 450 207, 540 236, 610 258" fill="none" stroke="${CYAN}" stroke-width="1.7" stroke-dasharray="6 4"/>
                <path d="M 40 60 C 110 55, 160 62, 200 88 C 230 108, 245 128, 270 118
                         C 300 106, 320 70, 355 74 C 390 78, 405 112, 435 122
                         C 480 138, 545 190, 605 240"
                      fill="none" stroke="${ORANGE}" stroke-width="2.6"/>
                <circle cx="270" cy="116" r="5.5" fill="${RED}"/>
                <circle cx="435" cy="122" r="5.5" fill="${RED}"/>
                <text x="248" y="100" fill="${RED}" font-size="12" font-weight="800">1차 봉</text>
                <text x="413" y="106" fill="${RED}" font-size="12" font-weight="800">2차 봉</text>
                <line x1="560" y1="215" x2="590" y2="252" stroke="${RED}" stroke-width="2.4" marker-end="url(#stR)"/>
                <text x="370" y="290" fill="${RED}" font-size="12" font-weight="800">10일선 쌍봉 → 60일선 하락 전환 → 하방 확장</text>
                <text x="46" y="52" fill="${ORANGE}" font-size="11" font-weight="800">10일선</text>
            </svg>`
        }
    ];

    function render(container) {
        const s = STEPS[step];

        container.innerHTML = `
            <div class="step-layout">
                <section class="panel step-panel">
                    <p class="step-kicker">TIMING SIGNAL ${step + 1} / ${STEPS.length}</p>

                    <h2>${s.title}</h2>

                    <div class="diagram-scroll">${s.svg}</div>

                    <p style="margin-top:16px;">${s.body}</p>

                    <div class="step-nav">
                        <button
                            id="step-prev"
                            class="nav-button ghost"
                            type="button"
                            ${step === 0 ? "disabled" : ""}
                        >← 이전</button>

                        <div class="step-dots">
                            ${STEPS.map((_, i) => `
                                <button
                                    class="step-dot ${i === step ? "active" : ""}"
                                    data-step="${i}"
                                    type="button"
                                    aria-label="${i + 1}단계"
                                ></button>
                            `).join("")}
                        </div>

                        <button id="step-next" class="nav-button" type="button">
                            ${step === STEPS.length - 1 ? "처음으로 ↻" : "다음 →"}
                        </button>
                    </div>
                </section>

                <aside class="panel step-side">
                    <h3>전체 흐름</h3>

                    <ol>
                        <li class="${step === 0 ? "current" : ""}">이격도 과열 → 수렴 예고</li>
                        <li class="${step === 1 ? "current" : ""}">매물대 저항 → 수렴 가속</li>
                        <li class="${step === 2 ? "current" : ""}">수렴 확인 → 박스권 매매</li>
                        <li class="${step === 3 ? "current" : ""}">10일선 쌍바닥 → 60일선 상승 전환</li>
                        <li class="${step === 4 ? "current" : ""}">상방 확장 → 눌림 매수</li>
                        <li class="${step === 5 ? "current" : ""}">10일선 쌍봉 → 하방 확장 경고</li>
                    </ol>
                </aside>
            </div>

            <div class="helper-card">
                <span class="helper-icon">★</span>
                <span><strong>한 줄 요약</strong> — 수렴은 <strong>이격도와 매물대</strong>가 예고하고,
                확장의 방향은 <strong>10일선의 쌍바닥/쌍봉이 돌리는 60일선 기울기</strong>가 알려줍니다.
                이 두 가지를 알면 밴드가 벌어진 뒤가 아니라 <strong>벌어지기 직전에</strong> 준비할 수 있습니다.</span>
            </div>
        `;

        document.getElementById("step-prev").addEventListener("click", () => {
            if (step > 0) {
                step -= 1;
                render(container);
            }
        });

        document.getElementById("step-next").addEventListener("click", () => {
            step = (step + 1) % STEPS.length;
            render(container);
        });

        container.querySelectorAll("[data-step]").forEach(btn => {
            btn.addEventListener("click", () => {
                step = Number(btn.dataset.step);
                render(container);
            });
        });
    }

    return Object.freeze({
        render
    });
})();
