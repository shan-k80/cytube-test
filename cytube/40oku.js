
 // 視聴者数を固定表示（赤字・太字）

(function () {
    'use strict';

    const TARGET_ID = 'usercount';
    const LABEL_TEXT = '現在の視聴者数:';
    const COUNT_TEXT = '40億4890万人';
    const STYLE_ID = 'fixed-usercount-style';

    function setUpCounter(el) {
        if (el.dataset.fixedCounterReady === '1') return;
        el.dataset.fixedCounterReady = '1';

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            '#usercount .fixed-count-value {' +
            'color: red !important;' +
            'font-weight: bold !important;' +
            '}';
        document.head.appendChild(style);

        function update() {
            const expectedHTML =
                LABEL_TEXT +
                '<span class="fixed-count-value">' +
                COUNT_TEXT +
                '</span>';

            if (el.innerHTML !== expectedHTML) {
                el.innerHTML = expectedHTML;
            }
        }

        update();

        const observer = new MutationObserver(update);
        observer.observe(el, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    function findCounter() {
        const el = document.getElementById(TARGET_ID);
        if (!el) return false;

        setUpCounter(el);
        return true;
    }

    if (findCounter()) return;

    const finder = new MutationObserver(function () {
        if (findCounter()) {
            finder.disconnect();
        }
    });

    finder.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
