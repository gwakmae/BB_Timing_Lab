window.BBLab = window.BBLab || {};

BBLab.App = (() => {
    const store = BBLab.Store;

    const viewMeta = {
        concept: {
            title: "개념 정리",
            description:
                "\"하단 터치 매수, 상단 터치 매도\"는 절반짜리 지식입니다. 밴드의 수렴·확장이 전제입니다."
        },

        sim: {
            title: "수렴·확장 시뮬레이터",
            description:
                "재생 버튼으로 시간을 흘려내며 밴드가 모이고 터지는 순간을 관찰하세요."
        },

        steps: {
            title: "타이밍 신호 6단계",
            description:
                "언제 수렴하고 언제 확장하는가 — 이격도, 매물대, 10일선 변곡, 60일선 기울기."
        },

        quiz: {
            title: "퀴즈",
            description:
                "수렴과 확장의 조건을 직관적으로 익힐 때까지 반복합니다."
        }
    };

    function showToast(message) {
        const container =
            document.getElementById("toast-container");

        const toast = document.createElement("div");

        toast.className = "toast";
        toast.textContent = message;

        container.appendChild(toast);

        window.setTimeout(() => {
            toast.remove();
        }, 2200);
    }

    function updateNavigation(activeView) {
        document
            .querySelectorAll("[data-view]")
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.view === activeView
                );
            });
    }

    function updateHeader(activeView) {
        const meta =
            viewMeta[activeView] || viewMeta.concept;

        document.getElementById(
            "page-title"
        ).textContent = meta.title;

        document.getElementById(
            "page-description"
        ).textContent = meta.description;
    }

    function render() {
        // 뷰 전환 시 재생 중이던 타이머 정지
        BBLab.SimView.destroy();

        const state = store.getState();
        const activeView = state.activeView;

        const container =
            document.getElementById("view-container");

        updateNavigation(activeView);
        updateHeader(activeView);

        if (activeView === "sim") {
            BBLab.SimView.render(container);
            return;
        }

        if (activeView === "steps") {
            BBLab.StepsView.render(container);
            return;
        }

        if (activeView === "quiz") {
            BBLab.QuizView.render(container);
            return;
        }

        BBLab.ConceptView.render(container);
    }

    function bindNavigation() {
        document
            .getElementById("main-nav")
            .addEventListener("click", event => {
                const button =
                    event.target.closest("[data-view]");

                if (!button) return;

                store.setActiveView(button.dataset.view);
                render();
            });
    }

    function init() {
        bindNavigation();
        render();
    }

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

    return Object.freeze({
        showToast,
        render
    });
})();
