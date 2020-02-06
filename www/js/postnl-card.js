!function (e, t) {
  "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self).PostNLCard = t();
}(this, function () {
  "use strict";

  const e = new WeakMap(),
        t = t => "function" == typeof t && e.has(t),
        i = void 0 !== window.customElements && void 0 !== window.customElements.polyfillWrapFlushCallback,
        s = (e, t, i = null) => {
    for (; t !== i;) {
      const i = t.nextSibling;
      e.removeChild(t), t = i;
    }
  },
        a = {},
        n = {},
        r = `{{lit-${String(Math.random()).slice(2)}}}`,
        o = `\x3c!--${r}--\x3e`,
        l = new RegExp(`${r}|${o}`),
        d = "$lit$";

  class c {
    constructor(e, t) {
      this.parts = [], this.element = t;
      const i = [],
            s = [],
            a = document.createTreeWalker(t.content, 133, null, !1);
      let n = 0,
          o = -1,
          c = 0;
      const {
        strings: p,
        values: {
          length: f
        }
      } = e;

      for (; c < f;) {
        const e = a.nextNode();

        if (null !== e) {
          if (o++, 1 === e.nodeType) {
            if (e.hasAttributes()) {
              const t = e.attributes,
                    {
                length: i
              } = t;
              let s = 0;

              for (let e = 0; e < i; e++) h(t[e].name, d) && s++;

              for (; s-- > 0;) {
                const t = p[c],
                      i = m.exec(t)[2],
                      s = i.toLowerCase() + d,
                      a = e.getAttribute(s);
                e.removeAttribute(s);
                const n = a.split(l);
                this.parts.push({
                  type: "attribute",
                  index: o,
                  name: i,
                  strings: n
                }), c += n.length - 1;
              }
            }

            "TEMPLATE" === e.tagName && (s.push(e), a.currentNode = e.content);
          } else if (3 === e.nodeType) {
            const t = e.data;

            if (t.indexOf(r) >= 0) {
              const s = e.parentNode,
                    a = t.split(l),
                    n = a.length - 1;

              for (let t = 0; t < n; t++) {
                let i,
                    n = a[t];
                if ("" === n) i = u();else {
                  const e = m.exec(n);
                  null !== e && h(e[2], d) && (n = n.slice(0, e.index) + e[1] + e[2].slice(0, -d.length) + e[3]), i = document.createTextNode(n);
                }
                s.insertBefore(i, e), this.parts.push({
                  type: "node",
                  index: ++o
                });
              }

              "" === a[n] ? (s.insertBefore(u(), e), i.push(e)) : e.data = a[n], c += n;
            }
          } else if (8 === e.nodeType) if (e.data === r) {
            const t = e.parentNode;
            null !== e.previousSibling && o !== n || (o++, t.insertBefore(u(), e)), n = o, this.parts.push({
              type: "node",
              index: o
            }), null === e.nextSibling ? e.data = "" : (i.push(e), o--), c++;
          } else {
            let t = -1;

            for (; -1 !== (t = e.data.indexOf(r, t + 1));) this.parts.push({
              type: "node",
              index: -1
            }), c++;
          }
        } else a.currentNode = s.pop();
      }

      for (const e of i) e.parentNode.removeChild(e);
    }

  }

  const h = (e, t) => {
    const i = e.length - t.length;
    return i >= 0 && e.slice(i) === t;
  },
        p = e => -1 !== e.index,
        u = () => document.createComment(""),
        m = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=\/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

  class f {
    constructor(e, t, i) {
      this.__parts = [], this.template = e, this.processor = t, this.options = i;
    }

    update(e) {
      let t = 0;

      for (const i of this.__parts) void 0 !== i && i.setValue(e[t]), t++;

      for (const e of this.__parts) void 0 !== e && e.commit();
    }

    _clone() {
      const e = i ? this.template.element.content.cloneNode(!0) : document.importNode(this.template.element.content, !0),
            t = [],
            s = this.template.parts,
            a = document.createTreeWalker(e, 133, null, !1);
      let n,
          r = 0,
          o = 0,
          l = a.nextNode();

      for (; r < s.length;) if (n = s[r], p(n)) {
        for (; o < n.index;) o++, "TEMPLATE" === l.nodeName && (t.push(l), a.currentNode = l.content), null === (l = a.nextNode()) && (a.currentNode = t.pop(), l = a.nextNode());

        if ("node" === n.type) {
          const e = this.processor.handleTextExpression(this.options);
          e.insertAfterNode(l.previousSibling), this.__parts.push(e);
        } else this.__parts.push(...this.processor.handleAttributeExpressions(l, n.name, n.strings, this.options));

        r++;
      } else this.__parts.push(void 0), r++;

      return i && (document.adoptNode(e), customElements.upgrade(e)), e;
    }

  }

  class g {
    constructor(e, t, i, s) {
      this.strings = e, this.values = t, this.type = i, this.processor = s;
    }

    getHTML() {
      const e = this.strings.length - 1;
      let t = "",
          i = !1;

      for (let s = 0; s < e; s++) {
        const e = this.strings[s],
              a = e.lastIndexOf("\x3c!--");
        i = (a > -1 || i) && -1 === e.indexOf("--\x3e", a + 1);
        const n = m.exec(e);
        t += null === n ? e + (i ? r : o) : e.substr(0, n.index) + n[1] + n[2] + d + n[3] + r;
      }

      return t += this.strings[e];
    }

    getTemplateElement() {
      const e = document.createElement("template");
      return e.innerHTML = this.getHTML(), e;
    }

  }

  const v = e => null === e || !("object" == typeof e || "function" == typeof e),
        w = e => Array.isArray(e) || !(!e || !e[Symbol.iterator]);

  class b {
    constructor(e, t, i) {
      this.dirty = !0, this.element = e, this.name = t, this.strings = i, this.parts = [];

      for (let e = 0; e < i.length - 1; e++) this.parts[e] = this._createPart();
    }

    _createPart() {
      return new y(this);
    }

    _getValue() {
      const e = this.strings,
            t = e.length - 1;
      let i = "";

      for (let s = 0; s < t; s++) {
        i += e[s];
        const t = this.parts[s];

        if (void 0 !== t) {
          const e = t.value;
          if (v(e) || !w(e)) i += "string" == typeof e ? e : String(e);else for (const t of e) i += "string" == typeof t ? t : String(t);
        }
      }

      return i += e[t];
    }

    commit() {
      this.dirty && (this.dirty = !1, this.element.setAttribute(this.name, this._getValue()));
    }

  }

  class y {
    constructor(e) {
      this.value = void 0, this.committer = e;
    }

    setValue(e) {
      e === a || v(e) && e === this.value || (this.value = e, t(e) || (this.committer.dirty = !0));
    }

    commit() {
      for (; t(this.value);) {
        const e = this.value;
        this.value = a, e(this);
      }

      this.value !== a && this.committer.commit();
    }

  }

  class x {
    constructor(e) {
      this.value = void 0, this.__pendingValue = void 0, this.options = e;
    }

    appendInto(e) {
      this.startNode = e.appendChild(u()), this.endNode = e.appendChild(u());
    }

    insertAfterNode(e) {
      this.startNode = e, this.endNode = e.nextSibling;
    }

    appendIntoPart(e) {
      e.__insert(this.startNode = u()), e.__insert(this.endNode = u());
    }

    insertAfterPart(e) {
      e.__insert(this.startNode = u()), this.endNode = e.endNode, e.endNode = this.startNode;
    }

    setValue(e) {
      this.__pendingValue = e;
    }

    commit() {
      for (; t(this.__pendingValue);) {
        const e = this.__pendingValue;
        this.__pendingValue = a, e(this);
      }

      const e = this.__pendingValue;
      e !== a && (v(e) ? e !== this.value && this.__commitText(e) : e instanceof g ? this.__commitTemplateResult(e) : e instanceof Node ? this.__commitNode(e) : w(e) ? this.__commitIterable(e) : e === n ? (this.value = n, this.clear()) : this.__commitText(e));
    }

    __insert(e) {
      this.endNode.parentNode.insertBefore(e, this.endNode);
    }

    __commitNode(e) {
      this.value !== e && (this.clear(), this.__insert(e), this.value = e);
    }

    __commitText(e) {
      const t = this.startNode.nextSibling;
      e = null == e ? "" : e, t === this.endNode.previousSibling && 3 === t.nodeType ? t.data = e : this.__commitNode(document.createTextNode("string" == typeof e ? e : String(e))), this.value = e;
    }

    __commitTemplateResult(e) {
      const t = this.options.templateFactory(e);
      if (this.value instanceof f && this.value.template === t) this.value.update(e.values);else {
        const i = new f(t, e.processor, this.options),
              s = i._clone();

        i.update(e.values), this.__commitNode(s), this.value = i;
      }
    }

    __commitIterable(e) {
      Array.isArray(this.value) || (this.value = [], this.clear());
      const t = this.value;
      let i,
          s = 0;

      for (const a of e) void 0 === (i = t[s]) && (i = new x(this.options), t.push(i), 0 === s ? i.appendIntoPart(this) : i.insertAfterPart(t[s - 1])), i.setValue(a), i.commit(), s++;

      s < t.length && (t.length = s, this.clear(i && i.endNode));
    }

    clear(e = this.startNode) {
      s(this.startNode.parentNode, e.nextSibling, this.endNode);
    }

  }

  class _ {
    constructor(e, t, i) {
      if (this.value = void 0, this.__pendingValue = void 0, 2 !== i.length || "" !== i[0] || "" !== i[1]) throw new Error("Boolean attributes can only contain a single expression");
      this.element = e, this.name = t, this.strings = i;
    }

    setValue(e) {
      this.__pendingValue = e;
    }

    commit() {
      for (; t(this.__pendingValue);) {
        const e = this.__pendingValue;
        this.__pendingValue = a, e(this);
      }

      if (this.__pendingValue === a) return;
      const e = !!this.__pendingValue;
      this.value !== e && (e ? this.element.setAttribute(this.name, "") : this.element.removeAttribute(this.name), this.value = e), this.__pendingValue = a;
    }

  }

  class S extends b {
    constructor(e, t, i) {
      super(e, t, i), this.single = 2 === i.length && "" === i[0] && "" === i[1];
    }

    _createPart() {
      return new C(this);
    }

    _getValue() {
      return this.single ? this.parts[0].value : super._getValue();
    }

    commit() {
      this.dirty && (this.dirty = !1, this.element[this.name] = this._getValue());
    }

  }

  class C extends y {}

  let T = !1;

  try {
    const e = {
      get capture() {
        return T = !0, !1;
      }

    };
    window.addEventListener("test", e, e), window.removeEventListener("test", e, e);
  } catch (e) {}

  class k {
    constructor(e, t, i) {
      this.value = void 0, this.__pendingValue = void 0, this.element = e, this.eventName = t, this.eventContext = i, this.__boundHandleEvent = e => this.handleEvent(e);
    }

    setValue(e) {
      this.__pendingValue = e;
    }

    commit() {
      for (; t(this.__pendingValue);) {
        const e = this.__pendingValue;
        this.__pendingValue = a, e(this);
      }

      if (this.__pendingValue === a) return;
      const e = this.__pendingValue,
            i = this.value,
            s = null == e || null != i && (e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive),
            n = null != e && (null == i || s);
      s && this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options), n && (this.__options = E(e), this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options)), this.value = e, this.__pendingValue = a;
    }

    handleEvent(e) {
      "function" == typeof this.value ? this.value.call(this.eventContext || this.element, e) : this.value.handleEvent(e);
    }

  }

  const E = e => e && (T ? {
    capture: e.capture,
    passive: e.passive,
    once: e.once
  } : e.capture);

  const M = new class {
    handleAttributeExpressions(e, t, i, s) {
      const a = t[0];
      return "." === a ? new S(e, t.slice(1), i).parts : "@" === a ? [new k(e, t.slice(1), s.eventContext)] : "?" === a ? [new _(e, t.slice(1), i)] : new b(e, t, i).parts;
    }

    handleTextExpression(e) {
      return new x(e);
    }

  }();

  function D(e) {
    let t = $.get(e.type);
    void 0 === t && (t = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    }, $.set(e.type, t));
    let i = t.stringsArray.get(e.strings);
    if (void 0 !== i) return i;
    const s = e.strings.join(r);
    return void 0 === (i = t.keyString.get(s)) && (i = new c(e, e.getTemplateElement()), t.keyString.set(s, i)), t.stringsArray.set(e.strings, i), i;
  }

  const $ = new Map(),
        P = new WeakMap();
  (window.litHtmlVersions || (window.litHtmlVersions = [])).push("1.0.0");

  const O = (e, ...t) => new g(e, t, "html", M),
        z = 133;

  function L(e, t) {
    const {
      element: {
        content: i
      },
      parts: s
    } = e,
          a = document.createTreeWalker(i, z, null, !1);
    let n = I(s),
        r = s[n],
        o = -1,
        l = 0;
    const d = [];
    let c = null;

    for (; a.nextNode();) {
      o++;
      const e = a.currentNode;

      for (e.previousSibling === c && (c = null), t.has(e) && (d.push(e), null === c && (c = e)), null !== c && l++; void 0 !== r && r.index === o;) r.index = null !== c ? -1 : r.index - l, r = s[n = I(s, n)];
    }

    d.forEach(e => e.parentNode.removeChild(e));
  }

  const Y = e => {
    let t = 11 === e.nodeType ? 0 : 1;
    const i = document.createTreeWalker(e, z, null, !1);

    for (; i.nextNode();) t++;

    return t;
  },
        I = (e, t = -1) => {
    for (let i = t + 1; i < e.length; i++) {
      const t = e[i];
      if (p(t)) return i;
    }

    return -1;
  };

  const F = (e, t) => `${e}--${t}`;

  let A = !0;
  void 0 === window.ShadyCSS ? A = !1 : void 0 === window.ShadyCSS.prepareTemplateDom && (console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."), A = !1);

  const N = e => t => {
    const i = F(t.type, e);
    let s = $.get(i);
    void 0 === s && (s = {
      stringsArray: new WeakMap(),
      keyString: new Map()
    }, $.set(i, s));
    let a = s.stringsArray.get(t.strings);
    if (void 0 !== a) return a;
    const n = t.strings.join(r);

    if (void 0 === (a = s.keyString.get(n))) {
      const i = t.getTemplateElement();
      A && window.ShadyCSS.prepareTemplateDom(i, e), a = new c(t, i), s.keyString.set(n, a);
    }

    return s.stringsArray.set(t.strings, a), a;
  },
        H = ["html", "svg"],
        V = new Set(),
        j = (e, t, i) => {
    V.add(i);
    const s = e.querySelectorAll("style"),
          {
      length: a
    } = s;
    if (0 === a) return void window.ShadyCSS.prepareTemplateStyles(t.element, i);
    const n = document.createElement("style");

    for (let e = 0; e < a; e++) {
      const t = s[e];
      t.parentNode.removeChild(t), n.textContent += t.textContent;
    }

    (e => {
      H.forEach(t => {
        const i = $.get(F(t, e));
        void 0 !== i && i.keyString.forEach(e => {
          const {
            element: {
              content: t
            }
          } = e,
                i = new Set();
          Array.from(t.querySelectorAll("style")).forEach(e => {
            i.add(e);
          }), L(e, i);
        });
      });
    })(i);

    const r = t.element.content;
    !function (e, t, i = null) {
      const {
        element: {
          content: s
        },
        parts: a
      } = e;
      if (null == i) return void s.appendChild(t);
      const n = document.createTreeWalker(s, z, null, !1);
      let r = I(a),
          o = 0,
          l = -1;

      for (; n.nextNode();) for (l++, n.currentNode === i && (o = Y(t), i.parentNode.insertBefore(t, i)); -1 !== r && a[r].index === l;) {
        if (o > 0) {
          for (; -1 !== r;) a[r].index += o, r = I(a, r);

          return;
        }

        r = I(a, r);
      }
    }(t, n, r.firstChild), window.ShadyCSS.prepareTemplateStyles(t.element, i);
    const o = r.querySelector("style");
    if (window.ShadyCSS.nativeShadow && null !== o) e.insertBefore(o.cloneNode(!0), e.firstChild);else {
      r.insertBefore(n, r.firstChild);
      const e = new Set();
      e.add(n), L(t, e);
    }
  };

  window.JSCompiler_renameProperty = (e, t) => e;

  const R = {
    toAttribute(e, t) {
      switch (t) {
        case Boolean:
          return e ? "" : null;

        case Object:
        case Array:
          return null == e ? e : JSON.stringify(e);
      }

      return e;
    },

    fromAttribute(e, t) {
      switch (t) {
        case Boolean:
          return null !== e;

        case Number:
          return null === e ? null : Number(e);

        case Object:
        case Array:
          return JSON.parse(e);
      }

      return e;
    }

  },
        G = (e, t) => t !== e && (t == t || e == e),
        W = {
    attribute: !0,
    type: String,
    converter: R,
    reflect: !1,
    hasChanged: G
  },
        B = Promise.resolve(!0),
        U = 1,
        X = 4,
        q = 8,
        Z = 16,
        K = 32;

  class J extends HTMLElement {
    constructor() {
      super(), this._updateState = 0, this._instanceProperties = void 0, this._updatePromise = B, this._hasConnectedResolver = void 0, this._changedProperties = new Map(), this._reflectingProperties = void 0, this.initialize();
    }

    static get observedAttributes() {
      this.finalize();
      const e = [];
      return this._classProperties.forEach((t, i) => {
        const s = this._attributeNameForProperty(i, t);

        void 0 !== s && (this._attributeToPropertyMap.set(s, i), e.push(s));
      }), e;
    }

    static _ensureClassProperties() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties", this))) {
        this._classProperties = new Map();

        const e = Object.getPrototypeOf(this)._classProperties;

        void 0 !== e && e.forEach((e, t) => this._classProperties.set(t, e));
      }
    }

    static createProperty(e, t = W) {
      if (this._ensureClassProperties(), this._classProperties.set(e, t), t.noAccessor || this.prototype.hasOwnProperty(e)) return;
      const i = "symbol" == typeof e ? Symbol() : `__${e}`;
      Object.defineProperty(this.prototype, e, {
        get() {
          return this[i];
        },

        set(t) {
          const s = this[e];
          this[i] = t, this._requestUpdate(e, s);
        },

        configurable: !0,
        enumerable: !0
      });
    }

    static finalize() {
      if (this.hasOwnProperty(JSCompiler_renameProperty("finalized", this)) && this.finalized) return;
      const e = Object.getPrototypeOf(this);

      if ("function" == typeof e.finalize && e.finalize(), this.finalized = !0, this._ensureClassProperties(), this._attributeToPropertyMap = new Map(), this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
        const e = this.properties,
              t = [...Object.getOwnPropertyNames(e), ...("function" == typeof Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(e) : [])];

        for (const i of t) this.createProperty(i, e[i]);
      }
    }

    static _attributeNameForProperty(e, t) {
      const i = t.attribute;
      return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof e ? e.toLowerCase() : void 0;
    }

    static _valueHasChanged(e, t, i = G) {
      return i(e, t);
    }

    static _propertyValueFromAttribute(e, t) {
      const i = t.type,
            s = t.converter || R,
            a = "function" == typeof s ? s : s.fromAttribute;
      return a ? a(e, i) : e;
    }

    static _propertyValueToAttribute(e, t) {
      if (void 0 === t.reflect) return;
      const i = t.type,
            s = t.converter;
      return (s && s.toAttribute || R.toAttribute)(e, i);
    }

    initialize() {
      this._saveInstanceProperties(), this._requestUpdate();
    }

    _saveInstanceProperties() {
      this.constructor._classProperties.forEach((e, t) => {
        if (this.hasOwnProperty(t)) {
          const e = this[t];
          delete this[t], this._instanceProperties || (this._instanceProperties = new Map()), this._instanceProperties.set(t, e);
        }
      });
    }

    _applyInstanceProperties() {
      this._instanceProperties.forEach((e, t) => this[t] = e), this._instanceProperties = void 0;
    }

    connectedCallback() {
      this._updateState = this._updateState | K, this._hasConnectedResolver && (this._hasConnectedResolver(), this._hasConnectedResolver = void 0);
    }

    disconnectedCallback() {}

    attributeChangedCallback(e, t, i) {
      t !== i && this._attributeToProperty(e, i);
    }

    _propertyToAttribute(e, t, i = W) {
      const s = this.constructor,
            a = s._attributeNameForProperty(e, i);

      if (void 0 !== a) {
        const e = s._propertyValueToAttribute(t, i);

        if (void 0 === e) return;
        this._updateState = this._updateState | q, null == e ? this.removeAttribute(a) : this.setAttribute(a, e), this._updateState = this._updateState & ~q;
      }
    }

    _attributeToProperty(e, t) {
      if (this._updateState & q) return;

      const i = this.constructor,
            s = i._attributeToPropertyMap.get(e);

      if (void 0 !== s) {
        const e = i._classProperties.get(s) || W;
        this._updateState = this._updateState | Z, this[s] = i._propertyValueFromAttribute(t, e), this._updateState = this._updateState & ~Z;
      }
    }

    _requestUpdate(e, t) {
      let i = !0;

      if (void 0 !== e) {
        const s = this.constructor,
              a = s._classProperties.get(e) || W;
        s._valueHasChanged(this[e], t, a.hasChanged) ? (this._changedProperties.has(e) || this._changedProperties.set(e, t), !0 !== a.reflect || this._updateState & Z || (void 0 === this._reflectingProperties && (this._reflectingProperties = new Map()), this._reflectingProperties.set(e, a))) : i = !1;
      }

      !this._hasRequestedUpdate && i && this._enqueueUpdate();
    }

    requestUpdate(e, t) {
      return this._requestUpdate(e, t), this.updateComplete;
    }

    async _enqueueUpdate() {
      let e, t;
      this._updateState = this._updateState | X;
      const i = this._updatePromise;
      this._updatePromise = new Promise((i, s) => {
        e = i, t = s;
      });

      try {
        await i;
      } catch (e) {}

      this._hasConnected || (await new Promise(e => this._hasConnectedResolver = e));

      try {
        const e = this.performUpdate();
        null != e && (await e);
      } catch (e) {
        t(e);
      }

      e(!this._hasRequestedUpdate);
    }

    get _hasConnected() {
      return this._updateState & K;
    }

    get _hasRequestedUpdate() {
      return this._updateState & X;
    }

    get hasUpdated() {
      return this._updateState & U;
    }

    performUpdate() {
      this._instanceProperties && this._applyInstanceProperties();
      let e = !1;
      const t = this._changedProperties;

      try {
        (e = this.shouldUpdate(t)) && this.update(t);
      } catch (t) {
        throw e = !1, t;
      } finally {
        this._markUpdated();
      }

      e && (this._updateState & U || (this._updateState = this._updateState | U, this.firstUpdated(t)), this.updated(t));
    }

    _markUpdated() {
      this._changedProperties = new Map(), this._updateState = this._updateState & ~X;
    }

    get updateComplete() {
      return this._updatePromise;
    }

    shouldUpdate(e) {
      return !0;
    }

    update(e) {
      void 0 !== this._reflectingProperties && this._reflectingProperties.size > 0 && (this._reflectingProperties.forEach((e, t) => this._propertyToAttribute(t, this[t], e)), this._reflectingProperties = void 0);
    }

    updated(e) {}

    firstUpdated(e) {}

  }

  J.finalized = !0;
  const Q = "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype,
        ee = Symbol();

  class te {
    constructor(e, t) {
      if (t !== ee) throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
      this.cssText = e;
    }

    get styleSheet() {
      return void 0 === this._styleSheet && (Q ? (this._styleSheet = new CSSStyleSheet(), this._styleSheet.replaceSync(this.cssText)) : this._styleSheet = null), this._styleSheet;
    }

    toString() {
      return this.cssText;
    }

  }

  const ie = e => new te(String(e), ee);

  (window.litElementVersions || (window.litElementVersions = [])).push("2.0.1");

  const se = e => e.flat ? e.flat(1 / 0) : function e(t, i = []) {
    for (let s = 0, a = t.length; s < a; s++) {
      const a = t[s];
      Array.isArray(a) ? e(a, i) : i.push(a);
    }

    return i;
  }(e);

  class ae extends J {
    static finalize() {
      super.finalize(), this._styles = this.hasOwnProperty(JSCompiler_renameProperty("styles", this)) ? this._getUniqueStyles() : this._styles || [];
    }

    static _getUniqueStyles() {
      const e = this.styles,
            t = [];

      if (Array.isArray(e)) {
        se(e).reduceRight((e, t) => (e.add(t), e), new Set()).forEach(e => t.unshift(e));
      } else e && t.push(e);

      return t;
    }

    initialize() {
      super.initialize(), this.renderRoot = this.createRenderRoot(), window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot && this.adoptStyles();
    }

    createRenderRoot() {
      return this.attachShadow({
        mode: "open"
      });
    }

    adoptStyles() {
      const e = this.constructor._styles;
      0 !== e.length && (void 0 === window.ShadyCSS || window.ShadyCSS.nativeShadow ? Q ? this.renderRoot.adoptedStyleSheets = e.map(e => e.styleSheet) : this._needsShimAdoptedStyleSheets = !0 : window.ShadyCSS.ScopingShim.prepareAdoptedCssText(e.map(e => e.cssText), this.localName));
    }

    connectedCallback() {
      super.connectedCallback(), this.hasUpdated && void 0 !== window.ShadyCSS && window.ShadyCSS.styleElement(this);
    }

    update(e) {
      super.update(e);
      const t = this.render();
      t instanceof g && this.constructor.render(t, this.renderRoot, {
        scopeName: this.localName,
        eventContext: this
      }), this._needsShimAdoptedStyleSheets && (this._needsShimAdoptedStyleSheets = !1, this.constructor._styles.forEach(e => {
        const t = document.createElement("style");
        t.textContent = e.cssText, this.renderRoot.appendChild(t);
      }));
    }

    render() {}

  }

  var ne, re;

  function oe() {
    return ne.apply(null, arguments);
  }

  function le(e) {
    return e instanceof Array || "[object Array]" === Object.prototype.toString.call(e);
  }

  function de(e) {
    return null != e && "[object Object]" === Object.prototype.toString.call(e);
  }

  function ce(e) {
    return void 0 === e;
  }

  function he(e) {
    return "number" == typeof e || "[object Number]" === Object.prototype.toString.call(e);
  }

  function pe(e) {
    return e instanceof Date || "[object Date]" === Object.prototype.toString.call(e);
  }

  function ue(e, t) {
    var i,
        s = [];

    for (i = 0; i < e.length; ++i) s.push(t(e[i], i));

    return s;
  }

  function me(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }

  function fe(e, t) {
    for (var i in t) me(t, i) && (e[i] = t[i]);

    return me(t, "toString") && (e.toString = t.toString), me(t, "valueOf") && (e.valueOf = t.valueOf), e;
  }

  function ge(e, t, i, s) {
    return zi(e, t, i, s, !0).utc();
  }

  function ve(e) {
    return null == e._pf && (e._pf = {
      empty: !1,
      unusedTokens: [],
      unusedInput: [],
      overflow: -2,
      charsLeftOver: 0,
      nullInput: !1,
      invalidMonth: null,
      invalidFormat: !1,
      userInvalidated: !1,
      iso: !1,
      parsedDateParts: [],
      meridiem: null,
      rfc2822: !1,
      weekdayMismatch: !1
    }), e._pf;
  }

  function we(e) {
    if (null == e._isValid) {
      var t = ve(e),
          i = re.call(t.parsedDateParts, function (e) {
        return null != e;
      }),
          s = !isNaN(e._d.getTime()) && t.overflow < 0 && !t.empty && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && i);
      if (e._strict && (s = s && 0 === t.charsLeftOver && 0 === t.unusedTokens.length && void 0 === t.bigHour), null != Object.isFrozen && Object.isFrozen(e)) return s;
      e._isValid = s;
    }

    return e._isValid;
  }

  function be(e) {
    var t = ge(NaN);
    return null != e ? fe(ve(t), e) : ve(t).userInvalidated = !0, t;
  }

  ae.finalized = !0, ae.render = (e, t, i) => {
    const a = i.scopeName,
          n = P.has(t),
          r = A && 11 === t.nodeType && !!t.host && e instanceof g,
          o = r && !V.has(a),
          l = o ? document.createDocumentFragment() : t;

    if (((e, t, i) => {
      let a = P.get(t);
      void 0 === a && (s(t, t.firstChild), P.set(t, a = new x(Object.assign({
        templateFactory: D
      }, i))), a.appendInto(t)), a.setValue(e), a.commit();
    })(e, l, Object.assign({
      templateFactory: N(a)
    }, i)), o) {
      const e = P.get(l);
      P.delete(l), e.value instanceof f && j(l, e.value.template, a), s(t, t.firstChild), t.appendChild(l), P.set(t, e);
    }

    !n && r && window.ShadyCSS.styleElement(t.host);
  }, re = Array.prototype.some ? Array.prototype.some : function (e) {
    for (var t = Object(this), i = t.length >>> 0, s = 0; s < i; s++) if (s in t && e.call(this, t[s], s, t)) return !0;

    return !1;
  };
  var ye = oe.momentProperties = [];

  function xe(e, t) {
    var i, s, a;
    if (ce(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), ce(t._i) || (e._i = t._i), ce(t._f) || (e._f = t._f), ce(t._l) || (e._l = t._l), ce(t._strict) || (e._strict = t._strict), ce(t._tzm) || (e._tzm = t._tzm), ce(t._isUTC) || (e._isUTC = t._isUTC), ce(t._offset) || (e._offset = t._offset), ce(t._pf) || (e._pf = ve(t)), ce(t._locale) || (e._locale = t._locale), ye.length > 0) for (i = 0; i < ye.length; i++) ce(a = t[s = ye[i]]) || (e[s] = a);
    return e;
  }

  var _e = !1;

  function Se(e) {
    xe(this, e), this._d = new Date(null != e._d ? e._d.getTime() : NaN), this.isValid() || (this._d = new Date(NaN)), !1 === _e && (_e = !0, oe.updateOffset(this), _e = !1);
  }

  function Ce(e) {
    return e instanceof Se || null != e && null != e._isAMomentObject;
  }

  function Te(e) {
    return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
  }

  function ke(e) {
    var t = +e,
        i = 0;
    return 0 !== t && isFinite(t) && (i = Te(t)), i;
  }

  function Ee(e, t, i) {
    var s,
        a = Math.min(e.length, t.length),
        n = Math.abs(e.length - t.length),
        r = 0;

    for (s = 0; s < a; s++) (i && e[s] !== t[s] || !i && ke(e[s]) !== ke(t[s])) && r++;

    return r + n;
  }

  function Me(e) {
    !1 === oe.suppressDeprecationWarnings && "undefined" != typeof console && console.warn && console.warn("Deprecation warning: " + e);
  }

  function De(e, t) {
    var i = !0;
    return fe(function () {
      if (null != oe.deprecationHandler && oe.deprecationHandler(null, e), i) {
        for (var s, a = [], n = 0; n < arguments.length; n++) {
          if (s = "", "object" == typeof arguments[n]) {
            for (var r in s += "\n[" + n + "] ", arguments[0]) s += r + ": " + arguments[0][r] + ", ";

            s = s.slice(0, -2);
          } else s = arguments[n];

          a.push(s);
        }

        Me(e + "\nArguments: " + Array.prototype.slice.call(a).join("") + "\n" + new Error().stack), i = !1;
      }

      return t.apply(this, arguments);
    }, t);
  }

  var $e,
      Pe = {};

  function Oe(e, t) {
    null != oe.deprecationHandler && oe.deprecationHandler(e, t), Pe[e] || (Me(t), Pe[e] = !0);
  }

  function ze(e) {
    return e instanceof Function || "[object Function]" === Object.prototype.toString.call(e);
  }

  function Le(e, t) {
    var i,
        s = fe({}, e);

    for (i in t) me(t, i) && (de(e[i]) && de(t[i]) ? (s[i] = {}, fe(s[i], e[i]), fe(s[i], t[i])) : null != t[i] ? s[i] = t[i] : delete s[i]);

    for (i in e) me(e, i) && !me(t, i) && de(e[i]) && (s[i] = fe({}, s[i]));

    return s;
  }

  function Ye(e) {
    null != e && this.set(e);
  }

  oe.suppressDeprecationWarnings = !1, oe.deprecationHandler = null, $e = Object.keys ? Object.keys : function (e) {
    var t,
        i = [];

    for (t in e) me(e, t) && i.push(t);

    return i;
  };
  var Ie = {};

  function Fe(e, t) {
    var i = e.toLowerCase();
    Ie[i] = Ie[i + "s"] = Ie[t] = e;
  }

  function Ae(e) {
    return "string" == typeof e ? Ie[e] || Ie[e.toLowerCase()] : void 0;
  }

  function Ne(e) {
    var t,
        i,
        s = {};

    for (i in e) me(e, i) && (t = Ae(i)) && (s[t] = e[i]);

    return s;
  }

  var He = {};

  function Ve(e, t) {
    He[e] = t;
  }

  function je(e, t, i) {
    var s = "" + Math.abs(e),
        a = t - s.length;
    return (e >= 0 ? i ? "+" : "" : "-") + Math.pow(10, Math.max(0, a)).toString().substr(1) + s;
  }

  var Re = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
      Ge = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
      We = {},
      Be = {};

  function Ue(e, t, i, s) {
    var a = s;
    "string" == typeof s && (a = function () {
      return this[s]();
    }), e && (Be[e] = a), t && (Be[t[0]] = function () {
      return je(a.apply(this, arguments), t[1], t[2]);
    }), i && (Be[i] = function () {
      return this.localeData().ordinal(a.apply(this, arguments), e);
    });
  }

  function Xe(e, t) {
    return e.isValid() ? (t = qe(t, e.localeData()), We[t] = We[t] || function (e) {
      var t,
          i,
          s,
          a = e.match(Re);

      for (t = 0, i = a.length; t < i; t++) Be[a[t]] ? a[t] = Be[a[t]] : a[t] = (s = a[t]).match(/\[[\s\S]/) ? s.replace(/^\[|\]$/g, "") : s.replace(/\\/g, "");

      return function (t) {
        var s,
            n = "";

        for (s = 0; s < i; s++) n += ze(a[s]) ? a[s].call(t, e) : a[s];

        return n;
      };
    }(t), We[t](e)) : e.localeData().invalidDate();
  }

  function qe(e, t) {
    var i = 5;

    function s(e) {
      return t.longDateFormat(e) || e;
    }

    for (Ge.lastIndex = 0; i >= 0 && Ge.test(e);) e = e.replace(Ge, s), Ge.lastIndex = 0, i -= 1;

    return e;
  }

  var Ze = /\d/,
      Ke = /\d\d/,
      Je = /\d{3}/,
      Qe = /\d{4}/,
      et = /[+-]?\d{6}/,
      tt = /\d\d?/,
      it = /\d\d\d\d?/,
      st = /\d\d\d\d\d\d?/,
      at = /\d{1,3}/,
      nt = /\d{1,4}/,
      rt = /[+-]?\d{1,6}/,
      ot = /\d+/,
      lt = /[+-]?\d+/,
      dt = /Z|[+-]\d\d:?\d\d/gi,
      ct = /Z|[+-]\d\d(?::?\d\d)?/gi,
      ht = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
      pt = {};

  function ut(e, t, i) {
    pt[e] = ze(t) ? t : function (e, s) {
      return e && i ? i : t;
    };
  }

  function mt(e, t) {
    return me(pt, e) ? pt[e](t._strict, t._locale) : new RegExp(ft(e.replace("\\", "").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (e, t, i, s, a) {
      return t || i || s || a;
    })));
  }

  function ft(e) {
    return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  }

  var gt = {};

  function vt(e, t) {
    var i,
        s = t;

    for ("string" == typeof e && (e = [e]), he(t) && (s = function (e, i) {
      i[t] = ke(e);
    }), i = 0; i < e.length; i++) gt[e[i]] = s;
  }

  function wt(e, t) {
    vt(e, function (e, i, s, a) {
      s._w = s._w || {}, t(e, s._w, s, a);
    });
  }

  function bt(e, t, i) {
    null != t && me(gt, e) && gt[e](t, i._a, i, e);
  }

  var yt = 0,
      xt = 1,
      _t = 2,
      St = 3,
      Ct = 4,
      Tt = 5,
      kt = 6,
      Et = 7,
      Mt = 8;

  function Dt(e) {
    return $t(e) ? 366 : 365;
  }

  function $t(e) {
    return e % 4 == 0 && e % 100 != 0 || e % 400 == 0;
  }

  Ue("Y", 0, 0, function () {
    var e = this.year();
    return e <= 9999 ? "" + e : "+" + e;
  }), Ue(0, ["YY", 2], 0, function () {
    return this.year() % 100;
  }), Ue(0, ["YYYY", 4], 0, "year"), Ue(0, ["YYYYY", 5], 0, "year"), Ue(0, ["YYYYYY", 6, !0], 0, "year"), Fe("year", "y"), Ve("year", 1), ut("Y", lt), ut("YY", tt, Ke), ut("YYYY", nt, Qe), ut("YYYYY", rt, et), ut("YYYYYY", rt, et), vt(["YYYYY", "YYYYYY"], yt), vt("YYYY", function (e, t) {
    t[yt] = 2 === e.length ? oe.parseTwoDigitYear(e) : ke(e);
  }), vt("YY", function (e, t) {
    t[yt] = oe.parseTwoDigitYear(e);
  }), vt("Y", function (e, t) {
    t[yt] = parseInt(e, 10);
  }), oe.parseTwoDigitYear = function (e) {
    return ke(e) + (ke(e) > 68 ? 1900 : 2e3);
  };
  var Pt,
      Ot = zt("FullYear", !0);

  function zt(e, t) {
    return function (i) {
      return null != i ? (Yt(this, e, i), oe.updateOffset(this, t), this) : Lt(this, e);
    };
  }

  function Lt(e, t) {
    return e.isValid() ? e._d["get" + (e._isUTC ? "UTC" : "") + t]() : NaN;
  }

  function Yt(e, t, i) {
    e.isValid() && !isNaN(i) && ("FullYear" === t && $t(e.year()) && 1 === e.month() && 29 === e.date() ? e._d["set" + (e._isUTC ? "UTC" : "") + t](i, e.month(), It(i, e.month())) : e._d["set" + (e._isUTC ? "UTC" : "") + t](i));
  }

  function It(e, t) {
    if (isNaN(e) || isNaN(t)) return NaN;
    var i,
        s = (t % (i = 12) + i) % i;
    return e += (t - s) / 12, 1 === s ? $t(e) ? 29 : 28 : 31 - s % 7 % 2;
  }

  Pt = Array.prototype.indexOf ? Array.prototype.indexOf : function (e) {
    var t;

    for (t = 0; t < this.length; ++t) if (this[t] === e) return t;

    return -1;
  }, Ue("M", ["MM", 2], "Mo", function () {
    return this.month() + 1;
  }), Ue("MMM", 0, 0, function (e) {
    return this.localeData().monthsShort(this, e);
  }), Ue("MMMM", 0, 0, function (e) {
    return this.localeData().months(this, e);
  }), Fe("month", "M"), Ve("month", 8), ut("M", tt), ut("MM", tt, Ke), ut("MMM", function (e, t) {
    return t.monthsShortRegex(e);
  }), ut("MMMM", function (e, t) {
    return t.monthsRegex(e);
  }), vt(["M", "MM"], function (e, t) {
    t[xt] = ke(e) - 1;
  }), vt(["MMM", "MMMM"], function (e, t, i, s) {
    var a = i._locale.monthsParse(e, s, i._strict);

    null != a ? t[xt] = a : ve(i).invalidMonth = e;
  });
  var Ft = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
      At = "January_February_March_April_May_June_July_August_September_October_November_December".split("_");
  var Nt = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_");

  function Ht(e, t) {
    var i;
    if (!e.isValid()) return e;
    if ("string" == typeof t) if (/^\d+$/.test(t)) t = ke(t);else if (!he(t = e.localeData().monthsParse(t))) return e;
    return i = Math.min(e.date(), It(e.year(), t)), e._d["set" + (e._isUTC ? "UTC" : "") + "Month"](t, i), e;
  }

  function Vt(e) {
    return null != e ? (Ht(this, e), oe.updateOffset(this, !0), this) : Lt(this, "Month");
  }

  var jt = ht;
  var Rt = ht;

  function Gt() {
    function e(e, t) {
      return t.length - e.length;
    }

    var t,
        i,
        s = [],
        a = [],
        n = [];

    for (t = 0; t < 12; t++) i = ge([2e3, t]), s.push(this.monthsShort(i, "")), a.push(this.months(i, "")), n.push(this.months(i, "")), n.push(this.monthsShort(i, ""));

    for (s.sort(e), a.sort(e), n.sort(e), t = 0; t < 12; t++) s[t] = ft(s[t]), a[t] = ft(a[t]);

    for (t = 0; t < 24; t++) n[t] = ft(n[t]);

    this._monthsRegex = new RegExp("^(" + n.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp("^(" + a.join("|") + ")", "i"), this._monthsShortStrictRegex = new RegExp("^(" + s.join("|") + ")", "i");
  }

  function Wt(e) {
    var t;

    if (e < 100 && e >= 0) {
      var i = Array.prototype.slice.call(arguments);
      i[0] = e + 400, t = new Date(Date.UTC.apply(null, i)), isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e);
    } else t = new Date(Date.UTC.apply(null, arguments));

    return t;
  }

  function Bt(e, t, i) {
    var s = 7 + t - i;
    return -((7 + Wt(e, 0, s).getUTCDay() - t) % 7) + s - 1;
  }

  function Ut(e, t, i, s, a) {
    var n,
        r,
        o = 1 + 7 * (t - 1) + (7 + i - s) % 7 + Bt(e, s, a);
    return o <= 0 ? r = Dt(n = e - 1) + o : o > Dt(e) ? (n = e + 1, r = o - Dt(e)) : (n = e, r = o), {
      year: n,
      dayOfYear: r
    };
  }

  function Xt(e, t, i) {
    var s,
        a,
        n = Bt(e.year(), t, i),
        r = Math.floor((e.dayOfYear() - n - 1) / 7) + 1;
    return r < 1 ? s = r + qt(a = e.year() - 1, t, i) : r > qt(e.year(), t, i) ? (s = r - qt(e.year(), t, i), a = e.year() + 1) : (a = e.year(), s = r), {
      week: s,
      year: a
    };
  }

  function qt(e, t, i) {
    var s = Bt(e, t, i),
        a = Bt(e + 1, t, i);
    return (Dt(e) - s + a) / 7;
  }

  Ue("w", ["ww", 2], "wo", "week"), Ue("W", ["WW", 2], "Wo", "isoWeek"), Fe("week", "w"), Fe("isoWeek", "W"), Ve("week", 5), Ve("isoWeek", 5), ut("w", tt), ut("ww", tt, Ke), ut("W", tt), ut("WW", tt, Ke), wt(["w", "ww", "W", "WW"], function (e, t, i, s) {
    t[s.substr(0, 1)] = ke(e);
  });

  function Zt(e, t) {
    return e.slice(t, 7).concat(e.slice(0, t));
  }

  Ue("d", 0, "do", "day"), Ue("dd", 0, 0, function (e) {
    return this.localeData().weekdaysMin(this, e);
  }), Ue("ddd", 0, 0, function (e) {
    return this.localeData().weekdaysShort(this, e);
  }), Ue("dddd", 0, 0, function (e) {
    return this.localeData().weekdays(this, e);
  }), Ue("e", 0, 0, "weekday"), Ue("E", 0, 0, "isoWeekday"), Fe("day", "d"), Fe("weekday", "e"), Fe("isoWeekday", "E"), Ve("day", 11), Ve("weekday", 11), Ve("isoWeekday", 11), ut("d", tt), ut("e", tt), ut("E", tt), ut("dd", function (e, t) {
    return t.weekdaysMinRegex(e);
  }), ut("ddd", function (e, t) {
    return t.weekdaysShortRegex(e);
  }), ut("dddd", function (e, t) {
    return t.weekdaysRegex(e);
  }), wt(["dd", "ddd", "dddd"], function (e, t, i, s) {
    var a = i._locale.weekdaysParse(e, s, i._strict);

    null != a ? t.d = a : ve(i).invalidWeekday = e;
  }), wt(["d", "e", "E"], function (e, t, i, s) {
    t[s] = ke(e);
  });
  var Kt = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_");
  var Jt = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_");
  var Qt = "Su_Mo_Tu_We_Th_Fr_Sa".split("_");
  var ei = ht;
  var ti = ht;
  var ii = ht;

  function si() {
    function e(e, t) {
      return t.length - e.length;
    }

    var t,
        i,
        s,
        a,
        n,
        r = [],
        o = [],
        l = [],
        d = [];

    for (t = 0; t < 7; t++) i = ge([2e3, 1]).day(t), s = this.weekdaysMin(i, ""), a = this.weekdaysShort(i, ""), n = this.weekdays(i, ""), r.push(s), o.push(a), l.push(n), d.push(s), d.push(a), d.push(n);

    for (r.sort(e), o.sort(e), l.sort(e), d.sort(e), t = 0; t < 7; t++) o[t] = ft(o[t]), l[t] = ft(l[t]), d[t] = ft(d[t]);

    this._weekdaysRegex = new RegExp("^(" + d.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp("^(" + l.join("|") + ")", "i"), this._weekdaysShortStrictRegex = new RegExp("^(" + o.join("|") + ")", "i"), this._weekdaysMinStrictRegex = new RegExp("^(" + r.join("|") + ")", "i");
  }

  function ai() {
    return this.hours() % 12 || 12;
  }

  function ni(e, t) {
    Ue(e, 0, 0, function () {
      return this.localeData().meridiem(this.hours(), this.minutes(), t);
    });
  }

  function ri(e, t) {
    return t._meridiemParse;
  }

  Ue("H", ["HH", 2], 0, "hour"), Ue("h", ["hh", 2], 0, ai), Ue("k", ["kk", 2], 0, function () {
    return this.hours() || 24;
  }), Ue("hmm", 0, 0, function () {
    return "" + ai.apply(this) + je(this.minutes(), 2);
  }), Ue("hmmss", 0, 0, function () {
    return "" + ai.apply(this) + je(this.minutes(), 2) + je(this.seconds(), 2);
  }), Ue("Hmm", 0, 0, function () {
    return "" + this.hours() + je(this.minutes(), 2);
  }), Ue("Hmmss", 0, 0, function () {
    return "" + this.hours() + je(this.minutes(), 2) + je(this.seconds(), 2);
  }), ni("a", !0), ni("A", !1), Fe("hour", "h"), Ve("hour", 13), ut("a", ri), ut("A", ri), ut("H", tt), ut("h", tt), ut("k", tt), ut("HH", tt, Ke), ut("hh", tt, Ke), ut("kk", tt, Ke), ut("hmm", it), ut("hmmss", st), ut("Hmm", it), ut("Hmmss", st), vt(["H", "HH"], St), vt(["k", "kk"], function (e, t, i) {
    var s = ke(e);
    t[St] = 24 === s ? 0 : s;
  }), vt(["a", "A"], function (e, t, i) {
    i._isPm = i._locale.isPM(e), i._meridiem = e;
  }), vt(["h", "hh"], function (e, t, i) {
    t[St] = ke(e), ve(i).bigHour = !0;
  }), vt("hmm", function (e, t, i) {
    var s = e.length - 2;
    t[St] = ke(e.substr(0, s)), t[Ct] = ke(e.substr(s)), ve(i).bigHour = !0;
  }), vt("hmmss", function (e, t, i) {
    var s = e.length - 4,
        a = e.length - 2;
    t[St] = ke(e.substr(0, s)), t[Ct] = ke(e.substr(s, 2)), t[Tt] = ke(e.substr(a)), ve(i).bigHour = !0;
  }), vt("Hmm", function (e, t, i) {
    var s = e.length - 2;
    t[St] = ke(e.substr(0, s)), t[Ct] = ke(e.substr(s));
  }), vt("Hmmss", function (e, t, i) {
    var s = e.length - 4,
        a = e.length - 2;
    t[St] = ke(e.substr(0, s)), t[Ct] = ke(e.substr(s, 2)), t[Tt] = ke(e.substr(a));
  });
  var oi,
      li = zt("Hours", !0),
      di = {
    calendar: {
      sameDay: "[Today at] LT",
      nextDay: "[Tomorrow at] LT",
      nextWeek: "dddd [at] LT",
      lastDay: "[Yesterday at] LT",
      lastWeek: "[Last] dddd [at] LT",
      sameElse: "L"
    },
    longDateFormat: {
      LTS: "h:mm:ss A",
      LT: "h:mm A",
      L: "MM/DD/YYYY",
      LL: "MMMM D, YYYY",
      LLL: "MMMM D, YYYY h:mm A",
      LLLL: "dddd, MMMM D, YYYY h:mm A"
    },
    invalidDate: "Invalid date",
    ordinal: "%d",
    dayOfMonthOrdinalParse: /\d{1,2}/,
    relativeTime: {
      future: "in %s",
      past: "%s ago",
      s: "a few seconds",
      ss: "%d seconds",
      m: "a minute",
      mm: "%d minutes",
      h: "an hour",
      hh: "%d hours",
      d: "a day",
      dd: "%d days",
      M: "a month",
      MM: "%d months",
      y: "a year",
      yy: "%d years"
    },
    months: At,
    monthsShort: Nt,
    week: {
      dow: 0,
      doy: 6
    },
    weekdays: Kt,
    weekdaysMin: Qt,
    weekdaysShort: Jt,
    meridiemParse: /[ap]\.?m?\.?/i
  },
      ci = {},
      hi = {};

  function pi(e) {
    return e ? e.toLowerCase().replace("_", "-") : e;
  }

  function ui(e) {
    var t = null;
    if (!ci[e] && "undefined" != typeof module && module && module.exports) try {
      t = oi._abbr, require("./locale/" + e), mi(t);
    } catch (e) {}
    return ci[e];
  }

  function mi(e, t) {
    var i;
    return e && ((i = ce(t) ? gi(e) : fi(e, t)) ? oi = i : "undefined" != typeof console && console.warn && console.warn("Locale " + e + " not found. Did you forget to load it?")), oi._abbr;
  }

  function fi(e, t) {
    if (null !== t) {
      var i,
          s = di;
      if (t.abbr = e, null != ci[e]) Oe("defineLocaleOverride", "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."), s = ci[e]._config;else if (null != t.parentLocale) if (null != ci[t.parentLocale]) s = ci[t.parentLocale]._config;else {
        if (null == (i = ui(t.parentLocale))) return hi[t.parentLocale] || (hi[t.parentLocale] = []), hi[t.parentLocale].push({
          name: e,
          config: t
        }), null;
        s = i._config;
      }
      return ci[e] = new Ye(Le(s, t)), hi[e] && hi[e].forEach(function (e) {
        fi(e.name, e.config);
      }), mi(e), ci[e];
    }

    return delete ci[e], null;
  }

  function gi(e) {
    var t;
    if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e) return oi;

    if (!le(e)) {
      if (t = ui(e)) return t;
      e = [e];
    }

    return function (e) {
      for (var t, i, s, a, n = 0; n < e.length;) {
        for (t = (a = pi(e[n]).split("-")).length, i = (i = pi(e[n + 1])) ? i.split("-") : null; t > 0;) {
          if (s = ui(a.slice(0, t).join("-"))) return s;
          if (i && i.length >= t && Ee(a, i, !0) >= t - 1) break;
          t--;
        }

        n++;
      }

      return oi;
    }(e);
  }

  function vi(e) {
    var t,
        i = e._a;
    return i && -2 === ve(e).overflow && (t = i[xt] < 0 || i[xt] > 11 ? xt : i[_t] < 1 || i[_t] > It(i[yt], i[xt]) ? _t : i[St] < 0 || i[St] > 24 || 24 === i[St] && (0 !== i[Ct] || 0 !== i[Tt] || 0 !== i[kt]) ? St : i[Ct] < 0 || i[Ct] > 59 ? Ct : i[Tt] < 0 || i[Tt] > 59 ? Tt : i[kt] < 0 || i[kt] > 999 ? kt : -1, ve(e)._overflowDayOfYear && (t < yt || t > _t) && (t = _t), ve(e)._overflowWeeks && -1 === t && (t = Et), ve(e)._overflowWeekday && -1 === t && (t = Mt), ve(e).overflow = t), e;
  }

  function wi(e, t, i) {
    return null != e ? e : null != t ? t : i;
  }

  function bi(e) {
    var t,
        i,
        s,
        a,
        n,
        r = [];

    if (!e._d) {
      for (s = function (e) {
        var t = new Date(oe.now());
        return e._useUTC ? [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()] : [t.getFullYear(), t.getMonth(), t.getDate()];
      }(e), e._w && null == e._a[_t] && null == e._a[xt] && function (e) {
        var t, i, s, a, n, r, o, l;
        if (null != (t = e._w).GG || null != t.W || null != t.E) n = 1, r = 4, i = wi(t.GG, e._a[yt], Xt(Li(), 1, 4).year), s = wi(t.W, 1), ((a = wi(t.E, 1)) < 1 || a > 7) && (l = !0);else {
          n = e._locale._week.dow, r = e._locale._week.doy;
          var d = Xt(Li(), n, r);
          i = wi(t.gg, e._a[yt], d.year), s = wi(t.w, d.week), null != t.d ? ((a = t.d) < 0 || a > 6) && (l = !0) : null != t.e ? (a = t.e + n, (t.e < 0 || t.e > 6) && (l = !0)) : a = n;
        }
        s < 1 || s > qt(i, n, r) ? ve(e)._overflowWeeks = !0 : null != l ? ve(e)._overflowWeekday = !0 : (o = Ut(i, s, a, n, r), e._a[yt] = o.year, e._dayOfYear = o.dayOfYear);
      }(e), null != e._dayOfYear && (n = wi(e._a[yt], s[yt]), (e._dayOfYear > Dt(n) || 0 === e._dayOfYear) && (ve(e)._overflowDayOfYear = !0), i = Wt(n, 0, e._dayOfYear), e._a[xt] = i.getUTCMonth(), e._a[_t] = i.getUTCDate()), t = 0; t < 3 && null == e._a[t]; ++t) e._a[t] = r[t] = s[t];

      for (; t < 7; t++) e._a[t] = r[t] = null == e._a[t] ? 2 === t ? 1 : 0 : e._a[t];

      24 === e._a[St] && 0 === e._a[Ct] && 0 === e._a[Tt] && 0 === e._a[kt] && (e._nextDay = !0, e._a[St] = 0), e._d = (e._useUTC ? Wt : function (e, t, i, s, a, n, r) {
        var o;
        return e < 100 && e >= 0 ? (o = new Date(e + 400, t, i, s, a, n, r), isFinite(o.getFullYear()) && o.setFullYear(e)) : o = new Date(e, t, i, s, a, n, r), o;
      }).apply(null, r), a = e._useUTC ? e._d.getUTCDay() : e._d.getDay(), null != e._tzm && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), e._nextDay && (e._a[St] = 24), e._w && void 0 !== e._w.d && e._w.d !== a && (ve(e).weekdayMismatch = !0);
    }
  }

  var yi = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
      xi = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
      _i = /Z|[+-]\d\d(?::?\d\d)?/,
      Si = [["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/], ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/], ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/], ["GGGG-[W]WW", /\d{4}-W\d\d/, !1], ["YYYY-DDD", /\d{4}-\d{3}/], ["YYYY-MM", /\d{4}-\d\d/, !1], ["YYYYYYMMDD", /[+-]\d{10}/], ["YYYYMMDD", /\d{8}/], ["GGGG[W]WWE", /\d{4}W\d{3}/], ["GGGG[W]WW", /\d{4}W\d{2}/, !1], ["YYYYDDD", /\d{7}/]],
      Ci = [["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/], ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/], ["HH:mm:ss", /\d\d:\d\d:\d\d/], ["HH:mm", /\d\d:\d\d/], ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/], ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/], ["HHmmss", /\d\d\d\d\d\d/], ["HHmm", /\d\d\d\d/], ["HH", /\d\d/]],
      Ti = /^\/?Date\((\-?\d+)/i;

  function ki(e) {
    var t,
        i,
        s,
        a,
        n,
        r,
        o = e._i,
        l = yi.exec(o) || xi.exec(o);

    if (l) {
      for (ve(e).iso = !0, t = 0, i = Si.length; t < i; t++) if (Si[t][1].exec(l[1])) {
        a = Si[t][0], s = !1 !== Si[t][2];
        break;
      }

      if (null == a) return void (e._isValid = !1);

      if (l[3]) {
        for (t = 0, i = Ci.length; t < i; t++) if (Ci[t][1].exec(l[3])) {
          n = (l[2] || " ") + Ci[t][0];
          break;
        }

        if (null == n) return void (e._isValid = !1);
      }

      if (!s && null != n) return void (e._isValid = !1);

      if (l[4]) {
        if (!_i.exec(l[4])) return void (e._isValid = !1);
        r = "Z";
      }

      e._f = a + (n || "") + (r || ""), Pi(e);
    } else e._isValid = !1;
  }

  var Ei = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

  function Mi(e) {
    var t = parseInt(e, 10);
    return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
  }

  var Di = {
    UT: 0,
    GMT: 0,
    EDT: -240,
    EST: -300,
    CDT: -300,
    CST: -360,
    MDT: -360,
    MST: -420,
    PDT: -420,
    PST: -480
  };

  function $i(e) {
    var t,
        i,
        s,
        a,
        n,
        r,
        o,
        l = Ei.exec(e._i.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, ""));

    if (l) {
      var d = (t = l[4], i = l[3], s = l[2], a = l[5], n = l[6], r = l[7], o = [Mi(t), Nt.indexOf(i), parseInt(s, 10), parseInt(a, 10), parseInt(n, 10)], r && o.push(parseInt(r, 10)), o);
      if (!function (e, t, i) {
        return !e || Jt.indexOf(e) === new Date(t[0], t[1], t[2]).getDay() || (ve(i).weekdayMismatch = !0, i._isValid = !1, !1);
      }(l[1], d, e)) return;
      e._a = d, e._tzm = function (e, t, i) {
        if (e) return Di[e];
        if (t) return 0;
        var s = parseInt(i, 10),
            a = s % 100;
        return (s - a) / 100 * 60 + a;
      }(l[8], l[9], l[10]), e._d = Wt.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), ve(e).rfc2822 = !0;
    } else e._isValid = !1;
  }

  function Pi(e) {
    if (e._f !== oe.ISO_8601) {
      if (e._f !== oe.RFC_2822) {
        e._a = [], ve(e).empty = !0;
        var t,
            i,
            s,
            a,
            n,
            r = "" + e._i,
            o = r.length,
            l = 0;

        for (s = qe(e._f, e._locale).match(Re) || [], t = 0; t < s.length; t++) a = s[t], (i = (r.match(mt(a, e)) || [])[0]) && ((n = r.substr(0, r.indexOf(i))).length > 0 && ve(e).unusedInput.push(n), r = r.slice(r.indexOf(i) + i.length), l += i.length), Be[a] ? (i ? ve(e).empty = !1 : ve(e).unusedTokens.push(a), bt(a, i, e)) : e._strict && !i && ve(e).unusedTokens.push(a);

        ve(e).charsLeftOver = o - l, r.length > 0 && ve(e).unusedInput.push(r), e._a[St] <= 12 && !0 === ve(e).bigHour && e._a[St] > 0 && (ve(e).bigHour = void 0), ve(e).parsedDateParts = e._a.slice(0), ve(e).meridiem = e._meridiem, e._a[St] = function (e, t, i) {
          var s;
          if (null == i) return t;
          return null != e.meridiemHour ? e.meridiemHour(t, i) : null != e.isPM ? ((s = e.isPM(i)) && t < 12 && (t += 12), s || 12 !== t || (t = 0), t) : t;
        }(e._locale, e._a[St], e._meridiem), bi(e), vi(e);
      } else $i(e);
    } else ki(e);
  }

  function Oi(e) {
    var t = e._i,
        i = e._f;
    return e._locale = e._locale || gi(e._l), null === t || void 0 === i && "" === t ? be({
      nullInput: !0
    }) : ("string" == typeof t && (e._i = t = e._locale.preparse(t)), Ce(t) ? new Se(vi(t)) : (pe(t) ? e._d = t : le(i) ? function (e) {
      var t, i, s, a, n;
      if (0 === e._f.length) return ve(e).invalidFormat = !0, void (e._d = new Date(NaN));

      for (a = 0; a < e._f.length; a++) n = 0, t = xe({}, e), null != e._useUTC && (t._useUTC = e._useUTC), t._f = e._f[a], Pi(t), we(t) && (n += ve(t).charsLeftOver, n += 10 * ve(t).unusedTokens.length, ve(t).score = n, (null == s || n < s) && (s = n, i = t));

      fe(e, i || t);
    }(e) : i ? Pi(e) : function (e) {
      var t = e._i;
      ce(t) ? e._d = new Date(oe.now()) : pe(t) ? e._d = new Date(t.valueOf()) : "string" == typeof t ? function (e) {
        var t = Ti.exec(e._i);
        null === t ? (ki(e), !1 === e._isValid && (delete e._isValid, $i(e), !1 === e._isValid && (delete e._isValid, oe.createFromInputFallback(e)))) : e._d = new Date(+t[1]);
      }(e) : le(t) ? (e._a = ue(t.slice(0), function (e) {
        return parseInt(e, 10);
      }), bi(e)) : de(t) ? function (e) {
        if (!e._d) {
          var t = Ne(e._i);
          e._a = ue([t.year, t.month, t.day || t.date, t.hour, t.minute, t.second, t.millisecond], function (e) {
            return e && parseInt(e, 10);
          }), bi(e);
        }
      }(e) : he(t) ? e._d = new Date(t) : oe.createFromInputFallback(e);
    }(e), we(e) || (e._d = null), e));
  }

  function zi(e, t, i, s, a) {
    var n,
        r = {};
    return !0 !== i && !1 !== i || (s = i, i = void 0), (de(e) && function (e) {
      if (Object.getOwnPropertyNames) return 0 === Object.getOwnPropertyNames(e).length;
      var t;

      for (t in e) if (e.hasOwnProperty(t)) return !1;

      return !0;
    }(e) || le(e) && 0 === e.length) && (e = void 0), r._isAMomentObject = !0, r._useUTC = r._isUTC = a, r._l = i, r._i = e, r._f = t, r._strict = s, (n = new Se(vi(Oi(r))))._nextDay && (n.add(1, "d"), n._nextDay = void 0), n;
  }

  function Li(e, t, i, s) {
    return zi(e, t, i, s, !1);
  }

  oe.createFromInputFallback = De("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.", function (e) {
    e._d = new Date(e._i + (e._useUTC ? " UTC" : ""));
  }), oe.ISO_8601 = function () {}, oe.RFC_2822 = function () {};
  var Yi = De("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
    var e = Li.apply(null, arguments);
    return this.isValid() && e.isValid() ? e < this ? this : e : be();
  }),
      Ii = De("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/", function () {
    var e = Li.apply(null, arguments);
    return this.isValid() && e.isValid() ? e > this ? this : e : be();
  });

  function Fi(e, t) {
    var i, s;
    if (1 === t.length && le(t[0]) && (t = t[0]), !t.length) return Li();

    for (i = t[0], s = 1; s < t.length; ++s) t[s].isValid() && !t[s][e](i) || (i = t[s]);

    return i;
  }

  var Ai = ["year", "quarter", "month", "week", "day", "hour", "minute", "second", "millisecond"];

  function Ni(e) {
    var t = Ne(e),
        i = t.year || 0,
        s = t.quarter || 0,
        a = t.month || 0,
        n = t.week || t.isoWeek || 0,
        r = t.day || 0,
        o = t.hour || 0,
        l = t.minute || 0,
        d = t.second || 0,
        c = t.millisecond || 0;
    this._isValid = function (e) {
      for (var t in e) if (-1 === Pt.call(Ai, t) || null != e[t] && isNaN(e[t])) return !1;

      for (var i = !1, s = 0; s < Ai.length; ++s) if (e[Ai[s]]) {
        if (i) return !1;
        parseFloat(e[Ai[s]]) !== ke(e[Ai[s]]) && (i = !0);
      }

      return !0;
    }(t), this._milliseconds = +c + 1e3 * d + 6e4 * l + 1e3 * o * 60 * 60, this._days = +r + 7 * n, this._months = +a + 3 * s + 12 * i, this._data = {}, this._locale = gi(), this._bubble();
  }

  function Hi(e) {
    return e instanceof Ni;
  }

  function Vi(e) {
    return e < 0 ? -1 * Math.round(-1 * e) : Math.round(e);
  }

  function ji(e, t) {
    Ue(e, 0, 0, function () {
      var e = this.utcOffset(),
          i = "+";
      return e < 0 && (e = -e, i = "-"), i + je(~~(e / 60), 2) + t + je(~~e % 60, 2);
    });
  }

  ji("Z", ":"), ji("ZZ", ""), ut("Z", ct), ut("ZZ", ct), vt(["Z", "ZZ"], function (e, t, i) {
    i._useUTC = !0, i._tzm = Gi(ct, e);
  });
  var Ri = /([\+\-]|\d\d)/gi;

  function Gi(e, t) {
    var i = (t || "").match(e);
    if (null === i) return null;
    var s = ((i[i.length - 1] || []) + "").match(Ri) || ["-", 0, 0],
        a = 60 * s[1] + ke(s[2]);
    return 0 === a ? 0 : "+" === s[0] ? a : -a;
  }

  function Wi(e, t) {
    var i, s;
    return t._isUTC ? (i = t.clone(), s = (Ce(e) || pe(e) ? e.valueOf() : Li(e).valueOf()) - i.valueOf(), i._d.setTime(i._d.valueOf() + s), oe.updateOffset(i, !1), i) : Li(e).local();
  }

  function Bi(e) {
    return 15 * -Math.round(e._d.getTimezoneOffset() / 15);
  }

  function Ui() {
    return !!this.isValid() && this._isUTC && 0 === this._offset;
  }

  oe.updateOffset = function () {};

  var Xi = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,
      qi = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

  function Zi(e, t) {
    var i,
        s,
        a,
        n = e,
        r = null;
    return Hi(e) ? n = {
      ms: e._milliseconds,
      d: e._days,
      M: e._months
    } : he(e) ? (n = {}, t ? n[t] = e : n.milliseconds = e) : (r = Xi.exec(e)) ? (i = "-" === r[1] ? -1 : 1, n = {
      y: 0,
      d: ke(r[_t]) * i,
      h: ke(r[St]) * i,
      m: ke(r[Ct]) * i,
      s: ke(r[Tt]) * i,
      ms: ke(Vi(1e3 * r[kt])) * i
    }) : (r = qi.exec(e)) ? (i = "-" === r[1] ? -1 : 1, n = {
      y: Ki(r[2], i),
      M: Ki(r[3], i),
      w: Ki(r[4], i),
      d: Ki(r[5], i),
      h: Ki(r[6], i),
      m: Ki(r[7], i),
      s: Ki(r[8], i)
    }) : null == n ? n = {} : "object" == typeof n && ("from" in n || "to" in n) && (a = function (e, t) {
      var i;
      if (!e.isValid() || !t.isValid()) return {
        milliseconds: 0,
        months: 0
      };
      t = Wi(t, e), e.isBefore(t) ? i = Ji(e, t) : ((i = Ji(t, e)).milliseconds = -i.milliseconds, i.months = -i.months);
      return i;
    }(Li(n.from), Li(n.to)), (n = {}).ms = a.milliseconds, n.M = a.months), s = new Ni(n), Hi(e) && me(e, "_locale") && (s._locale = e._locale), s;
  }

  function Ki(e, t) {
    var i = e && parseFloat(e.replace(",", "."));
    return (isNaN(i) ? 0 : i) * t;
  }

  function Ji(e, t) {
    var i = {};
    return i.months = t.month() - e.month() + 12 * (t.year() - e.year()), e.clone().add(i.months, "M").isAfter(t) && --i.months, i.milliseconds = +t - +e.clone().add(i.months, "M"), i;
  }

  function Qi(e, t) {
    return function (i, s) {
      var a;
      return null === s || isNaN(+s) || (Oe(t, "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."), a = i, i = s, s = a), es(this, Zi(i = "string" == typeof i ? +i : i, s), e), this;
    };
  }

  function es(e, t, i, s) {
    var a = t._milliseconds,
        n = Vi(t._days),
        r = Vi(t._months);
    e.isValid() && (s = null == s || s, r && Ht(e, Lt(e, "Month") + r * i), n && Yt(e, "Date", Lt(e, "Date") + n * i), a && e._d.setTime(e._d.valueOf() + a * i), s && oe.updateOffset(e, n || r));
  }

  Zi.fn = Ni.prototype, Zi.invalid = function () {
    return Zi(NaN);
  };
  var ts = Qi(1, "add"),
      is = Qi(-1, "subtract");

  function ss(e, t) {
    var i = 12 * (t.year() - e.year()) + (t.month() - e.month()),
        s = e.clone().add(i, "months");
    return -(i + (t - s < 0 ? (t - s) / (s - e.clone().add(i - 1, "months")) : (t - s) / (e.clone().add(i + 1, "months") - s))) || 0;
  }

  function as(e) {
    var t;
    return void 0 === e ? this._locale._abbr : (null != (t = gi(e)) && (this._locale = t), this);
  }

  oe.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ", oe.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
  var ns = De("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.", function (e) {
    return void 0 === e ? this.localeData() : this.locale(e);
  });

  function rs() {
    return this._locale;
  }

  var os = 1e3,
      ls = 60 * os,
      ds = 60 * ls,
      cs = 3506328 * ds;

  function hs(e, t) {
    return (e % t + t) % t;
  }

  function ps(e, t, i) {
    return e < 100 && e >= 0 ? new Date(e + 400, t, i) - cs : new Date(e, t, i).valueOf();
  }

  function us(e, t, i) {
    return e < 100 && e >= 0 ? Date.UTC(e + 400, t, i) - cs : Date.UTC(e, t, i);
  }

  function ms(e, t) {
    Ue(0, [e, e.length], 0, t);
  }

  function fs(e, t, i, s, a) {
    var n;
    return null == e ? Xt(this, s, a).year : (t > (n = qt(e, s, a)) && (t = n), function (e, t, i, s, a) {
      var n = Ut(e, t, i, s, a),
          r = Wt(n.year, 0, n.dayOfYear);
      return this.year(r.getUTCFullYear()), this.month(r.getUTCMonth()), this.date(r.getUTCDate()), this;
    }.call(this, e, t, i, s, a));
  }

  Ue(0, ["gg", 2], 0, function () {
    return this.weekYear() % 100;
  }), Ue(0, ["GG", 2], 0, function () {
    return this.isoWeekYear() % 100;
  }), ms("gggg", "weekYear"), ms("ggggg", "weekYear"), ms("GGGG", "isoWeekYear"), ms("GGGGG", "isoWeekYear"), Fe("weekYear", "gg"), Fe("isoWeekYear", "GG"), Ve("weekYear", 1), Ve("isoWeekYear", 1), ut("G", lt), ut("g", lt), ut("GG", tt, Ke), ut("gg", tt, Ke), ut("GGGG", nt, Qe), ut("gggg", nt, Qe), ut("GGGGG", rt, et), ut("ggggg", rt, et), wt(["gggg", "ggggg", "GGGG", "GGGGG"], function (e, t, i, s) {
    t[s.substr(0, 2)] = ke(e);
  }), wt(["gg", "GG"], function (e, t, i, s) {
    t[s] = oe.parseTwoDigitYear(e);
  }), Ue("Q", 0, "Qo", "quarter"), Fe("quarter", "Q"), Ve("quarter", 7), ut("Q", Ze), vt("Q", function (e, t) {
    t[xt] = 3 * (ke(e) - 1);
  }), Ue("D", ["DD", 2], "Do", "date"), Fe("date", "D"), Ve("date", 9), ut("D", tt), ut("DD", tt, Ke), ut("Do", function (e, t) {
    return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient;
  }), vt(["D", "DD"], _t), vt("Do", function (e, t) {
    t[_t] = ke(e.match(tt)[0]);
  });
  var gs = zt("Date", !0);
  Ue("DDD", ["DDDD", 3], "DDDo", "dayOfYear"), Fe("dayOfYear", "DDD"), Ve("dayOfYear", 4), ut("DDD", at), ut("DDDD", Je), vt(["DDD", "DDDD"], function (e, t, i) {
    i._dayOfYear = ke(e);
  }), Ue("m", ["mm", 2], 0, "minute"), Fe("minute", "m"), Ve("minute", 14), ut("m", tt), ut("mm", tt, Ke), vt(["m", "mm"], Ct);
  var vs = zt("Minutes", !1);
  Ue("s", ["ss", 2], 0, "second"), Fe("second", "s"), Ve("second", 15), ut("s", tt), ut("ss", tt, Ke), vt(["s", "ss"], Tt);
  var ws,
      bs = zt("Seconds", !1);

  for (Ue("S", 0, 0, function () {
    return ~~(this.millisecond() / 100);
  }), Ue(0, ["SS", 2], 0, function () {
    return ~~(this.millisecond() / 10);
  }), Ue(0, ["SSS", 3], 0, "millisecond"), Ue(0, ["SSSS", 4], 0, function () {
    return 10 * this.millisecond();
  }), Ue(0, ["SSSSS", 5], 0, function () {
    return 100 * this.millisecond();
  }), Ue(0, ["SSSSSS", 6], 0, function () {
    return 1e3 * this.millisecond();
  }), Ue(0, ["SSSSSSS", 7], 0, function () {
    return 1e4 * this.millisecond();
  }), Ue(0, ["SSSSSSSS", 8], 0, function () {
    return 1e5 * this.millisecond();
  }), Ue(0, ["SSSSSSSSS", 9], 0, function () {
    return 1e6 * this.millisecond();
  }), Fe("millisecond", "ms"), Ve("millisecond", 16), ut("S", at, Ze), ut("SS", at, Ke), ut("SSS", at, Je), ws = "SSSS"; ws.length <= 9; ws += "S") ut(ws, ot);

  function ys(e, t) {
    t[kt] = ke(1e3 * ("0." + e));
  }

  for (ws = "S"; ws.length <= 9; ws += "S") vt(ws, ys);

  var xs = zt("Milliseconds", !1);
  Ue("z", 0, 0, "zoneAbbr"), Ue("zz", 0, 0, "zoneName");
  var _s = Se.prototype;

  function Ss(e) {
    return e;
  }

  _s.add = ts, _s.calendar = function (e, t) {
    var i = e || Li(),
        s = Wi(i, this).startOf("day"),
        a = oe.calendarFormat(this, s) || "sameElse",
        n = t && (ze(t[a]) ? t[a].call(this, i) : t[a]);
    return this.format(n || this.localeData().calendar(a, this, Li(i)));
  }, _s.clone = function () {
    return new Se(this);
  }, _s.diff = function (e, t, i) {
    var s, a, n;
    if (!this.isValid()) return NaN;
    if (!(s = Wi(e, this)).isValid()) return NaN;

    switch (a = 6e4 * (s.utcOffset() - this.utcOffset()), t = Ae(t)) {
      case "year":
        n = ss(this, s) / 12;
        break;

      case "month":
        n = ss(this, s);
        break;

      case "quarter":
        n = ss(this, s) / 3;
        break;

      case "second":
        n = (this - s) / 1e3;
        break;

      case "minute":
        n = (this - s) / 6e4;
        break;

      case "hour":
        n = (this - s) / 36e5;
        break;

      case "day":
        n = (this - s - a) / 864e5;
        break;

      case "week":
        n = (this - s - a) / 6048e5;
        break;

      default:
        n = this - s;
    }

    return i ? n : Te(n);
  }, _s.endOf = function (e) {
    var t;
    if (void 0 === (e = Ae(e)) || "millisecond" === e || !this.isValid()) return this;
    var i = this._isUTC ? us : ps;

    switch (e) {
      case "year":
        t = i(this.year() + 1, 0, 1) - 1;
        break;

      case "quarter":
        t = i(this.year(), this.month() - this.month() % 3 + 3, 1) - 1;
        break;

      case "month":
        t = i(this.year(), this.month() + 1, 1) - 1;
        break;

      case "week":
        t = i(this.year(), this.month(), this.date() - this.weekday() + 7) - 1;
        break;

      case "isoWeek":
        t = i(this.year(), this.month(), this.date() - (this.isoWeekday() - 1) + 7) - 1;
        break;

      case "day":
      case "date":
        t = i(this.year(), this.month(), this.date() + 1) - 1;
        break;

      case "hour":
        t = this._d.valueOf(), t += ds - hs(t + (this._isUTC ? 0 : this.utcOffset() * ls), ds) - 1;
        break;

      case "minute":
        t = this._d.valueOf(), t += ls - hs(t, ls) - 1;
        break;

      case "second":
        t = this._d.valueOf(), t += os - hs(t, os) - 1;
    }

    return this._d.setTime(t), oe.updateOffset(this, !0), this;
  }, _s.format = function (e) {
    e || (e = this.isUtc() ? oe.defaultFormatUtc : oe.defaultFormat);
    var t = Xe(this, e);
    return this.localeData().postformat(t);
  }, _s.from = function (e, t) {
    return this.isValid() && (Ce(e) && e.isValid() || Li(e).isValid()) ? Zi({
      to: this,
      from: e
    }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
  }, _s.fromNow = function (e) {
    return this.from(Li(), e);
  }, _s.to = function (e, t) {
    return this.isValid() && (Ce(e) && e.isValid() || Li(e).isValid()) ? Zi({
      from: this,
      to: e
    }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
  }, _s.toNow = function (e) {
    return this.to(Li(), e);
  }, _s.get = function (e) {
    return ze(this[e = Ae(e)]) ? this[e]() : this;
  }, _s.invalidAt = function () {
    return ve(this).overflow;
  }, _s.isAfter = function (e, t) {
    var i = Ce(e) ? e : Li(e);
    return !(!this.isValid() || !i.isValid()) && ("millisecond" === (t = Ae(t) || "millisecond") ? this.valueOf() > i.valueOf() : i.valueOf() < this.clone().startOf(t).valueOf());
  }, _s.isBefore = function (e, t) {
    var i = Ce(e) ? e : Li(e);
    return !(!this.isValid() || !i.isValid()) && ("millisecond" === (t = Ae(t) || "millisecond") ? this.valueOf() < i.valueOf() : this.clone().endOf(t).valueOf() < i.valueOf());
  }, _s.isBetween = function (e, t, i, s) {
    var a = Ce(e) ? e : Li(e),
        n = Ce(t) ? t : Li(t);
    return !!(this.isValid() && a.isValid() && n.isValid()) && ("(" === (s = s || "()")[0] ? this.isAfter(a, i) : !this.isBefore(a, i)) && (")" === s[1] ? this.isBefore(n, i) : !this.isAfter(n, i));
  }, _s.isSame = function (e, t) {
    var i,
        s = Ce(e) ? e : Li(e);
    return !(!this.isValid() || !s.isValid()) && ("millisecond" === (t = Ae(t) || "millisecond") ? this.valueOf() === s.valueOf() : (i = s.valueOf(), this.clone().startOf(t).valueOf() <= i && i <= this.clone().endOf(t).valueOf()));
  }, _s.isSameOrAfter = function (e, t) {
    return this.isSame(e, t) || this.isAfter(e, t);
  }, _s.isSameOrBefore = function (e, t) {
    return this.isSame(e, t) || this.isBefore(e, t);
  }, _s.isValid = function () {
    return we(this);
  }, _s.lang = ns, _s.locale = as, _s.localeData = rs, _s.max = Ii, _s.min = Yi, _s.parsingFlags = function () {
    return fe({}, ve(this));
  }, _s.set = function (e, t) {
    if ("object" == typeof e) for (var i = function (e) {
      var t = [];

      for (var i in e) t.push({
        unit: i,
        priority: He[i]
      });

      return t.sort(function (e, t) {
        return e.priority - t.priority;
      }), t;
    }(e = Ne(e)), s = 0; s < i.length; s++) this[i[s].unit](e[i[s].unit]);else if (ze(this[e = Ae(e)])) return this[e](t);
    return this;
  }, _s.startOf = function (e) {
    var t;
    if (void 0 === (e = Ae(e)) || "millisecond" === e || !this.isValid()) return this;
    var i = this._isUTC ? us : ps;

    switch (e) {
      case "year":
        t = i(this.year(), 0, 1);
        break;

      case "quarter":
        t = i(this.year(), this.month() - this.month() % 3, 1);
        break;

      case "month":
        t = i(this.year(), this.month(), 1);
        break;

      case "week":
        t = i(this.year(), this.month(), this.date() - this.weekday());
        break;

      case "isoWeek":
        t = i(this.year(), this.month(), this.date() - (this.isoWeekday() - 1));
        break;

      case "day":
      case "date":
        t = i(this.year(), this.month(), this.date());
        break;

      case "hour":
        t = this._d.valueOf(), t -= hs(t + (this._isUTC ? 0 : this.utcOffset() * ls), ds);
        break;

      case "minute":
        t = this._d.valueOf(), t -= hs(t, ls);
        break;

      case "second":
        t = this._d.valueOf(), t -= hs(t, os);
    }

    return this._d.setTime(t), oe.updateOffset(this, !0), this;
  }, _s.subtract = is, _s.toArray = function () {
    var e = this;
    return [e.year(), e.month(), e.date(), e.hour(), e.minute(), e.second(), e.millisecond()];
  }, _s.toObject = function () {
    var e = this;
    return {
      years: e.year(),
      months: e.month(),
      date: e.date(),
      hours: e.hours(),
      minutes: e.minutes(),
      seconds: e.seconds(),
      milliseconds: e.milliseconds()
    };
  }, _s.toDate = function () {
    return new Date(this.valueOf());
  }, _s.toISOString = function (e) {
    if (!this.isValid()) return null;
    var t = !0 !== e,
        i = t ? this.clone().utc() : this;
    return i.year() < 0 || i.year() > 9999 ? Xe(i, t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ") : ze(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this.valueOf() + 60 * this.utcOffset() * 1e3).toISOString().replace("Z", Xe(i, "Z")) : Xe(i, t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ");
  }, _s.inspect = function () {
    if (!this.isValid()) return "moment.invalid(/* " + this._i + " */)";
    var e = "moment",
        t = "";
    this.isLocal() || (e = 0 === this.utcOffset() ? "moment.utc" : "moment.parseZone", t = "Z");
    var i = "[" + e + '("]',
        s = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY",
        a = t + '[")]';
    return this.format(i + s + "-MM-DD[T]HH:mm:ss.SSS" + a);
  }, _s.toJSON = function () {
    return this.isValid() ? this.toISOString() : null;
  }, _s.toString = function () {
    return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
  }, _s.unix = function () {
    return Math.floor(this.valueOf() / 1e3);
  }, _s.valueOf = function () {
    return this._d.valueOf() - 6e4 * (this._offset || 0);
  }, _s.creationData = function () {
    return {
      input: this._i,
      format: this._f,
      locale: this._locale,
      isUTC: this._isUTC,
      strict: this._strict
    };
  }, _s.year = Ot, _s.isLeapYear = function () {
    return $t(this.year());
  }, _s.weekYear = function (e) {
    return fs.call(this, e, this.week(), this.weekday(), this.localeData()._week.dow, this.localeData()._week.doy);
  }, _s.isoWeekYear = function (e) {
    return fs.call(this, e, this.isoWeek(), this.isoWeekday(), 1, 4);
  }, _s.quarter = _s.quarters = function (e) {
    return null == e ? Math.ceil((this.month() + 1) / 3) : this.month(3 * (e - 1) + this.month() % 3);
  }, _s.month = Vt, _s.daysInMonth = function () {
    return It(this.year(), this.month());
  }, _s.week = _s.weeks = function (e) {
    var t = this.localeData().week(this);
    return null == e ? t : this.add(7 * (e - t), "d");
  }, _s.isoWeek = _s.isoWeeks = function (e) {
    var t = Xt(this, 1, 4).week;
    return null == e ? t : this.add(7 * (e - t), "d");
  }, _s.weeksInYear = function () {
    var e = this.localeData()._week;

    return qt(this.year(), e.dow, e.doy);
  }, _s.isoWeeksInYear = function () {
    return qt(this.year(), 1, 4);
  }, _s.date = gs, _s.day = _s.days = function (e) {
    if (!this.isValid()) return null != e ? this : NaN;
    var t = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
    return null != e ? (e = function (e, t) {
      return "string" != typeof e ? e : isNaN(e) ? "number" == typeof (e = t.weekdaysParse(e)) ? e : null : parseInt(e, 10);
    }(e, this.localeData()), this.add(e - t, "d")) : t;
  }, _s.weekday = function (e) {
    if (!this.isValid()) return null != e ? this : NaN;
    var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
    return null == e ? t : this.add(e - t, "d");
  }, _s.isoWeekday = function (e) {
    if (!this.isValid()) return null != e ? this : NaN;

    if (null != e) {
      var t = function (e, t) {
        return "string" == typeof e ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e;
      }(e, this.localeData());

      return this.day(this.day() % 7 ? t : t - 7);
    }

    return this.day() || 7;
  }, _s.dayOfYear = function (e) {
    var t = Math.round((this.clone().startOf("day") - this.clone().startOf("year")) / 864e5) + 1;
    return null == e ? t : this.add(e - t, "d");
  }, _s.hour = _s.hours = li, _s.minute = _s.minutes = vs, _s.second = _s.seconds = bs, _s.millisecond = _s.milliseconds = xs, _s.utcOffset = function (e, t, i) {
    var s,
        a = this._offset || 0;
    if (!this.isValid()) return null != e ? this : NaN;

    if (null != e) {
      if ("string" == typeof e) {
        if (null === (e = Gi(ct, e))) return this;
      } else Math.abs(e) < 16 && !i && (e *= 60);

      return !this._isUTC && t && (s = Bi(this)), this._offset = e, this._isUTC = !0, null != s && this.add(s, "m"), a !== e && (!t || this._changeInProgress ? es(this, Zi(e - a, "m"), 1, !1) : this._changeInProgress || (this._changeInProgress = !0, oe.updateOffset(this, !0), this._changeInProgress = null)), this;
    }

    return this._isUTC ? a : Bi(this);
  }, _s.utc = function (e) {
    return this.utcOffset(0, e);
  }, _s.local = function (e) {
    return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract(Bi(this), "m")), this;
  }, _s.parseZone = function () {
    if (null != this._tzm) this.utcOffset(this._tzm, !1, !0);else if ("string" == typeof this._i) {
      var e = Gi(dt, this._i);
      null != e ? this.utcOffset(e) : this.utcOffset(0, !0);
    }
    return this;
  }, _s.hasAlignedHourOffset = function (e) {
    return !!this.isValid() && (e = e ? Li(e).utcOffset() : 0, (this.utcOffset() - e) % 60 == 0);
  }, _s.isDST = function () {
    return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
  }, _s.isLocal = function () {
    return !!this.isValid() && !this._isUTC;
  }, _s.isUtcOffset = function () {
    return !!this.isValid() && this._isUTC;
  }, _s.isUtc = Ui, _s.isUTC = Ui, _s.zoneAbbr = function () {
    return this._isUTC ? "UTC" : "";
  }, _s.zoneName = function () {
    return this._isUTC ? "Coordinated Universal Time" : "";
  }, _s.dates = De("dates accessor is deprecated. Use date instead.", gs), _s.months = De("months accessor is deprecated. Use month instead", Vt), _s.years = De("years accessor is deprecated. Use year instead", Ot), _s.zone = De("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/", function (e, t) {
    return null != e ? ("string" != typeof e && (e = -e), this.utcOffset(e, t), this) : -this.utcOffset();
  }), _s.isDSTShifted = De("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information", function () {
    if (!ce(this._isDSTShifted)) return this._isDSTShifted;
    var e = {};

    if (xe(e, this), (e = Oi(e))._a) {
      var t = e._isUTC ? ge(e._a) : Li(e._a);
      this._isDSTShifted = this.isValid() && Ee(e._a, t.toArray()) > 0;
    } else this._isDSTShifted = !1;

    return this._isDSTShifted;
  });
  var Cs = Ye.prototype;

  function Ts(e, t, i, s) {
    var a = gi(),
        n = ge().set(s, t);
    return a[i](n, e);
  }

  function ks(e, t, i) {
    if (he(e) && (t = e, e = void 0), e = e || "", null != t) return Ts(e, t, i, "month");
    var s,
        a = [];

    for (s = 0; s < 12; s++) a[s] = Ts(e, s, i, "month");

    return a;
  }

  function Es(e, t, i, s) {
    "boolean" == typeof e ? (he(t) && (i = t, t = void 0), t = t || "") : (i = t = e, e = !1, he(t) && (i = t, t = void 0), t = t || "");
    var a,
        n = gi(),
        r = e ? n._week.dow : 0;
    if (null != i) return Ts(t, (i + r) % 7, s, "day");
    var o = [];

    for (a = 0; a < 7; a++) o[a] = Ts(t, (a + r) % 7, s, "day");

    return o;
  }

  Cs.calendar = function (e, t, i) {
    var s = this._calendar[e] || this._calendar.sameElse;
    return ze(s) ? s.call(t, i) : s;
  }, Cs.longDateFormat = function (e) {
    var t = this._longDateFormat[e],
        i = this._longDateFormat[e.toUpperCase()];

    return t || !i ? t : (this._longDateFormat[e] = i.replace(/MMMM|MM|DD|dddd/g, function (e) {
      return e.slice(1);
    }), this._longDateFormat[e]);
  }, Cs.invalidDate = function () {
    return this._invalidDate;
  }, Cs.ordinal = function (e) {
    return this._ordinal.replace("%d", e);
  }, Cs.preparse = Ss, Cs.postformat = Ss, Cs.relativeTime = function (e, t, i, s) {
    var a = this._relativeTime[i];
    return ze(a) ? a(e, t, i, s) : a.replace(/%d/i, e);
  }, Cs.pastFuture = function (e, t) {
    var i = this._relativeTime[e > 0 ? "future" : "past"];
    return ze(i) ? i(t) : i.replace(/%s/i, t);
  }, Cs.set = function (e) {
    var t, i;

    for (i in e) ze(t = e[i]) ? this[i] = t : this["_" + i] = t;

    this._config = e, this._dayOfMonthOrdinalParseLenient = new RegExp((this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source);
  }, Cs.months = function (e, t) {
    return e ? le(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || Ft).test(t) ? "format" : "standalone"][e.month()] : le(this._months) ? this._months : this._months.standalone;
  }, Cs.monthsShort = function (e, t) {
    return e ? le(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[Ft.test(t) ? "format" : "standalone"][e.month()] : le(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
  }, Cs.monthsParse = function (e, t, i) {
    var s, a, n;
    if (this._monthsParseExact) return function (e, t, i) {
      var s,
          a,
          n,
          r = e.toLocaleLowerCase();
      if (!this._monthsParse) for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], s = 0; s < 12; ++s) n = ge([2e3, s]), this._shortMonthsParse[s] = this.monthsShort(n, "").toLocaleLowerCase(), this._longMonthsParse[s] = this.months(n, "").toLocaleLowerCase();
      return i ? "MMM" === t ? -1 !== (a = Pt.call(this._shortMonthsParse, r)) ? a : null : -1 !== (a = Pt.call(this._longMonthsParse, r)) ? a : null : "MMM" === t ? -1 !== (a = Pt.call(this._shortMonthsParse, r)) ? a : -1 !== (a = Pt.call(this._longMonthsParse, r)) ? a : null : -1 !== (a = Pt.call(this._longMonthsParse, r)) ? a : -1 !== (a = Pt.call(this._shortMonthsParse, r)) ? a : null;
    }.call(this, e, t, i);

    for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), s = 0; s < 12; s++) {
      if (a = ge([2e3, s]), i && !this._longMonthsParse[s] && (this._longMonthsParse[s] = new RegExp("^" + this.months(a, "").replace(".", "") + "$", "i"), this._shortMonthsParse[s] = new RegExp("^" + this.monthsShort(a, "").replace(".", "") + "$", "i")), i || this._monthsParse[s] || (n = "^" + this.months(a, "") + "|^" + this.monthsShort(a, ""), this._monthsParse[s] = new RegExp(n.replace(".", ""), "i")), i && "MMMM" === t && this._longMonthsParse[s].test(e)) return s;
      if (i && "MMM" === t && this._shortMonthsParse[s].test(e)) return s;
      if (!i && this._monthsParse[s].test(e)) return s;
    }
  }, Cs.monthsRegex = function (e) {
    return this._monthsParseExact ? (me(this, "_monthsRegex") || Gt.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (me(this, "_monthsRegex") || (this._monthsRegex = Rt), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex);
  }, Cs.monthsShortRegex = function (e) {
    return this._monthsParseExact ? (me(this, "_monthsRegex") || Gt.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (me(this, "_monthsShortRegex") || (this._monthsShortRegex = jt), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex);
  }, Cs.week = function (e) {
    return Xt(e, this._week.dow, this._week.doy).week;
  }, Cs.firstDayOfYear = function () {
    return this._week.doy;
  }, Cs.firstDayOfWeek = function () {
    return this._week.dow;
  }, Cs.weekdays = function (e, t) {
    var i = le(this._weekdays) ? this._weekdays : this._weekdays[e && !0 !== e && this._weekdays.isFormat.test(t) ? "format" : "standalone"];
    return !0 === e ? Zt(i, this._week.dow) : e ? i[e.day()] : i;
  }, Cs.weekdaysMin = function (e) {
    return !0 === e ? Zt(this._weekdaysMin, this._week.dow) : e ? this._weekdaysMin[e.day()] : this._weekdaysMin;
  }, Cs.weekdaysShort = function (e) {
    return !0 === e ? Zt(this._weekdaysShort, this._week.dow) : e ? this._weekdaysShort[e.day()] : this._weekdaysShort;
  }, Cs.weekdaysParse = function (e, t, i) {
    var s, a, n;
    if (this._weekdaysParseExact) return function (e, t, i) {
      var s,
          a,
          n,
          r = e.toLocaleLowerCase();
      if (!this._weekdaysParse) for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], s = 0; s < 7; ++s) n = ge([2e3, 1]).day(s), this._minWeekdaysParse[s] = this.weekdaysMin(n, "").toLocaleLowerCase(), this._shortWeekdaysParse[s] = this.weekdaysShort(n, "").toLocaleLowerCase(), this._weekdaysParse[s] = this.weekdays(n, "").toLocaleLowerCase();
      return i ? "dddd" === t ? -1 !== (a = Pt.call(this._weekdaysParse, r)) ? a : null : "ddd" === t ? -1 !== (a = Pt.call(this._shortWeekdaysParse, r)) ? a : null : -1 !== (a = Pt.call(this._minWeekdaysParse, r)) ? a : null : "dddd" === t ? -1 !== (a = Pt.call(this._weekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._shortWeekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._minWeekdaysParse, r)) ? a : null : "ddd" === t ? -1 !== (a = Pt.call(this._shortWeekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._weekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._minWeekdaysParse, r)) ? a : null : -1 !== (a = Pt.call(this._minWeekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._weekdaysParse, r)) ? a : -1 !== (a = Pt.call(this._shortWeekdaysParse, r)) ? a : null;
    }.call(this, e, t, i);

    for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), s = 0; s < 7; s++) {
      if (a = ge([2e3, 1]).day(s), i && !this._fullWeekdaysParse[s] && (this._fullWeekdaysParse[s] = new RegExp("^" + this.weekdays(a, "").replace(".", "\\.?") + "$", "i"), this._shortWeekdaysParse[s] = new RegExp("^" + this.weekdaysShort(a, "").replace(".", "\\.?") + "$", "i"), this._minWeekdaysParse[s] = new RegExp("^" + this.weekdaysMin(a, "").replace(".", "\\.?") + "$", "i")), this._weekdaysParse[s] || (n = "^" + this.weekdays(a, "") + "|^" + this.weekdaysShort(a, "") + "|^" + this.weekdaysMin(a, ""), this._weekdaysParse[s] = new RegExp(n.replace(".", ""), "i")), i && "dddd" === t && this._fullWeekdaysParse[s].test(e)) return s;
      if (i && "ddd" === t && this._shortWeekdaysParse[s].test(e)) return s;
      if (i && "dd" === t && this._minWeekdaysParse[s].test(e)) return s;
      if (!i && this._weekdaysParse[s].test(e)) return s;
    }
  }, Cs.weekdaysRegex = function (e) {
    return this._weekdaysParseExact ? (me(this, "_weekdaysRegex") || si.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (me(this, "_weekdaysRegex") || (this._weekdaysRegex = ei), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex);
  }, Cs.weekdaysShortRegex = function (e) {
    return this._weekdaysParseExact ? (me(this, "_weekdaysRegex") || si.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (me(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = ti), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
  }, Cs.weekdaysMinRegex = function (e) {
    return this._weekdaysParseExact ? (me(this, "_weekdaysRegex") || si.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (me(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = ii), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
  }, Cs.isPM = function (e) {
    return "p" === (e + "").toLowerCase().charAt(0);
  }, Cs.meridiem = function (e, t, i) {
    return e > 11 ? i ? "pm" : "PM" : i ? "am" : "AM";
  }, mi("en", {
    dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
    ordinal: function (e) {
      var t = e % 10;
      return e + (1 === ke(e % 100 / 10) ? "th" : 1 === t ? "st" : 2 === t ? "nd" : 3 === t ? "rd" : "th");
    }
  }), oe.lang = De("moment.lang is deprecated. Use moment.locale instead.", mi), oe.langData = De("moment.langData is deprecated. Use moment.localeData instead.", gi);
  var Ms = Math.abs;

  function Ds(e, t, i, s) {
    var a = Zi(t, i);
    return e._milliseconds += s * a._milliseconds, e._days += s * a._days, e._months += s * a._months, e._bubble();
  }

  function $s(e) {
    return e < 0 ? Math.floor(e) : Math.ceil(e);
  }

  function Ps(e) {
    return 4800 * e / 146097;
  }

  function Os(e) {
    return 146097 * e / 4800;
  }

  function zs(e) {
    return function () {
      return this.as(e);
    };
  }

  var Ls = zs("ms"),
      Ys = zs("s"),
      Is = zs("m"),
      Fs = zs("h"),
      As = zs("d"),
      Ns = zs("w"),
      Hs = zs("M"),
      Vs = zs("Q"),
      js = zs("y");

  function Rs(e) {
    return function () {
      return this.isValid() ? this._data[e] : NaN;
    };
  }

  var Gs = Rs("milliseconds"),
      Ws = Rs("seconds"),
      Bs = Rs("minutes"),
      Us = Rs("hours"),
      Xs = Rs("days"),
      qs = Rs("months"),
      Zs = Rs("years");
  var Ks = Math.round,
      Js = {
    ss: 44,
    s: 45,
    m: 45,
    h: 22,
    d: 26,
    M: 11
  };
  var Qs = Math.abs;

  function ea(e) {
    return (e > 0) - (e < 0) || +e;
  }

  function ta() {
    if (!this.isValid()) return this.localeData().invalidDate();
    var e,
        t,
        i = Qs(this._milliseconds) / 1e3,
        s = Qs(this._days),
        a = Qs(this._months);
    e = Te(i / 60), t = Te(e / 60), i %= 60, e %= 60;
    var n = Te(a / 12),
        r = a %= 12,
        o = s,
        l = t,
        d = e,
        c = i ? i.toFixed(3).replace(/\.?0+$/, "") : "",
        h = this.asSeconds();
    if (!h) return "P0D";
    var p = h < 0 ? "-" : "",
        u = ea(this._months) !== ea(h) ? "-" : "",
        m = ea(this._days) !== ea(h) ? "-" : "",
        f = ea(this._milliseconds) !== ea(h) ? "-" : "";
    return p + "P" + (n ? u + n + "Y" : "") + (r ? u + r + "M" : "") + (o ? m + o + "D" : "") + (l || d || c ? "T" : "") + (l ? f + l + "H" : "") + (d ? f + d + "M" : "") + (c ? f + c + "S" : "");
  }

  var ia = Ni.prototype;
  ia.isValid = function () {
    return this._isValid;
  }, ia.abs = function () {
    var e = this._data;
    return this._milliseconds = Ms(this._milliseconds), this._days = Ms(this._days), this._months = Ms(this._months), e.milliseconds = Ms(e.milliseconds), e.seconds = Ms(e.seconds), e.minutes = Ms(e.minutes), e.hours = Ms(e.hours), e.months = Ms(e.months), e.years = Ms(e.years), this;
  }, ia.add = function (e, t) {
    return Ds(this, e, t, 1);
  }, ia.subtract = function (e, t) {
    return Ds(this, e, t, -1);
  }, ia.as = function (e) {
    if (!this.isValid()) return NaN;
    var t,
        i,
        s = this._milliseconds;
    if ("month" === (e = Ae(e)) || "quarter" === e || "year" === e) switch (t = this._days + s / 864e5, i = this._months + Ps(t), e) {
      case "month":
        return i;

      case "quarter":
        return i / 3;

      case "year":
        return i / 12;
    } else switch (t = this._days + Math.round(Os(this._months)), e) {
      case "week":
        return t / 7 + s / 6048e5;

      case "day":
        return t + s / 864e5;

      case "hour":
        return 24 * t + s / 36e5;

      case "minute":
        return 1440 * t + s / 6e4;

      case "second":
        return 86400 * t + s / 1e3;

      case "millisecond":
        return Math.floor(864e5 * t) + s;

      default:
        throw new Error("Unknown unit " + e);
    }
  }, ia.asMilliseconds = Ls, ia.asSeconds = Ys, ia.asMinutes = Is, ia.asHours = Fs, ia.asDays = As, ia.asWeeks = Ns, ia.asMonths = Hs, ia.asQuarters = Vs, ia.asYears = js, ia.valueOf = function () {
    return this.isValid() ? this._milliseconds + 864e5 * this._days + this._months % 12 * 2592e6 + 31536e6 * ke(this._months / 12) : NaN;
  }, ia._bubble = function () {
    var e,
        t,
        i,
        s,
        a,
        n = this._milliseconds,
        r = this._days,
        o = this._months,
        l = this._data;
    return n >= 0 && r >= 0 && o >= 0 || n <= 0 && r <= 0 && o <= 0 || (n += 864e5 * $s(Os(o) + r), r = 0, o = 0), l.milliseconds = n % 1e3, e = Te(n / 1e3), l.seconds = e % 60, t = Te(e / 60), l.minutes = t % 60, i = Te(t / 60), l.hours = i % 24, r += Te(i / 24), o += a = Te(Ps(r)), r -= $s(Os(a)), s = Te(o / 12), o %= 12, l.days = r, l.months = o, l.years = s, this;
  }, ia.clone = function () {
    return Zi(this);
  }, ia.get = function (e) {
    return e = Ae(e), this.isValid() ? this[e + "s"]() : NaN;
  }, ia.milliseconds = Gs, ia.seconds = Ws, ia.minutes = Bs, ia.hours = Us, ia.days = Xs, ia.weeks = function () {
    return Te(this.days() / 7);
  }, ia.months = qs, ia.years = Zs, ia.humanize = function (e) {
    if (!this.isValid()) return this.localeData().invalidDate();

    var t = this.localeData(),
        i = function (e, t, i) {
      var s = Zi(e).abs(),
          a = Ks(s.as("s")),
          n = Ks(s.as("m")),
          r = Ks(s.as("h")),
          o = Ks(s.as("d")),
          l = Ks(s.as("M")),
          d = Ks(s.as("y")),
          c = a <= Js.ss && ["s", a] || a < Js.s && ["ss", a] || n <= 1 && ["m"] || n < Js.m && ["mm", n] || r <= 1 && ["h"] || r < Js.h && ["hh", r] || o <= 1 && ["d"] || o < Js.d && ["dd", o] || l <= 1 && ["M"] || l < Js.M && ["MM", l] || d <= 1 && ["y"] || ["yy", d];
      return c[2] = t, c[3] = +e > 0, c[4] = i, function (e, t, i, s, a) {
        return a.relativeTime(t || 1, !!i, e, s);
      }.apply(null, c);
    }(this, !e, t);

    return e && (i = t.pastFuture(+this, i)), t.postformat(i);
  }, ia.toISOString = ta, ia.toString = ta, ia.toJSON = ta, ia.locale = as, ia.localeData = rs, ia.toIsoString = De("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)", ta), ia.lang = ns, Ue("X", 0, 0, "unix"), Ue("x", 0, 0, "valueOf"), ut("x", lt), ut("X", /[+-]?\d+(\.\d{1,3})?/), vt("X", function (e, t, i) {
    i._d = new Date(1e3 * parseFloat(e, 10));
  }), vt("x", function (e, t, i) {
    i._d = new Date(ke(e));
  }), oe.version = "2.24.0", ne = Li, oe.fn = _s, oe.min = function () {
    return Fi("isBefore", [].slice.call(arguments, 0));
  }, oe.max = function () {
    return Fi("isAfter", [].slice.call(arguments, 0));
  }, oe.now = function () {
    return Date.now ? Date.now() : +new Date();
  }, oe.utc = ge, oe.unix = function (e) {
    return Li(1e3 * e);
  }, oe.months = function (e, t) {
    return ks(e, t, "months");
  }, oe.isDate = pe, oe.locale = mi, oe.invalid = be, oe.duration = Zi, oe.isMoment = Ce, oe.weekdays = function (e, t, i) {
    return Es(e, t, i, "weekdays");
  }, oe.parseZone = function () {
    return Li.apply(null, arguments).parseZone();
  }, oe.localeData = gi, oe.isDuration = Hi, oe.monthsShort = function (e, t) {
    return ks(e, t, "monthsShort");
  }, oe.weekdaysMin = function (e, t, i) {
    return Es(e, t, i, "weekdaysMin");
  }, oe.defineLocale = fi, oe.updateLocale = function (e, t) {
    if (null != t) {
      var i,
          s,
          a = di;
      null != (s = ui(e)) && (a = s._config), (i = new Ye(t = Le(a, t))).parentLocale = ci[e], ci[e] = i, mi(e);
    } else null != ci[e] && (null != ci[e].parentLocale ? ci[e] = ci[e].parentLocale : null != ci[e] && delete ci[e]);

    return ci[e];
  }, oe.locales = function () {
    return $e(ci);
  }, oe.weekdaysShort = function (e, t, i) {
    return Es(e, t, i, "weekdaysShort");
  }, oe.normalizeUnits = Ae, oe.relativeTimeRounding = function (e) {
    return void 0 === e ? Ks : "function" == typeof e && (Ks = e, !0);
  }, oe.relativeTimeThreshold = function (e, t) {
    return void 0 !== Js[e] && (void 0 === t ? Js[e] : (Js[e] = t, "s" === e && (Js.ss = t - 1), !0));
  }, oe.calendarFormat = function (e, t) {
    var i = e.diff(t, "days", !0);
    return i < -6 ? "sameElse" : i < -1 ? "lastWeek" : i < 0 ? "lastDay" : i < 1 ? "sameDay" : i < 2 ? "nextDay" : i < 7 ? "nextWeek" : "sameElse";
  }, oe.prototype = _s, oe.HTML5_FMT = {
    DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
    DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
    DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
    DATE: "YYYY-MM-DD",
    TIME: "HH:mm",
    TIME_SECONDS: "HH:mm:ss",
    TIME_MS: "HH:mm:ss.SSS",
    WEEK: "GGGG-[W]WW",
    MONTH: "YYYY-MM"
  };
  var sa = "undefined" == typeof document ? {
    body: {},
    addEventListener: function () {},
    removeEventListener: function () {},
    activeElement: {
      blur: function () {},
      nodeName: ""
    },
    querySelector: function () {
      return null;
    },
    querySelectorAll: function () {
      return [];
    },
    getElementById: function () {
      return null;
    },
    createEvent: function () {
      return {
        initEvent: function () {}
      };
    },
    createElement: function () {
      return {
        children: [],
        childNodes: [],
        style: {},
        setAttribute: function () {},
        getElementsByTagName: function () {
          return [];
        }
      };
    },
    location: {
      hash: ""
    }
  } : document,
      aa = "undefined" == typeof window ? {
    document: sa,
    navigator: {
      userAgent: ""
    },
    location: {},
    history: {},
    CustomEvent: function () {
      return this;
    },
    addEventListener: function () {},
    removeEventListener: function () {},
    getComputedStyle: function () {
      return {
        getPropertyValue: function () {
          return "";
        }
      };
    },
    Image: function () {},
    Date: function () {},
    screen: {},
    setTimeout: function () {},
    clearTimeout: function () {}
  } : window;

  class na {
    constructor(e) {
      const t = this;

      for (let i = 0; i < e.length; i += 1) t[i] = e[i];

      return t.length = e.length, this;
    }

  }

  function ra(e, t) {
    const i = [];
    let s = 0;
    if (e && !t && e instanceof na) return e;
    if (e) if ("string" == typeof e) {
      let a, n;
      const r = e.trim();

      if (r.indexOf("<") >= 0 && r.indexOf(">") >= 0) {
        let e = "div";

        for (0 === r.indexOf("<li") && (e = "ul"), 0 === r.indexOf("<tr") && (e = "tbody"), 0 !== r.indexOf("<td") && 0 !== r.indexOf("<th") || (e = "tr"), 0 === r.indexOf("<tbody") && (e = "table"), 0 === r.indexOf("<option") && (e = "select"), (n = sa.createElement(e)).innerHTML = r, s = 0; s < n.childNodes.length; s += 1) i.push(n.childNodes[s]);
      } else for (a = t || "#" !== e[0] || e.match(/[ .<>:~]/) ? (t || sa).querySelectorAll(e.trim()) : [sa.getElementById(e.trim().split("#")[1])], s = 0; s < a.length; s += 1) a[s] && i.push(a[s]);
    } else if (e.nodeType || e === aa || e === sa) i.push(e);else if (e.length > 0 && e[0].nodeType) for (s = 0; s < e.length; s += 1) i.push(e[s]);
    return new na(i);
  }

  function oa(e) {
    const t = [];

    for (let i = 0; i < e.length; i += 1) -1 === t.indexOf(e[i]) && t.push(e[i]);

    return t;
  }

  ra.fn = na.prototype, ra.Class = na, ra.Dom7 = na;
  const la = {
    addClass: function (e) {
      if (void 0 === e) return this;
      const t = e.split(" ");

      for (let e = 0; e < t.length; e += 1) for (let i = 0; i < this.length; i += 1) void 0 !== this[i] && void 0 !== this[i].classList && this[i].classList.add(t[e]);

      return this;
    },
    removeClass: function (e) {
      const t = e.split(" ");

      for (let e = 0; e < t.length; e += 1) for (let i = 0; i < this.length; i += 1) void 0 !== this[i] && void 0 !== this[i].classList && this[i].classList.remove(t[e]);

      return this;
    },
    hasClass: function (e) {
      return !!this[0] && this[0].classList.contains(e);
    },
    toggleClass: function (e) {
      const t = e.split(" ");

      for (let e = 0; e < t.length; e += 1) for (let i = 0; i < this.length; i += 1) void 0 !== this[i] && void 0 !== this[i].classList && this[i].classList.toggle(t[e]);

      return this;
    },
    attr: function (e, t) {
      if (1 === arguments.length && "string" == typeof e) return this[0] ? this[0].getAttribute(e) : void 0;

      for (let i = 0; i < this.length; i += 1) if (2 === arguments.length) this[i].setAttribute(e, t);else for (const t in e) this[i][t] = e[t], this[i].setAttribute(t, e[t]);

      return this;
    },
    removeAttr: function (e) {
      for (let t = 0; t < this.length; t += 1) this[t].removeAttribute(e);

      return this;
    },
    data: function (e, t) {
      let i;

      if (void 0 !== t) {
        for (let s = 0; s < this.length; s += 1) (i = this[s]).dom7ElementDataStorage || (i.dom7ElementDataStorage = {}), i.dom7ElementDataStorage[e] = t;

        return this;
      }

      if (i = this[0]) {
        if (i.dom7ElementDataStorage && e in i.dom7ElementDataStorage) return i.dom7ElementDataStorage[e];
        const t = i.getAttribute(`data-${e}`);
        return t || void 0;
      }
    },
    transform: function (e) {
      for (let t = 0; t < this.length; t += 1) {
        const i = this[t].style;
        i.webkitTransform = e, i.transform = e;
      }

      return this;
    },
    transition: function (e) {
      "string" != typeof e && (e = `${e}ms`);

      for (let t = 0; t < this.length; t += 1) {
        const i = this[t].style;
        i.webkitTransitionDuration = e, i.transitionDuration = e;
      }

      return this;
    },
    on: function (...e) {
      let [t, i, s, a] = e;

      function n(e) {
        const t = e.target;
        if (!t) return;
        const a = e.target.dom7EventData || [];
        if (a.indexOf(e) < 0 && a.unshift(e), ra(t).is(i)) s.apply(t, a);else {
          const e = ra(t).parents();

          for (let t = 0; t < e.length; t += 1) ra(e[t]).is(i) && s.apply(e[t], a);
        }
      }

      function r(e) {
        const t = e && e.target && e.target.dom7EventData || [];
        t.indexOf(e) < 0 && t.unshift(e), s.apply(this, t);
      }

      "function" == typeof e[1] && ([t, s, a] = e, i = void 0), a || (a = !1);
      const o = t.split(" ");
      let l;

      for (let e = 0; e < this.length; e += 1) {
        const t = this[e];
        if (i) for (l = 0; l < o.length; l += 1) {
          const e = o[l];
          t.dom7LiveListeners || (t.dom7LiveListeners = {}), t.dom7LiveListeners[e] || (t.dom7LiveListeners[e] = []), t.dom7LiveListeners[e].push({
            listener: s,
            proxyListener: n
          }), t.addEventListener(e, n, a);
        } else for (l = 0; l < o.length; l += 1) {
          const e = o[l];
          t.dom7Listeners || (t.dom7Listeners = {}), t.dom7Listeners[e] || (t.dom7Listeners[e] = []), t.dom7Listeners[e].push({
            listener: s,
            proxyListener: r
          }), t.addEventListener(e, r, a);
        }
      }

      return this;
    },
    off: function (...e) {
      let [t, i, s, a] = e;
      "function" == typeof e[1] && ([t, s, a] = e, i = void 0), a || (a = !1);
      const n = t.split(" ");

      for (let e = 0; e < n.length; e += 1) {
        const t = n[e];

        for (let e = 0; e < this.length; e += 1) {
          const n = this[e];
          let r;
          if (!i && n.dom7Listeners ? r = n.dom7Listeners[t] : i && n.dom7LiveListeners && (r = n.dom7LiveListeners[t]), r && r.length) for (let e = r.length - 1; e >= 0; e -= 1) {
            const i = r[e];
            s && i.listener === s ? (n.removeEventListener(t, i.proxyListener, a), r.splice(e, 1)) : s && i.listener && i.listener.dom7proxy && i.listener.dom7proxy === s ? (n.removeEventListener(t, i.proxyListener, a), r.splice(e, 1)) : s || (n.removeEventListener(t, i.proxyListener, a), r.splice(e, 1));
          }
        }
      }

      return this;
    },
    trigger: function (...e) {
      const t = e[0].split(" "),
            i = e[1];

      for (let s = 0; s < t.length; s += 1) {
        const a = t[s];

        for (let t = 0; t < this.length; t += 1) {
          const s = this[t];
          let n;

          try {
            n = new aa.CustomEvent(a, {
              detail: i,
              bubbles: !0,
              cancelable: !0
            });
          } catch (e) {
            (n = sa.createEvent("Event")).initEvent(a, !0, !0), n.detail = i;
          }

          s.dom7EventData = e.filter((e, t) => t > 0), s.dispatchEvent(n), s.dom7EventData = [], delete s.dom7EventData;
        }
      }

      return this;
    },
    transitionEnd: function (e) {
      const t = ["webkitTransitionEnd", "transitionend"],
            i = this;
      let s;

      function a(n) {
        if (n.target === this) for (e.call(this, n), s = 0; s < t.length; s += 1) i.off(t[s], a);
      }

      if (e) for (s = 0; s < t.length; s += 1) i.on(t[s], a);
      return this;
    },
    outerWidth: function (e) {
      if (this.length > 0) {
        if (e) {
          const e = this.styles();
          return this[0].offsetWidth + parseFloat(e.getPropertyValue("margin-right")) + parseFloat(e.getPropertyValue("margin-left"));
        }

        return this[0].offsetWidth;
      }

      return null;
    },
    outerHeight: function (e) {
      if (this.length > 0) {
        if (e) {
          const e = this.styles();
          return this[0].offsetHeight + parseFloat(e.getPropertyValue("margin-top")) + parseFloat(e.getPropertyValue("margin-bottom"));
        }

        return this[0].offsetHeight;
      }

      return null;
    },
    offset: function () {
      if (this.length > 0) {
        const e = this[0],
              t = e.getBoundingClientRect(),
              i = sa.body,
              s = e.clientTop || i.clientTop || 0,
              a = e.clientLeft || i.clientLeft || 0,
              n = e === aa ? aa.scrollY : e.scrollTop,
              r = e === aa ? aa.scrollX : e.scrollLeft;
        return {
          top: t.top + n - s,
          left: t.left + r - a
        };
      }

      return null;
    },
    css: function (e, t) {
      let i;

      if (1 === arguments.length) {
        if ("string" != typeof e) {
          for (i = 0; i < this.length; i += 1) for (let t in e) this[i].style[t] = e[t];

          return this;
        }

        if (this[0]) return aa.getComputedStyle(this[0], null).getPropertyValue(e);
      }

      if (2 === arguments.length && "string" == typeof e) {
        for (i = 0; i < this.length; i += 1) this[i].style[e] = t;

        return this;
      }

      return this;
    },
    each: function (e) {
      if (!e) return this;

      for (let t = 0; t < this.length; t += 1) if (!1 === e.call(this[t], t, this[t])) return this;

      return this;
    },
    html: function (e) {
      if (void 0 === e) return this[0] ? this[0].innerHTML : void 0;

      for (let t = 0; t < this.length; t += 1) this[t].innerHTML = e;

      return this;
    },
    text: function (e) {
      if (void 0 === e) return this[0] ? this[0].textContent.trim() : null;

      for (let t = 0; t < this.length; t += 1) this[t].textContent = e;

      return this;
    },
    is: function (e) {
      const t = this[0];
      let i, s;
      if (!t || void 0 === e) return !1;

      if ("string" == typeof e) {
        if (t.matches) return t.matches(e);
        if (t.webkitMatchesSelector) return t.webkitMatchesSelector(e);
        if (t.msMatchesSelector) return t.msMatchesSelector(e);

        for (i = ra(e), s = 0; s < i.length; s += 1) if (i[s] === t) return !0;

        return !1;
      }

      if (e === sa) return t === sa;
      if (e === aa) return t === aa;

      if (e.nodeType || e instanceof na) {
        for (i = e.nodeType ? [e] : e, s = 0; s < i.length; s += 1) if (i[s] === t) return !0;

        return !1;
      }

      return !1;
    },
    index: function () {
      let e,
          t = this[0];

      if (t) {
        for (e = 0; null !== (t = t.previousSibling);) 1 === t.nodeType && (e += 1);

        return e;
      }
    },
    eq: function (e) {
      if (void 0 === e) return this;
      const t = this.length;
      let i;
      return new na(e > t - 1 ? [] : e < 0 ? (i = t + e) < 0 ? [] : [this[i]] : [this[e]]);
    },
    append: function (...e) {
      let t;

      for (let i = 0; i < e.length; i += 1) {
        t = e[i];

        for (let e = 0; e < this.length; e += 1) if ("string" == typeof t) {
          const i = sa.createElement("div");

          for (i.innerHTML = t; i.firstChild;) this[e].appendChild(i.firstChild);
        } else if (t instanceof na) for (let i = 0; i < t.length; i += 1) this[e].appendChild(t[i]);else this[e].appendChild(t);
      }

      return this;
    },
    prepend: function (e) {
      let t, i;

      for (t = 0; t < this.length; t += 1) if ("string" == typeof e) {
        const s = sa.createElement("div");

        for (s.innerHTML = e, i = s.childNodes.length - 1; i >= 0; i -= 1) this[t].insertBefore(s.childNodes[i], this[t].childNodes[0]);
      } else if (e instanceof na) for (i = 0; i < e.length; i += 1) this[t].insertBefore(e[i], this[t].childNodes[0]);else this[t].insertBefore(e, this[t].childNodes[0]);

      return this;
    },
    next: function (e) {
      return this.length > 0 ? e ? this[0].nextElementSibling && ra(this[0].nextElementSibling).is(e) ? new na([this[0].nextElementSibling]) : new na([]) : this[0].nextElementSibling ? new na([this[0].nextElementSibling]) : new na([]) : new na([]);
    },
    nextAll: function (e) {
      const t = [];
      let i = this[0];
      if (!i) return new na([]);

      for (; i.nextElementSibling;) {
        const s = i.nextElementSibling;
        e ? ra(s).is(e) && t.push(s) : t.push(s), i = s;
      }

      return new na(t);
    },
    prev: function (e) {
      if (this.length > 0) {
        const t = this[0];
        return e ? t.previousElementSibling && ra(t.previousElementSibling).is(e) ? new na([t.previousElementSibling]) : new na([]) : t.previousElementSibling ? new na([t.previousElementSibling]) : new na([]);
      }

      return new na([]);
    },
    prevAll: function (e) {
      const t = [];
      let i = this[0];
      if (!i) return new na([]);

      for (; i.previousElementSibling;) {
        const s = i.previousElementSibling;
        e ? ra(s).is(e) && t.push(s) : t.push(s), i = s;
      }

      return new na(t);
    },
    parent: function (e) {
      const t = [];

      for (let i = 0; i < this.length; i += 1) null !== this[i].parentNode && (e ? ra(this[i].parentNode).is(e) && t.push(this[i].parentNode) : t.push(this[i].parentNode));

      return ra(oa(t));
    },
    parents: function (e) {
      const t = [];

      for (let i = 0; i < this.length; i += 1) {
        let s = this[i].parentNode;

        for (; s;) e ? ra(s).is(e) && t.push(s) : t.push(s), s = s.parentNode;
      }

      return ra(oa(t));
    },
    closest: function (e) {
      let t = this;
      return void 0 === e ? new na([]) : (t.is(e) || (t = t.parents(e).eq(0)), t);
    },
    find: function (e) {
      const t = [];

      for (let i = 0; i < this.length; i += 1) {
        const s = this[i].querySelectorAll(e);

        for (let e = 0; e < s.length; e += 1) t.push(s[e]);
      }

      return new na(t);
    },
    children: function (e) {
      const t = [];

      for (let i = 0; i < this.length; i += 1) {
        const s = this[i].childNodes;

        for (let i = 0; i < s.length; i += 1) e ? 1 === s[i].nodeType && ra(s[i]).is(e) && t.push(s[i]) : 1 === s[i].nodeType && t.push(s[i]);
      }

      return new na(oa(t));
    },
    remove: function () {
      for (let e = 0; e < this.length; e += 1) this[e].parentNode && this[e].parentNode.removeChild(this[e]);

      return this;
    },
    add: function (...e) {
      const t = this;
      let i, s;

      for (i = 0; i < e.length; i += 1) {
        const a = ra(e[i]);

        for (s = 0; s < a.length; s += 1) t[t.length] = a[s], t.length += 1;
      }

      return t;
    },
    styles: function () {
      return this[0] ? aa.getComputedStyle(this[0], null) : {};
    }
  };
  Object.keys(la).forEach(e => {
    ra.fn[e] = la[e];
  });

  const da = {
    deleteProps(e) {
      const t = e;
      Object.keys(t).forEach(e => {
        try {
          t[e] = null;
        } catch (e) {}

        try {
          delete t[e];
        } catch (e) {}
      });
    },

    nextTick: (e, t = 0) => setTimeout(e, t),
    now: () => Date.now(),

    getTranslate(e, t = "x") {
      let i, s, a;
      const n = aa.getComputedStyle(e, null);
      return aa.WebKitCSSMatrix ? ((s = n.transform || n.webkitTransform).split(",").length > 6 && (s = s.split(", ").map(e => e.replace(",", ".")).join(", ")), a = new aa.WebKitCSSMatrix("none" === s ? "" : s)) : i = (a = n.MozTransform || n.OTransform || n.MsTransform || n.msTransform || n.transform || n.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,")).toString().split(","), "x" === t && (s = aa.WebKitCSSMatrix ? a.m41 : 16 === i.length ? parseFloat(i[12]) : parseFloat(i[4])), "y" === t && (s = aa.WebKitCSSMatrix ? a.m42 : 16 === i.length ? parseFloat(i[13]) : parseFloat(i[5])), s || 0;
    },

    parseUrlQuery(e) {
      const t = {};
      let i,
          s,
          a,
          n,
          r = e || aa.location.href;
      if ("string" == typeof r && r.length) for (n = (s = (r = r.indexOf("?") > -1 ? r.replace(/\S*\?/, "") : "").split("&").filter(e => "" !== e)).length, i = 0; i < n; i += 1) a = s[i].replace(/#\S+/g, "").split("="), t[decodeURIComponent(a[0])] = void 0 === a[1] ? void 0 : decodeURIComponent(a[1]) || "";
      return t;
    },

    isObject: e => "object" == typeof e && null !== e && e.constructor && e.constructor === Object,

    extend(...e) {
      const t = Object(e[0]);

      for (let i = 1; i < e.length; i += 1) {
        const s = e[i];

        if (null != s) {
          const e = Object.keys(Object(s));

          for (let i = 0, a = e.length; i < a; i += 1) {
            const a = e[i],
                  n = Object.getOwnPropertyDescriptor(s, a);
            void 0 !== n && n.enumerable && (da.isObject(t[a]) && da.isObject(s[a]) ? da.extend(t[a], s[a]) : !da.isObject(t[a]) && da.isObject(s[a]) ? (t[a] = {}, da.extend(t[a], s[a])) : t[a] = s[a]);
          }
        }
      }

      return t;
    }

  },
        ca = function () {
    const e = sa.createElement("div");
    return {
      touch: aa.Modernizr && !0 === aa.Modernizr.touch || !!(aa.navigator.maxTouchPoints > 0 || "ontouchstart" in aa || aa.DocumentTouch && sa instanceof aa.DocumentTouch),
      pointerEvents: !!(aa.navigator.pointerEnabled || aa.PointerEvent || "maxTouchPoints" in aa.navigator && aa.navigator.maxTouchPoints > 0),
      prefixedPointerEvents: !!aa.navigator.msPointerEnabled,
      transition: function () {
        const t = e.style;
        return "transition" in t || "webkitTransition" in t || "MozTransition" in t;
      }(),
      transforms3d: aa.Modernizr && !0 === aa.Modernizr.csstransforms3d || function () {
        const t = e.style;
        return "webkitPerspective" in t || "MozPerspective" in t || "OPerspective" in t || "MsPerspective" in t || "perspective" in t;
      }(),
      flexbox: function () {
        const t = e.style,
              i = "alignItems webkitAlignItems webkitBoxAlign msFlexAlign mozBoxAlign webkitFlexDirection msFlexDirection mozBoxDirection mozBoxOrient webkitBoxDirection webkitBoxOrient".split(" ");

        for (let e = 0; e < i.length; e += 1) if (i[e] in t) return !0;

        return !1;
      }(),
      observer: "MutationObserver" in aa || "WebkitMutationObserver" in aa,
      passiveListener: function () {
        let e = !1;

        try {
          const t = Object.defineProperty({}, "passive", {
            get() {
              e = !0;
            }

          });
          aa.addEventListener("testPassiveListener", null, t);
        } catch (e) {}

        return e;
      }(),
      gestures: "ongesturestart" in aa
    };
  }(),
        ha = function () {
    return {
      isIE: !!aa.navigator.userAgent.match(/Trident/g) || !!aa.navigator.userAgent.match(/MSIE/g),
      isEdge: !!aa.navigator.userAgent.match(/Edge/g),
      isSafari: function () {
        const e = aa.navigator.userAgent.toLowerCase();
        return e.indexOf("safari") >= 0 && e.indexOf("chrome") < 0 && e.indexOf("android") < 0;
      }(),
      isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(aa.navigator.userAgent)
    };
  }();

  class pa {
    constructor(e = {}) {
      const t = this;
      t.params = e, t.eventsListeners = {}, t.params && t.params.on && Object.keys(t.params.on).forEach(e => {
        t.on(e, t.params.on[e]);
      });
    }

    on(e, t, i) {
      const s = this;
      if ("function" != typeof t) return s;
      const a = i ? "unshift" : "push";
      return e.split(" ").forEach(e => {
        s.eventsListeners[e] || (s.eventsListeners[e] = []), s.eventsListeners[e][a](t);
      }), s;
    }

    once(e, t, i) {
      const s = this;
      if ("function" != typeof t) return s;

      function a(...i) {
        t.apply(s, i), s.off(e, a), a.f7proxy && delete a.f7proxy;
      }

      return a.f7proxy = t, s.on(e, a, i);
    }

    off(e, t) {
      const i = this;
      return i.eventsListeners ? (e.split(" ").forEach(e => {
        void 0 === t ? i.eventsListeners[e] = [] : i.eventsListeners[e] && i.eventsListeners[e].length && i.eventsListeners[e].forEach((s, a) => {
          (s === t || s.f7proxy && s.f7proxy === t) && i.eventsListeners[e].splice(a, 1);
        });
      }), i) : i;
    }

    emit(...e) {
      const t = this;
      if (!t.eventsListeners) return t;
      let i, s, a;
      return "string" == typeof e[0] || Array.isArray(e[0]) ? (i = e[0], s = e.slice(1, e.length), a = t) : (i = e[0].events, s = e[0].data, a = e[0].context || t), (Array.isArray(i) ? i : i.split(" ")).forEach(e => {
        if (t.eventsListeners && t.eventsListeners[e]) {
          const i = [];
          t.eventsListeners[e].forEach(e => {
            i.push(e);
          }), i.forEach(e => {
            e.apply(a, s);
          });
        }
      }), t;
    }

    useModulesParams(e) {
      const t = this;
      t.modules && Object.keys(t.modules).forEach(i => {
        const s = t.modules[i];
        s.params && da.extend(e, s.params);
      });
    }

    useModules(e = {}) {
      const t = this;
      t.modules && Object.keys(t.modules).forEach(i => {
        const s = t.modules[i],
              a = e[i] || {};
        s.instance && Object.keys(s.instance).forEach(e => {
          const i = s.instance[e];
          t[e] = "function" == typeof i ? i.bind(t) : i;
        }), s.on && t.on && Object.keys(s.on).forEach(e => {
          t.on(e, s.on[e]);
        }), s.create && s.create.bind(t)(a);
      });
    }

    static set components(e) {
      this.use && this.use(e);
    }

    static installModule(e, ...t) {
      const i = this;
      i.prototype.modules || (i.prototype.modules = {});
      const s = e.name || `${Object.keys(i.prototype.modules).length}_${da.now()}`;
      return i.prototype.modules[s] = e, e.proto && Object.keys(e.proto).forEach(t => {
        i.prototype[t] = e.proto[t];
      }), e.static && Object.keys(e.static).forEach(t => {
        i[t] = e.static[t];
      }), e.install && e.install.apply(i, t), i;
    }

    static use(e, ...t) {
      const i = this;
      return Array.isArray(e) ? (e.forEach(e => i.installModule(e)), i) : i.installModule(e, ...t);
    }

  }

  var ua = {
    updateSize: function () {
      const e = this;
      let t, i;
      const s = e.$el;
      t = void 0 !== e.params.width ? e.params.width : s[0].clientWidth, i = void 0 !== e.params.height ? e.params.height : s[0].clientHeight, 0 === t && e.isHorizontal() || 0 === i && e.isVertical() || (t = t - parseInt(s.css("padding-left"), 10) - parseInt(s.css("padding-right"), 10), i = i - parseInt(s.css("padding-top"), 10) - parseInt(s.css("padding-bottom"), 10), da.extend(e, {
        width: t,
        height: i,
        size: e.isHorizontal() ? t : i
      }));
    },
    updateSlides: function () {
      const e = this,
            t = e.params,
            {
        $wrapperEl: i,
        size: s,
        rtlTranslate: a,
        wrongRTL: n
      } = e,
            r = e.virtual && t.virtual.enabled,
            o = r ? e.virtual.slides.length : e.slides.length,
            l = i.children(`.${e.params.slideClass}`),
            d = r ? e.virtual.slides.length : l.length;
      let c = [];
      const h = [],
            p = [];
      let u = t.slidesOffsetBefore;
      "function" == typeof u && (u = t.slidesOffsetBefore.call(e));
      let m = t.slidesOffsetAfter;
      "function" == typeof m && (m = t.slidesOffsetAfter.call(e));
      const f = e.snapGrid.length,
            g = e.snapGrid.length;
      let v,
          w,
          b = t.spaceBetween,
          y = -u,
          x = 0,
          _ = 0;
      if (void 0 === s) return;
      "string" == typeof b && b.indexOf("%") >= 0 && (b = parseFloat(b.replace("%", "")) / 100 * s), e.virtualSize = -b, a ? l.css({
        marginLeft: "",
        marginTop: ""
      }) : l.css({
        marginRight: "",
        marginBottom: ""
      }), t.slidesPerColumn > 1 && (v = Math.floor(d / t.slidesPerColumn) === d / e.params.slidesPerColumn ? d : Math.ceil(d / t.slidesPerColumn) * t.slidesPerColumn, "auto" !== t.slidesPerView && "row" === t.slidesPerColumnFill && (v = Math.max(v, t.slidesPerView * t.slidesPerColumn)));
      const S = t.slidesPerColumn,
            C = v / S,
            T = Math.floor(d / t.slidesPerColumn);

      for (let i = 0; i < d; i += 1) {
        w = 0;
        const a = l.eq(i);

        if (t.slidesPerColumn > 1) {
          let s, n, r;
          "column" === t.slidesPerColumnFill ? (r = i - (n = Math.floor(i / S)) * S, (n > T || n === T && r === S - 1) && (r += 1) >= S && (r = 0, n += 1), s = n + r * v / S, a.css({
            "-webkit-box-ordinal-group": s,
            "-moz-box-ordinal-group": s,
            "-ms-flex-order": s,
            "-webkit-order": s,
            order: s
          })) : n = i - (r = Math.floor(i / C)) * C, a.css(`margin-${e.isHorizontal() ? "top" : "left"}`, 0 !== r && t.spaceBetween && `${t.spaceBetween}px`).attr("data-swiper-column", n).attr("data-swiper-row", r);
        }

        if ("none" !== a.css("display")) {
          if ("auto" === t.slidesPerView) {
            const i = aa.getComputedStyle(a[0], null),
                  s = a[0].style.transform,
                  n = a[0].style.webkitTransform;
            if (s && (a[0].style.transform = "none"), n && (a[0].style.webkitTransform = "none"), t.roundLengths) w = e.isHorizontal() ? a.outerWidth(!0) : a.outerHeight(!0);else if (e.isHorizontal()) {
              const e = parseFloat(i.getPropertyValue("width")),
                    t = parseFloat(i.getPropertyValue("padding-left")),
                    s = parseFloat(i.getPropertyValue("padding-right")),
                    a = parseFloat(i.getPropertyValue("margin-left")),
                    n = parseFloat(i.getPropertyValue("margin-right")),
                    r = i.getPropertyValue("box-sizing");
              w = r && "border-box" === r ? e + a + n : e + t + s + a + n;
            } else {
              const e = parseFloat(i.getPropertyValue("height")),
                    t = parseFloat(i.getPropertyValue("padding-top")),
                    s = parseFloat(i.getPropertyValue("padding-bottom")),
                    a = parseFloat(i.getPropertyValue("margin-top")),
                    n = parseFloat(i.getPropertyValue("margin-bottom")),
                    r = i.getPropertyValue("box-sizing");
              w = r && "border-box" === r ? e + a + n : e + t + s + a + n;
            }
            s && (a[0].style.transform = s), n && (a[0].style.webkitTransform = n), t.roundLengths && (w = Math.floor(w));
          } else w = (s - (t.slidesPerView - 1) * b) / t.slidesPerView, t.roundLengths && (w = Math.floor(w)), l[i] && (e.isHorizontal() ? l[i].style.width = `${w}px` : l[i].style.height = `${w}px`);

          l[i] && (l[i].swiperSlideSize = w), p.push(w), t.centeredSlides ? (y = y + w / 2 + x / 2 + b, 0 === x && 0 !== i && (y = y - s / 2 - b), 0 === i && (y = y - s / 2 - b), Math.abs(y) < .001 && (y = 0), t.roundLengths && (y = Math.floor(y)), _ % t.slidesPerGroup == 0 && c.push(y), h.push(y)) : (t.roundLengths && (y = Math.floor(y)), _ % t.slidesPerGroup == 0 && c.push(y), h.push(y), y = y + w + b), e.virtualSize += w + b, x = w, _ += 1;
        }
      }

      let k;

      if (e.virtualSize = Math.max(e.virtualSize, s) + m, a && n && ("slide" === t.effect || "coverflow" === t.effect) && i.css({
        width: `${e.virtualSize + t.spaceBetween}px`
      }), ca.flexbox && !t.setWrapperSize || (e.isHorizontal() ? i.css({
        width: `${e.virtualSize + t.spaceBetween}px`
      }) : i.css({
        height: `${e.virtualSize + t.spaceBetween}px`
      })), t.slidesPerColumn > 1 && (e.virtualSize = (w + t.spaceBetween) * v, e.virtualSize = Math.ceil(e.virtualSize / t.slidesPerColumn) - t.spaceBetween, e.isHorizontal() ? i.css({
        width: `${e.virtualSize + t.spaceBetween}px`
      }) : i.css({
        height: `${e.virtualSize + t.spaceBetween}px`
      }), t.centeredSlides)) {
        k = [];

        for (let i = 0; i < c.length; i += 1) {
          let s = c[i];
          t.roundLengths && (s = Math.floor(s)), c[i] < e.virtualSize + c[0] && k.push(s);
        }

        c = k;
      }

      if (!t.centeredSlides) {
        k = [];

        for (let i = 0; i < c.length; i += 1) {
          let a = c[i];
          t.roundLengths && (a = Math.floor(a)), c[i] <= e.virtualSize - s && k.push(a);
        }

        c = k, Math.floor(e.virtualSize - s) - Math.floor(c[c.length - 1]) > 1 && c.push(e.virtualSize - s);
      }

      if (0 === c.length && (c = [0]), 0 !== t.spaceBetween && (e.isHorizontal() ? a ? l.css({
        marginLeft: `${b}px`
      }) : l.css({
        marginRight: `${b}px`
      }) : l.css({
        marginBottom: `${b}px`
      })), t.centerInsufficientSlides) {
        let e = 0;

        if (p.forEach(i => {
          e += i + (t.spaceBetween ? t.spaceBetween : 0);
        }), (e -= t.spaceBetween) < s) {
          const t = (s - e) / 2;
          c.forEach((e, i) => {
            c[i] = e - t;
          }), h.forEach((e, i) => {
            h[i] = e + t;
          });
        }
      }

      da.extend(e, {
        slides: l,
        snapGrid: c,
        slidesGrid: h,
        slidesSizesGrid: p
      }), d !== o && e.emit("slidesLengthChange"), c.length !== f && (e.params.watchOverflow && e.checkOverflow(), e.emit("snapGridLengthChange")), h.length !== g && e.emit("slidesGridLengthChange"), (t.watchSlidesProgress || t.watchSlidesVisibility) && e.updateSlidesOffset();
    },
    updateAutoHeight: function (e) {
      const t = this,
            i = [];
      let s,
          a = 0;
      if ("number" == typeof e ? t.setTransition(e) : !0 === e && t.setTransition(t.params.speed), "auto" !== t.params.slidesPerView && t.params.slidesPerView > 1) for (s = 0; s < Math.ceil(t.params.slidesPerView); s += 1) {
        const e = t.activeIndex + s;
        if (e > t.slides.length) break;
        i.push(t.slides.eq(e)[0]);
      } else i.push(t.slides.eq(t.activeIndex)[0]);

      for (s = 0; s < i.length; s += 1) if (void 0 !== i[s]) {
        const e = i[s].offsetHeight;
        a = e > a ? e : a;
      }

      a && t.$wrapperEl.css("height", `${a}px`);
    },
    updateSlidesOffset: function () {
      const e = this,
            t = e.slides;

      for (let i = 0; i < t.length; i += 1) t[i].swiperSlideOffset = e.isHorizontal() ? t[i].offsetLeft : t[i].offsetTop;
    },
    updateSlidesProgress: function (e = this && this.translate || 0) {
      const t = this,
            i = t.params,
            {
        slides: s,
        rtlTranslate: a
      } = t;
      if (0 === s.length) return;
      void 0 === s[0].swiperSlideOffset && t.updateSlidesOffset();
      let n = -e;
      a && (n = e), s.removeClass(i.slideVisibleClass), t.visibleSlidesIndexes = [], t.visibleSlides = [];

      for (let e = 0; e < s.length; e += 1) {
        const r = s[e],
              o = (n + (i.centeredSlides ? t.minTranslate() : 0) - r.swiperSlideOffset) / (r.swiperSlideSize + i.spaceBetween);

        if (i.watchSlidesVisibility) {
          const a = -(n - r.swiperSlideOffset),
                o = a + t.slidesSizesGrid[e];
          (a >= 0 && a < t.size || o > 0 && o <= t.size || a <= 0 && o >= t.size) && (t.visibleSlides.push(r), t.visibleSlidesIndexes.push(e), s.eq(e).addClass(i.slideVisibleClass));
        }

        r.progress = a ? -o : o;
      }

      t.visibleSlides = ra(t.visibleSlides);
    },
    updateProgress: function (e = this && this.translate || 0) {
      const t = this,
            i = t.params,
            s = t.maxTranslate() - t.minTranslate();
      let {
        progress: a,
        isBeginning: n,
        isEnd: r
      } = t;
      const o = n,
            l = r;
      0 === s ? (a = 0, n = !0, r = !0) : (n = (a = (e - t.minTranslate()) / s) <= 0, r = a >= 1), da.extend(t, {
        progress: a,
        isBeginning: n,
        isEnd: r
      }), (i.watchSlidesProgress || i.watchSlidesVisibility) && t.updateSlidesProgress(e), n && !o && t.emit("reachBeginning toEdge"), r && !l && t.emit("reachEnd toEdge"), (o && !n || l && !r) && t.emit("fromEdge"), t.emit("progress", a);
    },
    updateSlidesClasses: function () {
      const e = this,
            {
        slides: t,
        params: i,
        $wrapperEl: s,
        activeIndex: a,
        realIndex: n
      } = e,
            r = e.virtual && i.virtual.enabled;
      let o;
      t.removeClass(`${i.slideActiveClass} ${i.slideNextClass} ${i.slidePrevClass} ${i.slideDuplicateActiveClass} ${i.slideDuplicateNextClass} ${i.slideDuplicatePrevClass}`), (o = r ? e.$wrapperEl.find(`.${i.slideClass}[data-swiper-slide-index="${a}"]`) : t.eq(a)).addClass(i.slideActiveClass), i.loop && (o.hasClass(i.slideDuplicateClass) ? s.children(`.${i.slideClass}:not(.${i.slideDuplicateClass})[data-swiper-slide-index="${n}"]`).addClass(i.slideDuplicateActiveClass) : s.children(`.${i.slideClass}.${i.slideDuplicateClass}[data-swiper-slide-index="${n}"]`).addClass(i.slideDuplicateActiveClass));
      let l = o.nextAll(`.${i.slideClass}`).eq(0).addClass(i.slideNextClass);
      i.loop && 0 === l.length && (l = t.eq(0)).addClass(i.slideNextClass);
      let d = o.prevAll(`.${i.slideClass}`).eq(0).addClass(i.slidePrevClass);
      i.loop && 0 === d.length && (d = t.eq(-1)).addClass(i.slidePrevClass), i.loop && (l.hasClass(i.slideDuplicateClass) ? s.children(`.${i.slideClass}:not(.${i.slideDuplicateClass})[data-swiper-slide-index="${l.attr("data-swiper-slide-index")}"]`).addClass(i.slideDuplicateNextClass) : s.children(`.${i.slideClass}.${i.slideDuplicateClass}[data-swiper-slide-index="${l.attr("data-swiper-slide-index")}"]`).addClass(i.slideDuplicateNextClass), d.hasClass(i.slideDuplicateClass) ? s.children(`.${i.slideClass}:not(.${i.slideDuplicateClass})[data-swiper-slide-index="${d.attr("data-swiper-slide-index")}"]`).addClass(i.slideDuplicatePrevClass) : s.children(`.${i.slideClass}.${i.slideDuplicateClass}[data-swiper-slide-index="${d.attr("data-swiper-slide-index")}"]`).addClass(i.slideDuplicatePrevClass));
    },
    updateActiveIndex: function (e) {
      const t = this,
            i = t.rtlTranslate ? t.translate : -t.translate,
            {
        slidesGrid: s,
        snapGrid: a,
        params: n,
        activeIndex: r,
        realIndex: o,
        snapIndex: l
      } = t;
      let d,
          c = e;

      if (void 0 === c) {
        for (let e = 0; e < s.length; e += 1) void 0 !== s[e + 1] ? i >= s[e] && i < s[e + 1] - (s[e + 1] - s[e]) / 2 ? c = e : i >= s[e] && i < s[e + 1] && (c = e + 1) : i >= s[e] && (c = e);

        n.normalizeSlideIndex && (c < 0 || void 0 === c) && (c = 0);
      }

      if ((d = a.indexOf(i) >= 0 ? a.indexOf(i) : Math.floor(c / n.slidesPerGroup)) >= a.length && (d = a.length - 1), c === r) return void (d !== l && (t.snapIndex = d, t.emit("snapIndexChange")));
      const h = parseInt(t.slides.eq(c).attr("data-swiper-slide-index") || c, 10);
      da.extend(t, {
        snapIndex: d,
        realIndex: h,
        previousIndex: r,
        activeIndex: c
      }), t.emit("activeIndexChange"), t.emit("snapIndexChange"), o !== h && t.emit("realIndexChange"), t.emit("slideChange");
    },
    updateClickedSlide: function (e) {
      const t = this,
            i = t.params,
            s = ra(e.target).closest(`.${i.slideClass}`)[0];
      let a = !1;
      if (s) for (let e = 0; e < t.slides.length; e += 1) t.slides[e] === s && (a = !0);
      if (!s || !a) return t.clickedSlide = void 0, void (t.clickedIndex = void 0);
      t.clickedSlide = s, t.virtual && t.params.virtual.enabled ? t.clickedIndex = parseInt(ra(s).attr("data-swiper-slide-index"), 10) : t.clickedIndex = ra(s).index(), i.slideToClickedSlide && void 0 !== t.clickedIndex && t.clickedIndex !== t.activeIndex && t.slideToClickedSlide();
    }
  };
  var ma = {
    getTranslate: function (e = this.isHorizontal() ? "x" : "y") {
      const {
        params: t,
        rtlTranslate: i,
        translate: s,
        $wrapperEl: a
      } = this;
      if (t.virtualTranslate) return i ? -s : s;
      let n = da.getTranslate(a[0], e);
      return i && (n = -n), n || 0;
    },
    setTranslate: function (e, t) {
      const i = this,
            {
        rtlTranslate: s,
        params: a,
        $wrapperEl: n,
        progress: r
      } = i;
      let o,
          l = 0,
          d = 0;
      i.isHorizontal() ? l = s ? -e : e : d = e, a.roundLengths && (l = Math.floor(l), d = Math.floor(d)), a.virtualTranslate || (ca.transforms3d ? n.transform(`translate3d(${l}px, ${d}px, 0px)`) : n.transform(`translate(${l}px, ${d}px)`)), i.previousTranslate = i.translate, i.translate = i.isHorizontal() ? l : d;
      const c = i.maxTranslate() - i.minTranslate();
      (o = 0 === c ? 0 : (e - i.minTranslate()) / c) !== r && i.updateProgress(e), i.emit("setTranslate", i.translate, t);
    },
    minTranslate: function () {
      return -this.snapGrid[0];
    },
    maxTranslate: function () {
      return -this.snapGrid[this.snapGrid.length - 1];
    }
  };
  var fa = {
    setTransition: function (e, t) {
      this.$wrapperEl.transition(e), this.emit("setTransition", e, t);
    },
    transitionStart: function (e = !0, t) {
      const i = this,
            {
        activeIndex: s,
        params: a,
        previousIndex: n
      } = i;
      a.autoHeight && i.updateAutoHeight();
      let r = t;

      if (r || (r = s > n ? "next" : s < n ? "prev" : "reset"), i.emit("transitionStart"), e && s !== n) {
        if ("reset" === r) return void i.emit("slideResetTransitionStart");
        i.emit("slideChangeTransitionStart"), "next" === r ? i.emit("slideNextTransitionStart") : i.emit("slidePrevTransitionStart");
      }
    },
    transitionEnd: function (e = !0, t) {
      const i = this,
            {
        activeIndex: s,
        previousIndex: a
      } = i;
      i.animating = !1, i.setTransition(0);
      let n = t;

      if (n || (n = s > a ? "next" : s < a ? "prev" : "reset"), i.emit("transitionEnd"), e && s !== a) {
        if ("reset" === n) return void i.emit("slideResetTransitionEnd");
        i.emit("slideChangeTransitionEnd"), "next" === n ? i.emit("slideNextTransitionEnd") : i.emit("slidePrevTransitionEnd");
      }
    }
  };
  var ga = {
    slideTo: function (e = 0, t = this.params.speed, i = !0, s) {
      const a = this;
      let n = e;
      n < 0 && (n = 0);
      const {
        params: r,
        snapGrid: o,
        slidesGrid: l,
        previousIndex: d,
        activeIndex: c,
        rtlTranslate: h
      } = a;
      if (a.animating && r.preventInteractionOnTransition) return !1;
      let p = Math.floor(n / r.slidesPerGroup);
      p >= o.length && (p = o.length - 1), (c || r.initialSlide || 0) === (d || 0) && i && a.emit("beforeSlideChangeStart");
      const u = -o[p];
      if (a.updateProgress(u), r.normalizeSlideIndex) for (let e = 0; e < l.length; e += 1) -Math.floor(100 * u) >= Math.floor(100 * l[e]) && (n = e);

      if (a.initialized && n !== c) {
        if (!a.allowSlideNext && u < a.translate && u < a.minTranslate()) return !1;
        if (!a.allowSlidePrev && u > a.translate && u > a.maxTranslate() && (c || 0) !== n) return !1;
      }

      let m;
      return m = n > c ? "next" : n < c ? "prev" : "reset", h && -u === a.translate || !h && u === a.translate ? (a.updateActiveIndex(n), r.autoHeight && a.updateAutoHeight(), a.updateSlidesClasses(), "slide" !== r.effect && a.setTranslate(u), "reset" !== m && (a.transitionStart(i, m), a.transitionEnd(i, m)), !1) : (0 !== t && ca.transition ? (a.setTransition(t), a.setTranslate(u), a.updateActiveIndex(n), a.updateSlidesClasses(), a.emit("beforeTransitionStart", t, s), a.transitionStart(i, m), a.animating || (a.animating = !0, a.onSlideToWrapperTransitionEnd || (a.onSlideToWrapperTransitionEnd = function (e) {
        a && !a.destroyed && e.target === this && (a.$wrapperEl[0].removeEventListener("transitionend", a.onSlideToWrapperTransitionEnd), a.$wrapperEl[0].removeEventListener("webkitTransitionEnd", a.onSlideToWrapperTransitionEnd), a.onSlideToWrapperTransitionEnd = null, delete a.onSlideToWrapperTransitionEnd, a.transitionEnd(i, m));
      }), a.$wrapperEl[0].addEventListener("transitionend", a.onSlideToWrapperTransitionEnd), a.$wrapperEl[0].addEventListener("webkitTransitionEnd", a.onSlideToWrapperTransitionEnd))) : (a.setTransition(0), a.setTranslate(u), a.updateActiveIndex(n), a.updateSlidesClasses(), a.emit("beforeTransitionStart", t, s), a.transitionStart(i, m), a.transitionEnd(i, m)), !0);
    },
    slideToLoop: function (e = 0, t = this.params.speed, i = !0, s) {
      const a = this;
      let n = e;
      return a.params.loop && (n += a.loopedSlides), a.slideTo(n, t, i, s);
    },
    slideNext: function (e = this.params.speed, t = !0, i) {
      const s = this,
            {
        params: a,
        animating: n
      } = s;
      return a.loop ? !n && (s.loopFix(), s._clientLeft = s.$wrapperEl[0].clientLeft, s.slideTo(s.activeIndex + a.slidesPerGroup, e, t, i)) : s.slideTo(s.activeIndex + a.slidesPerGroup, e, t, i);
    },
    slidePrev: function (e = this.params.speed, t = !0, i) {
      const s = this,
            {
        params: a,
        animating: n,
        snapGrid: r,
        slidesGrid: o,
        rtlTranslate: l
      } = s;

      if (a.loop) {
        if (n) return !1;
        s.loopFix(), s._clientLeft = s.$wrapperEl[0].clientLeft;
      }

      function d(e) {
        return e < 0 ? -Math.floor(Math.abs(e)) : Math.floor(e);
      }

      const c = d(l ? s.translate : -s.translate),
            h = r.map(e => d(e)),
            p = (o.map(e => d(e)), r[h.indexOf(c)], r[h.indexOf(c) - 1]);
      let u;
      return void 0 !== p && (u = o.indexOf(p)) < 0 && (u = s.activeIndex - 1), s.slideTo(u, e, t, i);
    },
    slideReset: function (e = this.params.speed, t = !0, i) {
      return this.slideTo(this.activeIndex, e, t, i);
    },
    slideToClosest: function (e = this.params.speed, t = !0, i) {
      const s = this;
      let a = s.activeIndex;
      const n = Math.floor(a / s.params.slidesPerGroup);

      if (n < s.snapGrid.length - 1) {
        const e = s.rtlTranslate ? s.translate : -s.translate,
              t = s.snapGrid[n];
        e - t > (s.snapGrid[n + 1] - t) / 2 && (a = s.params.slidesPerGroup);
      }

      return s.slideTo(a, e, t, i);
    },
    slideToClickedSlide: function () {
      const e = this,
            {
        params: t,
        $wrapperEl: i
      } = e,
            s = "auto" === t.slidesPerView ? e.slidesPerViewDynamic() : t.slidesPerView;
      let a,
          n = e.clickedIndex;

      if (t.loop) {
        if (e.animating) return;
        a = parseInt(ra(e.clickedSlide).attr("data-swiper-slide-index"), 10), t.centeredSlides ? n < e.loopedSlides - s / 2 || n > e.slides.length - e.loopedSlides + s / 2 ? (e.loopFix(), n = i.children(`.${t.slideClass}[data-swiper-slide-index="${a}"]:not(.${t.slideDuplicateClass})`).eq(0).index(), da.nextTick(() => {
          e.slideTo(n);
        })) : e.slideTo(n) : n > e.slides.length - s ? (e.loopFix(), n = i.children(`.${t.slideClass}[data-swiper-slide-index="${a}"]:not(.${t.slideDuplicateClass})`).eq(0).index(), da.nextTick(() => {
          e.slideTo(n);
        })) : e.slideTo(n);
      } else e.slideTo(n);
    }
  };
  var va = {
    loopCreate: function () {
      const e = this,
            {
        params: t,
        $wrapperEl: i
      } = e;
      i.children(`.${t.slideClass}.${t.slideDuplicateClass}`).remove();
      let s = i.children(`.${t.slideClass}`);

      if (t.loopFillGroupWithBlank) {
        const e = t.slidesPerGroup - s.length % t.slidesPerGroup;

        if (e !== t.slidesPerGroup) {
          for (let s = 0; s < e; s += 1) {
            const e = ra(sa.createElement("div")).addClass(`${t.slideClass} ${t.slideBlankClass}`);
            i.append(e);
          }

          s = i.children(`.${t.slideClass}`);
        }
      }

      "auto" !== t.slidesPerView || t.loopedSlides || (t.loopedSlides = s.length), e.loopedSlides = parseInt(t.loopedSlides || t.slidesPerView, 10), e.loopedSlides += t.loopAdditionalSlides, e.loopedSlides > s.length && (e.loopedSlides = s.length);
      const a = [],
            n = [];
      s.each((t, i) => {
        const r = ra(i);
        t < e.loopedSlides && n.push(i), t < s.length && t >= s.length - e.loopedSlides && a.push(i), r.attr("data-swiper-slide-index", t);
      });

      for (let e = 0; e < n.length; e += 1) i.append(ra(n[e].cloneNode(!0)).addClass(t.slideDuplicateClass));

      for (let e = a.length - 1; e >= 0; e -= 1) i.prepend(ra(a[e].cloneNode(!0)).addClass(t.slideDuplicateClass));
    },
    loopFix: function () {
      const e = this,
            {
        params: t,
        activeIndex: i,
        slides: s,
        loopedSlides: a,
        allowSlidePrev: n,
        allowSlideNext: r,
        snapGrid: o,
        rtlTranslate: l
      } = e;
      let d;
      e.allowSlidePrev = !0, e.allowSlideNext = !0;
      const c = -o[i] - e.getTranslate();
      i < a ? (d = s.length - 3 * a + i, d += a, e.slideTo(d, 0, !1, !0) && 0 !== c && e.setTranslate((l ? -e.translate : e.translate) - c)) : ("auto" === t.slidesPerView && i >= 2 * a || i >= s.length - a) && (d = -s.length + i + a, d += a, e.slideTo(d, 0, !1, !0) && 0 !== c && e.setTranslate((l ? -e.translate : e.translate) - c));
      e.allowSlidePrev = n, e.allowSlideNext = r;
    },
    loopDestroy: function () {
      const {
        $wrapperEl: e,
        params: t,
        slides: i
      } = this;
      e.children(`.${t.slideClass}.${t.slideDuplicateClass},.${t.slideClass}.${t.slideBlankClass}`).remove(), i.removeAttr("data-swiper-slide-index");
    }
  };
  var wa = {
    setGrabCursor: function (e) {
      if (ca.touch || !this.params.simulateTouch || this.params.watchOverflow && this.isLocked) return;
      const t = this.el;
      t.style.cursor = "move", t.style.cursor = e ? "-webkit-grabbing" : "-webkit-grab", t.style.cursor = e ? "-moz-grabbin" : "-moz-grab", t.style.cursor = e ? "grabbing" : "grab";
    },
    unsetGrabCursor: function () {
      ca.touch || this.params.watchOverflow && this.isLocked || (this.el.style.cursor = "");
    }
  };
  var ba = {
    appendSlide: function (e) {
      const t = this,
            {
        $wrapperEl: i,
        params: s
      } = t;
      if (s.loop && t.loopDestroy(), "object" == typeof e && "length" in e) for (let t = 0; t < e.length; t += 1) e[t] && i.append(e[t]);else i.append(e);
      s.loop && t.loopCreate(), s.observer && ca.observer || t.update();
    },
    prependSlide: function (e) {
      const t = this,
            {
        params: i,
        $wrapperEl: s,
        activeIndex: a
      } = t;
      i.loop && t.loopDestroy();
      let n = a + 1;

      if ("object" == typeof e && "length" in e) {
        for (let t = 0; t < e.length; t += 1) e[t] && s.prepend(e[t]);

        n = a + e.length;
      } else s.prepend(e);

      i.loop && t.loopCreate(), i.observer && ca.observer || t.update(), t.slideTo(n, 0, !1);
    },
    addSlide: function (e, t) {
      const i = this,
            {
        $wrapperEl: s,
        params: a,
        activeIndex: n
      } = i;
      let r = n;
      a.loop && (r -= i.loopedSlides, i.loopDestroy(), i.slides = s.children(`.${a.slideClass}`));
      const o = i.slides.length;
      if (e <= 0) return void i.prependSlide(t);
      if (e >= o) return void i.appendSlide(t);
      let l = r > e ? r + 1 : r;
      const d = [];

      for (let t = o - 1; t >= e; t -= 1) {
        const e = i.slides.eq(t);
        e.remove(), d.unshift(e);
      }

      if ("object" == typeof t && "length" in t) {
        for (let e = 0; e < t.length; e += 1) t[e] && s.append(t[e]);

        l = r > e ? r + t.length : r;
      } else s.append(t);

      for (let e = 0; e < d.length; e += 1) s.append(d[e]);

      a.loop && i.loopCreate(), a.observer && ca.observer || i.update(), a.loop ? i.slideTo(l + i.loopedSlides, 0, !1) : i.slideTo(l, 0, !1);
    },
    removeSlide: function (e) {
      const t = this,
            {
        params: i,
        $wrapperEl: s,
        activeIndex: a
      } = t;
      let n = a;
      i.loop && (n -= t.loopedSlides, t.loopDestroy(), t.slides = s.children(`.${i.slideClass}`));
      let r,
          o = n;

      if ("object" == typeof e && "length" in e) {
        for (let i = 0; i < e.length; i += 1) r = e[i], t.slides[r] && t.slides.eq(r).remove(), r < o && (o -= 1);

        o = Math.max(o, 0);
      } else r = e, t.slides[r] && t.slides.eq(r).remove(), r < o && (o -= 1), o = Math.max(o, 0);

      i.loop && t.loopCreate(), i.observer && ca.observer || t.update(), i.loop ? t.slideTo(o + t.loopedSlides, 0, !1) : t.slideTo(o, 0, !1);
    },
    removeAllSlides: function () {
      const e = this,
            t = [];

      for (let i = 0; i < e.slides.length; i += 1) t.push(i);

      e.removeSlide(t);
    }
  };

  const ya = function () {
    const e = aa.navigator.userAgent,
          t = {
      ios: !1,
      android: !1,
      androidChrome: !1,
      desktop: !1,
      windows: !1,
      iphone: !1,
      ipod: !1,
      ipad: !1,
      cordova: aa.cordova || aa.phonegap,
      phonegap: aa.cordova || aa.phonegap
    },
          i = e.match(/(Windows Phone);?[\s\/]+([\d.]+)?/),
          s = e.match(/(Android);?[\s\/]+([\d.]+)?/),
          a = e.match(/(iPad).*OS\s([\d_]+)/),
          n = e.match(/(iPod)(.*OS\s([\d_]+))?/),
          r = !a && e.match(/(iPhone\sOS|iOS)\s([\d_]+)/);

    if (i && (t.os = "windows", t.osVersion = i[2], t.windows = !0), s && !i && (t.os = "android", t.osVersion = s[2], t.android = !0, t.androidChrome = e.toLowerCase().indexOf("chrome") >= 0), (a || r || n) && (t.os = "ios", t.ios = !0), r && !n && (t.osVersion = r[2].replace(/_/g, "."), t.iphone = !0), a && (t.osVersion = a[2].replace(/_/g, "."), t.ipad = !0), n && (t.osVersion = n[3] ? n[3].replace(/_/g, ".") : null, t.iphone = !0), t.ios && t.osVersion && e.indexOf("Version/") >= 0 && "10" === t.osVersion.split(".")[0] && (t.osVersion = e.toLowerCase().split("version/")[1].split(" ")[0]), t.desktop = !(t.os || t.android || t.webView), t.webView = (r || a || n) && e.match(/.*AppleWebKit(?!.*Safari)/i), t.os && "ios" === t.os) {
      const e = t.osVersion.split("."),
            i = sa.querySelector('meta[name="viewport"]');
      t.minimalUi = !t.webView && (n || r) && (1 * e[0] == 7 ? 1 * e[1] >= 1 : 1 * e[0] > 7) && i && i.getAttribute("content").indexOf("minimal-ui") >= 0;
    }

    return t.pixelRatio = aa.devicePixelRatio || 1, t;
  }();

  function xa() {
    const e = this,
          {
      params: t,
      el: i
    } = e;
    if (i && 0 === i.offsetWidth) return;
    t.breakpoints && e.setBreakpoint();
    const {
      allowSlideNext: s,
      allowSlidePrev: a,
      snapGrid: n
    } = e;

    if (e.allowSlideNext = !0, e.allowSlidePrev = !0, e.updateSize(), e.updateSlides(), t.freeMode) {
      const i = Math.min(Math.max(e.translate, e.maxTranslate()), e.minTranslate());
      e.setTranslate(i), e.updateActiveIndex(), e.updateSlidesClasses(), t.autoHeight && e.updateAutoHeight();
    } else e.updateSlidesClasses(), ("auto" === t.slidesPerView || t.slidesPerView > 1) && e.isEnd && !e.params.centeredSlides ? e.slideTo(e.slides.length - 1, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0);

    e.allowSlidePrev = a, e.allowSlideNext = s, e.params.watchOverflow && n !== e.snapGrid && e.checkOverflow();
  }

  var _a = {
    init: !0,
    direction: "horizontal",
    touchEventsTarget: "container",
    initialSlide: 0,
    speed: 300,
    preventInteractionOnTransition: !1,
    edgeSwipeDetection: !1,
    edgeSwipeThreshold: 20,
    freeMode: !1,
    freeModeMomentum: !0,
    freeModeMomentumRatio: 1,
    freeModeMomentumBounce: !0,
    freeModeMomentumBounceRatio: 1,
    freeModeMomentumVelocityRatio: 1,
    freeModeSticky: !1,
    freeModeMinimumVelocity: .02,
    autoHeight: !1,
    setWrapperSize: !1,
    virtualTranslate: !1,
    effect: "slide",
    breakpoints: void 0,
    breakpointsInverse: !1,
    spaceBetween: 0,
    slidesPerView: 1,
    slidesPerColumn: 1,
    slidesPerColumnFill: "column",
    slidesPerGroup: 1,
    centeredSlides: !1,
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,
    normalizeSlideIndex: !0,
    centerInsufficientSlides: !1,
    watchOverflow: !1,
    roundLengths: !1,
    touchRatio: 1,
    touchAngle: 45,
    simulateTouch: !0,
    shortSwipes: !0,
    longSwipes: !0,
    longSwipesRatio: .5,
    longSwipesMs: 300,
    followFinger: !0,
    allowTouchMove: !0,
    threshold: 0,
    touchMoveStopPropagation: !0,
    touchStartPreventDefault: !0,
    touchStartForcePreventDefault: !1,
    touchReleaseOnEdges: !1,
    uniqueNavElements: !0,
    resistance: !0,
    resistanceRatio: .85,
    watchSlidesProgress: !1,
    watchSlidesVisibility: !1,
    grabCursor: !1,
    preventClicks: !0,
    preventClicksPropagation: !0,
    slideToClickedSlide: !1,
    preloadImages: !0,
    updateOnImagesReady: !0,
    loop: !1,
    loopAdditionalSlides: 0,
    loopedSlides: null,
    loopFillGroupWithBlank: !1,
    allowSlidePrev: !0,
    allowSlideNext: !0,
    swipeHandler: null,
    noSwiping: !0,
    noSwipingClass: "swiper-no-swiping",
    noSwipingSelector: null,
    passiveListeners: !0,
    containerModifierClass: "swiper-container-",
    slideClass: "swiper-slide",
    slideBlankClass: "swiper-slide-invisible-blank",
    slideActiveClass: "swiper-slide-active",
    slideDuplicateActiveClass: "swiper-slide-duplicate-active",
    slideVisibleClass: "swiper-slide-visible",
    slideDuplicateClass: "swiper-slide-duplicate",
    slideNextClass: "swiper-slide-next",
    slideDuplicateNextClass: "swiper-slide-duplicate-next",
    slidePrevClass: "swiper-slide-prev",
    slideDuplicatePrevClass: "swiper-slide-duplicate-prev",
    wrapperClass: "swiper-wrapper",
    runCallbacksOnInit: !0
  };
  const Sa = {
    update: ua,
    translate: ma,
    transition: fa,
    slide: ga,
    loop: va,
    grabCursor: wa,
    manipulation: ba,
    events: {
      attachEvents: function () {
        const e = this,
              {
          params: t,
          touchEvents: i,
          el: s,
          wrapperEl: a
        } = e;
        e.onTouchStart = function (e) {
          const t = this,
                i = t.touchEventsData,
                {
            params: s,
            touches: a
          } = t;
          if (t.animating && s.preventInteractionOnTransition) return;
          let n = e;
          if (n.originalEvent && (n = n.originalEvent), i.isTouchEvent = "touchstart" === n.type, !i.isTouchEvent && "which" in n && 3 === n.which) return;
          if (!i.isTouchEvent && "button" in n && n.button > 0) return;
          if (i.isTouched && i.isMoved) return;
          if (s.noSwiping && ra(n.target).closest(s.noSwipingSelector ? s.noSwipingSelector : `.${s.noSwipingClass}`)[0]) return void (t.allowClick = !0);
          if (s.swipeHandler && !ra(n).closest(s.swipeHandler)[0]) return;
          a.currentX = "touchstart" === n.type ? n.targetTouches[0].pageX : n.pageX, a.currentY = "touchstart" === n.type ? n.targetTouches[0].pageY : n.pageY;
          const r = a.currentX,
                o = a.currentY,
                l = s.edgeSwipeDetection || s.iOSEdgeSwipeDetection,
                d = s.edgeSwipeThreshold || s.iOSEdgeSwipeThreshold;

          if (!l || !(r <= d || r >= aa.screen.width - d)) {
            if (da.extend(i, {
              isTouched: !0,
              isMoved: !1,
              allowTouchCallbacks: !0,
              isScrolling: void 0,
              startMoving: void 0
            }), a.startX = r, a.startY = o, i.touchStartTime = da.now(), t.allowClick = !0, t.updateSize(), t.swipeDirection = void 0, s.threshold > 0 && (i.allowThresholdMove = !1), "touchstart" !== n.type) {
              let e = !0;
              ra(n.target).is(i.formElements) && (e = !1), sa.activeElement && ra(sa.activeElement).is(i.formElements) && sa.activeElement !== n.target && sa.activeElement.blur();
              const a = e && t.allowTouchMove && s.touchStartPreventDefault;
              (s.touchStartForcePreventDefault || a) && n.preventDefault();
            }

            t.emit("touchStart", n);
          }
        }.bind(e), e.onTouchMove = function (e) {
          const t = this,
                i = t.touchEventsData,
                {
            params: s,
            touches: a,
            rtlTranslate: n
          } = t;
          let r = e;
          if (r.originalEvent && (r = r.originalEvent), !i.isTouched) return void (i.startMoving && i.isScrolling && t.emit("touchMoveOpposite", r));
          if (i.isTouchEvent && "mousemove" === r.type) return;
          const o = "touchmove" === r.type ? r.targetTouches[0].pageX : r.pageX,
                l = "touchmove" === r.type ? r.targetTouches[0].pageY : r.pageY;
          if (r.preventedByNestedSwiper) return a.startX = o, void (a.startY = l);
          if (!t.allowTouchMove) return t.allowClick = !1, void (i.isTouched && (da.extend(a, {
            startX: o,
            startY: l,
            currentX: o,
            currentY: l
          }), i.touchStartTime = da.now()));
          if (i.isTouchEvent && s.touchReleaseOnEdges && !s.loop) if (t.isVertical()) {
            if (l < a.startY && t.translate <= t.maxTranslate() || l > a.startY && t.translate >= t.minTranslate()) return i.isTouched = !1, void (i.isMoved = !1);
          } else if (o < a.startX && t.translate <= t.maxTranslate() || o > a.startX && t.translate >= t.minTranslate()) return;
          if (i.isTouchEvent && sa.activeElement && r.target === sa.activeElement && ra(r.target).is(i.formElements)) return i.isMoved = !0, void (t.allowClick = !1);
          if (i.allowTouchCallbacks && t.emit("touchMove", r), r.targetTouches && r.targetTouches.length > 1) return;
          a.currentX = o, a.currentY = l;
          const d = a.currentX - a.startX,
                c = a.currentY - a.startY;
          if (t.params.threshold && Math.sqrt(d ** 2 + c ** 2) < t.params.threshold) return;

          if (void 0 === i.isScrolling) {
            let e;
            t.isHorizontal() && a.currentY === a.startY || t.isVertical() && a.currentX === a.startX ? i.isScrolling = !1 : d * d + c * c >= 25 && (e = 180 * Math.atan2(Math.abs(c), Math.abs(d)) / Math.PI, i.isScrolling = t.isHorizontal() ? e > s.touchAngle : 90 - e > s.touchAngle);
          }

          if (i.isScrolling && t.emit("touchMoveOpposite", r), void 0 === i.startMoving && (a.currentX === a.startX && a.currentY === a.startY || (i.startMoving = !0)), i.isScrolling) return void (i.isTouched = !1);
          if (!i.startMoving) return;
          t.allowClick = !1, r.preventDefault(), s.touchMoveStopPropagation && !s.nested && r.stopPropagation(), i.isMoved || (s.loop && t.loopFix(), i.startTranslate = t.getTranslate(), t.setTransition(0), t.animating && t.$wrapperEl.trigger("webkitTransitionEnd transitionend"), i.allowMomentumBounce = !1, !s.grabCursor || !0 !== t.allowSlideNext && !0 !== t.allowSlidePrev || t.setGrabCursor(!0), t.emit("sliderFirstMove", r)), t.emit("sliderMove", r), i.isMoved = !0;
          let h = t.isHorizontal() ? d : c;
          a.diff = h, h *= s.touchRatio, n && (h = -h), t.swipeDirection = h > 0 ? "prev" : "next", i.currentTranslate = h + i.startTranslate;
          let p = !0,
              u = s.resistanceRatio;

          if (s.touchReleaseOnEdges && (u = 0), h > 0 && i.currentTranslate > t.minTranslate() ? (p = !1, s.resistance && (i.currentTranslate = t.minTranslate() - 1 + (-t.minTranslate() + i.startTranslate + h) ** u)) : h < 0 && i.currentTranslate < t.maxTranslate() && (p = !1, s.resistance && (i.currentTranslate = t.maxTranslate() + 1 - (t.maxTranslate() - i.startTranslate - h) ** u)), p && (r.preventedByNestedSwiper = !0), !t.allowSlideNext && "next" === t.swipeDirection && i.currentTranslate < i.startTranslate && (i.currentTranslate = i.startTranslate), !t.allowSlidePrev && "prev" === t.swipeDirection && i.currentTranslate > i.startTranslate && (i.currentTranslate = i.startTranslate), s.threshold > 0) {
            if (!(Math.abs(h) > s.threshold || i.allowThresholdMove)) return void (i.currentTranslate = i.startTranslate);
            if (!i.allowThresholdMove) return i.allowThresholdMove = !0, a.startX = a.currentX, a.startY = a.currentY, i.currentTranslate = i.startTranslate, void (a.diff = t.isHorizontal() ? a.currentX - a.startX : a.currentY - a.startY);
          }

          s.followFinger && ((s.freeMode || s.watchSlidesProgress || s.watchSlidesVisibility) && (t.updateActiveIndex(), t.updateSlidesClasses()), s.freeMode && (0 === i.velocities.length && i.velocities.push({
            position: a[t.isHorizontal() ? "startX" : "startY"],
            time: i.touchStartTime
          }), i.velocities.push({
            position: a[t.isHorizontal() ? "currentX" : "currentY"],
            time: da.now()
          })), t.updateProgress(i.currentTranslate), t.setTranslate(i.currentTranslate));
        }.bind(e), e.onTouchEnd = function (e) {
          const t = this,
                i = t.touchEventsData,
                {
            params: s,
            touches: a,
            rtlTranslate: n,
            $wrapperEl: r,
            slidesGrid: o,
            snapGrid: l
          } = t;
          let d = e;
          if (d.originalEvent && (d = d.originalEvent), i.allowTouchCallbacks && t.emit("touchEnd", d), i.allowTouchCallbacks = !1, !i.isTouched) return i.isMoved && s.grabCursor && t.setGrabCursor(!1), i.isMoved = !1, void (i.startMoving = !1);
          s.grabCursor && i.isMoved && i.isTouched && (!0 === t.allowSlideNext || !0 === t.allowSlidePrev) && t.setGrabCursor(!1);
          const c = da.now(),
                h = c - i.touchStartTime;
          if (t.allowClick && (t.updateClickedSlide(d), t.emit("tap", d), h < 300 && c - i.lastClickTime > 300 && (i.clickTimeout && clearTimeout(i.clickTimeout), i.clickTimeout = da.nextTick(() => {
            t && !t.destroyed && t.emit("click", d);
          }, 300)), h < 300 && c - i.lastClickTime < 300 && (i.clickTimeout && clearTimeout(i.clickTimeout), t.emit("doubleTap", d))), i.lastClickTime = da.now(), da.nextTick(() => {
            t.destroyed || (t.allowClick = !0);
          }), !i.isTouched || !i.isMoved || !t.swipeDirection || 0 === a.diff || i.currentTranslate === i.startTranslate) return i.isTouched = !1, i.isMoved = !1, void (i.startMoving = !1);
          let p;

          if (i.isTouched = !1, i.isMoved = !1, i.startMoving = !1, p = s.followFinger ? n ? t.translate : -t.translate : -i.currentTranslate, s.freeMode) {
            if (p < -t.minTranslate()) return void t.slideTo(t.activeIndex);
            if (p > -t.maxTranslate()) return void (t.slides.length < l.length ? t.slideTo(l.length - 1) : t.slideTo(t.slides.length - 1));

            if (s.freeModeMomentum) {
              if (i.velocities.length > 1) {
                const e = i.velocities.pop(),
                      a = i.velocities.pop(),
                      n = e.position - a.position,
                      r = e.time - a.time;
                t.velocity = n / r, t.velocity /= 2, Math.abs(t.velocity) < s.freeModeMinimumVelocity && (t.velocity = 0), (r > 150 || da.now() - e.time > 300) && (t.velocity = 0);
              } else t.velocity = 0;

              t.velocity *= s.freeModeMomentumVelocityRatio, i.velocities.length = 0;
              let e = 1e3 * s.freeModeMomentumRatio;
              const a = t.velocity * e;
              let o = t.translate + a;
              n && (o = -o);
              let d,
                  c = !1;
              const h = 20 * Math.abs(t.velocity) * s.freeModeMomentumBounceRatio;
              let p;
              if (o < t.maxTranslate()) s.freeModeMomentumBounce ? (o + t.maxTranslate() < -h && (o = t.maxTranslate() - h), d = t.maxTranslate(), c = !0, i.allowMomentumBounce = !0) : o = t.maxTranslate(), s.loop && s.centeredSlides && (p = !0);else if (o > t.minTranslate()) s.freeModeMomentumBounce ? (o - t.minTranslate() > h && (o = t.minTranslate() + h), d = t.minTranslate(), c = !0, i.allowMomentumBounce = !0) : o = t.minTranslate(), s.loop && s.centeredSlides && (p = !0);else if (s.freeModeSticky) {
                let e;

                for (let t = 0; t < l.length; t += 1) if (l[t] > -o) {
                  e = t;
                  break;
                }

                o = -(o = Math.abs(l[e] - o) < Math.abs(l[e - 1] - o) || "next" === t.swipeDirection ? l[e] : l[e - 1]);
              }
              if (p && t.once("transitionEnd", () => {
                t.loopFix();
              }), 0 !== t.velocity) e = n ? Math.abs((-o - t.translate) / t.velocity) : Math.abs((o - t.translate) / t.velocity);else if (s.freeModeSticky) return void t.slideToClosest();
              s.freeModeMomentumBounce && c ? (t.updateProgress(d), t.setTransition(e), t.setTranslate(o), t.transitionStart(!0, t.swipeDirection), t.animating = !0, r.transitionEnd(() => {
                t && !t.destroyed && i.allowMomentumBounce && (t.emit("momentumBounce"), t.setTransition(s.speed), t.setTranslate(d), r.transitionEnd(() => {
                  t && !t.destroyed && t.transitionEnd();
                }));
              })) : t.velocity ? (t.updateProgress(o), t.setTransition(e), t.setTranslate(o), t.transitionStart(!0, t.swipeDirection), t.animating || (t.animating = !0, r.transitionEnd(() => {
                t && !t.destroyed && t.transitionEnd();
              }))) : t.updateProgress(o), t.updateActiveIndex(), t.updateSlidesClasses();
            } else if (s.freeModeSticky) return void t.slideToClosest();

            return void ((!s.freeModeMomentum || h >= s.longSwipesMs) && (t.updateProgress(), t.updateActiveIndex(), t.updateSlidesClasses()));
          }

          let u = 0,
              m = t.slidesSizesGrid[0];

          for (let e = 0; e < o.length; e += s.slidesPerGroup) void 0 !== o[e + s.slidesPerGroup] ? p >= o[e] && p < o[e + s.slidesPerGroup] && (u = e, m = o[e + s.slidesPerGroup] - o[e]) : p >= o[e] && (u = e, m = o[o.length - 1] - o[o.length - 2]);

          const f = (p - o[u]) / m;

          if (h > s.longSwipesMs) {
            if (!s.longSwipes) return void t.slideTo(t.activeIndex);
            "next" === t.swipeDirection && (f >= s.longSwipesRatio ? t.slideTo(u + s.slidesPerGroup) : t.slideTo(u)), "prev" === t.swipeDirection && (f > 1 - s.longSwipesRatio ? t.slideTo(u + s.slidesPerGroup) : t.slideTo(u));
          } else {
            if (!s.shortSwipes) return void t.slideTo(t.activeIndex);
            "next" === t.swipeDirection && t.slideTo(u + s.slidesPerGroup), "prev" === t.swipeDirection && t.slideTo(u);
          }
        }.bind(e), e.onClick = function (e) {
          const t = this;
          t.allowClick || (t.params.preventClicks && e.preventDefault(), t.params.preventClicksPropagation && t.animating && (e.stopPropagation(), e.stopImmediatePropagation()));
        }.bind(e);
        const n = "container" === t.touchEventsTarget ? s : a,
              r = !!t.nested;

        if (ca.touch || !ca.pointerEvents && !ca.prefixedPointerEvents) {
          if (ca.touch) {
            const s = !("touchstart" !== i.start || !ca.passiveListener || !t.passiveListeners) && {
              passive: !0,
              capture: !1
            };
            n.addEventListener(i.start, e.onTouchStart, s), n.addEventListener(i.move, e.onTouchMove, ca.passiveListener ? {
              passive: !1,
              capture: r
            } : r), n.addEventListener(i.end, e.onTouchEnd, s);
          }

          (t.simulateTouch && !ya.ios && !ya.android || t.simulateTouch && !ca.touch && ya.ios) && (n.addEventListener("mousedown", e.onTouchStart, !1), sa.addEventListener("mousemove", e.onTouchMove, r), sa.addEventListener("mouseup", e.onTouchEnd, !1));
        } else n.addEventListener(i.start, e.onTouchStart, !1), sa.addEventListener(i.move, e.onTouchMove, r), sa.addEventListener(i.end, e.onTouchEnd, !1);

        (t.preventClicks || t.preventClicksPropagation) && n.addEventListener("click", e.onClick, !0), e.on(ya.ios || ya.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", xa, !0);
      },
      detachEvents: function () {
        const e = this,
              {
          params: t,
          touchEvents: i,
          el: s,
          wrapperEl: a
        } = e,
              n = "container" === t.touchEventsTarget ? s : a,
              r = !!t.nested;

        if (ca.touch || !ca.pointerEvents && !ca.prefixedPointerEvents) {
          if (ca.touch) {
            const s = !("onTouchStart" !== i.start || !ca.passiveListener || !t.passiveListeners) && {
              passive: !0,
              capture: !1
            };
            n.removeEventListener(i.start, e.onTouchStart, s), n.removeEventListener(i.move, e.onTouchMove, r), n.removeEventListener(i.end, e.onTouchEnd, s);
          }

          (t.simulateTouch && !ya.ios && !ya.android || t.simulateTouch && !ca.touch && ya.ios) && (n.removeEventListener("mousedown", e.onTouchStart, !1), sa.removeEventListener("mousemove", e.onTouchMove, r), sa.removeEventListener("mouseup", e.onTouchEnd, !1));
        } else n.removeEventListener(i.start, e.onTouchStart, !1), sa.removeEventListener(i.move, e.onTouchMove, r), sa.removeEventListener(i.end, e.onTouchEnd, !1);

        (t.preventClicks || t.preventClicksPropagation) && n.removeEventListener("click", e.onClick, !0), e.off(ya.ios || ya.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", xa);
      }
    },
    breakpoints: {
      setBreakpoint: function () {
        const e = this,
              {
          activeIndex: t,
          initialized: i,
          loopedSlides: s = 0,
          params: a
        } = e,
              n = a.breakpoints;
        if (!n || n && 0 === Object.keys(n).length) return;
        const r = e.getBreakpoint(n);

        if (r && e.currentBreakpoint !== r) {
          const o = r in n ? n[r] : void 0;
          o && ["slidesPerView", "spaceBetween", "slidesPerGroup"].forEach(e => {
            const t = o[e];
            void 0 !== t && (o[e] = "slidesPerView" !== e || "AUTO" !== t && "auto" !== t ? "slidesPerView" === e ? parseFloat(t) : parseInt(t, 10) : "auto");
          });
          const l = o || e.originalParams,
                d = l.direction && l.direction !== a.direction,
                c = a.loop && (l.slidesPerView !== a.slidesPerView || d);
          d && i && e.changeDirection(), da.extend(e.params, l), da.extend(e, {
            allowTouchMove: e.params.allowTouchMove,
            allowSlideNext: e.params.allowSlideNext,
            allowSlidePrev: e.params.allowSlidePrev
          }), e.currentBreakpoint = r, c && i && (e.loopDestroy(), e.loopCreate(), e.updateSlides(), e.slideTo(t - s + e.loopedSlides, 0, !1)), e.emit("breakpoint", l);
        }
      },
      getBreakpoint: function (e) {
        const t = this;
        if (!e) return;
        let i = !1;
        const s = [];
        Object.keys(e).forEach(e => {
          s.push(e);
        }), s.sort((e, t) => parseInt(e, 10) - parseInt(t, 10));

        for (let e = 0; e < s.length; e += 1) {
          const a = s[e];
          t.params.breakpointsInverse ? a <= aa.innerWidth && (i = a) : a >= aa.innerWidth && !i && (i = a);
        }

        return i || "max";
      }
    },
    checkOverflow: {
      checkOverflow: function () {
        const e = this,
              t = e.isLocked;
        e.isLocked = 1 === e.snapGrid.length, e.allowSlideNext = !e.isLocked, e.allowSlidePrev = !e.isLocked, t !== e.isLocked && e.emit(e.isLocked ? "lock" : "unlock"), t && t !== e.isLocked && (e.isEnd = !1, e.navigation.update());
      }
    },
    classes: {
      addClasses: function () {
        const {
          classNames: e,
          params: t,
          rtl: i,
          $el: s
        } = this,
              a = [];
        a.push("initialized"), a.push(t.direction), t.freeMode && a.push("free-mode"), ca.flexbox || a.push("no-flexbox"), t.autoHeight && a.push("autoheight"), i && a.push("rtl"), t.slidesPerColumn > 1 && a.push("multirow"), ya.android && a.push("android"), ya.ios && a.push("ios"), (ha.isIE || ha.isEdge) && (ca.pointerEvents || ca.prefixedPointerEvents) && a.push(`wp8-${t.direction}`), a.forEach(i => {
          e.push(t.containerModifierClass + i);
        }), s.addClass(e.join(" "));
      },
      removeClasses: function () {
        const {
          $el: e,
          classNames: t
        } = this;
        e.removeClass(t.join(" "));
      }
    },
    images: {
      loadImage: function (e, t, i, s, a, n) {
        let r;

        function o() {
          n && n();
        }

        e.complete && a ? o() : t ? ((r = new aa.Image()).onload = o, r.onerror = o, s && (r.sizes = s), i && (r.srcset = i), t && (r.src = t)) : o();
      },
      preloadImages: function () {
        const e = this;

        function t() {
          null != e && e && !e.destroyed && (void 0 !== e.imagesLoaded && (e.imagesLoaded += 1), e.imagesLoaded === e.imagesToLoad.length && (e.params.updateOnImagesReady && e.update(), e.emit("imagesReady")));
        }

        e.imagesToLoad = e.$el.find("img");

        for (let i = 0; i < e.imagesToLoad.length; i += 1) {
          const s = e.imagesToLoad[i];
          e.loadImage(s, s.currentSrc || s.getAttribute("src"), s.srcset || s.getAttribute("srcset"), s.sizes || s.getAttribute("sizes"), !0, t);
        }
      }
    }
  },
        Ca = {};

  class Ta extends pa {
    constructor(...e) {
      let t, i;
      1 === e.length && e[0].constructor && e[0].constructor === Object ? i = e[0] : [t, i] = e, i || (i = {}), i = da.extend({}, i), t && !i.el && (i.el = t), super(i), Object.keys(Sa).forEach(e => {
        Object.keys(Sa[e]).forEach(t => {
          Ta.prototype[t] || (Ta.prototype[t] = Sa[e][t]);
        });
      });
      const s = this;
      void 0 === s.modules && (s.modules = {}), Object.keys(s.modules).forEach(e => {
        const t = s.modules[e];

        if (t.params) {
          const e = Object.keys(t.params)[0],
                s = t.params[e];
          if ("object" != typeof s || null === s) return;
          if (!(e in i && "enabled" in s)) return;
          !0 === i[e] && (i[e] = {
            enabled: !0
          }), "object" != typeof i[e] || "enabled" in i[e] || (i[e].enabled = !0), i[e] || (i[e] = {
            enabled: !1
          });
        }
      });
      const a = da.extend({}, _a);
      s.useModulesParams(a), s.params = da.extend({}, a, Ca, i), s.originalParams = da.extend({}, s.params), s.passedParams = da.extend({}, i), s.$ = ra;
      const n = ra(s.params.el);
      if (!(t = n[0])) return;

      if (n.length > 1) {
        const e = [];
        return n.each((t, s) => {
          const a = da.extend({}, i, {
            el: s
          });
          e.push(new Ta(a));
        }), e;
      }

      t.swiper = s, n.data("swiper", s);
      const r = n.children(`.${s.params.wrapperClass}`);
      return da.extend(s, {
        $el: n,
        el: t,
        $wrapperEl: r,
        wrapperEl: r[0],
        classNames: [],
        slides: ra(),
        slidesGrid: [],
        snapGrid: [],
        slidesSizesGrid: [],
        isHorizontal: () => "horizontal" === s.params.direction,
        isVertical: () => "vertical" === s.params.direction,
        rtl: "rtl" === t.dir.toLowerCase() || "rtl" === n.css("direction"),
        rtlTranslate: "horizontal" === s.params.direction && ("rtl" === t.dir.toLowerCase() || "rtl" === n.css("direction")),
        wrongRTL: "-webkit-box" === r.css("display"),
        activeIndex: 0,
        realIndex: 0,
        isBeginning: !0,
        isEnd: !1,
        translate: 0,
        previousTranslate: 0,
        progress: 0,
        velocity: 0,
        animating: !1,
        allowSlideNext: s.params.allowSlideNext,
        allowSlidePrev: s.params.allowSlidePrev,
        touchEvents: function () {
          const e = ["touchstart", "touchmove", "touchend"];
          let t = ["mousedown", "mousemove", "mouseup"];
          return ca.pointerEvents ? t = ["pointerdown", "pointermove", "pointerup"] : ca.prefixedPointerEvents && (t = ["MSPointerDown", "MSPointerMove", "MSPointerUp"]), s.touchEventsTouch = {
            start: e[0],
            move: e[1],
            end: e[2]
          }, s.touchEventsDesktop = {
            start: t[0],
            move: t[1],
            end: t[2]
          }, ca.touch || !s.params.simulateTouch ? s.touchEventsTouch : s.touchEventsDesktop;
        }(),
        touchEventsData: {
          isTouched: void 0,
          isMoved: void 0,
          allowTouchCallbacks: void 0,
          touchStartTime: void 0,
          isScrolling: void 0,
          currentTranslate: void 0,
          startTranslate: void 0,
          allowThresholdMove: void 0,
          formElements: "input, select, option, textarea, button, video",
          lastClickTime: da.now(),
          clickTimeout: void 0,
          velocities: [],
          allowMomentumBounce: void 0,
          isTouchEvent: void 0,
          startMoving: void 0
        },
        allowClick: !0,
        allowTouchMove: s.params.allowTouchMove,
        touches: {
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          diff: 0
        },
        imagesToLoad: [],
        imagesLoaded: 0
      }), s.useModules(), s.params.init && s.init(), s;
    }

    slidesPerViewDynamic() {
      const {
        params: e,
        slides: t,
        slidesGrid: i,
        size: s,
        activeIndex: a
      } = this;
      let n = 1;

      if (e.centeredSlides) {
        let e,
            i = t[a].swiperSlideSize;

        for (let r = a + 1; r < t.length; r += 1) t[r] && !e && (n += 1, (i += t[r].swiperSlideSize) > s && (e = !0));

        for (let r = a - 1; r >= 0; r -= 1) t[r] && !e && (n += 1, (i += t[r].swiperSlideSize) > s && (e = !0));
      } else for (let e = a + 1; e < t.length; e += 1) i[e] - i[a] < s && (n += 1);

      return n;
    }

    update() {
      const e = this;
      if (!e || e.destroyed) return;
      const {
        snapGrid: t,
        params: i
      } = e;

      function s() {
        const t = e.rtlTranslate ? -1 * e.translate : e.translate,
              i = Math.min(Math.max(t, e.maxTranslate()), e.minTranslate());
        e.setTranslate(i), e.updateActiveIndex(), e.updateSlidesClasses();
      }

      let a;
      i.breakpoints && e.setBreakpoint(), e.updateSize(), e.updateSlides(), e.updateProgress(), e.updateSlidesClasses(), e.params.freeMode ? (s(), e.params.autoHeight && e.updateAutoHeight()) : (a = ("auto" === e.params.slidesPerView || e.params.slidesPerView > 1) && e.isEnd && !e.params.centeredSlides ? e.slideTo(e.slides.length - 1, 0, !1, !0) : e.slideTo(e.activeIndex, 0, !1, !0)) || s(), i.watchOverflow && t !== e.snapGrid && e.checkOverflow(), e.emit("update");
    }

    changeDirection(e, t = !0) {
      const i = this,
            s = i.params.direction;
      return e || (e = "horizontal" === s ? "vertical" : "horizontal"), e === s || "horizontal" !== e && "vertical" !== e ? i : ("vertical" === s && (i.$el.removeClass(`${i.params.containerModifierClass}vertical wp8-vertical`).addClass(`${i.params.containerModifierClass}${e}`), (ha.isIE || ha.isEdge) && (ca.pointerEvents || ca.prefixedPointerEvents) && i.$el.addClass(`${i.params.containerModifierClass}wp8-${e}`)), "horizontal" === s && (i.$el.removeClass(`${i.params.containerModifierClass}horizontal wp8-horizontal`).addClass(`${i.params.containerModifierClass}${e}`), (ha.isIE || ha.isEdge) && (ca.pointerEvents || ca.prefixedPointerEvents) && i.$el.addClass(`${i.params.containerModifierClass}wp8-${e}`)), i.params.direction = e, i.slides.each((t, i) => {
        "vertical" === e ? i.style.width = "" : i.style.height = "";
      }), i.emit("changeDirection"), t && i.update(), i);
    }

    init() {
      const e = this;
      e.initialized || (e.emit("beforeInit"), e.params.breakpoints && e.setBreakpoint(), e.addClasses(), e.params.loop && e.loopCreate(), e.updateSize(), e.updateSlides(), e.params.watchOverflow && e.checkOverflow(), e.params.grabCursor && e.setGrabCursor(), e.params.preloadImages && e.preloadImages(), e.params.loop ? e.slideTo(e.params.initialSlide + e.loopedSlides, 0, e.params.runCallbacksOnInit) : e.slideTo(e.params.initialSlide, 0, e.params.runCallbacksOnInit), e.attachEvents(), e.initialized = !0, e.emit("init"));
    }

    destroy(e = !0, t = !0) {
      const i = this,
            {
        params: s,
        $el: a,
        $wrapperEl: n,
        slides: r
      } = i;
      return void 0 === i.params || i.destroyed ? null : (i.emit("beforeDestroy"), i.initialized = !1, i.detachEvents(), s.loop && i.loopDestroy(), t && (i.removeClasses(), a.removeAttr("style"), n.removeAttr("style"), r && r.length && r.removeClass([s.slideVisibleClass, s.slideActiveClass, s.slideNextClass, s.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index").removeAttr("data-swiper-column").removeAttr("data-swiper-row")), i.emit("destroy"), Object.keys(i.eventsListeners).forEach(e => {
        i.off(e);
      }), !1 !== e && (i.$el[0].swiper = null, i.$el.data("swiper", null), da.deleteProps(i)), i.destroyed = !0, null);
    }

    static extendDefaults(e) {
      da.extend(Ca, e);
    }

    static get extendedDefaults() {
      return Ca;
    }

    static get defaults() {
      return _a;
    }

    static get Class() {
      return pa;
    }

    static get $() {
      return ra;
    }

  }

  var ka = {
    name: "device",
    proto: {
      device: ya
    },
    static: {
      device: ya
    }
  },
      Ea = {
    name: "support",
    proto: {
      support: ca
    },
    static: {
      support: ca
    }
  },
      Ma = {
    name: "browser",
    proto: {
      browser: ha
    },
    static: {
      browser: ha
    }
  },
      Da = {
    name: "resize",

    create() {
      const e = this;
      da.extend(e, {
        resize: {
          resizeHandler() {
            e && !e.destroyed && e.initialized && (e.emit("beforeResize"), e.emit("resize"));
          },

          orientationChangeHandler() {
            e && !e.destroyed && e.initialized && e.emit("orientationchange");
          }

        }
      });
    },

    on: {
      init() {
        aa.addEventListener("resize", this.resize.resizeHandler), aa.addEventListener("orientationchange", this.resize.orientationChangeHandler);
      },

      destroy() {
        aa.removeEventListener("resize", this.resize.resizeHandler), aa.removeEventListener("orientationchange", this.resize.orientationChangeHandler);
      }

    }
  };
  const $a = {
    func: aa.MutationObserver || aa.WebkitMutationObserver,

    attach(e, t = {}) {
      const i = this,
            s = new (0, $a.func)(e => {
        if (1 === e.length) return void i.emit("observerUpdate", e[0]);

        const t = function () {
          i.emit("observerUpdate", e[0]);
        };

        aa.requestAnimationFrame ? aa.requestAnimationFrame(t) : aa.setTimeout(t, 0);
      });
      s.observe(e, {
        attributes: void 0 === t.attributes || t.attributes,
        childList: void 0 === t.childList || t.childList,
        characterData: void 0 === t.characterData || t.characterData
      }), i.observer.observers.push(s);
    },

    init() {
      const e = this;

      if (ca.observer && e.params.observer) {
        if (e.params.observeParents) {
          const t = e.$el.parents();

          for (let i = 0; i < t.length; i += 1) e.observer.attach(t[i]);
        }

        e.observer.attach(e.$el[0], {
          childList: e.params.observeSlideChildren
        }), e.observer.attach(e.$wrapperEl[0], {
          attributes: !1
        });
      }
    },

    destroy() {
      this.observer.observers.forEach(e => {
        e.disconnect();
      }), this.observer.observers = [];
    }

  };
  var Pa = {
    name: "observer",
    params: {
      observer: !1,
      observeParents: !1,
      observeSlideChildren: !1
    },

    create() {
      da.extend(this, {
        observer: {
          init: $a.init.bind(this),
          attach: $a.attach.bind(this),
          destroy: $a.destroy.bind(this),
          observers: []
        }
      });
    },

    on: {
      init() {
        this.observer.init();
      },

      destroy() {
        this.observer.destroy();
      }

    }
  };
  const Oa = {
    update(e) {
      const t = this,
            {
        slidesPerView: i,
        slidesPerGroup: s,
        centeredSlides: a
      } = t.params,
            {
        addSlidesBefore: n,
        addSlidesAfter: r
      } = t.params.virtual,
            {
        from: o,
        to: l,
        slides: d,
        slidesGrid: c,
        renderSlide: h,
        offset: p
      } = t.virtual;
      t.updateActiveIndex();
      const u = t.activeIndex || 0;
      let m, f, g;
      m = t.rtlTranslate ? "right" : t.isHorizontal() ? "left" : "top", a ? (f = Math.floor(i / 2) + s + n, g = Math.floor(i / 2) + s + r) : (f = i + (s - 1) + n, g = s + r);
      const v = Math.max((u || 0) - g, 0),
            w = Math.min((u || 0) + f, d.length - 1),
            b = (t.slidesGrid[v] || 0) - (t.slidesGrid[0] || 0);

      function y() {
        t.updateSlides(), t.updateProgress(), t.updateSlidesClasses(), t.lazy && t.params.lazy.enabled && t.lazy.load();
      }

      if (da.extend(t.virtual, {
        from: v,
        to: w,
        offset: b,
        slidesGrid: t.slidesGrid
      }), o === v && l === w && !e) return t.slidesGrid !== c && b !== p && t.slides.css(m, `${b}px`), void t.updateProgress();
      if (t.params.virtual.renderExternal) return t.params.virtual.renderExternal.call(t, {
        offset: b,
        from: v,
        to: w,
        slides: function () {
          const e = [];

          for (let t = v; t <= w; t += 1) e.push(d[t]);

          return e;
        }()
      }), void y();
      const x = [],
            _ = [];
      if (e) t.$wrapperEl.find(`.${t.params.slideClass}`).remove();else for (let e = o; e <= l; e += 1) (e < v || e > w) && t.$wrapperEl.find(`.${t.params.slideClass}[data-swiper-slide-index="${e}"]`).remove();

      for (let t = 0; t < d.length; t += 1) t >= v && t <= w && (void 0 === l || e ? _.push(t) : (t > l && _.push(t), t < o && x.push(t)));

      _.forEach(e => {
        t.$wrapperEl.append(h(d[e], e));
      }), x.sort((e, t) => t - e).forEach(e => {
        t.$wrapperEl.prepend(h(d[e], e));
      }), t.$wrapperEl.children(".swiper-slide").css(m, `${b}px`), y();
    },

    renderSlide(e, t) {
      const i = this,
            s = i.params.virtual;
      if (s.cache && i.virtual.cache[t]) return i.virtual.cache[t];
      const a = s.renderSlide ? ra(s.renderSlide.call(i, e, t)) : ra(`<div class="${i.params.slideClass}" data-swiper-slide-index="${t}">${e}</div>`);
      return a.attr("data-swiper-slide-index") || a.attr("data-swiper-slide-index", t), s.cache && (i.virtual.cache[t] = a), a;
    },

    appendSlide(e) {
      const t = this;
      if ("object" == typeof e && "length" in e) for (let i = 0; i < e.length; i += 1) e[i] && t.virtual.slides.push(e[i]);else t.virtual.slides.push(e);
      t.virtual.update(!0);
    },

    prependSlide(e) {
      const t = this,
            i = t.activeIndex;
      let s = i + 1,
          a = 1;

      if (Array.isArray(e)) {
        for (let i = 0; i < e.length; i += 1) e[i] && t.virtual.slides.unshift(e[i]);

        s = i + e.length, a = e.length;
      } else t.virtual.slides.unshift(e);

      if (t.params.virtual.cache) {
        const e = t.virtual.cache,
              i = {};
        Object.keys(e).forEach(t => {
          i[parseInt(t, 10) + a] = e[t];
        }), t.virtual.cache = i;
      }

      t.virtual.update(!0), t.slideTo(s, 0);
    },

    removeSlide(e) {
      const t = this;
      if (null == e) return;
      let i = t.activeIndex;
      if (Array.isArray(e)) for (let s = e.length - 1; s >= 0; s -= 1) t.virtual.slides.splice(e[s], 1), t.params.virtual.cache && delete t.virtual.cache[e[s]], e[s] < i && (i -= 1), i = Math.max(i, 0);else t.virtual.slides.splice(e, 1), t.params.virtual.cache && delete t.virtual.cache[e], e < i && (i -= 1), i = Math.max(i, 0);
      t.virtual.update(!0), t.slideTo(i, 0);
    },

    removeAllSlides() {
      const e = this;
      e.virtual.slides = [], e.params.virtual.cache && (e.virtual.cache = {}), e.virtual.update(!0), e.slideTo(0, 0);
    }

  };
  var za = {
    name: "virtual",
    params: {
      virtual: {
        enabled: !1,
        slides: [],
        cache: !0,
        renderSlide: null,
        renderExternal: null,
        addSlidesBefore: 0,
        addSlidesAfter: 0
      }
    },

    create() {
      da.extend(this, {
        virtual: {
          update: Oa.update.bind(this),
          appendSlide: Oa.appendSlide.bind(this),
          prependSlide: Oa.prependSlide.bind(this),
          removeSlide: Oa.removeSlide.bind(this),
          removeAllSlides: Oa.removeAllSlides.bind(this),
          renderSlide: Oa.renderSlide.bind(this),
          slides: this.params.virtual.slides,
          cache: {}
        }
      });
    },

    on: {
      beforeInit() {
        const e = this;
        if (!e.params.virtual.enabled) return;
        e.classNames.push(`${e.params.containerModifierClass}virtual`);
        const t = {
          watchSlidesProgress: !0
        };
        da.extend(e.params, t), da.extend(e.originalParams, t), e.params.initialSlide || e.virtual.update();
      },

      setTranslate() {
        this.params.virtual.enabled && this.virtual.update();
      }

    }
  };
  const La = {
    handle(e) {
      const t = this,
            {
        rtlTranslate: i
      } = t;
      let s = e;
      s.originalEvent && (s = s.originalEvent);
      const a = s.keyCode || s.charCode;
      if (!t.allowSlideNext && (t.isHorizontal() && 39 === a || t.isVertical() && 40 === a)) return !1;
      if (!t.allowSlidePrev && (t.isHorizontal() && 37 === a || t.isVertical() && 38 === a)) return !1;

      if (!(s.shiftKey || s.altKey || s.ctrlKey || s.metaKey || sa.activeElement && sa.activeElement.nodeName && ("input" === sa.activeElement.nodeName.toLowerCase() || "textarea" === sa.activeElement.nodeName.toLowerCase()))) {
        if (t.params.keyboard.onlyInViewport && (37 === a || 39 === a || 38 === a || 40 === a)) {
          let e = !1;
          if (t.$el.parents(`.${t.params.slideClass}`).length > 0 && 0 === t.$el.parents(`.${t.params.slideActiveClass}`).length) return;
          const s = aa.innerWidth,
                a = aa.innerHeight,
                n = t.$el.offset();
          i && (n.left -= t.$el[0].scrollLeft);
          const r = [[n.left, n.top], [n.left + t.width, n.top], [n.left, n.top + t.height], [n.left + t.width, n.top + t.height]];

          for (let t = 0; t < r.length; t += 1) {
            const i = r[t];
            i[0] >= 0 && i[0] <= s && i[1] >= 0 && i[1] <= a && (e = !0);
          }

          if (!e) return;
        }

        t.isHorizontal() ? (37 !== a && 39 !== a || (s.preventDefault ? s.preventDefault() : s.returnValue = !1), (39 === a && !i || 37 === a && i) && t.slideNext(), (37 === a && !i || 39 === a && i) && t.slidePrev()) : (38 !== a && 40 !== a || (s.preventDefault ? s.preventDefault() : s.returnValue = !1), 40 === a && t.slideNext(), 38 === a && t.slidePrev()), t.emit("keyPress", a);
      }
    },

    enable() {
      this.keyboard.enabled || (ra(sa).on("keydown", this.keyboard.handle), this.keyboard.enabled = !0);
    },

    disable() {
      this.keyboard.enabled && (ra(sa).off("keydown", this.keyboard.handle), this.keyboard.enabled = !1);
    }

  };
  var Ya = {
    name: "keyboard",
    params: {
      keyboard: {
        enabled: !1,
        onlyInViewport: !0
      }
    },

    create() {
      da.extend(this, {
        keyboard: {
          enabled: !1,
          enable: La.enable.bind(this),
          disable: La.disable.bind(this),
          handle: La.handle.bind(this)
        }
      });
    },

    on: {
      init() {
        const e = this;
        e.params.keyboard.enabled && e.keyboard.enable();
      },

      destroy() {
        const e = this;
        e.keyboard.enabled && e.keyboard.disable();
      }

    }
  };
  const Ia = {
    lastScrollTime: da.now(),
    event: aa.navigator.userAgent.indexOf("firefox") > -1 ? "DOMMouseScroll" : function () {
      let e = "onwheel" in sa;

      if (!e) {
        const t = sa.createElement("div");
        t.setAttribute("onwheel", "return;"), e = "function" == typeof t.onwheel;
      }

      return !e && sa.implementation && sa.implementation.hasFeature && !0 !== sa.implementation.hasFeature("", "") && (e = sa.implementation.hasFeature("Events.wheel", "3.0")), e;
    }() ? "wheel" : "mousewheel",

    normalize(e) {
      let t = 0,
          i = 0,
          s = 0,
          a = 0;
      return "detail" in e && (i = e.detail), "wheelDelta" in e && (i = -e.wheelDelta / 120), "wheelDeltaY" in e && (i = -e.wheelDeltaY / 120), "wheelDeltaX" in e && (t = -e.wheelDeltaX / 120), "axis" in e && e.axis === e.HORIZONTAL_AXIS && (t = i, i = 0), s = 10 * t, a = 10 * i, "deltaY" in e && (a = e.deltaY), "deltaX" in e && (s = e.deltaX), (s || a) && e.deltaMode && (1 === e.deltaMode ? (s *= 40, a *= 40) : (s *= 800, a *= 800)), s && !t && (t = s < 1 ? -1 : 1), a && !i && (i = a < 1 ? -1 : 1), {
        spinX: t,
        spinY: i,
        pixelX: s,
        pixelY: a
      };
    },

    handleMouseEnter() {
      this.mouseEntered = !0;
    },

    handleMouseLeave() {
      this.mouseEntered = !1;
    },

    handle(e) {
      let t = e;
      const i = this,
            s = i.params.mousewheel;
      if (!i.mouseEntered && !s.releaseOnEdges) return !0;
      t.originalEvent && (t = t.originalEvent);
      let a = 0;
      const n = i.rtlTranslate ? -1 : 1,
            r = Ia.normalize(t);
      if (s.forceToAxis) {
        if (i.isHorizontal()) {
          if (!(Math.abs(r.pixelX) > Math.abs(r.pixelY))) return !0;
          a = r.pixelX * n;
        } else {
          if (!(Math.abs(r.pixelY) > Math.abs(r.pixelX))) return !0;
          a = r.pixelY;
        }
      } else a = Math.abs(r.pixelX) > Math.abs(r.pixelY) ? -r.pixelX * n : -r.pixelY;
      if (0 === a) return !0;

      if (s.invert && (a = -a), i.params.freeMode) {
        i.params.loop && i.loopFix();
        let e = i.getTranslate() + a * s.sensitivity;
        const n = i.isBeginning,
              r = i.isEnd;
        if (e >= i.minTranslate() && (e = i.minTranslate()), e <= i.maxTranslate() && (e = i.maxTranslate()), i.setTransition(0), i.setTranslate(e), i.updateProgress(), i.updateActiveIndex(), i.updateSlidesClasses(), (!n && i.isBeginning || !r && i.isEnd) && i.updateSlidesClasses(), i.params.freeModeSticky && (clearTimeout(i.mousewheel.timeout), i.mousewheel.timeout = da.nextTick(() => {
          i.slideToClosest();
        }, 300)), i.emit("scroll", t), i.params.autoplay && i.params.autoplayDisableOnInteraction && i.autoplay.stop(), e === i.minTranslate() || e === i.maxTranslate()) return !0;
      } else {
        if (da.now() - i.mousewheel.lastScrollTime > 60) if (a < 0) {
          if (i.isEnd && !i.params.loop || i.animating) {
            if (s.releaseOnEdges) return !0;
          } else i.slideNext(), i.emit("scroll", t);
        } else if (i.isBeginning && !i.params.loop || i.animating) {
          if (s.releaseOnEdges) return !0;
        } else i.slidePrev(), i.emit("scroll", t);
        i.mousewheel.lastScrollTime = new aa.Date().getTime();
      }

      return t.preventDefault ? t.preventDefault() : t.returnValue = !1, !1;
    },

    enable() {
      const e = this;
      if (!Ia.event) return !1;
      if (e.mousewheel.enabled) return !1;
      let t = e.$el;
      return "container" !== e.params.mousewheel.eventsTarged && (t = ra(e.params.mousewheel.eventsTarged)), t.on("mouseenter", e.mousewheel.handleMouseEnter), t.on("mouseleave", e.mousewheel.handleMouseLeave), t.on(Ia.event, e.mousewheel.handle), e.mousewheel.enabled = !0, !0;
    },

    disable() {
      const e = this;
      if (!Ia.event) return !1;
      if (!e.mousewheel.enabled) return !1;
      let t = e.$el;
      return "container" !== e.params.mousewheel.eventsTarged && (t = ra(e.params.mousewheel.eventsTarged)), t.off(Ia.event, e.mousewheel.handle), e.mousewheel.enabled = !1, !0;
    }

  };
  const Fa = {
    update() {
      const e = this,
            t = e.params.navigation;
      if (e.params.loop) return;
      const {
        $nextEl: i,
        $prevEl: s
      } = e.navigation;
      s && s.length > 0 && (e.isBeginning ? s.addClass(t.disabledClass) : s.removeClass(t.disabledClass), s[e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"](t.lockClass)), i && i.length > 0 && (e.isEnd ? i.addClass(t.disabledClass) : i.removeClass(t.disabledClass), i[e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"](t.lockClass));
    },

    onPrevClick(e) {
      e.preventDefault(), this.isBeginning && !this.params.loop || this.slidePrev();
    },

    onNextClick(e) {
      e.preventDefault(), this.isEnd && !this.params.loop || this.slideNext();
    },

    init() {
      const e = this,
            t = e.params.navigation;
      if (!t.nextEl && !t.prevEl) return;
      let i, s;
      t.nextEl && (i = ra(t.nextEl), e.params.uniqueNavElements && "string" == typeof t.nextEl && i.length > 1 && 1 === e.$el.find(t.nextEl).length && (i = e.$el.find(t.nextEl))), t.prevEl && (s = ra(t.prevEl), e.params.uniqueNavElements && "string" == typeof t.prevEl && s.length > 1 && 1 === e.$el.find(t.prevEl).length && (s = e.$el.find(t.prevEl))), i && i.length > 0 && i.on("click", e.navigation.onNextClick), s && s.length > 0 && s.on("click", e.navigation.onPrevClick), da.extend(e.navigation, {
        $nextEl: i,
        nextEl: i && i[0],
        $prevEl: s,
        prevEl: s && s[0]
      });
    },

    destroy() {
      const e = this,
            {
        $nextEl: t,
        $prevEl: i
      } = e.navigation;
      t && t.length && (t.off("click", e.navigation.onNextClick), t.removeClass(e.params.navigation.disabledClass)), i && i.length && (i.off("click", e.navigation.onPrevClick), i.removeClass(e.params.navigation.disabledClass));
    }

  };
  const Aa = {
    update() {
      const e = this,
            t = e.rtl,
            i = e.params.pagination;
      if (!i.el || !e.pagination.el || !e.pagination.$el || 0 === e.pagination.$el.length) return;
      const s = e.virtual && e.params.virtual.enabled ? e.virtual.slides.length : e.slides.length,
            a = e.pagination.$el;
      let n;
      const r = e.params.loop ? Math.ceil((s - 2 * e.loopedSlides) / e.params.slidesPerGroup) : e.snapGrid.length;

      if (e.params.loop ? ((n = Math.ceil((e.activeIndex - e.loopedSlides) / e.params.slidesPerGroup)) > s - 1 - 2 * e.loopedSlides && (n -= s - 2 * e.loopedSlides), n > r - 1 && (n -= r), n < 0 && "bullets" !== e.params.paginationType && (n = r + n)) : n = void 0 !== e.snapIndex ? e.snapIndex : e.activeIndex || 0, "bullets" === i.type && e.pagination.bullets && e.pagination.bullets.length > 0) {
        const s = e.pagination.bullets;
        let r, o, l;
        if (i.dynamicBullets && (e.pagination.bulletSize = s.eq(0)[e.isHorizontal() ? "outerWidth" : "outerHeight"](!0), a.css(e.isHorizontal() ? "width" : "height", `${e.pagination.bulletSize * (i.dynamicMainBullets + 4)}px`), i.dynamicMainBullets > 1 && void 0 !== e.previousIndex && (e.pagination.dynamicBulletIndex += n - e.previousIndex, e.pagination.dynamicBulletIndex > i.dynamicMainBullets - 1 ? e.pagination.dynamicBulletIndex = i.dynamicMainBullets - 1 : e.pagination.dynamicBulletIndex < 0 && (e.pagination.dynamicBulletIndex = 0)), r = n - e.pagination.dynamicBulletIndex, l = ((o = r + (Math.min(s.length, i.dynamicMainBullets) - 1)) + r) / 2), s.removeClass(`${i.bulletActiveClass} ${i.bulletActiveClass}-next ${i.bulletActiveClass}-next-next ${i.bulletActiveClass}-prev ${i.bulletActiveClass}-prev-prev ${i.bulletActiveClass}-main`), a.length > 1) s.each((e, t) => {
          const s = ra(t),
                a = s.index();
          a === n && s.addClass(i.bulletActiveClass), i.dynamicBullets && (a >= r && a <= o && s.addClass(`${i.bulletActiveClass}-main`), a === r && s.prev().addClass(`${i.bulletActiveClass}-prev`).prev().addClass(`${i.bulletActiveClass}-prev-prev`), a === o && s.next().addClass(`${i.bulletActiveClass}-next`).next().addClass(`${i.bulletActiveClass}-next-next`));
        });else {
          if (s.eq(n).addClass(i.bulletActiveClass), i.dynamicBullets) {
            const e = s.eq(r),
                  t = s.eq(o);

            for (let e = r; e <= o; e += 1) s.eq(e).addClass(`${i.bulletActiveClass}-main`);

            e.prev().addClass(`${i.bulletActiveClass}-prev`).prev().addClass(`${i.bulletActiveClass}-prev-prev`), t.next().addClass(`${i.bulletActiveClass}-next`).next().addClass(`${i.bulletActiveClass}-next-next`);
          }
        }

        if (i.dynamicBullets) {
          const a = Math.min(s.length, i.dynamicMainBullets + 4),
                n = (e.pagination.bulletSize * a - e.pagination.bulletSize) / 2 - l * e.pagination.bulletSize,
                r = t ? "right" : "left";
          s.css(e.isHorizontal() ? r : "top", `${n}px`);
        }
      }

      if ("fraction" === i.type && (a.find(`.${i.currentClass}`).text(i.formatFractionCurrent(n + 1)), a.find(`.${i.totalClass}`).text(i.formatFractionTotal(r))), "progressbar" === i.type) {
        let t;
        t = i.progressbarOpposite ? e.isHorizontal() ? "vertical" : "horizontal" : e.isHorizontal() ? "horizontal" : "vertical";
        const s = (n + 1) / r;
        let o = 1,
            l = 1;
        "horizontal" === t ? o = s : l = s, a.find(`.${i.progressbarFillClass}`).transform(`translate3d(0,0,0) scaleX(${o}) scaleY(${l})`).transition(e.params.speed);
      }

      "custom" === i.type && i.renderCustom ? (a.html(i.renderCustom(e, n + 1, r)), e.emit("paginationRender", e, a[0])) : e.emit("paginationUpdate", e, a[0]), a[e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"](i.lockClass);
    },

    render() {
      const e = this,
            t = e.params.pagination;
      if (!t.el || !e.pagination.el || !e.pagination.$el || 0 === e.pagination.$el.length) return;
      const i = e.virtual && e.params.virtual.enabled ? e.virtual.slides.length : e.slides.length,
            s = e.pagination.$el;
      let a = "";

      if ("bullets" === t.type) {
        const n = e.params.loop ? Math.ceil((i - 2 * e.loopedSlides) / e.params.slidesPerGroup) : e.snapGrid.length;

        for (let i = 0; i < n; i += 1) t.renderBullet ? a += t.renderBullet.call(e, i, t.bulletClass) : a += `<${t.bulletElement} class="${t.bulletClass}"></${t.bulletElement}>`;

        s.html(a), e.pagination.bullets = s.find(`.${t.bulletClass}`);
      }

      "fraction" === t.type && (a = t.renderFraction ? t.renderFraction.call(e, t.currentClass, t.totalClass) : `<span class="${t.currentClass}"></span>` + " / " + `<span class="${t.totalClass}"></span>`, s.html(a)), "progressbar" === t.type && (a = t.renderProgressbar ? t.renderProgressbar.call(e, t.progressbarFillClass) : `<span class="${t.progressbarFillClass}"></span>`, s.html(a)), "custom" !== t.type && e.emit("paginationRender", e.pagination.$el[0]);
    },

    init() {
      const e = this,
            t = e.params.pagination;
      if (!t.el) return;
      let i = ra(t.el);
      0 !== i.length && (e.params.uniqueNavElements && "string" == typeof t.el && i.length > 1 && 1 === e.$el.find(t.el).length && (i = e.$el.find(t.el)), "bullets" === t.type && t.clickable && i.addClass(t.clickableClass), i.addClass(t.modifierClass + t.type), "bullets" === t.type && t.dynamicBullets && (i.addClass(`${t.modifierClass}${t.type}-dynamic`), e.pagination.dynamicBulletIndex = 0, t.dynamicMainBullets < 1 && (t.dynamicMainBullets = 1)), "progressbar" === t.type && t.progressbarOpposite && i.addClass(t.progressbarOppositeClass), t.clickable && i.on("click", `.${t.bulletClass}`, function (t) {
        t.preventDefault();
        let i = ra(this).index() * e.params.slidesPerGroup;
        e.params.loop && (i += e.loopedSlides), e.slideTo(i);
      }), da.extend(e.pagination, {
        $el: i,
        el: i[0]
      }));
    },

    destroy() {
      const e = this.params.pagination;
      if (!e.el || !this.pagination.el || !this.pagination.$el || 0 === this.pagination.$el.length) return;
      const t = this.pagination.$el;
      t.removeClass(e.hiddenClass), t.removeClass(e.modifierClass + e.type), this.pagination.bullets && this.pagination.bullets.removeClass(e.bulletActiveClass), e.clickable && t.off("click", `.${e.bulletClass}`);
    }

  };
  const Na = {
    setTranslate() {
      const e = this;
      if (!e.params.scrollbar.el || !e.scrollbar.el) return;
      const {
        scrollbar: t,
        rtlTranslate: i,
        progress: s
      } = e,
            {
        dragSize: a,
        trackSize: n,
        $dragEl: r,
        $el: o
      } = t,
            l = e.params.scrollbar;
      let d = a,
          c = (n - a) * s;
      i ? (c = -c) > 0 ? (d = a - c, c = 0) : -c + a > n && (d = n + c) : c < 0 ? (d = a + c, c = 0) : c + a > n && (d = n - c), e.isHorizontal() ? (ca.transforms3d ? r.transform(`translate3d(${c}px, 0, 0)`) : r.transform(`translateX(${c}px)`), r[0].style.width = `${d}px`) : (ca.transforms3d ? r.transform(`translate3d(0px, ${c}px, 0)`) : r.transform(`translateY(${c}px)`), r[0].style.height = `${d}px`), l.hide && (clearTimeout(e.scrollbar.timeout), o[0].style.opacity = 1, e.scrollbar.timeout = setTimeout(() => {
        o[0].style.opacity = 0, o.transition(400);
      }, 1e3));
    },

    setTransition(e) {
      this.params.scrollbar.el && this.scrollbar.el && this.scrollbar.$dragEl.transition(e);
    },

    updateSize() {
      const e = this;
      if (!e.params.scrollbar.el || !e.scrollbar.el) return;
      const {
        scrollbar: t
      } = e,
            {
        $dragEl: i,
        $el: s
      } = t;
      i[0].style.width = "", i[0].style.height = "";
      const a = e.isHorizontal() ? s[0].offsetWidth : s[0].offsetHeight,
            n = e.size / e.virtualSize,
            r = n * (a / e.size);
      let o;
      o = "auto" === e.params.scrollbar.dragSize ? a * n : parseInt(e.params.scrollbar.dragSize, 10), e.isHorizontal() ? i[0].style.width = `${o}px` : i[0].style.height = `${o}px`, s[0].style.display = n >= 1 ? "none" : "", e.params.scrollbar.hide && (s[0].style.opacity = 0), da.extend(t, {
        trackSize: a,
        divider: n,
        moveDivider: r,
        dragSize: o
      }), t.$el[e.params.watchOverflow && e.isLocked ? "addClass" : "removeClass"](e.params.scrollbar.lockClass);
    },

    setDragPosition(e) {
      const {
        scrollbar: t,
        rtlTranslate: i
      } = this,
            {
        $el: s,
        dragSize: a,
        trackSize: n
      } = t;
      let r, o;
      o = ((r = this.isHorizontal() ? "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX || e.clientX : "touchstart" === e.type || "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY || e.clientY) - s.offset()[this.isHorizontal() ? "left" : "top"] - a / 2) / (n - a), o = Math.max(Math.min(o, 1), 0), i && (o = 1 - o);
      const l = this.minTranslate() + (this.maxTranslate() - this.minTranslate()) * o;
      this.updateProgress(l), this.setTranslate(l), this.updateActiveIndex(), this.updateSlidesClasses();
    },

    onDragStart(e) {
      const t = this.params.scrollbar,
            {
        scrollbar: i,
        $wrapperEl: s
      } = this,
            {
        $el: a,
        $dragEl: n
      } = i;
      this.scrollbar.isTouched = !0, e.preventDefault(), e.stopPropagation(), s.transition(100), n.transition(100), i.setDragPosition(e), clearTimeout(this.scrollbar.dragTimeout), a.transition(0), t.hide && a.css("opacity", 1), this.emit("scrollbarDragStart", e);
    },

    onDragMove(e) {
      const {
        scrollbar: t,
        $wrapperEl: i
      } = this,
            {
        $el: s,
        $dragEl: a
      } = t;
      this.scrollbar.isTouched && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, t.setDragPosition(e), i.transition(0), s.transition(0), a.transition(0), this.emit("scrollbarDragMove", e));
    },

    onDragEnd(e) {
      const t = this,
            i = t.params.scrollbar,
            {
        scrollbar: s
      } = t,
            {
        $el: a
      } = s;
      t.scrollbar.isTouched && (t.scrollbar.isTouched = !1, i.hide && (clearTimeout(t.scrollbar.dragTimeout), t.scrollbar.dragTimeout = da.nextTick(() => {
        a.css("opacity", 0), a.transition(400);
      }, 1e3)), t.emit("scrollbarDragEnd", e), i.snapOnRelease && t.slideToClosest());
    },

    enableDraggable() {
      const e = this;
      if (!e.params.scrollbar.el) return;
      const {
        scrollbar: t,
        touchEventsTouch: i,
        touchEventsDesktop: s,
        params: a
      } = e,
            n = t.$el[0],
            r = !(!ca.passiveListener || !a.passiveListeners) && {
        passive: !1,
        capture: !1
      },
            o = !(!ca.passiveListener || !a.passiveListeners) && {
        passive: !0,
        capture: !1
      };
      ca.touch ? (n.addEventListener(i.start, e.scrollbar.onDragStart, r), n.addEventListener(i.move, e.scrollbar.onDragMove, r), n.addEventListener(i.end, e.scrollbar.onDragEnd, o)) : (n.addEventListener(s.start, e.scrollbar.onDragStart, r), sa.addEventListener(s.move, e.scrollbar.onDragMove, r), sa.addEventListener(s.end, e.scrollbar.onDragEnd, o));
    },

    disableDraggable() {
      const e = this;
      if (!e.params.scrollbar.el) return;
      const {
        scrollbar: t,
        touchEventsTouch: i,
        touchEventsDesktop: s,
        params: a
      } = e,
            n = t.$el[0],
            r = !(!ca.passiveListener || !a.passiveListeners) && {
        passive: !1,
        capture: !1
      },
            o = !(!ca.passiveListener || !a.passiveListeners) && {
        passive: !0,
        capture: !1
      };
      ca.touch ? (n.removeEventListener(i.start, e.scrollbar.onDragStart, r), n.removeEventListener(i.move, e.scrollbar.onDragMove, r), n.removeEventListener(i.end, e.scrollbar.onDragEnd, o)) : (n.removeEventListener(s.start, e.scrollbar.onDragStart, r), sa.removeEventListener(s.move, e.scrollbar.onDragMove, r), sa.removeEventListener(s.end, e.scrollbar.onDragEnd, o));
    },

    init() {
      const e = this;
      if (!e.params.scrollbar.el) return;
      const {
        scrollbar: t,
        $el: i
      } = e,
            s = e.params.scrollbar;
      let a = ra(s.el);
      e.params.uniqueNavElements && "string" == typeof s.el && a.length > 1 && 1 === i.find(s.el).length && (a = i.find(s.el));
      let n = a.find(`.${e.params.scrollbar.dragClass}`);
      0 === n.length && (n = ra(`<div class="${e.params.scrollbar.dragClass}"></div>`), a.append(n)), da.extend(t, {
        $el: a,
        el: a[0],
        $dragEl: n,
        dragEl: n[0]
      }), s.draggable && t.enableDraggable();
    },

    destroy() {
      this.scrollbar.disableDraggable();
    }

  };
  const Ha = {
    setTransform(e, t) {
      const {
        rtl: i
      } = this,
            s = ra(e),
            a = i ? -1 : 1,
            n = s.attr("data-swiper-parallax") || "0";
      let r = s.attr("data-swiper-parallax-x"),
          o = s.attr("data-swiper-parallax-y");
      const l = s.attr("data-swiper-parallax-scale"),
            d = s.attr("data-swiper-parallax-opacity");

      if (r || o ? (r = r || "0", o = o || "0") : this.isHorizontal() ? (r = n, o = "0") : (o = n, r = "0"), r = r.indexOf("%") >= 0 ? `${parseInt(r, 10) * t * a}%` : `${r * t * a}px`, o = o.indexOf("%") >= 0 ? `${parseInt(o, 10) * t}%` : `${o * t}px`, null != d) {
        const e = d - (d - 1) * (1 - Math.abs(t));
        s[0].style.opacity = e;
      }

      if (null == l) s.transform(`translate3d(${r}, ${o}, 0px)`);else {
        const e = l - (l - 1) * (1 - Math.abs(t));
        s.transform(`translate3d(${r}, ${o}, 0px) scale(${e})`);
      }
    },

    setTranslate() {
      const e = this,
            {
        $el: t,
        slides: i,
        progress: s,
        snapGrid: a
      } = e;
      t.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each((t, i) => {
        e.parallax.setTransform(i, s);
      }), i.each((t, i) => {
        let n = i.progress;
        e.params.slidesPerGroup > 1 && "auto" !== e.params.slidesPerView && (n += Math.ceil(t / 2) - s * (a.length - 1)), n = Math.min(Math.max(n, -1), 1), ra(i).find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each((t, i) => {
          e.parallax.setTransform(i, n);
        });
      });
    },

    setTransition(e = this.params.speed) {
      const {
        $el: t
      } = this;
      t.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y]").each((t, i) => {
        const s = ra(i);
        let a = parseInt(s.attr("data-swiper-parallax-duration"), 10) || e;
        0 === e && (a = 0), s.transition(a);
      });
    }

  };
  const Va = {
    getDistanceBetweenTouches(e) {
      if (e.targetTouches.length < 2) return 1;
      const t = e.targetTouches[0].pageX,
            i = e.targetTouches[0].pageY,
            s = e.targetTouches[1].pageX,
            a = e.targetTouches[1].pageY;
      return Math.sqrt((s - t) ** 2 + (a - i) ** 2);
    },

    onGestureStart(e) {
      const t = this,
            i = t.params.zoom,
            s = t.zoom,
            {
        gesture: a
      } = s;

      if (s.fakeGestureTouched = !1, s.fakeGestureMoved = !1, !ca.gestures) {
        if ("touchstart" !== e.type || "touchstart" === e.type && e.targetTouches.length < 2) return;
        s.fakeGestureTouched = !0, a.scaleStart = Va.getDistanceBetweenTouches(e);
      }

      a.$slideEl && a.$slideEl.length || (a.$slideEl = ra(e.target).closest(".swiper-slide"), 0 === a.$slideEl.length && (a.$slideEl = t.slides.eq(t.activeIndex)), a.$imageEl = a.$slideEl.find("img, svg, canvas"), a.$imageWrapEl = a.$imageEl.parent(`.${i.containerClass}`), a.maxRatio = a.$imageWrapEl.attr("data-swiper-zoom") || i.maxRatio, 0 !== a.$imageWrapEl.length) ? (a.$imageEl.transition(0), t.zoom.isScaling = !0) : a.$imageEl = void 0;
    },

    onGestureChange(e) {
      const t = this.params.zoom,
            i = this.zoom,
            {
        gesture: s
      } = i;

      if (!ca.gestures) {
        if ("touchmove" !== e.type || "touchmove" === e.type && e.targetTouches.length < 2) return;
        i.fakeGestureMoved = !0, s.scaleMove = Va.getDistanceBetweenTouches(e);
      }

      s.$imageEl && 0 !== s.$imageEl.length && (ca.gestures ? i.scale = e.scale * i.currentScale : i.scale = s.scaleMove / s.scaleStart * i.currentScale, i.scale > s.maxRatio && (i.scale = s.maxRatio - 1 + (i.scale - s.maxRatio + 1) ** .5), i.scale < t.minRatio && (i.scale = t.minRatio + 1 - (t.minRatio - i.scale + 1) ** .5), s.$imageEl.transform(`translate3d(0,0,0) scale(${i.scale})`));
    },

    onGestureEnd(e) {
      const t = this.params.zoom,
            i = this.zoom,
            {
        gesture: s
      } = i;

      if (!ca.gestures) {
        if (!i.fakeGestureTouched || !i.fakeGestureMoved) return;
        if ("touchend" !== e.type || "touchend" === e.type && e.changedTouches.length < 2 && !ya.android) return;
        i.fakeGestureTouched = !1, i.fakeGestureMoved = !1;
      }

      s.$imageEl && 0 !== s.$imageEl.length && (i.scale = Math.max(Math.min(i.scale, s.maxRatio), t.minRatio), s.$imageEl.transition(this.params.speed).transform(`translate3d(0,0,0) scale(${i.scale})`), i.currentScale = i.scale, i.isScaling = !1, 1 === i.scale && (s.$slideEl = void 0));
    },

    onTouchStart(e) {
      const t = this.zoom,
            {
        gesture: i,
        image: s
      } = t;
      i.$imageEl && 0 !== i.$imageEl.length && (s.isTouched || (ya.android && e.preventDefault(), s.isTouched = !0, s.touchesStart.x = "touchstart" === e.type ? e.targetTouches[0].pageX : e.pageX, s.touchesStart.y = "touchstart" === e.type ? e.targetTouches[0].pageY : e.pageY));
    },

    onTouchMove(e) {
      const t = this,
            i = t.zoom,
            {
        gesture: s,
        image: a,
        velocity: n
      } = i;
      if (!s.$imageEl || 0 === s.$imageEl.length) return;
      if (t.allowClick = !1, !a.isTouched || !s.$slideEl) return;
      a.isMoved || (a.width = s.$imageEl[0].offsetWidth, a.height = s.$imageEl[0].offsetHeight, a.startX = da.getTranslate(s.$imageWrapEl[0], "x") || 0, a.startY = da.getTranslate(s.$imageWrapEl[0], "y") || 0, s.slideWidth = s.$slideEl[0].offsetWidth, s.slideHeight = s.$slideEl[0].offsetHeight, s.$imageWrapEl.transition(0), t.rtl && (a.startX = -a.startX, a.startY = -a.startY));
      const r = a.width * i.scale,
            o = a.height * i.scale;

      if (!(r < s.slideWidth && o < s.slideHeight)) {
        if (a.minX = Math.min(s.slideWidth / 2 - r / 2, 0), a.maxX = -a.minX, a.minY = Math.min(s.slideHeight / 2 - o / 2, 0), a.maxY = -a.minY, a.touchesCurrent.x = "touchmove" === e.type ? e.targetTouches[0].pageX : e.pageX, a.touchesCurrent.y = "touchmove" === e.type ? e.targetTouches[0].pageY : e.pageY, !a.isMoved && !i.isScaling) {
          if (t.isHorizontal() && (Math.floor(a.minX) === Math.floor(a.startX) && a.touchesCurrent.x < a.touchesStart.x || Math.floor(a.maxX) === Math.floor(a.startX) && a.touchesCurrent.x > a.touchesStart.x)) return void (a.isTouched = !1);
          if (!t.isHorizontal() && (Math.floor(a.minY) === Math.floor(a.startY) && a.touchesCurrent.y < a.touchesStart.y || Math.floor(a.maxY) === Math.floor(a.startY) && a.touchesCurrent.y > a.touchesStart.y)) return void (a.isTouched = !1);
        }

        e.preventDefault(), e.stopPropagation(), a.isMoved = !0, a.currentX = a.touchesCurrent.x - a.touchesStart.x + a.startX, a.currentY = a.touchesCurrent.y - a.touchesStart.y + a.startY, a.currentX < a.minX && (a.currentX = a.minX + 1 - (a.minX - a.currentX + 1) ** .8), a.currentX > a.maxX && (a.currentX = a.maxX - 1 + (a.currentX - a.maxX + 1) ** .8), a.currentY < a.minY && (a.currentY = a.minY + 1 - (a.minY - a.currentY + 1) ** .8), a.currentY > a.maxY && (a.currentY = a.maxY - 1 + (a.currentY - a.maxY + 1) ** .8), n.prevPositionX || (n.prevPositionX = a.touchesCurrent.x), n.prevPositionY || (n.prevPositionY = a.touchesCurrent.y), n.prevTime || (n.prevTime = Date.now()), n.x = (a.touchesCurrent.x - n.prevPositionX) / (Date.now() - n.prevTime) / 2, n.y = (a.touchesCurrent.y - n.prevPositionY) / (Date.now() - n.prevTime) / 2, Math.abs(a.touchesCurrent.x - n.prevPositionX) < 2 && (n.x = 0), Math.abs(a.touchesCurrent.y - n.prevPositionY) < 2 && (n.y = 0), n.prevPositionX = a.touchesCurrent.x, n.prevPositionY = a.touchesCurrent.y, n.prevTime = Date.now(), s.$imageWrapEl.transform(`translate3d(${a.currentX}px, ${a.currentY}px,0)`);
      }
    },

    onTouchEnd() {
      const e = this.zoom,
            {
        gesture: t,
        image: i,
        velocity: s
      } = e;
      if (!t.$imageEl || 0 === t.$imageEl.length) return;
      if (!i.isTouched || !i.isMoved) return i.isTouched = !1, void (i.isMoved = !1);
      i.isTouched = !1, i.isMoved = !1;
      let a = 300,
          n = 300;
      const r = s.x * a,
            o = i.currentX + r,
            l = s.y * n,
            d = i.currentY + l;
      0 !== s.x && (a = Math.abs((o - i.currentX) / s.x)), 0 !== s.y && (n = Math.abs((d - i.currentY) / s.y));
      const c = Math.max(a, n);
      i.currentX = o, i.currentY = d;
      const h = i.width * e.scale,
            p = i.height * e.scale;
      i.minX = Math.min(t.slideWidth / 2 - h / 2, 0), i.maxX = -i.minX, i.minY = Math.min(t.slideHeight / 2 - p / 2, 0), i.maxY = -i.minY, i.currentX = Math.max(Math.min(i.currentX, i.maxX), i.minX), i.currentY = Math.max(Math.min(i.currentY, i.maxY), i.minY), t.$imageWrapEl.transition(c).transform(`translate3d(${i.currentX}px, ${i.currentY}px,0)`);
    },

    onTransitionEnd() {
      const e = this.zoom,
            {
        gesture: t
      } = e;
      t.$slideEl && this.previousIndex !== this.activeIndex && (t.$imageEl.transform("translate3d(0,0,0) scale(1)"), t.$imageWrapEl.transform("translate3d(0,0,0)"), e.scale = 1, e.currentScale = 1, t.$slideEl = void 0, t.$imageEl = void 0, t.$imageWrapEl = void 0);
    },

    toggle(e) {
      const t = this.zoom;
      t.scale && 1 !== t.scale ? t.out() : t.in(e);
    },

    in(e) {
      const t = this,
            i = t.zoom,
            s = t.params.zoom,
            {
        gesture: a,
        image: n
      } = i;
      if (a.$slideEl || (a.$slideEl = t.clickedSlide ? ra(t.clickedSlide) : t.slides.eq(t.activeIndex), a.$imageEl = a.$slideEl.find("img, svg, canvas"), a.$imageWrapEl = a.$imageEl.parent(`.${s.containerClass}`)), !a.$imageEl || 0 === a.$imageEl.length) return;

      let r, o, l, d, c, h, p, u, m, f, g, v, w, b, y, x, _, S;

      a.$slideEl.addClass(`${s.zoomedSlideClass}`), void 0 === n.touchesStart.x && e ? (r = "touchend" === e.type ? e.changedTouches[0].pageX : e.pageX, o = "touchend" === e.type ? e.changedTouches[0].pageY : e.pageY) : (r = n.touchesStart.x, o = n.touchesStart.y), i.scale = a.$imageWrapEl.attr("data-swiper-zoom") || s.maxRatio, i.currentScale = a.$imageWrapEl.attr("data-swiper-zoom") || s.maxRatio, e ? (_ = a.$slideEl[0].offsetWidth, S = a.$slideEl[0].offsetHeight, c = (l = a.$slideEl.offset().left) + _ / 2 - r, h = (d = a.$slideEl.offset().top) + S / 2 - o, m = a.$imageEl[0].offsetWidth, f = a.$imageEl[0].offsetHeight, g = m * i.scale, v = f * i.scale, y = -(w = Math.min(_ / 2 - g / 2, 0)), x = -(b = Math.min(S / 2 - v / 2, 0)), (p = c * i.scale) < w && (p = w), p > y && (p = y), (u = h * i.scale) < b && (u = b), u > x && (u = x)) : (p = 0, u = 0), a.$imageWrapEl.transition(300).transform(`translate3d(${p}px, ${u}px,0)`), a.$imageEl.transition(300).transform(`translate3d(0,0,0) scale(${i.scale})`);
    },

    out() {
      const e = this,
            t = e.zoom,
            i = e.params.zoom,
            {
        gesture: s
      } = t;
      s.$slideEl || (s.$slideEl = e.clickedSlide ? ra(e.clickedSlide) : e.slides.eq(e.activeIndex), s.$imageEl = s.$slideEl.find("img, svg, canvas"), s.$imageWrapEl = s.$imageEl.parent(`.${i.containerClass}`)), s.$imageEl && 0 !== s.$imageEl.length && (t.scale = 1, t.currentScale = 1, s.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"), s.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"), s.$slideEl.removeClass(`${i.zoomedSlideClass}`), s.$slideEl = void 0);
    },

    enable() {
      const e = this,
            t = e.zoom;
      if (t.enabled) return;
      t.enabled = !0;
      const i = !("touchstart" !== e.touchEvents.start || !ca.passiveListener || !e.params.passiveListeners) && {
        passive: !0,
        capture: !1
      };
      ca.gestures ? (e.$wrapperEl.on("gesturestart", ".swiper-slide", t.onGestureStart, i), e.$wrapperEl.on("gesturechange", ".swiper-slide", t.onGestureChange, i), e.$wrapperEl.on("gestureend", ".swiper-slide", t.onGestureEnd, i)) : "touchstart" === e.touchEvents.start && (e.$wrapperEl.on(e.touchEvents.start, ".swiper-slide", t.onGestureStart, i), e.$wrapperEl.on(e.touchEvents.move, ".swiper-slide", t.onGestureChange, i), e.$wrapperEl.on(e.touchEvents.end, ".swiper-slide", t.onGestureEnd, i)), e.$wrapperEl.on(e.touchEvents.move, `.${e.params.zoom.containerClass}`, t.onTouchMove);
    },

    disable() {
      const e = this,
            t = e.zoom;
      if (!t.enabled) return;
      e.zoom.enabled = !1;
      const i = !("touchstart" !== e.touchEvents.start || !ca.passiveListener || !e.params.passiveListeners) && {
        passive: !0,
        capture: !1
      };
      ca.gestures ? (e.$wrapperEl.off("gesturestart", ".swiper-slide", t.onGestureStart, i), e.$wrapperEl.off("gesturechange", ".swiper-slide", t.onGestureChange, i), e.$wrapperEl.off("gestureend", ".swiper-slide", t.onGestureEnd, i)) : "touchstart" === e.touchEvents.start && (e.$wrapperEl.off(e.touchEvents.start, ".swiper-slide", t.onGestureStart, i), e.$wrapperEl.off(e.touchEvents.move, ".swiper-slide", t.onGestureChange, i), e.$wrapperEl.off(e.touchEvents.end, ".swiper-slide", t.onGestureEnd, i)), e.$wrapperEl.off(e.touchEvents.move, `.${e.params.zoom.containerClass}`, t.onTouchMove);
    }

  };
  const ja = {
    loadInSlide(e, t = !0) {
      const i = this,
            s = i.params.lazy;
      if (void 0 === e) return;
      if (0 === i.slides.length) return;
      const a = i.virtual && i.params.virtual.enabled ? i.$wrapperEl.children(`.${i.params.slideClass}[data-swiper-slide-index="${e}"]`) : i.slides.eq(e);
      let n = a.find(`.${s.elementClass}:not(.${s.loadedClass}):not(.${s.loadingClass})`);
      !a.hasClass(s.elementClass) || a.hasClass(s.loadedClass) || a.hasClass(s.loadingClass) || (n = n.add(a[0])), 0 !== n.length && n.each((e, n) => {
        const r = ra(n);
        r.addClass(s.loadingClass);
        const o = r.attr("data-background"),
              l = r.attr("data-src"),
              d = r.attr("data-srcset"),
              c = r.attr("data-sizes");
        i.loadImage(r[0], l || o, d, c, !1, () => {
          if (null != i && i && (!i || i.params) && !i.destroyed) {
            if (o ? (r.css("background-image", `url("${o}")`), r.removeAttr("data-background")) : (d && (r.attr("srcset", d), r.removeAttr("data-srcset")), c && (r.attr("sizes", c), r.removeAttr("data-sizes")), l && (r.attr("src", l), r.removeAttr("data-src"))), r.addClass(s.loadedClass).removeClass(s.loadingClass), a.find(`.${s.preloaderClass}`).remove(), i.params.loop && t) {
              const e = a.attr("data-swiper-slide-index");

              if (a.hasClass(i.params.slideDuplicateClass)) {
                const t = i.$wrapperEl.children(`[data-swiper-slide-index="${e}"]:not(.${i.params.slideDuplicateClass})`);
                i.lazy.loadInSlide(t.index(), !1);
              } else {
                const t = i.$wrapperEl.children(`.${i.params.slideDuplicateClass}[data-swiper-slide-index="${e}"]`);
                i.lazy.loadInSlide(t.index(), !1);
              }
            }

            i.emit("lazyImageReady", a[0], r[0]);
          }
        }), i.emit("lazyImageLoad", a[0], r[0]);
      });
    },

    load() {
      const e = this,
            {
        $wrapperEl: t,
        params: i,
        slides: s,
        activeIndex: a
      } = e,
            n = e.virtual && i.virtual.enabled,
            r = i.lazy;
      let o = i.slidesPerView;

      function l(e) {
        if (n) {
          if (t.children(`.${i.slideClass}[data-swiper-slide-index="${e}"]`).length) return !0;
        } else if (s[e]) return !0;

        return !1;
      }

      function d(e) {
        return n ? ra(e).attr("data-swiper-slide-index") : ra(e).index();
      }

      if ("auto" === o && (o = 0), e.lazy.initialImageLoaded || (e.lazy.initialImageLoaded = !0), e.params.watchSlidesVisibility) t.children(`.${i.slideVisibleClass}`).each((t, i) => {
        const s = n ? ra(i).attr("data-swiper-slide-index") : ra(i).index();
        e.lazy.loadInSlide(s);
      });else if (o > 1) for (let t = a; t < a + o; t += 1) l(t) && e.lazy.loadInSlide(t);else e.lazy.loadInSlide(a);
      if (r.loadPrevNext) if (o > 1 || r.loadPrevNextAmount && r.loadPrevNextAmount > 1) {
        const t = r.loadPrevNextAmount,
              i = o,
              n = Math.min(a + i + Math.max(t, i), s.length),
              d = Math.max(a - Math.max(i, t), 0);

        for (let t = a + o; t < n; t += 1) l(t) && e.lazy.loadInSlide(t);

        for (let t = d; t < a; t += 1) l(t) && e.lazy.loadInSlide(t);
      } else {
        const s = t.children(`.${i.slideNextClass}`);
        s.length > 0 && e.lazy.loadInSlide(d(s));
        const a = t.children(`.${i.slidePrevClass}`);
        a.length > 0 && e.lazy.loadInSlide(d(a));
      }
    }

  };
  const Ra = {
    LinearSpline: function (e, t) {
      const i = function () {
        let e, t, i;
        return (s, a) => {
          for (t = -1, e = s.length; e - t > 1;) s[i = e + t >> 1] <= a ? t = i : e = i;

          return e;
        };
      }();

      let s, a;
      return this.x = e, this.y = t, this.lastIndex = e.length - 1, this.interpolate = function (e) {
        return e ? (a = i(this.x, e), s = a - 1, (e - this.x[s]) * (this.y[a] - this.y[s]) / (this.x[a] - this.x[s]) + this.y[s]) : 0;
      }, this;
    },

    getInterpolateFunction(e) {
      const t = this;
      t.controller.spline || (t.controller.spline = t.params.loop ? new Ra.LinearSpline(t.slidesGrid, e.slidesGrid) : new Ra.LinearSpline(t.snapGrid, e.snapGrid));
    },

    setTranslate(e, t) {
      const i = this,
            s = i.controller.control;
      let a, n;

      function r(e) {
        const t = i.rtlTranslate ? -i.translate : i.translate;
        "slide" === i.params.controller.by && (i.controller.getInterpolateFunction(e), n = -i.controller.spline.interpolate(-t)), n && "container" !== i.params.controller.by || (a = (e.maxTranslate() - e.minTranslate()) / (i.maxTranslate() - i.minTranslate()), n = (t - i.minTranslate()) * a + e.minTranslate()), i.params.controller.inverse && (n = e.maxTranslate() - n), e.updateProgress(n), e.setTranslate(n, i), e.updateActiveIndex(), e.updateSlidesClasses();
      }

      if (Array.isArray(s)) for (let e = 0; e < s.length; e += 1) s[e] !== t && s[e] instanceof Ta && r(s[e]);else s instanceof Ta && t !== s && r(s);
    },

    setTransition(e, t) {
      const i = this,
            s = i.controller.control;
      let a;

      function n(t) {
        t.setTransition(e, i), 0 !== e && (t.transitionStart(), t.params.autoHeight && da.nextTick(() => {
          t.updateAutoHeight();
        }), t.$wrapperEl.transitionEnd(() => {
          s && (t.params.loop && "slide" === i.params.controller.by && t.loopFix(), t.transitionEnd());
        }));
      }

      if (Array.isArray(s)) for (a = 0; a < s.length; a += 1) s[a] !== t && s[a] instanceof Ta && n(s[a]);else s instanceof Ta && t !== s && n(s);
    }

  };
  const Ga = {
    makeElFocusable: e => (e.attr("tabIndex", "0"), e),
    addElRole: (e, t) => (e.attr("role", t), e),
    addElLabel: (e, t) => (e.attr("aria-label", t), e),
    disableEl: e => (e.attr("aria-disabled", !0), e),
    enableEl: e => (e.attr("aria-disabled", !1), e),

    onEnterKey(e) {
      const t = this,
            i = t.params.a11y;
      if (13 !== e.keyCode) return;
      const s = ra(e.target);
      t.navigation && t.navigation.$nextEl && s.is(t.navigation.$nextEl) && (t.isEnd && !t.params.loop || t.slideNext(), t.isEnd ? t.a11y.notify(i.lastSlideMessage) : t.a11y.notify(i.nextSlideMessage)), t.navigation && t.navigation.$prevEl && s.is(t.navigation.$prevEl) && (t.isBeginning && !t.params.loop || t.slidePrev(), t.isBeginning ? t.a11y.notify(i.firstSlideMessage) : t.a11y.notify(i.prevSlideMessage)), t.pagination && s.is(`.${t.params.pagination.bulletClass}`) && s[0].click();
    },

    notify(e) {
      const t = this.a11y.liveRegion;
      0 !== t.length && (t.html(""), t.html(e));
    },

    updateNavigation() {
      const e = this;
      if (e.params.loop) return;
      const {
        $nextEl: t,
        $prevEl: i
      } = e.navigation;
      i && i.length > 0 && (e.isBeginning ? e.a11y.disableEl(i) : e.a11y.enableEl(i)), t && t.length > 0 && (e.isEnd ? e.a11y.disableEl(t) : e.a11y.enableEl(t));
    },

    updatePagination() {
      const e = this,
            t = e.params.a11y;
      e.pagination && e.params.pagination.clickable && e.pagination.bullets && e.pagination.bullets.length && e.pagination.bullets.each((i, s) => {
        const a = ra(s);
        e.a11y.makeElFocusable(a), e.a11y.addElRole(a, "button"), e.a11y.addElLabel(a, t.paginationBulletMessage.replace(/{{index}}/, a.index() + 1));
      });
    },

    init() {
      const e = this;
      e.$el.append(e.a11y.liveRegion);
      const t = e.params.a11y;
      let i, s;
      e.navigation && e.navigation.$nextEl && (i = e.navigation.$nextEl), e.navigation && e.navigation.$prevEl && (s = e.navigation.$prevEl), i && (e.a11y.makeElFocusable(i), e.a11y.addElRole(i, "button"), e.a11y.addElLabel(i, t.nextSlideMessage), i.on("keydown", e.a11y.onEnterKey)), s && (e.a11y.makeElFocusable(s), e.a11y.addElRole(s, "button"), e.a11y.addElLabel(s, t.prevSlideMessage), s.on("keydown", e.a11y.onEnterKey)), e.pagination && e.params.pagination.clickable && e.pagination.bullets && e.pagination.bullets.length && e.pagination.$el.on("keydown", `.${e.params.pagination.bulletClass}`, e.a11y.onEnterKey);
    },

    destroy() {
      const e = this;
      let t, i;
      e.a11y.liveRegion && e.a11y.liveRegion.length > 0 && e.a11y.liveRegion.remove(), e.navigation && e.navigation.$nextEl && (t = e.navigation.$nextEl), e.navigation && e.navigation.$prevEl && (i = e.navigation.$prevEl), t && t.off("keydown", e.a11y.onEnterKey), i && i.off("keydown", e.a11y.onEnterKey), e.pagination && e.params.pagination.clickable && e.pagination.bullets && e.pagination.bullets.length && e.pagination.$el.off("keydown", `.${e.params.pagination.bulletClass}`, e.a11y.onEnterKey);
    }

  };
  const Wa = {
    init() {
      const e = this;
      if (!e.params.history) return;
      if (!aa.history || !aa.history.pushState) return e.params.history.enabled = !1, void (e.params.hashNavigation.enabled = !0);
      const t = e.history;
      t.initialized = !0, t.paths = Wa.getPathValues(), (t.paths.key || t.paths.value) && (t.scrollToSlide(0, t.paths.value, e.params.runCallbacksOnInit), e.params.history.replaceState || aa.addEventListener("popstate", e.history.setHistoryPopState));
    },

    destroy() {
      const e = this;
      e.params.history.replaceState || aa.removeEventListener("popstate", e.history.setHistoryPopState);
    },

    setHistoryPopState() {
      this.history.paths = Wa.getPathValues(), this.history.scrollToSlide(this.params.speed, this.history.paths.value, !1);
    },

    getPathValues() {
      const e = aa.location.pathname.slice(1).split("/").filter(e => "" !== e),
            t = e.length;
      return {
        key: e[t - 2],
        value: e[t - 1]
      };
    },

    setHistory(e, t) {
      if (!this.history.initialized || !this.params.history.enabled) return;
      const i = this.slides.eq(t);
      let s = Wa.slugify(i.attr("data-history"));
      aa.location.pathname.includes(e) || (s = `${e}/${s}`);
      const a = aa.history.state;
      a && a.value === s || (this.params.history.replaceState ? aa.history.replaceState({
        value: s
      }, null, s) : aa.history.pushState({
        value: s
      }, null, s));
    },

    slugify: e => e.toString().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+/, "").replace(/-+$/, ""),

    scrollToSlide(e, t, i) {
      const s = this;
      if (t) for (let a = 0, n = s.slides.length; a < n; a += 1) {
        const n = s.slides.eq(a);

        if (Wa.slugify(n.attr("data-history")) === t && !n.hasClass(s.params.slideDuplicateClass)) {
          const t = n.index();
          s.slideTo(t, e, i);
        }
      } else s.slideTo(0, e, i);
    }

  };
  const Ba = {
    onHashCange() {
      const e = this,
            t = sa.location.hash.replace("#", "");

      if (t !== e.slides.eq(e.activeIndex).attr("data-hash")) {
        const i = e.$wrapperEl.children(`.${e.params.slideClass}[data-hash="${t}"]`).index();
        if (void 0 === i) return;
        e.slideTo(i);
      }
    },

    setHash() {
      const e = this;
      if (e.hashNavigation.initialized && e.params.hashNavigation.enabled) if (e.params.hashNavigation.replaceState && aa.history && aa.history.replaceState) aa.history.replaceState(null, null, `#${e.slides.eq(e.activeIndex).attr("data-hash")}` || "");else {
        const t = e.slides.eq(e.activeIndex),
              i = t.attr("data-hash") || t.attr("data-history");
        sa.location.hash = i || "";
      }
    },

    init() {
      const e = this;
      if (!e.params.hashNavigation.enabled || e.params.history && e.params.history.enabled) return;
      e.hashNavigation.initialized = !0;
      const t = sa.location.hash.replace("#", "");

      if (t) {
        const i = 0;

        for (let s = 0, a = e.slides.length; s < a; s += 1) {
          const a = e.slides.eq(s);

          if ((a.attr("data-hash") || a.attr("data-history")) === t && !a.hasClass(e.params.slideDuplicateClass)) {
            const t = a.index();
            e.slideTo(t, i, e.params.runCallbacksOnInit, !0);
          }
        }
      }

      e.params.hashNavigation.watchState && ra(aa).on("hashchange", e.hashNavigation.onHashCange);
    },

    destroy() {
      const e = this;
      e.params.hashNavigation.watchState && ra(aa).off("hashchange", e.hashNavigation.onHashCange);
    }

  };
  const Ua = {
    run() {
      const e = this,
            t = e.slides.eq(e.activeIndex);
      let i = e.params.autoplay.delay;
      t.attr("data-swiper-autoplay") && (i = t.attr("data-swiper-autoplay") || e.params.autoplay.delay), e.autoplay.timeout = da.nextTick(() => {
        e.params.autoplay.reverseDirection ? e.params.loop ? (e.loopFix(), e.slidePrev(e.params.speed, !0, !0), e.emit("autoplay")) : e.isBeginning ? e.params.autoplay.stopOnLastSlide ? e.autoplay.stop() : (e.slideTo(e.slides.length - 1, e.params.speed, !0, !0), e.emit("autoplay")) : (e.slidePrev(e.params.speed, !0, !0), e.emit("autoplay")) : e.params.loop ? (e.loopFix(), e.slideNext(e.params.speed, !0, !0), e.emit("autoplay")) : e.isEnd ? e.params.autoplay.stopOnLastSlide ? e.autoplay.stop() : (e.slideTo(0, e.params.speed, !0, !0), e.emit("autoplay")) : (e.slideNext(e.params.speed, !0, !0), e.emit("autoplay"));
      }, i);
    },

    start() {
      return void 0 === this.autoplay.timeout && !this.autoplay.running && (this.autoplay.running = !0, this.emit("autoplayStart"), this.autoplay.run(), !0);
    },

    stop() {
      const e = this;
      return !!e.autoplay.running && void 0 !== e.autoplay.timeout && (e.autoplay.timeout && (clearTimeout(e.autoplay.timeout), e.autoplay.timeout = void 0), e.autoplay.running = !1, e.emit("autoplayStop"), !0);
    },

    pause(e) {
      const t = this;
      t.autoplay.running && (t.autoplay.paused || (t.autoplay.timeout && clearTimeout(t.autoplay.timeout), t.autoplay.paused = !0, 0 !== e && t.params.autoplay.waitForTransition ? (t.$wrapperEl[0].addEventListener("transitionend", t.autoplay.onTransitionEnd), t.$wrapperEl[0].addEventListener("webkitTransitionEnd", t.autoplay.onTransitionEnd)) : (t.autoplay.paused = !1, t.autoplay.run())));
    }

  };
  const Xa = {
    setTranslate() {
      const e = this,
            {
        slides: t
      } = e;

      for (let i = 0; i < t.length; i += 1) {
        const t = e.slides.eq(i);
        let s = -t[0].swiperSlideOffset;
        e.params.virtualTranslate || (s -= e.translate);
        let a = 0;
        e.isHorizontal() || (a = s, s = 0);
        const n = e.params.fadeEffect.crossFade ? Math.max(1 - Math.abs(t[0].progress), 0) : 1 + Math.min(Math.max(t[0].progress, -1), 0);
        t.css({
          opacity: n
        }).transform(`translate3d(${s}px, ${a}px, 0px)`);
      }
    },

    setTransition(e) {
      const t = this,
            {
        slides: i,
        $wrapperEl: s
      } = t;

      if (i.transition(e), t.params.virtualTranslate && 0 !== e) {
        let e = !1;
        i.transitionEnd(() => {
          if (e) return;
          if (!t || t.destroyed) return;
          e = !0, t.animating = !1;
          const i = ["webkitTransitionEnd", "transitionend"];

          for (let e = 0; e < i.length; e += 1) s.trigger(i[e]);
        });
      }
    }

  };
  const qa = {
    setTranslate() {
      const {
        $el: e,
        $wrapperEl: t,
        slides: i,
        width: s,
        height: a,
        rtlTranslate: n,
        size: r
      } = this,
            o = this.params.cubeEffect,
            l = this.isHorizontal(),
            d = this.virtual && this.params.virtual.enabled;
      let c,
          h = 0;
      o.shadow && (l ? (0 === (c = t.find(".swiper-cube-shadow")).length && (c = ra('<div class="swiper-cube-shadow"></div>'), t.append(c)), c.css({
        height: `${s}px`
      })) : 0 === (c = e.find(".swiper-cube-shadow")).length && (c = ra('<div class="swiper-cube-shadow"></div>'), e.append(c)));

      for (let e = 0; e < i.length; e += 1) {
        const t = i.eq(e);
        let s = e;
        d && (s = parseInt(t.attr("data-swiper-slide-index"), 10));
        let a = 90 * s,
            c = Math.floor(a / 360);
        n && (a = -a, c = Math.floor(-a / 360));
        const p = Math.max(Math.min(t[0].progress, 1), -1);
        let u = 0,
            m = 0,
            f = 0;
        s % 4 == 0 ? (u = 4 * -c * r, f = 0) : (s - 1) % 4 == 0 ? (u = 0, f = 4 * -c * r) : (s - 2) % 4 == 0 ? (u = r + 4 * c * r, f = r) : (s - 3) % 4 == 0 && (u = -r, f = 3 * r + 4 * r * c), n && (u = -u), l || (m = u, u = 0);
        const g = `rotateX(${l ? 0 : -a}deg) rotateY(${l ? a : 0}deg) translate3d(${u}px, ${m}px, ${f}px)`;

        if (p <= 1 && p > -1 && (h = 90 * s + 90 * p, n && (h = 90 * -s - 90 * p)), t.transform(g), o.slideShadows) {
          let e = l ? t.find(".swiper-slide-shadow-left") : t.find(".swiper-slide-shadow-top"),
              i = l ? t.find(".swiper-slide-shadow-right") : t.find(".swiper-slide-shadow-bottom");
          0 === e.length && (e = ra(`<div class="swiper-slide-shadow-${l ? "left" : "top"}"></div>`), t.append(e)), 0 === i.length && (i = ra(`<div class="swiper-slide-shadow-${l ? "right" : "bottom"}"></div>`), t.append(i)), e.length && (e[0].style.opacity = Math.max(-p, 0)), i.length && (i[0].style.opacity = Math.max(p, 0));
        }
      }

      if (t.css({
        "-webkit-transform-origin": `50% 50% -${r / 2}px`,
        "-moz-transform-origin": `50% 50% -${r / 2}px`,
        "-ms-transform-origin": `50% 50% -${r / 2}px`,
        "transform-origin": `50% 50% -${r / 2}px`
      }), o.shadow) if (l) c.transform(`translate3d(0px, ${s / 2 + o.shadowOffset}px, ${-s / 2}px) rotateX(90deg) rotateZ(0deg) scale(${o.shadowScale})`);else {
        const e = Math.abs(h) - 90 * Math.floor(Math.abs(h) / 90),
              t = 1.5 - (Math.sin(2 * e * Math.PI / 360) / 2 + Math.cos(2 * e * Math.PI / 360) / 2),
              i = o.shadowScale,
              s = o.shadowScale / t,
              n = o.shadowOffset;
        c.transform(`scale3d(${i}, 1, ${s}) translate3d(0px, ${a / 2 + n}px, ${-a / 2 / s}px) rotateX(-90deg)`);
      }
      const p = ha.isSafari || ha.isUiWebView ? -r / 2 : 0;
      t.transform(`translate3d(0px,0,${p}px) rotateX(${this.isHorizontal() ? 0 : h}deg) rotateY(${this.isHorizontal() ? -h : 0}deg)`);
    },

    setTransition(e) {
      const {
        $el: t,
        slides: i
      } = this;
      i.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), this.params.cubeEffect.shadow && !this.isHorizontal() && t.find(".swiper-cube-shadow").transition(e);
    }

  };
  const Za = {
    setTranslate() {
      const e = this,
            {
        slides: t,
        rtlTranslate: i
      } = e;

      for (let s = 0; s < t.length; s += 1) {
        const a = t.eq(s);
        let n = a[0].progress;
        e.params.flipEffect.limitRotation && (n = Math.max(Math.min(a[0].progress, 1), -1));
        let r = -180 * n,
            o = 0,
            l = -a[0].swiperSlideOffset,
            d = 0;

        if (e.isHorizontal() ? i && (r = -r) : (d = l, l = 0, o = -r, r = 0), a[0].style.zIndex = -Math.abs(Math.round(n)) + t.length, e.params.flipEffect.slideShadows) {
          let t = e.isHorizontal() ? a.find(".swiper-slide-shadow-left") : a.find(".swiper-slide-shadow-top"),
              i = e.isHorizontal() ? a.find(".swiper-slide-shadow-right") : a.find(".swiper-slide-shadow-bottom");
          0 === t.length && (t = ra(`<div class="swiper-slide-shadow-${e.isHorizontal() ? "left" : "top"}"></div>`), a.append(t)), 0 === i.length && (i = ra(`<div class="swiper-slide-shadow-${e.isHorizontal() ? "right" : "bottom"}"></div>`), a.append(i)), t.length && (t[0].style.opacity = Math.max(-n, 0)), i.length && (i[0].style.opacity = Math.max(n, 0));
        }

        a.transform(`translate3d(${l}px, ${d}px, 0px) rotateX(${o}deg) rotateY(${r}deg)`);
      }
    },

    setTransition(e) {
      const t = this,
            {
        slides: i,
        activeIndex: s,
        $wrapperEl: a
      } = t;

      if (i.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e), t.params.virtualTranslate && 0 !== e) {
        let e = !1;
        i.eq(s).transitionEnd(function () {
          if (e) return;
          if (!t || t.destroyed) return;
          e = !0, t.animating = !1;
          const i = ["webkitTransitionEnd", "transitionend"];

          for (let e = 0; e < i.length; e += 1) a.trigger(i[e]);
        });
      }
    }

  };
  const Ka = {
    setTranslate() {
      const {
        width: e,
        height: t,
        slides: i,
        $wrapperEl: s,
        slidesSizesGrid: a
      } = this,
            n = this.params.coverflowEffect,
            r = this.isHorizontal(),
            o = this.translate,
            l = r ? e / 2 - o : t / 2 - o,
            d = r ? n.rotate : -n.rotate,
            c = n.depth;

      for (let e = 0, t = i.length; e < t; e += 1) {
        const t = i.eq(e),
              s = a[e],
              o = (l - t[0].swiperSlideOffset - s / 2) / s * n.modifier;
        let h = r ? d * o : 0,
            p = r ? 0 : d * o,
            u = -c * Math.abs(o),
            m = r ? 0 : n.stretch * o,
            f = r ? n.stretch * o : 0;
        Math.abs(f) < .001 && (f = 0), Math.abs(m) < .001 && (m = 0), Math.abs(u) < .001 && (u = 0), Math.abs(h) < .001 && (h = 0), Math.abs(p) < .001 && (p = 0);
        const g = `translate3d(${f}px,${m}px,${u}px)  rotateX(${p}deg) rotateY(${h}deg)`;

        if (t.transform(g), t[0].style.zIndex = 1 - Math.abs(Math.round(o)), n.slideShadows) {
          let e = r ? t.find(".swiper-slide-shadow-left") : t.find(".swiper-slide-shadow-top"),
              i = r ? t.find(".swiper-slide-shadow-right") : t.find(".swiper-slide-shadow-bottom");
          0 === e.length && (e = ra(`<div class="swiper-slide-shadow-${r ? "left" : "top"}"></div>`), t.append(e)), 0 === i.length && (i = ra(`<div class="swiper-slide-shadow-${r ? "right" : "bottom"}"></div>`), t.append(i)), e.length && (e[0].style.opacity = o > 0 ? o : 0), i.length && (i[0].style.opacity = -o > 0 ? -o : 0);
        }
      }

      if (ca.pointerEvents || ca.prefixedPointerEvents) {
        s[0].style.perspectiveOrigin = `${l}px 50%`;
      }
    },

    setTransition(e) {
      this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e);
    }

  };
  const Ja = {
    init() {
      const e = this,
            {
        thumbs: t
      } = e.params,
            i = e.constructor;
      t.swiper instanceof i ? (e.thumbs.swiper = t.swiper, da.extend(e.thumbs.swiper.originalParams, {
        watchSlidesProgress: !0,
        slideToClickedSlide: !1
      }), da.extend(e.thumbs.swiper.params, {
        watchSlidesProgress: !0,
        slideToClickedSlide: !1
      })) : da.isObject(t.swiper) && (e.thumbs.swiper = new i(da.extend({}, t.swiper, {
        watchSlidesVisibility: !0,
        watchSlidesProgress: !0,
        slideToClickedSlide: !1
      })), e.thumbs.swiperCreated = !0), e.thumbs.swiper.$el.addClass(e.params.thumbs.thumbsContainerClass), e.thumbs.swiper.on("tap", e.thumbs.onThumbClick);
    },

    onThumbClick() {
      const e = this,
            t = e.thumbs.swiper;
      if (!t) return;
      const i = t.clickedIndex,
            s = t.clickedSlide;
      if (s && ra(s).hasClass(e.params.thumbs.slideThumbActiveClass)) return;
      if (null == i) return;
      let a;

      if (a = t.params.loop ? parseInt(ra(t.clickedSlide).attr("data-swiper-slide-index"), 10) : i, e.params.loop) {
        let t = e.activeIndex;
        e.slides.eq(t).hasClass(e.params.slideDuplicateClass) && (e.loopFix(), e._clientLeft = e.$wrapperEl[0].clientLeft, t = e.activeIndex);
        const i = e.slides.eq(t).prevAll(`[data-swiper-slide-index="${a}"]`).eq(0).index(),
              s = e.slides.eq(t).nextAll(`[data-swiper-slide-index="${a}"]`).eq(0).index();
        a = void 0 === i ? s : void 0 === s ? i : s - t < t - i ? s : i;
      }

      e.slideTo(a);
    },

    update(e) {
      const t = this,
            i = t.thumbs.swiper;
      if (!i) return;
      const s = "auto" === i.params.slidesPerView ? i.slidesPerViewDynamic() : i.params.slidesPerView;

      if (t.realIndex !== i.realIndex) {
        let a,
            n = i.activeIndex;

        if (i.params.loop) {
          i.slides.eq(n).hasClass(i.params.slideDuplicateClass) && (i.loopFix(), i._clientLeft = i.$wrapperEl[0].clientLeft, n = i.activeIndex);
          const e = i.slides.eq(n).prevAll(`[data-swiper-slide-index="${t.realIndex}"]`).eq(0).index(),
                s = i.slides.eq(n).nextAll(`[data-swiper-slide-index="${t.realIndex}"]`).eq(0).index();
          a = void 0 === e ? s : void 0 === s ? e : s - n == n - e ? n : s - n < n - e ? s : e;
        } else a = t.realIndex;

        i.visibleSlidesIndexes.indexOf(a) < 0 && (i.params.centeredSlides ? a = a > n ? a - Math.floor(s / 2) + 1 : a + Math.floor(s / 2) - 1 : a > n && (a = a - s + 1), i.slideTo(a, e ? 0 : void 0));
      }

      let a = 1;
      const n = t.params.thumbs.slideThumbActiveClass;
      if (t.params.slidesPerView > 1 && !t.params.centeredSlides && (a = t.params.slidesPerView), i.slides.removeClass(n), i.params.loop) for (let e = 0; e < a; e += 1) i.$wrapperEl.children(`[data-swiper-slide-index="${t.realIndex + e}"]`).addClass(n);else for (let e = 0; e < a; e += 1) i.slides.eq(t.realIndex + e).addClass(n);
    }

  };
  const Qa = [ka, Ea, Ma, Da, Pa, za, Ya, {
    name: "mousewheel",
    params: {
      mousewheel: {
        enabled: !1,
        releaseOnEdges: !1,
        invert: !1,
        forceToAxis: !1,
        sensitivity: 1,
        eventsTarged: "container"
      }
    },

    create() {
      da.extend(this, {
        mousewheel: {
          enabled: !1,
          enable: Ia.enable.bind(this),
          disable: Ia.disable.bind(this),
          handle: Ia.handle.bind(this),
          handleMouseEnter: Ia.handleMouseEnter.bind(this),
          handleMouseLeave: Ia.handleMouseLeave.bind(this),
          lastScrollTime: da.now()
        }
      });
    },

    on: {
      init() {
        this.params.mousewheel.enabled && this.mousewheel.enable();
      },

      destroy() {
        this.mousewheel.enabled && this.mousewheel.disable();
      }

    }
  }, {
    name: "navigation",
    params: {
      navigation: {
        nextEl: null,
        prevEl: null,
        hideOnClick: !1,
        disabledClass: "swiper-button-disabled",
        hiddenClass: "swiper-button-hidden",
        lockClass: "swiper-button-lock"
      }
    },

    create() {
      da.extend(this, {
        navigation: {
          init: Fa.init.bind(this),
          update: Fa.update.bind(this),
          destroy: Fa.destroy.bind(this),
          onNextClick: Fa.onNextClick.bind(this),
          onPrevClick: Fa.onPrevClick.bind(this)
        }
      });
    },

    on: {
      init() {
        this.navigation.init(), this.navigation.update();
      },

      toEdge() {
        this.navigation.update();
      },

      fromEdge() {
        this.navigation.update();
      },

      destroy() {
        this.navigation.destroy();
      },

      click(e) {
        const t = this,
              {
          $nextEl: i,
          $prevEl: s
        } = t.navigation;

        if (t.params.navigation.hideOnClick && !ra(e.target).is(s) && !ra(e.target).is(i)) {
          let e;
          i ? e = i.hasClass(t.params.navigation.hiddenClass) : s && (e = s.hasClass(t.params.navigation.hiddenClass)), !0 === e ? t.emit("navigationShow", t) : t.emit("navigationHide", t), i && i.toggleClass(t.params.navigation.hiddenClass), s && s.toggleClass(t.params.navigation.hiddenClass);
        }
      }

    }
  }, {
    name: "pagination",
    params: {
      pagination: {
        el: null,
        bulletElement: "span",
        clickable: !1,
        hideOnClick: !1,
        renderBullet: null,
        renderProgressbar: null,
        renderFraction: null,
        renderCustom: null,
        progressbarOpposite: !1,
        type: "bullets",
        dynamicBullets: !1,
        dynamicMainBullets: 1,
        formatFractionCurrent: e => e,
        formatFractionTotal: e => e,
        bulletClass: "swiper-pagination-bullet",
        bulletActiveClass: "swiper-pagination-bullet-active",
        modifierClass: "swiper-pagination-",
        currentClass: "swiper-pagination-current",
        totalClass: "swiper-pagination-total",
        hiddenClass: "swiper-pagination-hidden",
        progressbarFillClass: "swiper-pagination-progressbar-fill",
        progressbarOppositeClass: "swiper-pagination-progressbar-opposite",
        clickableClass: "swiper-pagination-clickable",
        lockClass: "swiper-pagination-lock"
      }
    },

    create() {
      da.extend(this, {
        pagination: {
          init: Aa.init.bind(this),
          render: Aa.render.bind(this),
          update: Aa.update.bind(this),
          destroy: Aa.destroy.bind(this),
          dynamicBulletIndex: 0
        }
      });
    },

    on: {
      init() {
        this.pagination.init(), this.pagination.render(), this.pagination.update();
      },

      activeIndexChange() {
        const e = this;
        e.params.loop ? e.pagination.update() : void 0 === e.snapIndex && e.pagination.update();
      },

      snapIndexChange() {
        const e = this;
        e.params.loop || e.pagination.update();
      },

      slidesLengthChange() {
        const e = this;
        e.params.loop && (e.pagination.render(), e.pagination.update());
      },

      snapGridLengthChange() {
        const e = this;
        e.params.loop || (e.pagination.render(), e.pagination.update());
      },

      destroy() {
        this.pagination.destroy();
      },

      click(e) {
        const t = this;

        if (t.params.pagination.el && t.params.pagination.hideOnClick && t.pagination.$el.length > 0 && !ra(e.target).hasClass(t.params.pagination.bulletClass)) {
          !0 === t.pagination.$el.hasClass(t.params.pagination.hiddenClass) ? t.emit("paginationShow", t) : t.emit("paginationHide", t), t.pagination.$el.toggleClass(t.params.pagination.hiddenClass);
        }
      }

    }
  }, {
    name: "scrollbar",
    params: {
      scrollbar: {
        el: null,
        dragSize: "auto",
        hide: !1,
        draggable: !1,
        snapOnRelease: !0,
        lockClass: "swiper-scrollbar-lock",
        dragClass: "swiper-scrollbar-drag"
      }
    },

    create() {
      da.extend(this, {
        scrollbar: {
          init: Na.init.bind(this),
          destroy: Na.destroy.bind(this),
          updateSize: Na.updateSize.bind(this),
          setTranslate: Na.setTranslate.bind(this),
          setTransition: Na.setTransition.bind(this),
          enableDraggable: Na.enableDraggable.bind(this),
          disableDraggable: Na.disableDraggable.bind(this),
          setDragPosition: Na.setDragPosition.bind(this),
          onDragStart: Na.onDragStart.bind(this),
          onDragMove: Na.onDragMove.bind(this),
          onDragEnd: Na.onDragEnd.bind(this),
          isTouched: !1,
          timeout: null,
          dragTimeout: null
        }
      });
    },

    on: {
      init() {
        this.scrollbar.init(), this.scrollbar.updateSize(), this.scrollbar.setTranslate();
      },

      update() {
        this.scrollbar.updateSize();
      },

      resize() {
        this.scrollbar.updateSize();
      },

      observerUpdate() {
        this.scrollbar.updateSize();
      },

      setTranslate() {
        this.scrollbar.setTranslate();
      },

      setTransition(e) {
        this.scrollbar.setTransition(e);
      },

      destroy() {
        this.scrollbar.destroy();
      }

    }
  }, {
    name: "parallax",
    params: {
      parallax: {
        enabled: !1
      }
    },

    create() {
      da.extend(this, {
        parallax: {
          setTransform: Ha.setTransform.bind(this),
          setTranslate: Ha.setTranslate.bind(this),
          setTransition: Ha.setTransition.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        this.params.parallax.enabled && (this.params.watchSlidesProgress = !0, this.originalParams.watchSlidesProgress = !0);
      },

      init() {
        this.params.parallax.enabled && this.parallax.setTranslate();
      },

      setTranslate() {
        this.params.parallax.enabled && this.parallax.setTranslate();
      },

      setTransition(e) {
        this.params.parallax.enabled && this.parallax.setTransition(e);
      }

    }
  }, {
    name: "zoom",
    params: {
      zoom: {
        enabled: !1,
        maxRatio: 3,
        minRatio: 1,
        toggle: !0,
        containerClass: "swiper-zoom-container",
        zoomedSlideClass: "swiper-slide-zoomed"
      }
    },

    create() {
      const e = this,
            t = {
        enabled: !1,
        scale: 1,
        currentScale: 1,
        isScaling: !1,
        gesture: {
          $slideEl: void 0,
          slideWidth: void 0,
          slideHeight: void 0,
          $imageEl: void 0,
          $imageWrapEl: void 0,
          maxRatio: 3
        },
        image: {
          isTouched: void 0,
          isMoved: void 0,
          currentX: void 0,
          currentY: void 0,
          minX: void 0,
          minY: void 0,
          maxX: void 0,
          maxY: void 0,
          width: void 0,
          height: void 0,
          startX: void 0,
          startY: void 0,
          touchesStart: {},
          touchesCurrent: {}
        },
        velocity: {
          x: void 0,
          y: void 0,
          prevPositionX: void 0,
          prevPositionY: void 0,
          prevTime: void 0
        }
      };
      "onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out".split(" ").forEach(i => {
        t[i] = Va[i].bind(e);
      }), da.extend(e, {
        zoom: t
      });
      let i = 1;
      Object.defineProperty(e.zoom, "scale", {
        get: () => i,

        set(t) {
          if (i !== t) {
            const i = e.zoom.gesture.$imageEl ? e.zoom.gesture.$imageEl[0] : void 0,
                  s = e.zoom.gesture.$slideEl ? e.zoom.gesture.$slideEl[0] : void 0;
            e.emit("zoomChange", t, i, s);
          }

          i = t;
        }

      });
    },

    on: {
      init() {
        const e = this;
        e.params.zoom.enabled && e.zoom.enable();
      },

      destroy() {
        this.zoom.disable();
      },

      touchStart(e) {
        this.zoom.enabled && this.zoom.onTouchStart(e);
      },

      touchEnd(e) {
        this.zoom.enabled && this.zoom.onTouchEnd(e);
      },

      doubleTap(e) {
        const t = this;
        t.params.zoom.enabled && t.zoom.enabled && t.params.zoom.toggle && t.zoom.toggle(e);
      },

      transitionEnd() {
        const e = this;
        e.zoom.enabled && e.params.zoom.enabled && e.zoom.onTransitionEnd();
      }

    }
  }, {
    name: "lazy",
    params: {
      lazy: {
        enabled: !1,
        loadPrevNext: !1,
        loadPrevNextAmount: 1,
        loadOnTransitionStart: !1,
        elementClass: "swiper-lazy",
        loadingClass: "swiper-lazy-loading",
        loadedClass: "swiper-lazy-loaded",
        preloaderClass: "swiper-lazy-preloader"
      }
    },

    create() {
      da.extend(this, {
        lazy: {
          initialImageLoaded: !1,
          load: ja.load.bind(this),
          loadInSlide: ja.loadInSlide.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        const e = this;
        e.params.lazy.enabled && e.params.preloadImages && (e.params.preloadImages = !1);
      },

      init() {
        const e = this;
        e.params.lazy.enabled && !e.params.loop && 0 === e.params.initialSlide && e.lazy.load();
      },

      scroll() {
        const e = this;
        e.params.freeMode && !e.params.freeModeSticky && e.lazy.load();
      },

      resize() {
        const e = this;
        e.params.lazy.enabled && e.lazy.load();
      },

      scrollbarDragMove() {
        const e = this;
        e.params.lazy.enabled && e.lazy.load();
      },

      transitionStart() {
        const e = this;
        e.params.lazy.enabled && (e.params.lazy.loadOnTransitionStart || !e.params.lazy.loadOnTransitionStart && !e.lazy.initialImageLoaded) && e.lazy.load();
      },

      transitionEnd() {
        const e = this;
        e.params.lazy.enabled && !e.params.lazy.loadOnTransitionStart && e.lazy.load();
      }

    }
  }, {
    name: "controller",
    params: {
      controller: {
        control: void 0,
        inverse: !1,
        by: "slide"
      }
    },

    create() {
      da.extend(this, {
        controller: {
          control: this.params.controller.control,
          getInterpolateFunction: Ra.getInterpolateFunction.bind(this),
          setTranslate: Ra.setTranslate.bind(this),
          setTransition: Ra.setTransition.bind(this)
        }
      });
    },

    on: {
      update() {
        const e = this;
        e.controller.control && e.controller.spline && (e.controller.spline = void 0, delete e.controller.spline);
      },

      resize() {
        const e = this;
        e.controller.control && e.controller.spline && (e.controller.spline = void 0, delete e.controller.spline);
      },

      observerUpdate() {
        const e = this;
        e.controller.control && e.controller.spline && (e.controller.spline = void 0, delete e.controller.spline);
      },

      setTranslate(e, t) {
        this.controller.control && this.controller.setTranslate(e, t);
      },

      setTransition(e, t) {
        this.controller.control && this.controller.setTransition(e, t);
      }

    }
  }, {
    name: "a11y",
    params: {
      a11y: {
        enabled: !0,
        notificationClass: "swiper-notification",
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
        firstSlideMessage: "This is the first slide",
        lastSlideMessage: "This is the last slide",
        paginationBulletMessage: "Go to slide {{index}}"
      }
    },

    create() {
      const e = this;
      da.extend(e, {
        a11y: {
          liveRegion: ra(`<span class="${e.params.a11y.notificationClass}" aria-live="assertive" aria-atomic="true"></span>`)
        }
      }), Object.keys(Ga).forEach(t => {
        e.a11y[t] = Ga[t].bind(e);
      });
    },

    on: {
      init() {
        this.params.a11y.enabled && (this.a11y.init(), this.a11y.updateNavigation());
      },

      toEdge() {
        this.params.a11y.enabled && this.a11y.updateNavigation();
      },

      fromEdge() {
        this.params.a11y.enabled && this.a11y.updateNavigation();
      },

      paginationUpdate() {
        this.params.a11y.enabled && this.a11y.updatePagination();
      },

      destroy() {
        this.params.a11y.enabled && this.a11y.destroy();
      }

    }
  }, {
    name: "history",
    params: {
      history: {
        enabled: !1,
        replaceState: !1,
        key: "slides"
      }
    },

    create() {
      da.extend(this, {
        history: {
          init: Wa.init.bind(this),
          setHistory: Wa.setHistory.bind(this),
          setHistoryPopState: Wa.setHistoryPopState.bind(this),
          scrollToSlide: Wa.scrollToSlide.bind(this),
          destroy: Wa.destroy.bind(this)
        }
      });
    },

    on: {
      init() {
        const e = this;
        e.params.history.enabled && e.history.init();
      },

      destroy() {
        const e = this;
        e.params.history.enabled && e.history.destroy();
      },

      transitionEnd() {
        const e = this;
        e.history.initialized && e.history.setHistory(e.params.history.key, e.activeIndex);
      }

    }
  }, {
    name: "hash-navigation",
    params: {
      hashNavigation: {
        enabled: !1,
        replaceState: !1,
        watchState: !1
      }
    },

    create() {
      da.extend(this, {
        hashNavigation: {
          initialized: !1,
          init: Ba.init.bind(this),
          destroy: Ba.destroy.bind(this),
          setHash: Ba.setHash.bind(this),
          onHashCange: Ba.onHashCange.bind(this)
        }
      });
    },

    on: {
      init() {
        const e = this;
        e.params.hashNavigation.enabled && e.hashNavigation.init();
      },

      destroy() {
        const e = this;
        e.params.hashNavigation.enabled && e.hashNavigation.destroy();
      },

      transitionEnd() {
        const e = this;
        e.hashNavigation.initialized && e.hashNavigation.setHash();
      }

    }
  }, {
    name: "autoplay",
    params: {
      autoplay: {
        enabled: !1,
        delay: 3e3,
        waitForTransition: !0,
        disableOnInteraction: !0,
        stopOnLastSlide: !1,
        reverseDirection: !1
      }
    },

    create() {
      const e = this;
      da.extend(e, {
        autoplay: {
          running: !1,
          paused: !1,
          run: Ua.run.bind(e),
          start: Ua.start.bind(e),
          stop: Ua.stop.bind(e),
          pause: Ua.pause.bind(e),

          onTransitionEnd(t) {
            e && !e.destroyed && e.$wrapperEl && t.target === this && (e.$wrapperEl[0].removeEventListener("transitionend", e.autoplay.onTransitionEnd), e.$wrapperEl[0].removeEventListener("webkitTransitionEnd", e.autoplay.onTransitionEnd), e.autoplay.paused = !1, e.autoplay.running ? e.autoplay.run() : e.autoplay.stop());
          }

        }
      });
    },

    on: {
      init() {
        const e = this;
        e.params.autoplay.enabled && e.autoplay.start();
      },

      beforeTransitionStart(e, t) {
        const i = this;
        i.autoplay.running && (t || !i.params.autoplay.disableOnInteraction ? i.autoplay.pause(e) : i.autoplay.stop());
      },

      sliderFirstMove() {
        const e = this;
        e.autoplay.running && (e.params.autoplay.disableOnInteraction ? e.autoplay.stop() : e.autoplay.pause());
      },

      destroy() {
        const e = this;
        e.autoplay.running && e.autoplay.stop();
      }

    }
  }, {
    name: "effect-fade",
    params: {
      fadeEffect: {
        crossFade: !1
      }
    },

    create() {
      da.extend(this, {
        fadeEffect: {
          setTranslate: Xa.setTranslate.bind(this),
          setTransition: Xa.setTransition.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        if ("fade" !== this.params.effect) return;
        this.classNames.push(`${this.params.containerModifierClass}fade`);
        const e = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: !0,
          spaceBetween: 0,
          virtualTranslate: !0
        };
        da.extend(this.params, e), da.extend(this.originalParams, e);
      },

      setTranslate() {
        "fade" === this.params.effect && this.fadeEffect.setTranslate();
      },

      setTransition(e) {
        "fade" === this.params.effect && this.fadeEffect.setTransition(e);
      }

    }
  }, {
    name: "effect-cube",
    params: {
      cubeEffect: {
        slideShadows: !0,
        shadow: !0,
        shadowOffset: 20,
        shadowScale: .94
      }
    },

    create() {
      da.extend(this, {
        cubeEffect: {
          setTranslate: qa.setTranslate.bind(this),
          setTransition: qa.setTransition.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        if ("cube" !== this.params.effect) return;
        this.classNames.push(`${this.params.containerModifierClass}cube`), this.classNames.push(`${this.params.containerModifierClass}3d`);
        const e = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: !0,
          resistanceRatio: 0,
          spaceBetween: 0,
          centeredSlides: !1,
          virtualTranslate: !0
        };
        da.extend(this.params, e), da.extend(this.originalParams, e);
      },

      setTranslate() {
        "cube" === this.params.effect && this.cubeEffect.setTranslate();
      },

      setTransition(e) {
        "cube" === this.params.effect && this.cubeEffect.setTransition(e);
      }

    }
  }, {
    name: "effect-flip",
    params: {
      flipEffect: {
        slideShadows: !0,
        limitRotation: !0
      }
    },

    create() {
      da.extend(this, {
        flipEffect: {
          setTranslate: Za.setTranslate.bind(this),
          setTransition: Za.setTransition.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        if ("flip" !== this.params.effect) return;
        this.classNames.push(`${this.params.containerModifierClass}flip`), this.classNames.push(`${this.params.containerModifierClass}3d`);
        const e = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: !0,
          spaceBetween: 0,
          virtualTranslate: !0
        };
        da.extend(this.params, e), da.extend(this.originalParams, e);
      },

      setTranslate() {
        "flip" === this.params.effect && this.flipEffect.setTranslate();
      },

      setTransition(e) {
        "flip" === this.params.effect && this.flipEffect.setTransition(e);
      }

    }
  }, {
    name: "effect-coverflow",
    params: {
      coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: !0
      }
    },

    create() {
      da.extend(this, {
        coverflowEffect: {
          setTranslate: Ka.setTranslate.bind(this),
          setTransition: Ka.setTransition.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        "coverflow" === this.params.effect && (this.classNames.push(`${this.params.containerModifierClass}coverflow`), this.classNames.push(`${this.params.containerModifierClass}3d`), this.params.watchSlidesProgress = !0, this.originalParams.watchSlidesProgress = !0);
      },

      setTranslate() {
        "coverflow" === this.params.effect && this.coverflowEffect.setTranslate();
      },

      setTransition(e) {
        "coverflow" === this.params.effect && this.coverflowEffect.setTransition(e);
      }

    }
  }, {
    name: "thumbs",
    params: {
      thumbs: {
        swiper: null,
        slideThumbActiveClass: "swiper-slide-thumb-active",
        thumbsContainerClass: "swiper-container-thumbs"
      }
    },

    create() {
      da.extend(this, {
        thumbs: {
          swiper: null,
          init: Ja.init.bind(this),
          update: Ja.update.bind(this),
          onThumbClick: Ja.onThumbClick.bind(this)
        }
      });
    },

    on: {
      beforeInit() {
        const {
          thumbs: e
        } = this.params;
        e && e.swiper && (this.thumbs.init(), this.thumbs.update(!0));
      },

      slideChange() {
        this.thumbs.swiper && this.thumbs.update();
      },

      update() {
        this.thumbs.swiper && this.thumbs.update();
      },

      resize() {
        this.thumbs.swiper && this.thumbs.update();
      },

      observerUpdate() {
        this.thumbs.swiper && this.thumbs.update();
      },

      setTransition(e) {
        const t = this.thumbs.swiper;
        t && t.setTransition(e);
      },

      beforeDestroy() {
        const e = this.thumbs.swiper;
        e && this.thumbs.swiperCreated && e && e.destroy();
      }

    }
  }];
  void 0 === Ta.use && (Ta.use = Ta.Class.use, Ta.installModule = Ta.Class.installModule), Ta.use(Qa);
  var en = "/**\n * Swiper 4.5.0\n * Most modern mobile touch slider and framework with hardware accelerated transitions\n * http://www.idangero.us/swiper/\n *\n * Copyright 2014-2019 Vladimir Kharlampidi\n *\n * Released under the MIT License\n *\n * Released on: February 22, 2019\n */\n.swiper-container{margin:0 auto;position:relative;overflow:hidden;list-style:none;padding:0;z-index:1}.swiper-container-no-flexbox .swiper-slide{float:left}.swiper-container-vertical>.swiper-wrapper{-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column}.swiper-wrapper{position:relative;width:100%;height:100%;z-index:1;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-transition-property:-webkit-transform;transition-property:-webkit-transform;-o-transition-property:transform;transition-property:transform;transition-property:transform,-webkit-transform;-webkit-box-sizing:content-box;box-sizing:content-box}.swiper-container-android .swiper-slide,.swiper-wrapper{-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.swiper-container-multirow>.swiper-wrapper{-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap}.swiper-container-free-mode>.swiper-wrapper{-webkit-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out;margin:0 auto}.swiper-slide{-webkit-flex-shrink:0;-ms-flex-negative:0;flex-shrink:0;width:100%;height:100%;position:relative;-webkit-transition-property:-webkit-transform;transition-property:-webkit-transform;-o-transition-property:transform;transition-property:transform;transition-property:transform,-webkit-transform}.swiper-slide-invisible-blank{visibility:hidden}.swiper-container-autoheight,.swiper-container-autoheight .swiper-slide{height:auto}.swiper-container-autoheight .swiper-wrapper{-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;-webkit-transition-property:height,-webkit-transform;transition-property:height,-webkit-transform;-o-transition-property:transform,height;transition-property:transform,height;transition-property:transform,height,-webkit-transform}.swiper-container-3d{-webkit-perspective:1200px;perspective:1200px}.swiper-container-3d .swiper-cube-shadow,.swiper-container-3d .swiper-slide,.swiper-container-3d .swiper-slide-shadow-bottom,.swiper-container-3d .swiper-slide-shadow-left,.swiper-container-3d .swiper-slide-shadow-right,.swiper-container-3d .swiper-slide-shadow-top,.swiper-container-3d .swiper-wrapper{-webkit-transform-style:preserve-3d;transform-style:preserve-3d}.swiper-container-3d .swiper-slide-shadow-bottom,.swiper-container-3d .swiper-slide-shadow-left,.swiper-container-3d .swiper-slide-shadow-right,.swiper-container-3d .swiper-slide-shadow-top{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:10}.swiper-container-3d .swiper-slide-shadow-left{background-image:-webkit-gradient(linear,right top,left top,from(rgba(0,0,0,.5)),to(rgba(0,0,0,0)));background-image:-webkit-linear-gradient(right,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:-o-linear-gradient(right,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:linear-gradient(to left,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-container-3d .swiper-slide-shadow-right{background-image:-webkit-gradient(linear,left top,right top,from(rgba(0,0,0,.5)),to(rgba(0,0,0,0)));background-image:-webkit-linear-gradient(left,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:-o-linear-gradient(left,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:linear-gradient(to right,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-container-3d .swiper-slide-shadow-top{background-image:-webkit-gradient(linear,left bottom,left top,from(rgba(0,0,0,.5)),to(rgba(0,0,0,0)));background-image:-webkit-linear-gradient(bottom,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:-o-linear-gradient(bottom,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:linear-gradient(to top,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-container-3d .swiper-slide-shadow-bottom{background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(0,0,0,.5)),to(rgba(0,0,0,0)));background-image:-webkit-linear-gradient(top,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:-o-linear-gradient(top,rgba(0,0,0,.5),rgba(0,0,0,0));background-image:linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))}.swiper-container-wp8-horizontal,.swiper-container-wp8-horizontal>.swiper-wrapper{-ms-touch-action:pan-y;touch-action:pan-y}.swiper-container-wp8-vertical,.swiper-container-wp8-vertical>.swiper-wrapper{-ms-touch-action:pan-x;touch-action:pan-x}.swiper-button-next,.swiper-button-prev{position:absolute;top:50%;width:27px;height:44px;margin-top:-22px;z-index:10;cursor:pointer;background-size:27px 44px;background-position:center;background-repeat:no-repeat}.swiper-button-next.swiper-button-disabled,.swiper-button-prev.swiper-button-disabled{opacity:.35;cursor:auto;pointer-events:none}.swiper-button-prev,.swiper-container-rtl .swiper-button-next{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23007aff'%2F%3E%3C%2Fsvg%3E\");left:10px;right:auto}.swiper-button-next,.swiper-container-rtl .swiper-button-prev{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23007aff'%2F%3E%3C%2Fsvg%3E\");right:10px;left:auto}.swiper-button-prev.swiper-button-white,.swiper-container-rtl .swiper-button-next.swiper-button-white{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\")}.swiper-button-next.swiper-button-white,.swiper-container-rtl .swiper-button-prev.swiper-button-white{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E\")}.swiper-button-prev.swiper-button-black,.swiper-container-rtl .swiper-button-next.swiper-button-black{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M0%2C22L22%2C0l2.1%2C2.1L4.2%2C22l19.9%2C19.9L22%2C44L0%2C22L0%2C22L0%2C22z'%20fill%3D'%23000000'%2F%3E%3C%2Fsvg%3E\")}.swiper-button-next.swiper-button-black,.swiper-container-rtl .swiper-button-prev.swiper-button-black{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2027%2044'%3E%3Cpath%20d%3D'M27%2C22L27%2C22L5%2C44l-2.1-2.1L22.8%2C22L2.9%2C2.1L5%2C0L27%2C22L27%2C22z'%20fill%3D'%23000000'%2F%3E%3C%2Fsvg%3E\")}.swiper-button-lock{display:none}.swiper-pagination{position:absolute;text-align:center;-webkit-transition:.3s opacity;-o-transition:.3s opacity;transition:.3s opacity;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);z-index:10}.swiper-pagination.swiper-pagination-hidden{opacity:0}.swiper-container-horizontal>.swiper-pagination-bullets,.swiper-pagination-custom,.swiper-pagination-fraction{bottom:10px;left:0;width:100%}.swiper-pagination-bullets-dynamic{overflow:hidden;font-size:0}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{-webkit-transform:scale(.33);-ms-transform:scale(.33);transform:scale(.33);position:relative}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-main{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev{-webkit-transform:scale(.66);-ms-transform:scale(.66);transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-prev-prev{-webkit-transform:scale(.33);-ms-transform:scale(.33);transform:scale(.33)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next{-webkit-transform:scale(.66);-ms-transform:scale(.66);transform:scale(.66)}.swiper-pagination-bullets-dynamic .swiper-pagination-bullet-active-next-next{-webkit-transform:scale(.33);-ms-transform:scale(.33);transform:scale(.33)}.swiper-pagination-bullet{width:8px;height:8px;display:inline-block;border-radius:100%;background:#000;opacity:.2}button.swiper-pagination-bullet{border:none;margin:0;padding:0;-webkit-box-shadow:none;box-shadow:none;-webkit-appearance:none;-moz-appearance:none;appearance:none}.swiper-pagination-clickable .swiper-pagination-bullet{cursor:pointer}.swiper-pagination-bullet-active{opacity:1;background:#007aff}.swiper-container-vertical>.swiper-pagination-bullets{right:10px;top:50%;-webkit-transform:translate3d(0,-50%,0);transform:translate3d(0,-50%,0)}.swiper-container-vertical>.swiper-pagination-bullets .swiper-pagination-bullet{margin:6px 0;display:block}.swiper-container-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{top:50%;-webkit-transform:translateY(-50%);-ms-transform:translateY(-50%);transform:translateY(-50%);width:8px}.swiper-container-vertical>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{display:inline-block;-webkit-transition:.2s top,.2s -webkit-transform;transition:.2s top,.2s -webkit-transform;-o-transition:.2s transform,.2s top;transition:.2s transform,.2s top;transition:.2s transform,.2s top,.2s -webkit-transform}.swiper-container-horizontal>.swiper-pagination-bullets .swiper-pagination-bullet{margin:0 4px}.swiper-container-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic{left:50%;-webkit-transform:translateX(-50%);-ms-transform:translateX(-50%);transform:translateX(-50%);white-space:nowrap}.swiper-container-horizontal>.swiper-pagination-bullets.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{-webkit-transition:.2s left,.2s -webkit-transform;transition:.2s left,.2s -webkit-transform;-o-transition:.2s transform,.2s left;transition:.2s transform,.2s left;transition:.2s transform,.2s left,.2s -webkit-transform}.swiper-container-horizontal.swiper-container-rtl>.swiper-pagination-bullets-dynamic .swiper-pagination-bullet{-webkit-transition:.2s right,.2s -webkit-transform;transition:.2s right,.2s -webkit-transform;-o-transition:.2s transform,.2s right;transition:.2s transform,.2s right;transition:.2s transform,.2s right,.2s -webkit-transform}.swiper-pagination-progressbar{background:rgba(0,0,0,.25);position:absolute}.swiper-pagination-progressbar .swiper-pagination-progressbar-fill{background:#007aff;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-transform:scale(0);-ms-transform:scale(0);transform:scale(0);-webkit-transform-origin:left top;-ms-transform-origin:left top;transform-origin:left top}.swiper-container-rtl .swiper-pagination-progressbar .swiper-pagination-progressbar-fill{-webkit-transform-origin:right top;-ms-transform-origin:right top;transform-origin:right top}.swiper-container-horizontal>.swiper-pagination-progressbar,.swiper-container-vertical>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite{width:100%;height:4px;left:0;top:0}.swiper-container-horizontal>.swiper-pagination-progressbar.swiper-pagination-progressbar-opposite,.swiper-container-vertical>.swiper-pagination-progressbar{width:4px;height:100%;left:0;top:0}.swiper-pagination-white .swiper-pagination-bullet-active{background:#fff}.swiper-pagination-progressbar.swiper-pagination-white{background:rgba(255,255,255,.25)}.swiper-pagination-progressbar.swiper-pagination-white .swiper-pagination-progressbar-fill{background:#fff}.swiper-pagination-black .swiper-pagination-bullet-active{background:#000}.swiper-pagination-progressbar.swiper-pagination-black{background:rgba(0,0,0,.25)}.swiper-pagination-progressbar.swiper-pagination-black .swiper-pagination-progressbar-fill{background:#000}.swiper-pagination-lock{display:none}.swiper-scrollbar{border-radius:10px;position:relative;-ms-touch-action:none;background:rgba(0,0,0,.1)}.swiper-container-horizontal>.swiper-scrollbar{position:absolute;left:1%;bottom:3px;z-index:50;height:5px;width:98%}.swiper-container-vertical>.swiper-scrollbar{position:absolute;right:3px;top:1%;z-index:50;width:5px;height:98%}.swiper-scrollbar-drag{height:100%;width:100%;position:relative;background:rgba(0,0,0,.5);border-radius:10px;left:0;top:0}.swiper-scrollbar-cursor-drag{cursor:move}.swiper-scrollbar-lock{display:none}.swiper-zoom-container{width:100%;height:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;text-align:center}.swiper-zoom-container>canvas,.swiper-zoom-container>img,.swiper-zoom-container>svg{max-width:100%;max-height:100%;-o-object-fit:contain;object-fit:contain}.swiper-slide-zoomed{cursor:move}.swiper-lazy-preloader{width:42px;height:42px;position:absolute;left:50%;top:50%;margin-left:-21px;margin-top:-21px;z-index:10;-webkit-transform-origin:50%;-ms-transform-origin:50%;transform-origin:50%;-webkit-animation:swiper-preloader-spin 1s steps(12,end) infinite;animation:swiper-preloader-spin 1s steps(12,end) infinite}.swiper-lazy-preloader:after{display:block;content:'';width:100%;height:100%;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%236c6c6c'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\");background-position:50%;background-size:100%;background-repeat:no-repeat}.swiper-lazy-preloader-white:after{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg%20viewBox%3D'0%200%20120%20120'%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20xmlns%3Axlink%3D'http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink'%3E%3Cdefs%3E%3Cline%20id%3D'l'%20x1%3D'60'%20x2%3D'60'%20y1%3D'7'%20y2%3D'27'%20stroke%3D'%23fff'%20stroke-width%3D'11'%20stroke-linecap%3D'round'%2F%3E%3C%2Fdefs%3E%3Cg%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(30%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(60%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(90%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(120%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.27'%20transform%3D'rotate(150%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.37'%20transform%3D'rotate(180%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.46'%20transform%3D'rotate(210%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.56'%20transform%3D'rotate(240%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.66'%20transform%3D'rotate(270%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.75'%20transform%3D'rotate(300%2060%2C60)'%2F%3E%3Cuse%20xlink%3Ahref%3D'%23l'%20opacity%3D'.85'%20transform%3D'rotate(330%2060%2C60)'%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\")}@-webkit-keyframes swiper-preloader-spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes swiper-preloader-spin{100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}.swiper-container .swiper-notification{position:absolute;left:0;top:0;pointer-events:none;opacity:0;z-index:-1000}.swiper-container-fade.swiper-container-free-mode .swiper-slide{-webkit-transition-timing-function:ease-out;-o-transition-timing-function:ease-out;transition-timing-function:ease-out}.swiper-container-fade .swiper-slide{pointer-events:none;-webkit-transition-property:opacity;-o-transition-property:opacity;transition-property:opacity}.swiper-container-fade .swiper-slide .swiper-slide{pointer-events:none}.swiper-container-fade .swiper-slide-active,.swiper-container-fade .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-container-cube{overflow:visible}.swiper-container-cube .swiper-slide{pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1;visibility:hidden;-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0;width:100%;height:100%}.swiper-container-cube .swiper-slide .swiper-slide{pointer-events:none}.swiper-container-cube.swiper-container-rtl .swiper-slide{-webkit-transform-origin:100% 0;-ms-transform-origin:100% 0;transform-origin:100% 0}.swiper-container-cube .swiper-slide-active,.swiper-container-cube .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-container-cube .swiper-slide-active,.swiper-container-cube .swiper-slide-next,.swiper-container-cube .swiper-slide-next+.swiper-slide,.swiper-container-cube .swiper-slide-prev{pointer-events:auto;visibility:visible}.swiper-container-cube .swiper-slide-shadow-bottom,.swiper-container-cube .swiper-slide-shadow-left,.swiper-container-cube .swiper-slide-shadow-right,.swiper-container-cube .swiper-slide-shadow-top{z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}.swiper-container-cube .swiper-cube-shadow{position:absolute;left:0;bottom:0;width:100%;height:100%;background:#000;opacity:.6;-webkit-filter:blur(50px);filter:blur(50px);z-index:0}.swiper-container-flip{overflow:visible}.swiper-container-flip .swiper-slide{pointer-events:none;-webkit-backface-visibility:hidden;backface-visibility:hidden;z-index:1}.swiper-container-flip .swiper-slide .swiper-slide{pointer-events:none}.swiper-container-flip .swiper-slide-active,.swiper-container-flip .swiper-slide-active .swiper-slide-active{pointer-events:auto}.swiper-container-flip .swiper-slide-shadow-bottom,.swiper-container-flip .swiper-slide-shadow-left,.swiper-container-flip .swiper-slide-shadow-right,.swiper-container-flip .swiper-slide-shadow-top{z-index:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}.swiper-container-coverflow .swiper-wrapper{-ms-perspective:1200px}";
  !function (e, t) {
    void 0 === t && (t = {});
    var i = t.insertAt;

    if (e && "undefined" != typeof document) {
      var s = document.head || document.getElementsByTagName("head")[0],
          a = document.createElement("style");
      a.type = "text/css", "top" === i && s.firstChild ? s.insertBefore(a, s.firstChild) : s.appendChild(a), a.styleSheet ? a.styleSheet.cssText = e : a.appendChild(document.createTextNode(e));
    }
  }(en);
  var tn = "jan._feb._mrt._apr._mei_jun._jul._aug._sep._okt._nov._dec.".split("_"),
      sn = "jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_"),
      an = [/^jan/i, /^feb/i, /^maart|mrt.?$/i, /^apr/i, /^mei$/i, /^jun[i.]?$/i, /^jul[i.]?$/i, /^aug/i, /^sep/i, /^okt/i, /^nov/i, /^dec/i],
      nn = /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december|jan\.?|feb\.?|mrt\.?|apr\.?|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i;
  oe.defineLocale("nl", {
    months: "januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),
    monthsShort: function (e, t) {
      return e ? /-MMM-/.test(t) ? sn[e.month()] : tn[e.month()] : tn;
    },
    monthsRegex: nn,
    monthsShortRegex: nn,
    monthsStrictRegex: /^(januari|februari|maart|april|mei|ju[nl]i|augustus|september|oktober|november|december)/i,
    monthsShortStrictRegex: /^(jan\.?|feb\.?|mrt\.?|apr\.?|mei|ju[nl]\.?|aug\.?|sep\.?|okt\.?|nov\.?|dec\.?)/i,
    monthsParse: an,
    longMonthsParse: an,
    shortMonthsParse: an,
    weekdays: "zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),
    weekdaysShort: "zo._ma._di._wo._do._vr._za.".split("_"),
    weekdaysMin: "zo_ma_di_wo_do_vr_za".split("_"),
    weekdaysParseExact: !0,
    longDateFormat: {
      LT: "HH:mm",
      LTS: "HH:mm:ss",
      L: "DD-MM-YYYY",
      LL: "D MMMM YYYY",
      LLL: "D MMMM YYYY HH:mm",
      LLLL: "dddd D MMMM YYYY HH:mm"
    },
    calendar: {
      sameDay: "[vandaag om] LT",
      nextDay: "[morgen om] LT",
      nextWeek: "dddd [om] LT",
      lastDay: "[gisteren om] LT",
      lastWeek: "[afgelopen] dddd [om] LT",
      sameElse: "L"
    },
    relativeTime: {
      future: "over %s",
      past: "%s geleden",
      s: "een paar seconden",
      ss: "%d seconden",
      m: "één minuut",
      mm: "%d minuten",
      h: "één uur",
      hh: "%d uur",
      d: "één dag",
      dd: "%d dagen",
      M: "één maand",
      MM: "%d maanden",
      y: "één jaar",
      yy: "%d jaar"
    },
    dayOfMonthOrdinalParse: /\d{1,2}(ste|de)/,
    ordinal: function (e) {
      return e + (1 === e || 8 === e || e >= 20 ? "ste" : "de");
    },
    week: {
      dow: 1,
      doy: 4
    }
  });
  const rn = {
    delivered: !1,
    first_letter: !1,
    header: !1
  },
        on = {
    en: {
      unavailable_entities: "The given entities are not available. Please check your card configuration",
      unavailable_letters: "It seems you have set the letter object, but you haven't activated this within PostNL yet. Consider removing the letter object from the card or activate this option in PostNL.",
      letter: "Letter",
      letters: "Letters",
      title: "Title",
      status: "Status",
      delivery_date: "Delivery date",
      enroute: "Enroute",
      delivered: "Delivered",
      delivery: "Delivery",
      distribution: "Distribution",
      unknown: "Unknown"
    },
    nl: {
      unavailable_entities: "De opgegeven entiteiten zijn niet beschikbaar. Controleer je card configuratie",
      unavailable_letters: "Het lijkt er op dat je brieven hebt geconfigureerd in deze card, maar je hebt deze niet binnen de PostNL app geactiveerd. Verwijder de brieven van deze card of activeer ze binnen de PostNL app.",
      letter: "Brief",
      letters: "Brieven",
      title: "Titel",
      status: "Status",
      delivery_date: "Bezorgdatum",
      enroute: "Onderweg",
      delivered: "Bezorgd",
      delivery: "Bezorging",
      distribution: "Versturen",
      unknown: "Onbekend"
    }
  };

  class ln extends ae {
    static get properties() {
      return {
        _hass: Object,
        swiper: Object,
        config: Object,
        deliveryObject: Object,
        distributionObject: Object,
        letterObject: Object,
        icon: String,
        name: String,
        date_format: String,
        time_format: String,
        past_days: String,
        _language: String,
        _hide: Object
      };
    }

    constructor() {
      super(), this._hass = null, this.deliveryObject = null, this.distributionObject = null, this.letterObject = null, this.delivery_enroute = [], this.delivery_delivered = [], this.distribution_enroute = [], this.distribution_delivered = [], this.letters = [], this.icon = null, this.name = null, this.date_format = null, this.time_format = null, this.past_days = null, this._language = null, this._hide = rn, this._lang = on;
    }

    set hass(e) {
      this._hass = e, this.config.delivery && (this.deliveryObject = e.states[this.config.delivery]), this.config.distribution && (this.distributionObject = e.states[this.config.distribution]), this.config.letters && (this.letterObject = e.states[this.config.letters]), this.config.hide && (this._hide = { ...this._hide,
        ...this.config.hide
      }), "string" == typeof this.config.name ? this.name = this.config.name : this.name = "PostNL", this.config.icon ? this.icon = this.config.icon : this.icon = "mdi:mailbox", this.config.date_format ? this.date_format = this.config.date_format : this.date_format = "DD MMM YYYY", this.config.time_format ? this.time_format = this.config.time_format : this.time_format = "HH:mm", void 0 !== this.config.past_days ? this.past_days = parseInt(this.config.past_days, 10) : this.past_days = 1, this._language = e.language, "nl" !== this._language && (this._language = "en"), this.delivery_enroute = [], this.delivery_delivered = [], this.distribution_enroute = [], this.distribution_delivered = [], this.letters = [], this.letterObject && Object.entries(this.letterObject.attributes.letters).sort((e, t) => new Date(t[1].delivery_date) - new Date(e[1].delivery_date)).map(([e, t]) => {
        oe(t.delivery_date).isBefore(oe().subtract(this.past_days, "days").startOf("day")) || this.letters.push(t);
      }), this.deliveryObject && (Object.entries(this.deliveryObject.attributes.enroute).sort((e, t) => new Date(t[1].planned_date) - new Date(e[1].planned_date)).map(([e, t]) => {
        this.delivery_enroute.push(t);
      }), Object.entries(this.deliveryObject.attributes.delivered).sort((e, t) => new Date(t[1].delivery_date) - new Date(e[1].delivery_date)).map(([e, t]) => {
        null != t.delivery_date && oe(t.delivery_date).isBefore(oe().subtract(this.past_days, "days").startOf("day")) || this.delivery_delivered.push(t);
      })), this.distributionObject && (Object.entries(this.distributionObject.attributes.enroute).sort((e, t) => new Date(t[1].planned_date) - new Date(e[1].planned_date)).map(([e, t]) => {
        this.distribution_enroute.push(t);
      }), Object.entries(this.distributionObject.attributes.delivered).sort((e, t) => new Date(t[1].delivery_date) - new Date(e[1].delivery_date)).map(([e, t]) => {
        null != t.delivery_date && oe(t.delivery_date).isBefore(oe().subtract(this.past_days, "days").startOf("day")) || this.distribution_delivered.push(t);
      }));
    }

    render({
      _hass: e,
      _hide: t,
      _values: i,
      config: s,
      delivery: a,
      distribution: n,
      letters: r
    } = this) {
      return a || n || r ? O`
      ${[O`
      <style is="custom-style">
            ${ie(en)}
      </style>
        `, O`
      <style is="custom-style">
          ha-card {
            -webkit-font-smoothing: var(
              --paper-font-body1_-_-webkit-font-smoothing
            );
            font-size: var(--paper-font-body1_-_font-size);
            font-weight: var(--paper-font-body1_-_font-weight);
            line-height: var(--paper-font-body1_-_line-height);
            padding-bottom: 16px;
          }
          ha-card.no-header {
            padding: 16px 0;
          }
          .info-body,
          .detail-body {
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
          }
          .info {
            text-align: center;
          }

          .info__icon {
            color: var(--paper-item-icon-color, #44739e);
          }
          .detail-body table {
            padding: 0px 16px;
            width: 100%;
          }
          .detail-body td {
            padding: 2px;
          }
          .detail-body thead th {
            text-align: left;
          }
          .detail-body tbody tr:nth-child(odd) {
            background-color: var(--paper-card-background-color);
          }
          .detail-body tbody tr:nth-child(even) {
            background-color: var(--secondary-background-color);
          }
          .detail-body tbody td.name a {
            color: var(--primary-text-color);
            text-decoration-line: none;
            font-weight: normal;
          }
          .img-body {
            margin-bottom: 10px;
            text-align: center;
          }
          .img-body img {
            padding: 5px;
            background: repeating-linear-gradient(
              45deg,
              #B45859,
              #B45859 10px,
              #FFFFFF 10px,
              #FFFFFF 20px,
              #122F94 20px,
              #122F94 30px,
              #FFFFFF 30px,
              #FFFFFF 40px
            );
          }

          header {
            display: flex;
            flex-direction: row;
            align-items: center;
            font-family: var(--paper-font-headline_-_font-family);
            -webkit-font-smoothing: var(
              --paper-font-headline_-_-webkit-font-smoothing
            );
            font-size: var(--paper-font-headline_-_font-size);
            font-weight: var(--paper-font-headline_-_font-weight);
            letter-spacing: var(--paper-font-headline_-_letter-spacing);
            line-height: var(--paper-font-headline_-_line-height);
            text-rendering: var(
              --paper-font-common-expensive-kerning_-_text-rendering
            );
            opacity: var(--dark-primary-opacity);
            padding: 24px
              16px
              16px;
          }
          .header__icon {
            margin-right: 8px;
            color: var(--paper-item-icon-color, #44739e);
          }
          .header__title {
            font-size: var(--thermostat-font-size-title);
            line-height: var(--thermostat-font-size-title);
            font-weight: normal;
            margin: 0;
            align-self: left;
          }

          footer {
            padding: 16px;
            color: red;
          }
      </style>`]}
      <ha-card class="postnl-card">
        ${this.renderHeader()}
        <section class="info-body">
          ${this.renderLettersInfo()}
          ${this.renderDeliveryInfo()}
          ${this.renderDistributionInfo()}
        </section>

      ${this.renderLetters()}
      ${this.renderDelivery()}
      ${this.renderDistribution()}
      ${this.renderLetterWarning()}

      </ha-card>
    ` : O`
        ${O`
    <style is="custom-style">
      ha-card {
        font-weight: var(--paper-font-body1_-_font-weight);
        line-height: var(--paper-font-body1_-_line-height);
      }
      .not-found {
        flex: 1;
        background-color: red;
        padding: calc(16px);
      }
    </style>
  `}
        <ha-card class="not-found">
          ${this.translate("unavailable_entities")}
        </ha-card>
      `;
    }

    renderHeader() {
      return this._hide.header ? "" : O`
      <header>
        <ha-icon class="header__icon" .icon=${this.icon}></ha-icon>
        <h2 class="header__title">${this.name}</h2>
      </header>
    `;
    }

    renderLetterWarning() {
      return this.letterObject ? void 0 === this.letterObject.attributes.enabled || this.letterObject.attributes.enabled ? "" : O`
      <footer>
        ${this.translate("unavailable_letters")}
      </footer>
    ` : "";
    }

    renderLettersInfo() {
      return this.letterObject ? O`
      <div class="info">
        <ha-icon class="info__icon" icon="mdi:email"></ha-icon><br />
        <span>${this.letters.length} ${this.letters.length > 1 ? this.translate("letters") : this.translate("letter")}</span>
      </div>
    ` : "";
    }

    renderLetters() {
      return !this.letterObject || this.letters && 0 === this.letters.length ? "" : O`
      <header>
        <ha-icon class="header__icon" icon="mdi:email"></ha-icon>
        <h2 class="header__title">${this.translate("letters")}</h2>
      </header>
      ${this.renderLetterImage()}
      <section class="detail-body">
        <table>
          <thead>
            <tr>
              <th>${this.translate("title")}</th>
              <th>${this.translate("status")}</th>
              <th>${this.translate("delivery_date")}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(this.letters).map(([e, t]) => this.renderLetter(t))}
          </tbody>
        </table>
      </section>
    `;
    }

    renderLetterImage() {
      return this._hide.first_letter ? "" : null == this.letters[0] || null == this.letters[0].image ? "" : O`
      <section class="img-body">
        <div class="swiper-container">
          <div class="swiper-wrapper">
            ${Object.entries(this.letters).map(([e, t]) => null == t.image ? "" : O`
              <div class="swiper-slide">
                <img src="${t.image}&width=400&height=300" />
              </div>
              `)}
          </div>
        </div>
      </section>
    `;
    }

    renderLetter(e) {
      return null == e.image ? O`
        <tr>
          <td class="name">${e.id}</td>
          <td>${null != e.status_message ? e.status_message : this.translate("unknown")}</td>
          <td>${this.dateConversion(e.delivery_date)}</td>
        </tr>
      ` : O`
        <tr>
          <td class="name"><a href="${e.image}" target="_blank">${e.id}</a></td>
          <td>${null != e.status_message ? e.status_message : this.translate("unknown")}</td>
          <td>${this.dateConversion(e.delivery_date)}</td>
        </tr>
      `;
    }

    renderDeliveryInfo() {
      return this.deliveryObject ? O`
      <div class="info">
        <ha-icon class="info__icon" icon="mdi:truck-delivery"></ha-icon><br />
        <span>${this.delivery_enroute.length} ${this.translate("enroute")}</span>
      </div>
      <div class="info">
        <ha-icon class="info__icon" icon="mdi:package-variant"></ha-icon><br />
        <span>${this.delivery_delivered.length} ${this.translate("delivered")}</span>
      </div>
    ` : "";
    }

    renderDistributionInfo() {
      return this.distributionObject ? O`
      <div class="info">
        <ha-icon class="info__icon" icon="mdi:truck-delivery"></ha-icon><br />
        <span>${this.distribution_enroute.length} ${this.translate("enroute")}</span>
      </div>
      <div class="info">
        <ha-icon class="info__icon" icon="mdi:package-variant"></ha-icon><br />
        <span>${this.distribution_delivered.length} ${this.translate("delivered")}</span>
      </div>
    ` : "";
    }

    renderDelivery() {
      return this.deliveryObject ? 0 === this.delivery_enroute.length && this._hide.delivered ? "" : 0 === this.delivery_enroute.length && 0 === this.delivery_delivered.length ? "" : O`
      <header>
        <ha-icon class="header__icon" icon="mdi:package-variant"></ha-icon>
        <h2 class="header__title">${this.translate("delivery")}</h2>
      </header>
      <section class="detail-body">
        <table>
          <thead>
            <tr>
              <th>${this.translate("title")}</th>
              <th>${this.translate("status")}</th>
              <th>${this.translate("delivery_date")}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(this.delivery_enroute).map(([e, t]) => this.renderShipment(t))}

            ${this._hide.delivered ? "" : Object.entries(this.delivery_delivered).map(([e, t]) => this.renderShipment(t))}
          </tbody>
        </table>
      </section>
    ` : "";
    }

    renderDistribution() {
      return this.distributionObject ? 0 === this.distribution_enroute.length && this._hide.delivered ? "" : 0 === this.distribution_enroute.length && 0 === this.distribution_delivered.length ? "" : O`
      <header>
        <ha-icon class="header__icon" icon="mdi:package-variant"></ha-icon>
        <h2 class="header__title">${this.translate("distribution")}</h2>
      </header>
      <section class="detail-body">
        <table>
          <thead>
            <tr>
              <th>${this.translate("title")}</th>
              <th>${this.translate("status")}</th>
              <th>${this.translate("delivery_date")}</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(this.distribution_enroute).map(([e, t]) => this.renderShipment(t))}

            ${this._hide.delivered ? "" : Object.entries(this.distribution_delivered).map(([e, t]) => this.renderShipment(t))}
          </tbody>
        </table>
      </section>
    ` : "";
    }

    renderShipment(e) {
      let t = this.translate("unknown"),
          i = "delivered";
      return null != e.delivery_date ? t = this.dateConversion(e.delivery_date) : null != e.planned_date && (i = "enroute", t = `${this.dateConversion(e.planned_date)} ${this.timeConversion(e.planned_from)} - ${this.timeConversion(e.planned_to)}`), O`
        <tr class="${i}">
          <td class="name"><a href="${e.url}" target="_blank">${e.name}</a></td>
          <td>${e.status_message}</td>
          <td>${t}</td>
        </tr>
    `;
    }

    dateConversion(e) {
      const t = oe(e);
      return t.locale(this._language), t.calendar(null, {
        sameDay: "[Today]",
        nextDay: "[Tomorrow]",
        sameElse: this.date_format
      });
    }

    timeConversion(e) {
      const t = oe(e);
      return t.locale(this._language), t.format(this.time_format);
    }

    translate(e) {
      return this._lang[this._language][e];
    }

    setConfig(e) {
      if (!e.delivery && !e.distribution && !e.letters) throw new Error("Please define entities");
      this.config = { ...e
      };
    }

    connectedCallback() {
      super.connectedCallback(), this.swiper ? this.swiper.update() : this._initialLoad();
    }

    updated(e) {
      super.updated(e), this._config && this._hass && this.isConnected ? this._initialLoad() : this.swiper && this.swiper.update();
    }

    async _initialLoad() {
      await this.updateComplete, this.swiper = new Ta(this.shadowRoot.querySelector(".swiper-container"));
    }

    getCardSize() {
      return 3;
    }

  }

  return window.customElements.define("postnl-card", ln), ln;
});
