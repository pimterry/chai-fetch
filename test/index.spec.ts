import * as mockttp from 'mockttp';
import fetch from 'node-fetch';

const mockServer = mockttp.getLocal();

import chai = require('chai');
import chaiFetch = require('..');

chai.use(chaiFetch);

const { expect, AssertionError } = chai;

describe('Chai-fetch', () => {
    beforeEach(() => mockServer.start());
    afterEach(() => mockServer.stop());

    describe('.responseText', () => {
        it('should match responses with matching bodies', async () => {
            await mockServer.get('/match').thenReply(200, 'matching body');

            let response = await fetch(mockServer.urlFor('/match'));

            await expect(response).to.have.responseText('matching body');
        });

        it('should match responses regardless of status', async () => {
            await mockServer.get('/match').thenReply(503, 'matching body');

            let response = await fetch(mockServer.urlFor('/match'));

            await expect(response).to.have.responseText('matching body');
        });

        it('should match responses based on a regex', async () => {
            await mockServer.get('/match').thenReply(503, 'matching body');

            let response = await fetch(mockServer.urlFor('/match'));

            await expect(response).to.have.responseText(/matching/);
        });

        it('should automatically wait for responses that are still promised', async () => {
            await mockServer.get('/match').thenReply(200, 'matching body');

            await expect(fetch(mockServer.urlFor('/match'))).to.have.responseText('matching body');
        });

        it('should reject responses with different bodies', async () => {
            await mockServer.get('/non-match').thenReply(200, 'matching body');

            let response = await fetch(mockServer.urlFor('/non-match'));

            try {
                await expect(response).to.have.responseText('non-matching body');
                throw new AssertionError('Should not match non-matching bodies');
            } catch (e) {
                expect(e.message).to.equal("expected response body to equal 'non-matching body' but was 'matching body'");
            }
        });

        it("should reject responses that don't match the passed regex", async () => {
            await mockServer.get('/non-match').thenReply(200, 'matching body');

            let response = await fetch(mockServer.urlFor('/non-match'));

            try {
                await expect(response).to.have.responseText(/non-matching/);
                throw new AssertionError('Should not match non-matching bodies');
            } catch (e) {
                expect(e.message).to.equal("expected response body to match /non-matching/ but was 'matching body'");
            }
        });

        it('should reject responses that fail', async () => {
            try {
                await expect(
                    fetch('http://non-existent-url-that-wont-resolve.test')
                ).not.to.have.responseText('non-matching body');
                throw new AssertionError('Should reject totally failing requests!');
            } catch (e) {
                expect(e.name).to.equal('FetchError');
            }
        });

        describe('negated', () => {
            it('should match responses with non-matching bodies', async () => {
                await mockServer.get('/non-match').thenReply(200, 'non-matching body');

                await expect(fetch(mockServer.urlFor('/non-match'))).not.to.have.responseText('matching body');
            });

            it('should reject responses with matching bodies', async () => {
                await mockServer.get('/match').thenReply(200, 'matching body');

                try {
                    await expect(fetch(mockServer.urlFor('/match'))).not.to.have.responseText('matching body');
                    throw new AssertionError('Should not match matching bodies');
                } catch (e) {
                    expect(e.message).to.equal("expected response body not to equal 'matching body' but was 'matching body'");
                }
            });

            it('should not match responses based on a regex', async () => {
                await mockServer.get('/match').thenReply(503, 'matching body');

                let response = await fetch(mockServer.urlFor('/match'));

                await expect(response).not.to.have.responseText(/non-matching/);
            });

            it('should reject responses that fail', async () => {
                try {
                    await expect(
                        fetch('http://non-existent-url-that-wont-resolve.test')
                    ).not.to.have.responseText('non-matching body');
                    throw new AssertionError('Should reject totally failing requests!');
                } catch (e) {
                    expect(e.name).to.equal('FetchError');
                }
            });
        });
    });

    describe(".status", () => {
        it('should match responses with the correct status', async () => {
            await mockServer.get('/200').thenReply(200);

            let response = await fetch(mockServer.urlFor('/200'));

            await expect(response).to.have.status(200);
        });

        it('should not match responses with the incorrect status', async () => {
            await mockServer.get('/500').thenReply(500);

            try {
                await expect(
                    fetch(mockServer.urlFor('/500'))
                ).to.have.status(200);

                throw new Error('Should reject non-matching status!');
            } catch (e) {
                expect(e.message).to.equal("expected status to equal 200 but was 500");
            }
        });

        describe('negated', () => {
            it('should match responses with a non-matching status', async () => {
                await mockServer.get('/500').thenReply(500);

                let response = await fetch(mockServer.urlFor('/500'));

                await expect(response).not.to.have.status(200)
            });

            it('should not match responses with the matching status', async () => {
                await mockServer.get('/200').thenReply(200);

                try {
                    await expect(
                        fetch(mockServer.urlFor('/200'))
                    ).not.to.have.status(200);

                    throw new Error('Should reject matching status!');
                } catch (e) {
                    expect(e.message).to.equal("expected status not to equal 200 but was 200");
                }
            });
        });
    });
});