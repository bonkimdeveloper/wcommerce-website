"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

export default function Home() {
  const initialized = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let checkGSAP: NodeJS.Timeout;

    const initAnimation = () => {
      if (typeof window === "undefined" || !(window as any).gsap || !(window as any).ScrollTrigger) {
        checkGSAP = setTimeout(initAnimation, 100);
        return;
      }

      const G = (window as any).gsap;
      const ST = (window as any).ScrollTrigger;
      G.registerPlugin(ST);

      var RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        anim = !RM;
      var $ = function (s: any, r: any) {
          return (r || document).querySelector(s);
        },
        $$ = function (s: any, r: any) {
          return Array.prototype.slice.call((r || document).querySelectorAll(s));
        };
      var root = document.documentElement;

      var D = [
        { n: "chicken biryani", e: "🍛", bg: "#ff9b54", deep: "#4a1a00", tint: "#ffc08e", label: "#fff4ea", f: ["🌶", "🧅", "🍋"], note: "Slow-cooked rice and spice from kitchens that have done it for decades.", k: "Rice & curry", p: "from ৳180" },
        { n: "street snacks", e: "🥟", bg: "#ffc93c", deep: "#4a2000", tint: "#ffdc7f", label: "#fff8e6", f: ["🌶", "🥔", "🍋"], note: "Fuchka, singara and chotpoti, hot and crunchy, without the queue.", k: "Chaat & fried", p: "from ৳40" },
        { n: "mishti & sweets", e: "🍮", bg: "#ff7ca4", deep: "#47082a", tint: "#ffa6c2", label: "#fff1f6", f: ["🍯", "🥛", "🍓"], note: "Rasgulla, doi and pitha from the shops your family already trusts.", k: "Sweets", p: "from ৳60" },
        { n: "fresh & organic", e: "🥗", bg: "#cbe765", deep: "#223200", tint: "#ddf294", label: "#fbffea", f: ["🥕", "🍅", "🥬"], note: "Vegetables, fruit and eggs picked this morning by farms near you.", k: "Farm fresh", p: "from ৳30" },
        { n: "juice & drinks", e: "🥤", bg: "#a5d2f6", deep: "#0d2d4f", tint: "#c9e5fb", label: "#f2f9ff", f: ["🍊", "🧊", "🥭"], note: "Cold-pressed juice, lassi and cha made to order.", k: "Drinks", p: "from ৳50" },
        { n: "fresh bakery", e: "🥐", bg: "#ffbf94", deep: "#4a1606", tint: "#ffd8bd", label: "#fff6ef", f: ["🌾", "🧈", "🍞"], note: "Bread, buns and cakes out of the oven within the hour.", k: "Bakery", p: "from ৳70" },
      ];
      var N = D.length;

      function words(el: any) { el.innerHTML = el.textContent.split(" ").map(function (w: any) { return '<span class="w"><span class="wi">' + w + "</span></span>"; }).join(" "); return $$(".wi", el); }
      function vars(el: any, o: any, d: any) { if (anim && d !== 0) G.to(el, Object.assign({ duration: d || 0.9, ease: "power2.inOut", overwrite: "auto" }, o)); else Object.keys(o).forEach(function (k) { el.style.setProperty(k, o[k]); }); }

      var hdr = $("#hdr");
      var handleScroll = function () { if (hdr) hdr.classList.toggle("sc", window.scrollY > 24); };
      window.addEventListener("scroll", handleScroll, { passive: true });

      var bag: any[] = [], FREE = 500, cart = $("#cart"), cartLast: any = null;
      try { bag = (JSON.parse(localStorage.getItem("khabo-bag") || "[]") || []).filter(function (i: any) { return i && i.id && i.q > 0 && typeof i.p === "number"; }); } catch (e) { bag = []; }
      
      function money(n: any) { return "৳" + n.toLocaleString("en-US"); }
      function itemFrom(b: any) { if (b.id === "hAdd") { var d = D[cur]; return { id: d.n, name: d.n.charAt(0).toUpperCase() + d.n.slice(1), e: d.e, v: d.k, p: parseInt(d.p.replace(/\D/g, ""), 10) }; } return { id: b.dataset.n, name: b.dataset.n, e: b.dataset.e, v: b.dataset.v, p: +b.dataset.p }; }
      function addItem(it: any) { var f = bag.filter(function (x: any) { return x.id === it.id; })[0]; if (f) f.q++; else { it.q = 1; bag.push(it); } renderBag(); }
      
      function renderBag() {
        var n = bag.reduce(function (a: any, i: any) { return a + i.q; }, 0), s = bag.reduce(function (a: any, i: any) { return a + i.p * i.q; }, 0);
        if($("#bagN")) { $("#bagN").textContent = n; $("#bagN").dataset.n = n; $("#bag").setAttribute("aria-label", "Open bag, " + n + (n === 1 ? " item" : " items")); }
        if($("#cList")) $("#cList").innerHTML = bag.map(function (i: any, k: any) { return '<li class="ci"><div class="cia">' + i.e + '</div><div><h3>' + i.name + '</h3><p class="cv">' + i.v + '</p><div class="qty"><button data-dec="' + k + '" aria-label="Decrease quantity of ' + i.name + '">−</button><span aria-live="polite">' + i.q + '</span><button data-inc="' + k + '" aria-label="Increase quantity of ' + i.name + '">+</button></div></div><div class="cir"><span class="cp2">' + money(i.p * i.q) + '</span><button class="rm" data-rm="' + k + '">Remove</button></div></li>'; }).join("");
        if($("#cEmpty")) $("#cEmpty").hidden = n > 0; 
        if($("#cFoot")) $("#cFoot").hidden = n === 0; 
        if($("#cList")) $("#cList").hidden = n === 0; 
        if($("#cSub")) $("#cSub").textContent = money(s);
        var left = Math.max(0, FREE - s);
        if($("#cMsg")) $("#cMsg").textContent = n === 0 ? "Add " + money(FREE) + " and delivery is free." : left ? "Add " + money(left) + " more and delivery is free." : "Nice. This order gets free delivery.";
        var pct = Math.min(1, s / FREE); if (anim) G.to("#cBar", { scaleX: pct, duration: 0.8, ease: "expo.out", overwrite: true }); else if($("#cBar")) $("#cBar").style.transform = "scaleX(" + pct + ")";
        try { localStorage.setItem("khabo-bag", JSON.stringify(bag)); } catch (e) {}
      }

      function openCart() {
        cartLast = document.activeElement; if(cart) cart.hidden = false; root.classList.add("lock");
        if (anim) { G.fromTo("#cSc", { opacity: 0 }, { opacity: 1, duration: 0.4 }); G.fromTo("#cPanel", { xPercent: 100 }, { xPercent: 0, duration: 0.7, ease: "expo.out" }); G.from($$(".ci"), { x: 40, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, delay: 0.15 }); }
        setTimeout(function () { if($("#cX")) $("#cX").focus({ preventScroll: true }); }, 60);
      }
      function closeCart() {
        var done = function () { if(cart) cart.hidden = true; root.classList.remove("lock"); if (cartLast) cartLast.focus(); };
        if (anim) { G.to("#cPanel", { xPercent: 100, duration: 0.5, ease: "expo.in" }); G.to("#cSc", { opacity: 0, duration: 0.4, onComplete: done }); } else done();
      }

      if($("#bag")) $("#bag").addEventListener("click", openCart); 
      if($("#cX")) $("#cX").addEventListener("click", closeCart); 
      if($("#cSc")) $("#cSc").addEventListener("click", closeCart);
      if($("#cBrowse")) $("#cBrowse").addEventListener("click", function () { closeCart(); setTimeout(function () { if($("#vendors")) $("#vendors").scrollIntoView({ behavior: anim ? "smooth" : "auto" }); }, anim ? 450 : 0); });
      
      // Checkout Button logic
      if($("#cGo")) $("#cGo").addEventListener("click", function () { 
        var s = bag.reduce(function (a: any, i: any) { return a + i.p * i.q; }, 0);
        if($("#coTotal")) $("#coTotal").textContent = money(s);
        if($("#cart")) $("#cart").hidden = true;
        if($("#checkoutModal")) {
          $("#checkoutModal").hidden = false;
          if (anim) {
            G.fromTo("#checkoutModal", { opacity: 0 }, { opacity: 1, duration: 0.4 });
            G.fromTo("#coBox", { y: 50, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
          }
        }
      });

      // Close Checkout Modal (FIXED: Unlocks scroll)
      if($("#coClose")) $("#coClose").addEventListener("click", function () {
        if (anim) {
          G.to("#coBox", { y: 20, opacity: 0, duration: 0.3 });
          G.to("#checkoutModal", { opacity: 0, duration: 0.3, onComplete: function() { 
            $("#checkoutModal").hidden = true; 
            root.classList.remove("lock"); // <--- স্ক্রল আনলক করা হলো
          } });
        } else {
          $("#checkoutModal").hidden = true;
          root.classList.remove("lock"); // <--- স্ক্রল আনলক করা হলো
        }
      });

      // Payment Method Selection
      $$(".pay-btn").forEach(function(btn: any) {
        btn.addEventListener("click", function() {
          $$(".pay-btn").forEach(function(b: any) { b.classList.remove("active"); });
          btn.classList.add("active");
        });
      });

      // Confirm Payment
      if($("#payConfirm")) $("#payConfirm").addEventListener("click", function () {
        if($("#coMainBox")) $("#coMainBox").hidden = true;
        if($("#coSuccessBox")) $("#coSuccessBox").hidden = false;
        if (anim) {
          G.fromTo("#coSuccessBox", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" });
        }
        // Clear Cart
        bag = [];
        renderBag();
      });

      // Close Success Box (FIXED: Unlocks scroll)
      if($("#coSuccessClose")) $("#coSuccessClose").addEventListener("click", function () {
        if (anim) {
          G.to("#coBox", { y: 20, opacity: 0, duration: 0.3 });
          G.to("#checkoutModal", { opacity: 0, duration: 0.3, onComplete: function() { 
            $("#checkoutModal").hidden = true; 
            $("#coMainBox").hidden = false;
            $("#coSuccessBox").hidden = true;
            root.classList.remove("lock"); // <--- স্ক্রল আনলক করা হলো
          } });
        } else {
          $("#checkoutModal").hidden = true;
          $("#coMainBox").hidden = false;
          $("#coSuccessBox").hidden = true;
          root.classList.remove("lock"); // <--- স্ক্রল আনলক করা হলো
        }
      });
      
      if($("#cList")) $("#cList").addEventListener("click", function (e: any) {
        var b = e.target.closest("button"); if (!b) return;
        if (b.dataset.inc != null) bag[+b.dataset.inc].q++; else if (b.dataset.dec != null) { var k = +b.dataset.dec; if (--bag[k].q <= 0) bag.splice(k, 1); } else if (b.dataset.rm != null) bag.splice(+b.dataset.rm, 1); else return; renderBag();
      });

      var handleKeydownCart = function (e: any) {
        if(!cart || cart.hidden) return; if (e.key === "Escape") { closeCart(); return; } if (e.key !== "Tab") return;
        var f = $$("button", $("#cPanel")).filter(function (x: any) { return x.offsetParent && !x.closest("[hidden]"); }); if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      };
      document.addEventListener("keydown", handleKeydownCart);
      
      renderBag();

      var handleDocumentClick = function (e: any) {
        var b = e.target.closest("[data-add]"); if (!b) return;
        addItem(itemFrom(b));
        if (!anim) return;
        var r = b.getBoundingClientRect(), t = $("#bag").getBoundingClientRect(), d = document.createElement("i"); d.className = "dot"; document.body.appendChild(d);
        G.set(d, { x: r.left + r.width / 2 - 10, y: r.top + r.height / 2 - 10 });
        G.timeline({ onComplete: function () { d.remove(); G.fromTo("#bag", { scale: 1.25 }, { scale: 1, duration: 0.7, ease: "elastic.out(1,.5)" }); } })
          .to(d, { x: t.left + t.width / 2 - 10, y: t.top + t.height / 2 - 10, duration: 0.7, ease: "power2.inOut" }).to(d, { scale: 0, duration: 0.15 });
      };
      document.addEventListener("click", handleDocumentClick);

      /* hero carousel */
      var cur = 0, stage = $("#stage"), hName = $("#hName");
      if(stage) stage.innerHTML = D.map(function (d, i) { return '<div class="hb" data-i="' + i + '"><div class="disc"><span>' + d.e + "</span></div></div>"; }).join("");
      var hbs = $$(".hb"), prev = hbs.map(function (_, i) { return rel(i); });
      
      function rel(i: any) { var d = i - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N; return d; }
      function lp(d: any) {
        if(!stage) return {};
        var w = stage.clientWidth, h = stage.clientHeight, mob = w < 760, a = Math.abs(d), s = d < 0 ? -1 : 1, k = Math.min(a, 3);
        var X = mob ? [0, 0.42, 0.8, 1] : [0, 0.22, 0.4, 0.55], S = mob ? [1, 0.58, 0.45, 0.36] : [1, 0.6, 0.48, 0.4], Y = mob ? [0, -0.08, -0.14, -0.16] : [0, -0.1, -0.2, -0.26], R = mob ? [0, 13, 16, 18] : [2, 12, 16, 18];
        return { x: w / 2 + s * X[k] * w, y: h / 2 + Y[k] * h, rotation: d ? s * R[k] : R[0], scale: S[k], opacity: a <= (mob ? 1 : 2) ? 1 : 0, zIndex: 10 - a };
      }
      function place(go: any) {
        hbs.forEach(function (el: any, i: any) {
          var d = rel(i), p = lp(d), wr = Math.abs(d - prev[i]) > N / 2 - 0.5; prev[i] = d;
          var o = Object.assign({ xPercent: -50, yPercent: -50 }, p);
          if (!go || !anim || wr) { if (wr && go && anim) { G.set(el, Object.assign({}, o, { opacity: 0 })); G.to(el, { opacity: p.opacity, duration: 0.6, delay: 0.3 }); } else G.set(el, o); }
          else G.to(el, Object.assign({ duration: 1.15, ease: "expo.out", overwrite: "auto" }, o));
        });
      }
      function nameHTML(n: any) { return n.split(" ").map(function (w: any) { return '<span class="hw">' + w.split("").map(function (c: any) { return '<span class="hc">' + c + "</span>"; }).join("") + "</span>"; }).join(" "); }
      var tok = 0;
      function swapName(dir: any) {
        var d = D[cur];
        if (!hName) return;
        if (!anim) { hName.innerHTML = nameHTML(d.n); return; }
        var t = ++tok, old = $$(".hc", hName); G.killTweensOf(old);
        G.to(old, { yPercent: -110 * dir, duration: 0.3, ease: "power3.in", stagger: 0.01, onComplete: function () { if (t !== tok) return; hName.innerHTML = nameHTML(D[cur].n); G.from($$(".hc", hName), { yPercent: 110 * dir, duration: 0.85, ease: "expo.out", stagger: 0.018 }); } });
      }
      function meta(a: any) { if($("#hMeta")) $("#hMeta").textContent = String(cur + 1).padStart(2, "0") + " / 0" + N + " · " + D[cur].p; if (a && anim) G.fromTo("#hMeta", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", overwrite: true }); }
      function colours(d: any) { var c = D[cur]; vars(root, { "--bg": c.bg, "--deep": c.deep, "--tint": c.tint, "--label": c.label }, d); }
      
      var autoT: any; function arm() { clearTimeout(autoT); if (anim) autoT = setTimeout(function () { if (inView && !document.hidden) go(cur + 1); else arm(); }, 10000); }
      var inView = true;
      function go(i: any) {
        i = ((i % N) + N) % N; if (i === cur) return; var d = i - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N; var dir = d > 0 ? 1 : -1; cur = i; place(true);
        if (anim && hbs[cur]) G.fromTo(hbs[cur].firstChild, { rotation: dir * 6, scaleX: 0.85 }, { rotation: 0, scaleX: 1, duration: 1.4, ease: "elastic.out(1,.55)" });
        swapName(dir); colours(0.9); meta(true); if (anim) G.fromTo("#hAdd", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)", delay: 0.35, overwrite: true }); arm();
      }
      
      if($("#pv")) $("#pv").onclick = function () { go(cur - 1); }; 
      if($("#nx")) $("#nx").onclick = function () { go(cur + 1); };
      
      var sx: any = null, st: any = null; 
      if(stage) stage.addEventListener("pointerdown", function (e: any) { sx = e.clientX; st = e.target.closest(".hb"); });
      
      var handlePointerUp = function (e: any) { if (sx === null) return; var dx = e.clientX - sx; if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1)); else if (Math.abs(dx) < 8 && st && +st.dataset.i !== cur) go(+st.dataset.i); sx = null; };
      window.addEventListener("pointerup", handlePointerUp);
      
      colours(0); if(hName) hName.innerHTML = nameHTML(D[0].n); meta(false); place(false);
      if (anim) { $$(".disc").forEach(function (el: any, k: any) { G.to(el, { y: -10, duration: 2.4 + (k % 3) * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1, delay: k * 0.2 }); }); }
      
      var handleResize = function () { place(false); };
      window.addEventListener("resize", handleResize);

      /* why */
      var S = [{ n: 500, u: "+", l: "local kitchens", b: "Home cooks, bakeries and farm stalls, all verified before they sell a single plate.", c: 0 },
      { n: 30, u: "min", l: "average delivery", b: "Each kitchen delivers on its own schedule, so food arrives while it is still hot.", c: 1 },
      { n: 0, u: "৳", l: "hidden fees", b: "The price you see is the price you pay. Delivery is shown before checkout.", c: 2 },
      { n: 100, u: "%", l: "verified sellers", b: "Every vendor passes a check, and only customers who ordered can leave a review.", c: 3 }];
      var whyEl = $("#why"), wi = -1, nobj = { v: 0 };
      S.forEach(function (s, i) {
        var d = document.createElement("div"); d.innerHTML = "<span>" + D[s.c].e + "</span>"; if($("#wV")) $("#wV").appendChild(d);
        var b = document.createElement("button"); b.setAttribute("role", "tab"); b.setAttribute("aria-label", s.n + s.u + " " + s.l); b.onclick = function () { jump(whyEl, i, S.length); }; if($("#wS")) $("#wS").appendChild(b);
      });
      var wvs = $$("#wV>div");
      function jump(el: any, i: any, n: any) { if(!el) return; window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + (i + 0.5) / n * (el.offsetHeight - window.innerHeight), behavior: anim ? "smooth" : "auto" }); }
      function whySet(i: any, dir: any) {
        var s = S[i], p = wi; wi = i; var c = D[s.c];
        if($("#wI")) $("#wI").textContent = "0" + (i + 1); $$("#wS button").forEach(function (b: any, k: any) { b.setAttribute("aria-selected", k === i); });
        vars(whyEl, { "--wb": c.bg, "--wd": c.deep }, p < 0 ? 0 : 0.8); if(whyEl) whyEl.style.setProperty("--wt", c.tint);
        var num = $("#wNum"), u = $("#wU"), l = $("#wL"), b = $("#wB");
        if (!anim || p < 0) { if(num) num.textContent = s.n; if(u) u.textContent = s.u; if(l) l.textContent = s.l; if(b) b.textContent = s.b; wvs.forEach(function (e: any, k: any) { e.classList.toggle("on", k === i); }); return; }
        G.to(nobj, { v: s.n, duration: 1, ease: "power3.out", overwrite: true, onUpdate: function () { if(num) num.textContent = Math.round(nobj.v); } });
        G.fromTo(num, { yPercent: dir * 18 }, { yPercent: 0, duration: 1, ease: "expo.out", overwrite: "auto" });
        G.to([u, l, b], { y: -dir * 22, opacity: 0, duration: 0.25, ease: "power2.in", stagger: 0.03, overwrite: true, onComplete: function () { if(u) u.textContent = S[wi].u; if(l) l.textContent = S[wi].l; if(b) b.textContent = S[wi].b; G.fromTo([u, l, b], { y: dir * 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.05 }); } });
        wvs.forEach(function (e: any, k: any) {
          if (k === i) { e.classList.add("on"); G.fromTo(e, { opacity: 0, scale: 0.9, rotation: dir * 8, y: dir * 40 }, { opacity: 1, scale: 1, rotation: 0, y: 0, duration: 1, ease: "expo.out", overwrite: true }); }
          else if (k === p) { G.to(e, { opacity: 0, scale: 0.9, rotation: -dir * 8, y: -dir * 40, duration: 0.45, ease: "power2.in", overwrite: true, onComplete: function () { e.classList.remove("on"); } }); } else { G.set(e, { opacity: 0 }); e.classList.remove("on"); }
        });
      }
      whySet(0, 1);
      if (anim) { G.to("#wV", { y: -18, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1 }); }

      /* categories */
      var flvEl = $("#cats"), fi = -1;
      D.forEach(function (d, i) {
        var li = document.createElement("li"); li.innerHTML = '<button aria-current="false"><span class="n">0' + (i + 1) + "</span><span>" + d.n + "</span></button>"; li.firstChild.onclick = function () { jump(flvEl, i, N); }; if($("#fl")) $("#fl").appendChild(li);
        var e = document.createElement("div"); e.className = "fe"; e.textContent = d.e; if($("#fe")) $("#fe").appendChild(e);
      });
      var fes = $$(".fe"), ffs = [$("#f1"), $("#f2"), $("#f3")];
      function fill(d: any, i: any) { if($("#fN")) $("#fN").textContent = d.n; if($("#fNo")) $("#fNo").textContent = d.note; if($("#fEy")) $("#fEy").textContent = "Category 0" + (i + 1) + " of 0" + N + " · " + d.k; if($("#fP")) $("#fP").textContent = d.p; }
      function flvSet(i: any, dir: any) {
        var d = D[i], p = fi; fi = i;
        vars(flvEl, { "--fb2": d.bg, "--fd2": d.deep, "--ft": d.tint }, p < 0 ? 0 : 0.8);
        $$("#fl button").forEach(function (b: any, k: any) { b.setAttribute("aria-current", k === i); });
        if (!anim || p < 0) { fill(d, i); fes.forEach(function (e: any, k: any) { e.classList.toggle("on", k === i); }); ffs.forEach(function (el: any, k: any) { if(el) el.textContent = d.f[k]; }); return; }
        fes.forEach(function (e: any, k: any) {
          if (k === i) { e.classList.add("on"); G.fromTo(e, { opacity: 0, yPercent: dir * 34, rotation: dir * 14, scale: 0.86 }, { opacity: 1, yPercent: 0, rotation: 0, scale: 1, duration: 1.05, ease: "expo.out", delay: 0.08, overwrite: true }); }
          else if (k === p) { G.to(e, { opacity: 0, yPercent: -dir * 34, rotation: -dir * 14, scale: 0.86, duration: 0.5, ease: "power3.in", overwrite: true, onComplete: function () { e.classList.remove("on"); } }); } else { G.set(e, { opacity: 0 }); e.classList.remove("on"); }
        });
        G.fromTo("#fd", { scale: 0.82 }, { scale: 1, duration: 1.1, ease: "expo.out", overwrite: true });
        var q = ["#fN", "#fNo", "#fEy", ".fcopy .row"];
        G.to(q, { yPercent: -dir * 30, opacity: 0, duration: 0.28, ease: "power2.in", overwrite: true, onComplete: function () { fill(D[fi], fi); G.fromTo(q, { yPercent: dir * 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.85, ease: "expo.out", stagger: 0.05 }); } });
        ffs.forEach(function (el: any, k: any) { G.to(el, { scale: 0, rotation: -80, duration: 0.3, ease: "power2.in", delay: k * 0.03, overwrite: true, onComplete: function () { if(el) el.textContent = D[fi].f[k]; G.fromTo(el, { scale: 0, rotation: 80 }, { scale: 1, rotation: 0, duration: 1, ease: "back.out(1.6)" }); } }); });
      }
      flvSet(0, 1); if($("#fB")) $("#fB").onclick = function () { if($("#vendors")) $("#vendors").scrollIntoView({ behavior: anim ? "smooth" : "auto" }); };

      /* vendors */
      var V = [["Bhai Bhai Biryani", "🍛", 0, "4.8", "25 min", "৳220"], ["Ammu’s Kitchen", "🥟", 1, "4.7", "30 min", "৳60"], ["Mishti Ghor", "🍮", 2, "4.9", "35 min", "৳90"], ["Green Basket", "🥗", 3, "4.6", "40 min", "৳45"], ["Cha Adda", "🥤", 4, "4.8", "20 min", "৳60"], ["Crust & Co", "🥐", 5, "4.9", "30 min", "৳85"]];
      var trk = $("#trk"), sl = $("#sl");
      if(trk) trk.innerHTML = V.map(function (v: any) { var c = D[v[2]]; return '<article class="card" style="--c:' + c.bg + ";--cd:" + c.deep + '"><div class="ca"><span>' + v[1] + "</span></div><h3>" + v[0] + "</h3><p>★ " + v[3] + " · " + v[4] + " · " + c.k + '</p><div class="cr"><span>from ' + v[5] + '</span><button class="add2" data-add data-n="' + v[0] + '" data-e="' + v[1] + '" data-p="' + v[5].replace(/\D/g, "") + '" data-v="' + c.k + '" aria-label="Add from ' + v[0] + '">Add</button></div></article>'; }).join("");
      var X = 0, min = 0, dr: any = null, moved = false;
      function lim() { if(sl && trk) min = Math.min(0, sl.clientWidth - trk.scrollWidth); }
      function setX(x: any, a: any) { X = G.utils.clamp(min, 0, x); G.to(trk, { x: X, duration: a && anim ? 0.9 : 0, ease: "expo.out", overwrite: true }); }
      lim(); window.addEventListener("resize", lim);
      
      if(sl) {
        sl.addEventListener("pointerdown", function (e: any) { dr = { x: e.clientX, b: X, t: performance.now(), l: e.clientX, v: 0 }; moved = false; });
        sl.addEventListener("click", function (e: any) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
        sl.addEventListener("wheel", function (e: any) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { e.preventDefault(); setX(X - e.deltaX, false); } }, { passive: false });
      }
      var handlePointerMove = function (e: any) { if (!dr) return; var dx = e.clientX - dr.x; if (Math.abs(dx) > 6) { moved = true; if(sl) sl.classList.add("dr"); } if (!moved) return; var n = performance.now(); dr.v = (e.clientX - dr.l) / Math.max(1, n - dr.t); dr.l = e.clientX; dr.t = n; setX(dr.b + dx, false); };
      var handlePointerUpVendors = function () { if (!dr) return; var d = dr; dr = null; if(sl) sl.classList.remove("dr"); if (moved) setX(X + d.v * 260, true); };
      
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUpVendors);
      
      var step = function () { return $(".card") ? $(".card").offsetWidth + 20 : 0; };
      if($("#sp")) $("#sp").onclick = function () { setX(X + step(), true); }; 
      if($("#sn")) $("#sn").onclick = function () { setX(X - step(), true); };

      /* account modal */
      var am = $("#am"), amBox = $("#amBox"), amLast: any = null;
      var COPY: any = { customer: ["Sign in", "Sign in or create an account", "Email", "Email me with news and offers"], seller: ["Sell on Khabo", "Create a seller account and open your shop", "Business email", "Email me seller tips and updates"] };
      function amSet(m: any) { var c = COPY[m]; if(am) am.dataset.m = m; if($("#amT")) $("#amT").textContent = c[0]; if($("#amS")) $("#amS").textContent = c[1]; if($("#amE")) $("#amE").placeholder = c[2]; if($("#amE")) $("#amE").setAttribute("aria-label", c[2]); if($("#amCk")) $("#amCk").textContent = c[3]; $$("#amTabs button").forEach(function (b: any) { b.setAttribute("aria-selected", b.dataset.m === m); }); }
      function openAcct(m: any) {
        amLast = document.activeElement; amSet(m || "customer"); if($("#amMain")) $("#amMain").hidden = false; if($("#amOk")) $("#amOk").hidden = true; if($("#amErr")) $("#amErr").textContent = ""; if($("#amE")) $("#amE").value = ""; if(am) am.hidden = false; root.classList.add("lock");
        if (anim) { G.fromTo("#amSc", { opacity: 0 }, { opacity: 1, duration: 0.4 }); G.fromTo(amBox, { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "expo.out" }); G.from($$("#amMain>*"), { y: 18, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.05, delay: 0.15 }); }
        setTimeout(function () { if($("#amE")) $("#amE").focus({ preventScroll: true }); }, 60);
      }
      function closeAcct() {
        var done = function () { if(am) am.hidden = true; root.classList.remove("lock"); if (amLast) amLast.focus(); };
        if (anim) { G.to(amBox, { y: 40, opacity: 0, duration: 0.35, ease: "power2.in" }); G.to("#amSc", { opacity: 0, duration: 0.35, onComplete: done }); } else done();
      }
      
      if($("#acct")) $("#acct").addEventListener("click", function () { openAcct("customer"); });
      if($("#startSell")) $("#startSell").addEventListener("click", function () { openAcct("seller"); });
      if($("#amX")) $("#amX").addEventListener("click", closeAcct); 
      if($("#amSc")) $("#amSc").addEventListener("click", closeAcct);
      $$("#amTabs button").forEach(function (b: any) { b.addEventListener("click", function () { amSet(b.dataset.m); if($("#amErr")) $("#amErr").textContent = ""; }); });
      
      if($("#amG")) $("#amG").addEventListener("click", function () { 
        router.push('/dashboard'); 
      });
      
      var handleKeydownAcct = function (e: any) {
        if(!am || am.hidden) return; if (e.key === "Escape") { closeAcct(); return; } if (e.key !== "Tab") return;
        var f = $$("button,input,a[href]", amBox).filter(function (x: any) { return x.offsetParent && !x.closest("[hidden]"); }); if (!f.length) return; var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      };
      document.addEventListener("keydown", handleKeydownAcct);
      
      if($("#amF")) $("#amF").addEventListener("submit", function (e: any) {
        e.preventDefault(); var v = $("#amE").value.trim(), err = $("#amErr");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { err.textContent = v ? "That email doesn’t look right. Try name@example.com." : "Enter your email to continue."; if (anim) G.fromTo(".fld", { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1,.3)" }); return; }
        err.textContent = "";
        router.push('/dashboard');
      });

      /* marquee */
      var items = [["20 min delivery", "🛵"], ["verified kitchens", "✅"], ["cash on delivery", "💵"], ["fresh every day", "🥬"], ["pay with bKash", "📱"], ["no hidden fees", "🧾"]];
      var set = '<div class="set">' + items.map(function (i) { return "<span>" + i[0] + "</span><i>" + i[1] + "</i>"; }).join("") + "</div>";
      var mqEl = $("#mq"); if(mqEl) mqEl.innerHTML = set + set + set + set;
      function clampV(v: any, a: any, b: any) { return Math.max(a, Math.min(b, v)); }

      /* scroll engine */
      ST.create({ trigger: "#top", start: "top top", end: "bottom top", onToggle: function (s: any) { inView = s.isActive; } });
      ST.create({ trigger: whyEl, start: "top top", end: "bottom bottom", onUpdate: function (s: any) { var i = Math.min(S.length - 1, Math.floor(s.progress * S.length)); if (i !== wi) whySet(i, s.direction || 1); if (anim) G.set($$("#wV>div span"), { rotation: Math.sin(s.progress * Math.PI * 5) * 7 }); } });
      ST.create({ trigger: flvEl, start: "top top", end: "bottom bottom", onUpdate: function (s: any) { var i = Math.min(N - 1, Math.floor(s.progress * N)); if (i !== fi) flvSet(i, s.direction || 1); if($("#fill")) $("#fill").style.transform = "scaleY(" + s.progress + ")"; } });
      
      if (anim) {
        G.to(".hero-ui", { yPercent: 30, opacity: 0, ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });
        G.to("#stage", { yPercent: -8, scale: 0.94, ease: "none", scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });
        var sw = words($("#stmt")); G.fromTo(sw, { opacity: 0.14 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: "#stmt", start: "top 82%", end: "bottom 45%", scrub: 0.6 } });
        var mq = G.to(mqEl, { xPercent: -50, ease: "none", duration: 44, repeat: -1 });
        ST.create({ trigger: ".stmt", start: "top bottom", end: "bottom top", onUpdate: function (s: any) { var v = s.getVelocity(), d = s.direction < 0 ? -1 : 1, b = Math.min(6, 1 + Math.abs(v) / 350); G.to(mq, { timeScale: b * d, duration: 0.2, overwrite: true, onComplete: function () { G.to(mq, { timeScale: d, duration: 1.2 }); } }); G.to(".mq", { skewX: clampV(-v / 500, -6, 6), duration: 0.4, overwrite: true, onComplete: function () { G.to(".mq", { skewX: 0, duration: 0.8 }); } }); } });
        $$("[data-split]").forEach(function (el: any) { G.from(words(el), { yPercent: 110, duration: 1.05, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: el, start: "top 88%", once: true } }); });
        ST.batch(".card", { start: "top 92%", once: true, onEnter: function (b: any) { G.fromTo(b, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.07, overwrite: true }); } });
        var cn = { v: 0 }; ST.create({ trigger: "#sc", start: "top 85%", once: true, onEnter: function () { G.to(cn, { v: 1200, duration: 2.2, ease: "power3.out", onUpdate: function () { if($("#sc")) $("#sc").textContent = Math.round(cn.v).toLocaleString("en-US"); } }); } });
        G.from("#mark", { yPercent: 45, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "#mark", start: "top 98%", once: true } });
        
        G.timeline({ defaults: { ease: "expo.out" }, onComplete: arm })
          .from(hbs[0] ? hbs[0].firstChild : null, { yPercent: 60, rotation: 14, scale: 0.7, opacity: 0, duration: 1.5 }, 0.15)
          .from(hbs.slice(1).map(function (e: any) { return e.firstChild; }), { yPercent: 40, scale: 0.5, opacity: 0, duration: 1.25, stagger: 0.07 }, 0.5)
          .from("#hName .hc", { yPercent: 110, duration: 1, stagger: 0.022 }, 0.6)
          .from([".hero-ui", "#hMeta", ".ctrl"], { y: 24, opacity: 0, duration: 1, stagger: 0.06 }, 0.85)
          .fromTo("#hAdd", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" }, 1.2)
          .from(".nav", { y: -30, opacity: 0, duration: 1 }, 0.95);
      } else { if($("#sc")) $("#sc").textContent = "1,200"; }

      return () => {
        clearTimeout(checkGSAP);
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("click", handleDocumentClick);
        document.removeEventListener("keydown", handleKeydownCart);
        document.removeEventListener("keydown", handleKeydownAcct);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointerup", handlePointerUpVendors);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("resize", handleResize);
      };
    };

    initAnimation();
  }, [router]);

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" strategy="afterInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" strategy="afterInteractive" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Figtree:wght@500;700&family=DM+Mono:wght@500&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root{--ink:#170f1b;--ice:#f3f6f1;--bg:#ff9b54;--deep:#4a1a00;--tint:#ffc08e;--label:#fff4ea;--fd:"Bricolage Grotesque","Arial Black",system-ui,sans-serif;--fb:"Figtree",system-ui,sans-serif;--fm:"DM Mono",ui-monospace,monospace;--ease:cubic-bezier(.2,.8,.2,1);--hdr:86px;color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
        html{scroll-padding-top:env(safe-area-inset-top,0px)}*,*::before,*::after{box-sizing:border-box}html,body{overflow-x:clip}
        body{margin:0;background:var(--ice);color:var(--ink);font:1.0625rem/1.55 var(--fb);-webkit-font-smoothing:antialiased}
        body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:60;background:var(--bg)}
        h1,h2,h3,p{margin:0}h1,h2,h3{font-family:var(--fd);font-weight:800;letter-spacing:-.035em;line-height:.95;text-wrap:balance}
        .g{padding-inline:max(clamp(16px,4vw,56px),env(safe-area-inset-left,0px))}
        .eyebrow{font:500 .75rem/1.2 var(--fm);letter-spacing:.12em}
        .w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.1em;margin-bottom:-.1em}.wi{display:inline-block}
        :focus-visible{outline:3px solid currentColor;outline-offset:3px;border-radius:6px}
        .btn{position:relative;overflow:hidden;isolation:isolate;display:inline-flex;align-items:center;gap:.55em;min-height:52px;padding:0 26px;border:0;border-radius:999px;background:var(--deep);color:var(--label);font:700 1rem var(--fb);text-decoration:none;cursor:pointer;transition:transform .3s var(--ease)}
        .btn::before{content:"";position:absolute;inset:0;background:currentColor;opacity:.16;transform:translateY(101%);transition:transform .5s var(--ease);z-index:-1}.btn:hover::before{transform:none}.btn:active{transform:scale(.96)}
        .btn svg{width:18px;height:18px;transition:transform .4s var(--ease)}.btn:hover svg{transform:translateX(4px)}
        .ibtn{width:52px;height:52px;border-radius:50%;border:2px solid currentColor;background:none;font-size:1.3rem;cursor:pointer;color:inherit;transition:background .3s,color .3s,transform .35s var(--ease)}.ibtn:hover{background:var(--deep);color:var(--label);border-color:var(--deep)}.ibtn:active{transform:scale(.92)}
        .hdr{position:fixed;top:0;left:0;right:0;z-index:50;padding-top:calc(env(safe-area-inset-top,0px) + 14px);pointer-events:none}
        .nav{pointer-events:auto;display:flex;align-items:center;justify-content:space-between;gap:16px;height:58px;margin-inline:max(clamp(16px,4vw,56px),env(safe-area-inset-left,0px));padding:0 8px 0 22px;border-radius:20px;color:var(--deep);transition:background .4s,box-shadow .4s,color .4s}
        .hdr.sc .nav{background:rgba(255,255,255,.96);color:var(--ink);backdrop-filter:blur(14px) saturate(1.3);box-shadow:0 1px 0 rgba(23,15,27,.06)}
        .logo{font:800 1.75rem/1 var(--fd);letter-spacing:-.04em;text-decoration:none;color:inherit}.nav ul{display:flex;gap:26px;list-style:none;margin:0;padding:0}
        .nav a{color:inherit;font-weight:700;text-decoration:none}.nav ul a{background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;padding-bottom:3px;transition:background-size .4s var(--ease)}.nav ul a:hover{background-size:100% 2px}
        .bag{position:relative;width:44px;height:44px;border-radius:50%;border:0;background:none;color:inherit;display:grid;place-items:center;cursor:pointer;font-size:1.3rem}
        .bag b{position:absolute;top:0;right:-2px;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:var(--deep);color:var(--label);font:700 .7rem/19px var(--fb);text-align:center}.bag b[data-n="0"]{display:none}
        @media(max-width:800px){.nav ul{display:none}}
        .dot{position:fixed;left:0;top:0;width:20px;height:20px;border-radius:50%;background:var(--deep);z-index:99;pointer-events:none}
        .hero{height:100svh;min-height:640px;display:flex;flex-direction:column;background:var(--bg);color:var(--deep);padding-top:var(--hdr);overflow:hidden;position:relative}
        .hero-ui{padding-top:22px}.hero-ui h1{font-size:clamp(1.7rem,3.4vw,2.8rem);max-width:12ch;margin-top:8px}
        .stage{flex:1;position:relative;container-type:size;min-height:0}
        .hb{position:absolute;left:0;top:0;height:92%;aspect-ratio:1;touch-action:pan-y}
        .disc{width:100%;height:100%;border-radius:50%;background:var(--tint);display:grid;place-items:center;transition:background .9s}
        .disc span{font-size:46cqh;line-height:1;filter:drop-shadow(0 18px 14px rgba(0,0,0,.18))}
        .hero-bot{display:grid;justify-items:center;gap:10px;padding-bottom:24px;text-align:center}
        .hname{font-size:clamp(3rem,10vw,8.5rem);display:flex;gap:.25em;flex-wrap:wrap;justify-content:center;letter-spacing:-.045em}.hw{display:inline-flex;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em}.hc{display:inline-block}
        .ctrl{display:flex;gap:12px;align-items:center}.meta{font:500 .8rem var(--fm);min-width:15ch}
        .add{position:absolute;right:max(4vw,16px);bottom:150px;z-index:20}
        .why{--wb:#ff9b54;--wd:#4a1a00;position:relative;height:400svh;background:var(--wb);color:var(--wd)}
        .stick{position:sticky;top:0;height:100svh;display:grid;grid-template-columns:minmax(0,600px) minmax(0,420px);justify-content:center;align-items:center;gap:clamp(24px,6vw,100px);padding-top:var(--hdr);overflow:hidden}
        .num{font:800 clamp(7rem,20vw,16rem)/.85 var(--fd);letter-spacing:-.06em;display:flex;align-items:baseline;gap:.08em;margin:18px 0 10px}.num small{font-size:.3em;letter-spacing:-.02em}
        .stick h2{font-size:clamp(2rem,4vw,3.4rem)}.stick p.b{max-width:34ch;margin-top:14px}
        .steps{display:flex;gap:8px;margin-top:26px}.steps button{width:38px;height:6px;border:0;border-radius:9px;background:currentColor;opacity:.25;cursor:pointer;transition:opacity .3s,width .4s var(--ease)}.steps button[aria-selected=true]{opacity:1;width:64px}
        .vis{position:relative;height:min(64svh,440px);aspect-ratio:1}.vis>div{position:absolute;inset:0;border-radius:50%;background:var(--wt);display:grid;place-items:center;opacity:0}.vis>div.on{opacity:1}.vis span{font-size:min(30svh,200px)}
        @media(max-width:800px){.stick{grid-template-columns:1fr;padding-inline:20px;align-content:center}.vis{position:absolute;right:-12%;bottom:-6svh;height:38svh;opacity:.9}.why{height:340svh}}
        .stmt{background:var(--ice);padding:clamp(70px,12vw,150px) 0 clamp(40px,6vw,80px)}.stmt p{font:800 clamp(1.7rem,4vw,3.4rem)/1.08 var(--fd);letter-spacing:-.03em;max-width:24ch}
        .mq{background:var(--ink);color:var(--ice);overflow:hidden;padding:18px 0;white-space:nowrap}.mq div{display:inline-flex;gap:34px;align-items:center}.mq span{font:800 clamp(1.4rem,3vw,2.2rem) var(--fd);letter-spacing:-.02em}.mq i{font-style:normal;font-size:1.8rem}.mq .set{padding-right:34px}
        .flv{--fb2:#ff9b54;--fd2:#4a1a00;--ft:#ffc08e;position:relative;height:540svh;background:var(--fb2);color:var(--fd2)}
        .fstick{position:sticky;top:0;height:100svh;display:grid;grid-template-columns:minmax(180px,260px) minmax(0,520px) minmax(0,480px);justify-content:center;align-items:center;gap:clamp(16px,3vw,56px);padding:var(--hdr) 20px 0;overflow:hidden}
        .flist{list-style:none;margin:0;padding:0 0 0 22px;position:relative;display:grid;gap:4px}.flist::before,.fill{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:currentColor;opacity:.2}.fill{opacity:1;transform-origin:top;transform:scaleY(0)}
        .flist button{all:unset;cursor:pointer;display:flex;gap:10px;padding:5px 0;font:700 1rem var(--fb);opacity:.45;transition:opacity .3s}.flist button[aria-current=true]{opacity:1}.flist .n{font:500 .72rem var(--fm);padding-top:5px}
        .fst{position:relative;aspect-ratio:1;width:100%;max-height:60svh}.fdisc{position:absolute;inset:6%;border-radius:50%;background:var(--ft)}.fe{position:absolute;inset:0;display:grid;place-items:center;font-size:min(26svh,190px);opacity:0}.fe.on{opacity:1}
        .ff{position:absolute;font-size:clamp(2rem,6vw,4rem)}.ff:nth-of-type(1){left:2%;top:12%}.ff:nth-of-type(2){right:0;top:48%}.ff:nth-of-type(3){left:12%;bottom:4%}
        .fcopy h2{font-size:clamp(2.4rem,5.4vw,4.8rem);margin:12px 0}.fcopy p.n{max-width:32ch}.fcopy .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px;align-items:center}
        @media(max-width:900px){.fstick{grid-template-columns:1fr;align-content:center;gap:10px}.flist{display:none}.fst{max-height:34svh;width:auto;justify-self:center}.flv{height:480svh}}
        .vend{padding:clamp(60px,9vw,120px) 0;background:var(--ice)}.vh{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:34px;flex-wrap:wrap}.vh h2{font-size:clamp(2.6rem,6vw,5rem)}.vh p{max-width:38ch;margin-top:12px}
        .sl{overflow:hidden;cursor:grab;touch-action:pan-y}.sl.dr{cursor:grabbing}.trk{display:flex;gap:20px;width:max-content;padding-inline:max(clamp(16px,4vw,56px),env(safe-area-inset-left,0px))}
        .card{width:clamp(240px,26vw,320px);border-radius:24px;background:var(--c);color:var(--cd);padding:14px 14px 18px;user-select:none}
        .ca{aspect-ratio:1;border-radius:16px;background:rgba(255,255,255,.35);display:grid;place-items:center;font-size:clamp(4rem,8vw,6rem);overflow:hidden}.ca span{display:block;transition:transform .6s var(--ease)}.card:hover .ca span{transform:translateY(-4%) scale(1.08) rotate(-4deg)}
        .card h3{font-size:1.5rem;margin:14px 0 4px}.card p{font-size:.9rem;opacity:.85}.cr{display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-weight:700}
        .add2{border:0;border-radius:99px;background:var(--cd);color:#fff;font:700 .9rem var(--fb);padding:10px 18px;cursor:pointer;transition:transform .3s var(--ease)}.add2:active{transform:scale(.92)}
        .sbar{display:flex;gap:12px;margin-top:26px;padding-inline:max(clamp(16px,4vw,56px),env(safe-area-inset-left,0px))}.sbar .ibtn{color:var(--ink)}
        .sell{background:#cbe765;color:#223200;padding:clamp(50px,8vw,100px) 0}.sell .in{display:grid;grid-template-columns:1.2fr 1fr;gap:30px;align-items:center}.sell h2{font-size:clamp(2.4rem,5.4vw,4.6rem)}.sell p{margin:16px 0 24px;max-width:40ch}.sell .big{font:800 clamp(5rem,14vw,11rem)/.85 var(--fd);letter-spacing:-.06em}.sell .btn{--x:0;background:#223200;color:#fbffea}
        @media(max-width:800px){.sell .in{grid-template-columns:1fr}}
        .foot{background:var(--ink);color:var(--ice);padding:clamp(50px,7vw,90px) 0 0;overflow:hidden}.foot h2{font-size:clamp(2.2rem,5vw,4rem);margin-bottom:12px}.foot p{opacity:.75;max-width:40ch;margin-bottom:24px}.foot .btn{background:#ff9b54;color:#4a1a00}
        .mark{font:800 31vw/.74 var(--fd);letter-spacing:-.06em;text-align:center;margin-top:clamp(30px,6vw,70px);padding-bottom:.02em;white-space:nowrap;user-select:none}
        .cp{padding:18px 0;font-size:.85rem;opacity:.6;border-top:1px solid rgba(255,255,255,.15)}
        .cart{position:fixed;inset:0;z-index:80}.cart[hidden]{display:none}
        .cpanel{position:absolute;top:0;right:0;bottom:0;width:min(480px,100%);background:var(--ice);color:var(--ink);display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}
        .ch{display:flex;justify-content:space-between;align-items:center;padding:20px 20px 12px}.ch h2{font-size:2rem}.ch .ibtn{width:48px;height:48px}
        .cmsg{margin:8px 20px 14px;padding:16px 18px;border-radius:20px;background:var(--tint);color:var(--deep);font-weight:600;transition:background .9s,color .9s}.cbar{height:8px;border-radius:9px;background:rgba(0,0,0,.12);margin-top:12px;overflow:hidden}.cbar i{display:block;height:100%;background:var(--deep);border-radius:9px;transform-origin:left;transform:scaleX(0)}
        .cbody{flex:1;overflow:auto;padding:6px 20px}.clist{list-style:none;margin:0;padding:0;display:grid;gap:18px}.clist[hidden],.cempty[hidden]{display:none}
        .ci{display:grid;grid-template-columns:84px 1fr auto;gap:14px;align-items:start}.cia{aspect-ratio:1;border-radius:16px;background:var(--tint);display:grid;place-items:center;font-size:2.6rem}
        .ci h3{font-size:1.15rem;line-height:1.1;margin-top:2px}.cv{font:500 .8rem var(--fm);margin-top:4px;opacity:.8}
        .qty{display:inline-flex;align-items:center;border:2px solid rgba(23,15,27,.2);border-radius:99px;margin-top:10px}.qty button{width:38px;height:36px;border:0;background:none;font:700 1.2rem var(--fb);cursor:pointer;color:inherit;border-radius:99px}.qty button:hover{background:rgba(23,15,27,.08)}.qty span{min-width:22px;text-align:center;font-weight:700}
        .cir{display:grid;justify-items:end;gap:10px}.cp2{font:800 1.15rem var(--fd)}.rm{border:0;background:none;color:inherit;font:500 .9rem var(--fb);text-decoration:underline;cursor:pointer;padding:0}
        .cempty{text-align:center;padding:70px 0;display:grid;gap:8px;justify-items:center}.cempty p:first-child{font:800 1.6rem var(--fd);letter-spacing:-.02em}.cempty .btn{margin-top:14px}
        .cfoot{border-top:1px solid #d9dcd5;padding:18px 20px calc(18px + env(safe-area-inset-bottom,0px))}.csub{display:flex;justify-content:space-between;font:800 1.6rem var(--fd);letter-spacing:-.02em}.cfoot p{margin:10px 0 16px;font-size:.95rem}.cgo{width:100%;justify-content:center;background:var(--ink);color:#fff}
        html.lock{overflow:hidden}.nr{display:flex;align-items:center;gap:2px}.bag svg{width:22px;height:22px}
        .am{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px}.am[hidden]{display:none}
        .scrim{position:absolute;inset:0;background:rgba(23,15,27,.5);backdrop-filter:blur(6px)}
        .amb{position:relative;width:min(440px,100%);max-height:calc(100svh - 32px);overflow:auto;border-radius:28px;background:#fafafa;color:var(--ink);padding:30px 28px 26px}
        .amx{position:absolute;top:14px;right:14px;width:40px;height:40px;font-size:1rem;z-index:2}
        .amb h2{font-size:2rem;margin:20px 0 6px}.amb .sub{color:#6b6470;margin-bottom:20px}
        .tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:999px;background:#ecece8;margin-right:44px}.tabs button{border:0;border-radius:999px;padding:10px;background:none;font:700 .95rem var(--fb);color:var(--ink);cursor:pointer;transition:background .3s,color .3s}.tabs button[aria-selected=true]{background:var(--deep);color:var(--label)}
        .amg{width:100%;justify-content:center;min-height:56px;border-radius:16px}
        .or{display:flex;align-items:center;gap:14px;color:#6b6470;margin:16px 0;font-size:.95rem}.or::before,.or::after{content:"";flex:1;height:1px;background:#dcdcd8}
        .fld{display:flex;align-items:center;border:1.5px solid #dcdcd8;border-radius:16px;background:#fff;height:58px;padding:0 6px 0 16px;transition:border-color .3s}.fld:focus-within{border-color:var(--deep)}.fld input{flex:1;min-width:0;border:0;outline:0;background:none;font:1rem var(--fb);color:var(--ink)}.fld button{width:44px;height:44px;border:0;border-radius:50%;background:none;cursor:pointer;display:grid;place-items:center;color:var(--ink);transition:background .3s,color .3s}.fld button:hover{background:var(--deep);color:var(--label)}.fld svg{width:20px;height:20px}
        .err{color:#b3261e;font-size:.9rem;min-height:1.3em;margin-top:6px}
        .ck{display:flex;gap:10px;align-items:center;margin-top:10px;cursor:pointer}.ck input{width:20px;height:20px;accent-color:var(--deep)}
        .tos{text-align:center;font-size:.85rem;color:#6b6470;margin-top:20px}.tos a{color:inherit}
        .ok{text-align:center;padding:30px 0 6px}.ok svg{width:64px;height:64px;color:var(--deep)}
        
        /* Checkout Modal CSS */
        .co-modal{position:fixed;inset:0;z-index:90;display:grid;place-items:center;padding:16px;background:rgba(23,15,27,.6);backdrop-filter:blur(8px)}
        .co-modal[hidden]{display:none}
        .co-box{background:#fff;border-radius:24px;padding:30px;width:100%;max-width:400px;box-shadow:0 10px 40px rgba(0,0,0,.2);color:var(--ink);position:relative}
        .co-title{font-size:1.8rem;margin-bottom:20px;font-family:var(--fd);font-weight:800;letter-spacing:-.03em}
        .co-total-box{background:var(--ice);padding:16px;border-radius:16px;display:flex;justify-content:space-between;font-weight:700;margin-bottom:20px;font-size:1.1rem}
        .pay-methods{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px}
        .pay-btn{border:2px solid #eaeaea;border-radius:12px;padding:12px 8px;background:#fff;cursor:pointer;font:700 .9rem var(--fb);color:#666;display:flex;flex-direction:column;align-items:center;gap:8px;transition:all .3s}
        .pay-btn.active{border-color:var(--deep);background:var(--tint);color:var(--deep)}
        .pay-btn img{width:32px;height:32px;object-fit:contain}
        .pay-info{background:#f0f8ff;padding:16px;border-radius:16px;border:1px solid #cce5ff;margin-bottom:20px;text-align:center}
        .pay-info p{margin:0 0 6px;font-size:.9rem;color:#555}
        .pay-number{font-size:1.4rem;font-weight:800;color:#0056b3;letter-spacing:1px}
        .co-success{text-align:center;padding:20px 0}
        .co-success-icon{width:80px;height:80px;background:#e6f7eb;border-radius:50%;display:grid;place-items:center;margin:0 auto 20px;color:#1daf52}
        .co-success h2{font-size:2rem;margin-bottom:10px;font-family:var(--fd);color:var(--ink)}
        .co-success p{color:#666;margin-bottom:24px}
        @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
      `}} />

      <div dangerouslySetInnerHTML={{ __html: `
        <header class="hdr" id="hdr"><div class="nav"><a class="logo" href="#top">khabo</a>
          <ul><li><a href="#why">Why Khabo</a></li><li><a href="#cats">Categories</a></li><li><a href="#vendors">Kitchens</a></li><li><a href="#sell">Sell with us</a></li></ul>
          <div class="nr"><button class="bag" id="acct" aria-label="Sign in or create an account"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg></button><button class="bag" id="bag" aria-label="Open bag">🛍<b id="bagN" data-n="0">0</b></button></div></div></header>

        <main>
          <section class="hero" id="top">
            <div class="hero-ui g"><p class="eyebrow" id="hEy">Local food marketplace</p><h1 id="hH">Food, but make it local.</h1></div>
            <div class="stage" id="stage"></div>
            <button class="btn add" id="hAdd" data-add>Add to bag</button>
            <div class="hero-bot"><h2 class="hname" id="hName" aria-live="polite"></h2>
              <div class="ctrl"><button class="ibtn" id="pv" aria-label="Previous">←</button><span class="meta" id="hMeta"></span><button class="ibtn" id="nx" aria-label="Next">→</button></div></div>
          </section>

          <section class="why" id="why"><div class="stick g"><div>
                <p class="eyebrow">Why Khabo · <span id="wI">01</span> / 04</p>
                <div class="num"><span id="wNum">500</span><small id="wU">+</small></div>
                <h2 id="wL"></h2><p class="b" id="wB"></p><div class="steps" id="wS" role="tablist"></div></div>
              <div class="vis" id="wV"></div></div></section>

          <section class="stmt g"><p id="stmt">We put every neighbourhood kitchen, bakery and farm stall in one bag, so dinner stops being a hunt.</p></section>
          <div class="mq" aria-hidden="true"><div id="mq"></div></div>

          <section class="flv" id="cats"><div class="fstick">
              <ul class="flist" id="fl"><span class="fill" id="fill"></span></ul>
              <div class="fst"><div class="fdisc" id="fd"></div><div id="fe"></div><div class="ff" id="f1"></div><div class="ff" id="f2"></div><div class="ff" id="f3"></div></div>
              <div class="fcopy"><p class="eyebrow" id="fEy"></p><h2 id="fN"></h2><p class="n" id="fNo"></p>
                <div class="row"><button class="btn" id="fB">Browse kitchens <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button><span id="fP" style="font-weight:700"></span></div></div>
            </div></section>

          <section class="vend" id="vendors"><div class="g vh"><div><p class="eyebrow">Open right now</p><h2 data-split>Pick your kitchen.</h2><p>Every vendor is verified, rated by real customers and delivers on its own schedule.</p></div></div>
            <div class="sl" id="sl"><div class="trk" id="trk"></div></div>
            <div class="sbar"><button class="ibtn" id="sp" aria-label="Previous kitchens">←</button><button class="ibtn" id="sn" aria-label="Next kitchens">→</button></div></section>

          <section class="sell" id="sell"><div class="g in"><div><p class="eyebrow">Become a seller</p><h2 data-split>Got a kitchen? Open a shop in a day.</h2><p>No setup fee. List your menu, set your hours and get paid every week.</p><button class="btn" id="startSell" type="button">Start selling</button></div><div class="big"><span id="sc">0</span>+</div></div></section>
        </main>

        <footer class="foot"><div class="g"><h2 data-split>Hungry yet?</h2><p>Order from the kitchens around you, or open your own.</p><a class="btn" href="#vendors">Shop now</a></div>
          <div class="mark" id="mark" aria-hidden="true">khabo</div><div class="g cp">© 2026 Khabo. Placeholder brand for the build.</div></footer>

        <div class="cart" id="cart" hidden><div class="scrim" id="cSc"></div>
          <aside class="cpanel" id="cPanel" role="dialog" aria-modal="true" aria-labelledby="cT">
            <div class="ch"><h2 id="cT">Your bag</h2><button class="ibtn" id="cX" type="button" aria-label="Close bag">✕</button></div>
            <div class="cmsg"><p id="cMsg"></p><div class="cbar"><i id="cBar"></i></div></div>
            <div class="cbody"><ul class="clist" id="cList"></ul><div class="cempty" id="cEmpty"><p>Your bag is empty</p><p>Pick a kitchen and add something tasty.</p><button class="btn" id="cBrowse" type="button">Browse kitchens</button></div></div>
            <div class="cfoot" id="cFoot" hidden><div class="csub"><span>Subtotal</span><span id="cSub">৳0</span></div><p id="cNote">Delivery and any discounts are worked out at checkout.</p><button class="btn cgo" id="cGo" type="button">Checkout</button></div>
          </aside></div>
          
        <!-- নতুন Checkout Modal -->
        <div class="co-modal" id="checkoutModal" hidden>
          <div class="co-box" id="coBox">
            <div id="coMainBox">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2 class="co-title">Checkout</h2>
                <button class="ibtn" id="coClose" style="width:36px;height:36px;font-size:1rem;border-width:1.5px;">✕</button>
              </div>
              
              <div class="co-total-box">
                <span>Total Amount:</span>
                <span id="coTotal" style="color:var(--deep);">৳0</span>
              </div>

              <p style="font-weight:600;margin-bottom:10px;font-size:0.95rem;">Select Payment Method</p>
              <div class="pay-methods">
                <button class="pay-btn active" data-method="bkash">
                  <span style="font-size:1.5rem;">📱</span> bKash
                </button>
                <button class="pay-btn" data-method="nagad">
                  <span style="font-size:1.5rem;">💳</span> Nagad
                </button>
                <button class="pay-btn" data-method="rocket">
                  <span style="font-size:1.5rem;">🚀</span> Rocket
                </button>
              </div>

              <div class="pay-info">
                <p>Send Money to (Personal)</p>
                <div class="pay-number">01323374428</div>
              </div>

              <button class="btn" id="payConfirm" style="width:100%;justify-content:center;background:var(--deep);color:var(--label);">Confirm Payment</button>
            </div>

            <div class="co-success" id="coSuccessBox" hidden>
              <div class="co-success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h2>Thank You!</h2>
              <p>Your order has been successfully placed.</p>
              <button class="btn" id="coSuccessClose" style="width:100%;justify-content:center;background:var(--deep);color:var(--label);">Close</button>
            </div>
          </div>
        </div>

        <div class="am" id="am" hidden><div class="scrim" id="amSc"></div>
          <div class="amb" id="amBox" role="dialog" aria-modal="true" aria-labelledby="amT">
            <button class="ibtn amx" id="amX" type="button" aria-label="Close">✕</button>
            <div id="amMain"><div class="tabs" id="amTabs" role="tablist"><button type="button" role="tab" data-m="customer" aria-selected="true">Customer</button><button type="button" role="tab" data-m="seller" aria-selected="false">Seller</button></div>
              <h2 id="amT">Sign in</h2><p class="sub" id="amS">Sign in or create an account</p>
              <button class="btn amg" type="button" id="amG">Continue with Google</button>
              <div class="or">or</div>
              <form id="amF" novalidate><div class="fld"><input id="amE" type="email" autocomplete="email" inputmode="email" placeholder="Email" aria-label="Email"><button type="submit" aria-label="Continue with email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button></div><p class="err" id="amErr" role="alert"></p>
                <label class="ck"><input type="checkbox" checked><span id="amCk">Email me with news and offers</span></label></form>
              <p class="tos">By continuing, you agree to our <a href="#">Terms of service</a></p></div>
            <div class="ok" id="amOk" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path id="amTick" d="M7 12.5l3.5 3.5L17 9" /></svg><h2>Check your inbox</h2><p id="amOkP"></p></div>
          </div></div>
      `}} />
    </>
  );
}