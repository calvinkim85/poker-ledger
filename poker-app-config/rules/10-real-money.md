# Real-money classification — always loaded

Source: `launch-kit/05-mobile/10-real-money.md` (RMG-01…09) and the `KRG` block
in `launch-kit/03-privacy/10-jurisdiction.md`. That is the canonical text.

The product records real-money stakes. It stays outside gambling regulation only
because of what it does **not** do. These are the six things it must never do.

- **Never move money. RMG-01.** No payment SDK, no stored balance, no payout
  call, no escrow. Settlement is arithmetic the players execute themselves,
  outside the app.
- **No payment deep links carrying an amount. RMG-07.** A Toss, 카카오페이, Venmo
  or Zelle link with a pre-filled sum is a fund-movement path, not a
  convenience. This is the most likely accidental violation, because it looks
  like a UX improvement.
- **No wagering surface. RMG-02.** The app does not run the game, deal,
  shuffle, seat players, or determine an outcome. No RNG or dealer in the
  binary, even for fun, even with no money attached.
- **No lobby, matchmaking, or public game listing. KRG-02.** Recording a game
  the players arranged themselves is a different act from opening a space for
  gambling.
- **Gambling ad categories off. RMG-06.** See `90-hosting.md` — this one is live
  the moment AdSense is enabled.
- **No IAP or purchase of chips, credit, or currency. RMG-04.** Paid tiers, if
  they ever exist, buy software features only.

## KRG-01 — resolved to HIGH, not a launch blocker

형법 §247 reads broadly — opening a place **or space** for gambling for profit,
up to five years — but 개설 is a term of art. 대법원 2001도5802 requires the
accused to *"스스로 주재자가 되어 그 지배하에"* open the venue: to personally be the
host, with the gambling under their control. Providing a tool or a convenience
is at most 도박방조. The profit element is equally narrow: gain received
*"도박장을 연 대가로"* — an entry fee or a rake — not advertising revenue earned by
a calculator.

This product hosts nothing, schedules nothing, seats nobody, and takes no cut.
Neither element is met.

**What is still owed is a written determination, not a lawyer**: record, against
the product as built, that it does not host, organise, schedule, seat, or referee
a game, exercises no 지배 over one, and takes no 대가 for opening a venue. Date
it. An hour with the feature list.

**What would change this:** any feature that makes you the 주재자 — a hosted
table, scheduled games, matchmaking, a lobby, or a cut of the pot. That is what
`KRG-02` guards, and it is why KRG-02 stays BLOCKER while KRG-01 is HIGH. If a
request breaches KRG-02, stop: it changes the legal analysis, not just the
rulebook.

§246 still exposes the **players** — the 일시오락 exception has no won threshold
(대법원 85도2096). That is their position, not yours, and nothing the product
does changes it.
