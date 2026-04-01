Mar 16, 2026

## DCarbon Project

Invited [Francis Awe](mailto:awefrancolaz@gmail.com) [Chimdinma Kalu](mailto:chimdinma.kalu@tenyne.com) [Himanshu Shukla](mailto:h@dcarbon.solutions) [Himanshu Shukla](mailto:himanshu.shukla@tenyne.com) [phillip.kopp.sd](mailto:phillip.kopp.sd@gmail.com) [Nwachukwu Uba](mailto:uba.nwachukwu@tenyne.com) [Austin Chibuike](mailto:austin.chibuike@tenyne.com) [Glorious Udofot](mailto:iniubongudofot2000@gmail.com) [Francis Awe](mailto:francis.awe@tenyne.com) [Victor Awam](mailto:awamaaronvictor@gmail.com) [ayoworkplace@gmail.com](mailto:ayoworkplace@gmail.com) [sogah685@gmail.com](mailto:sogah685@gmail.com) [Shepherd.praise.onoja@gmail.com](mailto:shepherd.praise.onoja@gmail.com)

Attachments [DCarbon Project](https://www.google.com/calendar/event?eid=amI4aDFmMmtzcnM4aHA5a3M2Nm9jdnBkc3NfMjAyNjAzMTZUMTkwMDAwWiBjaGltZGlubWEua2FsdUB0ZW55bmUuY29t) [DCarbon Project - 2025/11/28 19:55 WAT - Recording](https://drive.google.com/file/d/13lRbOOrPnaWcH7REk2KL_qNXJwPUgFQ8/view?usp=drive_web) [DCarbon Project - 2025/11/28 19:55 WAT - Chat](https://drive.google.com/file/d/1vkcLcQczZ0CLopaJMQAyPi3cby7GIYZZ/view?usp=drive_web) [Notes by Gemini](https://docs.google.com/document/d/1xW7IPPIpXz5DQB_0iBv7KE30Hx4_LoRLsFHDZQr6sg4/edit?usp=meet_tnfm_calendar) [Notes by Gemini](https://docs.google.com/document/d/1qzqeV4MfFrQjD4gkOGWMMxazE7LIzG_FMCH4zLwDE3c/edit?usp=meet_tnfm_calendar) 

Meeting records [Recording 2](https://drive.google.com/file/d/1AdGYAFWM8hf2lieUlhnD2Nb8OkTGB6BF/view?usp=drive_web) [Recording](https://drive.google.com/file/d/1RCqt3bpSLWE-LgP0ns5nEJuoJ50-jqDA/view?usp=drive_web) 

### Summary

App demo highlighted admin dashboard functionality with split user management and refined payout processes.

**Admin Dashboard Features Demo**  
The admin app demo showcased a refactored dashboard featuring split user management for customers and partners. A decision was made to implement filtering capabilities by status for both the registration pipeline and user management sections.

**Payout and Invoice Workflow**  
The group reviewed the new payout management feature, which requires commercial users to submit an invoice for admin approval. To improve user interface clarity, the 'Revenue Wallet' display was agreed to be simplified by removing the 'Held Amount'.

**REC Data Structure Strategy**  
The meeting outlined a 3-step workflow for REC management, emphasizing the need for REC data segmentation and chunking large export files. The reporting structure was defined to include separate reports for points, REC generation, and REC sales entries.

### Details

* **Startup Idea Discussion and Meeting Commencement**: The discussion began with informal conversation, including mention of potential options within a choir and a reference to someone not ready for a wife. Chimdinma Kalu requested Awam Victor to remind them about pitching a startup idea. The meeting then officially started with Awam Victor presenting an update on the app, stating that refactoring and fixes were successfully completed to prepare for the "carbon go life" launch.

* **Admin App Demo and Features Overview**: Awam Victor started a short demo, beginning with the admin dashboard, which was a major pain point from the previous meeting. The overview page shows the status of all individual users, including customers, partners, and facilities. The system now features split user management for customers and partners, allowing admins to view customer and referral details, and download all associated documents in a zip file.

* **Registration Pipeline and Document Management**: The registration pipeline was showcased, indicating the stage of each user or registrant, such as commercial users who have registered, and commercial owners whose dog records are under review. Phillip Kopp appreciated the update, noting the addition of necessary functionality, but immediately asked if the registration pipeline list could be filtered by status, such as showing only pending accounts. Awam Victor and Chimdinma Kalu confirmed they would add the filtering capability to both the registration pipeline and user management.

* **User Management Display for Commercial Entities**: Phillip Kopp requested a change in the user management display for partners and commercial facilities to prioritize the company name over the individual's name. Chimdinma Kalu confirmed the preference for showing the company name for commercial accounts and partners, as the admin is more likely to recognize them by their corporate identity. This change was agreed upon since the individual name may refer to different people within the same company.

* **Direct Sales and REC Data Ingestion**: The functionality for direct sales management was maintained, with Awam Victor noting that all data on this page is exportable. Phillip Kopp confirmed they plan to add facilities and REC data today and tomorrow to test the REC data ingestion process, which should then populate the direct sales view. Awam Victor confirmed that the commission structure functionality is set, though it needs to be reviewed in the new environment.

* **Payout Process and Invoice Review**: A new feature was added for payout management, which includes an invoice review where commercial owners submit an invoice for admin approval before it is added to the payout request. Phillip Kopp inquired whether the commercial user is able to change the invoice number to match their own accounting system. Chimdinma Kalu clarified that the invoice number displayed is for the system's (the carbons) internal record-keeping, and the partner's uploaded invoice will use whatever number they prefer.

* **Invoice Workflow and Validation Logic**: The group discussed the need for a field where the partner could manually enter their invoice number to serve as a sanity check against the uploaded document. Chimdinma Kalu noted that manually entering the invoice number could introduce data integrity issues. The consensus was to hide the system-generated invoice number from the partner and rely on checking the uploaded document's amount against the amount entered to validate the invoice.

* **Invoice Review and Payout Request Workflow**: Awam Victor demonstrated that a commercial user submits an invoice, which the admin can then approve or reject, with a rejection providing a reason to the user. In the admin portal, the system automatically flags discrepancies, for instance, showing an error if the user-imputed invoice amount differs from the system-calculated statement amount. If the admin rejects an invoice, they can input a comment, such as advising the user to upload the correct document.

* **Commercial vs. Residential Payout Flow**: The payout request process was differentiated for commercial/partners and residential users. Commercial users and partners first go through invoice submission and approval, and then proceed to payout, while residential users go directly to payout after their points are approved. Payout is marked as complete only when the payment has been deposited into the bank.

* **Revenue Wallet and UI Concerns**: The "Revenue Wallet" details were reviewed, with "revenue" being defined as the lifetime earnings using their REC's. Concerns were raised regarding the relevance of "Available Balance" and "Held Amount" for commercial accounts, as the commercial process is simpler, involving invoice approval and payment. Furthermore, Phillip Kopp noted that the green box displaying basic user information is a "wasteful UI," takes up too much space, and is missing key commercial details like business name and address.

* **Residential Payout Point Conversion**: Residential redemption involves different hurdles, such as requiring a certain number of points before a withdrawal can be requested. At the payout processing stage for residential users, the requested amount would be in dollars, indicating that the points have already been converted. The process is currently stalled for residential users until they earn enough points, so the "request payout" button is only active when they are eligible.

* **Partner Invoice Submission Flow**: The process for partners to submit a payout request or an invoice was reviewed. There are two potential approaches for partners: either requesting a payout via an earning statement (like residential users) or submitting their own custom invoice. The group noted an issue with the invoice upload endpoint, which requires fixing.

* **Optimal Partner Invoice Submission Approach**: Phillip Kopp suggested that the "Request Payout" button on the reporting page should be removed because that page is solely for reporting. Instead, the ability to generate an invoice using the system's data should be moved into the "Submit Invoice" section, giving partners two clear options: generate an invoice or upload their own custom file. This approach ensures reporting remains separate and accommodates both small and large partners.

* **Partner Payout Processing UI Alignment**: It was determined that the partner payout processing UI should align with the commercial UI (the invoice list) rather than the residential view. The "Revenue Wallet" terms were still confusing, with Phillip Kopp noting that for partners, "earnings" and "commission" are essentially the same thing. It was suggested to use the single generic term "Revenue" or "Total Earnings" for simplicity.

* **Consolidated UI and Next Steps for Payouts**: The group agreed to clean up the revenue wallet display, removing "Held Amount," and to fix the green UI box to include corporate information, as the commercial and partner payout UIs should essentially be the same. The importance of connecting the residential redemption action to the admin side was noted as a task for future development scopes.

* **Reporting and Partner Performance Metrics**: The commercial REC reporting was identified as having a mislabeled metric, where "generation" should be changed to "commercial REC sales". The partner performance report was discussed, with the suggestion to remove unnecessary columns like "address" and "status" (since only active partners appear here). The critical metrics for partner performance were identified as company name, total referrals, total facilities (fully approved and registered), and REC's generated.

* **REC Sales Management and Generation Volume**: The REC Sales Management overview displays the available REC's, REC's sold, and the most recent REC price. The commercial REC generation view, intended to show monthly generation, was noted as potentially creating an unmanageably long list (e.g., 10,000 facilities generating 10,000 records monthly). It was proposed that the REC Sales Management should instead show the aggregate total of all REC's. The detailed, monthly generation data for each facility should be moved to the facility details within the user management section.

* **Rex Segmentation and Export Chunking**: Phillip Kopp suggested that the Rex (Renewable Energy Certificates) data should be segmented by vintage (month) or location (zip code). They also noted that for the Regis export, if the file contains a large number of facilities (e.g., 10,000 lines), it would need to be chunked into multiple export files, such as "export one, two, three, four, five, six". This is necessary because Excel files have a limit on the number of rows they can handle.

* **The Three-Step Rex Approval Process**: Phillip Kopp identified three steps in the Rex workflow: generation and export to Regis, submission to the regulator and approval, and the Rex sale. The generation data is submitted to Regis, and once Regis approves it, the generation converts into Rex that are available for sale. A key step involves an admin marking the generation as "approved" after regulatory approval, and a process is needed to manually reject or adjust generation amounts on a per-facility level if the regulator disagrees with the submission.

* **Disaggregation of Commercial vs. Residential Rex Sales**: Phillip Kopp questioned where the split between residential and commercial Rexes occurs in the payout processing, noting that Regis does not distinguish between them when issuing Rexes. AWE FRANCIS OLAWUMI confirmed that the system does not have an endpoint to directly interrogate Rex by commercial or residential category, but all Rexes are attached to a facility, and facility IDs can be used to infer whether a facility is commercial or residential. Phillip Kopp suggested simplifying the process by having a single Rex sale type, with earnings distributed to users (agents, commercial generators, residential users) based on their percentage contribution to the total Rex sold.

* **Inference for Residential and Commercial Reporting**: Chimdinma Kalu confirmed that, based on facility ID series, the system has an inference layer that can report the total amount of Rex sold that was generated by residential or commercial facilities, although this reporting is not part of the Rex sale process itself. Phillip Kopp agreed on keeping the system simple with one type of Rex flowing through to the other user types, avoiding segmentation by commercial or residential in those other types. They concluded that the Rex generation view should be updated to just be "rec generation" without commercial and residential segmentation.

* **Recommended Rex Management Reporting Structure**: Phillip Kopp outlined a reporting structure based on the three workflow steps: a report for points, a report for Rex, and a report for Rex sales/entries. The points report should track earned, redeemed, and open balance points, which are generated regardless of Regis approval. The Rex report should track generation submitted and approved Rexes. The Rex sales record (entries) could have multiple entries per month, unlike the monthly Rex and points reports.

* **Prioritizing Rex Data Structure Updates**: Phillip Kopp emphasized that updating the data structure for Rex information is a high-level issue with many dependencies, and the changes must be implemented before any real, legitimate Rex data enters the database. Chimdinma Kalu committed to adding the identified issues to a build list for the next meeting. Awam Victor confirmed that "vintage" relates to dates.

* **System Jobs and Other Updates**: Phillip Kopp inquired about "system jobs" and the status of the corporate website and videos. Chimdinma Kalu reported that the corporate website is currently up, but Phillip Kopp encountered an HTTPS error which Chimdinma Kalu committed to checking. System jobs are for processes such as commission calculation and monthly Rex generation, which mostly run automatically, but can be triggered manually if they fail to run. Chimdinma Kalu also mentioned that they had a difficult weekend, and the videos are expected to be recorded by Awam Victor the following day.

### Suggested next steps

- [ ] Phillip Kopp will try to add a couple of facilities with wreck data today and tomorrow to ingest the wreck data and fill out the direct sales management functionality.  
- [ ] Phillip Kopp will create a scope around finishing the residential payout workflow and connecting it to the frontend.  
- [ ] Awam Victor and Chimdinma Kalu will add a feature to filter the registration pipeline and user management lists by status (e.g., pending accounts).  
- [ ] Awam Victor and Chimdinma Kalu will update the list display for commercial users and partners to show the company name as the preference.  
- [ ] Awam Victor and Chimdinma Kalu will fix the issue with the upload endpoint for partner invoice submission and Awam Victor will check the error item for invoice submission.  
- [ ] Awam Victor and Chimdinma Kalu will fix the green area in the payout view to be smaller and include corporate information for commercial users and partners.  
- [ ] Awam Victor and Chimdinma Kalu will update the partner payout processing view to look more like the commercial side's invoice list.  
- [ ] Awam Victor and Chimdinma Kalu will clean up the revenue wallet display for commercial and partner payouts, using 'revenue' or 'total earnings' and 'available balance', and remove the 'held amount'.  
- [ ] Awam Victor and Chimdinma Kalu will update the wreck reporting view by (1) changing the label 'generation' to 'commercial wreck sales' and (2) removing the 'address' and 'status' columns from the partner performance table and adding 'company name' and 'Rex generated'.  
- [ ] Awam Victor and Chimdinma Kalu will update the commercial wreck generation list to show an aggregate view and move the detailed monthly facility records to the facility details in user management.  
- [ ] Awam Victor and Chimdinma Kalu will remove VAT from the partner invoice submission page.  
- [ ] Awam Victor will record the video by tomorrow.  
- [ ] Chimdinma Kalu will check out and resolve the HTTPS invalid certificate error on the corporate website.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=lhfynpFZa2lA3arguDa_DxIQOAIIigIgABgDCA&detailid=standard)*