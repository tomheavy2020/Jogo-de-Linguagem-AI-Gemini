(function() {
    function requestFS() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msRequestFullscreen) {
            const el = document.documentElement;
            const rfs = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
            if (rfs) {
                rfs.call(el).catch(() => {});
            }
        }
    }

    const enableFS = () => {
        requestFS();
        sessionStorage.setItem('matrix_fs_active', 'true');
    };

    document.addEventListener('click', enableFS, { capture: true, once: true });
    document.addEventListener('touchstart', enableFS, { capture: true, once: true });

    window.addEventListener('load', () => {
        if (sessionStorage.getItem('matrix_fs_active') === 'true') {
            requestFS();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            sessionStorage.setItem('matrix_fs_active', 'true');
        }
    });
})();
