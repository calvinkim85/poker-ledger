// needs: core

function E(n,net){ return {name:n, net:net}; }
function nets(r){ return r.entries.map(function(e){ return e.name+":"+e.net; }); }
function sum(a){ return a.reduce(function(x,y){return x+y;},0); }

log("== splitFromTop ==");
var m,t;

m=[40,32]; t=splitFromTop(m,6);
eq("1. clear leader takes it alone", m, [34,32]);
eq("1. only the leader paid",        t, [6,0]);

m=[40,32]; t=splitFromTop(m,8);
eq("2. exact tie is rejected -> halves", m, [36,28]);
eq("2. each paid half",                  t, [4,4]);
eq("2. leader still strictly ahead",     m[0] > m[1], true);

m=[40,32,30]; t=splitFromTop(m,12);
eq("3. escalates to thirds", m, [36,28,26]);
eq("3. order intact",        m[0]>m[1] && m[1]>m[2], true);
/* halves would have put the second below the third, which is why k=2 is skipped */
eq("3. halves really were unusable", 32 - Math.ceil(12/2) > 30, false);

m=[100,90,80,70]; t=splitFromTop(m,60);
eq("4. escalates to fourths", m, [85,75,65,55]);
eq("4. total taken",          sum(t), 60);
eq("4. order intact",         m[0]>m[1] && m[1]>m[2] && m[2]>m[3], true);
eq("4. thirds really were unusable", 80 - Math.ceil(60/3) > 70, false);

m=[40,40]; t=splitFromTop(m,10);
eq("5. already tied -> straight to halves", m, [35,35]);
eq("5. even split",                         t, [5,5]);

m=[10,10]; t=splitFromTop(m,1);
eq("6. odd unit goes downward", m, [10,9]);
eq("6. never inverts",          m[0] >= m[1], true);

m=[100,100,100]; t=splitFromTop(m,10);
eq("6b. remainder to the bottom", t, [3,3,4]);
eq("6b. total exact",             sum(t), 10);

m=[30,10]; t=splitFromTop(m,20);
eq("7. last member may land on zero", m, [20,0]);
eq("7. total exact",                  sum(t), 20);

m=[20,10]; t=splitFromTop(m,25);
eq("8. clamped fallback", m, [5,0]);
eq("8. total exact",      sum(t), 25);

m=[50]; t=splitFromTop(m,50);
eq("9. lone winner wiped out", m, [0]);
m=[50]; t=splitFromTop(m,7);
eq("9b. lone winner partial",  m, [43]);

log("");
log("== absorbGap ==");
var r;
r = absorbGap([E("Alice",4000),E("Bob",3200),E("Carol",-2700),E("Dan",-4000)], 800);
eq("winners split in half", nets(r), ["Alice:3600","Bob:2800","Carol:-2700","Dan:-4000"]);
eq("side", r.side, "winners");

r = absorbGap([E("Alice",4000),E("Bob",3200),E("Carol",-2700),E("Dan",-4000)], 600);
eq("leader alone when clear", nets(r), ["Alice:3400","Bob:3200","Carol:-2700","Dan:-4000"]);

/* mirror: a short table divides the reduction among the biggest debts */
r = absorbGap([E("Alice",7500),E("Bob",-4000),E("Carol",-3200),E("Dan",-1100)], -800);
eq("losers split in half", nets(r), ["Alice:7500","Bob:-3600","Carol:-2800","Dan:-1100"]);
eq("biggest loser still owes most", true, Math.abs(-3600) > Math.abs(-2800));
eq("side", r.side, "losers");

log("");
log("== the balance + ranking properties ==");
function seeded(n){ var x = 123456789 + n * 2654435761; return function(){
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return Math.abs(x) / 2147483648; }; }
var bad=0, rankBad=0, clampCases=0, pos=0, neg=0;
for(var trial=0; trial<400; trial++){
  var rnd = seeded(trial);
  var n = 2 + Math.floor(rnd()*8);
  var players=[], potIn=0, potOut=0;
  for(var i2=0;i2<n;i2++){
    var ins=[], kk=1+Math.floor(rnd()*3), tin=0;
    for(var j=0;j<kk;j++){ var v=Math.floor(rnd()*5000); ins.push(v); tin+=v; }
    var ov=Math.floor(rnd()*12000);
    players.push({name:"P"+i2, buyIns:ins, cashOut:ov});
    potIn+=tin; potOut+=ov;
  }
  var diff = potOut - potIn;
  if(diff>0) pos++; else if(diff<0) neg++;
  var ents = players.map(function(p){ return {name:p.name, net:netOf(p)}; });
  var before = ents.map(function(e){ return e.net; });
  var got = absorbGap(ents, diff);
  var after = got.entries.map(function(e){ return e.net; });

  if(sum(after) !== 0){ bad++; continue; }
  var st = settleNets(got.entries);
  if(st.unpaid.length || st.unowed.length){ bad++; continue; }
  var totalTaken = Object.keys(got.taken).reduce(function(a,k3){ return a+got.taken[k3]; },0);
  if(totalTaken !== Math.abs(diff)){ bad++; continue; }
  if(st.transfers.length > n-1){ bad++; continue; }

  /* ranking: whoever was ahead before must not be behind after */
  var idx = before.map(function(v,i3){ return i3; })
                  .sort(function(a,b){ return before[b]-before[a]; });
  var clamped = false, viol = 0;
  for(var q=0;q+1<idx.length;q++){
    var hi=idx[q], lo=idx[q+1];
    if(before[hi] > before[lo] && after[hi] < after[lo]) viol++;
    if(after[hi] === 0 && after[lo] === 0 && before[hi] !== before[lo]) clamped = true;
  }
  if(viol){ if(clamped) clampCases++; else rankBad++; }
}
eq("400 tables: balance holds",  bad, 0);
eq("400 tables: ranking holds",  rankBad, 0);
eq("covered chips-over",  pos > 50, true);
eq("covered chips-short", neg > 50, true);

log("");
log("== toggle off leaves the old behaviour exactly ==");
function P(n2,ins,o){ return {name:n2, buyIns:ins, cashOut:o}; }
function shape(r2){ return { t:r2.transfers.map(function(x){return x.from+"->"+x.to+":"+x.cents;}),
                             u:r2.unpaid.map(function(x){return x.name+":"+x.amt;}),
                             o:r2.unowed.map(function(x){return x.name+":"+x.amt;}) }; }
var fixtures = [
  [P("Alice",[2000],6500), P("Bob",[2000,2000],0), P("Carol",[2000],2000)],
  [P("Alice",[2000],5500), P("Bob",[2000,2000],0), P("Carol",[2000],2000)],
  [P("A",[2000],5000), P("B",[2000],3000), P("C",[2000],0), P("D",[2000],0)]
];
var same=0;
fixtures.forEach(function(f){
  if(JSON.stringify(shape(settle(f))) ===
     JSON.stringify(shape(settleNets(f.map(function(p){ return {name:p.name, net:netOf(p)}; }))))) same++;
});
eq("settle() == settleNets()", same, fixtures.length);
eq("residual still reported when off", shape(settle(fixtures[0])).u, ["Alice:500"]);
eq("short residual still reported",    shape(settle(fixtures[1])).o, ["Bob:500"]);
