# Shared Source

This folder contains shared SDK source code that is safe in both browser and server runtimes.

## Architectural Decisions

The shared source starts with a narrow entrypoint and should only grow when both frontend and backend packages need the same contract.

Tradeoff:

- Benefit: shared contracts stay intentional and easy to audit.
- Cost: some package-local duplication may be acceptable until a contract is clearly shared.

## Source Map

To find the shared SDK entrypoint visit [index.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/index.ts).
To find shared constants visit [constants.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/constants.ts).
To find shared error contracts visit [errors.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/errors.ts).
To find shared SDK models visit [models.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/models.ts).
To find embedded checkout funding contracts visit [models.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/models.ts).
To find shared route contracts visit [routes.ts](file:///C:/Hackathons/EasyAuth/packages/shared/src/routes.ts).
The shared package connection can be found in [../package.json](file:///C:/Hackathons/EasyAuth/packages/shared/package.json).
