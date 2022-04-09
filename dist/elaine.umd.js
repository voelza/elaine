var ue=Object.defineProperty;var ce=(f,c,v)=>c in f?ue(f,c,{enumerable:!0,configurable:!0,writable:!0,value:v}):f[c]=v;var r=(f,c,v)=>(ce(f,typeof c!="symbol"?c+"":c,v),v);(function(f,c){typeof exports=="object"&&typeof module!="undefined"?c(exports):typeof define=="function"&&define.amd?define(["exports"],c):(f=typeof globalThis!="undefined"?globalThis:f||self,c(f.ELAINE={}))})(this,function(f){"use strict";const c="@@",v="++",p="~",I="!++",Et="##",At=i=>new RegExp(c+"{"+i.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&")+"}","g"),Tt=i=>new RegExp(c+i.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),y=new RegExp(c+"([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|:']+)","g"),z=new RegExp(c+`\\{([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|:'"]+)\\}`,"g"),Lt=new RegExp(c+"\\{(\\{.+\\})\\}","g"),xt=new RegExp("(.+) in (.+)","g"),St="|";function x(i,t){if(!t)return t;if(t instanceof Object){let e=t,n=i.indexOf(".");return n!==-1&&(i=i.substring(n+1),e=e.getValueForKeyPath(i)),e}else return t}function M(i){let t=i,e=t.indexOf(".");return e!==-1&&(t=t.substring(0,e)),t}function j(i){let t=i,e=t.indexOf(".");return e!==-1&&(t=t.substring(e+1)),t}class _{constructor(t,e){r(this,"bindingsMap");r(this,"parseTokens");this.bindingsMap=new Map;const n=[];for(const s of t.split(" ").filter(o=>o)){let o=s;if(o.startsWith("!")&&o!=="!="&&(o=o.substring(1),n.push("!")),n.push(o),o.startsWith(c)){const l=o.substring(c.length),a=e.find(u=>u.binding===l);a&&this.bindingsMap.set(l,a)}}this.parseTokens=n}getBindings(){return Array.from(this.bindingsMap.values())}eval(){var l;const t=[];for(const a of this.parseTokens)if(a.startsWith(c)){const u=a.substring(c.length),h=this.bindingsMap.get(u);h&&t.push(x(u,(l=h.state)==null?void 0:l.value))}else t.push(a);let e=[],n=0;for(;n<t.length;){const a=t[n];if(a==="!"){const u=t[n+1];e.push(!u),n=n+2}else if(a==="&&")e.push("&&"),n=n+1;else if(a==="||")e.push("||"),n=n+1;else{const u=t[n+1];if(this.isOperator(u)){const h=t[n+2];e.push(this.evalCondition(a,u,h)),n=n+3}else e.push(a),n=n+1}}let s=e[0],o=1;for(;o<e.length;){let a=e[o];if(a==="&&"){const u=e[o+1];u!=null&&(s=s&&u,o+=2)}else if(a==="||"){const u=e[o+1];u!=null&&(s=s||u,o+=2)}else o++}return s}isOperator(t){return t==="<"||t==="<="||t===">"||t===">="||t==="=="||t==="!="||t==="!=="||t==="==="}parseValue(t){return t==="null"?null:t==="undefined"?void 0:t}evalCondition(t,e,n){let s=this.parseValue(t),o=this.parseValue(n);return e==="<"?s<o:e==="<="?s<=o:e===">"?s>o:e===">="?s>=o:e==="=="?s instanceof Object&&o instanceof Object?JSON.stringify(s)==JSON.stringify(o):s==o:e==="==="?s instanceof Object&&o instanceof Object?JSON.stringify(s)===JSON.stringify(o):s===o:e==="!="?s instanceof Object&&o instanceof Object?JSON.stringify(s)!=JSON.stringify(o):s!=o:e==="!=="?s instanceof Object&&o instanceof Object?JSON.stringify(s)!==JSON.stringify(o):s!==o:!1}}class S{constructor(t){r(this,"_value");r(this,"subscribers",[]);this._value=t,this._value instanceof Array?this._value=new Proxy(this._value,{get:(e,n,s)=>{const o=Reflect.get(e,n,s);return n==="push"||n==="shift"||n==="unshift"||n==="pop"||n==="sort"?(...l)=>{e[n](...l),this.notify()}:n==="splice"?(l,a)=>{e[n](l,a),this.notify()}:o}}):this._value instanceof Object&&(this._value=new Proxy(this._value,{set:(e,n,s,o)=>{const l=Reflect.set(e,n,s,o);return this.notify(),l}}))}set value(t){this.set(t)}get value(){return this._value}set(t){this._value!==t&&(this._value=t,this.notify())}setPathValue(t,e){this._value.setValueForKeyPath(t,e),this.notify()}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){for(const t of this.subscribers)t.update()}}class N{constructor(t){r(this,"value");r(this,"subscribers",[]);this.value=t}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){}}class E{constructor(t,e){r(this,"value");r(this,"computer");r(this,"parents",[]);r(this,"subscribers",[]);this.computer=t,this.value=this.computer(),this.parents=e}init(){}update(){this.value=this.computer(),this.notify()}destroy(){for(const t of this.parents)t.unsubscribe(this)}notify(){for(const t of this.subscribers)t.update()}notifyParents(){for(const t of this.parents)t.notify()}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}}function U(i,t){const e=t.parentElement;if(!e)return;const n=t.nextSibling;e.insertBefore(i,n)}function k(i,t){const e=t.parentElement;!e||e.insertBefore(i,t)}class X extends N{}class V{constructor(t){r(this,"bindings",[]);this.bindings=t}bind(t){var n;const e=this.bindings.reduce((s,o)=>(s.find(l=>l.stateName===o.stateName)===void 0&&s.push(o),s),[]);for(const s of e)(n=s.state)==null||n.subscribe(t)}}class Ct extends V{constructor(t,e){super(t);r(this,"conditionalBindings",[]);this.conditionalBindings=e}init(){this.update()}update(){for(const t of this.conditionalBindings)t.condition.eval()?t.value.init():t.value.destroy()}destroy(){for(const t of this.conditionalBindings)t.value.destroy()}}function Ot(i,t){const e=[];for(const n of i.split(";")){const s=n.split(":"),o=s[0].trim(),l=new _(o,t),a=s[1].trim();e.push({condition:l,value:a,stateBindings:[]})}return e}function wt(i,t){const e=[];for(const n of t.split(";")){const s=n.split(":"),o=s[0].trim(),l=T(i,y,o),a=new _(o,l),u=s[1].trim();e.push({condition:a,stateBindings:l,value:u})}return e}class It extends V{constructor(t,e,n,s){super(e);r(this,"element");r(this,"eventName");r(this,"listener");var o;this.bind(this),this.element=t,this.eventName=n,this.listener=l=>{var u;const a=[];for(const h of e)a.push(x(h.binding,(u=h.state)==null?void 0:u.value));return a.push(l),s(...a)},(o=this.element)==null||o.removeAttribute(v+this.eventName),this.immediateInitNeeded()&&this.init()}immediateInitNeeded(){return this.bindings.length===0||this.bindings.filter(t=>t.state instanceof X).length===this.bindings.length}init(){var t;(t=this.element)==null||t.addEventListener(this.eventName,this.listener)}update(){}destroy(){var t;(t=this.element)==null||t.removeEventListener(this.eventName,this.listener)}}function Bt(i,t){const e=[];let n=i;const s=n.indexOf("(");if(s!==-1){n=i.substring(0,s);const o=i.substring(s+1,i.length-1).split(",").map(l=>l.trim());for(const l of o){const a=l.replace(c,"");let u,h;if(l.startsWith(c))u=M(a),h=u.startsWith(p)?t.parent.getState(u.substring(p.length)):t.getState(u);else{u=a;let m=a;if(u.startsWith(St)){const d=a.replace(/\|/,"{").replace(/\|/,"}").replaceAll(/(')([\s]+)(')/g,"$1,$3").replaceAll(/'/g,'"');m=JSON.parse(d)}h=new X(m)}e.push({binding:a,stateName:u,stateSubPath:j(a),state:h})}}return{name:n,params:e}}function B(i,t,e,n){const s=Bt(n,i),o=s.name,l=s.params,a=i.getMethod(o);if(a)return new It(t,l,e,a)}function Pt(i,t,e,n){const s=wt(i,n.substring(1,n.length-1)),o=[];for(const a of s){const u=B(i,t,e,a.value);u&&o.push({condition:a.condition,stateBindings:a.stateBindings,value:u})}const l=[];for(const a of o){const u=a.stateBindings;if(u)for(const m of u)l.push(m);const h=a.value;for(const m of h.bindings)l.find(d=>d.binding===m.binding)===void 0&&l.push(m)}i.addLink(new Ct(l,o))}function Z(i,t,e,n=void 0){const s=e.name.substring(c.length),o=e.value;if(o.startsWith("{")&&o.endsWith("}"))Pt(i,t,s,o);else return o.startsWith(I)&&n!==void 0?B(n,t,s,o.substring(I.length)):B(i,t,s,o)}function Q(i,t,e=0){const n=[];let s=i.exec(t);for(;s!==null;)n.push(s[e]),s=i.exec(t);return n}function Mt(i,t,e=1){return Q(i,t,e).map(s=>{const o=s.trim(),l=M(o).trim(),a=j(o).trim();return{binding:o,stateName:l,stateSubPath:a}})}function _t(i,t,e=[0]){const n=[];let s=i.exec(t);for(;s!==null;){const o=[];for(const l of e){const a=s[l];a&&o.push({group:l,value:a})}n.push({matches:o}),s=i.exec(t)}return n}function T(i,t,e,n=1){return Mt(t,e,n).filter(s=>{const o=s.stateName,l=i.getState(o);if(l)return s.state=l,!0;const a=o.substring(0,o.indexOf("(")).trim();if(!i.getMethod(a))return!1;const h=B(i,void 0,"",s.binding);if(!h)return!1;const m=[];for(const b of h.bindings)b.state&&m.push(b.state);const d=new E(()=>h.listener(void 0),m);for(const b of m)b.subscribe(d);return i.addLink(d),s.stateName=a,s.state=d,!0})}function kt(i,t){if(t.startsWith(c)){const s=t.substring(c.length),o=M(s),l=i.getState(o);if(l)return{computer:()=>x(s,l.value),states:[l]}}const e=t.substring(0,t.indexOf("(")).trim();if(i.getMethod(e)){const s=B(i,void 0,"",t),o=[];for(const l of s.bindings)l.state&&o.push(l.state);return{computer:()=>s.listener(void 0),states:o}}return{computer:()=>t,states:[]}}function Y(i,t){const e=kt(i,t),n=new E(e.computer,e.states);for(const s of e.states)s.subscribe(n);return i.addLink(n),n}class tt extends V{constructor(t,e,n=void 0){super(t);r(this,"template");r(this,"isConditional");r(this,"conditionalBindings",[]);r(this,"valueObjectsToStrConverter");this.bind(this),this.isConditional=e.startsWith("{")&&e.endsWith("}"),this.template=this.isConditional?e.substring(1,e.length-1):e,this.valueObjectsToStrConverter=n,this.isConditional&&(this.conditionalBindings=Ot(this.template,t))}init(){this.update()}destroy(){var t;for(const e of this.bindings)(t=e.state)==null||t.unsubscribe(this)}update(){if(this.isConditional){let t="";for(const e of this.conditionalBindings)e.condition.eval()&&(t+=this.applyBindingsToTemplate(e.value)+" ");this.updateBinding(t)}else this.updateBinding(this.applyBindingsToTemplate(this.template))}applyBindingsToTemplate(t){let e=t;for(const n of this.bindings)e=this.updateTemplate(e,n);return e.replaceAll(new RegExp(Et,"g"),"")}updateTemplate(t,e){var a;let n=t;if(!e.binding)return n;const s=this.bindingRegex(e.binding),o=(a=e.state)==null?void 0:a.value,l=x(e.binding,o);return n=n.replaceAll(s,this.valueAsString(l)),n}valueAsString(t){return t instanceof Object?this.valueObjectsToStrConverter?this.valueObjectsToStrConverter(t):JSON.stringify(t):t}bindingRegex(t){return Tt(t)}}class Vt extends tt{constructor(t,e,n){super(e,n.trim());r(this,"text");this.text=t}bindingRegex(t){return At(t)}updateBinding(t){this.text.textContent=t}}function W(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(i){var t=Math.random()*16|0,e=i=="x"?t:t&3|8;return e.toString(16)})}class Ft{constructor(t,e,n){r(this,"element");r(this,"binding");r(this,"isPathValue");r(this,"inputListener");r(this,"targetAttribute");r(this,"eventListener");this.element=e,this.binding=n,this.isPathValue=n.binding!==n.stateName,this.inputListener=this.getInputListener(n),this.element.removeAttribute(c+"model"),this.targetAttribute=e.getAttribute("type")==="checkbox"?"checked":"value",this.eventListener=this.createInputListener(t)}getInputListener(t){return this.isPathValue?e=>{var s;const n=e.target;n&&((s=t.state)==null||s.setPathValue(t.stateSubPath,n[this.targetAttribute]))}:e=>{const n=e.target;n&&t.state&&(t.state.value=n[this.targetAttribute])}}createInputListener(t){const e=this.binding.binding+"-"+W();return t.addMethod(e,this.inputListener),Z(t,this.element,{name:"++input",value:e})}init(){var t;this.update(),(t=this.eventListener)==null||t.init()}update(){var t,e,n;this.isPathValue?this.element[this.targetAttribute]=(e=(t=this.binding.state)==null?void 0:t.value)==null?void 0:e.getValueForKeyPath(this.binding.stateSubPath):this.element[this.targetAttribute]=(n=this.binding.state)==null?void 0:n.value}destroy(){var t,e;(t=this.eventListener)==null||t.destroy(),(e=this.binding.state)==null||e.unsubscribe(this)}}class Rt extends S{constructor(t,e){super(t);r(this,"list");this.list=e}notify(){super.notify(),this.list instanceof E?this.list.notifyParents():this.list.notify()}}class Dt{constructor(t,e,n,s){r(this,"id",W());r(this,"instance");r(this,"loopValueName");r(this,"binding");r(this,"forComment");r(this,"loopTemplate");r(this,"initDone");r(this,"loopInstances");this.initDone=!1,this.instance=t,this.loopValueName=n,this.binding=s,this.forComment=document.createComment("for-"+this.id),U(this.forComment,e),e.remove(),this.loopTemplate=e.cloneNode(!0),e.removeAttribute(c+"for"),this.loopTemplate.removeAttribute(c+"for"),this.loopInstances=[]}init(){var t;this.initDone||(this.initDone=!0,this.insertLoopChildren(x(this.binding.binding,(t=this.binding.state)==null?void 0:t.value)))}update(){var t;this.resetLoop(),this.insertLoopChildren(x(this.binding.binding,(t=this.binding.state)==null?void 0:t.value))}destroy(){var t;for(const e of this.loopInstances)e.destroy();(t=this.binding.state)==null||t.unsubscribe(this)}resetLoop(){for(const t of this.loopInstances)t.unmount(),t.destroy();this.loopInstances=[]}insertLoopChildren(t){if(!!t)for(let e=t.length-1;e>=0;e--){const n=t[e],s=new R(P.LOOP,this.loopTemplate,this.loopTemplate,this.instance);s.merge(this.instance),s.addState(this.loopValueName,new Rt(n,this.binding.state)),s.addState("_index",new N(e)),s.appendMount(this.forComment),this.loopInstances.push(s)}}}const jt=["allowfullscreen","allowpaymentrequest","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","hidden","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected","truespeed"];class Ut extends tt{constructor(t,e,n,s){super(e,s,o=>{if(o instanceof Array)return o.join(" ");let l="";for(const a in o)l+=a+":"+o[a]+";";return l});r(this,"element");r(this,"attribute");r(this,"staticValue");r(this,"isBooleanAttribute");this.element=t,this.attribute=n,this.isBooleanAttribute=jt.includes(this.attribute),this.element.removeAttribute(c+this.attribute),this.staticValue=this.element.getAttribute(this.attribute)}updateBinding(t){this.element.removeAttribute(this.attribute);let e="";this.staticValue!==null&&(e+=this.staticValue,e+=" "),e+=t,(!this.isBooleanAttribute||e==="true")&&this.element.setAttribute(this.attribute,e)}}class et extends V{constructor(t,e,n,s,o=void 0){super(e);r(this,"id",W());r(this,"ifComment");r(this,"element");r(this,"instance");r(this,"condition");r(this,"isElementRendered");this.bind(this),this.condition=n,this.ifComment=document.createComment("if-"+this.id),k(this.ifComment,t),this.element=t,this.element.removeAttribute(c+"if"),this.instance=o!=null?o:new R(P.IF,this.element,this.element).merge(s),this.element.remove()}init(){this.eval()}update(){this.eval()}destroy(){var t;for(const e of this.bindings)(t=e.state)==null||t.unsubscribe(this);this.instance.destroy()}eval(){const t=this.condition.eval();t?(!this.isElementRendered||this.isElementRendered===void 0)&&(this.isElementRendered=t,this.instance.appendMount(this.ifComment)):(this.isElementRendered||this.isElementRendered===void 0)&&(this.isElementRendered=t,this.instance.unmount())}}function $(i,t,e=void 0){if(t.tagName==="SCRIPT"||t instanceof Comment)return;if(t.tagName==="TEMPLATE-STATE"){zt(i,t);return}if(t.hasAttribute&&t.hasAttribute(rt)){Xt(i,t,e);return}let n=!0;!(t instanceof Text)&&t.hasAttributes()&&(n=Kt(i,t,e)),t instanceof Text&&$t(i,t),n&&t.hasChildNodes()&&!i.isComponentElement(t.tagName)&&Wt(i,t.childNodes,e)}function Wt(i,t,e=void 0){for(let n=0;n<t.length;n++){const s=t[n];$(i,s,e)}}function $t(i,t){const e=t.textContent;if(!e)return;let n=[];const s=Q(Lt,e,1);let o=e;s.length===1?(o=s[0],n=T(i,y,o)):n=T(i,z,e),n.length!==0&&i.addLink(new Vt(t,n,o))}function Kt(i,t,e=void 0){let n=!0;for(const s of Array.from(t.attributes))if(s.name===c+"for")Gt(i,t,s),n=!1;else if(s.name===c+"model")Jt(i,t,s);else if(s.name===c+"if")qt(i,t,s),n=!1;else if(s.name.startsWith(c))Ht(i,t,s);else if(s.name.startsWith(v))if(i.getComponent(t.tagName)!==void 0)s.value.startsWith(I)&&(s.value=s.value.substring(I.length)),s.value=I+s.value;else{const l=Z(i,t,s,e);l&&i.addLink(l)}return n}function Gt(i,t,e){var u,h,m;const n=_t(xt,e.value,[1,2]);if(n.length!==1)return;const s=n[0].matches,o=(u=s.find(d=>d.group===1))==null?void 0:u.value.trim(),l=(h=s.find(d=>d.group===2))==null?void 0:h.value.trim();if(!o||!l)return;const a=T(i,y,l);if(a.length===1){const d=a[0],b=new Dt(i,t,o,d);(m=d.state)==null||m.subscribe(b),i.addLink(b)}}function Jt(i,t,e){const n=e.value.replaceAll(c,"").trim(),s=n.startsWith(p),o=s?n.substring(p.length):n,l=s?i.parent:i,a=M(o),u=l.getState(a);if(!u)return;const h=j(o),m={binding:o,stateName:a,stateSubPath:h,state:u},d=new Ft(l,t,m);u.subscribe(d),l.addLink(d)}function qt(i,t,e){if(i.getComponent(t.tagName))return;const n=e.value,s=T(i,y,n);s.length!==0&&i.addLink(new et(t,s,new _(n,s),i))}function Ht(i,t,e){const n=e.name.substring(c.length),s=e.value,o=T(i,y,s);o.length!==0&&i.addLink(new Ut(t,o,n,s))}function zt(i,t){for(const e of Array.from(t.attributes))i.addState(e.name,Y(i,e.value));t.remove()}function Xt(i,t,e){const n=t.getAttribute(at),s=Y(i,n);let o=null;for(const a of Array.from(t.children)){const u=a.tagName.toLowerCase();if(u==(s==null?void 0:s.value)){o=a;break}else o===null&&u==="default"&&(o=a);a.remove()}if(!o)throw"Slot-Resolve-Error: Slots with variants must provide a default slot!";const l=Array.from(o.childNodes);for(const a of l)k(a,t),$(i,a,e);t.remove()}class Zt{constructor(){r(this,"listeners",new Map)}dispatchEvent(t,e){var n;for(const s of(n=this.listeners.get(t))!=null?n:[])s(e)}addListener({eventName:t,listener:e}){let n=this.listeners.get(t);n===void 0&&(n=[]),n.push(e),this.listeners.set(t,n)}removeListener({eventName:t,listener:e}){const n=this.listeners.get(t);if(n===void 0)return;n.indexOf(e)!==-1&&n.splice(n.indexOf(e),1)}}var F=new Zt;class Qt{constructor(t){r(this,"notify");this.notify=t}add(t){for(const e of Object.keys(t)){let n=t[e];!(n instanceof S)&&!(n instanceof E)&&!(n instanceof N)&&(n=new N(n)),this["_"+e]=n,Object.defineProperty(this,e,{get:()=>n.value,set:s=>{n.value=s,this.notify()}})}}watch(t,e){const n=this["_"+t];n&&Nt.watch(()=>{e(n.value)},n)}}function Yt(i){return()=>{for(const t of i)t.update()}}class te{constructor(){r(this,"_value");r(this,"subscribers");r(this,"triggerNotify");this.subscribers=[],this.triggerNotify=Yt(this.subscribers),this._value=new Qt(this.triggerNotify)}set value(t){throw"Not allowed to change Store value"}get value(){return this._value}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){this.triggerNotify()}}var K=new te;class nt{constructor(t,...e){r(this,"watcher");r(this,"states");this.watcher=t,this.states=e}init(){}update(){this.watcher()}destroy(){for(const t of this.states)t.unsubscribe(this)}}const it=[{name:"short",format:{dateStyle:"short",timeStyle:"short"}},{name:"long",format:{dateStyle:"long",timeStyle:"long"}},{name:"medium",format:{dateStyle:"medium",timeStyle:"medium"}},{name:"full",format:{dateStyle:"full",timeStyle:"full"}}],ee=[{name:"int",format:{minFractions:0,maxFractions:0}},{name:"twoDigits",format:{minFractions:2,maxFractions:2}}];let A=new S({dateFormats:it,translations:{}});function ne(i){i.dateFormats=[...i.dateFormats||[],...it],i.numberFormats=[...i.numberFormats||[],...ee],A.value=i}let C=A.value.locale;const G=new Map,J=new Map,q=new Map,st=()=>{C=A.value.locale,G.clear();for(const{name:t,format:e}of A.value.dateFormats||[])G.set(t,e);J.clear();for(const{name:t,format:e}of A.value.numberFormats||[])J.set(t,e);q.clear();const i=A.value.translations[C!=null?C:navigator.language.split("-")[0]];if(i)for(const t of Object.keys(i))q.set(t,i[t])};st();const ie=new nt(st,A);A.subscribe(ie);function ot(i,t=void 0){const e=t?G.get(t):void 0;return new Intl.DateTimeFormat(C,{dateStyle:e==null?void 0:e.dateStyle,timeStyle:e==null?void 0:e.timeStyle}).format(i)}function se(i,t=void 0){return ot(new Date(i),t)}function oe(i,t=void 0){const e=t?J.get(t):void 0;return new Intl.NumberFormat(C,{maximumFractionDigits:e==null?void 0:e.maxFractions,minimumFractionDigits:e==null?void 0:e.minFractions}).format(i)}function re(i){const t=q.get(i);return t!=null?t:i}var P=(i=>(i[i.SETUP=0]="SETUP",i[i.COMPONENT=1]="COMPONENT",i[i.IF=2]="IF",i[i.LOOP=3]="LOOP",i))(P||{});const rt="elaine-slot",at="elaine-slot-resolver",lt="elaine-parent-component",H=[];class R{constructor(t,e,n,s=void 0,o=[],l=[],a=void 0,u=void 0,h=void 0,m=void 0,d=void 0,b=void 0,w=void 0){r(this,"origin");r(this,"element");r(this,"parent");r(this,"template");r(this,"states",new Map);r(this,"methods",new Map);r(this,"components",new Map);r(this,"links",[]);r(this,"childInstances",[]);r(this,"condition");r(this,"conditionLink");r(this,"props",[]);r(this,"slots",[]);r(this,"setup");r(this,"onMounted");r(this,"beforeUnmounted");r(this,"onUnmounted");r(this,"beforeDestroyed");r(this,"onDestroyed");r(this,"internalState");r(this,"wasCreated");r(this,"dispatchEvent");r(this,"globalEventListeners",[]);r(this,"dispatchGlobalEvent");r(this,"addGlobalEventListener");r(this,"styleElement");this.origin=t,this.element=e,this.template=n.cloneNode(!0),this.parent=s,this.props=o,this.slots=l,this.setup=a,this.onMounted=u,this.beforeUnmounted=h,this.onUnmounted=m,this.beforeDestroyed=d,this.onDestroyed=b;for(const g of w!=null?w:[])this.components.set(g.name,g);if(this.dispatchEvent=(g,L)=>{const D=new CustomEvent(g,{detail:L});this.template.dispatchEvent(D)},this.dispatchGlobalEvent=(g,L)=>{F.dispatchEvent(g,L)},this.addGlobalEventListener=(g,L)=>{const D={eventName:g,listener:L};F.addListener(D),this.globalEventListeners.push(D)},this.internalState={element:this.template,data:{},methods:{},refs:{},$store:K.value,dispatchEvent:this.dispatchEvent,dispatchGlobalEvent:this.dispatchGlobalEvent,addGlobalEventListener:this.addGlobalEventListener},this.condition=this.extractCondition(e),this.condition&&(this.conditionLink=new et(e,this.condition.getBindings(),this.condition,void 0,this),this.conditionLink.init()),this.wasCreated=!1,this.methods.set("$date",ot),this.methods.set("$strDate",se),this.methods.set("$number",oe),this.methods.set("$t",re),this.states.set("$store",K),this.components.size>0)for(const g of this.components.values()){H.push(g.name);for(const L of g.slots)H.push(L.toUpperCase())}}isComponentElement(t){return H.includes(t)}setupIfNeeded(){if(!this.wasCreated){this.resolveProps(this.element,this.parent),this.resolveSetup(),this.resolveSlots(this.element);for(const t of Array.from(this.element.attributes)){if(t.name.startsWith(ct))continue;const e=t.cloneNode(!0);this.template.attributes.setNamedItem(e)}$(this,this.template,this.parent);for(const t of this.links)t.init();if(this.initComponents([this.template]),this.origin===0){const t=this.gatherAllComponents().map(e=>e.css).filter(e=>e!==void 0).reduce((e,n)=>e+" "+n,"");t&&(this.styleElement=document.createElement("style"),this.styleElement.textContent=t)}this.wasCreated=!0}}gatherAllComponents(){return[...this.components.values(),...this.childInstances.map(t=>t.components.values()).flatMap(t=>Array.from(t))]}addLink(t){this.links.push(t)}getState(t){var o;if(t.startsWith(p))return(o=this.parent)==null?void 0:o.getState(t.substring(p.length));const e=this.states.get(t);if(!t.startsWith("!"))return e;const n=this.states.get(t.substring(1));if(!n)return;const s=new E(()=>!n.value,[n]);return n.subscribe(s),this.states.set(t,s),this.addLink(s),s}addState(t,e){this.states.set(t,e)}merge(t){if(!t)return this;for(const e of t.states.entries())this.states.set(e[0],e[1]);for(const e of t.methods.entries())this.addMethod(e[0],e[1]);for(const e of t.components.entries())this.registerComponent(e[0],e[1]);return this.parent=t.parent,this}getMethod(t){var e;return t.startsWith(p)?(e=this.parent)==null?void 0:e.getMethod(t.substring(p.length)):this.methods.get(t)}addMethod(t,e){this.methods.set(t,e)}registerComponent(t,e){this.components.set(t,e)}getComponent(t){return this.components.get(t)}mount(){this.condition&&!this.condition.eval()||(U(this.template,this.element),this.element.remove(),this.setupIfNeeded(),this.styleElement&&document.body.prepend(this.styleElement),this.onMounted&&this.onMounted(this.internalState))}appendMount(t){this.condition&&!this.condition.eval()||(U(this.template,t),this.setupIfNeeded(),this.onMounted&&this.onMounted(this.internalState))}extractCondition(t){var s;const e=t.getAttribute(c+"if");if(!e)return;const n=T((s=this.parent)!=null?s:this,y,e);return new _(e,n)}resolveSlots(t){var e;for(const n of this.slots){const s=this.template.querySelector(n);if(!s)continue;const o=s.getAttribute("variant"),l=t.querySelector(n);if(l)if(ut(l,(e=this.parent)==null?void 0:e.components),o)l.setAttribute(rt,""),l.setAttribute(at,o),k(l,s);else for(const a of Array.from(l.childNodes))k(a,s);s.remove()}}resolveProps(t,e){for(const n of this.props){const s=n.name,o=t.getAttribute(s);if(o){const l=o.substring(c.length),a=e==null?void 0:e.getState(l);if(a&&a instanceof S||a instanceof N||a instanceof E)this.states.set(s,a),this.internalState.data[s]=a;else if(o){const u=new N(this.parseIntoType(n.type,o));this.states.set(s,u),this.internalState.data[s]=a}t.removeAttribute(s)}else{if(n.required||n.required===void 0)throw`Prop-Read-Error: "${s}" is a required prop and was not provided.`;{const l=new N(n.default);this.states.set(s,l),this.internalState.data[s]=n.default}}}}parseIntoType(t,e){return e==="null"?null:e==="undefined"?void 0:t===Number?e.includes(".")?Number.parseFloat(e):Number.parseInt(e):t===Boolean?e==="true":t===Object||t===Array?JSON.parse(e):e}resolveSetup(){var e;if(!this.setup)return;const t=this.setup(this.internalState);if(t){for(const n of t.components||[])this.registerComponent(n.name,n);for(const n in(e=t.state)!=null?e:{}){const s=t.state[n];s instanceof Function?(this.methods.set(n,s),this.internalState.methods[n]=s):s instanceof S||s instanceof E||s instanceof N?(this.states.set(n,s),this.internalState.data[n]=s):(this.states.set(n,new N(s)),this.internalState.data[n]=s)}}}initComponents(t){var e;for(let n=0;n<t.length;n++){const s=t[n],l=s.getAttribute&&s.getAttribute(lt)!==null?(e=this.parent)==null?void 0:e.getComponent(s.tagName):this.getComponent(s.tagName);if(l!==void 0){const a=l.toInstance(s,this);this.childInstances.push(a);const u=s.getAttribute("ref");u&&(this.internalState.refs[u]=a.internalState),a.condition===void 0&&a.mount();continue}s.hasChildNodes()&&this.initComponents(s.childNodes)}}unmount(){var t;this.beforeUnmounted&&this.beforeUnmounted(this.internalState),this.template.remove(),(t=this.styleElement)==null||t.remove();for(const e of this.childInstances)e.unmount();this.onUnmounted&&this.onUnmounted(this.internalState)}destroy(){var t;this.beforeDestroyed&&this.beforeDestroyed(this.internalState);for(const e of this.childInstances)e.destroy();this.childInstances=[];for(const e of this.links)e.destroy();(t=this.conditionLink)==null||t.destroy();for(const e of this.globalEventListeners)F.removeListener(e);this.globalEventListeners=[],this.onDestroyed&&this.onDestroyed(this.internalState)}}function ut(i,t){if(t!=null&&t.get(i.tagName)&&i.setAttribute(lt,""),i instanceof Text&&i.textContent&&i.textContent.length!==0){const e=i.textContent.replaceAll(z,(n,s)=>c+"{"+O(s)+"}").replaceAll(y,(n,s)=>c+O(s));i.textContent=e}else if(i.hasAttributes())for(const e of Array.from(i.attributes))e.name===c+"model"?e.value=O(e.value.replace(c,"")):e.name.startsWith(v)?e.value=O(e.value).replaceAll(y,(n,s)=>c+O(s)):e.value=e.value.replaceAll(y,(n,s)=>c+O(s));i.hasChildNodes()&&ae(i.childNodes,t)}function ae(i,t){for(let e=0;e<i.length;e++){const n=i[e];ut(n,t)}}function O(i){return i.startsWith(p)?i.substring(p.length):p+i}const ct="data-elaine-c-";class le{constructor(t,e,n=[],s=[],o=void 0,l=void 0,a=void 0,u=void 0,h=void 0,m=void 0,d=void 0){r(this,"name");r(this,"template");r(this,"props",[]);r(this,"slots",[]);r(this,"setup");r(this,"onMounted");r(this,"beforeUnmounted");r(this,"onUnmounted");r(this,"beforeDestroyed");r(this,"onDestroyed");r(this,"css");if(this.name=t,this.template=e.cloneNode(!0),this.props=n,this.slots=s,this.setup=o,this.onMounted=l,this.beforeUnmounted=a,this.onUnmounted=u,this.beforeDestroyed=h,this.onDestroyed=m,d){const b=ct+t.toLowerCase();this.css=d.replaceAll(/.*\{/g,w=>`${w.substring(0,w.length-1).trim()}[${b}] {`).replace(/  |\r\n|\n|\r/gm,""),this.addAttributeToAllElements(this.template,b)}}addAttributeToAllElements(t,e){if(t.setAttribute(e,""),t.children.length>0)for(const n of Array.from(t.children))this.addAttributeToAllElements(n,e)}toInstance(t,e){return new R(P.COMPONENT,t,this.template,e,this.props,this.slots,this.setup,this.onMounted,this.beforeUnmounted,this.onUnmounted,this.beforeDestroyed,this.onDestroyed)}}Object.defineProperty(Object.prototype,"setValueForKey",{value:function(i,t){this[t]=i}}),Object.defineProperty(Object.prototype,"setValueForKeyPath",{value:function(i,t){if(i==null)return;if(i.indexOf(".")===-1){this.setValueForKey(t,i);return}const e=i.split("."),n=e.shift(),s=e.join(".");n&&this[n].setValueForKeyPath(s,t)}}),Object.defineProperty(Object.prototype,"getValueForKey",{value:function(i){return this[i]}}),Object.defineProperty(Object.prototype,"getValueForKeyPath",{value:function(i){if(i!=null){if(i.indexOf(".")===-1)return this.getValueForKey(i);var t=i.split("."),e=t.shift(),n=t.join(".");if(e)return this[e].getValueForKeyPath(n)}}});function ht(i,t=void 0){const e=new R(P.SETUP,i,i,void 0,[],[],()=>t,t==null?void 0:t.onMounted,t==null?void 0:t.beforeUnmounted,t==null?void 0:t.onUnmounted,t==null?void 0:t.beforeDestroyed,t==null?void 0:t.onDestroyed,t==null?void 0:t.components);return e.mount(),console.log(e),e.internalState}function dt(i){return new S(i)}function ft(i,...t){const e=new nt(i,...t);for(const n of t)n.subscribe(e)}function mt(i,...t){const e=new E(i,t);for(const n of t)n==null||n.subscribe(e);return e}function bt(i){const t=document.createElement("template");return i=i.trim(),t.innerHTML=i,t.content.firstChild}function gt(i){const t=i.name.toUpperCase(),e=typeof i.template=="string"?bt(i.template):i.template;return new le(t,e,i.props,i.slots,i.setup,i.onMounted,i.beforeUnmounted,i.onUnmounted,i.beforeDestroyed,i.onDestroyed,i.css)}function pt(){return F}function vt(){return K.value}function yt(i){ne(i)}var Nt={setup:ht,state:dt,watch:ft,computed:mt,component:gt,eventHub:pt,store:vt,withOptions:yt};f.component=gt,f.computed=mt,f.default=Nt,f.eventHub=pt,f.setup=ht,f.state=dt,f.store=vt,f.templateToElement=bt,f.watch=ft,f.withOptions=yt,Object.defineProperties(f,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
