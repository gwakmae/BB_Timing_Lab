window.BBLab = window.BBLab || {};

BBLab.QuizView = (() => {
    const store = BBLab.Store;

    const QUESTIONS = [
        {
            q: "볼린저밴드(20일, 2σ) 안에 주가가 위치할 확률은 대략 얼마인가요?",
            options: ["약 68%", "약 95.44%", "약 50%", "약 99.7%"],
            answer: 1,
            explain: "중심선(20일선) ±2 표준편차 안에 주가가 있을 확률은 약 95.44%입니다. 밖은 약 4.5%뿐입니다."
        },
        {
            q: "볼린저밴드가 수렴(좁아지는)하고 있다는 것은 무엇을 의미하나요?",
            options: [
                "곧 상승한다는 신호",
                "주가가 횡보하며 표준편차가 감소하고 있다는 뜻",
                "거래량이 증가하고 있다는 뜻",
                "추세가 강해지고 있다는 뜻"
            ],
            answer: 1,
            explain: "수렴 = 횡보(기간조정)입니다. 변동폭이 줄어 표준편차가 감소하며 밴드가 좁아집니다."
        },
        {
            q: "밴드의 수렴을 미리 예상할 수 있는 두 가지 조건은 무엇인가요?",
            options: [
                "거래량과 RSI",
                "이평선의 이격도와 매물대의 크기",
                "캔들의 꼬리 길이와 종가",
                "밴드폭의 절대값과 이평선 개수"
            ],
            answer: 1,
            explain: "이격이 크게 벌어지면 회귀(횡보)가 예상되고, 큰 매물대는 돌파 실패 반복으로 횡보를 만듭니다."
        },
        {
            q: "20일선과 60일선의 이격이 크게 벌어진 상태라면 이후 예상되는 것은?",
            options: [
                "즉시 추격 매수 타이밍",
                "밴드의 즉각적 확장",
                "이평선 회귀에 따른 기간조정(횡보·수렴)",
                "밴드 중심선의 소멸"
            ],
            answer: 2,
            explain: "벌어진 이평선은 다시 만나려 합니다(회귀의 법칙). 그 과정이 횡보이며 밴드는 수렴합니다."
        },
        {
            q: "수렴 말미에 밴드의 '상방 확장'을 예고하는 이평선 신호는?",
            options: [
                "10일선의 쌍봉",
                "60일선의 하락 가속",
                "10일선의 쌍바닥(삼바닥)으로 60일선 기울기 상승 전환",
                "20일선이 60일선을 하향 이탈"
            ],
            answer: 2,
            explain: "10일선이 쌍바닥을 그리면 하락하던 60일선을 위로 돌려냅니다. 60일선 상방 기울기 = 상방 확장 예고입니다."
        },
        {
            q: "밴드가 충분히 수렴한 것이 확인된 구간에서 유효한 전략은?",
            options: [
                "밴드 상단 돌파 시 추격 매수",
                "하단 터치 시 무조건 매수",
                "박스 하단 매수 · 박스 상단 매도의 박스권 매매",
                "관망만이 정답"
            ],
            answer: 2,
            explain: "수렴(횡보)이 확인된 구간에서만 하단 매수·상단 매도가 확률적으로 유효합니다. 이탈 시에는 손절."
        },
        {
            q: "상방 확장(상승 추세) 구간에서 매수 타점으로 활용하는 선은?",
            options: [
                "5일선과 8일선",
                "눌림 기준으로 20일선(중심선)과 60일선(추세선)",
                "볼린저 상단선",
                "밴드폭 최대 지점"
            ],
            answer: 1,
            explain: "추세 속 가격조정(눌림)의 기준선은 20일선, 깊으면 60일선입니다. 손절 기준으로도 겸용됩니다."
        },
        {
            q: "하방 확장 중 주가가 밴드 하단에 닿았을 때 올바른 해석은?",
            options: [
                "95.44% 확률이므로 반등 매수",
                "하단선은 지지가 아니라 주가가 타고 내려가는 레일 — 매수 금지",
                "볼린저밴드 오류이므로 무시",
                "즉시 박스권 매매로 전환"
            ],
            answer: 1,
            explain: "확장 중에는 밴드 가장자리 터치가 역추세 신호가 아닙니다. 수렴 확인 전까지 하단 터치 매수는 위험합니다."
        }
    ];

    let order = [];
    let pos = 0;
    let answered = false;
    let picked = -1;

    function shuffle(items) {
        const result = [...items];

        for (let i = result.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }

        return result;
    }

    function getAccuracy(stats) {
        if (stats.total === 0) return 0;
        return Math.round((stats.correct / stats.total) * 100);
    }

    function answerClass(q, index) {
        if (!answered) return "";
        if (index === q.answer) return "correct";
        if (index === picked) return "wrong";
        return "";
    }

    function render(container) {
        if (order.length === 0) {
            order = shuffle(QUESTIONS.map((_, i) => i));
            pos = 0;
            answered = false;
            picked = -1;
        }

        const q = QUESTIONS[order[pos]];
        const stats = store.getState().quiz;

        container.innerHTML = `
            <div class="quiz-layout">
                <section class="panel quiz-card">
                    <p class="quiz-kicker">
                        TIMING CHECK · ${pos + 1} / ${order.length}
                    </p>

                    <h2 class="quiz-question">${q.q}</h2>

                    <div class="answer-grid">
                        ${q.options.map((opt, i) => `
                            <button
                                type="button"
                                class="answer-button ${answerClass(q, i)}"
                                data-answer="${i}"
                                ${answered ? "disabled" : ""}
                            >${opt}</button>
                        `).join("")}
                    </div>

                    ${answered ? `
                        <div class="quiz-feedback">
                            <strong>${picked === q.answer ? "정답입니다." : "오답입니다."}</strong>
                            <br>
                            ${q.explain}
                        </div>

                        <button id="next-question" class="next-button" type="button">
                            ${pos === order.length - 1 ? "처음부터 다시 풀기 ↻" : "다음 문제 →"}
                        </button>
                    ` : `
                        <div class="quiz-feedback">
                            수렴과 확장의 조건을 떠올려 보세요.
                        </div>
                    `}
                </section>

                <aside class="panel stats-panel">
                    <h3>학습 기록</h3>

                    <div class="stat-row">
                        <span>정답률</span>
                        <strong>${getAccuracy(stats)}%</strong>
                    </div>

                    <div class="stat-row">
                        <span>연속 정답</span>
                        <strong>${stats.streak}</strong>
                    </div>

                    <div class="stat-row">
                        <span>최고 기록</span>
                        <strong>${stats.bestStreak}</strong>
                    </div>

                    <button id="reset-quiz" class="reset-button" type="button">
                        기록 초기화
                    </button>
                </aside>
            </div>
        `;

        bindEvents(container);
    }

    function bindEvents(container) {
        container.querySelectorAll("[data-answer]").forEach(button => {
            button.addEventListener("click", () => {
                if (answered) return;

                picked = Number(button.dataset.answer);
                answered = true;

                const correct =
                    picked === QUESTIONS[order[pos]].answer;

                store.recordQuiz(correct);
                render(container);

                BBLab.App.showToast(
                    correct
                        ? "정답입니다!"
                        : "오답 — 해설을 확인하세요"
                );
            });
        });

        const nextButton = container.querySelector("#next-question");

        if (nextButton) {
            nextButton.addEventListener("click", () => {
                if (pos === order.length - 1) {
                    order = [];
                    pos = 0;
                } else {
                    pos += 1;
                }

                answered = false;
                picked = -1;

                render(container);
            });
        }

        container
            .querySelector("#reset-quiz")
            .addEventListener("click", () => {
                const confirmed = confirm(
                    "퀴즈 기록을 초기화할까요?"
                );

                if (!confirmed) return;

                store.resetQuiz();
                render(container);

                BBLab.App.showToast(
                    "퀴즈 기록을 초기화했습니다."
                );
            });
    }

    return Object.freeze({
        render
    });
})();
