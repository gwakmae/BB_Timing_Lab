window.BBLab = window.BBLab || {};

// 학습용 합성 차트 데이터 + 지표 계산
// 흐름: 상승 추세 → 과열 해소 → 수렴 → 쌍바닥 → 상방 확장
//      → 고점 혼란 → 매물대 박스(수렴) → 하방 확장
BBLab.Data = (() => {
    const cfg = BBLab.Config;

    function mulberry32(a) {
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;

            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // 단계 정의: [캔들 수, drift, 변동성]
    const PHASES = [
        { n: 34, drift: 0.85, vol: 1.15, tag: "상승 추세 (확장)" },
        { n: 12, drift: -0.55, vol: 0.90, tag: "단기 과열 해소" },
        { n: 30, drift: 0.02, vol: 0.42, tag: "횡보 (수렴)" },
        { n: 10, drift: -0.30, vol: 0.45, tag: "쌍바닥 형성" },
        { n: 30, drift: 0.95, vol: 1.05, tag: "상방 확장" },
        { n: 14, drift: 0.10, vol: 0.60, tag: "고점 혼란" },
        { n: 38, drift: 0.00, vol: 0.45, tag: "매물대 박스권 (수렴)", meanRevert: true },
        { n: 30, drift: -0.90, vol: 1.10, tag: "하방 확장" }
    ];

    function generate() {
        const rand = mulberry32(20240817);
        const candles = [];

        let price = 100;
        let boxAnchor = 0;

        PHASES.forEach(phase => {
            if (phase.meanRevert) {
                boxAnchor = price;
            }

            for (let i = 0; i < phase.n; i += 1) {
                const open = price;

                let change =
                    phase.drift +
                    (rand() - 0.5) * 2 * phase.vol;

                if (phase.meanRevert) {
                    change += (boxAnchor - open) * 0.09;
                }

                const close = open + change;
                const high =
                    Math.max(open, close) +
                    rand() * phase.vol * 0.7;
                const low =
                    Math.min(open, close) -
                    rand() * phase.vol * 0.7;

                candles.push({
                    o: open,
                    h: high,
                    l: low,
                    c: close,
                    tag: phase.tag
                });

                price = close;
            }
        });

        return candles;
    }

    function sma(values, period) {
        const out = new Array(values.length).fill(null);
        let sum = 0;

        for (let i = 0; i < values.length; i += 1) {
            sum += values[i];

            if (i >= period) {
                sum -= values[i - period];
            }

            if (i >= period - 1) {
                out[i] = sum / period;
            }
        }

        return out;
    }

    function rollingStd(values, period, means) {
        const out = new Array(values.length).fill(null);

        for (let i = period - 1; i < values.length; i += 1) {
            let acc = 0;

            for (let j = i - period + 1; j <= i; j += 1) {
                const d = values[j] - means[i];
                acc += d * d;
            }

            out[i] = Math.sqrt(acc / period);
        }

        return out;
    }

    function quantile(sorted, q) {
        const pos = (sorted.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;

        if (sorted[base + 1] !== undefined) {
            return (
                sorted[base] +
                rest * (sorted[base + 1] - sorted[base])
            );
        }

        return sorted[base];
    }

    const candles = generate();
    const closes = candles.map(c => c.c);

    const ma10 = sma(closes, cfg.maFast);   // 10일선 (단기)
    const ma20 = sma(closes, cfg.maBasis);  // 20일선 (중심선)
    const ma60 = sma(closes, cfg.maSlow);   // 60일선 (추세선)
    const sd = rollingStd(closes, cfg.bbPeriod, ma20);

    const upper = closes.map((_, i) =>
        ma20[i] === null
            ? null
            : ma20[i] + cfg.bbMult * sd[i]
    );

    const lower = closes.map((_, i) =>
        ma20[i] === null
            ? null
            : ma20[i] - cfg.bbMult * sd[i]
    );

    // 밴드폭(%) — 수렴/확장 감지의 핵심 지표
    const bandwidth = closes.map((_, i) =>
        ma20[i] === null
            ? null
            : ((upper[i] - lower[i]) / ma20[i]) * 100
    );

    const validBw = bandwidth
        .filter(v => v !== null)
        .slice()
        .sort((a, b) => a - b);

    const bwQ35 = quantile(validBw, 0.35); // 이하 → 수렴
    const bwQ70 = quantile(validBw, 0.70); // 이상 → 확장

    // 이격도(%): 중심선(20일선)과 추세선(60일선)의 괴리
    const gap = closes.map((_, i) =>
        ma20[i] === null || ma60[i] === null
            ? null
            : ((ma20[i] - ma60[i]) / ma60[i]) * 100
    );

    const N = candles.length;

    // 매물대 영역(학습용): PHASES[6] 박스 구간
    const boxStart = PHASES
        .slice(0, 6)
        .reduce((s, p) => s + p.n, 0);
    const boxEnd = boxStart + PHASES[6].n - 1;

    let supplyLevel = -Infinity;

    for (let i = boxStart; i <= boxEnd; i += 1) {
        supplyLevel = Math.max(supplyLevel, candles[i].h);
    }

    const priceMin = Math.min(...candles.map(c => c.l));
    const priceMax = Math.max(...candles.map(c => c.h));

    function isSqueeze(i) {
        return (
            bandwidth[i] !== null &&
            bandwidth[i] <= bwQ35
        );
    }

    function isExpansion(i) {
        if (bandwidth[i] === null || i < 6) {
            return false;
        }

        return (
            bandwidth[i] >= bwQ70 &&
            bandwidth[i] > bandwidth[i - 5]
        );
    }

    function slopeOf(arr, i, lookback) {
        if (
            i < lookback ||
            arr[i] === null ||
            arr[i - lookback] === null
        ) {
            return null;
        }

        return arr[i] - arr[i - lookback];
    }

    return Object.freeze({
        candles,
        ma10,
        ma20,
        ma60,
        upper,
        lower,
        bandwidth,
        gap,
        bwQ35,
        bwQ70,
        N,
        priceMin,
        priceMax,
        boxStart,
        boxEnd,
        supplyLevel,
        isSqueeze,
        isExpansion,
        slopeOf
    });
})();
