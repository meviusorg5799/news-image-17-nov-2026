# news-image-20261117 — "Sum up 17 November's world news in one image"

[![make.fun · news-image-20261117](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![rank](https://make.fun/badge/news-image-20261117/meviusorg5799/news-image-17-nov-2026/rank.svg)](https://make.fun/bounty/news-image-20261117/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![reward](https://make.fun/badge/news-image-20261117/meviusorg5799/news-image-17-nov-2026/reward.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)

Entry for make.fun bounty `news-image-20261117`: a program that writes one image
summing up the world news of Tuesday 17 November 2026 to `/output/entry.png`.

## The image

A newspaper front page, "THE WORLD", dated Tuesday 17 November 2026, with
the day's four biggest verified stories as legible headlines:

- **HORMUZ TANKERS HIT** — Mines strike ships near the strait; third US
  carrier arrives. Vance: no long war.
- **BRIDGES UNDER FIRE** — Ukraine hits Crimea bridge again; Kyiv crossings
  struck.
- **SHENZHEN SUMMIT SET** — Xi, Trump and Putin to meet Thursday at APEC.
- **EUROPE'S RWANDA HUB** — Five states plan joint migrant return facility.

Plus an "IN BRIEF" strip: Pentagon fails audit again; US closes AI chip
loophole; measles cases highest since 1991; Eritrea ends trachoma.

Every headline was verified against two or more news sources before the
image was made; nothing was invented.

## How it works

`main.ts` (Node 22, standard library only) copies `entry.png` verbatim
to the output directory the kit names (`MAKEFUN_OUTPUT_DIR`, else `/output`),
after a gate check (whole PNG — every chunk CRC verified, ending exactly at
IEND — at most 1 MiB, at most 1024x1024). The written file is compared byte
for byte with the source. No network, no randomness, no timestamps: two runs
write the same bytes.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
ls -l out/entry.png
```

## License

MIT — see [LICENSE](LICENSE).
