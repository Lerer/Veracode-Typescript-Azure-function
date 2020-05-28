import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { specificRequest } from '../SharedCode/veracodeWrapper';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('Typescript HTTP trigger function processed a request.');
    const name = (req.query.name || (req.body && req.body.name));

    if (name) {
        context.res = {

            // status: 200, /* Defaults to 200 */
            body: "Hello " + (req.query.name || req.body.name)
        };
    }
    else { 
        var answer = await specificRequest(context,'getWorkspaceIssues');
        context.log.info('answer: '+answer);

        context.res = {
            status: 200,
            body: JSON.stringify(answer)
        };
    }
};

export default httpTrigger;
