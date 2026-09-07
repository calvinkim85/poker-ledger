// needs: storage



function reset(){ state={players:[],defaultBuyIn:2000,currency:"USD"}; themeState="auto"; }

log("-- migration: a pre-currency payload is USD cents --");
reset();
store[KEY]=JSON.stringify({ players:[{name:"Alice",buyIns:[2000],cashOut:6000},
                                     {name:"Bob",buyIns:[2000,2000],cashOut:0}],
                            defaultBuyIn:2000, theme:"dark" });   /* no currency key */
eq("load succeeds", load(), true);
eq("defaults to USD", state.currency, "USD");
eq("numbers untouched", state.players[0].cashOut, 6000);
eq("theme still read", themeState, "dark");

log("-- a KRW payload round-trips --");
reset();
store[KEY]=JSON.stringify({ players:[{name:"A",buyIns:[50000],cashOut:0},
                                     {name:"B",buyIns:[50000],cashOut:100000}],
                            defaultBuyIn:50000, currency:"KRW", theme:"auto" });
eq("load succeeds", load(), true);
eq("currency kept", state.currency, "KRW");
eq("won kept whole", state.players[1].cashOut, 100000);

log("-- junk currency falls back to USD --");
reset();
store[KEY]=JSON.stringify({ players:[{name:"A",buyIns:[100],cashOut:0},{name:"B",buyIns:[100],cashOut:200}],
                            defaultBuyIn:100, currency:"BTC", theme:"auto" });
load();
eq("unknown code rejected", state.currency, "USD");

log("-- corrupt payloads never throw --");
reset(); store[KEY]="{not json";
eq("garbage returns false", load(), false);
reset(); store[KEY]=JSON.stringify({players:[{name:"solo",buyIns:[100],cashOut:0}],currency:"EUR"});
eq("one player rejected", load(), false);
eq("but currency still applied", state.currency, "EUR");

log("-- this suite tests the real load(), not a copy of it --");
/* It used to carry a hand-written duplicate of load() plus its own CURRENCIES, state
   and localStorage, which shadowed everything the harness extracts. The copy had
   drifted: no MAX_BUYINS cap, no clampUnits, no `done` field. Eleven tests were
   passing against a fossil.

   These assertions exercise behaviour that only exists in the real implementation, so
   the duplicate cannot quietly come back. */
reset();
var many = [];
for (var i = 0; i < 250; i++) many.push(2000);
store[KEY] = JSON.stringify({
  players: [{ name:"A", buyIns:many, cashOut:1e30 },
            { name:"B", buyIns:[2000], cashOut:0 }],
  defaultBuyIn: 2000, currency:"USD", absorb:false, theme:"dark"
});
eq("load succeeds", load(), true);
eq("buy-ins are capped at MAX_BUYINS", state.players[0].buyIns.length, MAX_BUYINS);
eq("an absurd cash-out is clamped, not stored raw",
   state.players[0].cashOut <= MAX_AMOUNT * 100, true);
eq("and stays a safe integer", Number.isSafeInteger(state.players[0].cashOut), true);
eq("the cashed-out flag is populated", state.players[0].done, false);
