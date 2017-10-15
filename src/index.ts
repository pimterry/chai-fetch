declare global {
    export namespace Chai {
        interface Assertion {
            responseText(expectedText: string | RegExp): Promise<void>;
        }
    }
}

export = function chaiFetch(chai: any) {
    chai.Assertion.addMethod('responseText', async function (this: any, expectedText: string | RegExp) {
        let target: Response | Promise<Response> = this._obj;

        let response = await target;
        let responseText = await response.text();

        let result: boolean;
        let expectedMessage: string;
        let notExpectedMessage: string;

        if (expectedText instanceof RegExp) {
            expectedMessage    = 'expected response body to match #{exp} but was #{act}';
            notExpectedMessage = 'expected response body not to match #{exp} but was #{act}';
            result = expectedText.test(responseText);
        } else {
            expectedMessage    = 'expected response body to equal #{exp} but was #{act}';
            notExpectedMessage = 'expected response body not to equal #{exp} but was #{act}';
            result = expectedText === responseText;
        }

        this.assert(result, expectedMessage, notExpectedMessage, expectedText, responseText);
    });
}