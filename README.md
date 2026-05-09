<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,8,15&height=180&section=header&text=Mnemonic+Defusal+Squad&fontSize=36&fontColor=000000&fontAlignY=38&desc=Seed+phrase+memorization+drill+disguised+as+a+bomb+defusal+game&descAlignY=58&descSize=14&animation=fadeIn" width="100%"/>

<div align="center">

[![Play](https://img.shields.io/badge/Play%20Now-bbf7d0?style=for-the-badge&logoColor=000)](https://mnemonic-defusal-squad.vercel.app)
[![License](https://img.shields.io/badge/MIT-bfdbfe?style=for-the-badge&logoColor=000)](LICENSE)
[![Platform](https://img.shields.io/badge/Farcaster%20Mini%20App-fde68a?style=for-the-badge&logoColor=000)]()
[![Tech](https://img.shields.io/badge/JavaScript%20%2B%20Base-fca5a5?style=for-the-badge&logoColor=000)]()

</div>

<div align="center">
<i>A bomb-defusal action game that actually trains you to remember your seed phrase .... enter the next word under pressure before the timer runs out.</i>
</div>

---

```
[BOMB DEFUSAL SEQUENCE INITIATED]
Phrase word #7 of 12:
  _ _ _ _ _ _ _
  You have 8 seconds. TYPE IT.
  [  wrong  ]  [  BOOM  ]
```

---

## ✦ Features

<div align="center">

| | Feature | What it does |
|:---:|---|---|
| 💣 | Bomb defusal mechanic | A ticking countdown forces you to type the next seed word under pressure |
| 🔒 | Your own phrase | Enter your own 12/24 word seed phrase to practice recalling it |
| 🧠 | Memory training | Repeated pressure-based recall builds real muscle memory |
| 📱 | Farcaster native | Runs inside Warpcast / Base app as a mini app |
| 🏅 | Add to mini app | One-tap button to save the app to your Farcaster client |

</div>

---

## ✦ Download & Run

**Step 1** .... Clone the repo

```bash
git clone https://github.com/0xnurrabby/Mnemonic-Defusal-Squad
cd Mnemonic-Defusal-Squad
```

**Step 2** .... Serve the files

```bash
start index.html

# Or use a local server
npx serve .
# Open http://localhost:3000
```

**Step 3** .... Enter your seed phrase and start training

---

## ✦ Setup

```
1. Clone the repo
2. Open index.html in a browser
3. Enter your seed phrase words (stays local, never sent anywhere)
4. Click Start Defusal
5. Type each word before the timer hits zero
6. For Farcaster: deploy to Vercel and open inside Warpcast
```

---

## ✦ Project Structure

```
Mnemonic-Defusal-Squad/
  index.html     ->  app entry with Farcaster mini app meta
  app.js         ->  game logic: timer, word recall, scoring
  styles.css     ->  bomb/defusal dark theme
  assets/        ->  icons, splash, embed images
  .well-known/   ->  Farcaster app manifest
```

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,8,15&height=100&section=footer&animation=fadeIn" width="100%"/>

<div align="center">MIT License .... built by <a href="https://github.com/0xnurrabby">0xnurrabby</a></div>
