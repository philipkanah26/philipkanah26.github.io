/* ============================================================
   The 27 stages, in journey order. Copy any `key` into config.js.

    1 invited              14 offer_drafting
    2 verify               15 offer_signing
    3 representation       16 offer_ready
    4 starting_point       17 offer_submitted   (default)
    5 financing_route      18 counteroffer
    6 choose_lender        19 under_contract
    7 permission_preview   20 inspection_scheduled
    8 home_ready           21 inspection_report
    9 lender_request       22 in_diligence
   10 preapproved          23 clear_to_close
   11 searching            24 closing_scheduled
   12 tour_confirmed       25 signed
   13 toured               26 possession
                           27 archive

   Fields: key, label, phase (search|contract|closing|keys), screen (onboarding|workspace),
   b (blueprint screen ids), advances (does the primary action move to the next stage?), and the
   narrative for Home: headline, sub, updates [two lines]. The next step, its date, owner, source and
   the primary action come from the spine (spine.js) through Engine.spine(); only the terminal
   stage `archive` carries its own cta, ctaDetail and opens. Onboarding stages keep cta and opens.
   ============================================================ */
const STAGES = [
  { key:'invited', label:'Invitation', phase:'search', screen:'onboarding', b:['B01'], cta:'Get started', advances:true, opens:'home',
    onboarding:{ eyebrow:'Maya Chen · Huron Valley Realty invited you', title:'Your next home starts here.',
      copy:'Maya invited you to a homebuying space for your next steps, conversations, and documents.',
      secondary:'What is Kanah?', note:'Kanah is where you, Maya and the people who help you buy keep one shared picture of what happens next. Nothing here is shared with a seller unless you deliberately send it.' } },
  { key:'verify', label:'Verify it’s you', phase:'search', screen:'onboarding', b:['B02'], cta:'Continue', advances:true, opens:'home',
    onboarding:{ eyebrow:'Step 1 of 4', title:'Let’s make sure it’s you.', copy:'Enter the code sent to a•••••n@gmail.com.',
      field:{ label:'6-digit code', value:'482 917' }, secondary:'Use a different contact', note:'We can send the code to (734) •••-4412 instead. Your contact is only used to verify you.' } },
  { key:'representation', label:'Who’s helping you buy', phase:'search', screen:'onboarding', b:['B03'], cta:'Continue with Maya', advances:true, opens:'home',
    onboarding:{ eyebrow:'Step 2 of 4', title:'Who’s helping you buy?', copy:'You were invited by Maya. Already working with another agent? Tell us so we can connect the right people.',
      person:'maya', secondary:'I have another agent', note:'Naming another agent routes your invitation to them. It does not change any agreement you already have, and nothing is transferred without you.' } },
  { key:'starting_point', label:'Where are you in your search', phase:'search', screen:'onboarding', b:['B04'], cta:'Continue', advances:true, opens:'home',
    onboarding:{ eyebrow:'Step 3 of 4', title:'Where are you in your home search?', copy:'We’ll start with what matters now.',
      options:['Exploring','Looking at homes','Ready to make an offer','Already under contract'], selected:0 } },
  { key:'financing_route', label:'How are you planning to buy', phase:'search', screen:'onboarding', b:['B05'], cta:'Continue', advances:true, opens:'home',
    onboarding:{ eyebrow:'Step 4 of 4', title:'How are you planning to buy?', copy:'Choose the option closest to where you are today.',
      options:['I need a lender','I already have a lender','I have a financing letter','I’m paying cash','I’m not sure yet'], selected:0,
      note:'Pre-approval is not required to look at homes or ask Maya questions.' } },
  { key:'choose_lender', label:'Choose a lender', phase:'search', screen:'onboarding', b:['B06','B07'], cta:'Request introduction', advances:true, opens:'home',
    onboarding:{ eyebrow:'Financing', title:'Who would you like to speak with?', copy:'Explore available options or add someone you know. Choosing who to work with is up to you. An introduction does not commit you to a loan.',
      providers:[
        { name:'Jordan Whitfield', org:'Lakeshore Mortgage', area:'Ann Arbor · Washtenaw County', avail:'Available this week', disclosure:'Preferred by Huron Valley Realty. Huron Valley Realty receives no compensation for this introduction.', selected:true, img:'assets/people/jordan.jpg' },
        { name:'Priya Raman', org:'Great Lakes Home Loans', area:'Ann Arbor · Livingston County', avail:'Available next week', disclosure:'No relationship with your brokerage.', selected:false },
        { name:'Bring your own lender', org:'Invite someone you already work with', area:'', avail:'', disclosure:'They get a scoped invitation; no access until they verify.', selected:false, own:true }
      ], secondary:'Ask Maya for help' } },
  { key:'permission_preview', label:'Here’s what you’re sharing', phase:'search', screen:'onboarding', b:['B09'], cta:'Confirm introduction', advances:true, opens:'home',
    onboarding:{ eyebrow:'Before anything is sent', title:'Here’s what you’re sharing.', copy:'Jordan will receive your name, contact details, and request for financing help. Your seller will not receive your loan documents.',
      shares:['Your name: Alex Morgan','Your contact: a•••••n@gmail.com, (734) •••-4412','Your request: help getting ready to buy in Ann Arbor, around $450,000–$500,000'],
      withholds:['Your saved homes and search preferences','Anything you upload later, unless you choose to share it','Any seller or listing information'] } },

  { key:'home_ready', label:'Your homebuying space', phase:'search', screen:'workspace', b:['B10','B15','B17'], advances:true,
    headline:'You’re in the right place, Alex.', sub:'Your lender has been invited. We’ll let you know when Jordan responds. You can keep working with Maya while you wait.',
    updates:['Jordan Whitfield has been invited to respond as your lender.','Sam Okafor has been invited as your co-buyer.'] },
  { key:'lender_request', label:'Your lender’s next step', phase:'search', screen:'workspace', b:['B11'], advances:true,
    headline:'Your lender’s next step is ready.', sub:'Jordan asked you to complete your application. You’ll continue in Lakeshore Mortgage’s secure application and return here.',
    updates:['Jordan accepted your introduction on Oct 8.','Sam accepted their invitation and can sign for themselves.'] },
  { key:'preapproved', label:'Financing update', phase:'search', screen:'workspace', b:['B14'], advances:true,
    headline:'Your financing update is here.', sub:'Lakeshore Mortgage provided “Pre-approved” on Oct 12. Review the letter and any conditions.',
    updates:['Maya has three homes ready for you to look at.','Jordan noted one condition: verify employment before closing.'] },
  { key:'searching', label:'Saved homes', phase:'search', screen:'workspace', b:['B18','B19','B20'], advances:true,
    headline:'You’re in the right place, Alex.', sub:'Three homes are saved. Maya shared 1847 Willow Ridge Dr this morning.',
    updates:['Maya added two homes that match your preferences.','Jordan is holding your pre-approval; no action needed.'] },
  { key:'tour_confirmed', label:'Tour confirmed', phase:'search', screen:'workspace', b:['B21','B22'], advances:true,
    headline:'Your tour is confirmed.', sub:'1847 Willow Ridge Dr · Fri Oct 17, 10:30 AM ET. You’ll meet Maya at the front door.',
    updates:['The listing side confirmed access for Friday.','Sam is joining the tour.'] },
  { key:'toured', label:'After the tour', phase:'search', screen:'workspace', b:['B23'], advances:true,
    headline:'How did this home feel?', sub:'Your notes went to Maya privately. Tell her what you liked and what you want to understand better.',
    updates:['Maya pulled the seller’s disclosure and recent sales nearby.','Jordan can refresh your letter for a specific price.'] },
  { key:'offer_drafting', label:'Offer in preparation', phase:'search', screen:'workspace', b:['B24','B25'], advances:true,
    headline:'Let’s put your offer together.', sub:'Maya will help you review price, timing, and the terms that matter to you. These terms are not sent yet.',
    updates:['Maya drafted $478,000 with a 10-day inspection period.','Sam will need to sign before anything is sent.'] },
  { key:'offer_signing', label:'Offer signatures', phase:'search', screen:'workspace', b:['B26'], advances:true,
    headline:'Ready to sign your offer?', sub:'Read each document carefully. Maya can answer questions before you sign.',
    updates:['Sam signs after you; the envelope is in both your tasks.','Jordan attached the version of your letter you chose.'] },
  { key:'offer_ready', label:'Ready to send', phase:'search', screen:'workspace', b:['B27'], advances:true,
    headline:'Ready for Maya to send?', sub:'The seller’s side will receive only the documents listed below.',
    updates:['Sam signed at 1:48 PM. All signatures are complete.','Recipient: Daniel Reyes, Arbor Homes Realty (verified).'] },
  { key:'offer_submitted', label:'Offer sent', phase:'search', screen:'workspace', b:['B28'], advances:false,
    headline:'Your offer has been sent.', sub:'Sent by Maya on Oct 20 at 2:05 PM. Delivery: acknowledged 4:10 PM. Seller response: pending.',
    updates:['Daniel Reyes opened the package at 3:42 PM and acknowledged it.','Jordan is on standby to refresh your letter if terms change.'] },
  { key:'counteroffer', label:'Seller proposed changes', phase:'search', screen:'workspace', b:['B29'], advances:true,
    headline:'The seller has proposed changes.', sub:'Review what changed with Maya before deciding.',
    updates:['Two terms changed: price and closing date.','Maya recommends accepting; her reasoning is in Messages.'] },
  { key:'under_contract', label:'Purchase moving forward', phase:'contract', screen:'workspace', b:['B30','B31','B32','B33'], advances:true,
    headline:'Your purchase is moving forward.', sub:'Your signed agreement is confirmed. First up: your $5,000 deposit to Great Lakes Title by Sat Oct 25, then the inspection. Every gate to closing is on the line below.',
    updates:['Elena Vasquez accepted the title order and verified deposit instructions.','Jordan received the executed agreement automatically.'] },
  { key:'inspection_scheduled', label:'Inspection scheduled', phase:'contract', screen:'workspace', b:['B34','B35'], advances:false,
    headline:'Your purchase is moving forward.', sub:'Inspection with Marcus Bell is confirmed for Tue Oct 28 at 9:00 AM. Your deposit was received.',
    updates:['Great Lakes Title confirmed your $5,000 deposit on Oct 24.','Renee Park published the contract tasks to everyone.'] },
  { key:'inspection_report', label:'Inspection report ready', phase:'contract', screen:'workspace', b:['B36','B37'], advances:true,
    headline:'Your inspection report is ready.', sub:'Review the findings with Maya before deciding what to request. Your inspection period ends Sun Nov 2.',
    updates:['Marcus found four items; the roof flashing is the one to act on.','Jordan is ordering the appraisal through Lakeshore’s process.'] },
  { key:'in_diligence', label:'Parallel work toward closing', phase:'contract', screen:'workspace', b:['B38','B39','B40','B41'], advances:true,
    headline:'Your purchase is moving forward.', sub:'Amendment 1 is signed: a $3,500 credit at closing. Financing, insurance, appraisal and title are running at the same time, and each one is on the line below.',
    updates:['Nora sent an insurance quote; the roof passed underwriting.','The appraisal is scheduled; Maya coordinated access.'] },
  { key:'clear_to_close', label:'Closing numbers ready', phase:'closing', screen:'workspace', b:['B42','B43'], advances:true,
    headline:'Your closing numbers are ready to review.', sub:'Compare the terms, costs, and cash to close. Ask Jordan about anything you do not understand.',
    updates:['Elena cleared title: two standard exceptions, nothing to fix.','Your appraisal came in at $482,000.'] },
  { key:'closing_scheduled', label:'Your closing plan', phase:'closing', screen:'workspace', b:['B44','B45','B46'], advances:true,
    headline:'Here’s your closing plan.', sub:'Fri Dec 12, 9:00 AM ET at Great Lakes Title, 2723 S State St, Ann Arbor. Bring government ID.',
    updates:['Wire instructions verified by phone with Elena on Dec 9. Any change restarts verification.','Walkthrough with Maya is Thu Dec 11 at 4:00 PM.'] },
  { key:'signed', label:'Signed, awaiting completion', phase:'closing', screen:'workspace', b:['B47'], advances:false,
    headline:'Your documents are signed.', sub:'Your closing team is confirming funding and recording. We’ll tell you when possession is authorized.',
    updates:['Signed at 9:40 AM. Funding is with Lakeshore Mortgage.','Recording follows funding; Elena will confirm each step.'] },
  { key:'possession', label:'Welcome home', phase:'keys', screen:'workspace', b:['B48'], advances:true,
    headline:'Welcome home, Alex.', sub:'Elena Vasquez confirmed you can receive your keys today at 5:00 PM.',
    updates:['Funded 1:20 PM · recorded 2:15 PM · disbursed 3:05 PM.','Maya will meet you at the house with the keys.'] },
  { key:'archive', label:'Your home, organized', phase:'keys', screen:'workspace', b:['B49'], cta:'Open my documents', ctaDetail:'Closing documents, warranties, and the people who helped you.', advances:false, opens:'documents',
    headline:'Your home, organized.', sub:'Find your closing documents, warranties, and the people who helped you.',
    updates:['Optional: a home warranty and maintenance reminders, only if you choose.','Your team stays reachable from Team.'] }
];
