# draw-what-now

My take on this popular drawing game format; each player starts by picking a phrase, after which other players will either be required to draw the phrase, or guess the phrase from
the previous user's drawing. Lots of fun as a party game!

I often found the controls in similar games to be a bit lacking, so I did what any good dev always says they will, and rewrote it! Turned out a bit harder than expected, but a good
learning process.

The front end is written in React, with heavy use of styled-components. The backend is all ktor. It's all hosted in GCP, though the associated storage buckets are set to only retain
content for a measly 1 day.

Plenty of TODO's, but probably good enough for now. If people like it I'll improve it, but most likely it's just a fun little side project I keep running for posterity :)
