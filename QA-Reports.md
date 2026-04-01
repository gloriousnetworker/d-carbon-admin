1. As an admin, when I go into a customer’s facility details page, I expect that clicking on the **Download Docs (i8/i8)** will download a zip file containing all the facility docs with a success message but I instead get a “Package downloaded. 12 document(s) failed — see placeholder files in ZIP.”  
   Here is the content of the placeholder files “Failed to download: WREGIS Assignment URL: https://storage.googleapis.com/dcarbon-dev-env-storage/facility-wregis-assignment%2F1773522112008-Test.pdf Please download this document manually.  
2. Historical Collection run job on the system jobs should be using this endpoint  
   **{{local}}/api/historical-collection/start** and not the current one which fails with the error **Route /api/historical-collection/run not found**  
3.  When a user is on the residence, commercial or partner dashboard and their auth token expires, they can still see their details, the system should force a logout if the auth token is expired.  
4. A residential user who is logged in on the browser will be able to access the commercial and residential dashboards  
5.  After a customer’s facility doc has been approved and the facility docs verified, it shows are verified on the registration pipeline but on the customer’s details page on the admin, the docs are not yet approved, the facility is not yet verified and the system is not yet active.  
6. There is no rec data for a user on the system for a user with meter number 2453, but checking on the instapull’s usage list I can see rec data on the system. They were all forward data, he had nothing for reverse can you confirm if we are using forward or reverse energy data.  
7. Commission calculation and rec generation all throw a 404 not found error  
8. Since we now have a dedicated system job, I think it is better we move the trigger commission, sales agent bonus and trigger partner bonus to the system jobs page.  
9. The residential account page in /residence-dashboard does not have residential facility owner details like name, phone number and address and all these are collected during registration. Account owner information is also missing.   
10. On the landing page, we have two sign in buttons  
11. As a residential user, the solar system management button is greyed out, when you hover over it you get a message that you need to complete utility authorization, this is an old implementation as evidenced in the commercial user generator management which does not grey out the button  
12. Request failed with status code 422 when I attempt to sign an agreement here is the REST response from the network tab: 

| status | "fail" |
| :---- | :---- |
| **statusCode** | **422** |
| **message** | **"No file uploaded"** |

13. When a user’s document signature fails, it means they haven’t agreed to the user agreement but they can actually bypass the system by closing the modal and clicking on continue existing facility registration and this allows them to continue to instapull or any other utility gateway without signing the agreements. System should only allow facilities with user agreement signed to proceed with utility authorization  
14. For a user who can’t find their meter from one utility authorization, we provide them with an option to add additional utility authorization, however, there is no way to see the state of that new authorization and hence the user has to endure a period of uncertainty until he eventually refreshes and the system loads the utility account.  
15. Invoices submitted by the commercial users go nowhere in the admin. So that cannot be actioned by the admin.   
16. There is a get invoices {{local}}/api/quarterly-statements/invoices endpoint but it is not restricted to the admin and the get invoice by ID {{local}}/api/quarterly-statements/invoices/2db2d125-e7f5-44db-91ec-453ec20e73e0 should be restricted to just the owner of the invoice and the admin  
17.  There is a {{local}}/api/payout-request/request endpoint that should be available for the users but it is no where on the commercial dashboard and the endpoints to approve, reject and view all should be restricted to a token that belongs to an admin (It should be a business decision not to activate it and users should submit invoice but the endpoint restriction request are valid concerns)  
18. With respect to 17, if disabling payouts is current state, then it should not be visible for residential users, instead we should have submit invoice and the list of users invoice  
19. What happened to the notification system, before we migrated to instapull, the user gets a notification on the notification bar when the utility auth pulls through.  
20.  The tables on the app are no mobile responsive  
21. On the users auth pages, the width of the recaptcha is bigger than the form.  
22. On the admin auth page, remove the create account functionality, admins should not have a registration page. We need to decide if we want to have a dedicated page in the admin dashboard to create and view admins on the system  
23. No file uploaded error, when I try to attach a profile picture for a user  
24. Failed to fetch FAQs error when I click on Help & Tutorials in the admin  
25. Operation failed when I submit the form to create an FAQ  
26. Error: Invalid \`prisma\_1.default.commissionStructure.create()\` invocation in /app/dist/services/new-commissionStructure.service.js:22:53 19 const client\_1 \= require("@prisma/client"); 20 class CommissionService { 21 static async create(data) { → 22 return prisma\_1.default.commissionStructure.create( Unique constraint failed on the fields: (\`propertyType\`,\`mode\`,\`tierId\`) when I attempt to create a duplicate commission.The error should be more graceful. Handle this for all endpoints  
27. Registration Pipeline page should be paginated 10 or 20 per page

