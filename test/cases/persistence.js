// needs: storage

var CURRENCIES = { USD:{dec:2}, EUR:{dec:2}, GBP:{dec:2}, SGD:{dec:2}, CNY:{dec:2}, JPY:{dec:0}, KRW:{dec:0} };
var THEMES=["auto","dark","light"]; var themeState="auto";
var MIN_PLAYERS=2, MAX_PLAYERS=9, KEY="poker.ledger.v1";
var state={players:[],defaultBuyIn:2000,currency:"USD"};
var store={};
var localStorage={ getItem:function(k){return store[k]||null;}, setItem:function(k,v){store[k]=v;} };

  function load(){
    try{
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if(!s) return false;
      if(THEMES.indexOf(s.theme) >= 0) themeState = s.theme;
      state.currency = CURRENCIES[s.currency] ? s.currency : "USD";
      if(typeof s.defaultBuyIn === "number" && isFinite(s.defaultBuyIn) && s.defaultBuyIn >= 0){
        state.defaultBuyIn = Math.round(s.defaultBuyIn);
      }
      if(!Array.isArray(s.players) || s.players.length < MIN_PLAYERS) return false;
      state.players = s.players.slice(0, MAX_PLAYERS).map(function(p, i){
        return {
          name: typeof p.name === "string" ? p.name.slice(0, 40) : "Player " + (i + 1),
          buyIns: (Array.isArray(p.buyIns) ? p.buyIns : []).map(function(c){
            return (typeof c === "number" && isFinite(c) && c >= 0) ? Math.round(c) : 0;
          }),
          cashOut: (typeof p.cashOut === "number" && isFinite(p.cashOut) && p.cashOut >= 0) ? Math.round(p.cashOut) : 0
        };
      });
      return true;
    }catch(e){ return false; }
  }


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
