var Cs = Object.defineProperty;
var Ls = (s, e, t) => e in s ? Cs(s, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : s[e] = t;
var E = (s, e, t) => (Ls(s, typeof e != "symbol" ? e + "" : e, t), t);
const it = Symbol.for("yaml.alias"), Ze = Symbol.for("yaml.document"), Y = Symbol.for("yaml.map"), Wt = Symbol.for("yaml.pair"), V = Symbol.for("yaml.scalar"), ae = Symbol.for("yaml.seq"), U = Symbol.for("yaml.node.type"), le = (s) => !!s && typeof s == "object" && s[U] === it, je = (s) => !!s && typeof s == "object" && s[U] === Ze, we = (s) => !!s && typeof s == "object" && s[U] === Y, C = (s) => !!s && typeof s == "object" && s[U] === Wt, N = (s) => !!s && typeof s == "object" && s[U] === V, be = (s) => !!s && typeof s == "object" && s[U] === ae;
function T(s) {
  if (s && typeof s == "object")
    switch (s[U]) {
      case Y:
      case ae:
        return !0;
    }
  return !1;
}
function v(s) {
  if (s && typeof s == "object")
    switch (s[U]) {
      case it:
      case Y:
      case V:
      case ae:
        return !0;
    }
  return !1;
}
const vs = (s) => (N(s) || T(s)) && !!s.anchor, H = Symbol("break visit"), $s = Symbol("skip children"), me = Symbol("remove node");
function x(s, e) {
  const t = Ms(e);
  je(s) ? ee(null, s.contents, t, Object.freeze([s])) === me && (s.contents = null) : ee(null, s, t, Object.freeze([]));
}
x.BREAK = H;
x.SKIP = $s;
x.REMOVE = me;
function ee(s, e, t, n) {
  const i = js(s, e, t, n);
  if (v(i) || C(i))
    return Bs(s, n, i), ee(s, i, t, n);
  if (typeof i != "symbol") {
    if (T(e)) {
      n = Object.freeze(n.concat(e));
      for (let r = 0; r < e.items.length; ++r) {
        const o = ee(r, e.items[r], t, n);
        if (typeof o == "number")
          r = o - 1;
        else {
          if (o === H)
            return H;
          o === me && (e.items.splice(r, 1), r -= 1);
        }
      }
    } else if (C(e)) {
      n = Object.freeze(n.concat(e));
      const r = ee("key", e.key, t, n);
      if (r === H)
        return H;
      r === me && (e.key = null);
      const o = ee("value", e.value, t, n);
      if (o === H)
        return H;
      o === me && (e.value = null);
    }
  }
  return i;
}
function Ms(s) {
  return typeof s == "object" && (s.Collection || s.Node || s.Value) ? Object.assign({
    Alias: s.Node,
    Map: s.Node,
    Scalar: s.Node,
    Seq: s.Node
  }, s.Value && {
    Map: s.Value,
    Scalar: s.Value,
    Seq: s.Value
  }, s.Collection && {
    Map: s.Collection,
    Seq: s.Collection
  }, s) : s;
}
function js(s, e, t, n) {
  var i, r, o, a, l;
  if (typeof t == "function")
    return t(s, e, n);
  if (we(e))
    return (i = t.Map) == null ? void 0 : i.call(t, s, e, n);
  if (be(e))
    return (r = t.Seq) == null ? void 0 : r.call(t, s, e, n);
  if (C(e))
    return (o = t.Pair) == null ? void 0 : o.call(t, s, e, n);
  if (N(e))
    return (a = t.Scalar) == null ? void 0 : a.call(t, s, e, n);
  if (le(e))
    return (l = t.Alias) == null ? void 0 : l.call(t, s, e, n);
}
function Bs(s, e, t) {
  const n = e[e.length - 1];
  if (T(n))
    n.items[s] = t;
  else if (C(n))
    s === "key" ? n.key = t : n.value = t;
  else if (je(n))
    n.contents = t;
  else {
    const i = le(n) ? "alias" : "scalar";
    throw new Error(`Cannot replace node with ${i} parent`);
  }
}
const Ds = {
  "!": "%21",
  ",": "%2C",
  "[": "%5B",
  "]": "%5D",
  "{": "%7B",
  "}": "%7D"
}, Ps = (s) => s.replace(/[!,[\]{}]/g, (e) => Ds[e]);
class j {
  constructor(e, t) {
    this.docStart = null, this.docEnd = !1, this.yaml = Object.assign({}, j.defaultYaml, e), this.tags = Object.assign({}, j.defaultTags, t);
  }
  clone() {
    const e = new j(this.yaml, this.tags);
    return e.docStart = this.docStart, e;
  }
  /**
   * During parsing, get a Directives instance for the current document and
   * update the stream state according to the current version's spec.
   */
  atDocument() {
    const e = new j(this.yaml, this.tags);
    switch (this.yaml.version) {
      case "1.1":
        this.atNextDocument = !0;
        break;
      case "1.2":
        this.atNextDocument = !1, this.yaml = {
          explicit: j.defaultYaml.explicit,
          version: "1.2"
        }, this.tags = Object.assign({}, j.defaultTags);
        break;
    }
    return e;
  }
  /**
   * @param onError - May be called even if the action was successful
   * @returns `true` on success
   */
  add(e, t) {
    this.atNextDocument && (this.yaml = { explicit: j.defaultYaml.explicit, version: "1.1" }, this.tags = Object.assign({}, j.defaultTags), this.atNextDocument = !1);
    const n = e.trim().split(/[ \t]+/), i = n.shift();
    switch (i) {
      case "%TAG": {
        if (n.length !== 2 && (t(0, "%TAG directive should contain exactly two parts"), n.length < 2))
          return !1;
        const [r, o] = n;
        return this.tags[r] = o, !0;
      }
      case "%YAML": {
        if (this.yaml.explicit = !0, n.length !== 1)
          return t(0, "%YAML directive should contain exactly one part"), !1;
        const [r] = n;
        if (r === "1.1" || r === "1.2")
          return this.yaml.version = r, !0;
        {
          const o = /^\d+\.\d+$/.test(r);
          return t(6, `Unsupported YAML version ${r}`, o), !1;
        }
      }
      default:
        return t(0, `Unknown directive ${i}`, !0), !1;
    }
  }
  /**
   * Resolves a tag, matching handles to those defined in %TAG directives.
   *
   * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
   *   `'!local'` tag, or `null` if unresolvable.
   */
  tagName(e, t) {
    if (e === "!")
      return "!";
    if (e[0] !== "!")
      return t(`Not a valid tag: ${e}`), null;
    if (e[1] === "<") {
      const o = e.slice(2, -1);
      return o === "!" || o === "!!" ? (t(`Verbatim tags aren't resolved, so ${e} is invalid.`), null) : (e[e.length - 1] !== ">" && t("Verbatim tags must end with a >"), o);
    }
    const [, n, i] = e.match(/^(.*!)([^!]*)$/s);
    i || t(`The ${e} tag has no suffix`);
    const r = this.tags[n];
    if (r)
      try {
        return r + decodeURIComponent(i);
      } catch (o) {
        return t(String(o)), null;
      }
    return n === "!" ? e : (t(`Could not resolve tag: ${e}`), null);
  }
  /**
   * Given a fully resolved tag, returns its printable string form,
   * taking into account current tag prefixes and defaults.
   */
  tagString(e) {
    for (const [t, n] of Object.entries(this.tags))
      if (e.startsWith(n))
        return t + Ps(e.substring(n.length));
    return e[0] === "!" ? e : `!<${e}>`;
  }
  toString(e) {
    const t = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [], n = Object.entries(this.tags);
    let i;
    if (e && n.length > 0 && v(e.contents)) {
      const r = {};
      x(e.contents, (o, a) => {
        v(a) && a.tag && (r[a.tag] = !0);
      }), i = Object.keys(r);
    } else
      i = [];
    for (const [r, o] of n)
      r === "!!" && o === "tag:yaml.org,2002:" || (!e || i.some((a) => a.startsWith(o))) && t.push(`%TAG ${r} ${o}`);
    return t.join(`
`);
  }
}
j.defaultYaml = { explicit: !1, version: "1.2" };
j.defaultTags = { "!!": "tag:yaml.org,2002:" };
function Ht(s) {
  if (/[\x00-\x19\s,[\]{}]/.test(s)) {
    const t = `Anchor must not contain whitespace or control characters: ${JSON.stringify(s)}`;
    throw new Error(t);
  }
  return !0;
}
function Qt(s) {
  const e = /* @__PURE__ */ new Set();
  return x(s, {
    Value(t, n) {
      n.anchor && e.add(n.anchor);
    }
  }), e;
}
function xt(s, e) {
  for (let t = 1; ; ++t) {
    const n = `${s}${t}`;
    if (!e.has(n))
      return n;
  }
}
function Rs(s, e) {
  const t = [], n = /* @__PURE__ */ new Map();
  let i = null;
  return {
    onAnchor: (r) => {
      t.push(r), i || (i = Qt(s));
      const o = xt(e, i);
      return i.add(o), o;
    },
    /**
     * With circular references, the source node is only resolved after all
     * of its child nodes are. This is why anchors are set only after all of
     * the nodes have been created.
     */
    setAnchors: () => {
      for (const r of t) {
        const o = n.get(r);
        if (typeof o == "object" && o.anchor && (N(o.node) || T(o.node)))
          o.node.anchor = o.anchor;
        else {
          const a = new Error("Failed to resolve repeated object (this should not happen)");
          throw a.source = r, a;
        }
      }
    },
    sourceObjects: n
  };
}
function te(s, e, t, n) {
  if (n && typeof n == "object")
    if (Array.isArray(n))
      for (let i = 0, r = n.length; i < r; ++i) {
        const o = n[i], a = te(s, n, String(i), o);
        a === void 0 ? delete n[i] : a !== o && (n[i] = a);
      }
    else if (n instanceof Map)
      for (const i of Array.from(n.keys())) {
        const r = n.get(i), o = te(s, n, i, r);
        o === void 0 ? n.delete(i) : o !== r && n.set(i, o);
      }
    else if (n instanceof Set)
      for (const i of Array.from(n)) {
        const r = te(s, n, i, i);
        r === void 0 ? n.delete(i) : r !== i && (n.delete(i), n.add(r));
      }
    else
      for (const [i, r] of Object.entries(n)) {
        const o = te(s, n, i, r);
        o === void 0 ? delete n[i] : o !== r && (n[i] = o);
      }
  return s.call(e, t, n);
}
function R(s, e, t) {
  if (Array.isArray(s))
    return s.map((n, i) => R(n, String(i), t));
  if (s && typeof s.toJSON == "function") {
    if (!t || !vs(s))
      return s.toJSON(e, t);
    const n = { aliasCount: 0, count: 1, res: void 0 };
    t.anchors.set(s, n), t.onCreate = (r) => {
      n.res = r, delete t.onCreate;
    };
    const i = s.toJSON(e, t);
    return t.onCreate && t.onCreate(i), i;
  }
  return typeof s == "bigint" && !(t != null && t.keep) ? Number(s) : s;
}
class rt {
  constructor(e) {
    Object.defineProperty(this, U, { value: e });
  }
  /** Create a copy of this node.  */
  clone() {
    const e = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return this.range && (e.range = this.range.slice()), e;
  }
  /** A plain JavaScript representation of this node. */
  toJS(e, { mapAsMap: t, maxAliasCount: n, onAnchor: i, reviver: r } = {}) {
    if (!je(e))
      throw new TypeError("A document argument is required");
    const o = {
      anchors: /* @__PURE__ */ new Map(),
      doc: e,
      keep: !0,
      mapAsMap: t === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof n == "number" ? n : 100
    }, a = R(this, "", o);
    if (typeof i == "function")
      for (const { count: l, res: c } of o.anchors.values())
        i(c, l);
    return typeof r == "function" ? te(r, { "": a }, "", a) : a;
  }
}
class ot extends rt {
  constructor(e) {
    super(it), this.source = e, Object.defineProperty(this, "tag", {
      set() {
        throw new Error("Alias nodes cannot have tags");
      }
    });
  }
  /**
   * Resolve the value of this alias within `doc`, finding the last
   * instance of the `source` anchor before this node.
   */
  resolve(e) {
    let t;
    return x(e, {
      Node: (n, i) => {
        if (i === this)
          return x.BREAK;
        i.anchor === this.source && (t = i);
      }
    }), t;
  }
  toJSON(e, t) {
    if (!t)
      return { source: this.source };
    const { anchors: n, doc: i, maxAliasCount: r } = t, o = this.resolve(i);
    if (!o) {
      const l = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
      throw new ReferenceError(l);
    }
    let a = n.get(o);
    if (a || (R(o, null, t), a = n.get(o)), !a || a.res === void 0) {
      const l = "This should not happen: Alias anchor was not resolved?";
      throw new ReferenceError(l);
    }
    if (r >= 0 && (a.count += 1, a.aliasCount === 0 && (a.aliasCount = Ae(i, o, n)), a.count * a.aliasCount > r)) {
      const l = "Excessive alias count indicates a resource exhaustion attack";
      throw new ReferenceError(l);
    }
    return a.res;
  }
  toString(e, t, n) {
    const i = `*${this.source}`;
    if (e) {
      if (Ht(this.source), e.options.verifyAliasOrder && !e.anchors.has(this.source)) {
        const r = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
        throw new Error(r);
      }
      if (e.implicitKey)
        return `${i} `;
    }
    return i;
  }
}
function Ae(s, e, t) {
  if (le(e)) {
    const n = e.resolve(s), i = t && n && t.get(n);
    return i ? i.count * i.aliasCount : 0;
  } else if (T(e)) {
    let n = 0;
    for (const i of e.items) {
      const r = Ae(s, i, t);
      r > n && (n = r);
    }
    return n;
  } else if (C(e)) {
    const n = Ae(s, e.key, t), i = Ae(s, e.value, t);
    return Math.max(n, i);
  }
  return 1;
}
const Xt = (s) => !s || typeof s != "function" && typeof s != "object";
class O extends rt {
  constructor(e) {
    super(V), this.value = e;
  }
  toJSON(e, t) {
    return t != null && t.keep ? this.value : R(this.value, e, t);
  }
  toString() {
    return String(this.value);
  }
}
O.BLOCK_FOLDED = "BLOCK_FOLDED";
O.BLOCK_LITERAL = "BLOCK_LITERAL";
O.PLAIN = "PLAIN";
O.QUOTE_DOUBLE = "QUOTE_DOUBLE";
O.QUOTE_SINGLE = "QUOTE_SINGLE";
const Us = "tag:yaml.org,2002:";
function Ks(s, e, t) {
  if (e) {
    const n = t.filter((r) => r.tag === e), i = n.find((r) => !r.format) ?? n[0];
    if (!i)
      throw new Error(`Tag ${e} not found`);
    return i;
  }
  return t.find((n) => {
    var i;
    return ((i = n.identify) == null ? void 0 : i.call(n, s)) && !n.format;
  });
}
function ge(s, e, t) {
  var f, u, d;
  if (je(s) && (s = s.contents), v(s))
    return s;
  if (C(s)) {
    const y = (u = (f = t.schema[Y]).createNode) == null ? void 0 : u.call(f, t.schema, null, t);
    return y.items.push(s), y;
  }
  (s instanceof String || s instanceof Number || s instanceof Boolean || typeof BigInt < "u" && s instanceof BigInt) && (s = s.valueOf());
  const { aliasDuplicateObjects: n, onAnchor: i, onTagObj: r, schema: o, sourceObjects: a } = t;
  let l;
  if (n && s && typeof s == "object") {
    if (l = a.get(s), l)
      return l.anchor || (l.anchor = i(s)), new ot(l.anchor);
    l = { anchor: null, node: null }, a.set(s, l);
  }
  e != null && e.startsWith("!!") && (e = Us + e.slice(2));
  let c = Ks(s, e, o.tags);
  if (!c) {
    if (s && typeof s.toJSON == "function" && (s = s.toJSON()), !s || typeof s != "object") {
      const y = new O(s);
      return l && (l.node = y), y;
    }
    c = s instanceof Map ? o[Y] : Symbol.iterator in Object(s) ? o[ae] : o[Y];
  }
  r && (r(c), delete t.onTagObj);
  const h = c != null && c.createNode ? c.createNode(t.schema, s, t) : typeof ((d = c == null ? void 0 : c.nodeClass) == null ? void 0 : d.from) == "function" ? c.nodeClass.from(t.schema, s, t) : new O(s);
  return e ? h.tag = e : c.default || (h.tag = c.tag), l && (l.node = h), h;
}
function Ce(s, e, t) {
  let n = t;
  for (let i = e.length - 1; i >= 0; --i) {
    const r = e[i];
    if (typeof r == "number" && Number.isInteger(r) && r >= 0) {
      const o = [];
      o[r] = n, n = o;
    } else
      n = /* @__PURE__ */ new Map([[r, n]]);
  }
  return ge(n, void 0, {
    aliasDuplicateObjects: !1,
    keepUndefined: !1,
    onAnchor: () => {
      throw new Error("This should not happen, please report a bug.");
    },
    schema: s,
    sourceObjects: /* @__PURE__ */ new Map()
  });
}
const he = (s) => s == null || typeof s == "object" && !!s[Symbol.iterator]().next().done;
class Be extends rt {
  constructor(e, t) {
    super(e), Object.defineProperty(this, "schema", {
      value: t,
      configurable: !0,
      enumerable: !1,
      writable: !0
    });
  }
  /**
   * Create a copy of this collection.
   *
   * @param schema - If defined, overwrites the original's schema
   */
  clone(e) {
    const t = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
    return e && (t.schema = e), t.items = t.items.map((n) => v(n) || C(n) ? n.clone(e) : n), this.range && (t.range = this.range.slice()), t;
  }
  /**
   * Adds a value to the collection. For `!!map` and `!!omap` the value must
   * be a Pair instance or a `{ key, value }` object, which may not have a key
   * that already exists in the map.
   */
  addIn(e, t) {
    if (he(e))
      this.add(t);
    else {
      const [n, ...i] = e, r = this.get(n, !0);
      if (T(r))
        r.addIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, Ce(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
  /**
   * Removes a value from the collection.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.delete(t);
    const i = this.get(t, !0);
    if (T(i))
      return i.deleteIn(n);
    throw new Error(`Expected YAML collection at ${t}. Remaining path: ${n}`);
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    const [n, ...i] = e, r = this.get(n, !0);
    return i.length === 0 ? !t && N(r) ? r.value : r : T(r) ? r.getIn(i, t) : void 0;
  }
  hasAllNullValues(e) {
    return this.items.every((t) => {
      if (!C(t))
        return !1;
      const n = t.value;
      return n == null || e && N(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
    });
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   */
  hasIn(e) {
    const [t, ...n] = e;
    if (n.length === 0)
      return this.has(t);
    const i = this.get(t, !0);
    return T(i) ? i.hasIn(n) : !1;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    const [n, ...i] = e;
    if (i.length === 0)
      this.set(n, t);
    else {
      const r = this.get(n, !0);
      if (T(r))
        r.setIn(i, t);
      else if (r === void 0 && this.schema)
        this.set(n, Ce(this.schema, i, t));
      else
        throw new Error(`Expected YAML collection at ${n}. Remaining path: ${i}`);
    }
  }
}
Be.maxFlowStringSingleLineLength = 60;
const Fs = (s) => s.replace(/^(?!$)(?: $)?/gm, "#");
function q(s, e) {
  return /^\n+$/.test(s) ? s.substring(1) : e ? s.replace(/^(?! *$)/gm, e) : s;
}
const J = (s, e, t) => s.endsWith(`
`) ? q(t, e) : t.includes(`
`) ? `
` + q(t, e) : (s.endsWith(" ") ? "" : " ") + t, zt = "flow", Ge = "block", Ie = "quoted";
function De(s, e, t = "flow", { indentAtStart: n, lineWidth: i = 80, minContentWidth: r = 20, onFold: o, onOverflow: a } = {}) {
  if (!i || i < 0)
    return s;
  const l = Math.max(1 + r, 1 + i - e.length);
  if (s.length <= l)
    return s;
  const c = [], h = {};
  let f = i - e.length;
  typeof n == "number" && (n > i - Math.max(2, r) ? c.push(0) : f = i - n);
  let u, d, y = !1, m = -1, p = -1, w = -1;
  t === Ge && (m = vt(s, m), m !== -1 && (f = m + l));
  for (let S; S = s[m += 1]; ) {
    if (t === Ie && S === "\\") {
      switch (p = m, s[m + 1]) {
        case "x":
          m += 3;
          break;
        case "u":
          m += 5;
          break;
        case "U":
          m += 9;
          break;
        default:
          m += 1;
      }
      w = m;
    }
    if (S === `
`)
      t === Ge && (m = vt(s, m)), f = m + l, u = void 0;
    else {
      if (S === " " && d && d !== " " && d !== `
` && d !== "	") {
        const k = s[m + 1];
        k && k !== " " && k !== `
` && k !== "	" && (u = m);
      }
      if (m >= f)
        if (u)
          c.push(u), f = u + l, u = void 0;
        else if (t === Ie) {
          for (; d === " " || d === "	"; )
            d = S, S = s[m += 1], y = !0;
          const k = m > w + 1 ? m - 2 : p - 1;
          if (h[k])
            return s;
          c.push(k), h[k] = !0, f = k + l, u = void 0;
        } else
          y = !0;
    }
    d = S;
  }
  if (y && a && a(), c.length === 0)
    return s;
  o && o();
  let b = s.slice(0, c[0]);
  for (let S = 0; S < c.length; ++S) {
    const k = c[S], _ = c[S + 1] || s.length;
    k === 0 ? b = `
${e}${s.slice(0, _)}` : (t === Ie && h[k] && (b += `${s[k]}\\`), b += `
${e}${s.slice(k + 1, _)}`);
  }
  return b;
}
function vt(s, e) {
  let t = s[e + 1];
  for (; t === " " || t === "	"; ) {
    do
      t = s[e += 1];
    while (t && t !== `
`);
    t = s[e + 1];
  }
  return e;
}
const Pe = (s, e) => ({
  indentAtStart: e ? s.indent.length : s.indentAtStart,
  lineWidth: s.options.lineWidth,
  minContentWidth: s.options.minContentWidth
}), Re = (s) => /^(%|---|\.\.\.)/m.test(s);
function qs(s, e, t) {
  if (!e || e < 0)
    return !1;
  const n = e - t, i = s.length;
  if (i <= n)
    return !1;
  for (let r = 0, o = 0; r < i; ++r)
    if (s[r] === `
`) {
      if (r - o > n)
        return !0;
      if (o = r + 1, i - o <= n)
        return !1;
    }
  return !0;
}
function pe(s, e) {
  const t = JSON.stringify(s);
  if (e.options.doubleQuotedAsJSON)
    return t;
  const { implicitKey: n } = e, i = e.options.doubleQuotedMinMultiLineLength, r = e.indent || (Re(s) ? "  " : "");
  let o = "", a = 0;
  for (let l = 0, c = t[l]; c; c = t[++l])
    if (c === " " && t[l + 1] === "\\" && t[l + 2] === "n" && (o += t.slice(a, l) + "\\ ", l += 1, a = l, c = "\\"), c === "\\")
      switch (t[l + 1]) {
        case "u":
          {
            o += t.slice(a, l);
            const h = t.substr(l + 2, 4);
            switch (h) {
              case "0000":
                o += "\\0";
                break;
              case "0007":
                o += "\\a";
                break;
              case "000b":
                o += "\\v";
                break;
              case "001b":
                o += "\\e";
                break;
              case "0085":
                o += "\\N";
                break;
              case "00a0":
                o += "\\_";
                break;
              case "2028":
                o += "\\L";
                break;
              case "2029":
                o += "\\P";
                break;
              default:
                h.substr(0, 2) === "00" ? o += "\\x" + h.substr(2) : o += t.substr(l, 6);
            }
            l += 5, a = l + 1;
          }
          break;
        case "n":
          if (n || t[l + 2] === '"' || t.length < i)
            l += 1;
          else {
            for (o += t.slice(a, l) + `

`; t[l + 2] === "\\" && t[l + 3] === "n" && t[l + 4] !== '"'; )
              o += `
`, l += 2;
            o += r, t[l + 2] === " " && (o += "\\"), l += 1, a = l + 1;
          }
          break;
        default:
          l += 1;
      }
  return o = a ? o + t.slice(a) : t, n ? o : De(o, r, Ie, Pe(e, !1));
}
function et(s, e) {
  if (e.options.singleQuote === !1 || e.implicitKey && s.includes(`
`) || /[ \t]\n|\n[ \t]/.test(s))
    return pe(s, e);
  const t = e.indent || (Re(s) ? "  " : ""), n = "'" + s.replace(/'/g, "''").replace(/\n+/g, `$&
${t}`) + "'";
  return e.implicitKey ? n : De(n, t, zt, Pe(e, !1));
}
function se(s, e) {
  const { singleQuote: t } = e.options;
  let n;
  if (t === !1)
    n = pe;
  else {
    const i = s.includes('"'), r = s.includes("'");
    i && !r ? n = et : r && !i ? n = pe : n = t ? et : pe;
  }
  return n(s, e);
}
let tt;
try {
  tt = new RegExp(`(^|(?<!
))
+(?!
|$)`, "g");
} catch {
  tt = /\n+(?!\n|$)/g;
}
function Te({ comment: s, type: e, value: t }, n, i, r) {
  const { blockQuote: o, commentString: a, lineWidth: l } = n.options;
  if (!o || /\n[\t ]+$/.test(t) || /^\s*$/.test(t))
    return se(t, n);
  const c = n.indent || (n.forceBlockIndent || Re(t) ? "  " : ""), h = o === "literal" ? !0 : o === "folded" || e === O.BLOCK_FOLDED ? !1 : e === O.BLOCK_LITERAL ? !0 : !qs(t, l, c.length);
  if (!t)
    return h ? `|
` : `>
`;
  let f, u;
  for (u = t.length; u > 0; --u) {
    const g = t[u - 1];
    if (g !== `
` && g !== "	" && g !== " ")
      break;
  }
  let d = t.substring(u);
  const y = d.indexOf(`
`);
  y === -1 ? f = "-" : t === d || y !== d.length - 1 ? (f = "+", r && r()) : f = "", d && (t = t.slice(0, -d.length), d[d.length - 1] === `
` && (d = d.slice(0, -1)), d = d.replace(tt, `$&${c}`));
  let m = !1, p, w = -1;
  for (p = 0; p < t.length; ++p) {
    const g = t[p];
    if (g === " ")
      m = !0;
    else if (g === `
`)
      w = p;
    else
      break;
  }
  let b = t.substring(0, w < p ? w + 1 : p);
  b && (t = t.substring(b.length), b = b.replace(/\n+/g, `$&${c}`));
  let k = (h ? "|" : ">") + (m ? c ? "2" : "1" : "") + f;
  if (s && (k += " " + a(s.replace(/ ?[\r\n]+/g, " ")), i && i()), h)
    return t = t.replace(/\n+/g, `$&${c}`), `${k}
${c}${b}${t}${d}`;
  t = t.replace(/\n+/g, `
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${c}`);
  const _ = De(`${b}${t}${d}`, c, Ge, Pe(n, !0));
  return `${k}
${c}${_}`;
}
function Vs(s, e, t, n) {
  const { type: i, value: r } = s, { actualString: o, implicitKey: a, indent: l, indentStep: c, inFlow: h } = e;
  if (a && r.includes(`
`) || h && /[[\]{},]/.test(r))
    return se(r, e);
  if (!r || /^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(r))
    return a || h || !r.includes(`
`) ? se(r, e) : Te(s, e, t, n);
  if (!a && !h && i !== O.PLAIN && r.includes(`
`))
    return Te(s, e, t, n);
  if (Re(r)) {
    if (l === "")
      return e.forceBlockIndent = !0, Te(s, e, t, n);
    if (a && l === c)
      return se(r, e);
  }
  const f = r.replace(/\n+/g, `$&
${l}`);
  if (o) {
    const u = (m) => {
      var p;
      return m.default && m.tag !== "tag:yaml.org,2002:str" && ((p = m.test) == null ? void 0 : p.test(f));
    }, { compat: d, tags: y } = e.doc.schema;
    if (y.some(u) || d != null && d.some(u))
      return se(r, e);
  }
  return a ? f : De(f, l, zt, Pe(e, !1));
}
function at(s, e, t, n) {
  const { implicitKey: i, inFlow: r } = e, o = typeof s.value == "string" ? s : Object.assign({}, s, { value: String(s.value) });
  let { type: a } = s;
  a !== O.QUOTE_DOUBLE && /[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value) && (a = O.QUOTE_DOUBLE);
  const l = (h) => {
    switch (h) {
      case O.BLOCK_FOLDED:
      case O.BLOCK_LITERAL:
        return i || r ? se(o.value, e) : Te(o, e, t, n);
      case O.QUOTE_DOUBLE:
        return pe(o.value, e);
      case O.QUOTE_SINGLE:
        return et(o.value, e);
      case O.PLAIN:
        return Vs(o, e, t, n);
      default:
        return null;
    }
  };
  let c = l(a);
  if (c === null) {
    const { defaultKeyType: h, defaultStringType: f } = e.options, u = i && h || f;
    if (c = l(u), c === null)
      throw new Error(`Unsupported default string type ${u}`);
  }
  return c;
}
function Zt(s, e) {
  const t = Object.assign({
    blockQuote: !0,
    commentString: Fs,
    defaultKeyType: null,
    defaultStringType: "PLAIN",
    directives: null,
    doubleQuotedAsJSON: !1,
    doubleQuotedMinMultiLineLength: 40,
    falseStr: "false",
    flowCollectionPadding: !0,
    indentSeq: !0,
    lineWidth: 80,
    minContentWidth: 20,
    nullStr: "null",
    simpleKeys: !1,
    singleQuote: null,
    trueStr: "true",
    verifyAliasOrder: !0
  }, s.schema.toStringOptions, e);
  let n;
  switch (t.collectionStyle) {
    case "block":
      n = !1;
      break;
    case "flow":
      n = !0;
      break;
    default:
      n = null;
  }
  return {
    anchors: /* @__PURE__ */ new Set(),
    doc: s,
    flowCollectionPadding: t.flowCollectionPadding ? " " : "",
    indent: "",
    indentStep: typeof t.indent == "number" ? " ".repeat(t.indent) : "  ",
    inFlow: n,
    options: t
  };
}
function Js(s, e) {
  var i;
  if (e.tag) {
    const r = s.filter((o) => o.tag === e.tag);
    if (r.length > 0)
      return r.find((o) => o.format === e.format) ?? r[0];
  }
  let t, n;
  if (N(e)) {
    n = e.value;
    const r = s.filter((o) => {
      var a;
      return (a = o.identify) == null ? void 0 : a.call(o, n);
    });
    t = r.find((o) => o.format === e.format) ?? r.find((o) => !o.format);
  } else
    n = e, t = s.find((r) => r.nodeClass && n instanceof r.nodeClass);
  if (!t) {
    const r = ((i = n == null ? void 0 : n.constructor) == null ? void 0 : i.name) ?? typeof n;
    throw new Error(`Tag not resolved for ${r} value`);
  }
  return t;
}
function Ys(s, e, { anchors: t, doc: n }) {
  if (!n.directives)
    return "";
  const i = [], r = (N(s) || T(s)) && s.anchor;
  r && Ht(r) && (t.add(r), i.push(`&${r}`));
  const o = s.tag ? s.tag : e.default ? null : e.tag;
  return o && i.push(n.directives.tagString(o)), i.join(" ");
}
function re(s, e, t, n) {
  var l;
  if (C(s))
    return s.toString(e, t, n);
  if (le(s)) {
    if (e.doc.directives)
      return s.toString(e);
    if ((l = e.resolvedAliases) != null && l.has(s))
      throw new TypeError("Cannot stringify circular structure without alias nodes");
    e.resolvedAliases ? e.resolvedAliases.add(s) : e.resolvedAliases = /* @__PURE__ */ new Set([s]), s = s.resolve(e.doc);
  }
  let i;
  const r = v(s) ? s : e.doc.createNode(s, { onTagObj: (c) => i = c });
  i || (i = Js(e.doc.schema.tags, r));
  const o = Ys(r, i, e);
  o.length > 0 && (e.indentAtStart = (e.indentAtStart ?? 0) + o.length + 1);
  const a = typeof i.stringify == "function" ? i.stringify(r, e, t, n) : N(r) ? at(r, e, t, n) : r.toString(e, t, n);
  return o ? N(r) || a[0] === "{" || a[0] === "[" ? `${o} ${a}` : `${o}
${e.indent}${a}` : a;
}
function Ws({ key: s, value: e }, t, n, i) {
  const { allNullValues: r, doc: o, indent: a, indentStep: l, options: { commentString: c, indentSeq: h, simpleKeys: f } } = t;
  let u = v(s) && s.comment || null;
  if (f) {
    if (u)
      throw new Error("With simple keys, key nodes cannot have comments");
    if (T(s)) {
      const A = "With simple keys, collection cannot be used as a key value";
      throw new Error(A);
    }
  }
  let d = !f && (!s || u && e == null && !t.inFlow || T(s) || (N(s) ? s.type === O.BLOCK_FOLDED || s.type === O.BLOCK_LITERAL : typeof s == "object"));
  t = Object.assign({}, t, {
    allNullValues: !1,
    implicitKey: !d && (f || !r),
    indent: a + l
  });
  let y = !1, m = !1, p = re(s, t, () => y = !0, () => m = !0);
  if (!d && !t.inFlow && p.length > 1024) {
    if (f)
      throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
    d = !0;
  }
  if (t.inFlow) {
    if (r || e == null)
      return y && n && n(), p === "" ? "?" : d ? `? ${p}` : p;
  } else if (r && !f || e == null && d)
    return p = `? ${p}`, u && !y ? p += J(p, t.indent, c(u)) : m && i && i(), p;
  y && (u = null), d ? (u && (p += J(p, t.indent, c(u))), p = `? ${p}
${a}:`) : (p = `${p}:`, u && (p += J(p, t.indent, c(u))));
  let w, b, S;
  v(e) ? (w = !!e.spaceBefore, b = e.commentBefore, S = e.comment) : (w = !1, b = null, S = null, e && typeof e == "object" && (e = o.createNode(e))), t.implicitKey = !1, !d && !u && N(e) && (t.indentAtStart = p.length + 1), m = !1, !h && l.length >= 2 && !t.inFlow && !d && be(e) && !e.flow && !e.tag && !e.anchor && (t.indent = t.indent.substring(2));
  let k = !1;
  const _ = re(e, t, () => k = !0, () => m = !0);
  let g = " ";
  if (u || w || b) {
    if (g = w ? `
` : "", b) {
      const A = c(b);
      g += `
${q(A, t.indent)}`;
    }
    _ === "" && !t.inFlow ? g === `
` && (g = `

`) : g += `
${t.indent}`;
  } else if (!d && T(e)) {
    const A = _[0], I = _.indexOf(`
`), M = I !== -1, W = t.inFlow ?? e.flow ?? e.items.length === 0;
    if (M || !W) {
      let z = !1;
      if (M && (A === "&" || A === "!")) {
        let $ = _.indexOf(" ");
        A === "&" && $ !== -1 && $ < I && _[$ + 1] === "!" && ($ = _.indexOf(" ", $ + 1)), ($ === -1 || I < $) && (z = !0);
      }
      z || (g = `
${t.indent}`);
    }
  } else
    (_ === "" || _[0] === `
`) && (g = "");
  return p += g + _, t.inFlow ? k && n && n() : S && !k ? p += J(p, t.indent, c(S)) : m && i && i(), p;
}
function Gt(s, e) {
  (s === "debug" || s === "warn") && (typeof process < "u" && process.emitWarning ? process.emitWarning(e) : console.warn(e));
}
const $t = "<<";
function es(s, e, { key: t, value: n }) {
  if (s != null && s.doc.schema.merge && Hs(t))
    if (n = le(n) ? n.resolve(s.doc) : n, be(n))
      for (const i of n.items)
        Ye(s, e, i);
    else if (Array.isArray(n))
      for (const i of n)
        Ye(s, e, i);
    else
      Ye(s, e, n);
  else {
    const i = R(t, "", s);
    if (e instanceof Map)
      e.set(i, R(n, i, s));
    else if (e instanceof Set)
      e.add(i);
    else {
      const r = Qs(t, i, s), o = R(n, r, s);
      r in e ? Object.defineProperty(e, r, {
        value: o,
        writable: !0,
        enumerable: !0,
        configurable: !0
      }) : e[r] = o;
    }
  }
  return e;
}
const Hs = (s) => s === $t || N(s) && s.value === $t && (!s.type || s.type === O.PLAIN);
function Ye(s, e, t) {
  const n = s && le(t) ? t.resolve(s.doc) : t;
  if (!we(n))
    throw new Error("Merge sources must be maps or map aliases");
  const i = n.toJSON(null, s, Map);
  for (const [r, o] of i)
    e instanceof Map ? e.has(r) || e.set(r, o) : e instanceof Set ? e.add(r) : Object.prototype.hasOwnProperty.call(e, r) || Object.defineProperty(e, r, {
      value: o,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  return e;
}
function Qs(s, e, t) {
  if (e === null)
    return "";
  if (typeof e != "object")
    return String(e);
  if (v(s) && (t != null && t.doc)) {
    const n = Zt(t.doc, {});
    n.anchors = /* @__PURE__ */ new Set();
    for (const r of t.anchors.keys())
      n.anchors.add(r.anchor);
    n.inFlow = !0, n.inStringifyKey = !0;
    const i = s.toString(n);
    if (!t.mapKeyWarned) {
      let r = JSON.stringify(i);
      r.length > 40 && (r = r.substring(0, 36) + '..."'), Gt(t.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${r}. Set mapAsMap: true to use object keys.`), t.mapKeyWarned = !0;
    }
    return i;
  }
  return JSON.stringify(e);
}
function lt(s, e, t) {
  const n = ge(s, void 0, t), i = ge(e, void 0, t);
  return new B(n, i);
}
class B {
  constructor(e, t = null) {
    Object.defineProperty(this, U, { value: Wt }), this.key = e, this.value = t;
  }
  clone(e) {
    let { key: t, value: n } = this;
    return v(t) && (t = t.clone(e)), v(n) && (n = n.clone(e)), new B(t, n);
  }
  toJSON(e, t) {
    const n = t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    return es(t, n, this);
  }
  toString(e, t, n) {
    return e != null && e.doc ? Ws(this, e, t, n) : JSON.stringify(this);
  }
}
function ts(s, e, t) {
  return (e.inFlow ?? s.flow ? Xs : xs)(s, e, t);
}
function xs({ comment: s, items: e }, t, { blockItemPrefix: n, flowChars: i, itemIndent: r, onChompKeep: o, onComment: a }) {
  const { indent: l, options: { commentString: c } } = t, h = Object.assign({}, t, { indent: r, type: null });
  let f = !1;
  const u = [];
  for (let y = 0; y < e.length; ++y) {
    const m = e[y];
    let p = null;
    if (v(m))
      !f && m.spaceBefore && u.push(""), Le(t, u, m.commentBefore, f), m.comment && (p = m.comment);
    else if (C(m)) {
      const b = v(m.key) ? m.key : null;
      b && (!f && b.spaceBefore && u.push(""), Le(t, u, b.commentBefore, f));
    }
    f = !1;
    let w = re(m, h, () => p = null, () => f = !0);
    p && (w += J(w, r, c(p))), f && p && (f = !1), u.push(n + w);
  }
  let d;
  if (u.length === 0)
    d = i.start + i.end;
  else {
    d = u[0];
    for (let y = 1; y < u.length; ++y) {
      const m = u[y];
      d += m ? `
${l}${m}` : `
`;
    }
  }
  return s ? (d += `
` + q(c(s), l), a && a()) : f && o && o(), d;
}
function Xs({ comment: s, items: e }, t, { flowChars: n, itemIndent: i, onComment: r }) {
  const { indent: o, indentStep: a, flowCollectionPadding: l, options: { commentString: c } } = t;
  i += a;
  const h = Object.assign({}, t, {
    indent: i,
    inFlow: !0,
    type: null
  });
  let f = !1, u = 0;
  const d = [];
  for (let w = 0; w < e.length; ++w) {
    const b = e[w];
    let S = null;
    if (v(b))
      b.spaceBefore && d.push(""), Le(t, d, b.commentBefore, !1), b.comment && (S = b.comment);
    else if (C(b)) {
      const _ = v(b.key) ? b.key : null;
      _ && (_.spaceBefore && d.push(""), Le(t, d, _.commentBefore, !1), _.comment && (f = !0));
      const g = v(b.value) ? b.value : null;
      g ? (g.comment && (S = g.comment), g.commentBefore && (f = !0)) : b.value == null && (_ != null && _.comment) && (S = _.comment);
    }
    S && (f = !0);
    let k = re(b, h, () => S = null);
    w < e.length - 1 && (k += ","), S && (k += J(k, i, c(S))), !f && (d.length > u || k.includes(`
`)) && (f = !0), d.push(k), u = d.length;
  }
  let y;
  const { start: m, end: p } = n;
  if (d.length === 0)
    y = m + p;
  else if (f || (f = d.reduce((b, S) => b + S.length + 2, 2) > Be.maxFlowStringSingleLineLength), f) {
    y = m;
    for (const w of d)
      y += w ? `
${a}${o}${w}` : `
`;
    y += `
${o}${p}`;
  } else
    y = `${m}${l}${d.join(" ")}${l}${p}`;
  return s && (y += J(y, o, c(s)), r && r()), y;
}
function Le({ indent: s, options: { commentString: e } }, t, n, i) {
  if (n && i && (n = n.replace(/^\n+/, "")), n) {
    const r = q(e(n), s);
    t.push(r.trimStart());
  }
}
function Q(s, e) {
  const t = N(e) ? e.value : e;
  for (const n of s)
    if (C(n) && (n.key === e || n.key === t || N(n.key) && n.key.value === t))
      return n;
}
class P extends Be {
  static get tagName() {
    return "tag:yaml.org,2002:map";
  }
  constructor(e) {
    super(Y, e), this.items = [];
  }
  /**
   * A generic collection parsing method that can be extended
   * to other node classes that inherit from YAMLMap
   */
  static from(e, t, n) {
    const { keepUndefined: i, replacer: r } = n, o = new this(e), a = (l, c) => {
      if (typeof r == "function")
        c = r.call(t, l, c);
      else if (Array.isArray(r) && !r.includes(l))
        return;
      (c !== void 0 || i) && o.items.push(lt(l, c, n));
    };
    if (t instanceof Map)
      for (const [l, c] of t)
        a(l, c);
    else if (t && typeof t == "object")
      for (const l of Object.keys(t))
        a(l, t[l]);
    return typeof e.sortMapEntries == "function" && o.items.sort(e.sortMapEntries), o;
  }
  /**
   * Adds a value to the collection.
   *
   * @param overwrite - If not set `true`, using a key that is already in the
   *   collection will throw. Otherwise, overwrites the previous value.
   */
  add(e, t) {
    var o;
    let n;
    C(e) ? n = e : !e || typeof e != "object" || !("key" in e) ? n = new B(e, e == null ? void 0 : e.value) : n = new B(e.key, e.value);
    const i = Q(this.items, n.key), r = (o = this.schema) == null ? void 0 : o.sortMapEntries;
    if (i) {
      if (!t)
        throw new Error(`Key ${n.key} already set`);
      N(i.value) && Xt(n.value) ? i.value.value = n.value : i.value = n.value;
    } else if (r) {
      const a = this.items.findIndex((l) => r(n, l) < 0);
      a === -1 ? this.items.push(n) : this.items.splice(a, 0, n);
    } else
      this.items.push(n);
  }
  delete(e) {
    const t = Q(this.items, e);
    return t ? this.items.splice(this.items.indexOf(t), 1).length > 0 : !1;
  }
  get(e, t) {
    const n = Q(this.items, e), i = n == null ? void 0 : n.value;
    return (!t && N(i) ? i.value : i) ?? void 0;
  }
  has(e) {
    return !!Q(this.items, e);
  }
  set(e, t) {
    this.add(new B(e, t), !0);
  }
  /**
   * @param ctx - Conversion context, originally set in Document#toJS()
   * @param {Class} Type - If set, forces the returned collection type
   * @returns Instance of Type, Map, or Object
   */
  toJSON(e, t, n) {
    const i = n ? new n() : t != null && t.mapAsMap ? /* @__PURE__ */ new Map() : {};
    t != null && t.onCreate && t.onCreate(i);
    for (const r of this.items)
      es(t, i, r);
    return i;
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    for (const i of this.items)
      if (!C(i))
        throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);
    return !e.allNullValues && this.hasAllNullValues(!1) && (e = Object.assign({}, e, { allNullValues: !0 })), ts(this, e, {
      blockItemPrefix: "",
      flowChars: { start: "{", end: "}" },
      itemIndent: e.indent || "",
      onChompKeep: n,
      onComment: t
    });
  }
}
const ce = {
  collection: "map",
  default: !0,
  nodeClass: P,
  tag: "tag:yaml.org,2002:map",
  resolve(s, e) {
    return we(s) || e("Expected a mapping for this tag"), s;
  },
  createNode: (s, e, t) => P.from(s, e, t)
};
class X extends Be {
  static get tagName() {
    return "tag:yaml.org,2002:seq";
  }
  constructor(e) {
    super(ae, e), this.items = [];
  }
  add(e) {
    this.items.push(e);
  }
  /**
   * Removes a value from the collection.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   *
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    const t = _e(e);
    return typeof t != "number" ? !1 : this.items.splice(t, 1).length > 0;
  }
  get(e, t) {
    const n = _e(e);
    if (typeof n != "number")
      return;
    const i = this.items[n];
    return !t && N(i) ? i.value : i;
  }
  /**
   * Checks if the collection includes a value with the key `key`.
   *
   * `key` must contain a representation of an integer for this to succeed.
   * It may be wrapped in a `Scalar`.
   */
  has(e) {
    const t = _e(e);
    return typeof t == "number" && t < this.items.length;
  }
  /**
   * Sets a value in this collection. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   *
   * If `key` does not contain a representation of an integer, this will throw.
   * It may be wrapped in a `Scalar`.
   */
  set(e, t) {
    const n = _e(e);
    if (typeof n != "number")
      throw new Error(`Expected a valid index, not ${e}.`);
    const i = this.items[n];
    N(i) && Xt(t) ? i.value = t : this.items[n] = t;
  }
  toJSON(e, t) {
    const n = [];
    t != null && t.onCreate && t.onCreate(n);
    let i = 0;
    for (const r of this.items)
      n.push(R(r, String(i++), t));
    return n;
  }
  toString(e, t, n) {
    return e ? ts(this, e, {
      blockItemPrefix: "- ",
      flowChars: { start: "[", end: "]" },
      itemIndent: (e.indent || "") + "  ",
      onChompKeep: n,
      onComment: t
    }) : JSON.stringify(this);
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t)) {
      let o = 0;
      for (let a of t) {
        if (typeof i == "function") {
          const l = t instanceof Set ? a : String(o++);
          a = i.call(t, l, a);
        }
        r.items.push(ge(a, void 0, n));
      }
    }
    return r;
  }
}
function _e(s) {
  let e = N(s) ? s.value : s;
  return e && typeof e == "string" && (e = Number(e)), typeof e == "number" && Number.isInteger(e) && e >= 0 ? e : null;
}
const fe = {
  collection: "seq",
  default: !0,
  nodeClass: X,
  tag: "tag:yaml.org,2002:seq",
  resolve(s, e) {
    return be(s) || e("Expected a sequence for this tag"), s;
  },
  createNode: (s, e, t) => X.from(s, e, t)
}, Ue = {
  identify: (s) => typeof s == "string",
  default: !0,
  tag: "tag:yaml.org,2002:str",
  resolve: (s) => s,
  stringify(s, e, t, n) {
    return e = Object.assign({ actualString: !0 }, e), at(s, e, t, n);
  }
}, Ke = {
  identify: (s) => s == null,
  createNode: () => new O(null),
  default: !0,
  tag: "tag:yaml.org,2002:null",
  test: /^(?:~|[Nn]ull|NULL)?$/,
  resolve: () => new O(null),
  stringify: ({ source: s }, e) => typeof s == "string" && Ke.test.test(s) ? s : e.options.nullStr
}, ct = {
  identify: (s) => typeof s == "boolean",
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
  resolve: (s) => new O(s[0] === "t" || s[0] === "T"),
  stringify({ source: s, value: e }, t) {
    if (s && ct.test.test(s)) {
      const n = s[0] === "t" || s[0] === "T";
      if (e === n)
        return s;
    }
    return e ? t.options.trueStr : t.options.falseStr;
  }
};
function F({ format: s, minFractionDigits: e, tag: t, value: n }) {
  if (typeof n == "bigint")
    return String(n);
  const i = typeof n == "number" ? n : Number(n);
  if (!isFinite(i))
    return isNaN(i) ? ".nan" : i < 0 ? "-.inf" : ".inf";
  let r = JSON.stringify(n);
  if (!s && e && (!t || t === "tag:yaml.org,2002:float") && /^\d/.test(r)) {
    let o = r.indexOf(".");
    o < 0 && (o = r.length, r += ".");
    let a = e - (r.length - o - 1);
    for (; a-- > 0; )
      r += "0";
  }
  return r;
}
const ss = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^(?:[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN))$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: F
}, ns = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : F(s);
  }
}, is = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
  resolve(s) {
    const e = new O(parseFloat(s)), t = s.indexOf(".");
    return t !== -1 && s[s.length - 1] === "0" && (e.minFractionDigits = s.length - t - 1), e;
  },
  stringify: F
}, Fe = (s) => typeof s == "bigint" || Number.isInteger(s), ft = (s, e, t, { intAsBigInt: n }) => n ? BigInt(s) : parseInt(s.substring(e), t);
function rs(s, e, t) {
  const { value: n } = s;
  return Fe(n) && n >= 0 ? t + n.toString(e) : F(s);
}
const os = {
  identify: (s) => Fe(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^0o[0-7]+$/,
  resolve: (s, e, t) => ft(s, 2, 8, t),
  stringify: (s) => rs(s, 8, "0o")
}, as = {
  identify: Fe,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9]+$/,
  resolve: (s, e, t) => ft(s, 0, 10, t),
  stringify: F
}, ls = {
  identify: (s) => Fe(s) && s >= 0,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^0x[0-9a-fA-F]+$/,
  resolve: (s, e, t) => ft(s, 2, 16, t),
  stringify: (s) => rs(s, 16, "0x")
}, zs = [
  ce,
  fe,
  Ue,
  Ke,
  ct,
  os,
  as,
  ls,
  ss,
  ns,
  is
];
function Mt(s) {
  return typeof s == "bigint" || Number.isInteger(s);
}
const Oe = ({ value: s }) => JSON.stringify(s), Zs = [
  {
    identify: (s) => typeof s == "string",
    default: !0,
    tag: "tag:yaml.org,2002:str",
    resolve: (s) => s,
    stringify: Oe
  },
  {
    identify: (s) => s == null,
    createNode: () => new O(null),
    default: !0,
    tag: "tag:yaml.org,2002:null",
    test: /^null$/,
    resolve: () => null,
    stringify: Oe
  },
  {
    identify: (s) => typeof s == "boolean",
    default: !0,
    tag: "tag:yaml.org,2002:bool",
    test: /^true|false$/,
    resolve: (s) => s === "true",
    stringify: Oe
  },
  {
    identify: Mt,
    default: !0,
    tag: "tag:yaml.org,2002:int",
    test: /^-?(?:0|[1-9][0-9]*)$/,
    resolve: (s, e, { intAsBigInt: t }) => t ? BigInt(s) : parseInt(s, 10),
    stringify: ({ value: s }) => Mt(s) ? s.toString() : JSON.stringify(s)
  },
  {
    identify: (s) => typeof s == "number",
    default: !0,
    tag: "tag:yaml.org,2002:float",
    test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
    resolve: (s) => parseFloat(s),
    stringify: Oe
  }
], Gs = {
  default: !0,
  tag: "",
  test: /^/,
  resolve(s, e) {
    return e(`Unresolved plain scalar ${JSON.stringify(s)}`), s;
  }
}, en = [ce, fe].concat(Zs, Gs), ut = {
  identify: (s) => s instanceof Uint8Array,
  default: !1,
  tag: "tag:yaml.org,2002:binary",
  /**
   * Returns a Buffer in node and an Uint8Array in browsers
   *
   * To use the resulting buffer as an image, you'll want to do something like:
   *
   *   const blob = new Blob([buffer], { type: 'image/jpeg' })
   *   document.querySelector('#photo').src = URL.createObjectURL(blob)
   */
  resolve(s, e) {
    if (typeof Buffer == "function")
      return Buffer.from(s, "base64");
    if (typeof atob == "function") {
      const t = atob(s.replace(/[\n\r]/g, "")), n = new Uint8Array(t.length);
      for (let i = 0; i < t.length; ++i)
        n[i] = t.charCodeAt(i);
      return n;
    } else
      return e("This environment does not support reading binary tags; either Buffer or atob is required"), s;
  },
  stringify({ comment: s, type: e, value: t }, n, i, r) {
    const o = t;
    let a;
    if (typeof Buffer == "function")
      a = o instanceof Buffer ? o.toString("base64") : Buffer.from(o.buffer).toString("base64");
    else if (typeof btoa == "function") {
      let l = "";
      for (let c = 0; c < o.length; ++c)
        l += String.fromCharCode(o[c]);
      a = btoa(l);
    } else
      throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
    if (e || (e = O.BLOCK_LITERAL), e !== O.QUOTE_DOUBLE) {
      const l = Math.max(n.options.lineWidth - n.indent.length, n.options.minContentWidth), c = Math.ceil(a.length / l), h = new Array(c);
      for (let f = 0, u = 0; f < c; ++f, u += l)
        h[f] = a.substr(u, l);
      a = h.join(e === O.BLOCK_LITERAL ? `
` : " ");
    }
    return at({ comment: s, type: e, value: a }, n, i, r);
  }
};
function cs(s, e) {
  if (be(s))
    for (let t = 0; t < s.items.length; ++t) {
      let n = s.items[t];
      if (!C(n)) {
        if (we(n)) {
          n.items.length > 1 && e("Each pair must have its own sequence indicator");
          const i = n.items[0] || new B(new O(null));
          if (n.commentBefore && (i.key.commentBefore = i.key.commentBefore ? `${n.commentBefore}
${i.key.commentBefore}` : n.commentBefore), n.comment) {
            const r = i.value ?? i.key;
            r.comment = r.comment ? `${n.comment}
${r.comment}` : n.comment;
          }
          n = i;
        }
        s.items[t] = C(n) ? n : new B(n);
      }
    }
  else
    e("Expected a sequence for this tag");
  return s;
}
function fs(s, e, t) {
  const { replacer: n } = t, i = new X(s);
  i.tag = "tag:yaml.org,2002:pairs";
  let r = 0;
  if (e && Symbol.iterator in Object(e))
    for (let o of e) {
      typeof n == "function" && (o = n.call(e, String(r++), o));
      let a, l;
      if (Array.isArray(o))
        if (o.length === 2)
          a = o[0], l = o[1];
        else
          throw new TypeError(`Expected [key, value] tuple: ${o}`);
      else if (o && o instanceof Object) {
        const c = Object.keys(o);
        if (c.length === 1)
          a = c[0], l = o[a];
        else
          throw new TypeError(`Expected tuple with one key, not ${c.length} keys`);
      } else
        a = o;
      i.items.push(lt(a, l, t));
    }
  return i;
}
const ht = {
  collection: "seq",
  default: !1,
  tag: "tag:yaml.org,2002:pairs",
  resolve: cs,
  createNode: fs
};
class ne extends X {
  constructor() {
    super(), this.add = P.prototype.add.bind(this), this.delete = P.prototype.delete.bind(this), this.get = P.prototype.get.bind(this), this.has = P.prototype.has.bind(this), this.set = P.prototype.set.bind(this), this.tag = ne.tag;
  }
  /**
   * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
   * but TypeScript won't allow widening the signature of a child method.
   */
  toJSON(e, t) {
    if (!t)
      return super.toJSON(e);
    const n = /* @__PURE__ */ new Map();
    t != null && t.onCreate && t.onCreate(n);
    for (const i of this.items) {
      let r, o;
      if (C(i) ? (r = R(i.key, "", t), o = R(i.value, r, t)) : r = R(i, "", t), n.has(r))
        throw new Error("Ordered maps must not include duplicate keys");
      n.set(r, o);
    }
    return n;
  }
  static from(e, t, n) {
    const i = fs(e, t, n), r = new this();
    return r.items = i.items, r;
  }
}
ne.tag = "tag:yaml.org,2002:omap";
const dt = {
  collection: "seq",
  identify: (s) => s instanceof Map,
  nodeClass: ne,
  default: !1,
  tag: "tag:yaml.org,2002:omap",
  resolve(s, e) {
    const t = cs(s, e), n = [];
    for (const { key: i } of t.items)
      N(i) && (n.includes(i.value) ? e(`Ordered maps must not include duplicate keys: ${i.value}`) : n.push(i.value));
    return Object.assign(new ne(), t);
  },
  createNode: (s, e, t) => ne.from(s, e, t)
};
function us({ value: s, source: e }, t) {
  return e && (s ? hs : ds).test.test(e) ? e : s ? t.options.trueStr : t.options.falseStr;
}
const hs = {
  identify: (s) => s === !0,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
  resolve: () => new O(!0),
  stringify: us
}, ds = {
  identify: (s) => s === !1,
  default: !0,
  tag: "tag:yaml.org,2002:bool",
  test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/i,
  resolve: () => new O(!1),
  stringify: us
}, tn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?\.(?:inf|Inf|INF|nan|NaN|NAN)$/,
  resolve: (s) => s.slice(-3).toLowerCase() === "nan" ? NaN : s[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
  stringify: F
}, sn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "EXP",
  test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
  resolve: (s) => parseFloat(s.replace(/_/g, "")),
  stringify(s) {
    const e = Number(s.value);
    return isFinite(e) ? e.toExponential() : F(s);
  }
}, nn = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
  resolve(s) {
    const e = new O(parseFloat(s.replace(/_/g, ""))), t = s.indexOf(".");
    if (t !== -1) {
      const n = s.substring(t + 1).replace(/_/g, "");
      n[n.length - 1] === "0" && (e.minFractionDigits = n.length);
    }
    return e;
  },
  stringify: F
}, ke = (s) => typeof s == "bigint" || Number.isInteger(s);
function qe(s, e, t, { intAsBigInt: n }) {
  const i = s[0];
  if ((i === "-" || i === "+") && (e += 1), s = s.substring(e).replace(/_/g, ""), n) {
    switch (t) {
      case 2:
        s = `0b${s}`;
        break;
      case 8:
        s = `0o${s}`;
        break;
      case 16:
        s = `0x${s}`;
        break;
    }
    const o = BigInt(s);
    return i === "-" ? BigInt(-1) * o : o;
  }
  const r = parseInt(s, t);
  return i === "-" ? -1 * r : r;
}
function mt(s, e, t) {
  const { value: n } = s;
  if (ke(n)) {
    const i = n.toString(e);
    return n < 0 ? "-" + t + i.substr(1) : t + i;
  }
  return F(s);
}
const rn = {
  identify: ke,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "BIN",
  test: /^[-+]?0b[0-1_]+$/,
  resolve: (s, e, t) => qe(s, 2, 2, t),
  stringify: (s) => mt(s, 2, "0b")
}, on = {
  identify: ke,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "OCT",
  test: /^[-+]?0[0-7_]+$/,
  resolve: (s, e, t) => qe(s, 1, 8, t),
  stringify: (s) => mt(s, 8, "0")
}, an = {
  identify: ke,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  test: /^[-+]?[0-9][0-9_]*$/,
  resolve: (s, e, t) => qe(s, 0, 10, t),
  stringify: F
}, ln = {
  identify: ke,
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "HEX",
  test: /^[-+]?0x[0-9a-fA-F_]+$/,
  resolve: (s, e, t) => qe(s, 2, 16, t),
  stringify: (s) => mt(s, 16, "0x")
};
class ie extends P {
  constructor(e) {
    super(e), this.tag = ie.tag;
  }
  add(e) {
    let t;
    C(e) ? t = e : e && typeof e == "object" && "key" in e && "value" in e && e.value === null ? t = new B(e.key, null) : t = new B(e, null), Q(this.items, t.key) || this.items.push(t);
  }
  /**
   * If `keepPair` is `true`, returns the Pair matching `key`.
   * Otherwise, returns the value of that Pair's key.
   */
  get(e, t) {
    const n = Q(this.items, e);
    return !t && C(n) ? N(n.key) ? n.key.value : n.key : n;
  }
  set(e, t) {
    if (typeof t != "boolean")
      throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);
    const n = Q(this.items, e);
    n && !t ? this.items.splice(this.items.indexOf(n), 1) : !n && t && this.items.push(new B(e));
  }
  toJSON(e, t) {
    return super.toJSON(e, t, Set);
  }
  toString(e, t, n) {
    if (!e)
      return JSON.stringify(this);
    if (this.hasAllNullValues(!0))
      return super.toString(Object.assign({}, e, { allNullValues: !0 }), t, n);
    throw new Error("Set items must all have null values");
  }
  static from(e, t, n) {
    const { replacer: i } = n, r = new this(e);
    if (t && Symbol.iterator in Object(t))
      for (let o of t)
        typeof i == "function" && (o = i.call(t, o, o)), r.items.push(lt(o, null, n));
    return r;
  }
}
ie.tag = "tag:yaml.org,2002:set";
const pt = {
  collection: "map",
  identify: (s) => s instanceof Set,
  nodeClass: ie,
  default: !1,
  tag: "tag:yaml.org,2002:set",
  createNode: (s, e, t) => ie.from(s, e, t),
  resolve(s, e) {
    if (we(s)) {
      if (s.hasAllNullValues(!0))
        return Object.assign(new ie(), s);
      e("Set items must all have null values");
    } else
      e("Expected a mapping for this tag");
    return s;
  }
};
function gt(s, e) {
  const t = s[0], n = t === "-" || t === "+" ? s.substring(1) : s, i = (o) => e ? BigInt(o) : Number(o), r = n.replace(/_/g, "").split(":").reduce((o, a) => o * i(60) + i(a), i(0));
  return t === "-" ? i(-1) * r : r;
}
function ms(s) {
  let { value: e } = s, t = (o) => o;
  if (typeof e == "bigint")
    t = (o) => BigInt(o);
  else if (isNaN(e) || !isFinite(e))
    return F(s);
  let n = "";
  e < 0 && (n = "-", e *= t(-1));
  const i = t(60), r = [e % i];
  return e < 60 ? r.unshift(0) : (e = (e - r[0]) / i, r.unshift(e % i), e >= 60 && (e = (e - r[0]) / i, r.unshift(e))), n + r.map((o) => String(o).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
}
const ps = {
  identify: (s) => typeof s == "bigint" || Number.isInteger(s),
  default: !0,
  tag: "tag:yaml.org,2002:int",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
  resolve: (s, e, { intAsBigInt: t }) => gt(s, t),
  stringify: ms
}, gs = {
  identify: (s) => typeof s == "number",
  default: !0,
  tag: "tag:yaml.org,2002:float",
  format: "TIME",
  test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
  resolve: (s) => gt(s, !1),
  stringify: ms
}, Ve = {
  identify: (s) => s instanceof Date,
  default: !0,
  tag: "tag:yaml.org,2002:timestamp",
  // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
  // may be omitted altogether, resulting in a date format. In such a case, the time part is
  // assumed to be 00:00:00Z (start of day, UTC).
  test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
  resolve(s) {
    const e = s.match(Ve.test);
    if (!e)
      throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
    const [, t, n, i, r, o, a] = e.map(Number), l = e[7] ? Number((e[7] + "00").substr(1, 3)) : 0;
    let c = Date.UTC(t, n - 1, i, r || 0, o || 0, a || 0, l);
    const h = e[8];
    if (h && h !== "Z") {
      let f = gt(h, !1);
      Math.abs(f) < 30 && (f *= 60), c -= 6e4 * f;
    }
    return new Date(c);
  },
  stringify: ({ value: s }) => s.toISOString().replace(/((T00:00)?:00)?\.000Z$/, "")
}, jt = [
  ce,
  fe,
  Ue,
  Ke,
  hs,
  ds,
  rn,
  on,
  an,
  ln,
  tn,
  sn,
  nn,
  ut,
  dt,
  ht,
  pt,
  ps,
  gs,
  Ve
], Bt = /* @__PURE__ */ new Map([
  ["core", zs],
  ["failsafe", [ce, fe, Ue]],
  ["json", en],
  ["yaml11", jt],
  ["yaml-1.1", jt]
]), Dt = {
  binary: ut,
  bool: ct,
  float: is,
  floatExp: ns,
  floatNaN: ss,
  floatTime: gs,
  int: as,
  intHex: ls,
  intOct: os,
  intTime: ps,
  map: ce,
  null: Ke,
  omap: dt,
  pairs: ht,
  seq: fe,
  set: pt,
  timestamp: Ve
}, cn = {
  "tag:yaml.org,2002:binary": ut,
  "tag:yaml.org,2002:omap": dt,
  "tag:yaml.org,2002:pairs": ht,
  "tag:yaml.org,2002:set": pt,
  "tag:yaml.org,2002:timestamp": Ve
};
function We(s, e) {
  let t = Bt.get(e);
  if (!t)
    if (Array.isArray(s))
      t = [];
    else {
      const n = Array.from(Bt.keys()).filter((i) => i !== "yaml11").map((i) => JSON.stringify(i)).join(", ");
      throw new Error(`Unknown schema "${e}"; use one of ${n} or define customTags array`);
    }
  if (Array.isArray(s))
    for (const n of s)
      t = t.concat(n);
  else
    typeof s == "function" && (t = s(t.slice()));
  return t.map((n) => {
    if (typeof n != "string")
      return n;
    const i = Dt[n];
    if (i)
      return i;
    const r = Object.keys(Dt).map((o) => JSON.stringify(o)).join(", ");
    throw new Error(`Unknown custom tag "${n}"; use one of ${r}`);
  });
}
const fn = (s, e) => s.key < e.key ? -1 : s.key > e.key ? 1 : 0;
class yt {
  constructor({ compat: e, customTags: t, merge: n, resolveKnownTags: i, schema: r, sortMapEntries: o, toStringDefaults: a }) {
    this.compat = Array.isArray(e) ? We(e, "compat") : e ? We(null, e) : null, this.merge = !!n, this.name = typeof r == "string" && r || "core", this.knownTags = i ? cn : {}, this.tags = We(t, this.name), this.toStringOptions = a ?? null, Object.defineProperty(this, Y, { value: ce }), Object.defineProperty(this, V, { value: Ue }), Object.defineProperty(this, ae, { value: fe }), this.sortMapEntries = typeof o == "function" ? o : o === !0 ? fn : null;
  }
  clone() {
    const e = Object.create(yt.prototype, Object.getOwnPropertyDescriptors(this));
    return e.tags = this.tags.slice(), e;
  }
}
function un(s, e) {
  var l;
  const t = [];
  let n = e.directives === !0;
  if (e.directives !== !1 && s.directives) {
    const c = s.directives.toString(s);
    c ? (t.push(c), n = !0) : s.directives.docStart && (n = !0);
  }
  n && t.push("---");
  const i = Zt(s, e), { commentString: r } = i.options;
  if (s.commentBefore) {
    t.length !== 1 && t.unshift("");
    const c = r(s.commentBefore);
    t.unshift(q(c, ""));
  }
  let o = !1, a = null;
  if (s.contents) {
    if (v(s.contents)) {
      if (s.contents.spaceBefore && n && t.push(""), s.contents.commentBefore) {
        const f = r(s.contents.commentBefore);
        t.push(q(f, ""));
      }
      i.forceBlockIndent = !!s.comment, a = s.contents.comment;
    }
    const c = a ? void 0 : () => o = !0;
    let h = re(s.contents, i, () => a = null, c);
    a && (h += J(h, "", r(a))), (h[0] === "|" || h[0] === ">") && t[t.length - 1] === "---" ? t[t.length - 1] = `--- ${h}` : t.push(h);
  } else
    t.push(re(s.contents, i));
  if ((l = s.directives) != null && l.docEnd)
    if (s.comment) {
      const c = r(s.comment);
      c.includes(`
`) ? (t.push("..."), t.push(q(c, ""))) : t.push(`... ${c}`);
    } else
      t.push("...");
  else {
    let c = s.comment;
    c && o && (c = c.replace(/^\n+/, "")), c && ((!o || a) && t[t.length - 1] !== "" && t.push(""), t.push(q(r(c), "")));
  }
  return t.join(`
`) + `
`;
}
class Se {
  constructor(e, t, n) {
    this.commentBefore = null, this.comment = null, this.errors = [], this.warnings = [], Object.defineProperty(this, U, { value: Ze });
    let i = null;
    typeof t == "function" || Array.isArray(t) ? i = t : n === void 0 && t && (n = t, t = void 0);
    const r = Object.assign({
      intAsBigInt: !1,
      keepSourceTokens: !1,
      logLevel: "warn",
      prettyErrors: !0,
      strict: !0,
      uniqueKeys: !0,
      version: "1.2"
    }, n);
    this.options = r;
    let { version: o } = r;
    n != null && n._directives ? (this.directives = n._directives.atDocument(), this.directives.yaml.explicit && (o = this.directives.yaml.version)) : this.directives = new j({ version: o }), this.setSchema(o, n), this.contents = e === void 0 ? null : this.createNode(e, i, n);
  }
  /**
   * Create a deep copy of this Document and its contents.
   *
   * Custom Node values that inherit from `Object` still refer to their original instances.
   */
  clone() {
    const e = Object.create(Se.prototype, {
      [U]: { value: Ze }
    });
    return e.commentBefore = this.commentBefore, e.comment = this.comment, e.errors = this.errors.slice(), e.warnings = this.warnings.slice(), e.options = Object.assign({}, this.options), this.directives && (e.directives = this.directives.clone()), e.schema = this.schema.clone(), e.contents = v(this.contents) ? this.contents.clone(e.schema) : this.contents, this.range && (e.range = this.range.slice()), e;
  }
  /** Adds a value to the document. */
  add(e) {
    Z(this.contents) && this.contents.add(e);
  }
  /** Adds a value to the document. */
  addIn(e, t) {
    Z(this.contents) && this.contents.addIn(e, t);
  }
  /**
   * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
   *
   * If `node` already has an anchor, `name` is ignored.
   * Otherwise, the `node.anchor` value will be set to `name`,
   * or if an anchor with that name is already present in the document,
   * `name` will be used as a prefix for a new unique anchor.
   * If `name` is undefined, the generated anchor will use 'a' as a prefix.
   */
  createAlias(e, t) {
    if (!e.anchor) {
      const n = Qt(this);
      e.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      !t || n.has(t) ? xt(t || "a", n) : t;
    }
    return new ot(e.anchor);
  }
  createNode(e, t, n) {
    let i;
    if (typeof t == "function")
      e = t.call({ "": e }, "", e), i = t;
    else if (Array.isArray(t)) {
      const p = (b) => typeof b == "number" || b instanceof String || b instanceof Number, w = t.filter(p).map(String);
      w.length > 0 && (t = t.concat(w)), i = t;
    } else
      n === void 0 && t && (n = t, t = void 0);
    const { aliasDuplicateObjects: r, anchorPrefix: o, flow: a, keepUndefined: l, onTagObj: c, tag: h } = n ?? {}, { onAnchor: f, setAnchors: u, sourceObjects: d } = Rs(
      this,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      o || "a"
    ), y = {
      aliasDuplicateObjects: r ?? !0,
      keepUndefined: l ?? !1,
      onAnchor: f,
      onTagObj: c,
      replacer: i,
      schema: this.schema,
      sourceObjects: d
    }, m = ge(e, h, y);
    return a && T(m) && (m.flow = !0), u(), m;
  }
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   */
  createPair(e, t, n = {}) {
    const i = this.createNode(e, null, n), r = this.createNode(t, null, n);
    return new B(i, r);
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  delete(e) {
    return Z(this.contents) ? this.contents.delete(e) : !1;
  }
  /**
   * Removes a value from the document.
   * @returns `true` if the item was found and removed.
   */
  deleteIn(e) {
    return he(e) ? this.contents == null ? !1 : (this.contents = null, !0) : Z(this.contents) ? this.contents.deleteIn(e) : !1;
  }
  /**
   * Returns item at `key`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  get(e, t) {
    return T(this.contents) ? this.contents.get(e, t) : void 0;
  }
  /**
   * Returns item at `path`, or `undefined` if not found. By default unwraps
   * scalar values from their surrounding node; to disable set `keepScalar` to
   * `true` (collections are always returned intact).
   */
  getIn(e, t) {
    return he(e) ? !t && N(this.contents) ? this.contents.value : this.contents : T(this.contents) ? this.contents.getIn(e, t) : void 0;
  }
  /**
   * Checks if the document includes a value with the key `key`.
   */
  has(e) {
    return T(this.contents) ? this.contents.has(e) : !1;
  }
  /**
   * Checks if the document includes a value at `path`.
   */
  hasIn(e) {
    return he(e) ? this.contents !== void 0 : T(this.contents) ? this.contents.hasIn(e) : !1;
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  set(e, t) {
    this.contents == null ? this.contents = Ce(this.schema, [e], t) : Z(this.contents) && this.contents.set(e, t);
  }
  /**
   * Sets a value in this document. For `!!set`, `value` needs to be a
   * boolean to add/remove the item from the set.
   */
  setIn(e, t) {
    he(e) ? this.contents = t : this.contents == null ? this.contents = Ce(this.schema, Array.from(e), t) : Z(this.contents) && this.contents.setIn(e, t);
  }
  /**
   * Change the YAML version and schema used by the document.
   * A `null` version disables support for directives, explicit tags, anchors, and aliases.
   * It also requires the `schema` option to be given as a `Schema` instance value.
   *
   * Overrides all previously set schema options.
   */
  setSchema(e, t = {}) {
    typeof e == "number" && (e = String(e));
    let n;
    switch (e) {
      case "1.1":
        this.directives ? this.directives.yaml.version = "1.1" : this.directives = new j({ version: "1.1" }), n = { merge: !0, resolveKnownTags: !1, schema: "yaml-1.1" };
        break;
      case "1.2":
      case "next":
        this.directives ? this.directives.yaml.version = e : this.directives = new j({ version: e }), n = { merge: !1, resolveKnownTags: !0, schema: "core" };
        break;
      case null:
        this.directives && delete this.directives, n = null;
        break;
      default: {
        const i = JSON.stringify(e);
        throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`);
      }
    }
    if (t.schema instanceof Object)
      this.schema = t.schema;
    else if (n)
      this.schema = new yt(Object.assign(n, t));
    else
      throw new Error("With a null YAML version, the { schema: Schema } option is required");
  }
  // json & jsonArg are only used from toJSON()
  toJS({ json: e, jsonArg: t, mapAsMap: n, maxAliasCount: i, onAnchor: r, reviver: o } = {}) {
    const a = {
      anchors: /* @__PURE__ */ new Map(),
      doc: this,
      keep: !e,
      mapAsMap: n === !0,
      mapKeyWarned: !1,
      maxAliasCount: typeof i == "number" ? i : 100
    }, l = R(this.contents, t ?? "", a);
    if (typeof r == "function")
      for (const { count: c, res: h } of a.anchors.values())
        r(h, c);
    return typeof o == "function" ? te(o, { "": l }, "", l) : l;
  }
  /**
   * A JSON representation of the document `contents`.
   *
   * @param jsonArg Used by `JSON.stringify` to indicate the array index or
   *   property name.
   */
  toJSON(e, t) {
    return this.toJS({ json: !0, jsonArg: e, mapAsMap: !1, onAnchor: t });
  }
  /** A YAML representation of the document. */
  toString(e = {}) {
    if (this.errors.length > 0)
      throw new Error("Document with errors cannot be stringified");
    if ("indent" in e && (!Number.isInteger(e.indent) || Number(e.indent) <= 0)) {
      const t = JSON.stringify(e.indent);
      throw new Error(`"indent" option must be a positive integer, not ${t}`);
    }
    return un(this, e);
  }
}
function Z(s) {
  if (T(s))
    return !0;
  throw new Error("Expected a YAML collection as document contents");
}
class ys extends Error {
  constructor(e, t, n, i) {
    super(), this.name = e, this.code = n, this.message = i, this.pos = t;
  }
}
class de extends ys {
  constructor(e, t, n) {
    super("YAMLParseError", e, t, n);
  }
}
class hn extends ys {
  constructor(e, t, n) {
    super("YAMLWarning", e, t, n);
  }
}
const Pt = (s, e) => (t) => {
  if (t.pos[0] === -1)
    return;
  t.linePos = t.pos.map((a) => e.linePos(a));
  const { line: n, col: i } = t.linePos[0];
  t.message += ` at line ${n}, column ${i}`;
  let r = i - 1, o = s.substring(e.lineStarts[n - 1], e.lineStarts[n]).replace(/[\n\r]+$/, "");
  if (r >= 60 && o.length > 80) {
    const a = Math.min(r - 39, o.length - 79);
    o = "…" + o.substring(a), r -= a - 1;
  }
  if (o.length > 80 && (o = o.substring(0, 79) + "…"), n > 1 && /^ *$/.test(o.substring(0, r))) {
    let a = s.substring(e.lineStarts[n - 2], e.lineStarts[n - 1]);
    a.length > 80 && (a = a.substring(0, 79) + `…
`), o = a + o;
  }
  if (/[^ ]/.test(o)) {
    let a = 1;
    const l = t.linePos[1];
    l && l.line === n && l.col > i && (a = Math.max(1, Math.min(l.col - i, 80 - r)));
    const c = " ".repeat(r) + "^".repeat(a);
    t.message += `:

${o}
${c}
`;
  }
};
function oe(s, { flow: e, indicator: t, next: n, offset: i, onError: r, startOnNewline: o }) {
  let a = !1, l = o, c = o, h = "", f = "", u = !1, d = !1, y = !1, m = null, p = null, w = null, b = null, S = null;
  for (const g of s)
    switch (y && (g.type !== "space" && g.type !== "newline" && g.type !== "comma" && r(g.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), y = !1), g.type) {
      case "space":
        !e && l && t !== "doc-start" && g.source[0] === "	" && r(g, "TAB_AS_INDENT", "Tabs are not allowed as indentation"), c = !0;
        break;
      case "comment": {
        c || r(g, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
        const A = g.source.substring(1) || " ";
        h ? h += f + A : h = A, f = "", l = !1;
        break;
      }
      case "newline":
        l ? h ? h += g.source : a = !0 : f += g.source, l = !0, u = !0, (m || p) && (d = !0), c = !0;
        break;
      case "anchor":
        m && r(g, "MULTIPLE_ANCHORS", "A node can have at most one anchor"), g.source.endsWith(":") && r(g.offset + g.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", !0), m = g, S === null && (S = g.offset), l = !1, c = !1, y = !0;
        break;
      case "tag": {
        p && r(g, "MULTIPLE_TAGS", "A node can have at most one tag"), p = g, S === null && (S = g.offset), l = !1, c = !1, y = !0;
        break;
      }
      case t:
        (m || p) && r(g, "BAD_PROP_ORDER", `Anchors and tags must be after the ${g.source} indicator`), b && r(g, "UNEXPECTED_TOKEN", `Unexpected ${g.source} in ${e ?? "collection"}`), b = g, l = !1, c = !1;
        break;
      case "comma":
        if (e) {
          w && r(g, "UNEXPECTED_TOKEN", `Unexpected , in ${e}`), w = g, l = !1, c = !1;
          break;
        }
      default:
        r(g, "UNEXPECTED_TOKEN", `Unexpected ${g.type} token`), l = !1, c = !1;
    }
  const k = s[s.length - 1], _ = k ? k.offset + k.source.length : i;
  return y && n && n.type !== "space" && n.type !== "newline" && n.type !== "comma" && (n.type !== "scalar" || n.source !== "") && r(n.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space"), {
    comma: w,
    found: b,
    spaceBefore: a,
    comment: h,
    hasNewline: u,
    hasNewlineAfterProp: d,
    anchor: m,
    tag: p,
    end: _,
    start: S ?? _
  };
}
function ye(s) {
  if (!s)
    return null;
  switch (s.type) {
    case "alias":
    case "scalar":
    case "double-quoted-scalar":
    case "single-quoted-scalar":
      if (s.source.includes(`
`))
        return !0;
      if (s.end) {
        for (const e of s.end)
          if (e.type === "newline")
            return !0;
      }
      return !1;
    case "flow-collection":
      for (const e of s.items) {
        for (const t of e.start)
          if (t.type === "newline")
            return !0;
        if (e.sep) {
          for (const t of e.sep)
            if (t.type === "newline")
              return !0;
        }
        if (ye(e.key) || ye(e.value))
          return !0;
      }
      return !1;
    default:
      return !0;
  }
}
function st(s, e, t) {
  if ((e == null ? void 0 : e.type) === "flow-collection") {
    const n = e.end[0];
    n.indent === s && (n.source === "]" || n.source === "}") && ye(e) && t(n, "BAD_INDENT", "Flow end indicator should be more indented than parent", !0);
  }
}
function ws(s, e, t) {
  const { uniqueKeys: n } = s.options;
  if (n === !1)
    return !1;
  const i = typeof n == "function" ? n : (r, o) => r === o || N(r) && N(o) && r.value === o.value && !(r.value === "<<" && s.schema.merge);
  return e.some((r) => i(r.key, t));
}
const Rt = "All mapping items must start at the same column";
function dn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  var h;
  const o = (r == null ? void 0 : r.nodeClass) ?? P, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let l = n.offset, c = null;
  for (const f of n.items) {
    const { start: u, key: d, sep: y, value: m } = f, p = oe(u, {
      indicator: "explicit-key-ind",
      next: d ?? (y == null ? void 0 : y[0]),
      offset: l,
      onError: i,
      startOnNewline: !0
    }), w = !p.found;
    if (w) {
      if (d && (d.type === "block-seq" ? i(l, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key") : "indent" in d && d.indent !== n.indent && i(l, "BAD_INDENT", Rt)), !p.anchor && !p.tag && !y) {
        c = p.end, p.comment && (a.comment ? a.comment += `
` + p.comment : a.comment = p.comment);
        continue;
      }
      (p.hasNewlineAfterProp || ye(d)) && i(d ?? u[u.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
    } else
      ((h = p.found) == null ? void 0 : h.indent) !== n.indent && i(l, "BAD_INDENT", Rt);
    const b = p.end, S = d ? s(t, d, p, i) : e(t, b, u, null, p, i);
    t.schema.compat && st(n.indent, d, i), ws(t, a.items, S) && i(b, "DUPLICATE_KEY", "Map keys must be unique");
    const k = oe(y ?? [], {
      indicator: "map-value-ind",
      next: m,
      offset: S.range[2],
      onError: i,
      startOnNewline: !d || d.type === "block-scalar"
    });
    if (l = k.end, k.found) {
      w && ((m == null ? void 0 : m.type) === "block-map" && !k.hasNewline && i(l, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings"), t.options.strict && p.start < k.found.offset - 1024 && i(S.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));
      const _ = m ? s(t, m, k, i) : e(t, l, y, null, k, i);
      t.schema.compat && st(n.indent, m, i), l = _.range[2];
      const g = new B(S, _);
      t.options.keepSourceTokens && (g.srcToken = f), a.items.push(g);
    } else {
      w && i(S.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values"), k.comment && (S.comment ? S.comment += `
` + k.comment : S.comment = k.comment);
      const _ = new B(S);
      t.options.keepSourceTokens && (_.srcToken = f), a.items.push(_);
    }
  }
  return c && c < l && i(c, "IMPOSSIBLE", "Map comment with trailing content"), a.range = [n.offset, l, c ?? l], a;
}
function mn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = (r == null ? void 0 : r.nodeClass) ?? X, a = new o(t.schema);
  t.atRoot && (t.atRoot = !1);
  let l = n.offset, c = null;
  for (const { start: h, value: f } of n.items) {
    const u = oe(h, {
      indicator: "seq-item-ind",
      next: f,
      offset: l,
      onError: i,
      startOnNewline: !0
    });
    if (!u.found)
      if (u.anchor || u.tag || f)
        f && f.type === "block-seq" ? i(u.end, "BAD_INDENT", "All sequence items must start at the same column") : i(l, "MISSING_CHAR", "Sequence item without - indicator");
      else {
        c = u.end, u.comment && (a.comment = u.comment);
        continue;
      }
    const d = f ? s(t, f, u, i) : e(t, u.end, h, null, u, i);
    t.schema.compat && st(n.indent, f, i), l = d.range[2], a.items.push(d);
  }
  return a.range = [n.offset, l, c ?? l], a;
}
function Ee(s, e, t, n) {
  let i = "";
  if (s) {
    let r = !1, o = "";
    for (const a of s) {
      const { source: l, type: c } = a;
      switch (c) {
        case "space":
          r = !0;
          break;
        case "comment": {
          t && !r && n(a, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
          const h = l.substring(1) || " ";
          i ? i += o + h : i = h, o = "";
          break;
        }
        case "newline":
          i && (o += l), r = !0;
          break;
        default:
          n(a, "UNEXPECTED_TOKEN", `Unexpected ${c} at node end`);
      }
      e += l.length;
    }
  }
  return { comment: i, offset: e };
}
const He = "Block collections are not allowed within flow collections", Qe = (s) => s && (s.type === "block-map" || s.type === "block-seq");
function pn({ composeNode: s, composeEmptyNode: e }, t, n, i, r) {
  const o = n.start.source === "{", a = o ? "flow map" : "flow sequence", l = (r == null ? void 0 : r.nodeClass) ?? (o ? P : X), c = new l(t.schema);
  c.flow = !0;
  const h = t.atRoot;
  h && (t.atRoot = !1);
  let f = n.offset + n.start.source.length;
  for (let p = 0; p < n.items.length; ++p) {
    const w = n.items[p], { start: b, key: S, sep: k, value: _ } = w, g = oe(b, {
      flow: a,
      indicator: "explicit-key-ind",
      next: S ?? (k == null ? void 0 : k[0]),
      offset: f,
      onError: i,
      startOnNewline: !1
    });
    if (!g.found) {
      if (!g.anchor && !g.tag && !k && !_) {
        p === 0 && g.comma ? i(g.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`) : p < n.items.length - 1 && i(g.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${a}`), g.comment && (c.comment ? c.comment += `
` + g.comment : c.comment = g.comment), f = g.end;
        continue;
      }
      !o && t.options.strict && ye(S) && i(
        S,
        // checked by containsNewline()
        "MULTILINE_IMPLICIT_KEY",
        "Implicit keys of flow sequence pairs need to be on a single line"
      );
    }
    if (p === 0)
      g.comma && i(g.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${a}`);
    else if (g.comma || i(g.start, "MISSING_CHAR", `Missing , between ${a} items`), g.comment) {
      let A = "";
      e:
        for (const I of b)
          switch (I.type) {
            case "comma":
            case "space":
              break;
            case "comment":
              A = I.source.substring(1);
              break e;
            default:
              break e;
          }
      if (A) {
        let I = c.items[c.items.length - 1];
        C(I) && (I = I.value ?? I.key), I.comment ? I.comment += `
` + A : I.comment = A, g.comment = g.comment.substring(A.length + 1);
      }
    }
    if (!o && !k && !g.found) {
      const A = _ ? s(t, _, g, i) : e(t, g.end, k, null, g, i);
      c.items.push(A), f = A.range[2], Qe(_) && i(A.range, "BLOCK_IN_FLOW", He);
    } else {
      const A = g.end, I = S ? s(t, S, g, i) : e(t, A, b, null, g, i);
      Qe(S) && i(I.range, "BLOCK_IN_FLOW", He);
      const M = oe(k ?? [], {
        flow: a,
        indicator: "map-value-ind",
        next: _,
        offset: I.range[2],
        onError: i,
        startOnNewline: !1
      });
      if (M.found) {
        if (!o && !g.found && t.options.strict) {
          if (k)
            for (const $ of k) {
              if ($ === M.found)
                break;
              if ($.type === "newline") {
                i($, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                break;
              }
            }
          g.start < M.found.offset - 1024 && i(M.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
        }
      } else
        _ && ("source" in _ && _.source && _.source[0] === ":" ? i(_, "MISSING_CHAR", `Missing space after : in ${a}`) : i(M.start, "MISSING_CHAR", `Missing , or : between ${a} items`));
      const W = _ ? s(t, _, M, i) : M.found ? e(t, M.end, k, null, M, i) : null;
      W ? Qe(_) && i(W.range, "BLOCK_IN_FLOW", He) : M.comment && (I.comment ? I.comment += `
` + M.comment : I.comment = M.comment);
      const z = new B(I, W);
      if (t.options.keepSourceTokens && (z.srcToken = w), o) {
        const $ = c;
        ws(t, $.items, I) && i(A, "DUPLICATE_KEY", "Map keys must be unique"), $.items.push(z);
      } else {
        const $ = new P(t.schema);
        $.flow = !0, $.items.push(z), c.items.push($);
      }
      f = W ? W.range[2] : M.end;
    }
  }
  const u = o ? "}" : "]", [d, ...y] = n.end;
  let m = f;
  if (d && d.source === u)
    m = d.offset + d.source.length;
  else {
    const p = a[0].toUpperCase() + a.substring(1), w = h ? `${p} must end with a ${u}` : `${p} in block collection must be sufficiently indented and end with a ${u}`;
    i(f, h ? "MISSING_CHAR" : "BAD_INDENT", w), d && d.source.length !== 1 && y.unshift(d);
  }
  if (y.length > 0) {
    const p = Ee(y, m, t.options.strict, i);
    p.comment && (c.comment ? c.comment += `
` + p.comment : c.comment = p.comment), c.range = [n.offset, m, p.offset];
  } else
    c.range = [n.offset, m, m];
  return c;
}
function xe(s, e, t, n, i, r) {
  const o = t.type === "block-map" ? dn(s, e, t, n, r) : t.type === "block-seq" ? mn(s, e, t, n, r) : pn(s, e, t, n, r), a = o.constructor;
  return i === "!" || i === a.tagName ? (o.tag = a.tagName, o) : (i && (o.tag = i), o);
}
function gn(s, e, t, n, i) {
  var f;
  const r = n ? e.directives.tagName(n.source, (u) => i(n, "TAG_RESOLVE_FAILED", u)) : null, o = t.type === "block-map" ? "map" : t.type === "block-seq" ? "seq" : t.start.source === "{" ? "map" : "seq";
  if (!n || !r || r === "!" || r === P.tagName && o === "map" || r === X.tagName && o === "seq" || !o)
    return xe(s, e, t, i, r);
  let a = e.schema.tags.find((u) => u.tag === r && u.collection === o);
  if (!a) {
    const u = e.schema.knownTags[r];
    if (u && u.collection === o)
      e.schema.tags.push(Object.assign({}, u, { default: !1 })), a = u;
    else
      return u != null && u.collection ? i(n, "BAD_COLLECTION_TYPE", `${u.tag} used for ${o} collection, but expects ${u.collection}`, !0) : i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${r}`, !0), xe(s, e, t, i, r);
  }
  const l = xe(s, e, t, i, r, a), c = ((f = a.resolve) == null ? void 0 : f.call(a, l, (u) => i(n, "TAG_RESOLVE_FAILED", u), e.options)) ?? l, h = v(c) ? c : new O(c);
  return h.range = l.range, h.tag = r, a != null && a.format && (h.format = a.format), h;
}
function yn(s, e, t) {
  const n = s.offset, i = wn(s, e, t);
  if (!i)
    return { value: "", type: null, comment: "", range: [n, n, n] };
  const r = i.mode === ">" ? O.BLOCK_FOLDED : O.BLOCK_LITERAL, o = s.source ? bn(s.source) : [];
  let a = o.length;
  for (let m = o.length - 1; m >= 0; --m) {
    const p = o[m][1];
    if (p === "" || p === "\r")
      a = m;
    else
      break;
  }
  if (a === 0) {
    const m = i.chomp === "+" && o.length > 0 ? `
`.repeat(Math.max(1, o.length - 1)) : "";
    let p = n + i.length;
    return s.source && (p += s.source.length), { value: m, type: r, comment: i.comment, range: [n, p, p] };
  }
  let l = s.indent + i.indent, c = s.offset + i.length, h = 0;
  for (let m = 0; m < a; ++m) {
    const [p, w] = o[m];
    if (w === "" || w === "\r")
      i.indent === 0 && p.length > l && (l = p.length);
    else {
      p.length < l && t(c + p.length, "MISSING_CHAR", "Block scalars with more-indented leading empty lines must use an explicit indentation indicator"), i.indent === 0 && (l = p.length), h = m;
      break;
    }
    c += p.length + w.length + 1;
  }
  for (let m = o.length - 1; m >= a; --m)
    o[m][0].length > l && (a = m + 1);
  let f = "", u = "", d = !1;
  for (let m = 0; m < h; ++m)
    f += o[m][0].slice(l) + `
`;
  for (let m = h; m < a; ++m) {
    let [p, w] = o[m];
    c += p.length + w.length + 1;
    const b = w[w.length - 1] === "\r";
    if (b && (w = w.slice(0, -1)), w && p.length < l) {
      const k = `Block scalar lines must not be less indented than their ${i.indent ? "explicit indentation indicator" : "first line"}`;
      t(c - w.length - (b ? 2 : 1), "BAD_INDENT", k), p = "";
    }
    r === O.BLOCK_LITERAL ? (f += u + p.slice(l) + w, u = `
`) : p.length > l || w[0] === "	" ? (u === " " ? u = `
` : !d && u === `
` && (u = `

`), f += u + p.slice(l) + w, u = `
`, d = !0) : w === "" ? u === `
` ? f += `
` : u = `
` : (f += u + w, u = " ", d = !1);
  }
  switch (i.chomp) {
    case "-":
      break;
    case "+":
      for (let m = a; m < o.length; ++m)
        f += `
` + o[m][0].slice(l);
      f[f.length - 1] !== `
` && (f += `
`);
      break;
    default:
      f += `
`;
  }
  const y = n + i.length + s.source.length;
  return { value: f, type: r, comment: i.comment, range: [n, y, y] };
}
function wn({ offset: s, props: e }, t, n) {
  if (e[0].type !== "block-scalar-header")
    return n(e[0], "IMPOSSIBLE", "Block scalar header not found"), null;
  const { source: i } = e[0], r = i[0];
  let o = 0, a = "", l = -1;
  for (let u = 1; u < i.length; ++u) {
    const d = i[u];
    if (!a && (d === "-" || d === "+"))
      a = d;
    else {
      const y = Number(d);
      !o && y ? o = y : l === -1 && (l = s + u);
    }
  }
  l !== -1 && n(l, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${i}`);
  let c = !1, h = "", f = i.length;
  for (let u = 1; u < e.length; ++u) {
    const d = e[u];
    switch (d.type) {
      case "space":
        c = !0;
      case "newline":
        f += d.source.length;
        break;
      case "comment":
        t && !c && n(d, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters"), f += d.source.length, h = d.source.substring(1);
        break;
      case "error":
        n(d, "UNEXPECTED_TOKEN", d.message), f += d.source.length;
        break;
      default: {
        const y = `Unexpected token in block scalar header: ${d.type}`;
        n(d, "UNEXPECTED_TOKEN", y);
        const m = d.source;
        m && typeof m == "string" && (f += m.length);
      }
    }
  }
  return { mode: r, indent: o, chomp: a, comment: h, length: f };
}
function bn(s) {
  const e = s.split(/\n( *)/), t = e[0], n = t.match(/^( *)/), r = [n != null && n[1] ? [n[1], t.slice(n[1].length)] : ["", t]];
  for (let o = 1; o < e.length; o += 2)
    r.push([e[o], e[o + 1]]);
  return r;
}
function kn(s, e, t) {
  const { offset: n, type: i, source: r, end: o } = s;
  let a, l;
  const c = (u, d, y) => t(n + u, d, y);
  switch (i) {
    case "scalar":
      a = O.PLAIN, l = Sn(r, c);
      break;
    case "single-quoted-scalar":
      a = O.QUOTE_SINGLE, l = En(r, c);
      break;
    case "double-quoted-scalar":
      a = O.QUOTE_DOUBLE, l = _n(r, c);
      break;
    default:
      return t(s, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${i}`), {
        value: "",
        type: null,
        comment: "",
        range: [n, n + r.length, n + r.length]
      };
  }
  const h = n + r.length, f = Ee(o, h, e, t);
  return {
    value: l,
    type: a,
    comment: f.comment,
    range: [n, h, f.offset]
  };
}
function Sn(s, e) {
  let t = "";
  switch (s[0]) {
    case "	":
      t = "a tab character";
      break;
    case ",":
      t = "flow indicator character ,";
      break;
    case "%":
      t = "directive indicator character %";
      break;
    case "|":
    case ">": {
      t = `block scalar indicator ${s[0]}`;
      break;
    }
    case "@":
    case "`": {
      t = `reserved character ${s[0]}`;
      break;
    }
  }
  return t && e(0, "BAD_SCALAR_START", `Plain value cannot start with ${t}`), bs(s);
}
function En(s, e) {
  return (s[s.length - 1] !== "'" || s.length === 1) && e(s.length, "MISSING_CHAR", "Missing closing 'quote"), bs(s.slice(1, -1)).replace(/''/g, "'");
}
function bs(s) {
  let e, t;
  try {
    e = new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`, "sy"), t = new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`, "sy");
  } catch {
    e = /(.*?)[ \t]*\r?\n/sy, t = /[ \t]*(.*?)[ \t]*\r?\n/sy;
  }
  let n = e.exec(s);
  if (!n)
    return s;
  let i = n[1], r = " ", o = e.lastIndex;
  for (t.lastIndex = o; n = t.exec(s); )
    n[1] === "" ? r === `
` ? i += r : r = `
` : (i += r + n[1], r = " "), o = t.lastIndex;
  const a = /[ \t]*(.*)/sy;
  return a.lastIndex = o, n = a.exec(s), i + r + ((n == null ? void 0 : n[1]) ?? "");
}
function _n(s, e) {
  let t = "";
  for (let n = 1; n < s.length - 1; ++n) {
    const i = s[n];
    if (!(i === "\r" && s[n + 1] === `
`))
      if (i === `
`) {
        const { fold: r, offset: o } = On(s, n);
        t += r, n = o;
      } else if (i === "\\") {
        let r = s[++n];
        const o = Nn[r];
        if (o)
          t += o;
        else if (r === `
`)
          for (r = s[n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "\r" && s[n + 1] === `
`)
          for (r = s[++n + 1]; r === " " || r === "	"; )
            r = s[++n + 1];
        else if (r === "x" || r === "u" || r === "U") {
          const a = { x: 2, u: 4, U: 8 }[r];
          t += An(s, n + 1, a, e), n += a;
        } else {
          const a = s.substr(n - 1, 2);
          e(n - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), t += a;
        }
      } else if (i === " " || i === "	") {
        const r = n;
        let o = s[n + 1];
        for (; o === " " || o === "	"; )
          o = s[++n + 1];
        o !== `
` && !(o === "\r" && s[n + 2] === `
`) && (t += n > r ? s.slice(r, n + 1) : i);
      } else
        t += i;
  }
  return (s[s.length - 1] !== '"' || s.length === 1) && e(s.length, "MISSING_CHAR", 'Missing closing "quote'), t;
}
function On(s, e) {
  let t = "", n = s[e + 1];
  for (; (n === " " || n === "	" || n === `
` || n === "\r") && !(n === "\r" && s[e + 2] !== `
`); )
    n === `
` && (t += `
`), e += 1, n = s[e + 1];
  return t || (t = " "), { fold: t, offset: e };
}
const Nn = {
  0: "\0",
  a: "\x07",
  b: "\b",
  e: "\x1B",
  f: "\f",
  n: `
`,
  r: "\r",
  t: "	",
  v: "\v",
  N: "",
  _: " ",
  L: "\u2028",
  P: "\u2029",
  " ": " ",
  '"': '"',
  "/": "/",
  "\\": "\\",
  "	": "	"
};
function An(s, e, t, n) {
  const i = s.substr(e, t), o = i.length === t && /^[0-9a-fA-F]+$/.test(i) ? parseInt(i, 16) : NaN;
  if (isNaN(o)) {
    const a = s.substr(e - 2, t + 2);
    return n(e - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${a}`), a;
  }
  return String.fromCodePoint(o);
}
function ks(s, e, t, n) {
  const { value: i, type: r, comment: o, range: a } = e.type === "block-scalar" ? yn(e, s.options.strict, n) : kn(e, s.options.strict, n), l = t ? s.directives.tagName(t.source, (f) => n(t, "TAG_RESOLVE_FAILED", f)) : null, c = t && l ? In(s.schema, i, l, t, n) : e.type === "scalar" ? Tn(s, i, e, n) : s.schema[V];
  let h;
  try {
    const f = c.resolve(i, (u) => n(t ?? e, "TAG_RESOLVE_FAILED", u), s.options);
    h = N(f) ? f : new O(f);
  } catch (f) {
    const u = f instanceof Error ? f.message : String(f);
    n(t ?? e, "TAG_RESOLVE_FAILED", u), h = new O(i);
  }
  return h.range = a, h.source = i, r && (h.type = r), l && (h.tag = l), c.format && (h.format = c.format), o && (h.comment = o), h;
}
function In(s, e, t, n, i) {
  var a;
  if (t === "!")
    return s[V];
  const r = [];
  for (const l of s.tags)
    if (!l.collection && l.tag === t)
      if (l.default && l.test)
        r.push(l);
      else
        return l;
  for (const l of r)
    if ((a = l.test) != null && a.test(e))
      return l;
  const o = s.knownTags[t];
  return o && !o.collection ? (s.tags.push(Object.assign({}, o, { default: !1, test: void 0 })), o) : (i(n, "TAG_RESOLVE_FAILED", `Unresolved tag: ${t}`, t !== "tag:yaml.org,2002:str"), s[V]);
}
function Tn({ directives: s, schema: e }, t, n, i) {
  const r = e.tags.find((o) => {
    var a;
    return o.default && ((a = o.test) == null ? void 0 : a.test(t));
  }) || e[V];
  if (e.compat) {
    const o = e.compat.find((a) => {
      var l;
      return a.default && ((l = a.test) == null ? void 0 : l.test(t));
    }) ?? e[V];
    if (r.tag !== o.tag) {
      const a = s.tagString(r.tag), l = s.tagString(o.tag), c = `Value may be parsed as either ${a} or ${l}`;
      i(n, "TAG_RESOLVE_FAILED", c, !0);
    }
  }
  return r;
}
function Cn(s, e, t) {
  if (e) {
    t === null && (t = e.length);
    for (let n = t - 1; n >= 0; --n) {
      let i = e[n];
      switch (i.type) {
        case "space":
        case "comment":
        case "newline":
          s -= i.source.length;
          continue;
      }
      for (i = e[++n]; (i == null ? void 0 : i.type) === "space"; )
        s += i.source.length, i = e[++n];
      break;
    }
  }
  return s;
}
const Ln = { composeNode: Ss, composeEmptyNode: wt };
function Ss(s, e, t, n) {
  const { spaceBefore: i, comment: r, anchor: o, tag: a } = t;
  let l, c = !0;
  switch (e.type) {
    case "alias":
      l = vn(s, e, n), (o || a) && n(e, "ALIAS_PROPS", "An alias node must not specify any properties");
      break;
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "block-scalar":
      l = ks(s, e, a, n), o && (l.anchor = o.source.substring(1));
      break;
    case "block-map":
    case "block-seq":
    case "flow-collection":
      l = gn(Ln, s, e, a, n), o && (l.anchor = o.source.substring(1));
      break;
    default: {
      const h = e.type === "error" ? e.message : `Unsupported token (type: ${e.type})`;
      n(e, "UNEXPECTED_TOKEN", h), l = wt(s, e.offset, void 0, null, t, n), c = !1;
    }
  }
  return o && l.anchor === "" && n(o, "BAD_ALIAS", "Anchor cannot be an empty string"), i && (l.spaceBefore = !0), r && (e.type === "scalar" && e.source === "" ? l.comment = r : l.commentBefore = r), s.options.keepSourceTokens && c && (l.srcToken = e), l;
}
function wt(s, e, t, n, { spaceBefore: i, comment: r, anchor: o, tag: a, end: l }, c) {
  const h = {
    type: "scalar",
    offset: Cn(e, t, n),
    indent: -1,
    source: ""
  }, f = ks(s, h, a, c);
  return o && (f.anchor = o.source.substring(1), f.anchor === "" && c(o, "BAD_ALIAS", "Anchor cannot be an empty string")), i && (f.spaceBefore = !0), r && (f.comment = r, f.range[2] = l), f;
}
function vn({ options: s }, { offset: e, source: t, end: n }, i) {
  const r = new ot(t.substring(1));
  r.source === "" && i(e, "BAD_ALIAS", "Alias cannot be an empty string"), r.source.endsWith(":") && i(e + t.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", !0);
  const o = e + t.length, a = Ee(n, o, s.strict, i);
  return r.range = [e, o, a.offset], a.comment && (r.comment = a.comment), r;
}
function $n(s, e, { offset: t, start: n, value: i, end: r }, o) {
  const a = Object.assign({ _directives: e }, s), l = new Se(void 0, a), c = {
    atRoot: !0,
    directives: l.directives,
    options: l.options,
    schema: l.schema
  }, h = oe(n, {
    indicator: "doc-start",
    next: i ?? (r == null ? void 0 : r[0]),
    offset: t,
    onError: o,
    startOnNewline: !0
  });
  h.found && (l.directives.docStart = !0, i && (i.type === "block-map" || i.type === "block-seq") && !h.hasNewline && o(h.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker")), l.contents = i ? Ss(c, i, h, o) : wt(c, h.end, n, null, h, o);
  const f = l.contents.range[2], u = Ee(r, f, !1, o);
  return u.comment && (l.comment = u.comment), l.range = [t, f, u.offset], l;
}
function ue(s) {
  if (typeof s == "number")
    return [s, s + 1];
  if (Array.isArray(s))
    return s.length === 2 ? s : [s[0], s[1]];
  const { offset: e, source: t } = s;
  return [e, e + (typeof t == "string" ? t.length : 1)];
}
function Ut(s) {
  var i;
  let e = "", t = !1, n = !1;
  for (let r = 0; r < s.length; ++r) {
    const o = s[r];
    switch (o[0]) {
      case "#":
        e += (e === "" ? "" : n ? `

` : `
`) + (o.substring(1) || " "), t = !0, n = !1;
        break;
      case "%":
        ((i = s[r + 1]) == null ? void 0 : i[0]) !== "#" && (r += 1), t = !1;
        break;
      default:
        t || (n = !0), t = !1;
    }
  }
  return { comment: e, afterEmptyLine: n };
}
class Mn {
  constructor(e = {}) {
    this.doc = null, this.atDirectives = !1, this.prelude = [], this.errors = [], this.warnings = [], this.onError = (t, n, i, r) => {
      const o = ue(t);
      r ? this.warnings.push(new hn(o, n, i)) : this.errors.push(new de(o, n, i));
    }, this.directives = new j({ version: e.version || "1.2" }), this.options = e;
  }
  decorate(e, t) {
    const { comment: n, afterEmptyLine: i } = Ut(this.prelude);
    if (n) {
      const r = e.contents;
      if (t)
        e.comment = e.comment ? `${e.comment}
${n}` : n;
      else if (i || e.directives.docStart || !r)
        e.commentBefore = n;
      else if (T(r) && !r.flow && r.items.length > 0) {
        let o = r.items[0];
        C(o) && (o = o.key);
        const a = o.commentBefore;
        o.commentBefore = a ? `${n}
${a}` : n;
      } else {
        const o = r.commentBefore;
        r.commentBefore = o ? `${n}
${o}` : n;
      }
    }
    t ? (Array.prototype.push.apply(e.errors, this.errors), Array.prototype.push.apply(e.warnings, this.warnings)) : (e.errors = this.errors, e.warnings = this.warnings), this.prelude = [], this.errors = [], this.warnings = [];
  }
  /**
   * Current stream status information.
   *
   * Mostly useful at the end of input for an empty stream.
   */
  streamInfo() {
    return {
      comment: Ut(this.prelude).comment,
      directives: this.directives,
      errors: this.errors,
      warnings: this.warnings
    };
  }
  /**
   * Compose tokens into documents.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *compose(e, t = !1, n = -1) {
    for (const i of e)
      yield* this.next(i);
    yield* this.end(t, n);
  }
  /** Advance the composer by one CST token. */
  *next(e) {
    switch (e.type) {
      case "directive":
        this.directives.add(e.source, (t, n, i) => {
          const r = ue(e);
          r[0] += t, this.onError(r, "BAD_DIRECTIVE", n, i);
        }), this.prelude.push(e.source), this.atDirectives = !0;
        break;
      case "document": {
        const t = $n(this.options, this.directives, e, this.onError);
        this.atDirectives && !t.directives.docStart && this.onError(e, "MISSING_CHAR", "Missing directives-end/doc-start indicator line"), this.decorate(t, !1), this.doc && (yield this.doc), this.doc = t, this.atDirectives = !1;
        break;
      }
      case "byte-order-mark":
      case "space":
        break;
      case "comment":
      case "newline":
        this.prelude.push(e.source);
        break;
      case "error": {
        const t = e.source ? `${e.message}: ${JSON.stringify(e.source)}` : e.message, n = new de(ue(e), "UNEXPECTED_TOKEN", t);
        this.atDirectives || !this.doc ? this.errors.push(n) : this.doc.errors.push(n);
        break;
      }
      case "doc-end": {
        if (!this.doc) {
          const n = "Unexpected doc-end without preceding document";
          this.errors.push(new de(ue(e), "UNEXPECTED_TOKEN", n));
          break;
        }
        this.doc.directives.docEnd = !0;
        const t = Ee(e.end, e.offset + e.source.length, this.doc.options.strict, this.onError);
        if (this.decorate(this.doc, !0), t.comment) {
          const n = this.doc.comment;
          this.doc.comment = n ? `${n}
${t.comment}` : t.comment;
        }
        this.doc.range[2] = t.offset;
        break;
      }
      default:
        this.errors.push(new de(ue(e), "UNEXPECTED_TOKEN", `Unsupported token ${e.type}`));
    }
  }
  /**
   * Call at end of input to yield any remaining document.
   *
   * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
   * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
   */
  *end(e = !1, t = -1) {
    if (this.doc)
      this.decorate(this.doc, !0), yield this.doc, this.doc = null;
    else if (e) {
      const n = Object.assign({ _directives: this.directives }, this.options), i = new Se(void 0, n);
      this.atDirectives && this.onError(t, "MISSING_CHAR", "Missing directives-end indicator line"), i.range = [0, t, t], this.decorate(i, !1), yield i;
    }
  }
}
const Es = "\uFEFF", _s = "", Os = "", nt = "";
function jn(s) {
  switch (s) {
    case Es:
      return "byte-order-mark";
    case _s:
      return "doc-mode";
    case Os:
      return "flow-error-end";
    case nt:
      return "scalar";
    case "---":
      return "doc-start";
    case "...":
      return "doc-end";
    case "":
    case `
`:
    case `\r
`:
      return "newline";
    case "-":
      return "seq-item-ind";
    case "?":
      return "explicit-key-ind";
    case ":":
      return "map-value-ind";
    case "{":
      return "flow-map-start";
    case "}":
      return "flow-map-end";
    case "[":
      return "flow-seq-start";
    case "]":
      return "flow-seq-end";
    case ",":
      return "comma";
  }
  switch (s[0]) {
    case " ":
    case "	":
      return "space";
    case "#":
      return "comment";
    case "%":
      return "directive-line";
    case "*":
      return "alias";
    case "&":
      return "anchor";
    case "!":
      return "tag";
    case "'":
      return "single-quoted-scalar";
    case '"':
      return "double-quoted-scalar";
    case "|":
    case ">":
      return "block-scalar-header";
  }
  return null;
}
function D(s) {
  switch (s) {
    case void 0:
    case " ":
    case `
`:
    case "\r":
    case "	":
      return !0;
    default:
      return !1;
  }
}
const Kt = "0123456789ABCDEFabcdef".split(""), Bn = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()".split(""), Xe = ",[]{}".split(""), Dn = ` ,[]{}
\r	`.split(""), ze = (s) => !s || Dn.includes(s);
class Pn {
  constructor() {
    this.atEnd = !1, this.blockScalarIndent = -1, this.blockScalarKeep = !1, this.buffer = "", this.flowKey = !1, this.flowLevel = 0, this.indentNext = 0, this.indentValue = 0, this.lineEndPos = null, this.next = null, this.pos = 0;
  }
  /**
   * Generate YAML tokens from the `source` string. If `incomplete`,
   * a part of the last line may be left as a buffer for the next call.
   *
   * @returns A generator of lexical tokens
   */
  *lex(e, t = !1) {
    e && (this.buffer = this.buffer ? this.buffer + e : e, this.lineEndPos = null), this.atEnd = !t;
    let n = this.next ?? "stream";
    for (; n && (t || this.hasChars(1)); )
      n = yield* this.parseNext(n);
  }
  atLineEnd() {
    let e = this.pos, t = this.buffer[e];
    for (; t === " " || t === "	"; )
      t = this.buffer[++e];
    return !t || t === "#" || t === `
` ? !0 : t === "\r" ? this.buffer[e + 1] === `
` : !1;
  }
  charAt(e) {
    return this.buffer[this.pos + e];
  }
  continueScalar(e) {
    let t = this.buffer[e];
    if (this.indentNext > 0) {
      let n = 0;
      for (; t === " "; )
        t = this.buffer[++n + e];
      if (t === "\r") {
        const i = this.buffer[n + e + 1];
        if (i === `
` || !i && !this.atEnd)
          return e + n + 1;
      }
      return t === `
` || n >= this.indentNext || !t && !this.atEnd ? e + n : -1;
    }
    if (t === "-" || t === ".") {
      const n = this.buffer.substr(e, 3);
      if ((n === "---" || n === "...") && D(this.buffer[e + 3]))
        return -1;
    }
    return e;
  }
  getLine() {
    let e = this.lineEndPos;
    return (typeof e != "number" || e !== -1 && e < this.pos) && (e = this.buffer.indexOf(`
`, this.pos), this.lineEndPos = e), e === -1 ? this.atEnd ? this.buffer.substring(this.pos) : null : (this.buffer[e - 1] === "\r" && (e -= 1), this.buffer.substring(this.pos, e));
  }
  hasChars(e) {
    return this.pos + e <= this.buffer.length;
  }
  setNext(e) {
    return this.buffer = this.buffer.substring(this.pos), this.pos = 0, this.lineEndPos = null, this.next = e, null;
  }
  peek(e) {
    return this.buffer.substr(this.pos, e);
  }
  *parseNext(e) {
    switch (e) {
      case "stream":
        return yield* this.parseStream();
      case "line-start":
        return yield* this.parseLineStart();
      case "block-start":
        return yield* this.parseBlockStart();
      case "doc":
        return yield* this.parseDocument();
      case "flow":
        return yield* this.parseFlowCollection();
      case "quoted-scalar":
        return yield* this.parseQuotedScalar();
      case "block-scalar":
        return yield* this.parseBlockScalar();
      case "plain-scalar":
        return yield* this.parsePlainScalar();
    }
  }
  *parseStream() {
    let e = this.getLine();
    if (e === null)
      return this.setNext("stream");
    if (e[0] === Es && (yield* this.pushCount(1), e = e.substring(1)), e[0] === "%") {
      let t = e.length;
      const n = e.indexOf("#");
      if (n !== -1) {
        const r = e[n - 1];
        (r === " " || r === "	") && (t = n - 1);
      }
      for (; ; ) {
        const r = e[t - 1];
        if (r === " " || r === "	")
          t -= 1;
        else
          break;
      }
      const i = (yield* this.pushCount(t)) + (yield* this.pushSpaces(!0));
      return yield* this.pushCount(e.length - i), this.pushNewline(), "stream";
    }
    if (this.atLineEnd()) {
      const t = yield* this.pushSpaces(!0);
      return yield* this.pushCount(e.length - t), yield* this.pushNewline(), "stream";
    }
    return yield _s, yield* this.parseLineStart();
  }
  *parseLineStart() {
    const e = this.charAt(0);
    if (!e && !this.atEnd)
      return this.setNext("line-start");
    if (e === "-" || e === ".") {
      if (!this.atEnd && !this.hasChars(4))
        return this.setNext("line-start");
      const t = this.peek(3);
      if (t === "---" && D(this.charAt(3)))
        return yield* this.pushCount(3), this.indentValue = 0, this.indentNext = 0, "doc";
      if (t === "..." && D(this.charAt(3)))
        return yield* this.pushCount(3), "stream";
    }
    return this.indentValue = yield* this.pushSpaces(!1), this.indentNext > this.indentValue && !D(this.charAt(1)) && (this.indentNext = this.indentValue), yield* this.parseBlockStart();
  }
  *parseBlockStart() {
    const [e, t] = this.peek(2);
    if (!t && !this.atEnd)
      return this.setNext("block-start");
    if ((e === "-" || e === "?" || e === ":") && D(t)) {
      const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0));
      return this.indentNext = this.indentValue + 1, this.indentValue += n, yield* this.parseBlockStart();
    }
    return "doc";
  }
  *parseDocument() {
    yield* this.pushSpaces(!0);
    const e = this.getLine();
    if (e === null)
      return this.setNext("doc");
    let t = yield* this.pushIndicators();
    switch (e[t]) {
      case "#":
        yield* this.pushCount(e.length - t);
      case void 0:
        return yield* this.pushNewline(), yield* this.parseLineStart();
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel = 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), "doc";
      case "*":
        return yield* this.pushUntil(ze), "doc";
      case '"':
      case "'":
        return yield* this.parseQuotedScalar();
      case "|":
      case ">":
        return t += yield* this.parseBlockScalarHeader(), t += yield* this.pushSpaces(!0), yield* this.pushCount(e.length - t), yield* this.pushNewline(), yield* this.parseBlockScalar();
      default:
        return yield* this.parsePlainScalar();
    }
  }
  *parseFlowCollection() {
    let e, t, n = -1;
    do
      e = yield* this.pushNewline(), e > 0 ? (t = yield* this.pushSpaces(!1), this.indentValue = n = t) : t = 0, t += yield* this.pushSpaces(!0);
    while (e + t > 0);
    const i = this.getLine();
    if (i === null)
      return this.setNext("flow");
    if ((n !== -1 && n < this.indentNext && i[0] !== "#" || n === 0 && (i.startsWith("---") || i.startsWith("...")) && D(i[3])) && !(n === this.indentNext - 1 && this.flowLevel === 1 && (i[0] === "]" || i[0] === "}")))
      return this.flowLevel = 0, yield Os, yield* this.parseLineStart();
    let r = 0;
    for (; i[r] === ","; )
      r += yield* this.pushCount(1), r += yield* this.pushSpaces(!0), this.flowKey = !1;
    switch (r += yield* this.pushIndicators(), i[r]) {
      case void 0:
        return "flow";
      case "#":
        return yield* this.pushCount(i.length - r), "flow";
      case "{":
      case "[":
        return yield* this.pushCount(1), this.flowKey = !1, this.flowLevel += 1, "flow";
      case "}":
      case "]":
        return yield* this.pushCount(1), this.flowKey = !0, this.flowLevel -= 1, this.flowLevel ? "flow" : "doc";
      case "*":
        return yield* this.pushUntil(ze), "flow";
      case '"':
      case "'":
        return this.flowKey = !0, yield* this.parseQuotedScalar();
      case ":": {
        const o = this.charAt(1);
        if (this.flowKey || D(o) || o === ",")
          return this.flowKey = !1, yield* this.pushCount(1), yield* this.pushSpaces(!0), "flow";
      }
      default:
        return this.flowKey = !1, yield* this.parsePlainScalar();
    }
  }
  *parseQuotedScalar() {
    const e = this.charAt(0);
    let t = this.buffer.indexOf(e, this.pos + 1);
    if (e === "'")
      for (; t !== -1 && this.buffer[t + 1] === "'"; )
        t = this.buffer.indexOf("'", t + 2);
    else
      for (; t !== -1; ) {
        let r = 0;
        for (; this.buffer[t - 1 - r] === "\\"; )
          r += 1;
        if (r % 2 === 0)
          break;
        t = this.buffer.indexOf('"', t + 1);
      }
    const n = this.buffer.substring(0, t);
    let i = n.indexOf(`
`, this.pos);
    if (i !== -1) {
      for (; i !== -1; ) {
        const r = this.continueScalar(i + 1);
        if (r === -1)
          break;
        i = n.indexOf(`
`, r);
      }
      i !== -1 && (t = i - (n[i - 1] === "\r" ? 2 : 1));
    }
    if (t === -1) {
      if (!this.atEnd)
        return this.setNext("quoted-scalar");
      t = this.buffer.length;
    }
    return yield* this.pushToIndex(t + 1, !1), this.flowLevel ? "flow" : "doc";
  }
  *parseBlockScalarHeader() {
    this.blockScalarIndent = -1, this.blockScalarKeep = !1;
    let e = this.pos;
    for (; ; ) {
      const t = this.buffer[++e];
      if (t === "+")
        this.blockScalarKeep = !0;
      else if (t > "0" && t <= "9")
        this.blockScalarIndent = Number(t) - 1;
      else if (t !== "-")
        break;
    }
    return yield* this.pushUntil((t) => D(t) || t === "#");
  }
  *parseBlockScalar() {
    let e = this.pos - 1, t = 0, n;
    e:
      for (let i = this.pos; n = this.buffer[i]; ++i)
        switch (n) {
          case " ":
            t += 1;
            break;
          case `
`:
            e = i, t = 0;
            break;
          case "\r": {
            const r = this.buffer[i + 1];
            if (!r && !this.atEnd)
              return this.setNext("block-scalar");
            if (r === `
`)
              break;
          }
          default:
            break e;
        }
    if (!n && !this.atEnd)
      return this.setNext("block-scalar");
    if (t >= this.indentNext) {
      this.blockScalarIndent === -1 ? this.indentNext = t : this.indentNext += this.blockScalarIndent;
      do {
        const i = this.continueScalar(e + 1);
        if (i === -1)
          break;
        e = this.buffer.indexOf(`
`, i);
      } while (e !== -1);
      if (e === -1) {
        if (!this.atEnd)
          return this.setNext("block-scalar");
        e = this.buffer.length;
      }
    }
    if (!this.blockScalarKeep)
      do {
        let i = e - 1, r = this.buffer[i];
        r === "\r" && (r = this.buffer[--i]);
        const o = i;
        for (; r === " " || r === "	"; )
          r = this.buffer[--i];
        if (r === `
` && i >= this.pos && i + 1 + t > o)
          e = i;
        else
          break;
      } while (!0);
    return yield nt, yield* this.pushToIndex(e + 1, !0), yield* this.parseLineStart();
  }
  *parsePlainScalar() {
    const e = this.flowLevel > 0;
    let t = this.pos - 1, n = this.pos - 1, i;
    for (; i = this.buffer[++n]; )
      if (i === ":") {
        const r = this.buffer[n + 1];
        if (D(r) || e && r === ",")
          break;
        t = n;
      } else if (D(i)) {
        let r = this.buffer[n + 1];
        if (i === "\r" && (r === `
` ? (n += 1, i = `
`, r = this.buffer[n + 1]) : t = n), r === "#" || e && Xe.includes(r))
          break;
        if (i === `
`) {
          const o = this.continueScalar(n + 1);
          if (o === -1)
            break;
          n = Math.max(n, o - 2);
        }
      } else {
        if (e && Xe.includes(i))
          break;
        t = n;
      }
    return !i && !this.atEnd ? this.setNext("plain-scalar") : (yield nt, yield* this.pushToIndex(t + 1, !0), e ? "flow" : "doc");
  }
  *pushCount(e) {
    return e > 0 ? (yield this.buffer.substr(this.pos, e), this.pos += e, e) : 0;
  }
  *pushToIndex(e, t) {
    const n = this.buffer.slice(this.pos, e);
    return n ? (yield n, this.pos += n.length, n.length) : (t && (yield ""), 0);
  }
  *pushIndicators() {
    switch (this.charAt(0)) {
      case "!":
        return (yield* this.pushTag()) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "&":
        return (yield* this.pushUntil(ze)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      case "-":
      case "?":
      case ":": {
        const e = this.flowLevel > 0, t = this.charAt(1);
        if (D(t) || e && Xe.includes(t))
          return e ? this.flowKey && (this.flowKey = !1) : this.indentNext = this.indentValue + 1, (yield* this.pushCount(1)) + (yield* this.pushSpaces(!0)) + (yield* this.pushIndicators());
      }
    }
    return 0;
  }
  *pushTag() {
    if (this.charAt(1) === "<") {
      let e = this.pos + 2, t = this.buffer[e];
      for (; !D(t) && t !== ">"; )
        t = this.buffer[++e];
      return yield* this.pushToIndex(t === ">" ? e + 1 : e, !1);
    } else {
      let e = this.pos + 1, t = this.buffer[e];
      for (; t; )
        if (Bn.includes(t))
          t = this.buffer[++e];
        else if (t === "%" && Kt.includes(this.buffer[e + 1]) && Kt.includes(this.buffer[e + 2]))
          t = this.buffer[e += 3];
        else
          break;
      return yield* this.pushToIndex(e, !1);
    }
  }
  *pushNewline() {
    const e = this.buffer[this.pos];
    return e === `
` ? yield* this.pushCount(1) : e === "\r" && this.charAt(1) === `
` ? yield* this.pushCount(2) : 0;
  }
  *pushSpaces(e) {
    let t = this.pos - 1, n;
    do
      n = this.buffer[++t];
    while (n === " " || e && n === "	");
    const i = t - this.pos;
    return i > 0 && (yield this.buffer.substr(this.pos, i), this.pos = t), i;
  }
  *pushUntil(e) {
    let t = this.pos, n = this.buffer[t];
    for (; !e(n); )
      n = this.buffer[++t];
    return yield* this.pushToIndex(t, !1);
  }
}
class Rn {
  constructor() {
    this.lineStarts = [], this.addNewLine = (e) => this.lineStarts.push(e), this.linePos = (e) => {
      let t = 0, n = this.lineStarts.length;
      for (; t < n; ) {
        const r = t + n >> 1;
        this.lineStarts[r] < e ? t = r + 1 : n = r;
      }
      if (this.lineStarts[t] === e)
        return { line: t + 1, col: 1 };
      if (t === 0)
        return { line: 0, col: e };
      const i = this.lineStarts[t - 1];
      return { line: t, col: e - i + 1 };
    };
  }
}
function K(s, e) {
  for (let t = 0; t < s.length; ++t)
    if (s[t].type === e)
      return !0;
  return !1;
}
function Ft(s) {
  for (let e = 0; e < s.length; ++e)
    switch (s[e].type) {
      case "space":
      case "comment":
      case "newline":
        break;
      default:
        return e;
    }
  return -1;
}
function Ns(s) {
  switch (s == null ? void 0 : s.type) {
    case "alias":
    case "scalar":
    case "single-quoted-scalar":
    case "double-quoted-scalar":
    case "flow-collection":
      return !0;
    default:
      return !1;
  }
}
function Ne(s) {
  switch (s.type) {
    case "document":
      return s.start;
    case "block-map": {
      const e = s.items[s.items.length - 1];
      return e.sep ?? e.start;
    }
    case "block-seq":
      return s.items[s.items.length - 1].start;
    default:
      return [];
  }
}
function G(s) {
  var t;
  if (s.length === 0)
    return [];
  let e = s.length;
  e:
    for (; --e >= 0; )
      switch (s[e].type) {
        case "doc-start":
        case "explicit-key-ind":
        case "map-value-ind":
        case "seq-item-ind":
        case "newline":
          break e;
      }
  for (; ((t = s[++e]) == null ? void 0 : t.type) === "space"; )
    ;
  return s.splice(e, s.length);
}
function qt(s) {
  if (s.start.type === "flow-seq-start")
    for (const e of s.items)
      e.sep && !e.value && !K(e.start, "explicit-key-ind") && !K(e.sep, "map-value-ind") && (e.key && (e.value = e.key), delete e.key, Ns(e.value) ? e.value.end ? Array.prototype.push.apply(e.value.end, e.sep) : e.value.end = e.sep : Array.prototype.push.apply(e.start, e.sep), delete e.sep);
}
class Un {
  /**
   * @param onNewLine - If defined, called separately with the start position of
   *   each new line (in `parse()`, including the start of input).
   */
  constructor(e) {
    this.atNewLine = !0, this.atScalar = !1, this.indent = 0, this.offset = 0, this.onKeyLine = !1, this.stack = [], this.source = "", this.type = "", this.lexer = new Pn(), this.onNewLine = e;
  }
  /**
   * Parse `source` as a YAML stream.
   * If `incomplete`, a part of the last line may be left as a buffer for the next call.
   *
   * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
   *
   * @returns A generator of tokens representing each directive, document, and other structure.
   */
  *parse(e, t = !1) {
    this.onNewLine && this.offset === 0 && this.onNewLine(0);
    for (const n of this.lexer.lex(e, t))
      yield* this.next(n);
    t || (yield* this.end());
  }
  /**
   * Advance the parser by the `source` of one lexical token.
   */
  *next(e) {
    if (this.source = e, this.atScalar) {
      this.atScalar = !1, yield* this.step(), this.offset += e.length;
      return;
    }
    const t = jn(e);
    if (t)
      if (t === "scalar")
        this.atNewLine = !1, this.atScalar = !0, this.type = "scalar";
      else {
        switch (this.type = t, yield* this.step(), t) {
          case "newline":
            this.atNewLine = !0, this.indent = 0, this.onNewLine && this.onNewLine(this.offset + e.length);
            break;
          case "space":
            this.atNewLine && e[0] === " " && (this.indent += e.length);
            break;
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
            this.atNewLine && (this.indent += e.length);
            break;
          case "doc-mode":
          case "flow-error-end":
            return;
          default:
            this.atNewLine = !1;
        }
        this.offset += e.length;
      }
    else {
      const n = `Not a YAML token: ${e}`;
      yield* this.pop({ type: "error", offset: this.offset, message: n, source: e }), this.offset += e.length;
    }
  }
  /** Call at end of input to push out any remaining constructions */
  *end() {
    for (; this.stack.length > 0; )
      yield* this.pop();
  }
  get sourceToken() {
    return {
      type: this.type,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  *step() {
    const e = this.peek(1);
    if (this.type === "doc-end" && (!e || e.type !== "doc-end")) {
      for (; this.stack.length > 0; )
        yield* this.pop();
      this.stack.push({
        type: "doc-end",
        offset: this.offset,
        source: this.source
      });
      return;
    }
    if (!e)
      return yield* this.stream();
    switch (e.type) {
      case "document":
        return yield* this.document(e);
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return yield* this.scalar(e);
      case "block-scalar":
        return yield* this.blockScalar(e);
      case "block-map":
        return yield* this.blockMap(e);
      case "block-seq":
        return yield* this.blockSequence(e);
      case "flow-collection":
        return yield* this.flowCollection(e);
      case "doc-end":
        return yield* this.documentEnd(e);
    }
    yield* this.pop();
  }
  peek(e) {
    return this.stack[this.stack.length - e];
  }
  *pop(e) {
    const t = e ?? this.stack.pop();
    if (!t)
      yield { type: "error", offset: this.offset, source: "", message: "Tried to pop an empty stack" };
    else if (this.stack.length === 0)
      yield t;
    else {
      const n = this.peek(1);
      switch (t.type === "block-scalar" ? t.indent = "indent" in n ? n.indent : 0 : t.type === "flow-collection" && n.type === "document" && (t.indent = 0), t.type === "flow-collection" && qt(t), n.type) {
        case "document":
          n.value = t;
          break;
        case "block-scalar":
          n.props.push(t);
          break;
        case "block-map": {
          const i = n.items[n.items.length - 1];
          if (i.value) {
            n.items.push({ start: [], key: t, sep: [] }), this.onKeyLine = !0;
            return;
          } else if (i.sep)
            i.value = t;
          else {
            Object.assign(i, { key: t, sep: [] }), this.onKeyLine = !K(i.start, "explicit-key-ind");
            return;
          }
          break;
        }
        case "block-seq": {
          const i = n.items[n.items.length - 1];
          i.value ? n.items.push({ start: [], value: t }) : i.value = t;
          break;
        }
        case "flow-collection": {
          const i = n.items[n.items.length - 1];
          !i || i.value ? n.items.push({ start: [], key: t, sep: [] }) : i.sep ? i.value = t : Object.assign(i, { key: t, sep: [] });
          return;
        }
        default:
          yield* this.pop(), yield* this.pop(t);
      }
      if ((n.type === "document" || n.type === "block-map" || n.type === "block-seq") && (t.type === "block-map" || t.type === "block-seq")) {
        const i = t.items[t.items.length - 1];
        i && !i.sep && !i.value && i.start.length > 0 && Ft(i.start) === -1 && (t.indent === 0 || i.start.every((r) => r.type !== "comment" || r.indent < t.indent)) && (n.type === "document" ? n.end = i.start : n.items.push({ start: i.start }), t.items.splice(-1, 1));
      }
    }
  }
  *stream() {
    switch (this.type) {
      case "directive-line":
        yield { type: "directive", offset: this.offset, source: this.source };
        return;
      case "byte-order-mark":
      case "space":
      case "comment":
      case "newline":
        yield this.sourceToken;
        return;
      case "doc-mode":
      case "doc-start": {
        const e = {
          type: "document",
          offset: this.offset,
          start: []
        };
        this.type === "doc-start" && e.start.push(this.sourceToken), this.stack.push(e);
        return;
      }
    }
    yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML stream`,
      source: this.source
    };
  }
  *document(e) {
    if (e.value)
      return yield* this.lineEnd(e);
    switch (this.type) {
      case "doc-start": {
        Ft(e.start) !== -1 ? (yield* this.pop(), yield* this.step()) : e.start.push(this.sourceToken);
        return;
      }
      case "anchor":
      case "tag":
      case "space":
      case "comment":
      case "newline":
        e.start.push(this.sourceToken);
        return;
    }
    const t = this.startBlockValue(e);
    t ? this.stack.push(t) : yield {
      type: "error",
      offset: this.offset,
      message: `Unexpected ${this.type} token in YAML document`,
      source: this.source
    };
  }
  *scalar(e) {
    if (this.type === "map-value-ind") {
      const t = Ne(this.peek(2)), n = G(t);
      let i;
      e.end ? (i = e.end, i.push(this.sourceToken), delete e.end) : i = [this.sourceToken];
      const r = {
        type: "block-map",
        offset: e.offset,
        indent: e.indent,
        items: [{ start: n, key: e, sep: i }]
      };
      this.onKeyLine = !0, this.stack[this.stack.length - 1] = r;
    } else
      yield* this.lineEnd(e);
  }
  *blockScalar(e) {
    switch (this.type) {
      case "space":
      case "comment":
      case "newline":
        e.props.push(this.sourceToken);
        return;
      case "scalar":
        if (e.source = this.source, this.atNewLine = !0, this.indent = 0, this.onNewLine) {
          let t = this.source.indexOf(`
`) + 1;
          for (; t !== 0; )
            this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
        }
        yield* this.pop();
        break;
      default:
        yield* this.pop(), yield* this.step();
    }
  }
  *blockMap(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (this.onKeyLine = !1, t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else if (t.sep)
          t.sep.push(this.sourceToken);
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
    }
    if (this.indent >= e.indent) {
      const i = !this.onKeyLine && this.indent === e.indent && t.sep;
      let r = [];
      if (i && t.sep && !t.value) {
        const o = [];
        for (let a = 0; a < t.sep.length; ++a) {
          const l = t.sep[a];
          switch (l.type) {
            case "newline":
              o.push(a);
              break;
            case "space":
              break;
            case "comment":
              l.indent > e.indent && (o.length = 0);
              break;
            default:
              o.length = 0;
          }
        }
        o.length >= 2 && (r = t.sep.splice(o[1]));
      }
      switch (this.type) {
        case "anchor":
        case "tag":
          i || t.value ? (r.push(this.sourceToken), e.items.push({ start: r }), this.onKeyLine = !0) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "explicit-key-ind":
          !t.sep && !K(t.start, "explicit-key-ind") ? t.start.push(this.sourceToken) : i || t.value ? (r.push(this.sourceToken), e.items.push({ start: r })) : this.stack.push({
            type: "block-map",
            offset: this.offset,
            indent: this.indent,
            items: [{ start: [this.sourceToken] }]
          }), this.onKeyLine = !0;
          return;
        case "map-value-ind":
          if (K(t.start, "explicit-key-ind"))
            if (t.sep)
              if (t.value)
                e.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (K(t.sep, "map-value-ind"))
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: r, key: null, sep: [this.sourceToken] }]
                });
              else if (Ns(t.key) && !K(t.sep, "newline")) {
                const o = G(t.start), a = t.key, l = t.sep;
                l.push(this.sourceToken), delete t.key, delete t.sep, this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: o, key: a, sep: l }]
                });
              } else
                r.length > 0 ? t.sep = t.sep.concat(r, this.sourceToken) : t.sep.push(this.sourceToken);
            else if (K(t.start, "newline"))
              Object.assign(t, { key: null, sep: [this.sourceToken] });
            else {
              const o = G(t.start);
              this.stack.push({
                type: "block-map",
                offset: this.offset,
                indent: this.indent,
                items: [{ start: o, key: null, sep: [this.sourceToken] }]
              });
            }
          else
            t.sep ? t.value || i ? e.items.push({ start: r, key: null, sep: [this.sourceToken] }) : K(t.sep, "map-value-ind") ? this.stack.push({
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [], key: null, sep: [this.sourceToken] }]
            }) : t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          this.onKeyLine = !0;
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const o = this.flowScalar(this.type);
          i || t.value ? (e.items.push({ start: r, key: o, sep: [] }), this.onKeyLine = !0) : t.sep ? this.stack.push(o) : (Object.assign(t, { key: o, sep: [] }), this.onKeyLine = !0);
          return;
        }
        default: {
          const o = this.startBlockValue(e);
          if (o) {
            i && o.type !== "block-seq" && K(t.start, "explicit-key-ind") && e.items.push({ start: r }), this.stack.push(o);
            return;
          }
        }
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *blockSequence(e) {
    var n;
    const t = e.items[e.items.length - 1];
    switch (this.type) {
      case "newline":
        if (t.value) {
          const i = "end" in t.value ? t.value.end : void 0, r = Array.isArray(i) ? i[i.length - 1] : void 0;
          (r == null ? void 0 : r.type) === "comment" ? i == null || i.push(this.sourceToken) : e.items.push({ start: [this.sourceToken] });
        } else
          t.start.push(this.sourceToken);
        return;
      case "space":
      case "comment":
        if (t.value)
          e.items.push({ start: [this.sourceToken] });
        else {
          if (this.atIndentedComment(t.start, e.indent)) {
            const i = e.items[e.items.length - 2], r = (n = i == null ? void 0 : i.value) == null ? void 0 : n.end;
            if (Array.isArray(r)) {
              Array.prototype.push.apply(r, t.start), r.push(this.sourceToken), e.items.pop();
              return;
            }
          }
          t.start.push(this.sourceToken);
        }
        return;
      case "anchor":
      case "tag":
        if (t.value || this.indent <= e.indent)
          break;
        t.start.push(this.sourceToken);
        return;
      case "seq-item-ind":
        if (this.indent !== e.indent)
          break;
        t.value || K(t.start, "seq-item-ind") ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
        return;
    }
    if (this.indent > e.indent) {
      const i = this.startBlockValue(e);
      if (i) {
        this.stack.push(i);
        return;
      }
    }
    yield* this.pop(), yield* this.step();
  }
  *flowCollection(e) {
    const t = e.items[e.items.length - 1];
    if (this.type === "flow-error-end") {
      let n;
      do
        yield* this.pop(), n = this.peek(1);
      while (n && n.type === "flow-collection");
    } else if (e.end.length === 0) {
      switch (this.type) {
        case "comma":
        case "explicit-key-ind":
          !t || t.sep ? e.items.push({ start: [this.sourceToken] }) : t.start.push(this.sourceToken);
          return;
        case "map-value-ind":
          !t || t.value ? e.items.push({ start: [], key: null, sep: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : Object.assign(t, { key: null, sep: [this.sourceToken] });
          return;
        case "space":
        case "comment":
        case "newline":
        case "anchor":
        case "tag":
          !t || t.value ? e.items.push({ start: [this.sourceToken] }) : t.sep ? t.sep.push(this.sourceToken) : t.start.push(this.sourceToken);
          return;
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar": {
          const i = this.flowScalar(this.type);
          !t || t.value ? e.items.push({ start: [], key: i, sep: [] }) : t.sep ? this.stack.push(i) : Object.assign(t, { key: i, sep: [] });
          return;
        }
        case "flow-map-end":
        case "flow-seq-end":
          e.end.push(this.sourceToken);
          return;
      }
      const n = this.startBlockValue(e);
      n ? this.stack.push(n) : (yield* this.pop(), yield* this.step());
    } else {
      const n = this.peek(2);
      if (n.type === "block-map" && (this.type === "map-value-ind" && n.indent === e.indent || this.type === "newline" && !n.items[n.items.length - 1].sep))
        yield* this.pop(), yield* this.step();
      else if (this.type === "map-value-ind" && n.type !== "flow-collection") {
        const i = Ne(n), r = G(i);
        qt(e);
        const o = e.end.splice(1, e.end.length);
        o.push(this.sourceToken);
        const a = {
          type: "block-map",
          offset: e.offset,
          indent: e.indent,
          items: [{ start: r, key: e, sep: o }]
        };
        this.onKeyLine = !0, this.stack[this.stack.length - 1] = a;
      } else
        yield* this.lineEnd(e);
    }
  }
  flowScalar(e) {
    if (this.onNewLine) {
      let t = this.source.indexOf(`
`) + 1;
      for (; t !== 0; )
        this.onNewLine(this.offset + t), t = this.source.indexOf(`
`, t) + 1;
    }
    return {
      type: e,
      offset: this.offset,
      indent: this.indent,
      source: this.source
    };
  }
  startBlockValue(e) {
    switch (this.type) {
      case "alias":
      case "scalar":
      case "single-quoted-scalar":
      case "double-quoted-scalar":
        return this.flowScalar(this.type);
      case "block-scalar-header":
        return {
          type: "block-scalar",
          offset: this.offset,
          indent: this.indent,
          props: [this.sourceToken],
          source: ""
        };
      case "flow-map-start":
      case "flow-seq-start":
        return {
          type: "flow-collection",
          offset: this.offset,
          indent: this.indent,
          start: this.sourceToken,
          items: [],
          end: []
        };
      case "seq-item-ind":
        return {
          type: "block-seq",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: [this.sourceToken] }]
        };
      case "explicit-key-ind": {
        this.onKeyLine = !0;
        const t = Ne(e), n = G(t);
        return n.push(this.sourceToken), {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n }]
        };
      }
      case "map-value-ind": {
        this.onKeyLine = !0;
        const t = Ne(e), n = G(t);
        return {
          type: "block-map",
          offset: this.offset,
          indent: this.indent,
          items: [{ start: n, key: null, sep: [this.sourceToken] }]
        };
      }
    }
    return null;
  }
  atIndentedComment(e, t) {
    return this.type !== "comment" || this.indent <= t ? !1 : e.every((n) => n.type === "newline" || n.type === "space");
  }
  *documentEnd(e) {
    this.type !== "doc-mode" && (e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop()));
  }
  *lineEnd(e) {
    switch (this.type) {
      case "comma":
      case "doc-start":
      case "doc-end":
      case "flow-seq-end":
      case "flow-map-end":
      case "map-value-ind":
        yield* this.pop(), yield* this.step();
        break;
      case "newline":
        this.onKeyLine = !1;
      case "space":
      case "comment":
      default:
        e.end ? e.end.push(this.sourceToken) : e.end = [this.sourceToken], this.type === "newline" && (yield* this.pop());
    }
  }
}
function Kn(s) {
  const e = s.prettyErrors !== !1;
  return { lineCounter: s.lineCounter || e && new Rn() || null, prettyErrors: e };
}
function Fn(s, e = {}) {
  const { lineCounter: t, prettyErrors: n } = Kn(e), i = new Un(t == null ? void 0 : t.addNewLine), r = new Mn(e);
  let o = null;
  for (const a of r.compose(i.parse(s), !0, s.length))
    if (!o)
      o = a;
    else if (o.options.logLevel !== "silent") {
      o.errors.push(new de(a.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
      break;
    }
  return n && t && (o.errors.forEach(Pt(s, t)), o.warnings.forEach(Pt(s, t))), o;
}
function qn(s, e, t) {
  let n;
  typeof e == "function" ? n = e : t === void 0 && e && typeof e == "object" && (t = e);
  const i = Fn(s, t);
  if (!i)
    return null;
  if (i.warnings.forEach((r) => Gt(i.options.logLevel, r)), i.errors.length > 0) {
    if (i.options.logLevel !== "silent")
      throw i.errors[0];
    i.errors = [];
  }
  return i.toJS(Object.assign({ reviver: n }, t));
}
function Vn(s, e, t) {
  let n = null;
  if (typeof e == "function" || Array.isArray(e) ? n = e : t === void 0 && e && (t = e), typeof t == "string" && (t = t.length), typeof t == "number") {
    const i = Math.round(t);
    t = i < 1 ? void 0 : i > 8 ? { indent: 8 } : { indent: i };
  }
  if (s === void 0) {
    const { keepUndefined: i } = t ?? e ?? {};
    if (!i)
      return;
  }
  return new Se(s, n, t).toString(t);
}
var L = /* @__PURE__ */ ((s) => (s.CONFIG = "config", s.ORB = "orb", s.ORB_IMPORT = "orb_import", s.ORB_REF = "orb_ref", s.REUSABLE_COMMAND = "reusable_command", s.REUSED_COMMAND = "reused_command", s.RESTORE = "restore_cache", s.SAVE = "save_cache", s.ATTACH = "attach_workspace", s.PERSIST = "persist_to_workspace", s.ADD_SSH_KEYS = "add_ssh_keys", s.CHECKOUT = "checkout", s.RUN = "run", s.SETUP_REMOTE_DOCKER = "setup_remote_docker", s.STORE_ARTIFACTS = "store_artifacts", s.STORE_TEST_RESULTS = "store_test_results", s.STEP = "step", s.STEP_LIST = "steps", s.JOB = "job", s.WORKFLOW_JOB = "workflow_job", s.WORKFLOW = "workflow", s.ANY_EXECUTOR = "executor", s.DOCKER_EXECUTOR = "docker_executor", s.MACHINE_EXECUTOR = "machine_executor", s.MACOS_EXECUTOR = "macos_executor", s.WINDOWS_EXECUTOR = "windows_executor", s.REUSED_EXECUTOR = "reused_executor", s.REUSABLE_EXECUTOR = "reusable_executor", s.REUSABLE_EXECUTOR_LIST = "reusable_executors_list", s.CUSTOM_PARAMETER = "custom_parameter", s.CUSTOM_ENUM_PARAMETER = "custom_enum_parameter", s.CUSTOM_PARAMETERS_LIST = "custom_parameters_list", s.PARAMETER_REFERENCE = "parameter_reference", s.WHEN = "when", s.AND = "and", s.OR = "or", s.NOT = "not", s.EQUAL = "equal", s.TRUTHY = "value", s))(L || {});
class bt {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate AddSSHKeys Command shape.
   * @returns The generated JSON for the AddSSHKeys Command.
   */
  generate() {
    const e = { add_ssh_keys: {} };
    return e.add_ssh_keys = { ...e.add_ssh_keys, ...this.parameters }, e;
  }
  get name() {
    return "add_ssh_keys";
  }
  get generableType() {
    return L.ADD_SSH_KEYS;
  }
  static from(e) {
    if (!Jn(e))
      throw new Error("Invalid add_ssh_key command config");
    return new bt(e.add_ssh_keys);
  }
}
function Jn(s) {
  const { add_ssh_keys: e } = s;
  if (!e)
    return !1;
  const { fingerprints: t } = e;
  if (!Array.isArray(t))
    return !1;
  for (const n of t)
    if (typeof n != "string")
      return !1;
  return !0;
}
class kt {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Restore.cache Command shape.
   * @returns The generated JSON for the Restore.cache Command.
   */
  generate() {
    return {
      restore_cache: { ...this.parameters }
    };
  }
  get name() {
    return "restore_cache";
  }
  get generableType() {
    return L.RESTORE;
  }
  static from(e) {
    if (!Yn(e))
      throw new Error("Invalid restore_cache command config");
    return new kt(e.restore_cache);
  }
}
function Yn(s) {
  const { restore_cache: e } = s;
  if (!e)
    return !1;
  const { key: t, keys: n } = e;
  if (t)
    return typeof t == "string";
  if (!n || !Array.isArray(n))
    return !1;
  for (const i of n)
    if (typeof i != "string")
      return !1;
  return !0;
}
class St {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Save Cache Command shape.
   * @returns The generated JSON for the Save Cache Commands.
   */
  generate() {
    return { save_cache: { ...this.parameters } };
  }
  get name() {
    return "save_cache";
  }
  get generableType() {
    return L.SAVE;
  }
  static from(e) {
    if (!Wn(e))
      throw new Error("Invalid save_cache command config");
    return new St(e.save_cache);
  }
}
function Wn(s) {
  const { save_cache: e } = s;
  if (!e)
    return !1;
  const { key: t, paths: n, when: i } = e;
  if (!t || typeof t != "string" || i && !(/* @__PURE__ */ new Set(["always", "on_success", "on_fail"])).has(i) || !n || !Array.isArray(n))
    return !1;
  for (const o of n)
    if (typeof o != "string")
      return !1;
  return !0;
}
class ve {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Checkout Command shape.
   * @returns The generated JSON for the Checkout Command.
   */
  generate() {
    return this.parameters === void 0 ? this.name : {
      checkout: { ...this.parameters }
    };
  }
  get name() {
    return "checkout";
  }
  get generableType() {
    return L.CHECKOUT;
  }
  static from(e) {
    if (Hn(e))
      return new ve();
    if (Qn(e))
      return new ve(e.checkout);
    throw new Error("Invalid checkout command config");
  }
}
function Hn(s) {
  return s === "checkout";
}
function Qn(s) {
  const { checkout: e } = s;
  return !(!e || typeof e.path != "string");
}
class $e {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Run Command shape.*
   * @returns The generated JSON for the Run Command.
   */
  generate(e = !1) {
    const { command: t, ...n } = this.parameters;
    return Object.keys(n).length === 0 && e ? { run: t } : { run: this.parameters };
  }
  get name() {
    return "run";
  }
  /**
   * Add an environment variable to the command.
   * This will be set in plain-text via the exported config file.
   * Consider using project-level environment variables or a context for sensitive information.
   * @see {@link https://circleci.com/docs/env-vars}
   * @example
   * ```
   * myCommand.addEnvVar('MY_VAR', 'my value');
   * ```
   */
  addEnvVar(e, t) {
    return this.parameters.environment ? this.parameters.environment[e] = t : this.parameters.environment = {
      [e]: t
    }, this;
  }
  get generableType() {
    return L.RUN;
  }
  static from(e) {
    if (xn(e))
      return new $e({ command: e.run });
    if (Xn(e))
      return new $e(e.run);
    throw new Error("Invalid run command config");
  }
}
function xn(s) {
  const { run: e } = s;
  return e ? typeof e == "string" : !1;
}
function Xn(s) {
  const { run: e } = s;
  if (!e)
    return !1;
  const {
    command: t,
    background: n,
    no_output_timeout: i,
    when: r,
    shell: o,
    environment: a,
    working_directory: l
  } = e;
  if (!t || typeof t != "string" || n && typeof n != "boolean" || i && typeof i != "string" || r && !(/* @__PURE__ */ new Set(["always", "on_success", "on_fail"])).has(r) || o && typeof o != "string")
    return !1;
  if (a) {
    for (const h in a)
      if (typeof h != "string" || typeof a[h] != "string")
        return !1;
  }
  return !(l && typeof l != "string");
}
class Et {
  constructor(e = { version: "20.10.6" }) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate SetupRemoteDocker Command shape.
   * @returns The generated JSON for the SetupRemoteDocker Commands.
   */
  generate() {
    return {
      setup_remote_docker: { ...this.parameters }
    };
  }
  get name() {
    return "setup_remote_docker";
  }
  get generableType() {
    return L.SETUP_REMOTE_DOCKER;
  }
  /**
   * Enable docker image layer caching
   * @param enabled - If true, docker layer caching is enabled for the job.
   * @returns SetupRemoteDocker - The current instance of the SetupRemoteDocker Command.
   * @see {@link https://circleci.com/docs/2.0/docker-layer-caching/}
   */
  setDockerLayerCaching(e) {
    return this.parameters.docker_layer_caching = e, this;
  }
  static from(e) {
    if (!zn(e))
      throw new Error("Invalid setup_remote_docker command config");
    return new Et(e.setup_remote_docker);
  }
}
function zn(s) {
  const { setup_remote_docker: e } = s;
  if (!e)
    return !1;
  const { version: t, docker_layer_caching: n } = s.setup_remote_docker;
  return !(typeof t != "string" || n && typeof n != "boolean");
}
class _t {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate StoreArtifacts Command shape.
   * @returns The generated JSON for the StoreArtifacts Commands.
   */
  generate() {
    return {
      store_artifacts: { ...this.parameters }
    };
  }
  get name() {
    return "store_artifacts";
  }
  get generableType() {
    return L.STORE_ARTIFACTS;
  }
  static from(e) {
    if (!Zn(e))
      throw new Error("Invalid store_artifacts command config");
    return new _t(e.store_artifacts);
  }
}
function Zn(s) {
  const { store_artifacts: e } = s;
  if (!e)
    return !1;
  const { path: t, destination: n } = e;
  return !(typeof t != "string" || n && typeof n != "string");
}
class Ot {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate StoreTestResults Command shape.
   * @returns The generated JSON for the StoreTestResults Commands.
   */
  generate() {
    return {
      store_test_results: { ...this.parameters }
    };
  }
  get name() {
    return "store_test_results";
  }
  get generableType() {
    return L.STORE_TEST_RESULTS;
  }
  static from(e) {
    if (!Gn(e))
      throw new Error("Invalid store_test_results command config");
    return new Ot(e.store_test_results);
  }
}
function Gn(s) {
  const { store_test_results: e } = s;
  if (!e)
    return !1;
  const { path: t } = e;
  return typeof t == "string";
}
class Nt {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Save.cache Command shape.
   * @returns The generated JSON for the Save.cache Commands.
   */
  generate() {
    return {
      attach_workspace: { ...this.parameters }
    };
  }
  get name() {
    return "attach_workspace";
  }
  get generableType() {
    return L.ATTACH;
  }
  static from(e) {
    if (!ei(e))
      throw new Error("Invalid attach_workspace command config");
    return new Nt(e.attach_workspace);
  }
}
function ei(s) {
  const { attach_workspace: e } = s;
  if (!e)
    return !1;
  const { at: t } = e;
  return typeof t == "string";
}
class At {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e;
  }
  /**
   * Generate Save.cache Command shape.
   * @returns The generated JSON for the Save.cache Commands.
   */
  generate() {
    return {
      persist_to_workspace: { ...this.parameters }
    };
  }
  get name() {
    return "persist_to_workspace";
  }
  get generableType() {
    return L.PERSIST;
  }
  static from(e) {
    if (!ti(e))
      throw new Error("Invalid persist_to_workspace command config");
    return new At(e.persist_to_workspace);
  }
}
function ti(s) {
  const { persist_to_workspace: e } = s;
  if (!e)
    return !1;
  const { root: t, paths: n } = e;
  return !(typeof t != "string" || !Array.isArray(n) || n.length === 0);
}
class si {
  constructor(e, t, n, i, r, o, a, l) {
    E(this, "image");
    E(this, "name");
    E(this, "entrypoint");
    E(this, "command");
    E(this, "user");
    E(this, "auth");
    E(this, "environment");
    E(this, "aws_auth");
    this.image = e, this.name = t, this.entrypoint = n, this.command = i, this.user = r, this.environment = o, this.auth = a, this.aws_auth = l;
  }
}
class It {
  /**
   * @param resource_class - The resource class of the environment
   * @param parameters - Optional parameters to describe the executable environment
   */
  constructor(e) {
    E(this, "resource_class");
    this.resource_class = e;
  }
  get generateResourceClass() {
    return this.resource_class;
  }
  generate(e) {
    return {
      [this.executorLiteral]: this.generateContents(),
      resource_class: this.generateResourceClass
    };
  }
}
class Tt extends It {
  constructor(t, n = "medium", i, r) {
    super(n);
    /**
     * The name of a custom Docker image to use.
     * @example "cimg/base:stable"
     */
    E(this, "image");
    /**
     * Add additional Docker images which will be accessible from the primary container.
     * This is typically used for adding a database as a service container.
     */
    E(this, "serviceImages", []);
    const o = new si(
      t,
      i == null ? void 0 : i.name,
      i == null ? void 0 : i.entrypoint,
      i == null ? void 0 : i.command,
      i == null ? void 0 : i.user,
      i == null ? void 0 : i.environment,
      i == null ? void 0 : i.auth,
      i == null ? void 0 : i.aws_auth
    );
    this.image = o, this.serviceImages = r || [];
  }
  /**
   * Generate Docker Executor schema.
   * @returns The generated JSON for the Docker Executor.
   */
  generateContents() {
    return [this.image].concat(this.serviceImages);
  }
  get generableType() {
    return L.DOCKER_EXECUTOR;
  }
  get executorLiteral() {
    return "docker";
  }
  /**
   * Add an environment variable to the Executor.
   * This will be set in plain-text via the exported config file.
   * Consider using project-level environment variables or a context for sensitive information.
   * @see {@link https://circleci.com/docs/env-vars}
   * @example
   * ```
   * myExecutor.addEnvVar('MY_VAR', 'my value');
   * ```
   */
  addEnvVar(t, n) {
    return this.image.environment ? this.image.environment[t] = n : this.image.environment = {
      [t]: n
    }, this;
  }
  /**
   * Add additional images to run along side the primary docker image.
   */
  addServiceImage(t) {
    return this.serviceImages.push(t), this;
  }
  static from(t, n) {
    if (!ni(t))
      throw new Error("Invalid Docker executor config data");
    const i = t[0], { image: r, ...o } = i;
    return new Tt(
      i.image,
      n,
      o,
      t.slice(1)
    );
  }
}
function ni(s) {
  return !0;
}
class Ct extends It {
  constructor(t = "medium", n, i) {
    super(t);
    /**
     * Select one of the Ubuntu Linux VM Images provided by CircleCI.
     * @see - https://circleci.com/developer/machine
     */
    E(this, "image", "ubuntu-2004:202010-01");
    E(this, "docker_layer_caching");
    this.image = n || this.image, this.docker_layer_caching = i;
  }
  generateContents() {
    return {
      image: this.image,
      docker_layer_caching: this.docker_layer_caching
    };
  }
  get generableType() {
    return L.MACHINE_EXECUTOR;
  }
  get executorLiteral() {
    return "machine";
  }
  /**
   * Enable docker image layer caching
   * @param enabled - If true, docker layer caching is enabled for the machine executor.
   * @returns MachineExecutor - The current instance of the MachineExecutor Command.
   * @see {@link https://circleci.com/docs/2.0/docker-layer-caching/}
   */
  setDockerLayerCaching(t) {
    return this.docker_layer_caching = t, this;
  }
  static from(t, n) {
    if (!ii(t))
      throw new Error("Invalid machine executor config data");
    return new Ct(
      n,
      t.image,
      t.docker_layer_caching
    );
  }
}
function ii(s) {
  const { image: e, docker_layer_caching: t } = s;
  return !(typeof e != "string" || t && typeof t != "boolean");
}
class Lt extends It {
  constructor(t, n = "medium") {
    super(n);
    /**
     * Select an xcode version.
     * @see {@link https://circleci.com/developer/machine/image/macos}
     */
    E(this, "xcode");
    this.xcode = t;
  }
  generateContents() {
    return {
      xcode: this.xcode
    };
  }
  get generableType() {
    return L.MACOS_EXECUTOR;
  }
  get executorLiteral() {
    return "macos";
  }
  static from(t, n) {
    if (!ri(t))
      throw new Error("Invalid MacOSExecutor config data");
    return new Lt(t.xcode, n);
  }
}
function ri(s) {
  const { xcode: e } = s;
  return typeof e == "string";
}
class As {
  constructor(e, t) {
    E(this, "name");
    E(this, "type");
    E(this, "context");
    E(this, "config");
    this.name = e, this.type = t, this.context = /* @__PURE__ */ new Set();
  }
  withContext(e) {
    return this.context.add(e), this;
  }
  withConfig(e) {
    return this.config = e, this;
  }
}
class Is extends As {
  constructor(e) {
    super(e, "build");
  }
  withConfig(e) {
    return super.withConfig(e), this;
  }
}
class oi extends As {
  constructor(e) {
    super(e, "approval");
  }
  withConfig(e) {
    return this;
  }
}
function Vt(s, e, t) {
  const n = s.get(e) || /* @__PURE__ */ new Set();
  return n.add(t), s.set(e, n), s;
}
class Me {
  constructor(e) {
    E(this, "name");
    E(this, "jobs", []);
    E(this, "adj", /* @__PURE__ */ new Map());
    E(this, "generableType", L.WORKFLOW);
    this.name = e;
  }
  addJob(e, t) {
    this.jobs.push(e), this.adj.has(e.name) || this.adj.set(e.name, /* @__PURE__ */ new Set());
    for (const n of t || [])
      typeof n == "string" ? this.adj = Vt(this.adj, n, e.name) : this.adj = Vt(this.adj, n.name, e.name);
    return this;
  }
  requiresFor(e) {
    const t = new Array();
    return this.adj.forEach((n, i) => {
      n.has(e.name) && t.push(i);
    }), t;
  }
  generateConfig() {
    process.stdout.write(JSON.stringify(this.generate()));
  }
  generate(e) {
    return {
      version: 2.1,
      setup: !1,
      jobs: this.jobs.reduce((t, n) => (n.config && (t[n.name] = n.config.generateContents()), t), {}),
      workflows: {
        [this.name]: this.generateContents(e)
      }
    };
  }
  generateContents(e) {
    return { jobs: this.jobs.map((t) => {
      const n = Array.from(t.context.values()), i = Array.from(this.requiresFor(t)), r = {
        context: n,
        requires: i
      };
      return t.type === "approval" && (r.type = "approval"), {
        [t.name]: r
      };
    }) };
  }
  static from(e, t, n) {
    if (!ai(t))
      throw new Error("Invalid workflow configuration: " + t);
    const i = t.jobs.reduce((r, o) => {
      const { job: a, requires: l } = li(o, n);
      return r.addJob(a, l), r;
    }, new Me(e));
    return fi(i), i;
  }
  static default(e, t = "cimg/base:current") {
    const n = new Is("run-script").withConfig(Je.from(
      "build",
      {
        docker: [{ image: t }],
        resource_class: "medium",
        steps: [
          "checkout",
          {
            run: {
              name: `Run ${e}`,
              command: `bash "${e}"`
            }
          }
        ]
      }
    ));
    return new Me("default").addJob(n);
  }
}
function ai(s) {
  const { jobs: e } = s;
  return !(!e || !Array.isArray(e));
}
function li(s, e) {
  if (typeof s == "string")
    return {
      job: Jt(s, [], e),
      requires: []
    };
  if (Object.keys(s).length !== 1)
    throw new Error("Invalid workflow jobs config: too many keys: " + Object.keys(s));
  const t = Object.keys(s)[0], { context: n, requires: i, type: r } = s[t];
  if (n) {
    if (!Array.isArray(n))
      throw new Error("Invalid workflow jobs config: bad context - not array");
    for (const a of n)
      if (typeof a != "string")
        throw new Error("Invalid workflow jobs config: bad context - not string");
  }
  if (i) {
    if (!Array.isArray(i))
      throw new Error("Invalid workflow jobs config: bad requires - not array");
    for (const a of i)
      if (typeof a != "string")
        throw new Error("Invalid workflow jobs config: bad requires - not string");
  }
  if (r && !(/* @__PURE__ */ new Set(["build", "approval"])).has(r))
    throw new Error("Invalid workflow jobs config: bad type");
  switch (r) {
    case "build":
    case void 0:
      return {
        job: Jt(t, n, e),
        requires: i
      };
    case "approval":
      return {
        job: ci(t, n),
        requires: i
      };
    default:
      throw new Error("Invalid workflow jobs config: unknown job type");
  }
}
function Jt(s, e = [], t) {
  const n = e.reduce((r, o) => r.withContext(o), new Is(s)), i = t.get(s);
  if (!i)
    throw new Error('Missing config for "build" job ' + s);
  return n.withConfig(i);
}
function ci(s, e = []) {
  return e.reduce((t, n) => t.withContext(n), new oi(s));
}
function fi(s) {
  let e = /* @__PURE__ */ new Set();
  s.adj.forEach((n, i) => {
    e.add(i), n.forEach((r) => {
      e.add(r);
    });
  });
  let t = s.jobs.reduce(
    (n, i) => (n.add(i.name), n),
    /* @__PURE__ */ new Set()
  );
  return e === t;
}
class Je {
  /**
   * Instantiate a CircleCI Job
   * @param name - Name your job with a unique identifier
   * @param executor - The reusable executor to use for this job. The Executor must have already been instantiated and added to the config.
   * @param steps - A list of Commands to execute within the job in the order which they were added.
   * @param properties - Additional optional properties to further configure the job.
   * @see {@link https://circleci.com/docs/2.0/configuration-reference/?section=configuration#jobs}
   */
  constructor(e, t, n = [], i) {
    /**
     * The name of the current Job.
     */
    E(this, "name");
    /**
     * The reusable executor to use for this job. The Executor must have already been instantiated and added to the config.
     */
    E(this, "executor");
    /**
     * A list of Commands to execute within the job in the order which they were added.
     */
    E(this, "steps");
    /**
     * Number of parallel instances of this job to run (defaults to 1 if undefined)
     */
    E(this, "parallelism");
    // Execution environment properties
    E(this, "environment");
    E(this, "shell");
    E(this, "working_directory");
    this.name = e, this.executor = t, this.steps = n, this.environment = i == null ? void 0 : i.environment, this.shell = i == null ? void 0 : i.shell, this.working_directory = i == null ? void 0 : i.working_directory, this.parallelism = i == null ? void 0 : i.parallelism;
  }
  /**
   * Generates the contents of the Job.
   * @returns The generated JSON for the Job's contents.
   */
  generateContents(e) {
    const t = this.steps.map((i) => i.generate(e));
    return {
      ...this.executor.generate(e),
      steps: t,
      environment: this.environment,
      shell: this.shell,
      working_directory: this.working_directory,
      parallelism: this.parallelism
    };
  }
  /**
   * Generate Job schema
   * @returns The generated JSON for the Job.
   */
  generate(e) {
    return {
      [this.name]: this.generateContents(e)
    };
  }
  /**
   * Add steps to the current Job. Chainable.
   * @param command - Command to use for step
   */
  addStep(e) {
    return this.steps.push(e), this;
  }
  /**
   * Add an environment variable to the job.
   * This will be set in plain-text via the exported config file.
   * Consider using project-level environment variables or a context for sensitive information.
   * @see {@link https://circleci.com/docs/env-vars}
   * @example
   * ```
   * myJob.addEnvVar('MY_VAR', 'my value');
   * ```
   */
  addEnvVar(e, t) {
    return this.environment ? this.environment[e] = t : this.environment = {
      [e]: t
    }, this;
  }
  get generableType() {
    return L.JOB;
  }
  static from(e, t) {
    if (!ui(t))
      throw new Error("Invalid job config data");
    const n = hi(t), i = t.steps.map((o) => di(o)), r = mi(t);
    return new Je(e, n, i, r);
  }
}
function ui(s) {
  return !!Array.isArray(s.steps);
}
function hi(s) {
  const {
    docker: e,
    machine: t,
    macos: n,
    resource_class: i
  } = s;
  if (e)
    return Tt.from(e, i);
  if (t)
    return Ct.from(t, i);
  if (n)
    return Lt.from(n, i);
  throw new Error("Invalid job config data");
}
function di(s) {
  const {
    add_ssh_keys: e,
    attach_workspace: t,
    checkout: n,
    persist_to_workspace: i,
    restore_cache: r,
    run: o,
    save_cache: a,
    setup_remote_docker: l,
    store_artifacts: c,
    store_test_results: h
  } = s;
  if (e)
    return bt.from(s);
  if (t)
    return Nt.from(s);
  if (n || s === "checkout")
    return ve.from(s);
  if (i)
    return At.from(s);
  if (r)
    return kt.from(s);
  if (o)
    return $e.from(s);
  if (a)
    return St.from(s);
  if (l)
    return Et.from(s);
  if (c)
    return _t.from(s);
  if (h)
    return Ot.from(s);
  throw new Error("Invalid command config data");
}
function mi(s) {
  const {
    parallelism: e,
    shell: t,
    working_directory: n,
    environment: i
  } = s;
  if (e && typeof e != "number")
    throw new Error("Invalid parallelism config data");
  if (t && typeof t != "string")
    throw new Error("Invalid shell config data");
  if (n && typeof n != "string")
    throw new Error("Invalid working_directory config data");
  let r = {};
  return e && (r = { ...r, parallelism: e }), t && (r = { ...r, shell: t }), n && (r = { ...r, working_directory: n }), i && (r = { ...r, environment: i }), r;
}
class Ts {
  constructor(e, t, n, i) {
    E(this, "name");
    E(this, "type");
    E(this, "defaultValue");
    E(this, "description");
    this.name = e, this.type = t, this.defaultValue = n, this.description = i;
  }
  generate() {
    return {
      [this.name]: this.generateContents()
    };
  }
  generateContents() {
    let e = this.defaultValue;
    return this.type === "steps" && Array.isArray(e) && (e = this.defaultValue.map(
      (t) => t.generate()
    )), {
      type: this.type,
      default: e,
      description: this.description
    };
  }
  get generableType() {
    return L.CUSTOM_PARAMETER;
  }
}
class pi extends Ts {
  constructor(t, n, i, r) {
    super(t, "enum", i, r);
    E(this, "enumValues");
    this.enumValues = n;
  }
  generateContents() {
    return {
      ...super.generateContents(),
      enum: this.enumValues
    };
  }
  get generableType() {
    return L.CUSTOM_ENUM_PARAMETER;
  }
}
class gi {
  constructor(e) {
    E(this, "parameters");
    this.parameters = e || [];
  }
  generate() {
    const e = this.parameters.map((t) => t.generate());
    return Object.assign({}, ...e);
  }
  [Symbol.iterator]() {
    return this.parameters[Symbol.iterator]();
  }
  /**
   * Define a parameter to be available to the workflow job. Useful for static configurations.
   * @param name - name of the parameter
   * @param type - the literal type of the parameter
   * @param defaultValue - optional default value of parameter. If this is not provided, the parameter will be required.
   * @param description - optional description of parameter
   * @param enumValues - list of selectable enum values. Only applicable for enum type parameters.
   * @returns this for chaining
   */
  define(e, t, n, i, r) {
    let o;
    if (t === "enum")
      if (r)
        o = new pi(
          e,
          r,
          n,
          i
        );
      else
        throw new Error(
          "Enum values must be provided for enum type parameters."
        );
    else
      o = new Ts(e, t, n, i);
    const a = o;
    return this.parameters.push(a), a;
  }
  get generableType() {
    return L.CUSTOM_PARAMETERS_LIST;
  }
}
class yi {
  /**
   * Instantiate a new CircleCI config. Build up your config by adding components.
   * @param jobs - Instantiate with pre-defined Jobs.
   * @param workflows - Instantiate with pre-defined Workflows.
   * @param commands - Instantiate with pre-defined reusable Commands.
   */
  constructor(e = !1, t, n, i) {
    /**
     * The version field is intended to be used in order to issue warnings for deprecation or breaking changes.
     */
    E(this, "version", 2.1);
    /**
     * Jobs are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM.
     */
    E(this, "jobs");
    /**
     * A Workflow is comprised of one or more uniquely named jobs.
     */
    E(this, "workflows");
    /**
     * A parameter allows custom data to be passed to a pipeline.
     */
    E(this, "parameters");
    /**
     * Designates the config.yaml for use of CircleCI’s dynamic configuration feature.
     */
    E(this, "setup");
    this.setup = e, this.jobs = t || /* @__PURE__ */ new Map(), this.workflows = n || /* @__PURE__ */ new Map(), this.parameters = i;
  }
  /**
   * Add a Workflow to the current Config. Chainable
   * @param workflow - Injectable Workflow
   */
  addWorkflow(e) {
    return this.workflows.set(e.name, e), this;
  }
  getJobConfig(e) {
    return this.jobs.get(e);
  }
  getJob(e, t) {
    var n;
    return (n = this.workflows.get(e)) == null ? void 0 : n.jobs.find((i) => {
      i.name;
    });
  }
  /**
   * Add a Job to the current Config. Chainable
   * @param job - Injectable Job
   */
  addJob(e) {
    return this.jobs.set(e.name, e), this;
  }
  /**
   * Define a pipeline parameter for the current Config. Chainable
   *
   * @param name - The name of the parameter
   * @param type - The type of parameter
   * @param defaultValue - The default value of the parameter
   * @param description - A description of the parameter
   * @param enumValues - An array of possible values for parameters of enum type
   */
  defineParameter(e, t, n, i, r) {
    return this.parameters || (this.parameters = new gi()), this.parameters.define(e, t, n, i, r), this;
  }
  _prependVersionComment(e) {
    return `# This configuration has been automatically generated by the CircleCI Config SDK.
# For more information, see https://github.com/CircleCI-Public/circleci-config-sdk-ts

${e}`;
  }
  /**
   * @param flatten - Attempt to remove unnecessary parameters when possible.
   * @returns the CircleCI config as a JSON string
   */
  generate(e) {
    var o;
    const t = Yt(
      Array.from(this.workflows.values()),
      {},
      e
    ), n = Yt(Array.from(this.jobs.values()), {}, e), i = (o = this.parameters) == null ? void 0 : o.generate();
    return {
      version: this.version,
      setup: this.setup,
      parameters: i,
      jobs: n,
      workflows: t
    };
  }
  /**
   *
   * @param flatten - Attempt to remove unnecessary parameters when possible.
   * @param options - Modify the YAML output options.
   * @returns the CircleCI config as a YAML string
   */
  stringify(e, t) {
    const n = this.generate(e), i = {
      aliasDuplicateObjects: !1,
      defaultStringType: O.PLAIN,
      doubleQuotedMinMultiLineLength: 999,
      lineWidth: 0,
      minContentWidth: 0
    };
    return this._prependVersionComment(
      Vn(n, t ?? i)
    );
  }
  get generableType() {
    return L.CONFIG;
  }
}
function bi(s) {
  const e = require("node:fs"), t = qn(e.readFileSync(s, { encoding: "UTF-8" })), n = Object.keys(t.jobs).reduce(
    (o, a) => (o.set(a, Je.from(a, t.jobs[a])), o),
    /* @__PURE__ */ new Map()
  ), i = t.workflows || {}, r = Object.keys(i).reduce(
    (o, a) => (a !== "version" && o.set(a, Me.from(a, i[a], n)), o),
    /* @__PURE__ */ new Map()
  );
  return new yi(!1, n, r);
}
function Yt(s, e, t) {
  return s ? Object.assign(
    {},
    ...s.map((n) => n.generate(t))
  ) : e;
}
export {
  oi as ApprovalJob,
  Is as BuildJob,
  Je as BuildJobConfig,
  Me as Workflow,
  bi as readConfigFile
};
