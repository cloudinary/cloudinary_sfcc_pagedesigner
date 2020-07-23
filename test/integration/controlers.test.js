const fetch = require('node-fetch');
require('dotenv').config();
const HOST_NAME = process.env.SFCC_HOST;
const SITE_NAME = process.env.SFCC_SITE_NAME;
const publicId = process.env.SFCC_PUBLIC_ID;

describe('Test controllers', () => {
    it('Test breakpoints controller', async (done) => {
        let controlerUrl = `https://${HOST_NAME}/on/demandware.store/Sites-${SITE_NAME}-Site/default/Brpoints-Points?publicId=${publicId}`;
        // eslint-disable-next-line consistent-return
        let res = await fetch(controlerUrl);
        let json;
        if (res.status === 200) {
            json = await res.json();
        } else {
            done.fail(res.status);
        }
        expect(json.breakpoints.length).toBeGreaterThan(0);
        done();
    }, 10000);
    it('Test Asset info controller', async (done) => {
        let controlerUrl = `https://${HOST_NAME}/on/demandware.store/Sites-${SITE_NAME}-Site/default/Asset-info?publicId=${publicId}&type=upload&rType=image`;
        let res = await fetch(controlerUrl);
        let json;
        if (res.status === 200) {
            json = await res.json();
        } else {
            done.fail(res.status);
        }
        expect(json.info.public_id).toBe(publicId);
        done();
    });
    it('Test Links builder controller', async (done) => {
        let controlerUrl = `https://${HOST_NAME}/on/demandware.store/Sites-${SITE_NAME}-Site/default/Links-url?linkData=%5B%22Product-Show%22%2C%22pid%22%2C%22womens-jewelry-bundleM%22%5D`;
        let res = await fetch(controlerUrl);
        let json;
        if (res.status === 200) {
            json = await res.json();
        } else {
            done.fail(res.status);
        }
        expect(json.status).toBe('ok');
        done();
    });
});
