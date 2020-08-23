(() => {
    subscribe('sfcc:ready', async (
        { config }) => {
        fetch(config.iFrameEnv + '/version.txt', { module: 'cors' }).then((response) => {
            if (response.status === 200) {
                response.text().then((text) => {
                    let iframeDiv = document.createElement('div');
                    iframeDiv.textContent = 'Env version: ' + text;
                    document.body.appendChild(iframeDiv);
                });
            }
        });
        let div = document.createElement('div');
        div.textContent = 'Cartridge version: ' + config.version;
        document.body.appendChild(div);
    });
})();
