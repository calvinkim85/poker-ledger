// needs: core

/* Switching currency used to rescale by the minor unit alone, so $50 became 50 won —
   a number nobody buys in for. Each currency now carries its own standard buy-in.

   These are not conversions of one another and must not be checked against an exchange
   rate; they are the round amount people actually hand over. What IS worth asserting is
   that each one is a sane, round, human amount in its own currency. */

log("-- every currency has a standard buy-in --");
var CODES = ["USD", "EUR", "GBP", "SGD", "CNY", "JPY", "KRW"];
CODES.forEach(function(code){
  var c = CURRENCIES[code];
  eq(code + " exists", !!c, true);
  eq(code + " declares a default buy-in", typeof c.def, "number");
  eq(code + " default is a positive whole number of minor units",
     c.def > 0 && c.def === Math.round(c.def), true);
});

log("-- each default is a round number in its own currency --");
CODES.forEach(function(code){
  var c = CURRENCIES[code];
  var major = c.def / Math.pow(10, c.dec);
  eq(code + " default is a whole major unit (" + major + ")", major === Math.round(major), true);
  /* Nobody buys in for 47. Every default should be a multiple of 50 in its own major
     unit, or of 100 for the currencies whose notes are large. */
  eq(code + " default is a round amount", major % 50 === 0 || major % 100 === 0, true);
});

log("-- the defaults are in a sane band for a home game --");
/* Deliberately loose: these are not rate conversions and rates drift. The point is
   that no currency is off by an order of magnitude, which is the bug being fixed. */
var majors = {};
CODES.forEach(function(code){
  majors[code] = CURRENCIES[code].def / Math.pow(10, CURRENCIES[code].dec);
});
eq("USD is 50", majors.USD, 50);
eq("EUR is 50", majors.EUR, 50);
eq("GBP is 50", majors.GBP, 50);
eq("SGD is 50", majors.SGD, 50);
eq("CNY is 300, not 50 — 50 yuan is about seven dollars", majors.CNY, 300);
eq("JPY is 5000, not 50 — 50 yen is loose change", majors.JPY, 5000);
eq("KRW is 50000, not 50 — 50 won is worth nothing", majors.KRW, 50000);

log("-- the no-minor-unit currencies stay whole --");
["JPY", "KRW"].forEach(function(code){
  eq(code + " has no minor unit", CURRENCIES[code].dec, 0);
  eq(code + " default needs no rounding", CURRENCIES[code].def % 1, 0);
});

log("-- switching never produces a default of a different magnitude than the currency --");
/* The original bug in one assertion: a default must never be so small that it would
   read as loose change in its own currency. */
CODES.forEach(function(code){
  var c = CURRENCIES[code];
  var major = c.def / Math.pow(10, c.dec);
  var floor = c.dec === 0 ? 1000 : 10;   /* yen/won live in thousands; the rest in tens */
  eq(code + " default is not loose change (" + major + " >= " + floor + ")", major >= floor, true);
});
