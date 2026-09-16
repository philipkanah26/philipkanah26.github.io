/* ============================================================
   The transaction spine: four phases, fifteen steps, checkpoints.
   Every checkpoint carries
     owner      who acts ('You' is the buyer)
     confirmer  who can mark it confirmed
     status     {stageKey: [bucket, text]}; bucket is you | team | confirmed | attention;
                the latest entry at or before the current stage applies; none = not started
     action     label of the primary button when this checkpoint is next (string or {stageKey: label})
     detail     the line under it (string or {stageKey: text})
     opens      the route the button opens (string or {stageKey: route})
     date       the date that matters (string or {stageKey: text})
     source     where that date comes from (string or {stageKey: text})
     changes    optional amendment history [{field, old, new, reason, approver, at}]
   Steps from Deposit to Signing are gates (gate:true) and carry a control line.
   Stage keys are listed in stages.js. Spec: Kanah-Transaction-Spine-Spec.md §3 and §7.
   ============================================================ */
const SPINE = {
  phases: [
    { id:'search', label:'Search and offer', steps:['ready','home','offer'] },
    { id:'contract', label:'Under contract', steps:['deposit','inspection','appraisal','financing','insurance','title','ctc'] },
    { id:'closing', label:'Closing', steps:['cd','funds','walkthrough','signing'] },
    { id:'keys', label:'Keys', steps:['keys'] }
  ],
  steps: [
    { id:'ready', label:'Ready', gate:false, screens:['B01','B17'], checkpoints:[
      { id:'ready.join', label:'Joined your space', owner:'You', confirmer:'Kanah, on verified identity', opens:'team',
        status:{ home_ready:['confirmed','Joined Sun Oct 5 · identity verified'] } },
      { id:'ready.route', label:'Financing route', owner:'You', confirmer:'You', opens:'home',
        status:{ home_ready:['confirmed','I need a lender · chosen Oct 5'] } },
      { id:'ready.lender', label:'Lender connected', owner:'Jordan Whitfield', confirmer:'Jordan accepts the introduction', opens:'team',
        action:'View invitation', detail:'Jordan Whitfield has been invited to respond as your lender.', date:'Sun Oct 5, 4:22 PM ET', source:'Invitation record',
        status:{ home_ready:['team','Invited · waiting for Jordan to respond'], lender_request:['confirmed','Accepted Wed Oct 8'] } },
      { id:'ready.readiness', label:'Readiness on record', owner:'You', confirmer:'Lakeshore Mortgage', opens:'home',
        action:'Open secure application', detail:'Opens Lakeshore Mortgage’s secure application. You’ll come back to this task.', date:'Fri Oct 10', source:'Jordan Whitfield · financing channel',
        status:{ lender_request:['you','Complete your application with Lakeshore Mortgage'], preapproved:['confirmed','“Pre-approved” · issued Oct 12 · expires Jan 10, 2027'] } },
      { id:'ready.review', label:'Reviewed your letter', owner:'You', confirmer:'You', opens:'doc/preapproval',
        action:'Review update', detail:'Lakeshore Mortgage’s letter, in their words, with the expiry they set.', date:{ preapproved:'Sun Jan 10, 2027', searching:'Sun Oct 12' }, source:'Lender letter · lender-confirmed · expiry set by the lender',
        status:{ preapproved:['you','Review Lakeshore Mortgage’s letter and its one condition'], searching:['confirmed','Reviewed Oct 12'] } }
    ]},
    { id:'home', label:'Home', gate:false, screens:['B18','B23'], checkpoints:[
      { id:'home.prefs', label:'Preferences saved', owner:'You', confirmer:'You', opens:'homes',
        action:'Add your search preferences', detail:'Tell Maya your preferred area, price range and must-haves. You can change these anytime.', date:'Whenever you’re ready', source:'Private to you and Maya',
        status:{ home_ready:['you','Tell Maya your area, price range and must-haves'], searching:['confirmed','Saved Wed Oct 15 · private to you and Maya'] } },
      { id:'home.saved', label:'Homes saved', owner:'You and Maya', confirmer:'You', opens:'homes',
        status:{ searching:['confirmed','3 homes saved · Willow Ridge shared by Maya'] } },
      { id:'home.tour', label:'Tour', owner:'Maya Chen', confirmer:'The listing side confirms access', opens:'home',
        action:{ searching:'Ask about a tour', tour_confirmed:'Add to calendar' },
        detail:{ searching:'1847 Willow Ridge Dr · Maya will confirm availability and any next steps.', tour_confirmed:'Reschedule or cancel from the appointment.' },
        date:{ searching:'Requested for Friday', tour_confirmed:'Fri Oct 17, 10:30 AM ET' }, source:{ searching:'Tour request · pending', tour_confirmed:'Confirmed by the listing side' },
        status:{ searching:['you','Ask Maya about a tour of 1847 Willow Ridge Dr'], tour_confirmed:['team','Confirmed Fri Oct 17, 10:30 AM ET · meet Maya at the front door'], toured:['confirmed','Toured Fri Oct 17'] } },
      { id:'home.decide', label:'Decision to offer', owner:'You', confirmer:'You', opens:'offer',
        action:'I want to make an offer', detail:'Starts a private offer draft with Maya. Nothing is sent.', date:'Fri Oct 17, 1:15 PM ET', source:'Private note to Maya',
        status:{ toured:['you','Tell Maya how the home felt, then decide'], offer_drafting:['confirmed','Decided Fri Oct 17 · offer in preparation'] } }
    ]},
    { id:'offer', label:'Offer', gate:false, screens:['B24','B30'], checkpoints:[
      { id:'offer.terms', label:'Terms drafted', owner:'You and Maya', confirmer:'You', opens:'offer',
        action:'Review documents', detail:'Structured terms beside the actual documents. These terms are not sent yet.', date:'Wed Oct 22, 5:00 PM ET', source:'Offer expiration you’ll propose · draft terms',
        status:{ offer_drafting:['you','Review price, deposit, financing, contingencies and dates'], offer_signing:['confirmed','Drafted Sun Oct 19 · $478,000'] } },
      { id:'offer.sign', label:'Signatures', owner:'You and Sam', confirmer:'E-sign completion', opens:'offer',
        action:'Review and sign', detail:'Read each document carefully. Maya can answer questions before you sign.', date:'Mon Oct 20', source:'Offer v1 · e-sign',
        status:{ offer_signing:['you','Sign offer v1 · Sam signs after you'], offer_ready:['confirmed','Signed Mon Oct 20 · Alex 11:02 AM, Sam 1:48 PM'] } },
      { id:'offer.send', label:'Authorized and sent', owner:'You authorize, Maya sends', confirmer:'Delivery evidence', opens:'offer',
        action:'Authorize submission', detail:'Maya sends exactly this version to the recipients listed. Nothing sends on its own.', date:'Wed Oct 22, 5:00 PM ET', source:'Offer v1 §12',
        status:{ offer_ready:['you','Authorize the exact version and the recipients'], offer_submitted:['confirmed','Sent by Maya Mon Oct 20, 2:05 PM ET · v1 · hash a3f9…c21e'] } },
      { id:'offer.ack', label:'Acknowledged', owner:'Daniel Reyes', confirmer:'Delivery evidence', opens:'offer',
        status:{ offer_submitted:['confirmed','Delivered 2:05 PM · opened 3:42 PM · acknowledged 4:10 PM'] } },
      { id:'offer.response', label:'Seller response', owner:'Seller’s side', confirmer:'Offer record', opens:'offer',
        action:{ offer_submitted:'View offer', counteroffer:'Accept and sign' },
        detail:{ offer_submitted:'The immutable version that was sent, and who received it.', counteroffer:'Or discuss, counter, or decline with Maya first.' },
        date:{ offer_submitted:'Wed Oct 22, 5:00 PM ET', counteroffer:'Thu Oct 23, 5:00 PM ET' }, source:{ offer_submitted:'Offer v1 §12', counteroffer:'Counteroffer v2 §12' },
        status:{ offer_submitted:['team','Response pending · offer expires Wed Oct 22, 5:00 PM ET'], counteroffer:['you','Counteroffer v2 received · decide by Thu Oct 23, 5:00 PM ET'], under_contract:['confirmed','Accepted Wed Oct 22'] } },
      { id:'offer.executed', label:'Executed', owner:'Maya Chen', confirmer:'Professional confirmation of the effective date', opens:'doc/executed_agreement',
        date:'Wed Oct 22',
        status:{ under_contract:['confirmed','Effective Wed Oct 22 · dates confirmed by Maya Chen'] } }
    ]},
    { id:'deposit', label:'Deposit', gate:true, screens:['B32','B33'],
      control:'Due within 3 days of acceptance, agreement §4. If it is not received, the seller can treat the agreement as in default. Elena confirms receipt.', checkpoints:[
      { id:'deposit.verify', label:'Instructions verified', owner:'You, with Elena', confirmer:'Great Lakes Title', opens:'doc/earnest_instructions',
        status:{ under_contract:['confirmed','Verified Wed Oct 22 by trusted-contact call'] } },
      { id:'deposit.sent', label:'Sent', owner:'You', confirmer:'You report it', opens:'money',
        action:'View verified payment steps', detail:'Follow the verified process from Great Lakes Title. Never send funds from an emailed change.', date:'Sat Oct 25, 5:00 PM ET', source:'Purchase agreement §4 · confirmed by Maya Chen',
        status:{ under_contract:['you','Due Sat Oct 25, 5:00 PM ET · $5,000 to Great Lakes Title'], inspection_scheduled:['confirmed','Sent Fri Oct 24 · reported by you'] } },
      { id:'deposit.received', label:'Received', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'money',
        date:'Fri Oct 24, 3:12 PM',
        status:{ inspection_scheduled:['confirmed','Received Fri Oct 24, 3:12 PM · confirmed by Great Lakes Title'] } }
    ]},
    { id:'inspection', label:'Inspection', gate:true, screens:['B34','B37'],
      control:'Until Sun Nov 2, agreement §7, you can accept the home, ask for repairs or a credit, or withdraw with your deposit returned. After that the contingency is waived. Maya confirms the specifics.', checkpoints:[
      { id:'inspection.choose', label:'Choose inspector', owner:'You', confirmer:'You', opens:'team',
        action:'Choose an inspector', detail:'Your inspection deadline is Sun Nov 2. No order is placed until you approve scope and fee.', date:'Sun Nov 2, 11:59 PM ET', source:'Purchase agreement §7 · confirmed by Maya Chen',
        status:{ under_contract:['you','Scope, price and availability · no order until you approve'], inspection_scheduled:['confirmed','Marcus Bell · accepted Fri Oct 24 · $495'] } },
      { id:'inspection.scheduled', label:'Scheduled', owner:'Marcus Bell, with the listing side', confirmer:'Inspector and listing side', opens:'timeline',
        status:{ inspection_scheduled:['confirmed','Tue Oct 28, 9:00 AM ET · access confirmed by the listing side'] } },
      { id:'inspection.inspected', label:'Inspected', owner:'Marcus Bell', confirmer:'Marcus Bell', opens:'timeline',
        action:'View appointment', detail:'Scope, fee and access are confirmed.', date:'Tue Oct 28, 9:00 AM ET', source:'Confirmed by inspector and listing side',
        status:{ inspection_scheduled:['team','Tue Oct 28, 9:00 AM ET · Maya will be there'], inspection_report:['confirmed','Inspected Tue Oct 28, 9:00–12:15'] } },
      { id:'inspection.report', label:'Report', owner:'Marcus Bell', confirmer:'Marcus Bell', opens:'doc/inspection_report',
        status:{ inspection_report:['confirmed','Delivered Wed Oct 29 · 4 findings · 4 photos'] } },
      { id:'inspection.decide', label:'Decision', owner:'You, with Maya', confirmer:'You', opens:'doc/inspection_report',
        action:'Review request with Maya', detail:'Turn your priorities into a request for the seller.', date:'Sun Nov 2, 11:59 PM ET', source:'Purchase agreement §7 · confirmed by Maya Chen',
        status:{ inspection_report:['you','Accept, ask for repairs or a credit, or withdraw · by Sun Nov 2'], in_diligence:['confirmed','Credit requested Thu Oct 30 · $3,500'] } },
      { id:'inspection.amend', label:'Amendment', owner:'Maya Chen and the seller’s side', confirmer:'Signatures of every party', opens:'doc/repair_amendment',
        date:'Sun Nov 2',
        status:{ in_diligence:['confirmed','Amendment 1 signed Sun Nov 2 · $3,500 seller credit at closing'] },
        changes:[ { field:'Seller credit at closing', old:'$0', new:'$3,500', reason:'Roof flashing and water heater findings', approver:'Maya Chen (buyer side) · Daniel Reyes (seller side)', at:'Sun Nov 2, 3:20 PM ET' } ] }
    ]},
    { id:'appraisal', label:'Appraisal', gate:true, screens:['B41','B41'],
      control:'If the appraisal comes in below the price, your lender can only lend against the appraised value. Options are to renegotiate, cover the difference, or withdraw under the appraisal contingency. Jordan and Maya confirm which apply.', checkpoints:[
      { id:'appraisal.ordered', label:'Ordered', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'team',
        status:{ inspection_report:['team','Jordan is ordering through Lakeshore’s process'], in_diligence:['confirmed','Ordered Mon Nov 3 · lender-ordered'] } },
      { id:'appraisal.scheduled', label:'Scheduled', owner:'Jordan Whitfield, Maya for access', confirmer:'Lender and access coordinator', opens:'timeline',
        action:'View appraisal status', detail:'Lender-ordered. Maya coordinates access only.', date:'Fri Nov 14', source:'Lakeshore Mortgage · lender-ordered',
        status:{ in_diligence:['team','Fri Nov 14 · access coordinated by Maya'], clear_to_close:['confirmed','Fri Nov 14'] } },
      { id:'appraisal.completed', label:'Completed', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'doc/appraisal',
        status:{ clear_to_close:['confirmed','Reported Thu Nov 20'] } },
      { id:'appraisal.value', label:'Value against price', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'doc/appraisal',
        date:'Thu Nov 20',
        status:{ clear_to_close:['confirmed','Appraised at $482,000 · at contract price'] } }
    ]},
    { id:'financing', label:'Financing', gate:true, screens:['B38','B39'],
      control:'Your lender must issue a commitment by Mon Nov 24, agreement §5. If financing is denied, the contingency lets you withdraw with your deposit; if it runs late, the date moves by amendment. Maya confirms the specifics.', checkpoints:[
      { id:'financing.application', label:'Application', owner:'You', confirmer:'Lakeshore Mortgage', opens:'home',
        status:{ preapproved:['confirmed','Completed Fri Oct 10'] } },
      { id:'financing.estimate', label:'Loan Estimate', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'doc/loan_estimate',
        status:{ under_contract:['team','After the executed agreement reaches Jordan'], in_diligence:['confirmed','Received Mon Nov 3 · 30-year fixed 6.125%'] } },
      { id:'financing.lock', label:'Rate lock', owner:'You, with Jordan', confirmer:'Lakeshore Mortgage', opens:'doc/loan_estimate',
        action:'Review loan options', detail:'Compare your Loan Estimate and confirm your choice with Jordan. Nothing locks until you say so.', date:'Mon Nov 10', source:'Loan Estimate · Lakeshore Mortgage, Nov 3',
        status:{ in_diligence:['you','Compare your Loan Estimate and confirm with Jordan · lock by Mon Nov 10'], clear_to_close:['confirmed','Locked Mon Nov 10 · 6.125%'] } },
      { id:'financing.conditions', label:'Conditions', owner:'Jordan Whitfield, you supply items', confirmer:'Lakeshore Mortgage', opens:'messages/jordan',
        status:{ in_diligence:['team','Employment verification before closing'], clear_to_close:['confirmed','Cleared Fri Nov 21'] } },
      { id:'financing.commitment', label:'Commitment', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'timeline',
        date:'Mon Nov 24', source:'Purchase agreement §5 · lender target',
        status:{ in_diligence:['team','Target Mon Nov 24 · not yet confirmed'], clear_to_close:['confirmed','Issued Fri Nov 21'] } }
    ]},
    { id:'insurance', label:'Insurance', gate:true, screens:['B40','B40'],
      control:'Your lender requires proof of insurance before closing. If the home cannot be insured at an acceptable cost, tell Maya early; it can stop the loan.', checkpoints:[
      { id:'insurance.quote', label:'Quote', owner:'Nora Lindqvist', confirmer:'Mitten Mutual Insurance', opens:'doc/insurance_binder',
        status:{ in_diligence:['confirmed','Quote received Wed Nov 5 · $1,640/year'] } },
      { id:'insurance.bound', label:'Bound', owner:'You', confirmer:'Mitten Mutual Insurance', opens:'doc/insurance_binder',
        action:'Arrange homeowners insurance', detail:'Nora’s quote is in. Confirm coverage and effective date with your lender.', date:'Mon Dec 1', source:'Lender requirement · before clear to close',
        status:{ in_diligence:['you','Confirm coverage and effective date · bind by Mon Dec 1'], clear_to_close:['confirmed','Bound Wed Dec 3 · effective Dec 12'] } },
      { id:'insurance.evidence', label:'Evidence delivered', owner:'Nora Lindqvist', confirmer:'Lender and title receive it', opens:'doc/insurance_binder',
        date:'Mon Dec 1',
        status:{ clear_to_close:['confirmed','Delivered to Lakeshore Mortgage and Great Lakes Title'] } }
    ]},
    { id:'title', label:'Title', gate:true, screens:['B42','B42'],
      control:'Great Lakes Title must deliver clear title. Liens or defects have to be cured before closing, or the date moves. Elena explains any exception.', checkpoints:[
      { id:'title.order', label:'Order accepted', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'team',
        status:{ under_contract:['confirmed','Accepted Wed Oct 22 · deposit instructions verified'] } },
      { id:'title.commitment', label:'Commitment', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'timeline',
        action:'View title status', detail:'Elena Vasquez is running the search.', date:'Mon Nov 24', source:'Great Lakes Title · target',
        status:{ under_contract:['team','Search in progress · target Mon Nov 24'], clear_to_close:['confirmed','Issued Mon Nov 24 · 2 standard exceptions'] } },
      { id:'title.exceptions', label:'Exceptions reviewed', owner:'Elena Vasquez, with you and Maya', confirmer:'Great Lakes Title', opens:'doc/title_commitment',
        status:{ clear_to_close:['confirmed','Utility easement and subdivision covenants · nothing to clear'] } },
      { id:'title.payoffs', label:'Payoffs', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'timeline',
        status:{ clear_to_close:['team','Seller’s mortgage payoff requested'], closing_scheduled:['confirmed','Payoff statement received Tue Dec 9'] } },
      { id:'title.cleared', label:'Cleared', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'doc/title_commitment',
        date:'Mon Nov 24',
        status:{ clear_to_close:['confirmed','Cleared Mon Nov 24 · nothing to fix'] } }
    ]},
    { id:'ctc', label:'Clear to close', gate:true, screens:['B41','B42'],
      control:'Your lender confirms every condition is met. Nothing about closing is scheduled until this is confirmed.', checkpoints:[
      { id:'ctc.confirm', label:'Lender confirms every condition', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'timeline',
        date:'Thu Dec 4', source:'Lender and title confirmations',
        status:{ clear_to_close:['confirmed','Confirmed Thu Dec 4 · lender and title'] } }
    ]},
    { id:'cd', label:'Closing Disclosure', gate:true, screens:['B43','B43'],
      control:'Federal rules require three business days between receiving it and signing. Changes to it can restart the clock. Lakeshore Mortgage keeps the official record.', checkpoints:[
      { id:'cd.delivered', label:'Delivered', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'doc/closing_disclosure',
        status:{ clear_to_close:['confirmed','Delivered Mon Dec 8'] } },
      { id:'cd.received', label:'Received', owner:'You', confirmer:'You acknowledge receipt', opens:'doc/closing_disclosure',
        action:'Review Closing Disclosure', detail:'The authoritative version from Lakeshore Mortgage. Acknowledging receipt is not approving every figure.', date:'Thu Dec 11', source:'Lender record · waiting period ends three business days after receipt',
        status:{ clear_to_close:['you','Review the Closing Disclosure and acknowledge receipt'], closing_scheduled:['confirmed','Received Mon Dec 8 · acknowledged'] } },
      { id:'cd.wait', label:'Waiting period satisfied', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'timeline',
        date:'Thu Dec 11', source:'Lender record · authoritative',
        status:{ clear_to_close:['team','Ends Thu Dec 11 · three business days after receipt'], closing_scheduled:['confirmed','Satisfied Thu Dec 11'] } }
    ]},
    { id:'funds', label:'Funds', gate:true, screens:['B44','B44'],
      control:'Wire by Thu Dec 11, 2:00 PM, using instructions you verified by phone with Elena. A late wire delays closing; a wrong one cannot be recalled.', checkpoints:[
      { id:'funds.verify', label:'Verified by phone', owner:'You, with Elena', confirmer:'Great Lakes Title', opens:'doc/closing_funds',
        status:{ closing_scheduled:['confirmed','Verified Tue Dec 9 by phone with Elena Vasquez'] } },
      { id:'funds.sent', label:'Wire sent', owner:'You', confirmer:'You report it', opens:'money',
        action:'View verified next steps', detail:'Confirm instructions with Elena using the number you already have. Any change restarts verification.', date:'Thu Dec 11, 2:00 PM ET', source:'Great Lakes Title · verified Dec 9',
        status:{ closing_scheduled:['you','Wire $96,812.18 by Thu Dec 11, 2:00 PM ET'], signed:['confirmed','Sent Thu Dec 11 · reported by you'] } },
      { id:'funds.received', label:'Received', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'money',
        date:'Thu Dec 11',
        status:{ signed:['confirmed','Received Thu Dec 11 · confirmed by Great Lakes Title'] } }
    ]},
    { id:'walkthrough', label:'Walkthrough', gate:true, screens:['B45','B45'],
      control:'Check the condition and the agreed items. Anything found here is resolved before signing, not after. Maya raises it.', checkpoints:[
      { id:'walkthrough.scheduled', label:'Scheduled', owner:'Maya Chen, with the listing side', confirmer:'Both sides', opens:'doc/walkthrough',
        status:{ closing_scheduled:['confirmed','Thu Dec 11, 4:00 PM ET · scheduled with the listing side'] } },
      { id:'walkthrough.completed', label:'Completed', owner:'You and Maya', confirmer:'You', opens:'doc/walkthrough',
        action:'Open the checklist', detail:'Check condition and the agreed items with Maya.', date:'Thu Dec 11, 4:00 PM ET', source:'Scheduled with the listing side',
        status:{ closing_scheduled:['you','Thu Dec 11, 4:00 PM ET · check condition and the credit items'], signed:['confirmed','Completed Thu Dec 11 · no issues'] } },
      { id:'walkthrough.issues', label:'Issues resolved', owner:'Maya Chen', confirmer:'Maya Chen', opens:'doc/walkthrough',
        date:'Thu Dec 11',
        status:{ signed:['confirmed','None found'] } }
    ]},
    { id:'signing', label:'Signing', gate:true, screens:['B46','B47'],
      control:'Signing completes your part. It is not the end: funding, recording and possession are confirmed separately.', checkpoints:[
      { id:'signing.appointment', label:'Appointment', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'timeline',
        action:'View appointment', detail:'Bring government ID.', date:'Fri Dec 12, 9:00 AM ET', source:'Confirmed by Great Lakes Title',
        status:{ closing_scheduled:['confirmed','Fri Dec 12, 9:00 AM ET · Great Lakes Title, 2723 S State St'] } },
      { id:'signing.signed', label:'Signed', owner:'You and Sam', confirmer:'Great Lakes Title', opens:'doc/signed_package',
        date:'Fri Dec 12, 9:40 AM',
        status:{ signed:['confirmed','Signed Fri Dec 12, 9:40 AM'] } }
    ]},
    { id:'keys', label:'Keys', gate:false, screens:['B48','B49'], checkpoints:[
      { id:'keys.funded', label:'Funded', owner:'Jordan Whitfield', confirmer:'Lakeshore Mortgage', opens:'timeline',
        action:'View closing status', detail:'Funding, recording, disbursement and possession are confirmed separately.', date:'Fri Dec 12', source:'Lender confirms funding',
        status:{ signed:['team','Funding is with Lakeshore Mortgage · pending'], possession:['confirmed','Funded 1:20 PM'] } },
      { id:'keys.recorded', label:'Recorded', owner:'Elena Vasquez', confirmer:'Washtenaw County recording reference', opens:'doc/deed',
        status:{ signed:['team','Follows funding · Washtenaw County'], possession:['confirmed','Recorded 2:15 PM · Washtenaw County'] } },
      { id:'keys.disbursed', label:'Disbursed', owner:'Elena Vasquez', confirmer:'Great Lakes Title', opens:'timeline',
        status:{ signed:['team','Follows recording'], possession:['confirmed','Disbursed 3:05 PM'] } },
      { id:'keys.possession', label:'Possession authorized', owner:'Elena Vasquez', confirmer:'Great Lakes Title, per the agreement', opens:'doc/possession_note',
        status:{ signed:['team','Never inferred from signing'], possession:['confirmed','Authorized for 5:00 PM'] } },
      { id:'keys.handoff', label:'Keys handed over', owner:'Maya Chen', confirmer:'Maya Chen', opens:'home',
        action:'View key handoff', detail:'Where, when and with whom.', date:'Fri Dec 12, 5:00 PM ET', source:'Possession per agreement · confirmed by Great Lakes Title',
        status:{ possession:['team','Maya meets you at the house at 5:00 PM'], archive:['confirmed','Keys Fri Dec 12, 5:00 PM'] } }
    ]}
  ]
};
