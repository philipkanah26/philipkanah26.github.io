/* ============================================================
   The world. Every item that appears over time carries
     from:   the stage key it first appears at
     until:  (optional) the stage key at which it disappears
     status: {stageKey: text} — the latest entry at or before the current stage is shown
   Stage keys are listed in stages.js.
   ============================================================ */
const WORLD = {};

WORLD.buyer = { id:'alex', name:'Alex Morgan', first:'Alex', email:'a•••••n@gmail.com', phone:'(734) •••-4412', img:'assets/people/alex.jpg' };

WORLD.people = [
  { id:'sam', name:'Sam Okafor', role:'Co-buyer', org:'', side:'buyer', from:'home_ready', img:'assets/people/sam.jpg', phone:'(734) 555-0187',
    status:{ home_ready:'Invited as co-buyer · not yet accepted', lender_request:'Accepted · signs for themselves', offer_signing:'Signature pending on offer v1', offer_ready:'Signed offer v1', under_contract:'Co-buyer and co-borrower', signed:'Signed the closing package', possession:'Co-owner' } },
  { id:'maya', name:'Maya Chen', role:'Your agent', org:'Huron Valley Realty', side:'buyer', from:'invited', img:'assets/people/maya.jpg', phone:'(734) 555-0142', email:'maya@huronvalleyrealty.example',
    status:{ invited:'Invited you to Kanah', home_ready:'Waiting for your search preferences', searching:'Arranging a tour of Willow Ridge', offer_drafting:'Drafting your offer with you', offer_submitted:'Tracking the seller’s response', under_contract:'Coordinating inspection and title', inspection_report:'Turning findings into a request', in_diligence:'Coordinating appraisal access', closing_scheduled:'Walkthrough Thu Dec 11, 4:00 PM', possession:'Meeting you with the keys at 5:00 PM', archive:'Reachable anytime' } },
  { id:'jordan', name:'Jordan Whitfield', role:'Loan officer', org:'Lakeshore Mortgage', side:'provider', from:'home_ready', img:'assets/people/jordan.jpg', phone:'(734) 555-0119', email:'jwhitfield@lakeshoremortgage.example',
    status:{ home_ready:'Invited · waiting to respond', lender_request:'Requested your application', preapproved:'Pre-approval issued Oct 12', offer_ready:'Letter attached to offer v1', under_contract:'Processing your loan', in_diligence:'Ordered the appraisal', clear_to_close:'Closing Disclosure delivered Dec 8', signed:'Confirming funding', possession:'Funded 1:20 PM' } },
  { id:'renee', name:'Renee Park', role:'Transaction coordinator', org:'Huron Valley Realty', side:'buyer', from:'under_contract', img:'assets/people/renee.jpg', phone:'(734) 555-0150',
    status:{ under_contract:'Validating contract dates', inspection_scheduled:'Published tasks to everyone', in_diligence:'Routed Amendment 1 for signatures', closing_scheduled:'Assembling the closing checklist', archive:'Archive complete' } },
  { id:'daniel', name:'Daniel Reyes', role:'Seller’s agent · not your representative', org:'Arbor Homes Realty', side:'seller', from:'offer_submitted', img:'assets/people/daniel.jpg', limited:true,
    status:{ offer_submitted:'Acknowledged your offer 4:10 PM', counteroffer:'Sent counteroffer v2', under_contract:'Coordinating seller obligations', signed:'Seller signed', possession:'Confirmed key handoff' } },
  { id:'elena', name:'Elena Vasquez', role:'Title and settlement officer', org:'Great Lakes Title', side:'neutral', from:'under_contract', img:'assets/people/elena.jpg', phone:'(734) 555-0163',
    status:{ under_contract:'Accepted the title order · verified deposit instructions', inspection_scheduled:'Confirmed your $5,000 deposit', clear_to_close:'Title commitment issued Nov 24', closing_scheduled:'Verified funds instructions by phone Dec 9', signed:'Confirming recording', possession:'Recorded 2:15 PM · disbursed 3:05 PM' } },
  { id:'marcus', name:'Marcus Bell', role:'Home inspector', org:'Bell Home Inspections', side:'provider', from:'inspection_scheduled', img:'assets/people/marcus.jpg', phone:'(734) 555-0171',
    status:{ inspection_scheduled:'Tue Oct 28, 9:00 AM', inspection_report:'Report delivered Oct 29', in_diligence:'Available for questions' } },
  { id:'nora', name:'Nora Lindqvist', role:'Insurance agent', org:'Mitten Mutual Insurance', side:'provider', from:'in_diligence', img:'assets/people/nora.jpg', phone:'(734) 555-0195',
    status:{ in_diligence:'Quote sent', clear_to_close:'Policy bound · effective Dec 12', possession:'Evidence delivered to lender and title' } }
];

WORLD.threads = [
  { id:'maya', title:'Maya Chen', scope:'Private · you, Sam and Maya', from:'invited', members:['alex','sam','maya'] },
  { id:'jordan', title:'Jordan Whitfield · financing', scope:'Financing channel · you, Sam and Lakeshore Mortgage. The room sees status only.', from:'home_ready', members:['alex','sam','jordan'] },
  { id:'closing', title:'1847 Willow Ridge · shared closing', scope:'Shared · both sides and your closing team. Created empty; nothing private is copied in.', from:'under_contract', members:['alex','sam','maya','renee','elena','jordan','daniel'] }
];

WORLD.property = {
  id:'willow', address:'1847 Willow Ridge Dr', city:'Ann Arbor, MI 48103', price:485000, beds:4, baths:2.5, sqft:2140, built:1994, lot:'0.31 acre',
  taxes:'$7,420 (2025)', hoa:'None', mls:'#24-118472', source:'MLS', synced:'Wed Oct 15, 6:00 AM ET',
  img:'assets/homes/willow-ridge.jpg', imgs:['assets/homes/willow-ridge.jpg','assets/homes/willow-ridge-living.jpg','assets/homes/willow-ridge-kitchen.jpg'],
  blurb:'Two-story colonial on a quiet cul-de-sac in the Lawton neighborhood. Updated kitchen (2019), original hardwood on the main floor, finished basement, two-car attached garage.'
};

WORLD.homes = [
  { id:'willow', address:'1847 Willow Ridge Dr', city:'Ann Arbor, MI 48103', price:485000, beds:4, baths:2.5, sqft:2140, built:1994, lot:'0.31 acre', img:'assets/homes/willow-ridge.jpg', imgs:WORLD.property.imgs, source:'MLS', synced:'Wed Oct 15, 6:00 AM ET', from:'searching',
    status:{ searching:'Saved · Maya shared this', tour_confirmed:'Tour Fri Oct 17, 10:30 AM', toured:'Toured Oct 17', offer_drafting:'Offer in preparation', offer_submitted:'Offer sent Oct 20', counteroffer:'Counteroffer received', under_contract:'Under contract · closing Dec 12', possession:'Yours' } },
  { id:'burns', address:'2210 Burns Park Ct', city:'Ann Arbor, MI 48104', price:529000, beds:3, baths:2, sqft:1880, built:1962, lot:'0.22 acre', img:'assets/homes/burns-park.jpg', source:'MLS', synced:'Wed Oct 15, 6:00 AM ET', from:'searching',
    status:{ searching:'Saved', offer_drafting:'Saved · not pursuing' } },
  { id:'miller', address:'905 Miller Ave', city:'Ann Arbor, MI 48103', price:459000, beds:3, baths:1.5, sqft:1650, built:1951, lot:'0.15 acre', img:'assets/homes/miller-ave.jpg', source:'MLS', synced:'Wed Oct 15, 6:00 AM ET', from:'searching', unavailableFrom:'offer_drafting',
    status:{ searching:'Saved', offer_drafting:'This home’s availability changed' } }
];

/* ---------- Inspectors and availability (alignment spec §7.2). Ratings are shown as Google publishes them. ---------- */
WORLD.inspectors = [
  { id:'marcus', name:'Marcus Bell', org:'Bell Home Inspections', rating:'4.9', reviews:128, price:'$495', img:'assets/people/marcus.jpg', recommended:true },
  { id:'priya', name:'Priya Raman', org:'Huron Home Inspection', rating:'4.8', reviews:96, price:'$450', initials:'PR' },
  { id:'tom', name:'Tom Kowalski', org:'Great Lakes Inspection Co', rating:'4.9', reviews:212, price:'$520', initials:'TK' }
];
WORLD.slots = {
  days: [ { day:'Mon', date:'Oct 27', slots:2 }, { day:'Tue', date:'Oct 28', slots:5, selected:true }, { day:'Wed', date:'Oct 29', slots:3 }, { day:'Thu', date:'Oct 30', slots:4 }, { day:'Fri', date:'Oct 31', slots:5 } ],
  times: [ { t:'8:00 AM' }, { t:'9:00 AM', selected:true }, { t:'11:00 AM' }, { t:'1:00 PM' }, { t:'3:00 PM' } ]
};

/* Every image the mock uses, with its alt text. Generated in Task 8. */
WORLD.images = {
  'assets/people/alex.jpg':'Alex Morgan, the buyer', 'assets/people/sam.jpg':'Sam Okafor, co-buyer', 'assets/people/maya.jpg':'Maya Chen, buyer’s agent, Huron Valley Realty',
  'assets/people/jordan.jpg':'Jordan Whitfield, loan officer, Lakeshore Mortgage', 'assets/people/renee.jpg':'Renee Park, transaction coordinator', 'assets/people/daniel.jpg':'Daniel Reyes, listing agent, Arbor Homes Realty',
  'assets/people/elena.jpg':'Elena Vasquez, title officer, Great Lakes Title', 'assets/people/marcus.jpg':'Marcus Bell, home inspector', 'assets/people/nora.jpg':'Nora Lindqvist, insurance agent',
  'assets/homes/willow-ridge.jpg':'1847 Willow Ridge Dr, a two-story colonial with mature trees', 'assets/homes/willow-ridge-living.jpg':'Living room at 1847 Willow Ridge Dr', 'assets/homes/willow-ridge-kitchen.jpg':'Kitchen at 1847 Willow Ridge Dr',
  'assets/homes/burns-park.jpg':'2210 Burns Park Ct, a mid-century brick ranch', 'assets/homes/miller-ave.jpg':'905 Miller Ave, a 1950s cape cod',
  'assets/inspection/roof-flashing.jpg':'Lifted step flashing at the chimney', 'assets/inspection/water-heater.jpg':'Tank water heater in the basement utility corner, 14 years old',
  'assets/inspection/outlet.jpg':'Outlet tester showing an open ground in the hall bathroom', 'assets/inspection/basement-crack.jpg':'Hairline vertical crack in the poured basement wall'
};


/* ---------- Messages: three scoped threads ---------- */
WORLD.messages = [
  { thread:'maya', from:'maya', at:'Sun Oct 5, 3:58 PM', stage:'invited', text:'Hi Alex, here’s your homebuying space with me. You can add your lender or ask me for an introduction, keep the homes you like together, and see what comes next.' },
  { thread:'maya', from:'alex', at:'Sun Oct 5, 4:12 PM', stage:'home_ready', text:'Thanks Maya. I asked for an intro to Jordan. Sam’s going to be on this with me.' },
  { thread:'maya', from:'maya', at:'Sun Oct 5, 4:30 PM', stage:'home_ready', text:'Perfect. Once Jordan responds you’ll see it here. Meanwhile, tell me the neighborhoods and the price range you’re comfortable with and I’ll start pulling homes.' },
  { thread:'jordan', from:'jordan', at:'Wed Oct 8, 10:05 AM', stage:'lender_request', text:'Hi Alex, Sam — I’ve accepted Maya’s introduction. To get you a pre-approval I need a short application in our secure system. The link is in your task; it brings you back here when you’re done.' },
  { thread:'maya', from:'maya', at:'Wed Oct 8, 11:40 AM', stage:'lender_request', text:'Jordan’s quick. While that’s running I have three homes for you to look at next week.' },
  { thread:'jordan', from:'jordan', at:'Sun Oct 12, 9:15 AM', stage:'preapproved', text:'Your letter is attached. Status is “Pre-approved” through Jan 10, 2027, up to $495,000 on a 30-year fixed. One condition: we verify employment again before closing. A pre-approval isn’t a commitment to lend or to use us — but it’s a strong letter.', doc:'preapproval' },
  { thread:'maya', from:'alex', at:'Wed Oct 15, 7:50 AM', stage:'searching', text:'Willow Ridge looks great. Can we see it this week?' },
  { thread:'maya', from:'maya', at:'Wed Oct 15, 8:05 AM', stage:'searching', text:'Requesting Friday morning. I’ll confirm once the listing side confirms access.' },
  { thread:'maya', from:'maya', at:'Wed Oct 15, 2:20 PM', stage:'tour_confirmed', text:'Confirmed: Friday Oct 17, 10:30 AM. I’ll meet you at the front door. Bring Sam.' },
  { thread:'maya', from:'alex', at:'Fri Oct 17, 1:15 PM', stage:'toured', text:'We loved it. The kitchen sold Sam. Only worry is the roof looked tired from the driveway.' },
  { thread:'maya', from:'maya', at:'Fri Oct 17, 1:40 PM', stage:'toured', text:'Noted on the roof — an inspection contingency covers that. Two other buyers toured this week, so if you want it, let’s draft an offer this weekend.' },
  { thread:'maya', from:'maya', at:'Sun Oct 19, 6:10 PM', stage:'offer_drafting', text:'Draft is ready: $478,000, $5,000 earnest, financing and inspection contingencies, 10-day inspection, close Dec 4. Nothing is sent until you authorize it.', doc:'offer_v1' },
  { thread:'maya', from:'maya', at:'Mon Oct 20, 11:10 AM', stage:'offer_signing', text:'You’ve signed. Waiting on Sam — the envelope is in their tasks.' },
  { thread:'maya', from:'maya', at:'Mon Oct 20, 1:50 PM', stage:'offer_ready', text:'All signatures are in. Last step is yours: authorize and I send exactly this version to Daniel Reyes at Arbor Homes.' },
  { thread:'maya', from:'maya', at:'Mon Oct 20, 4:12 PM', stage:'offer_submitted', text:'Sent 2:05 PM. Daniel opened it at 3:42 and acknowledged at 4:10. Now we wait — expires Wednesday 5:00 PM.' },
  { thread:'maya', from:'maya', at:'Tue Oct 21, 11:45 AM', stage:'counteroffer', text:'Counter came back: $482,000 and a Dec 12 close, everything else as we wrote it. That’s a reasonable ask and the date helps Jordan. I’d accept. Your call — read the compare view first.', doc:'offer_v2' },
  { thread:'closing', from:'renee', at:'Wed Oct 22, 5:30 PM', stage:'under_contract', text:'Welcome to the shared room for 1847 Willow Ridge. I’ve published the contract dates; Maya confirmed the effective date as Oct 22. Earnest money is due Saturday to Great Lakes Title.' },
  { thread:'closing', from:'elena', at:'Wed Oct 22, 6:05 PM', stage:'under_contract', text:'Great Lakes Title has the order. Deposit instructions are in Alex and Sam’s Money page — verified, and we will never change them by email.' },
  { thread:'jordan', from:'jordan', at:'Thu Oct 23, 9:00 AM', stage:'under_contract', text:'I have the executed agreement. Your rate lock window is open; nothing to do until the Loan Estimate arrives.' },
  { thread:'closing', from:'elena', at:'Fri Oct 24, 3:15 PM', stage:'inspection_scheduled', text:'$5,000 earnest money received and deposited.' },
  { thread:'maya', from:'maya', at:'Fri Oct 24, 3:40 PM', stage:'inspection_scheduled', text:'Marcus Bell is confirmed for Tuesday 9:00 AM. I’ll be there.' },
  { thread:'maya', from:'maya', at:'Wed Oct 29, 4:05 PM', stage:'inspection_report', text:'Report’s in. Four items — the roof flashing is the real one, the water heater is old but working, the outlets are a quick electrician job, and the crack is cosmetic per Marcus. Let’s ask for a credit rather than repairs so you control the work.', doc:'inspection_report' },
  { thread:'closing', from:'renee', at:'Sun Nov 2, 3:25 PM', stage:'in_diligence', text:'Amendment 1 is signed by all parties: $3,500 seller credit at closing. Inspection contingency is resolved.' },
  { thread:'jordan', from:'jordan', at:'Mon Nov 3, 10:20 AM', stage:'in_diligence', text:'Your Loan Estimate is attached: 30-year fixed at 6.125%. Compare it against anything else you’ve received; you aren’t locked to us until you say so.', doc:'loan_estimate' },
  { thread:'closing', from:'jordan', at:'Thu Nov 20, 2:00 PM', stage:'clear_to_close', text:'Appraisal came in at $482,000 — at contract price.' },
  { thread:'closing', from:'elena', at:'Mon Nov 24, 11:00 AM', stage:'clear_to_close', text:'Title commitment issued. Two standard exceptions (utility easement, subdivision covenants); nothing to clear.' },
  { thread:'jordan', from:'jordan', at:'Mon Dec 8, 9:30 AM', stage:'clear_to_close', text:'Closing Disclosure delivered. Please acknowledge receipt today — the three-business-day period runs from receipt and I keep the official record. Cash to close is $96,812.18.', doc:'closing_disclosure' },
  { thread:'closing', from:'elena', at:'Tue Dec 9, 4:10 PM', stage:'closing_scheduled', text:'Alex confirmed wire instructions with me by phone at the number on file. Closing is Friday 9:00 AM at our State Street office. Bring government ID.' },
  { thread:'maya', from:'maya', at:'Thu Dec 11, 5:05 PM', stage:'signed', text:'Walkthrough done — house is clean, the credit items are as we expected, nothing new. See you at 9.' },
  { thread:'closing', from:'elena', at:'Fri Dec 12, 9:45 AM', stage:'signed', text:'Signed. Funding is with the lender; I’ll post here when it lands and again when the deed records.' },
  { thread:'closing', from:'elena', at:'Fri Dec 12, 3:10 PM', stage:'possession', text:'Funded 1:20 PM, recorded 2:15 PM, disbursed 3:05 PM. Possession is authorized for 5:00 PM.' },
  { thread:'maya', from:'maya', at:'Fri Dec 12, 4:30 PM', stage:'possession', text:'Heading to the house now with your keys. Welcome home, both of you.' }
];

/* ---------- Ask Kanah: canned answers that cite only visible documents ---------- */
WORLD.ask = [
  { id:'q_preapproved', q:'What does “pre-approved” actually mean?', from:'preapproved', cites:['preapproval'], a:'It’s Lakeshore Mortgage’s wording, not Kanah’s. Jordan’s letter says you are pre-approved up to $495,000 on a 30-year fixed, through Jan 10, 2027, with one condition (employment verification before closing). It is not a commitment to lend, and it does not commit you to Lakeshore. If you want it refreshed for a specific price, ask Jordan.' },
  { id:'q_sharing', q:'What did I share with Jordan?', from:'home_ready', cites:[], a:'Your name, your contact details, and your request for financing help. Nothing about your saved homes or preferences, and nothing you upload later unless you choose to. Sellers never receive your loan documents.' },
  { id:'q_disclosure', q:'What’s in the seller’s disclosure for Willow Ridge?', from:'searching', cites:['seller_disclosure'], a:'The seller reports a roof replaced in 2009, a furnace from 2016, no known water intrusion, and a 2019 kitchen remodel with permits. They note the water heater is original to a 2012 replacement. Read the full statement; Maya can walk through anything unclear.' },
  { id:'q_counter', q:'What changed in the counteroffer?', from:'counteroffer', cites:['offer_v1','offer_v2'], a:'Two things. Price: $478,000 → $482,000. Closing date: Dec 4 → Dec 12. Earnest money, financing contingency, inspection period and everything else are unchanged. Maya has recommended accepting; the decision and any signature are yours.' },
  { id:'q_roof', q:'What does the inspection say about the roof?', from:'inspection_report', cites:['inspection_report'], a:'Finding 1: step flashing at the chimney is lifted on the north side; Marcus rated it “repair soon” and recommends a licensed roofer, estimated $600–$1,200. The shingles themselves are the 2009 roof and show normal wear. Photo 1 in the report shows the flashing.' },
  { id:'q_credit', q:'How is the $3,500 credit applied?', from:'in_diligence', cites:['repair_amendment'], a:'Amendment 1 makes it a seller credit at closing, applied against your closing costs. It reduces your cash to close; it does not change the price or your loan amount. Jordan will show it on the Closing Disclosure.' },
  { id:'q_cd', q:'What is the Closing Disclosure waiting period?', from:'clear_to_close', cites:['closing_disclosure'], a:'Federal rules require you to receive the Closing Disclosure at least three business days before you sign. Jordan delivered it Dec 8 and you received it the same day, so the earliest signing is Dec 11. Lakeshore Mortgage keeps the official record of that period; Kanah only shows their status.' },
  { id:'q_wire', q:'How do I know the wire instructions are real?', from:'closing_scheduled', cites:['closing_funds'], a:'You verified them by calling Elena Vasquez at the Great Lakes Title number you already had, on Dec 9. Kanah never puts instructions in an email or notification, and if anything changes you must re-verify by phone before sending. If you get a message asking you to send funds differently, stop and call Elena.' },
  { id:'q_after_signing', q:'What happens between signing and keys?', from:'signed', cites:['signed_package'], a:'Four separate confirmations: funding (Jordan), recording at Washtenaw County (Elena), disbursement (Elena), and possession authorization per the agreement. Signing alone does not release keys. Each one appears on your Timeline as it is confirmed.' },
  { id:'q_archive', q:'Where are my documents after closing?', from:'possession', cites:['deed','signed_package'], a:'In Documents, permanently. Your recorded deed, the signed closing package, the settlement statement, inspection report and everything else stay available to you and Sam. Your team stays reachable from Team.' },
  { id:'q_earnest', q:'What happens to my earnest money?', from:'under_contract', cites:['earnest_instructions','executed_agreement'], a:'Great Lakes Title holds it. At closing it is credited toward your cash to close. If the purchase ended under a contingency you kept, it would be returned per the agreement; the agreement (§4 and §7) governs, and Maya or Elena can explain the specifics.' }
];
/* ---------- Ask Kanah chips per stage (alignment spec §8): a question with an answer, or an action.
   act: doc/<id> opens a document · go/<view> navigates · sheet/inspectors opens the inspector sheet · toast/<text> shows a toast. ---------- */
WORLD.ask.push(
  { id:'q_od_period', q:'What does the inspection period mean?', from:'offer_drafting', cites:['offer_v1'], a:'Ten days after acceptance to inspect and decide. You can accept, ask for repairs or a credit, or withdraw with your deposit returned. Maya confirms the dates once the agreement is executed.' },
  { id:'q_od_why', q:'Why $478,000?', from:'offer_drafting', cites:[], act:'go/messages/maya' },
  { id:'q_od_earnest', q:'What is earnest money?', from:'offer_drafting', cites:['offer_v1'], a:'A $5,000 deposit held by the title company that shows you are serious. It is credited to your cash to close.' },
  { id:'q_os_signing', q:'What am I signing?', from:'offer_signing', cites:['offer_v1','preapproval','lead_paint'], a:'Purchase agreement offer v1, your pre-approval letter and the lead-based paint disclosure. Each one opens from the surface.' },
  { id:'q_os_sam', q:'Can Sam sign later?', from:'offer_signing', cites:['offer_v1'], a:'Yes. Sam signs for himself after you; nothing is sent until both signatures are in.' },
  { id:'q_os_terms', q:'Show me the terms', from:'offer_signing', cites:[], act:'go/offer' },
  { id:'q_or_receives', q:'What exactly does the seller’s side receive?', from:'offer_ready', cites:['offer_v1'], a:'Offer v1, the pre-approval letter and the lead paint acknowledgment, sent by Maya to Daniel Reyes. Nothing else.' },
  { id:'q_or_change', q:'Can I change something after sending?', from:'offer_ready', cites:['offer_v1'], a:'Only as a new version. Maya sends v2; the seller’s side sees each version as its own offer.' },
  { id:'q_sub_expire', q:'When does my offer expire?', from:'offer_submitted', cites:['offer_v1'], a:'Wed Oct 22 at 5:00 PM ET, per offer v1 §12.' },
  { id:'q_sub_counter', q:'What if they counter?', from:'offer_submitted', cites:['offer_v1'], a:'Maya brings the counter here as v2 with every changed term marked. You accept, counter or decline.' },
  { id:'q_co_why', q:'Why does Maya recommend accepting?', from:'counteroffer', cites:[], act:'go/messages/maya' },
  { id:'q_co_after', q:'What happens after I sign?', from:'counteroffer', cites:['offer_v2'], a:'Maya returns the signed counter. When the seller’s side confirms execution you are under contract and your $5,000 deposit is due within three days.' },
  { id:'q_uc_real', q:'How do I know the payment steps are real?', from:'under_contract', cites:['earnest_instructions'], a:'They were verified Oct 22 by a call to the Great Lakes Title number on file. Kanah never shows account numbers. If anything changes, stop and call Elena.' },
  { id:'q_uc_steps', q:'Show me the verified steps', from:'under_contract', cites:[], act:'doc/earnest_instructions' },
  { id:'q_ci_time', q:'Find a different time', from:'choose_inspector', cites:[], act:'toast/Pick any open slot below. More times appear when Marcus updates his calendar.' },
  { id:'q_ci_others', q:'Show me other inspectors', from:'choose_inspector', cites:[], act:'sheet/inspectors' },
  { id:'q_ci_after', q:'What happens after the inspection?', from:'choose_inspector', cites:['executed_agreement'], a:'Marcus sends the report within 24 hours. You have until Sun Nov 2 to accept, ask for repairs or a credit, or withdraw.' },
  { id:'q_is_check', q:'What does the inspector check?', from:'inspection_scheduled', cites:['inspection_scope'], a:'Structure, roof, exterior, attic, electrical, plumbing, heating and cooling, interior, basement and garage. Radon, pest and sewer scope are available on request.' },
  { id:'q_is_there', q:'Should I be there?', from:'inspection_scheduled', cites:['inspection_scope'], a:'You are welcome to. Maya is on site for the whole inspection and can walk you through anything.' },
  { id:'q_is_resched', q:'Reschedule', from:'inspection_scheduled', cites:[], act:'toast/Reschedule goes to Marcus and the listing side (mock).' },
  { id:'q_ir_ask', q:'What can I ask the seller for?', from:'inspection_report', cites:['inspection_report'], a:'Repairs before closing, a credit at closing, or a price change. Maya drafts it as a request and the seller responds either way.' },
  { id:'q_ir_open', q:'Open the report', from:'inspection_report', cites:[], act:'doc/inspection_report' },
  { id:'q_id_lock', q:'Should I lock now?', from:'in_diligence', cites:['loan_estimate'], a:'Locking fixes 6.125% through closing. Jordan can explain the trade-off; nothing locks until you say so.' },
  { id:'q_id_nora', q:'What does Nora’s quote cover?', from:'in_diligence', cites:['insurance_binder'], a:'Dwelling $420,000, other structures $42,000, personal property $210,000, liability $300,000, with a $1,500 deductible.' },
  { id:'q_cc_cash', q:'Why is cash to close $96,812.18?', from:'clear_to_close', cites:['closing_disclosure'], a:'Sale price less your loan, plus closing costs, less your deposit and the seller credit. Every row is on the Closing Disclosure.' },
  { id:'q_cc_open', q:'Open the Closing Disclosure', from:'clear_to_close', cites:[], act:'doc/closing_disclosure' },
  { id:'q_cs_bring', q:'What do I bring to closing?', from:'closing_scheduled', cites:['closing_funds'], a:'Government ID and your wire confirmation. Fri Dec 12, 9:00 AM ET at Great Lakes Title, 2723 S State St.' },
  { id:'q_cs_walk', q:'Open the walkthrough checklist', from:'closing_scheduled', cites:[], act:'doc/walkthrough' },
  { id:'q_sg_keys', q:'When do I get the keys?', from:'signed', cites:['signed_package'], a:'When possession is authorized, after funding, recording and disbursement. Maya hands them over.' },
  { id:'q_sg_settle', q:'Where’s my settlement statement?', from:'signed', cites:[], act:'doc/settlement_statement' },
  { id:'q_po_deed', q:'Open the deed', from:'possession', cites:[], act:'doc/deed' },
  { id:'q_po_warranty', q:'What about a home warranty?', from:'possession', cites:['possession_note'], a:'Optional, and yours to choose. Maya can point you to what sellers in Ann Arbor usually offer.' },
  { id:'q_ar_who', q:'Who helped me buy?', from:'archive', cites:[], act:'go/people' },
  { id:'q_ar_deed', q:'Open the deed', from:'archive', cites:[], act:'doc/deed' }
);

/* ---------- Documents ---------- */
WORLD.documents = [
  { id:'rep_agreement', title:'Buyer representation agreement', cls:'Representation', owner:'maya', from:'home_ready', audience:'You, Sam, Maya and Huron Valley Realty compliance', meta:{ date:'Mon Oct 6', source:'E-sign · completed' }, status:{ default:'Signed Oct 6 by Alex and Sam' } },
  { id:'preapproval', title:'Pre-approval letter', cls:'Financing', owner:'jordan', from:'preapproved', audience:'You, Sam and Jordan’s team. The seller side sees only the version attached to a submitted offer.', meta:{ date:'Sun Oct 12', source:'Lakeshore Mortgage · lender-confirmed', version:'1' }, status:{ preapproved:'“Pre-approved” · issued Oct 12 · expires Jan 10, 2027', offer_ready:'Version 1 attached to offer v1' } },
  { id:'listing_sheet', title:'Listing sheet · 1847 Willow Ridge Dr', cls:'Listing', owner:'mls', from:'searching', audience:'You, Sam and Maya', meta:{ date:'Wed Oct 15', source:'MLS · synced 6:00 AM · listing data may change' }, status:{ default:'Synced Oct 15 · MLS #24-118472' } },
  { id:'seller_disclosure', title:'Seller’s disclosure statement', cls:'Listing', owner:'daniel', from:'searching', audience:'Buyer side and seller side', meta:{ date:'Wed Oct 15', source:'Listing side · approved for buyers' }, status:{ default:'Approved for buyers Oct 15' } },
  { id:'lead_paint', title:'Lead-based paint disclosure', cls:'Listing', owner:'daniel', from:'searching', audience:'Buyer side and seller side', meta:{ date:'Wed Oct 15', source:'Listing side' }, status:{ default:'Not applicable · built 1994 · acknowledged' } },
  { id:'offer_v1', title:'Purchase agreement · offer v1', cls:'Offer', owner:'maya', from:'offer_drafting', audience:'Drafts: you, Sam and Maya. Submitted version: Daniel Reyes and the seller.', meta:{ date:'Mon Oct 20', source:'Offer record', version:'1', hash:'a3f9…c21e' }, status:{ offer_drafting:'Draft · not sent', offer_signing:'Awaiting Sam’s signature', offer_ready:'Signed · ready to authorize', offer_submitted:'Submitted Oct 20, 2:05 PM · v1', under_contract:'Superseded by counteroffer v2' } },
  { id:'offer_v2', title:'Seller counteroffer · v2', cls:'Offer', owner:'daniel', from:'counteroffer', audience:'You, Sam, Maya; seller side', meta:{ date:'Tue Oct 21', source:'Offer record', version:'2', hash:'7bd0…e84a' }, status:{ counteroffer:'Received Oct 21 · $482,000 · close Dec 12', under_contract:'Accepted and executed Oct 22' } },
  { id:'executed_agreement', title:'Executed purchase agreement', cls:'Contract', owner:'maya', from:'under_contract', audience:'You, Sam, Maya, Renee, Jordan’s team, Elena; seller side', meta:{ date:'Wed Oct 22', source:'E-sign · confirmed by Maya Chen' }, status:{ under_contract:'Effective Oct 22 · dates confirmed by Maya Chen', in_diligence:'Amended by Amendment 1' } },
  { id:'earnest_instructions', title:'Earnest money instructions (verified)', cls:'Closing', owner:'elena', from:'under_contract', audience:'You and Great Lakes Title only', meta:{ date:'Wed Oct 22', source:'Great Lakes Title · verified by trusted-contact call' }, status:{ default:'Verified Oct 22 · $5,000 due Oct 25' } },
  { id:'deposit_receipt', title:'Deposit receipt · $5,000', cls:'Title and settlement', owner:'elena', from:'inspection_scheduled', audience:'You, Sam, Maya, Renee; seller side sees receipt status', meta:{ date:'Fri Oct 24', source:'Great Lakes Title' }, status:{ default:'Received Oct 24 · confirmed by Great Lakes Title' } },
  { id:'inspection_scope', title:'Inspection agreement and scope', cls:'Inspection', owner:'marcus', from:'inspection_scheduled', audience:'You, Sam, Maya and Marcus', meta:{ date:'Fri Oct 24', source:'Bell Home Inspections' }, status:{ default:'Accepted Oct 24 · Tue Oct 28, 9:00 AM · $495' } },
  { id:'inspection_report', title:'Home inspection report', cls:'Inspection', owner:'marcus', from:'inspection_report', audience:'You and Sam. Maya can see it because you shared it. Never the seller side by default.', meta:{ date:'Wed Oct 29', source:'Bell Home Inspections' }, status:{ default:'Delivered Oct 29 · 4 findings · 4 photos' } },
  { id:'repair_amendment', title:'Amendment 1 · repair credit $3,500', cls:'Contract', owner:'maya', from:'inspection_report', audience:'You, Sam, Maya, Renee, Elena, Jordan’s team; seller side', meta:{ date:'Sun Nov 2', source:'E-sign · all parties' }, status:{ inspection_report:'Draft request · reviewing with Maya', in_diligence:'Signed Nov 2 · effective' } },
  { id:'loan_estimate', title:'Loan Estimate', cls:'Financing', owner:'jordan', from:'in_diligence', audience:'You, Sam and Jordan’s team. Never Maya or the seller side.', meta:{ date:'Mon Nov 3', source:'Lakeshore Mortgage' }, status:{ default:'Received Nov 3 · 30-year fixed 6.125%' } },
  { id:'insurance_binder', title:'Homeowners insurance binder', cls:'Insurance', owner:'nora', from:'in_diligence', audience:'You, Sam, Nora; lender and title receive evidence only', meta:{ date:'Wed Nov 5', source:'Mitten Mutual Insurance' }, status:{ in_diligence:'Quote received Nov 5', clear_to_close:'Bound · effective Dec 12' } },
  { id:'appraisal', title:'Appraisal report', cls:'Financing', owner:'jordan', from:'clear_to_close', audience:'You, Sam and Jordan’s team; ordered by the lender', meta:{ date:'Thu Nov 20', source:'Lakeshore Mortgage · lender-ordered' }, status:{ default:'Appraised at $482,000 · Nov 20' } },
  { id:'title_commitment', title:'Title commitment', cls:'Title and settlement', owner:'elena', from:'clear_to_close', audience:'You, Sam, Maya, Jordan’s team and Elena', meta:{ date:'Mon Nov 24', source:'Great Lakes Title' }, status:{ default:'Issued Nov 24 · 2 standard exceptions' } },
  { id:'closing_disclosure', title:'Closing Disclosure', cls:'Closing', owner:'jordan', from:'clear_to_close', audience:'You, Sam, Jordan’s team and Elena', meta:{ date:'Mon Dec 8', source:'Lakeshore Mortgage · authoritative' }, status:{ default:'Delivered Dec 8 · received Dec 8 · waiting period satisfied Dec 11' } },
  { id:'closing_funds', title:'Closing funds instructions (verified)', cls:'Closing', owner:'elena', from:'closing_scheduled', audience:'You and Great Lakes Title only', meta:{ date:'Tue Dec 9', source:'Great Lakes Title · verified by phone with Elena Vasquez' }, status:{ default:'Verified Dec 9 · $96,812.18 · any change restarts verification' } },
  { id:'walkthrough', title:'Final walkthrough checklist', cls:'Contract', owner:'maya', from:'closing_scheduled', audience:'You, Sam and Maya', meta:{ date:'Thu Dec 11', source:'Maya Chen' }, status:{ closing_scheduled:'Thu Dec 11, 4:00 PM ET', signed:'Completed · no issues' } },
  { id:'settlement_statement', title:'Settlement statement (buyer)', cls:'Title and settlement', owner:'elena', from:'signed', audience:'You, Sam, Jordan’s team and Elena', meta:{ date:'Fri Dec 12', source:'Great Lakes Title · final' }, status:{ default:'Final · Dec 12' } },
  { id:'signed_package', title:'Signed closing package', cls:'Closing', owner:'elena', from:'signed', audience:'You, Sam, Jordan’s team and Elena', meta:{ date:'Fri Dec 12', source:'Great Lakes Title' }, status:{ signed:'Signed Dec 12, 9:40 AM · funding pending', possession:'Funded and recorded' } },
  { id:'deed', title:'Warranty deed (recorded copy)', cls:'Ownership', owner:'elena', from:'possession', audience:'You and Sam; public record', meta:{ date:'Fri Dec 12', source:'Washtenaw County Register of Deeds · via Great Lakes Title' }, status:{ default:'Recorded Dec 12, 2:15 PM' } },
  { id:'possession_note', title:'Possession confirmation', cls:'Ownership', owner:'elena', from:'possession', audience:'You, Sam, Maya; seller side', meta:{ date:'Fri Dec 12', source:'Great Lakes Title' }, status:{ default:'Keys authorized Dec 12, 5:00 PM' } },
  { id:'warranty', title:'Home warranty (optional)', cls:'Ownership', owner:'alex', from:'archive', audience:'You and Sam', meta:{ date:'Sat Dec 13', source:'Optional service · your choice' }, status:{ default:'Available · not a closing requirement' } }
];
