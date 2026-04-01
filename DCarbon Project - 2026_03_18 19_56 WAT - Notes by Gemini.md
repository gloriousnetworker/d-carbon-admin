Mar 18, 2026

## DCarbon Project

Invited [Francis Awe](mailto:awefrancolaz@gmail.com) [Chimdinma Kalu](mailto:chimdinma.kalu@tenyne.com) [Himanshu Shukla](mailto:h@dcarbon.solutions) [Himanshu Shukla](mailto:himanshu.shukla@tenyne.com) [phillip.kopp.sd](mailto:phillip.kopp.sd@gmail.com) [Nwachukwu Uba](mailto:uba.nwachukwu@tenyne.com) [Austin Chibuike](mailto:austin.chibuike@tenyne.com) [Glorious Udofot](mailto:iniubongudofot2000@gmail.com) [Francis Awe](mailto:francis.awe@tenyne.com) [Victor Awam](mailto:awamaaronvictor@gmail.com) [ayoworkplace@gmail.com](mailto:ayoworkplace@gmail.com) [sogah685@gmail.com](mailto:sogah685@gmail.com) [Shepherd.praise.onoja@gmail.com](mailto:shepherd.praise.onoja@gmail.com)

Attachments [DCarbon Project](https://www.google.com/calendar/event?eid=amI4aDFmMmtzcnM4aHA5a3M2Nm9jdnBkc3NfMjAyNjAzMThUMTkwMDAwWiBjaGltZGlubWEua2FsdUB0ZW55bmUuY29t) [DCarbon Project - 2025/11/28 19:55 WAT - Recording](https://drive.google.com/file/d/13lRbOOrPnaWcH7REk2KL_qNXJwPUgFQ8/view?usp=drive_web) [DCarbon Project - 2025/11/28 19:55 WAT - Chat](https://drive.google.com/file/d/1vkcLcQczZ0CLopaJMQAyPi3cby7GIYZZ/view?usp=drive_web) [Notes by Gemini](https://docs.google.com/document/d/1xW7IPPIpXz5DQB_0iBv7KE30Hx4_LoRLsFHDZQr6sg4/edit?usp=meet_tnfm_calendar) [Notes by Gemini](https://docs.google.com/document/d/1qzqeV4MfFrQjD4gkOGWMMxazE7LIzG_FMCH4zLwDE3c/edit?usp=meet_tnfm_calendar) 

Meeting records [Recording](https://drive.google.com/file/d/1dNpiRuDHN88t8H4big4VeSW5dPfJaRCJ/view?usp=drive_web) 

### Summary

Testing progress revealed persistent back-end display issues requiring rework, with a focus on data restoration and defining a go-live date.

**Back-End Updates and Testing**  
Testing began with back-end server changes implemented just prior to the meeting, though front-end updates were limited due to a processing limit reset on March 28th. Awam Victor reported on resolved and remaining issues, noting that the primary unfixed bugs were related to data retrieval discrepancies between 2 different endpoints.

**Data Display Issues Identified**  
Multiple display issues were noted across the registration pipeline, payouts, and statement pages where necessary personal and business details were incorrectly stripped out or missing. The primary decision was made to restore all previously existing data, including the business name, to all relevant statement and payout screens.

**Reporting and Go-Live Planning**  
The group requested a revamp of the reporting page logic, specifically connecting the submit invoice function to the earnings statement table for accurate payout tracking. Chimdinma Kalu stressed the immediate need for a tentative go-live date to structure the remaining work, which will be provided after an internal audit with Philip and Corbin.

### Details

* **Testing Progress and Back-End Updates**: Awam Victor reported starting queuing and testing by 12 noon, including distance changes and a quick exploratory test, submitting a report on their findings. Udofot (tsx) informed the group that they had made changes to the server and back-end just minutes ago, but Udofot (tsx) was currently making changes to the soft front end and ran into a limit that is set to reset on March 28th at 9 a.m. Udofot (tsx) had previously sent a message that failed to go through, and Awam Victor noted that they had not spoken to Udofot (tsx) that day about resolving issues.

* **Partially Resolved Issues and Remaining Bugs**: Awam Victor confirmed that some parts of the work were resolved, but certain issues remained unfixed, which were not attributed to Claude's fault. The remaining issues included problems with retrieving the business or company name due to a discrepancy between two different endpoints, where the list page uses an endpoint that returns only main customer details instead of the commercial customer endpoint needed for company names. Additionally, for residential payout bonus requests, the extra padding on the display details page was not reduced, and the fields for amount held and total commission were still displayed.

* **Issue with Invited State and Registration Pipeline**: Awam Victor noted that the endpoint for "invited" is essentially a referral endpoint, but the registration pipeline does not process what to do with the invite status. If a user is checked as "invited," they currently do not appear on the list, and Awam Victor suggested that the "invited" state filter might be removed because it is confusing if they are not using it.

* **Task Breakdown and Development Process**: Udofot (tsx) explained that the overall task was segmented into three parts: one for the server (back-end), one for the admin, and one for the front-end (decarbon). Udofot (tsx) clarified that they worked on all three segments, focusing first on server fixes, then applying those back-end updates to the front-end and the admin sections, documenting all fixes.

* **Summary of Remaining Minor Fixes**: Awam Victor reported that most requested fixes from the last meeting had been implemented, but a few were incomplete, requiring only minor changes. The primary remaining issue is the complete display of the company or business name details, and one case was observed where the residential payout still incorrectly showed the "amount held". These issues have been reported back to the developers for immediate resolution.

* **Demo and Registration Pipeline Display Issues**: During the demo of the registration pipeline, Awam Victor showed that filters were added for admins to filter by specific status. A major concern demonstrated was that the user "AK" should be displaying "AK B company" as their business name, but it was not displayed. Udofot (tsx) needs to change the implementation, as the page is currently using the \`get users\` endpoint instead of the endpoint that returns the business or company name.

* **Issues with Payouts Screen Data Display**: On the payouts screen for commercial partners and residential redemption, Awam Victor noted that not all personal details were being included, leading to a stripped-down display. Chimdinma Kalu emphasized that the intention was to add business details, not remove existing user details such as name and address. The consensus was that all previous data, including the business name, needed to be brought back, and the UI/UX might be improved by placing the data below the banking and pay details.

* **Residential and Commercial Statements Details Missing**: Awam Victor confirmed that the residential section was missed for implementation and needs to be updated with the necessary changes. The commercial statements suffer from the same problem where personal details were stripped out, leaving only the username and email, and all other details, including the business name, must be restored.

* **W Management Export Functionality and Rack History**: A change was made to W management by adding an export registration feature that creates an Excel document showing facility details. The "rack history" feature displays the rack generation data for a facility, but the user tested did not have any history. Himanshu Shukla suggested using the "Nicholas" facility, which has both forward and reverse rack data and is residential, to simulate the rack data and verify the feature.

* **Invoice Submission Bug Fix and Statement Page Review**: Awam Victor confirmed that a bug causing a server error during invoice submission was fixed. When the admin views the invoice review page, they see invoices pending approval, which they can approve. The feature to "submit invoice" was only built for the partner but should be available to commercial users as well.

* **Reworking Reporting and Earning Statement Logic**: Chimdinma Kalu requested a revamp of the reporting page statements, suggesting that the "submit invoice" function should connect to the earning statement table. The earnings statement should display what is due to the user based on commission or bonus, using a table format with facility ID, type, amount earned, quarter, and year. AWE FRANCIS OLAWUMI clarified that earnings are generated into a revenue wallet, which is separate from facility connection, and that invoices are generated from REXs.

* **Invoice Generation and Withdrawal Process Clarification**: A discussion was held on the process of withdrawal, where AWE FRANCIS OLAWUMI suggested that the revenue wallet holds combined earnings, and users would submit an invoice for a specific quarter's earnings they wish to withdraw from the total. The required update is to capture and record the particular invoice as part of the payout process for a specific quarter. This requires rework on both the back-end and front-end.

* **Need for Go-Live Date and Planning**: Chimdinma Kalu stressed the need for a tentative go-live date to properly plan the remaining work, which includes finishing the setup of the production environment, pushing changes, and making current updates. Himanshu Shukla agreed that a timeline would be helpful and stated that they would discuss the matter in detail with Philip and Corbin to conduct an internal audit and provide an update on a potential time frame by the following day.

### Suggested next steps

- [ ] Himanshu Shukla will discuss the go-live date in detail with Phillip and Corbin, conduct internal auditing, and update the group on the proposed time frame by tomorrow maximum.  
- [ ] Awam Victor will look for a user with a facility that has reverse REC data to simulate the REC history functionality on the facility details page.

*You should review Gemini's notes to make sure they're accurate. [Get tips and learn how Gemini takes notes](https://support.google.com/meet/answer/14754931)*

*Please provide feedback about using Gemini to take notes in a [short survey.](https://google.qualtrics.com/jfe/form/SV_9vK3UZEaIQKKE7A?confid=ADDg-P5Lq1c9fpR6qdGCDxIQOAIIigIgABgDCA&detailid=standard)*