window.BBLab = window.BBLab || {};

BBLab.Config = Object.freeze({
    storageKey: "bb_timing_lab_v1",

    // 볼린저밴드 파라미터 (일봉 기준)
    bbPeriod: 20,
    bbMult: 2,

    // 이평선 체계 (일봉 기준 N일선)
    maFast: 10,    // 10일선 — 단기선, 쌍바닥/쌍봉 신호
    maBasis: 20,   // 20일선 — 볼린저 중심선
    maSlow: 60     // 60일선 — 추세선, 기울기가 방향
});
