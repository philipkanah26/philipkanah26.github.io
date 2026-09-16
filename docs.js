/* Paper bodies for the in-app viewer. paper(title, meta, sections) returns HTML.
   Sections: {h, p, list:[..], table:[[..],..] (first row = header), photo:{src,cap}, sig:[..], note} */
function paper(title, meta, sections) {
  const esc = s => String(s == null ? '' : s);
  const metaHtml = Object.entries(meta || {}).map(([k, v]) => `<div><b>${esc(k)}</b>${esc(v)}</div>`).join('');
  const sec = s => {
    let out = '';
    if (s.h) out += `<h3>${esc(s.h)}</h3>`;
    if (s.p) out += `<p>${esc(s.p)}</p>`;
    if (s.list) out += `<ul>${s.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
    if (s.table) out += `<table><thead><tr>${s.table[0].map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${s.table.slice(1).map(r => `<tr class="${r.changed ? 'changed' : ''}">${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    if (s.photo) out += `<figure><img src="${esc(s.photo.src)}" alt="${esc(WORLD.images[s.photo.src] || '')}"><figcaption>${esc(s.photo.cap)}</figcaption></figure>`;
    if (s.sig) out += `<div class="sigs">${s.sig.map(x => `<div class="sig"><span></span>${esc(x)}</div>`).join('')}</div>`;
    if (s.note) out += `<p class="pnote">${esc(s.note)}</p>`;
    return out;
  };
  return `<article class="paper"><h2>${esc(title)}</h2><div class="pmeta">${metaHtml}</div>${(sections || []).map(sec).join('')}</article>`;
}
const chg = (row) => Object.assign(row, { changed: true });

const AGREEMENT_TERMS = (price, close, extra) => [
  ['Term', 'Value'],
  ['Purchase price', price],
  ['Earnest money deposit', '$5,000 to Great Lakes Title within 3 days of acceptance'],
  ['Financing', 'Conventional, 30-year fixed, 20% down; financing contingency through loan commitment'],
  ['Inspection period', '10 days from effective date'],
  ['Appraisal', 'Contingent on appraisal at or above purchase price'],
  ['Closing date', close],
  ['Possession', 'At closing, upon recording and disbursement'],
  ['Included', 'Kitchen appliances, washer and dryer, window treatments'],
  ['Offer expiration', 'Wed Oct 22, 2026, 5:00 PM ET']
].concat(extra || []);

const DOC_BODIES = {
  rep_agreement: paper('Exclusive Buyer Representation Agreement', { Brokerage:'Huron Valley Realty', Agent:'Maya Chen', Buyers:'Alex Morgan, Sam Okafor', Term:'Oct 6, 2026 – Apr 6, 2027', Signed:'Oct 6, 2026 (e-sign)' }, [
    { h:'Services', p:'Huron Valley Realty will locate properties, arrange showings, prepare and present offers, negotiate on your behalf, and coordinate the transaction through closing.' },
    { h:'Compensation', p:'Buyer’s broker compensation is 2.5% of the purchase price, payable at closing, offset by any amount paid by the seller or listing broker. Compensation is negotiable and not set by law.' },
    { h:'Agency disclosure', p:'Michigan agency disclosure (MCL 339.2517) was provided and acknowledged before this agreement was signed.' },
    { sig:['Alex Morgan · Oct 6, 2026', 'Sam Okafor · Oct 6, 2026', 'Maya Chen, Huron Valley Realty · Oct 6, 2026'] }
  ]),
  preapproval: paper('Pre-Approval Letter', { Lender:'Lakeshore Mortgage', 'Loan officer':'Jordan Whitfield, NMLS #000000', Borrowers:'Alex Morgan, Sam Okafor', Issued:'Oct 12, 2026', Expires:'Jan 10, 2027' }, [
    { p:'Based on the application, credit review and documentation received, Alex Morgan and Sam Okafor are pre-approved for a conventional mortgage up to $495,000 on a 30-year fixed-rate loan, subject to the conditions below.' },
    { h:'Conditions', list:['Satisfactory appraisal of the subject property','Clear title and acceptable homeowners insurance','Re-verification of employment within 10 days of closing','No material change in credit, income or assets'] },
    { note:'This letter is not a loan commitment and does not obligate the borrowers to obtain financing from Lakeshore Mortgage.' },
    { sig:['Jordan Whitfield, Lakeshore Mortgage'] }
  ]),
  listing_sheet: paper('Listing Sheet · 1847 Willow Ridge Dr, Ann Arbor, MI 48103', { MLS:'#24-118472', Status:'Active', 'List price':'$485,000', 'Listing brokerage':'Arbor Homes Realty · Daniel Reyes', Synced:'Oct 15, 2026, 6:00 AM ET' }, [
    { table:[['Fact','Value'],['Bedrooms','4'],['Bathrooms','2 full, 1 half'],['Living area','2,140 sq ft'],['Year built','1994'],['Lot','0.31 acre'],['Garage','2-car attached'],['Taxes (2025)','$7,420'],['HOA','None'],['School district','Ann Arbor Public Schools']] },
    { h:'Remarks', p:'Two-story colonial on a quiet cul-de-sac in the Lawton neighborhood. Updated kitchen (2019), original hardwood on the main floor, finished basement, fenced yard with mature maples.' },
    { note:'Listing data is provided by the MLS and may change. Executed contract terms are never overwritten by listing updates.' }
  ]),
  seller_disclosure: paper('Seller’s Disclosure Statement', { Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103', Seller:'(name withheld from buyer preview)', Completed:'Oct 14, 2026', 'Approved for buyers':'Oct 15, 2026' }, [
    { table:[['Item','Seller’s statement'],['Roof','Replaced 2009; no known leaks'],['Furnace','Replaced 2016; serviced annually'],['Water heater','Replaced 2012'],['Basement','No known water intrusion; sump pump present'],['Kitchen','Remodeled 2019 with permits'],['Electrical','200A service; no known issues'],['Plumbing','No known issues'],['Pests','None known']] },
    { note:'A seller’s disclosure reflects the seller’s knowledge. It is not a substitute for an inspection.' }
  ]),
  lead_paint: paper('Lead-Based Paint Disclosure', { Property:'1847 Willow Ridge Dr', 'Year built':'1994' }, [
    { p:'Federal lead-based paint disclosure requirements apply to housing built before 1978. This property was built in 1994; the disclosure is provided for completeness and marked not applicable.' },
    { sig:['Acknowledged · Alex Morgan, Sam Okafor · Oct 19, 2026'] }
  ]),
  offer_v1: paper('Purchase Agreement · Offer v1', { Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103', Buyers:'Alex Morgan, Sam Okafor', 'Buyer’s agent':'Maya Chen, Huron Valley Realty', Version:'1 · content hash a3f9…c21e', Authorized:'Oct 20, 2026, 2:01 PM ET' }, [
    { table: AGREEMENT_TERMS('$478,000', 'Thu Dec 4, 2026') },
    { h:'Attached', list:['Pre-approval letter, Lakeshore Mortgage, version 1'] },
    { h:'Recipients', list:['Daniel Reyes, Arbor Homes Realty (verified listing agent)'] },
    { sig:['Alex Morgan · Oct 20, 11:02 AM', 'Sam Okafor · Oct 20, 1:48 PM'] }
  ]),
  offer_v2: paper('Seller Counteroffer · v2', { Property:'1847 Willow Ridge Dr', Responding:'Seller, through Daniel Reyes, Arbor Homes Realty', Version:'2 · content hash 7bd0…e84a', Received:'Oct 21, 2026, 11:30 AM ET', Expires:'Oct 23, 2026, 5:00 PM ET' }, [
    { p:'The seller accepts offer v1 with the following changes. Rows marked changed differ from v1; all other terms are unchanged.' },
    { table:[['Term','Offer v1','Counter v2'], chg(['Purchase price','$478,000','$482,000']), ['Earnest money','$5,000','$5,000'], ['Financing contingency','Yes','Yes'], ['Inspection period','10 days','10 days'], chg(['Closing date','Thu Dec 4, 2026','Fri Dec 12, 2026']), ['Possession','At closing','At closing'], ['Included items','As listed','As listed']] },
    { sig:['Seller · Oct 21, 2026 (through listing agent)'] }
  ]),
  executed_agreement: paper('Executed Purchase Agreement', { Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103', Buyers:'Alex Morgan, Sam Okafor', Seller:'(per agreement)', 'Effective date':'Oct 22, 2026 · confirmed by Maya Chen', 'Closing date':'Fri Dec 12, 2026' }, [
    { table: AGREEMENT_TERMS('$482,000', 'Fri Dec 12, 2026') },
    { h:'Key dates (confirmed)', table:[['Milestone','Date','Source'],['Earnest money due','Sat Oct 25, 5:00 PM ET','§4'],['Inspection period ends','Sun Nov 2, 11:59 PM ET','§7 · 10 days'],['Loan commitment target','Mon Nov 24','§5'],['Closing','Fri Dec 12, 9:00 AM ET','§9']] },
    { sig:['Alex Morgan · Oct 22', 'Sam Okafor · Oct 22', 'Seller · Oct 22', 'Effective date confirmed · Maya Chen · Oct 22, 4:55 PM'] }
  ]),
  earnest_instructions: paper('Earnest Money Instructions', { Holder:'Great Lakes Title', Officer:'Elena Vasquez', Amount:'$5,000', Due:'Sat Oct 25, 2026, 5:00 PM ET', Verified:'Oct 22, 2026 by call to the Great Lakes Title number on file' }, [
    { h:'How to pay', list:['Wire or cashier’s check to Great Lakes Title, using the account details you confirmed by phone.','Reference: 1847 Willow Ridge Dr · Morgan/Okafor.','Kanah does not hold funds and will never show account numbers here.'] },
    { note:'If you receive any message changing these instructions, do not act on it. Call Elena Vasquez at the number you already have. Changes always require re-verification.' }
  ]),
  deposit_receipt: paper('Receipt of Earnest Money Deposit', { Holder:'Great Lakes Title', Received:'Oct 24, 2026, 3:12 PM ET', Amount:'$5,000.00', From:'Alex Morgan', Applied:'Credited toward cash to close at settlement' }, [
    { p:'Great Lakes Title acknowledges receipt of the earnest money deposit for the purchase of 1847 Willow Ridge Dr. Funds are held in the company’s escrow account pending closing or disposition under the purchase agreement.' },
    { sig:['Elena Vasquez, Great Lakes Title'] }
  ]),
  inspection_scope: paper('Inspection Agreement and Scope', { Inspector:'Marcus Bell, Bell Home Inspections', Property:'1847 Willow Ridge Dr', Scheduled:'Tue Oct 28, 2026, 9:00 AM ET', Fee:'$495', Accepted:'Oct 24, 2026' }, [
    { h:'Scope', list:['Structure, roof, exterior, attic and insulation','Electrical, plumbing, heating and cooling','Interior, kitchen, bathrooms, basement and garage','Visual, non-invasive; report within 24 hours'] },
    { h:'Not included', list:['Radon, pest, sewer scope, chimney interior (available on request)'] },
    { sig:['Alex Morgan · Oct 24', 'Marcus Bell · Oct 24'] }
  ]),
  inspection_report: paper('Home Inspection Report', { Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103', Inspector:'Marcus Bell, Bell Home Inspections', Inspected:'Oct 28, 2026, 9:00–12:15', Delivered:'Oct 29, 2026', Summary:'4 findings · 1 repair soon · 3 monitor or minor' }, [
    { h:'Finding 1 · Roof: lifted step flashing at chimney (repair soon)', p:'Step flashing on the north side of the chimney is lifted approximately 1/2 inch; sealant has failed. No interior staining observed in the attic below, but this is the most likely future leak point. Recommend a licensed roofer reseat and reseal; typical cost $600–$1,200.' },
    { photo:{ src:'assets/inspection/roof-flashing.jpg', cap:'Photo 1 · lifted step flashing, north side of chimney' } },
    { h:'Finding 2 · Water heater near end of service life (monitor)', p:'40-gallon gas water heater, manufacture date 2012. Operating normally; no corrosion at fittings. Typical service life is 10–15 years. Budget for replacement.' },
    { photo:{ src:'assets/inspection/water-heater.jpg', cap:'Photo 2 · water heater, basement utility corner' } },
    { h:'Finding 3 · Ungrounded outlets in hall bathroom (minor safety)', p:'Two outlets test open-ground and lack GFCI protection. Recommend an electrician install GFCI receptacles; typical cost $150–$300.' },
    { photo:{ src:'assets/inspection/outlet.jpg', cap:'Photo 3 · outlet tester showing open ground' } },
    { h:'Finding 4 · Hairline crack, basement wall (cosmetic)', p:'Vertical hairline crack in the poured concrete wall, north-east corner, no displacement or moisture staining. Typical shrinkage crack; monitor for change.' },
    { photo:{ src:'assets/inspection/basement-crack.jpg', cap:'Photo 4 · hairline crack, north-east basement wall' } },
    { note:'This report reflects conditions visible on the inspection date. Read the full report before deciding; Ask Kanah can explain a finding, and Maya can turn priorities into a request.' }
  ]),
  repair_amendment: paper('Amendment 1 to Purchase Agreement · Repair Credit', { Property:'1847 Willow Ridge Dr', Requested:'Oct 30, 2026', Signed:'Nov 2, 2026, 3:20 PM ET', Effective:'Nov 2, 2026' }, [
    { table:[['Field','Before','After'], chg(['Seller credit to buyer at closing','$0','$3,500'])] },
    { h:'Reason', p:'Inspection findings 1 and 2 (roof flashing; water heater near end of service life). Buyers elect a credit in lieu of repairs and accept the property condition otherwise.' },
    { h:'Effect', p:'Inspection contingency is satisfied. All other terms and dates of the agreement are unchanged.' },
    { sig:['Alex Morgan · Nov 2', 'Sam Okafor · Nov 2', 'Seller · Nov 2', 'Approved · Maya Chen (buyer side) · Daniel Reyes (seller side)'] }
  ]),
  loan_estimate: paper('Loan Estimate', { Lender:'Lakeshore Mortgage', Issued:'Nov 3, 2026', Borrowers:'Alex Morgan, Sam Okafor', Property:'1847 Willow Ridge Dr', 'Rate lock':'Not yet locked · available through Nov 10' }, [
    { table:[['Loan terms','Value'],['Loan amount','$385,600'],['Interest rate','6.125% fixed'],['Term','30 years'],['Monthly principal and interest','$2,343.08'],['Estimated taxes and insurance','$780/month (escrowed)'],['Prepayment penalty','None'],['Balloon payment','None']] },
    { table:[['Estimated closing costs','Amount'],['Origination charges','$1,850'],['Services you cannot shop for','$1,412.18'],['Services you can shop for','$2,900'],['Taxes and government fees','$1,250'],['Prepaids and initial escrow','$1,500'],['Total estimated closing costs','$8,912.18']] },
    { note:'Compare this estimate with any other you receive. You are not committed to Lakeshore Mortgage until you lock and proceed.' }
  ]),
  insurance_binder: paper('Homeowners Insurance Binder', { Carrier:'Mitten Mutual Insurance', Agent:'Nora Lindqvist', Insured:'Alex Morgan, Sam Okafor', Property:'1847 Willow Ridge Dr', 'Effective':'Dec 12, 2026', Premium:'$1,640/year' }, [
    { table:[['Coverage','Limit'],['Dwelling','$420,000'],['Other structures','$42,000'],['Personal property','$210,000'],['Liability','$300,000'],['Deductible','$1,500 · wind/hail 1%']] },
    { h:'Underwriting notes', p:'2009 roof accepted. Mortgagee clause to Lakeshore Mortgage ISAOA. Evidence of insurance delivered to lender and title on binding.' }
  ]),
  appraisal: paper('Uniform Residential Appraisal Report (summary)', { Property:'1847 Willow Ridge Dr', 'Effective date':'Nov 14, 2026', Reported:'Nov 20, 2026', 'Ordered by':'Lakeshore Mortgage (lender-ordered; agent coordinated access only)', 'Appraised value':'$482,000' }, [
    { table:[['Comparable','Sale price','Adjusted'],['1902 Willow Ridge Dr · sold Aug 2026','$479,000','$484,500'],['3410 Lawton Ct · sold Jun 2026','$470,000','$478,000'],['2166 Devonshire Rd · sold Sep 2026','$495,000','$483,000']] },
    { h:'Conclusion', p:'Sales comparison approach supports a value of $482,000, equal to the contract price. No repairs required as a condition of the appraisal.' }
  ]),
  title_commitment: paper('Commitment for Title Insurance', { Issuer:'Great Lakes Title', Officer:'Elena Vasquez', Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103', Issued:'Nov 24, 2026', 'Proposed insured':'Alex Morgan and Sam Okafor · Lakeshore Mortgage (lender policy)' }, [
    { h:'Schedule B · exceptions', list:['Utility easement, 10 ft along the east lot line, recorded 1993','Willow Ridge subdivision covenants and restrictions, recorded 1992','Taxes for 2026 not yet due and payable'] },
    { h:'Requirements', list:['Warranty deed from seller to buyers','Payoff and release of the seller’s existing mortgage','Executed lender mortgage'] },
    { note:'Both exceptions are standard for the subdivision and require no action before closing.' }
  ]),
  closing_disclosure: paper('Closing Disclosure', { Lender:'Lakeshore Mortgage', Issued:'Dec 8, 2026', Received:'Dec 8, 2026 (acknowledged by borrowers)', 'Closing date':'Dec 12, 2026', 'Disbursement date':'Dec 12, 2026', 'Settlement agent':'Great Lakes Title' }, [
    { table:[['Loan terms','Value'],['Loan amount','$385,600'],['Interest rate','6.125% fixed'],['Monthly principal and interest','$2,343.08'],['Estimated total monthly payment','$3,123.08']] },
    { table:[['Cash to close','Amount'],['Sale price','$482,000.00'],['Loan amount','−$385,600.00'],['Closing costs','$8,912.18'],['Earnest money deposit','−$5,000.00'],['Seller credit (Amendment 1)','−$3,500.00'],['Cash to close','$96,812.18']] },
    { note:'You received this Closing Disclosure on Dec 8. Federal rules require at least three business days between receipt and consummation; the earliest signing is Dec 11. Lakeshore Mortgage keeps the official record. Acknowledging receipt is not approval of every figure; ask Jordan about anything unclear.' }
  ]),
  closing_funds: paper('Closing Funds Instructions', { Holder:'Great Lakes Title', Officer:'Elena Vasquez', Amount:'$96,812.18', Deadline:'Thu Dec 11, 2026, 2:00 PM ET', Verified:'Dec 9, 2026, 4:05 PM ET by phone at the Great Lakes Title number on file' }, [
    { h:'How to send', list:['Wire from your bank using the account details you confirmed by phone with Elena.','Reference: 1847 Willow Ridge Dr · Morgan/Okafor · closing Dec 12.','Allow one business day. Bring the wire confirmation to closing.'] },
    { note:'These instructions do not change. If anything appears to change them, stop and call Elena Vasquez at the number you already have. Kanah never places account numbers in this document, in email or in notifications.' }
  ]),
  walkthrough: paper('Final Walkthrough Checklist', { Property:'1847 Willow Ridge Dr', When:'Thu Dec 11, 2026, 4:00 PM ET', With:'Maya Chen' }, [
    { list:['Property condition consistent with Oct 28 inspection','Roof flashing (Finding 1) — check for any interim repair or damage','Included items present: kitchen appliances, washer, dryer, window treatments','Utilities on; heat, water, electrical operating','Seller’s belongings removed; no new damage','Keys, garage openers and codes accounted for'] },
    { note:'A walkthrough confirms condition; it is not acceptance of unresolved items. Raise anything with Maya before signing.' }
  ]),
  settlement_statement: paper('Settlement Statement (Buyer)', { 'Settlement agent':'Great Lakes Title', File:'GLT-26-4471', Property:'1847 Willow Ridge Dr', Date:'Dec 12, 2026' }, [
    { table:[['Item','Debit','Credit'],['Sale price','$482,000.00',''],['Loan proceeds','','$385,600.00'],['Earnest money deposit','','$5,000.00'],['Seller credit (Amendment 1)','','$3,500.00'],['Lender charges','$3,262.18',''],['Title and settlement charges','$2,900.00',''],['Recording and transfer','$1,250.00',''],['Prepaid interest and escrow','$1,500.00',''],['Funds from buyer','','$96,812.18'],['Totals','$490,912.18','$490,912.18']] },
    { sig:['Alex Morgan · Dec 12', 'Sam Okafor · Dec 12', 'Elena Vasquez, Great Lakes Title'] }
  ]),
  signed_package: paper('Signed Closing Package', { Property:'1847 Willow Ridge Dr', Signed:'Dec 12, 2026, 9:40 AM ET', Where:'Great Lakes Title, 2723 S State St, Ann Arbor', Present:'Alex Morgan, Sam Okafor, Elena Vasquez (closer), Maya Chen' }, [
    { h:'Documents executed', list:['Promissory note · Lakeshore Mortgage','Mortgage','Closing Disclosure acknowledgment','Settlement statement','Affidavits and lender disclosures'] },
    { h:'Status', p:'Signing complete. Funding, recording, disbursement and possession are confirmed separately and appear on your Timeline as each is confirmed.' }
  ]),
  deed: paper('Warranty Deed (Recorded Copy)', { Grantor:'(seller)', Grantees:'Alex Morgan and Sam Okafor', Property:'1847 Willow Ridge Dr, Ann Arbor, MI 48103 · Willow Ridge Subdivision Lot 41', Recorded:'Dec 12, 2026, 2:15 PM · Washtenaw County Register of Deeds', Reference:'Liber 5678, Page 0412 (mock)' }, [
    { p:'The grantor conveys and warrants to the grantees the real property described above, together with all improvements, subject to easements and restrictions of record.' },
    { sig:['Grantor · Dec 12, 2026', 'Notarized · Washtenaw County, Michigan'] }
  ]),
  possession_note: paper('Possession Confirmation', { Property:'1847 Willow Ridge Dr', Authorized:'Dec 12, 2026, 5:00 PM ET', By:'Elena Vasquez, Great Lakes Title', Basis:'Recording confirmed 2:15 PM; disbursement confirmed 3:05 PM; possession at closing per agreement' }, [
    { p:'Possession is authorized. Maya Chen will deliver keys, garage openers and codes at the property at 5:00 PM.' }
  ]),
  warranty: paper('Home Warranty (Optional)', { Provider:'(your choice)', Term:'12 months from Dec 12, 2026', Cost:'From $520/year' }, [
    { p:'A home warranty is an optional service contract covering repair or replacement of major systems and appliances. It is not required to close and is not part of your purchase agreement. Given the inspection notes on the water heater, some buyers choose one; the decision is entirely yours.' }
  ])
};
