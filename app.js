import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";
import { Attribution } from "https://esm.sh/ox/erc8021";

const DOMAIN = "https://mnemonic-defusal-squad.vercel.app/";
const PRIMARY_ROUTE = "/";

const USDC_CONTRACT = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const USDC_DECIMALS = 6;

const BUILDER_CODE = "bc_e7bl0hei";
const dataSuffix = Attribution.toDataSuffix({ codes: [BUILDER_CODE] });

// A valid checksummed address must be set for real tips.
// Keep as a harmless placeholder; sending is disabled until BUILDER_CODE is replaced.
const RECIPIENT = "0x5eC6AF0798b25C563B102d3469971f1a8d598121";

const el = (id) => document.getElementById(id);

const state = {
  phase: "idle", // idle | playing | boom | success
  phrase: [],
  shown: [],
  index: 0,
  streak: 0,
  best: 0,
  timerMs: 0,
  timerId: null,
  lowShake: false,
  badges: new Set(),
  tip: {
    open: false,
    amount: "5",
    cta: "Send USDC", // Send USDC | Preparing tip… | Confirm in wallet | Sending… | Send again
    busy: false
  }
};

const BIP39 = [
  "abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid",
  "acoustic","acquire","across","act","action","actor","actress","actual","adapt","add","addict","address","adjust","admit","adult","advance","advice",
  "aerobic","affair","afford","afraid","again","age","agent","agree","ahead","aim","air","airport","aisle","alarm","album","alcohol",
  "alert","alien","all","alley","allow","almost","alone","alpha","already","also","alter","always","amateur","amazing","among","amount","amused",
  "analyst","anchor","ancient","anger","angle","angry","animal","ankle","announce","annual","another","answer","antenna","antique","anxiety","any",
  "apart","apology","appear","apple","approve","april","arch","arctic","area","arena","argue","arm","armed","armor","army","around","arrange","arrest",
  "arrive","arrow","art","artefact","artist","artwork","ask","aspect","assault","asset","assist","assume","asthma","athlete","atom","attack","attend",
  "attitude","attract","auction","audit","august","aunt","author","auto","autumn","average","avocado","avoid","awake","aware","away","awesome","awful",
  "awkward","axis","baby","bachelor","bacon","badge","bag","balance","balcony","ball","bamboo","banana","banner","bar","barely","bargain","barrel",
  "base","basic","basket","battle","beach","bean","beauty","because","become","beef","before","begin","behave","behind","believe","below","belt","bench",
  "benefit","best","betray","better","between","beyond","bicycle","bid","bike","bind","biology","bird","birth","bitter","black","blade","blame","blanket",
  "blast","bleak","bless","blind","blood","blossom","blouse","blue","blur","blush","board","boat","body","boil","bomb","bonus","book","boost","border",
  "boring","borrow","boss","bottom","bounce","box","boy","bracket","brain","brand","brass","brave","bread","breeze","brick","bridge","brief","bright",
  "bring","brisk","broccoli","broken","bronze","broom","brother","brown","brush","bubble","buddy","budget","buffalo","build","bulb","bulk","bullet","bundle"
];

function randInt(n){ return Math.floor(Math.random()*n); }
function pick(arr){ return arr[randInt(arr.length)]; }
function uniq(arr){ return [...new Set(arr)]; }

function toast(msg){
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._tid);
  t._tid = setTimeout(()=>t.classList.remove("show"), 2400);
}

function setShake(on){
  const root = el("mainCard");
  if(on) root.classList.add("shake");
  else root.classList.remove("shake");
}

function setPhase(phase){
  state.phase = phase;
  render();
}

function newPhrase(){
  const phrase = [];
  while(phrase.length < 12){
    const w = pick(BIP39);
    if(!phrase.includes(w)) phrase.push(w);
  }
  return phrase;
}

function startGame(){
  state.phrase = newPhrase();
  state.index = 0;
  state.streak = 0;
  state.shown = state.phrase.slice(0,3);
  state.index = 3; // next word index to guess
  state.badges = new Set();
  setPhase("playing");
  startTimer();
  buildChoices();
}

function startTimer(){
  stopTimer();
  state.timerMs = 10_000;
  tickTimer();
  state.timerId = setInterval(()=>{
    state.timerMs -= 100;
    tickTimer();
    if(state.timerMs <= 0){
      failBoom("Time's up.");
    }
  }, 100);
}

function stopTimer(){
  if(state.timerId){ clearInterval(state.timerId); state.timerId = null; }
}

function tickTimer(){
  const s = Math.max(0, Math.ceil(state.timerMs/1000));
  const clock = el("clock");
  clock.textContent = `${s}s`;
  const low = s <= 3 && state.phase === "playing";
  clock.classList.toggle("low", low);
  setShake(low);
}

function buildChoices(){
  const correct = state.phrase[state.index];
  const decoys = [];
  while(decoys.length < 5){
    const w = pick(BIP39);
    if(w !== correct && !decoys.includes(w)) decoys.push(w);
  }
  const all = uniq([correct, ...decoys]).sort(()=>Math.random()-0.5);
  const wrap = el("choices");
  wrap.innerHTML = "";
  all.forEach(word=>{
    const b = document.createElement("button");
    b.className = "choice";
    b.type = "button";
    b.textContent = word;
    b.addEventListener("click", ()=>choose(word, b));
    wrap.appendChild(b);
  });
}

function choose(word, btn){
  if(state.phase !== "playing") return;
  const correct = state.phrase[state.index];
  const choiceButtons = [...el("choices").querySelectorAll("button")];
  choiceButtons.forEach(b=>b.disabled = true);

  if(word === correct){
    btn.classList.add("correct");
    state.streak += 1;
    state.best = Math.max(state.best, state.streak);
    state.shown.push(correct);
    state.index += 1;

    if(state.streak === 3) state.badges.add("Wire Whisperer");
    if(state.streak === 6) state.badges.add("Timer Tamer");
    if(state.streak === 9) state.badges.add("Diamond Mind");

    if(state.index >= state.phrase.length){
      stopTimer();
      setPhase("success");
      return;
    }

    // Reset the round
    setTimeout(()=>{
      state.timerMs = 10_000;
      buildChoices();
      // keep only last 3 displayed to stay "cryptic"
      state.shown = state.shown.slice(-3);
      choiceButtons.forEach(b=>b.disabled = false);
      render();
    }, 420);
  }else{
    btn.classList.add("wrong");
    failBoom("Wrong wire.");
  }
}

function failBoom(reason){
  if(state.phase !== "playing") return;
  stopTimer();
  setPhase("boom");
  explode(reason);
}

function explode(reason){
  const ex = el("explosion");
  const msg = el("boomMsg");
  msg.textContent = reason;
  ex.classList.add("show");

  const coins = el("coins");
  coins.innerHTML = "";
  for(let i=0;i<24;i++){
    const c = document.createElement("div");
    c.className = "coin";
    c.style.left = `${40 + randInt(140)}px`;
    c.style.top = `${40 + randInt(140)}px`;
    c.style.setProperty("--dx", `${-140 + randInt(280)}px`);
    c.style.setProperty("--dy", `${-220 + randInt(360)}px`);
    c.style.animationDelay = `${Math.random()*0.12}s`;
    coins.appendChild(c);
  }

  setTimeout(()=>{
    ex.classList.remove("show");
    setPhase("idle");
  }, 1250);
}

function render(){
  el("streak").textContent = String(state.streak);
  el("best").textContent = String(state.best);

  const phaseTitle = el("phaseTitle");
  const phaseSub = el("phaseSub");
  const startBtn = el("startBtn");

  if(state.phase === "idle"){
    phaseTitle.textContent = "Briefing";
    phaseSub.textContent = "Memorize by defusing. Outsiders see random words. You see the pattern.";
    startBtn.textContent = "Start Drill";
    startBtn.className = "btn primary";
    startBtn.onclick = startGame;
  }else if(state.phase === "playing"){
    phaseTitle.textContent = "Defuse Mode";
    phaseSub.textContent = "Pick the next word before the timer hits zero.";
    startBtn.textContent = "Abort";
    startBtn.className = "btn";
    startBtn.onclick = ()=>{
      stopTimer();
      setPhase("idle");
    };
  }else if(state.phase === "success"){
    phaseTitle.textContent = "Device Secured";
    phaseSub.textContent = "Full phrase completed. Keep training until it’s effortless.";
    startBtn.textContent = "Run Again";
    startBtn.className = "btn primary";
    startBtn.onclick = startGame;
  }else if(state.phase === "boom"){
    phaseTitle.textContent = "…";
    phaseSub.textContent = "Recovering coins…";
  }

  // word strip
  const ws = el("wordstrip");
  ws.innerHTML = "";
  const show = state.phase === "playing" || state.phase === "success" ? state.shown : ["alpha","…","omega"];
  show.forEach(w=>{
    const s = document.createElement("div");
    s.className = "word";
    s.textContent = w;
    ws.appendChild(s);
  });

  // choices visibility
  el("choicesWrap").style.display = (state.phase === "playing") ? "block" : "none";
  el("successWrap").style.display = (state.phase === "success") ? "block" : "none";

  // badges
  const badges = el("badges");
  badges.innerHTML = "";
  const entries = [...state.badges];
  if(entries.length){
    entries.forEach(name=>{
      const b = document.createElement("div");
      b.className = "badge" + (name === "Diamond Mind" ? " diamond" : "");
      b.textContent = name;
      badges.appendChild(b);
    });
  }else{
    const p = document.createElement("div");
    p.className = "pill";
    p.textContent = "Earn badges with streaks.";
    badges.appendChild(p);
  }
}

function openTip(){
  state.tip.open = true;
  el("sheetBackdrop").classList.add("show");
  el("sheet").classList.add("show");
  el("tipAmount").value = state.tip.amount;
  setTipCta("Send USDC");
}

function closeTip(){
  state.tip.open = false;
  el("sheetBackdrop").classList.remove("show");
  el("sheet").classList.remove("show");
}

function setTipCta(label){
  state.tip.cta = label;
  const btn = el("tipCta");
  btn.textContent = label;
  btn.disabled = state.tip.busy || label === "Preparing tip…" || label === "Sending…";
  const spin = el("tipSpinner");
  spin.style.display = (label === "Preparing tip…" || label === "Sending…") ? "inline-block" : "none";
}

function isHex0x(s){ return typeof s === "string" && /^0x[0-9a-fA-F]+$/.test(s); }

function pad32(hexNo0x){
  return hexNo0x.padStart(64, "0");
}

function encodeErc20Transfer(to, amountUnits){
  // selector: a9059cbb
  if(!/^0x[0-9a-fA-F]{40}$/.test(to)) throw new Error("Invalid recipient address.");
  if(typeof amountUnits !== "bigint") throw new Error("Invalid amount type.");
  if(amountUnits <= 0n) throw new Error("Amount must be > 0.");
  const selector = "a9059cbb";
  const toNo0x = to.slice(2).toLowerCase();
  const amtHex = amountUnits.toString(16);
  const data = "0x" + selector + pad32(toNo0x) + pad32(amtHex);
  return data;
}

function parseUsdToUsdcUnits(input){
  const s = String(input).trim();
  if(!/^\d+(\.\d{0,6})?$/.test(s)) throw new Error("Enter a valid amount (up to 6 decimals).");
  const [whole, frac=""] = s.split(".");
  const fracPadded = (frac + "0".repeat(6)).slice(0,6);
  const units = BigInt(whole) * 10n**6n + BigInt(fracPadded);
  if(units <= 0n) throw new Error("Amount must be greater than zero.");
  return units;
}

async function getEthProvider(){
  // Prefer Farcaster host provider if present
  try{
    if(sdk?.wallet?.getEthereumProvider){
      return await sdk.wallet.getEthereumProvider();
    }
  }catch(_e){}
  // Fallback to window.ethereum (still usable in many hosts) but Mini App chrome may not expose it.
  return window.ethereum || null;
}

async function ensureBaseMainnet(provider){
  const chainId = await provider.request({ method: "eth_chainId" });
  if(chainId === "0x2105" || chainId === "0x14a34") return chainId;

  try{
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x2105" }]
    });
    return "0x2105";
  }catch(err){
    throw new Error("Please switch to Base Mainnet in your wallet (chainId 0x2105).");
  }
}

function missingConfig(){
  if(BUILDER_CODE === "TODO_REPLACE_BUILDER_CODE") return "Builder code is not configured.";
  if(!/^0x[0-9a-fA-F]{40}$/.test(RECIPIENT)) return "Recipient address is not configured.";
  return null;
}

async function sendTip(){
  if(state.tip.busy) return;

  const miss = missingConfig();
  if(miss){
    toast(`${miss} Tip sending is disabled.`);
    return;
  }

  const amountStr = el("tipAmount").value.trim();
  let amountUnits;
  try{
    amountUnits = parseUsdToUsdcUnits(amountStr);
  }catch(e){
    toast(e.message || "Invalid amount.");
    return;
  }

  state.tip.busy = true;
  setTipCta("Preparing tip…");

  // Pre-transaction UX: animate 1–1.5 seconds before wallet opens
  await new Promise(r=>setTimeout(r, 1200));

  let provider = null;
  try{
    provider = await getEthProvider();
    if(!provider) throw new Error("No Ethereum provider found in this Mini App host.");

    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const from = accounts?.[0];
    if(!from) throw new Error("No account returned by wallet.");

    const chainId = await ensureBaseMainnet(provider);

    setTipCta("Confirm in wallet");

    const data = encodeErc20Transfer(RECIPIENT, amountUnits);

    setTipCta("Sending…");

    const params = [{
      version: "2.0.0",
      from,
      chainId,
      atomicRequired: true,
      calls: [{
        to: USDC_CONTRACT,
        value: "0x0",
        data
      }],
      capabilities: { dataSuffix }
    }];

    await provider.request({ method: "wallet_sendCalls", params });

    toast("Tip sent. Respect.");
    setTipCta("Send again");
  }catch(err){
    const msg = (err && (err.message || err.toString())) || "Transaction failed.";
    if(/Rejected|rejected|User rejected/i.test(msg)){
      toast("Canceled in wallet.");
      setTipCta("Send USDC");
    }else{
      toast(msg);
      setTipCta("Send USDC");
    }
  }finally{
    state.tip.busy = false;
    setTipCta(state.tip.cta === "Send again" ? "Send again" : "Send USDC");
  }
}

function hookUI(){
  el("tipBtn").addEventListener("click", openTip);
  el("sheetBackdrop").addEventListener("click", closeTip);
  el("sheetClose").addEventListener("click", closeTip);

  [...document.querySelectorAll("[data-preset]")].forEach(b=>{
    b.addEventListener("click", ()=>{
      const v = b.getAttribute("data-preset");
      state.tip.amount = v;
      el("tipAmount").value = v;
    });
  });

  el("tipCta").addEventListener("click", sendTip);

  el("tipAmount").addEventListener("input", (e)=>{
    state.tip.amount = e.target.value;
  });

  el("addMiniAppBtn").addEventListener("click", async ()=>{
    try{
      await sdk.actions.addMiniApp();
      toast("Added to your apps.");
    }catch(e){
      toast("Could not add. Check manifest + domain match.");
    }
  });
}

async function boot(){
  hookUI();
  render();

  // Always call ready() so the Mini App renders (hides splash screen).
  try{
    await sdk.actions.ready();
  }catch(_e){
    // No console spam; keep UX usable.
  }
}

boot();
