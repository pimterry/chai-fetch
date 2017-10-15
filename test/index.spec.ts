// TODO: This should become a normal import once HSM type publishing is working
const mockServer = require('http-server-mock').getLocal();
import fetch from 'node-fetch';

import chai = require('chai');
import chaiFetch = require('..');
chai.use(chaiFetch);

const { expect } = chai;

describe('Chai-fetch', () => {
    beforeEach(() => mockServer.start());
    afterEach(() => mockServer.stop());

    describe('.responseText', () => {
        it('should match responses with matching bodies', async () => {
            await mockServer.get('/match').thenReply(200, 'matching body');

            let response = await fetch(mockServer.urlFor('/match'));

            await expect(response).to.have.responseText('matching body');
        });

        it('should match responses regardless of status ', async () => {
            await mockServer.get('/match').thenReply(503, 'matching body');

            let response = await fetch(mockServer.urlFor('/match'));

            await expect(response).to.have.responseText('matching body');
        });

        it('should automatically wait for responses that are still promised', async () => {
            await mockServer.get('/match').thenReply(200, 'matching body');

            await expect(fetch(mockServer.urlFor('/match'))).to.have.responseText('matching body');
        });

        it('should reject responses with different bodies', async () => {
            await mockServer.get('/non-match').thenReply(200, 'non-matching body');
            
            let response = await fetch(mockServer.urlFor('/non-match'));
            
            await expect(response).not.to.have.responseText('non-matching body');
        });
        
        it('should reject responses that fail', async () => {
            try {
                await expect(
                    fetch('http://non-existent-url-that-wont-resolve.test')
                ).not.to.have.responseText('non-matching body');
                throw new Error('Should reject totally failing requests!');
            } catch (e) {
                expect(e.name).to.equal('FetchError');
            }
        });
    });
});