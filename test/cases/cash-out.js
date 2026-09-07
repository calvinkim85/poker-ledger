// needs: storage

/* Early cash-out. From the guides' own diagnosis: a player who leaves at 11pm is one
   of the two commonest causes of a broken count — they take their money and their
   chips go back in the tray BEFORE anyone records the figure.

   The site described that failure and gave no way to avoid it. Marking a player
   cashed out locks their number, blocks accidental rebuys, and makes it obvious at a
   glance who is still playing. */

log("-- the flag survives a save and reload --");
store[KEY] = JSON.stringify({
  players: [{ name:"A", buyIns:[2000], cashOut:5500, done:true },
            { name:"B", buyIns:[2000], cashOut:500,  done:false },
            { name:"C", buyIns:[2000], cashOut:0 }],        /* saved before this existed */
  defaultBuyIn: 2000, currency:"USD", absorb:false, theme:"dark"
});
eq("a stored game loads", load(), true);
eq("a player marked cashed out stays marked", state.players[0].done, true);
eq("a player not marked stays unmarked", state.players[1].done, false);
eq("a save predating the feature loads as not-cashed-out", state.players[2].done, false);

log("-- the flag is always a strict boolean, whatever was stored --");
[["yes"], [1], [null], [0], [{}]].forEach(function(v){
  store[KEY] = JSON.stringify({
    players: [{ name:"A", buyIns:[2000], cashOut:0, done:v[0] },
              { name:"B", buyIns:[2000], cashOut:0 }],
    defaultBuyIn: 2000, currency:"USD", absorb:false, theme:"dark"
  });
  load();
  eq("stored done=" + JSON.stringify(v[0]) + " loads as a boolean",
     state.players[0].done === true || state.players[0].done === false, true);
});

log("-- cashing out never changes the arithmetic --");
/* This is workflow state. If it ever moved a net or a transfer it would be a bug:
   identical numbers must settle identically whether or not anyone pressed it. */
function table(done){
  return [{ name:"A", buyIns:[2000], cashOut:5500, done:done },
          { name:"B", buyIns:[2000], cashOut:500,  done:done },
          { name:"C", buyIns:[2000], cashOut:0,    done:done }];
}
eq("the same table settles identically either way",
   JSON.stringify(settle(table(false))), JSON.stringify(settle(table(true))));
eq("nets are unaffected",
   table(true).map(netOf).join(","), table(false).map(netOf).join(","));
