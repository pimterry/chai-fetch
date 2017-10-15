declare global {
    export namespace Chai {
        interface Assertion {
            responseText(expectedText: string): Promise<void>;
        }
    }
}

export = function chaiFetch(chai: any) {
    chai.Assertion.addMethod('responseText', async function (this: any, expectedText: string) {
        let target: Response | Promise<Response> = this._obj;

        let response = await target;
        let responseText = await response.text();

        return chai.expect(responseText).to.equal(expectedText);
    });
}