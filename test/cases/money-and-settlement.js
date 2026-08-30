// needs: core

function P(name, ins, out){ return { name:name, buyIns:ins, cashOut:out }; }
function use(c){ state.currency = c; }
function tally(players){
  var potIn=0, potOut=0;
  players.forEach(function(p){ potIn += totalIn(p); potOut += p.cashOut; });
  var r = settle(players);
  return { diff: potOut - potIn,
           t: r.transfers.map(function(x){ return x.from+"->"+x.to+" "+fmt(x.cents); }),
           unpaid: r.unpaid.map(function(x){ return x.name+" "+fmt(x.amt); }),
           unowed: r.unowed.map(function(x){ return x.name+" "+fmt(x.amt); }) };
}

/* ============ 1. REGRESSION: the original 39, all under USD ============ */
use("USD");
log("== REGRESSION (USD) ==");
log("-- parseMoney / fmt --");
eq("blank is 0",        parseMoney(""), 0);
eq("plain",             parseMoney("20"), 2000);
eq("decimal",           parseMoney("33.33"), 3333);
eq("dollar sign",       parseMoney("$1,250.50"), 125050);
eq("spaces",            parseMoney("  40 "), 4000);
eq("rounds half up",    parseMoney("0.005"), 1);
eq("letters rejected",  parseMoney("abc"), null);
eq("lone dot rejected", parseMoney("."), null);
eq("negative rejected", parseMoney("-5"), null);
eq("interior junk rejected", parseMoney("12abc34"), null);
eq("symbol-only rejected", parseMoney("$"), null);
eq("trailing code ok",  parseMoney("50.00 USD"), 5000);
eq("CNY symbol ok",     (function(){use("CNY");var v=parseMoney("CN\u00a51,250.50");use("USD");return v;})(), 125050);
eq("fmt",               fmt(125050), "$1,250.50");
eq("fmt zero",          fmt(0), "$0.00");
eq("fmt neg",           fmt(-500), "-$5.00");
eq("fmtSigned up",      fmtSigned(4000), "+$40.00");
eq("fmtSigned down",    fmtSigned(-4000), "-$40.00");
eq("fmtSigned flat",    fmtSigned(0), "$0.00");
eq("toInput",           toInput(2000), "20.00");

log("-- 1. known-answer settlement --");
var a = tally([P("Alice",[2000],6000), P("Bob",[2000,2000],0), P("Carol",[2000],2000)]);
eq("diff is zero", a.diff, 0);
eq("one transfer", a.t, ["Bob->Alice $40.00"]);
eq("nothing unpaid", a.unpaid.concat(a.unowed), []);

log("-- 2. short by $5 --");
var b = tally([P("Alice",[2000],5500), P("Bob",[2000,2000],0), P("Carol",[2000],2000)]);
eq("diff -500", b.diff, -500);
eq("Bob pays only the 35 Alice is up", b.t, ["Bob->Alice $35.00"]);
eq("Bob left holding the missing 5", b.unowed, ["Bob $5.00"]);
eq("no creditor unpaid", b.unpaid, []);

log("-- 2b. short where a winner cannot be paid --");
var b2 = tally([P("Alice",[2000],6000), P("Bob",[2000],3000), P("Carol",[2000],0)]);
eq("diff +3000", b2.diff, 3000);

log("-- 3. over by $5 --");
var c = tally([P("Alice",[2000],6500), P("Bob",[2000,2000],0), P("Carol",[2000],2000)]);
eq("diff +500", c.diff, 500);
eq("Bob pays all 40", c.t, ["Bob->Alice $40.00"]);
eq("Alice still owed 5", c.unpaid, ["Alice $5.00"]);

log("-- 4. cents: no residual --");
var d = tally([P("A",[3333],10000), P("B",[3333],0), P("C",[3333],0)]);
eq("diff 1 cent", d.diff, 1);
var d2 = tally([P("A",[3333],9999), P("B",[3333],0), P("C",[3333],0)]);
eq("balanced", d2.diff, 0);
eq("two clean transfers", d2.t, ["B->A $33.33","C->A $33.33"]);

log("-- 5. everyone flat --");
var e = tally([P("A",[2000],2000), P("B",[2000],2000)]);
eq("no transfers", e.t, []);
eq("diff 0", e.diff, 0);

log("-- 6. nine players --");
var nine = [];
for(var i=0;i<9;i++) nine.push(P("P"+(i+1),[2000], i===0 ? 18000 : 0));
var f = tally(nine);
eq("diff 0", f.diff, 0);
eq("8 transfers", f.t.length, 8);

log("-- 7. player with no buy-ins --");
var g = tally([P("A",[],5000), P("B",[5000],0)]);
eq("diff 0", g.diff, 0);
eq("B pays A", g.t, ["B->A $50.00"]);

log("-- 8. multi-way pot --");
var h = tally([P("A",[2000],5000), P("B",[2000],3000), P("C",[2000],0), P("D",[2000],0)]);
eq("diff 0", h.diff, 0);
eq("greedy result", h.t, ["C->A $20.00","D->A $10.00","D->B $10.00"]);
eq("transfers <= n-1", h.t.length <= 3, true);

/* ============ 2. NEW: currency behaviour ============ */
log("");
log("== CURRENCY ==");
log("-- zero-decimal (KRW) --");
use("KRW");
eq("parse grouped",   parseMoney("50,000"), 50000);
eq("parse symbol",    parseMoney("₩50,000"), 50000);
eq("fmt no decimals", fmt(50000), "₩50,000");
eq("toInput no .00",  toInput(50000), "50000");
eq("fmtSigned",       fmtSigned(-50000), "-₩50,000");
use("JPY");
eq("yen fmt",         fmt(3000), "¥3,000");
eq("yen toInput",     toInput(3000), "3000");

log("-- symbols are unambiguous --");
var syms = {};
["USD","SGD","CNY","JPY","KRW","EUR","GBP"].forEach(function(c){
  use(c); syms[c] = fmt(100000);
});
eq("USD",  syms.USD, "$1,000.00");
eq("SGD",  syms.SGD, "S$1,000.00");
eq("CNY",  syms.CNY, "CN¥1,000.00");
eq("JPY",  syms.JPY, "¥100,000");
eq("KRW",  syms.KRW, "₩100,000");
eq("EUR",  syms.EUR, "€1,000.00");
eq("GBP",  syms.GBP, "£1,000.00");
eq("USD and SGD differ", syms.USD !== syms.SGD, true);
eq("CNY and JPY differ", syms.CNY !== syms.JPY, true);
eq("all seven distinct",
   Object.keys(syms).map(function(k){return syms[k];})
     .filter(function(v,i,arr){return arr.indexOf(v)===i;}).length, 7);

log("-- currency switch relabels --");
function switchFixture(){
  state.players = [P("Alice",[2000],6000), P("Bob",[2000,2000],0)];
  state.defaultBuyIn = 2000;
}
use("USD"); switchFixture();
var r1 = convertAll("USD","KRW"); use("KRW");
eq("USD 2000 -> KRW 20",  state.players[0].buyIns[0], 20);
eq("cashOut relabelled",  state.players[0].cashOut, 60);
eq("default relabelled",  state.defaultBuyIn, 20);
eq("no rounding notice (all whole)", r1, false);

use("USD"); switchFixture();
state.players[0].cashOut = 2050;             /* $20.50 */
var r2 = convertAll("USD","KRW"); use("KRW");
eq("$20.50 -> ₩21 (rounds)", state.players[0].cashOut, 21);
eq("rounding notice fires", r2, true);

use("KRW");
state.players = [P("A",[50000],0)]; state.defaultBuyIn = 50000;
var r3 = convertAll("KRW","USD"); use("USD");
eq("₩50,000 -> $50,000.00", state.players[0].buyIns[0], 5000000);
eq("no notice widening", r3, false);

use("USD"); switchFixture();
var r4 = convertAll("USD","EUR");
eq("2dp -> 2dp lossless", state.players[0].buyIns[0], 2000);
eq("no notice", r4, false);

log("-- settlement is currency-agnostic --");
use("KRW");
var k = tally([P("Alice",[20],60), P("Bob",[20,20],0), P("Carol",[20],20)]);
eq("KRW diff 0", k.diff, 0);
eq("KRW one transfer", k.t, ["Bob->Alice ₩40"]);
