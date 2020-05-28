# Typescript Azure Function for Veracode

This repository contains a simple example of an Azure function implementation which can tunnel a simple request into predefined information request from the Veracode platform.

you can modify the "specificRequest(context,'getWorkspaceIssues')" in index.ts to one of the following:
  - getWorkspaces
  - getApplications
  - getWorkspaceProjects
  - getProjectDetails
  - getWorkspaceIssues
  - ...add your own - [more Veracode API]

Note for the predefined requests, you will have to update the ids to your projects and workspaces

#### For environment variables...
The generateHeader function require the presense of the id and secret which need to be [generated in the platform]:

When running in the Cloud, verify you setup environment variables:
- veracode_api_key_id
- veracode_api_key_secret

##### Local Debug
When running locally you need to make sure you create or update [the credentials file]
Following on that, you need to update the local setting file (*local.settings.json*) to include the profile you put the credentials into:
```
{
  "IsEncrypted": false|true,
  "Values": {
    "AzureWebJobsStorage": "......",
    "FUNCTIONS_WORKER_RUNTIME": "node",

    "veracode_auth_profile":"<Profile name>"
  }
}
```
note - if you are using this repo as a code example, you will need to update the function to read 
       the credentials' file profile id from a different place.


### Enhancements

 - Fill free to add to the example
 - If you have an improvement idea or you found any defect, please add an 'issue'


**Free Software!**

[more Veracode API]: <https://help.veracode.com/reader/LMv_dtSHyb7iIxAQznC~9w/TNCmFBcyE6F902_fr9Qz0g>
[generated in the platform]: <https://help.veracode.com/reader/LMv_dtSHyb7iIxAQznC~9w/3YtglKwBsC_tCpQpA4Axiw>
[the credentials file]: <https://help.veracode.com/reader/LMv_dtSHyb7iIxAQznC~9w/zm4hbaPkrXi02YmacwH3wQ>