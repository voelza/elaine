var ce=Object.defineProperty;var he=(m,c,v)=>c in m?ce(m,c,{enumerable:!0,configurable:!0,writable:!0,value:v}):m[c]=v;var a=(m,c,v)=>(he(m,typeof c!="symbol"?c+"":c,v),v);(function(m,c){typeof exports=="object"&&typeof module!="undefined"?c(exports):typeof define=="function"&&define.amd?define(["exports"],c):(m=typeof globalThis!="undefined"?globalThis:m||self,c(m.ELAINE={}))})(this,function(m){"use strict";const c="@@",v="++",p="~",O="!++",mt="##",pt=s=>new RegExp(c+"{"+s.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&")+"}","g"),bt=s=>new RegExp(c+s.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),y=new RegExp(c+"([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|']+)","g"),X=new RegExp(c+`\\{([!]?[a-zA-Z0-9\\(@@\\)_$.,\\s~\\|'"]+)\\}`,"g"),gt=new RegExp(c+"\\{(\\{.+\\})\\}","g"),vt=new RegExp("(.+) in (.+)","g"),yt="|";function E(s,t){if(!t)return t;if(t instanceof Object){let e=t,n=s.indexOf(".");return n!==-1&&(s=s.substring(n+1),e=e.getValueForKeyPath(s)),e}else return t}function P(s){let t=s,e=t.indexOf(".");return e!==-1&&(t=t.substring(0,e)),t}function F(s){let t=s,e=t.indexOf(".");return e!==-1&&(t=t.substring(e+1)),t}class B{constructor(t,e){a(this,"bindingsMap");a(this,"parseTokens");this.bindingsMap=new Map;const n=[];for(const i of t.split(" ").filter(o=>o)){let o=i;if(o.startsWith("!")&&o!=="!="&&(o=o.substring(1),n.push("!")),n.push(o),o.startsWith(c)){const r=o.substring(c.length),u=e.find(l=>l.binding===r);u&&this.bindingsMap.set(r,u)}}this.parseTokens=n}getBindings(){return Array.from(this.bindingsMap.values())}eval(){var r;const t=[];for(const u of this.parseTokens)if(u.startsWith(c)){const l=u.substring(c.length),h=this.bindingsMap.get(l);h&&t.push(E(l,(r=h.state)==null?void 0:r.value))}else t.push(u);let e=[],n=0;for(;n<t.length;){const u=t[n];if(u==="!"){const l=t[n+1];e.push(!l),n=n+2}else if(u==="&&")e.push("&&"),n=n+1;else if(u==="||")e.push("||"),n=n+1;else{const l=t[n+1];if(this.isOperator(l)){const h=t[n+2];e.push(this.evalCondition(u,l,h)),n=n+3}else e.push(u),n=n+1}}let i=e[0],o=1;for(;o<e.length;){let u=e[o];if(u==="&&"){const l=e[o+1];l!=null&&(i=i&&l,o+=2)}else if(u==="||"){const l=e[o+1];l!=null&&(i=i||l,o+=2)}else o++}return i}isOperator(t){return t==="<"||t==="<="||t===">"||t===">="||t==="=="||t==="!="||t==="!=="||t==="==="}parseValue(t){return t==="null"?null:t==="undefined"?void 0:t}evalCondition(t,e,n){let i=this.parseValue(t),o=this.parseValue(n);return e==="<"?i<o:e==="<="?i<=o:e===">"?i>o:e===">="?i>=o:e==="=="?i instanceof Object&&o instanceof Object?JSON.stringify(i)==JSON.stringify(o):i==o:e==="==="?i instanceof Object&&o instanceof Object?JSON.stringify(i)===JSON.stringify(o):i===o:e==="!="?i instanceof Object&&o instanceof Object?JSON.stringify(i)!=JSON.stringify(o):i!=o:e==="!=="?i instanceof Object&&o instanceof Object?JSON.stringify(i)!==JSON.stringify(o):i!==o:!1}}class L{constructor(t){a(this,"_value");a(this,"subscribers",[]);this._value=t,this._value instanceof Array?this._value=new Proxy(this._value,{get:(e,n,i)=>{const o=Reflect.get(e,n,i);return n==="push"||n==="shift"||n==="unshift"||n==="pop"||n==="sort"?(...r)=>{e[n](...r),this.notify()}:n==="splice"?(r,u)=>{e[n](r,u),this.notify()}:o}}):this._value instanceof Object&&(this._value=new Proxy(this._value,{set:(e,n,i,o)=>{const r=Reflect.set(e,n,i,o);return this.notify(),r}}))}set value(t){this.set(t)}get value(){return this._value}set(t){this._value!==t&&(this._value=t,this.notify())}setPathValue(t,e){this._value.setValueForKeyPath(t,e),this.notify()}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){for(const t of this.subscribers)t.update()}}class b{constructor(t){a(this,"value");a(this,"subscribers",[]);this.value=t}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){}}class N{constructor(t,e){a(this,"value");a(this,"computer");a(this,"parents",[]);a(this,"subscribers",[]);this.computer=t,this.value=this.computer(),this.parents=e}init(){}update(){this.value=this.computer(),this.notify()}destroy(){for(const t of this.parents)t.unsubscribe(this)}notify(){for(const t of this.subscribers)t.update()}notifyParents(){for(const t of this.parents)t.notify()}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}}function j(s,t){const e=t.parentElement;if(!e)return;const n=t.nextSibling;e.insertBefore(s,n)}function R(s,t){const e=t.parentElement;!e||e.insertBefore(s,t)}class Z extends b{}class _{constructor(t){a(this,"bindings",[]);this.bindings=t}bind(t){var n;const e=this.bindings.reduce((i,o)=>(i.find(r=>r.stateName===o.stateName)===void 0&&i.push(o),i),[]);for(const i of e)(n=i.state)==null||n.subscribe(t)}}class Nt extends _{constructor(t,e){super(t);a(this,"conditionalBindings",[]);this.conditionalBindings=e}init(){this.update()}update(){for(const t of this.conditionalBindings)t.condition.eval()?t.value.init():t.value.destroy()}destroy(){for(const t of this.conditionalBindings)t.value.destroy()}}function St(s,t){const e=[];for(const n of s.split(";")){const i=n.split(":"),o=i[0].trim(),r=new B(o,t),u=i[1].trim();e.push({condition:r,value:u,stateBindings:[]})}return e}function Et(s,t){const e=[];for(const n of t.split(";")){const i=n.split(":"),o=i[0].trim(),r=A(s,y,o),u=new B(o,r),l=i[1].trim();e.push({condition:u,stateBindings:r,value:l})}return e}class At extends _{constructor(t,e,n,i){super(e);a(this,"element");a(this,"eventName");a(this,"listener");var o;this.bind(this),this.element=t,this.eventName=n,this.listener=r=>{var l;const u=[];for(const h of e)u.push(E(h.binding,(l=h.state)==null?void 0:l.value));return u.push(r),i(...u)},(o=this.element)==null||o.removeAttribute(v+this.eventName),this.immediateInitNeeded()&&this.init()}immediateInitNeeded(){return this.bindings.length===0||this.bindings.filter(t=>t.state instanceof Z).length===this.bindings.length}init(){var t;(t=this.element)==null||t.addEventListener(this.eventName,this.listener)}update(){}destroy(){var t;(t=this.element)==null||t.removeEventListener(this.eventName,this.listener)}}function Lt(s,t){const e=[];let n=s;const i=n.indexOf("(");if(i!==-1){n=s.substring(0,i);const o=s.substring(i+1,s.length-1).split(",").map(r=>r.trim());for(const r of o){const u=r.replace(c,"");let l,h;if(r.startsWith(c))l=P(u),h=l.startsWith(p)?t.parent.getState(l.substring(p.length)):t.getState(l);else{l=u;let d=u;if(l.startsWith(yt)){const f=u.replace(/\|/,"{").replace(/\|/,"}").replace(/~/g,":").replaceAll(/(')([\s]+)(')/g,"$1,$3").replaceAll(/'/g,'"');d=JSON.parse(f)}h=new Z(d)}e.push({binding:u,stateName:l,stateSubPath:F(u),state:h})}}return{name:n,params:e}}function T(s,t,e,n){const i=Lt(n,s),o=i.name,r=i.params,u=s.getMethod(o);if(u)return new At(t,r,e,u)}function Tt(s,t,e,n){const i=Et(s,n.substring(1,n.length-1)),o=[];for(const u of i){const l=T(s,t,e,u.value);l&&o.push({condition:u.condition,stateBindings:u.stateBindings,value:l})}const r=[];for(const u of o){const l=u.stateBindings;if(l)for(const d of l)r.push(d);const h=u.value;for(const d of h.bindings)r.find(f=>f.binding===d.binding)===void 0&&r.push(d)}s.addLink(new Nt(r,o))}function Q(s,t,e,n=void 0){const i=e.name.substring(c.length),o=e.value;if(o.startsWith("{")&&o.endsWith("}"))Tt(s,t,i,o);else return o.startsWith(O)&&n!==void 0?T(n,t,i,o.substring(O.length)):T(s,t,i,o)}function Y(s,t,e=0){const n=[];let i=s.exec(t);for(;i!==null;)n.push(i[e]),i=s.exec(t);return n}function wt(s,t,e=1){return Y(s,t,e).map(i=>{const o=i.trim(),r=P(o).trim(),u=F(o).trim();return{binding:o,stateName:r,stateSubPath:u}})}function xt(s,t,e=[0]){const n=[];let i=s.exec(t);for(;i!==null;){const o=[];for(const r of e){const u=i[r];u&&o.push({group:r,value:u})}n.push({matches:o}),i=s.exec(t)}return n}function A(s,t,e,n=1){return wt(t,e,n).filter(i=>{const o=i.stateName,r=s.getState(o);if(r)return i.state=r,!0;const u=o.substring(0,o.indexOf("(")).trim();if(!s.getMethod(u))return!1;const h=T(s,void 0,"",i.binding);if(!h)return!1;const d=[];for(const g of h.bindings)g.state&&d.push(g.state);const f=new N(()=>h.listener(void 0),d);for(const g of d)g.subscribe(f);return s.addLink(f),i.stateName=u,i.state=f,!0})}function Ct(s,t){if(t.startsWith(c)){const i=t.substring(c.length),o=P(i),r=s.getState(o);if(r)return{computer:()=>E(i,r.value),states:[r]}}const e=t.substring(0,t.indexOf("(")).trim();if(s.getMethod(e)){const i=T(s,void 0,"",t),o=[];for(const r of i.bindings)r.state&&o.push(r.state);return{computer:()=>i.listener(void 0),states:o}}return{computer:()=>t,states:[]}}function tt(s,t){const e=Ct(s,t),n=new N(e.computer,e.states);for(const i of e.states)i.subscribe(n);return s.addLink(n),n}class et extends _{constructor(t,e,n=void 0){super(t);a(this,"template");a(this,"isConditional");a(this,"conditionalBindings",[]);a(this,"valueObjectsToStrConverter");this.bind(this),this.isConditional=e.startsWith("{")&&e.endsWith("}"),this.template=this.isConditional?e.substring(1,e.length-1):e,this.valueObjectsToStrConverter=n,this.isConditional&&(this.conditionalBindings=St(this.template,t))}init(){this.update()}destroy(){var t;for(const e of this.bindings)(t=e.state)==null||t.unsubscribe(this)}update(){if(this.isConditional){let t="";for(const e of this.conditionalBindings)e.condition.eval()&&(t+=this.applyBindingsToTemplate(e.value)+" ");this.updateBinding(t)}else this.updateBinding(this.applyBindingsToTemplate(this.template))}applyBindingsToTemplate(t){let e=t;for(const n of this.bindings)e=this.updateTemplate(e,n);return e.replaceAll(new RegExp(mt,"g"),"")}updateTemplate(t,e){var u;let n=t;if(!e.binding)return n;const i=this.bindingRegex(e.binding),o=(u=e.state)==null?void 0:u.value,r=E(e.binding,o);return n=n.replaceAll(i,this.valueAsString(r)),n}valueAsString(t){return t instanceof Object?this.valueObjectsToStrConverter?this.valueObjectsToStrConverter(t):JSON.stringify(t):t}bindingRegex(t){return bt(t)}}class Ot extends et{constructor(t,e,n){super(e,n.trim());a(this,"text");this.text=t}bindingRegex(t){return pt(t)}updateBinding(t){this.text.textContent=t}}function D(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(s){var t=Math.random()*16|0,e=s=="x"?t:t&3|8;return e.toString(16)})}class Pt{constructor(t,e,n){a(this,"element");a(this,"binding");a(this,"isPathValue");a(this,"inputListener");a(this,"targetAttribute");a(this,"eventListener");this.element=e,this.binding=n,this.isPathValue=n.binding!==n.stateName,this.inputListener=this.getInputListener(n),this.element.removeAttribute(c+"model"),this.targetAttribute=e.getAttribute("type")==="checkbox"?"checked":"value",this.eventListener=this.createInputListener(t)}getInputListener(t){return this.isPathValue?e=>{var i;const n=e.target;n&&((i=t.state)==null||i.setPathValue(t.stateSubPath,n[this.targetAttribute]))}:e=>{const n=e.target;n&&t.state&&(t.state.value=n[this.targetAttribute])}}createInputListener(t){const e=this.binding.binding+"-"+D();return t.addMethod(e,this.inputListener),Q(t,this.element,{name:"++input",value:e})}init(){var t;this.update(),(t=this.eventListener)==null||t.init()}update(){var t,e,n;this.isPathValue?this.element[this.targetAttribute]=(e=(t=this.binding.state)==null?void 0:t.value)==null?void 0:e.getValueForKeyPath(this.binding.stateSubPath):this.element[this.targetAttribute]=(n=this.binding.state)==null?void 0:n.value}destroy(){var t,e;(t=this.eventListener)==null||t.destroy(),(e=this.binding.state)==null||e.unsubscribe(this)}}class It extends L{constructor(t,e){super(t);a(this,"list");this.list=e}notify(){super.notify(),this.list instanceof N?this.list.notifyParents():this.list.notify()}}class Bt{constructor(t,e,n,i){a(this,"id",D());a(this,"instance");a(this,"loopValueName");a(this,"binding");a(this,"forComment");a(this,"loopTemplate");a(this,"initDone");a(this,"loopInstances");this.initDone=!1,this.instance=t,this.loopValueName=n,this.binding=i,this.forComment=document.createComment("for-"+this.id),j(this.forComment,e),e.remove(),this.loopTemplate=e.cloneNode(!0),e.removeAttribute(c+"for"),this.loopTemplate.removeAttribute(c+"for"),this.loopInstances=[]}init(){var t;this.initDone||(this.initDone=!0,this.insertLoopChildren(E(this.binding.binding,(t=this.binding.state)==null?void 0:t.value)))}update(){var t;this.resetLoop(),this.insertLoopChildren(E(this.binding.binding,(t=this.binding.state)==null?void 0:t.value))}destroy(){var t;for(const e of this.loopInstances)e.destroy();(t=this.binding.state)==null||t.unsubscribe(this)}resetLoop(){for(const t of this.loopInstances)t.unmount(),t.destroy();this.loopInstances=[]}insertLoopChildren(t){if(!!t)for(let e=t.length-1;e>=0;e--){const n=t[e],i=new I(x.LOOP,this.loopTemplate,this.loopTemplate,this.instance);i.merge(this.instance),i.addState(this.loopValueName,new It(n,this.binding.state)),i.addState("_index",new b(e)),i.appendMount(this.forComment),this.loopInstances.push(i)}}}const Rt=["allowfullscreen","allowpaymentrequest","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","hidden","ismap","itemscope","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected","truespeed"];class _t extends et{constructor(t,e,n,i){super(e,i,o=>{if(o instanceof Array)return o.join(" ");let r="";for(const u in o)r+=u+":"+o[u]+";";return r});a(this,"element");a(this,"attribute");a(this,"staticValue");a(this,"isBooleanAttribute");this.element=t,this.attribute=n,this.isBooleanAttribute=Rt.includes(this.attribute),this.element.removeAttribute(c+this.attribute),this.staticValue=this.element.getAttribute(this.attribute)}updateBinding(t){this.element.removeAttribute(this.attribute);let e="";this.staticValue!==null&&(e+=this.staticValue,e+=" "),e+=t,(!this.isBooleanAttribute||e==="true")&&(this.element.setAttribute(this.attribute,e),this.attribute==="value"&&(this.element.value=e))}}class nt extends _{constructor(t,e,n,i,o=void 0){super(e);a(this,"id",D());a(this,"ifComment");a(this,"element");a(this,"instance");a(this,"condition");a(this,"isElementRendered");this.bind(this),this.condition=n,this.ifComment=document.createComment("if-"+this.id),R(this.ifComment,t),this.element=t,this.element.removeAttribute(c+"if"),this.instance=o!=null?o:new I(x.IF,this.element,this.element).merge(i),this.element.remove()}init(){this.eval()}update(){this.eval()}destroy(){var t;for(const e of this.bindings)(t=e.state)==null||t.unsubscribe(this);this.instance.destroy()}eval(){const t=this.condition.eval();t?(!this.isElementRendered||this.isElementRendered===void 0)&&(this.isElementRendered=t,this.instance.appendMount(this.ifComment)):(this.isElementRendered||this.isElementRendered===void 0)&&(this.isElementRendered=t,this.instance.unmount())}}function W(s,t,e=void 0){if(t.tagName==="SCRIPT"||t instanceof Comment)return;if(t.tagName==="TEMPLATE-STATE"){$t(s,t);return}if(t.hasAttribute&&t.hasAttribute(ut)){Ut(s,t,e);return}let n=!0;!(t instanceof Text)&&t.hasAttributes()&&(n=Vt(s,t,e)),t instanceof Text&&kt(s,t),n&&t.hasChildNodes()&&!s.isComponentElement(t.tagName)&&Mt(s,t.childNodes,e)}function Mt(s,t,e=void 0){for(let n=0;n<t.length;n++){const i=t[n];W(s,i,e)}}function kt(s,t){const e=t.textContent;if(!e)return;let n=[];const i=Y(gt,e,1);let o=e;i.length===1?(o=i[0],n=A(s,y,o)):n=A(s,X,e),n.length!==0&&s.addLink(new Ot(t,n,o))}function Vt(s,t,e=void 0){let n=!0;for(const i of Array.from(t.attributes))if(i.name===c+"for")Ft(s,t,i),n=!1;else if(i.name===c+"model")jt(s,t,i);else if(i.name===c+"if")Dt(s,t,i),n=!1;else if(i.name.startsWith(c))Wt(s,t,i);else if(i.name.startsWith(v))if(s.getComponent(t.tagName)!==void 0)i.value.startsWith(O)&&(i.value=i.value.substring(O.length)),i.value=O+i.value;else{const r=Q(s,t,i,e);r&&s.addLink(r)}return n}function Ft(s,t,e){var l,h,d;const n=xt(vt,e.value,[1,2]);if(n.length!==1)return;const i=n[0].matches,o=(l=i.find(f=>f.group===1))==null?void 0:l.value.trim(),r=(h=i.find(f=>f.group===2))==null?void 0:h.value.trim();if(!o||!r)return;const u=A(s,y,r);if(u.length===1){const f=u[0],g=new Bt(s,t,o,f);(d=f.state)==null||d.subscribe(g),s.addLink(g)}}function jt(s,t,e){const n=e.value.replaceAll(c,"").trim(),i=n.startsWith(p),o=i?n.substring(p.length):n,r=i?s.parent:s,u=P(o),l=r.getState(u);if(!l)return;const h=F(o),d={binding:o,stateName:u,stateSubPath:h,state:l},f=new Pt(r,t,d);l.subscribe(f),r.addLink(f)}function Dt(s,t,e){if(s.getComponent(t.tagName))return;const n=e.value,i=A(s,y,n);i.length!==0&&s.addLink(new nt(t,i,new B(n,i),s))}function Wt(s,t,e){const n=e.name.substring(c.length),i=e.value,o=A(s,y,i);o.length!==0&&s.addLink(new _t(t,o,n,i))}function $t(s,t){for(const e of Array.from(t.attributes))s.addState(e.name,tt(s,e.value));t.remove()}function Ut(s,t,e){const n=t.getAttribute(lt),i=tt(s,n);let o=null;for(const u of Array.from(t.children)){const l=u.tagName.toLowerCase();if(l==(i==null?void 0:i.value)){o=u;break}else o===null&&l==="default"&&(o=u);u.remove()}if(!o)throw"Slot-Resolve-Error: Slots with variants must provide a default slot!";const r=Array.from(o.childNodes);for(const u of r)R(u,t),W(s,u,e);t.remove()}class Kt{constructor(){a(this,"listeners",new Map)}dispatchEvent(t,e){var n;for(const i of(n=this.listeners.get(t))!=null?n:[])i(e)}addListener({eventName:t,listener:e}){let n=this.listeners.get(t);n===void 0&&(n=[]),n.push(e),this.listeners.set(t,n)}removeListener({eventName:t,listener:e}){const n=this.listeners.get(t);if(n===void 0)return;n.indexOf(e)!==-1&&n.splice(n.indexOf(e),1)}}var M=new Kt;class Gt{constructor(t){a(this,"notify");this.notify=t}add(t){for(const e of Object.keys(t)){let n=t[e];!(n instanceof L)&&!(n instanceof N)&&!(n instanceof b)&&(n=new b(n)),this["_"+e]=n,Object.defineProperty(this,e,{get:()=>n.value,set:i=>{n.value=i,this.notify()}})}}watch(t,e){const n=this["_"+t];n&&q(()=>{e(n.value)},n)}}function Jt(s){return()=>{for(const t of s)t.update()}}class qt{constructor(){a(this,"_value");a(this,"subscribers");a(this,"triggerNotify");this.subscribers=[],this.triggerNotify=Jt(this.subscribers),this._value=new Gt(this.triggerNotify)}set value(t){throw"Not allowed to change Store value"}get value(){return this._value}set(){}setPathValue(){}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){this.triggerNotify()}}var $=new qt;class st{constructor(t,...e){a(this,"watcher");a(this,"states");this.watcher=t,this.states=e}init(){}update(){this.watcher()}destroy(){for(const t of this.states)t.unsubscribe(this)}}const it=[{name:"short",format:{dateStyle:"short",timeStyle:"short"}},{name:"long",format:{dateStyle:"long",timeStyle:"long"}},{name:"medium",format:{dateStyle:"medium",timeStyle:"medium"}},{name:"full",format:{dateStyle:"full",timeStyle:"full"}}],Ht=[{name:"int",format:{minFractions:0,maxFractions:0}},{name:"twoDigits",format:{minFractions:2,maxFractions:2}}];let S=new L({dateFormats:it,translations:{}});function zt(s){s.dateFormats=[...s.dateFormats||[],...it],s.numberFormats=[...s.numberFormats||[],...Ht],S.value=s}let w=S.value.locale;const U=new Map,K=new Map,G=new Map,ot=()=>{w=S.value.locale,U.clear();for(const{name:t,format:e}of S.value.dateFormats||[])U.set(t,e);K.clear();for(const{name:t,format:e}of S.value.numberFormats||[])K.set(t,e);G.clear();const s=S.value.translations[w!=null?w:navigator.language.split("-")[0]];if(s)for(const t of Object.keys(s))G.set(t,s[t])};ot();const Xt=new st(ot,S);S.subscribe(Xt);function rt(s,t=void 0){const e=t?U.get(t):void 0;return new Intl.DateTimeFormat(w,{dateStyle:e==null?void 0:e.dateStyle,timeStyle:e==null?void 0:e.timeStyle}).format(s)}function Zt(s,t=void 0){return rt(new Date(s),t)}function Qt(s,t=void 0){const e=t?K.get(t):void 0;return new Intl.NumberFormat(w,{maximumFractionDigits:e==null?void 0:e.maxFractions,minimumFractionDigits:e==null?void 0:e.minFractions}).format(s)}function Yt(s){const t=G.get(s);return t!=null?t:s}class at{constructor(t){a(this,"value");a(this,"subscribers",[]);this.value=t}set(t){this.value!==t&&(this.value=t)}setPathValue(t,e){this.value.setValueForKeyPath(t,e)}subscribe(t){this.subscribers.push(t)}unsubscribe(t){const e=this.subscribers.indexOf(t);e!==-1&&this.subscribers.splice(e,1)}notify(){for(const t of this.subscribers)t.update()}}var x=(s=>(s[s.SETUP=0]="SETUP",s[s.COMPONENT=1]="COMPONENT",s[s.IF=2]="IF",s[s.LOOP=3]="LOOP",s))(x||{});const ut="elaine-slot",lt="elaine-slot-resolver",ct="elaine-parent-component",J=[];class I{constructor(t,e,n,i=void 0,o=[],r=[],u=void 0,l=void 0){a(this,"origin");a(this,"element");a(this,"parent");a(this,"template");a(this,"states",new Map);a(this,"methods",new Map);a(this,"components",new Map);a(this,"links",[]);a(this,"childInstances",[]);a(this,"condition");a(this,"conditionLink");a(this,"props",[]);a(this,"slots",[]);a(this,"setup");a(this,"onMounted");a(this,"beforeUnmounted");a(this,"onUnmounted");a(this,"beforeDestroyed");a(this,"onDestroyed");a(this,"internalState");a(this,"wasCreated");a(this,"dispatchEvent");a(this,"globalEventListeners",[]);a(this,"dispatchGlobalEvent");a(this,"addGlobalEventListener");a(this,"styleElement");this.origin=t,this.element=e,this.template=n.cloneNode(!0),this.parent=i,this.props=o,this.slots=r,this.setup=u;for(const h of l!=null?l:[])this.components.set(h.name,h);if(this.dispatchEvent=(h,d)=>{const f=new CustomEvent(h,{detail:d});this.template.dispatchEvent(f)},this.dispatchGlobalEvent=(h,d)=>{M.dispatchEvent(h,d)},this.addGlobalEventListener=(h,d)=>{const f={eventName:h,listener:d};M.addListener(f),this.globalEventListeners.push(f)},this.internalState={element:this.template,data:{},methods:{},refs:{},$store:$.value,dispatchEvent:this.dispatchEvent,dispatchGlobalEvent:this.dispatchGlobalEvent,addGlobalEventListener:this.addGlobalEventListener},this.condition=this.extractCondition(e),this.condition&&(this.conditionLink=new nt(e,this.condition.getBindings(),this.condition,void 0,this),this.conditionLink.init()),this.wasCreated=!1,this.methods.set("$date",rt),this.methods.set("$strDate",Zt),this.methods.set("$number",Qt),this.methods.set("$t",Yt),this.states.set("$store",$),this.components.size>0)for(const h of this.components.values()){J.push(h.name);for(const d of h.slots)J.push(d.toUpperCase())}}isComponentElement(t){return J.includes(t)}setupIfNeeded(){if(!this.wasCreated){if(this.resolveProps(this.element,this.parent),this.resolveSetup(),this.resolveSlots(this.element),this.origin===1)for(const t of Array.from(this.element.attributes)){if(t.name.startsWith(dt))continue;const e=t.cloneNode(!0),n=this.template.attributes.getNamedItem(e.name);n&&(e.value+=` ${n.value}`),this.template.attributes.setNamedItem(e)}W(this,this.template,this.parent);for(const t of this.links)t.init();if(this.initComponents([this.template]),this.origin===0){const t=this.gatherAllComponents().map(e=>e.css).filter(e=>e!==void 0).reduce((e,n)=>e+" "+n,"");t&&(this.styleElement=document.createElement("style"),this.styleElement.textContent=t)}this.wasCreated=!0}}gatherAllComponents(){const t=[];for(const e of this.components.values())for(const n of e.gatherAllComponents())t.push(n);return t}addLink(t){this.links.push(t)}getState(t){var o;if(t.startsWith(p))return(o=this.parent)==null?void 0:o.getState(t.substring(p.length));const e=this.states.get(t);if(!t.startsWith("!"))return e;const n=this.states.get(t.substring(1));if(!n)return;const i=new N(()=>!n.value,[n]);return n.subscribe(i),this.states.set(t,i),this.addLink(i),i}addState(t,e){this.states.set(t,e)}merge(t){if(!t)return this;for(const e of t.states.entries())this.states.set(e[0],e[1]);for(const e of t.methods.entries())this.addMethod(e[0],e[1]);for(const e of t.components.entries())this.registerComponent(e[0],e[1]);return this.parent=t.parent,this}getMethod(t){var e;return t.startsWith(p)?(e=this.parent)==null?void 0:e.getMethod(t.substring(p.length)):this.methods.get(t)}addMethod(t,e){this.methods.set(t,e)}registerComponent(t,e){this.components.set(t,e)}getComponent(t){return this.components.get(t)}mount(){this.condition&&!this.condition.eval()||(j(this.template,this.element),this.element.remove(),this.setupIfNeeded(),this.styleElement&&document.body.prepend(this.styleElement),this.onMounted&&this.onMounted(this.internalState))}appendMount(t){this.condition&&!this.condition.eval()||(j(this.template,t),this.setupIfNeeded(),this.onMounted&&this.onMounted(this.internalState))}extractCondition(t){var i;const e=t.getAttribute(c+"if");if(!e)return;const n=A((i=this.parent)!=null?i:this,y,e);return new B(e,n)}resolveSlots(t){var e;for(const n of this.slots){const i=this.template.querySelector(n);if(!i)continue;const o=i.getAttribute("variant"),r=t.querySelector(n);if(r)if(ht(r,(e=this.parent)==null?void 0:e.components),o)r.setAttribute(ut,""),r.setAttribute(lt,o),R(r,i);else for(const u of Array.from(r.childNodes))R(u,i);i.remove()}}resolveProps(t,e){for(const n of this.props){const i=n.name,o=t.getAttribute(i);if(o){const r=o.substring(c.length),u=P(r),l=e==null?void 0:e.getState(u);if(l&&l instanceof L||l instanceof b||l instanceof N)if(r.indexOf(".")===-1)this.states.set(i,l),this.internalState.data[i]=l;else{const h=new b(E(r,l.value));this.states.set(i,h),this.internalState.data[i]=h}else if(this.methods.get(u)){const d=T(e,void 0,"",r),f=[];for(const V of d.bindings)V.state&&f.push(V.state);const g=new N(()=>d.listener(void 0),f);for(const V of f)V.subscribe(g);e.addLink(g)}else if(o){const d=new b(this.parseIntoType(n.type,o));this.states.set(i,d),this.internalState.data[i]=l}t.removeAttribute(i)}else{if(n.required||n.required===void 0)throw`Prop-Read-Error: "${i}" is a required prop and was not provided.`;{const r=new b(n.default);this.states.set(i,r),this.internalState.data[i]=n.default}}}}parseIntoType(t,e){return e==="null"?null:e==="undefined"?void 0:t===Number?e.includes(".")?Number.parseFloat(e):Number.parseInt(e):t===Boolean?e==="true":t===Object||t===Array?JSON.parse(e):e}resolveSetup(){var e;if(!this.setup)return;const t=this.setup(this.internalState);if(t){this.onMounted=t.onMounted,this.beforeUnmounted=t.beforeUnmounted,this.onUnmounted=t.onUnmounted,this.beforeDestroyed=t.beforeDestroyed,this.onDestroyed=t.onDestroyed;for(const n in(e=t.state)!=null?e:{}){const i=t.state[n];i instanceof Function?(this.methods.set(n,i),this.internalState.methods[n]=i):i instanceof L||i instanceof N||i instanceof b||i instanceof at?(this.states.set(n,i),this.internalState.data[n]=i):(this.states.set(n,new b(i)),this.internalState.data[n]=i)}}}initComponents(t){var e;for(let n=0;n<t.length;n++){const i=t[n],r=i.getAttribute&&i.getAttribute(ct)!==null?(e=this.parent)==null?void 0:e.getComponent(i.tagName):this.getComponent(i.tagName);if(r!==void 0){const u=r.toInstance(i,this);this.childInstances.push(u);const l=i.getAttribute("ref");l&&(this.internalState.refs[l]=u.internalState),u.condition===void 0&&u.mount();continue}i.hasChildNodes()&&this.initComponents(i.childNodes)}}unmount(){var t;this.beforeUnmounted&&this.beforeUnmounted(this.internalState),this.template.remove(),(t=this.styleElement)==null||t.remove();for(const e of this.childInstances)e.unmount();this.onUnmounted&&this.onUnmounted(this.internalState)}destroy(){var t;this.beforeDestroyed&&this.beforeDestroyed(this.internalState);for(const e of this.childInstances)e.destroy();this.childInstances=[];for(const e of this.links)e.destroy();(t=this.conditionLink)==null||t.destroy();for(const e of this.globalEventListeners)M.removeListener(e);this.globalEventListeners=[],this.onDestroyed&&this.onDestroyed(this.internalState)}}function ht(s,t){if(t!=null&&t.get(s.tagName)&&s.setAttribute(ct,""),s instanceof Text&&s.textContent&&s.textContent.length!==0){const e=s.textContent.replaceAll(X,(n,i)=>c+"{"+C(i)+"}").replaceAll(y,(n,i)=>c+C(i));s.textContent=e}else if(s.hasAttributes())for(const e of Array.from(s.attributes))e.name===c+"model"?e.value=C(e.value.replace(c,"")):e.name.startsWith(v)?e.value=C(e.value).replaceAll(y,(n,i)=>c+C(i)):e.value=e.value.replaceAll(y,(n,i)=>c+C(i));s.hasChildNodes()&&te(s.childNodes,t)}function te(s,t){for(let e=0;e<s.length;e++){const n=s[e];ht(n,t)}}function C(s){return s.startsWith(p)?s.substring(p.length):p+s}const dt="data-elaine-c-";class ee{constructor(t,e,n=[],i=[],o=void 0,r=void 0,u){a(this,"name");a(this,"template");a(this,"props",[]);a(this,"slots",[]);a(this,"setup");a(this,"css");a(this,"components");if(this.name=t,this.template=e.cloneNode(!0),this.props=n,this.slots=i,this.setup=o,this.components=u,r){const l=dt+t.toLowerCase();this.css=r.replaceAll(/.*\{/g,h=>`${h.substring(0,h.length-1).trim()}[${l}] {`).replace(/  |\r\n|\n|\r/gm,""),this.addAttributeToAllElements(this.template,l)}}addAttributeToAllElements(t,e){if(t.setAttribute(e,""),t.children.length>0)for(const n of Array.from(t.children))this.addAttributeToAllElements(n,e)}gatherAllComponents(){if(!this.components)return[this];const t=[this];for(const e of this.components)for(const n of e.gatherAllComponents())t.push(n);return t}toInstance(t,e=void 0){return new I(x.COMPONENT,t,this.template,e,this.props,this.slots,this.setup,this.components)}}class ne{constructor(t,e){a(this,"routes");a(this,"currentPath");a(this,"currentRoute");this.routes=t,this.currentPath=ft(window.location.hash),this.currentRoute=H(()=>{const n=this.currentPath.value.slice(1)||"/";return this.routes.find(i=>i.path===n)||{path:"/404",component:e}},this.currentPath),window.addEventListener("hashchange",()=>{this.currentPath.value=window.location.hash})}changeRoute(t){window.location.hash=t}}function se(s,t=void 0){t||(t=z({name:"DefaultNotFound",template:"<div>Route not found.</div>"}));const e=new ne(s,t);return{router:e,routerComponent:z({name:"router-view",template:"<!-- router -->",setup:n=>{const i=k("<span></span>"),o=new I(x.COMPONENT,i,i,void 0,[],[],()=>({state:{currentRouteProps:H(()=>e.currentRoute.value.props,e.currentRoute)}}));o.setupIfNeeded();let r;function u(){r==null||r.unmount(),r==null||r.destroy();const l=e.currentRoute.value,h=l.props?Object.keys(l.props).map(f=>`${f}="@@currentRouteProps.${f}"`).join(" "):"",d=k(`<${l.component.name} ${h}></${l.component.name}>`);r=l.component.toInstance(d,o),r.appendMount(n.element)}return q(u,e.currentRoute),u(),{onUnmounted:()=>{r==null||r.unmount()},beforeDestroyed:()=>{r==null||r.destroy()}}},components:s.map(n=>n.component).concat([t])})}}Object.defineProperty(Object.prototype,"setValueForKey",{value:function(s,t){this[t]=s}}),Object.defineProperty(Object.prototype,"setValueForKeyPath",{value:function(s,t){if(s==null)return;if(s.indexOf(".")===-1){this.setValueForKey(t,s);return}const e=s.split("."),n=e.shift(),i=e.join(".");n&&this[n].setValueForKeyPath(i,t)}}),Object.defineProperty(Object.prototype,"getValueForKey",{value:function(s){return this[s]}}),Object.defineProperty(Object.prototype,"getValueForKeyPath",{value:function(s){if(s!=null){if(s.indexOf(".")===-1)return this.getValueForKey(s);var t=s.split("."),e=t.shift(),n=t.join(".");if(e)return this[e].getValueForKeyPath(n)}}});function ie(s,t=void 0){const e=new I(x.SETUP,s,s,void 0,[],[],()=>t,t==null?void 0:t.components);return e.mount(),console.log(e),e.internalState}function ft(s){return new L(s)}function oe(s){return new at(s)}function q(s,...t){const e=new st(s,...t);for(const n of t)n.subscribe(e)}function H(s,...t){const e=new N(s,t);for(const n of t)n==null||n.subscribe(e);return e}function k(s){const t=document.createElement("template");return s=s.trim(),t.innerHTML=s,t.content.firstChild}function z(s){const t=s.name.toUpperCase(),e=typeof s.template=="string"?k(s.template):s.template;return new ee(t,e,s.props,s.slots,s.setup,s.css,s.components)}function re(){return M}function ae(){return $.value}function ue(s){zt(s)}function le(s,t=void 0){return se(s,t)}m.component=z,m.computed=H,m.createRouter=le,m.eventHub=re,m.getStore=ae,m.inert=oe,m.setup=ie,m.state=ft,m.templateToElement=k,m.watch=q,m.withOptions=ue,Object.defineProperties(m,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}})});
