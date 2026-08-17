window.BBLab = window.BBLab || {};

BBLab.Store = (() => {
    const storageKey = BBLab.Config.storageKey;

    const defaultState = {
        activeView: "concept",

        quiz: {
            total: 0,
            correct: 0,
            streak: 0,
            bestStreak: 0
        }
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function load() {
        try {
            const raw = localStorage.getItem(storageKey);

            if (!raw) {
                return clone(defaultState);
            }

            const stored = JSON.parse(raw);

            return {
                ...clone(defaultState),
                ...stored,

                quiz: {
                    ...defaultState.quiz,
                    ...(stored.quiz || {})
                }
            };
        } catch (error) {
            return clone(defaultState);
        }
    }

    let state = load();

    function getState() {
        return state;
    }

    function setActiveView(viewName) {
        state.activeView = viewName;
        save();
    }

    function recordQuiz(correct) {
        state.quiz.total += 1;

        if (correct) {
            state.quiz.correct += 1;
            state.quiz.streak += 1;

            state.quiz.bestStreak = Math.max(
                state.quiz.bestStreak,
                state.quiz.streak
            );
        } else {
            state.quiz.streak = 0;
        }

        save();
    }

    function resetQuiz() {
        state.quiz = clone(defaultState.quiz);
        save();
    }

    function save() {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify(state)
            );
        } catch (error) {
            // localStorage를 사용할 수 없는 환경에서는
            // 현재 메모리 상태만 유지합니다.
        }
    }

    return Object.freeze({
        getState,
        setActiveView,
        recordQuiz,
        resetQuiz
    });
})();
