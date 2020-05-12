(() => {
    subscribe('sfcc:ready', async ({ value, config, isDisabled, isRequired, dataLocale, displayLocale }) => {
        fetch(config.iFrameEnv + '/version.txt').then((response) => {
            if (response.status === 200) {
                response.text().then((text) => {
                    console.log(text);
                    let iframeDiv = document.createElement('div');
                    iframeDiv.textContent = 'Env version: ' + text;
                    document.body.appendChild(iframeDiv);
                })
            }
        });
        let div = document.createElement('div');
        div.textContent = "Cartridge version V0.19"
        document.body.appendChild(div);
    });
})();