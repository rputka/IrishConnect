(function() {
    function getOverlay() {
        return document.getElementById('algorithm-spinner');
    }

    function show() {
        const overlay = getOverlay();
        if (overlay) overlay.style.display = 'flex';
    }

    function hide() {
        const overlay = getOverlay();
        if (overlay) overlay.style.display = 'none';
    }

    // Expose immediately
    window.showAlgorithmSpinner = show;
    window.hideAlgorithmSpinner = hide;

    function init() {
        // Spinner runs on "Run Similarity Algorithm" click
        document.querySelectorAll('a.home-algorithm-btn').forEach(a => {
            a.addEventListener('click', (e) => {
                if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                show();
            });
        });

        // Show spinner when algorithm page loads
        if (window.location.pathname === '/algorithm') {
            show();
            
            // Hide after load
            if (document.readyState === 'complete') {
                setTimeout(hide, 200);
            } else {
                window.addEventListener('load', () => setTimeout(hide, 200));
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle back/forward cache
    window.addEventListener('pageshow', (event) => {
        if (event.persisted && window.location.pathname === '/algorithm') {
            hide(); // Ensure hidden if restoring from cache
        }
    });
})();