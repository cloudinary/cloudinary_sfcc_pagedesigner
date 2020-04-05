
(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        let iFrame = document.createElement('iframe');
        iFrame.src = "https://764f16e0.ngrok.io/video";
        iFrame.setAttribute('frameborder', 0);
        iFrame.setAttribute('marginwidth', 0);
        iFrame.setAttribute('marginheight', 0);
        iFrame.setAttribute('vspace', 0);
        iFrame.setAttribute('hspace', 0);
        iFrame.setAttribute('scrolling', "no");
        iFrame.setAttribute('seamless', 'seamless')
        iFrame.style.width = '100%';
        iFrame.height = 700;
        document.body.appendChild(iFrame);
        window.addEventListener('message', (event) => {
            const r = RegExp('.*\.ngrok\.io')
            if (r.test(event.origin)) {
                console.log(event);
            }
        })
    });

    function resizeIframe(obj) {
        obj = this;
        obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
      }
})();