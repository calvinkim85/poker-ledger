// needs: storage

var CURRENCIES={USD:{dec:2},EUR:{dec:2},GBP:{dec:2},SGD:{dec:2},CNY:{dec:2},JPY:{dec:0},KRW:{dec:0}};
var THEMES=["dark","light"];
var MIN_PLAYERS=2, MAX_PLAYERS=9, KEY="poker.ledger.v1";
var OS_DARK = true;
var window = { matchMedia:function(q){ return { matches: OS_DARK }; } };
  function systemTheme(){
    try{
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }catch(e){ return "dark"; }
  }
var themeState=null;
var state={players:[],defaultBuyIn:2000,currency:"USD",absorb:false};
var store={};
var localStorage={ getItem:function(k){return store[k]||null;}, setItem:function(k,v){store[k]=v;} };

  function load(){
    try{
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      if(!s) return false;
      if(THEMES.indexOf(s.theme) >= 0) themeState = s.theme;
      else if(s.theme === "auto") themeState = systemTheme();
      state.currency = CURRENCIES[s.currency] ? s.currency : "USD";
      state.absorb = s.absorb === true;
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


/* the boot line from the bottom of the IIFE */
function boot(){ load(); if(!themeState) themeState = systemTheme(); return themeState; }
function reset(){ themeState=null; state={players:[],defaultBuyIn:2000,currency:"USD",absorb:false}; store={}; }

var GAME = { players:[{name:"A",buyIns:[2000],cashOut:0},{name:"B",buyIns:[2000],cashOut:4000}],
             defaultBuyIn:2000, currency:"USD" };
function saved(extra){
  var o = JSON.parse(JSON.stringify(GAME));
  for(var k in extra) o[k]=extra[k];
  return JSON.stringify(o);
}

log("-- auto is gone --");
eq("only two themes", THEMES, ["dark","light"]);

log("-- a stored \"auto\" migrates to a real side --");
reset(); OS_DARK = true;  store[KEY]=saved({theme:"auto"});
eq("auto + dark OS  -> dark", boot(), "dark");
reset(); OS_DARK = false; store[KEY]=saved({theme:"auto"});
eq("auto + light OS -> light", boot(), "light");

log("-- an explicit choice survives and ignores the OS --");
reset(); OS_DARK = true;  store[KEY]=saved({theme:"light"});
eq("stored light wins over dark OS", boot(), "light");
reset(); OS_DARK = false; store[KEY]=saved({theme:"dark"});
eq("stored dark wins over light OS", boot(), "dark");

log("-- first run, nothing stored --");
reset(); OS_DARK = true;
eq("seeds from dark OS", boot(), "dark");
reset(); OS_DARK = false;
eq("seeds from light OS", boot(), "light");

log("-- junk theme falls back to the OS --");
reset(); OS_DARK = false; store[KEY]=saved({theme:"neon"});
eq("unknown value ignored", boot(), "light");

log("-- the absorb toggle persists --");
reset(); store[KEY]=saved({absorb:true});  load();
eq("true round-trips", state.absorb, true);
reset(); store[KEY]=saved({absorb:false}); load();
eq("false round-trips", state.absorb, false);
reset(); store[KEY]=saved({});             load();
eq("missing key defaults off", state.absorb, false);
reset(); store[KEY]=saved({absorb:"yes"}); load();
eq("junk is not truthy-coerced", state.absorb, false);
