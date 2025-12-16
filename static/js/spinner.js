document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('algorithm-spinner');
    const show = () => { if (overlay) overlay.style.display = 'flex'; };
    const hide = () => { if (overlay) overlay.style.display = 'none'; };

    // exposing for other scripts (app.js)
    window.showAlgorithmSpinner = show;
    window.hideAlgorithmSpinner = hide;

    // spinner runs on "Run Similarity Algorithm" click
    document.querySelectorAll('a.home-algorithm-btn').forEach(a => {
        a.addEventListener('click', (e) => {
            // keys that are ignored
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            show();
        });
    });
});