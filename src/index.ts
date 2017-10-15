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

        let expectedMessage    = 'expected response body to equal #{exp} but was #{act}';
        let notExpectedMessage = 'expected response body not to equal #{exp} but was #{act}';

        this.assert(responseText === expectedText, expectedMessage, notExpectedMessage, expectedText, responseText);
    });
}