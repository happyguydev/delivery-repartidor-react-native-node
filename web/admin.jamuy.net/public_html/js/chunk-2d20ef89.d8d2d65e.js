(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2d20ef89"],{b247:function(r,t,e){"use strict";e.r(t),e.d(t,"scopeCss",(function(){return N}));var n=function(){for(var r=0,t=0,e=arguments.length;t<e;t++)r+=arguments[t].length;var n=Array(r),o=0;for(t=0;t<e;t++)for(var c=arguments[t],s=0,a=c.length;s<a;s++,o++)n[o]=c[s];return n},o=function(r){var t,e=[],n=0;r=r.replace(/(\[[^\]]*\])/g,(function(r,t){var o="__ph-"+n+"__";return e.push(t),n++,o})),t=r.replace(/(:nth-[-\w]+)(\([^)]+\))/g,(function(r,t,o){var c="__ph-"+n+"__";return e.push(o),n++,t+c}));var o={content:t,placeholders:e};return o},c=function(r,t){return t.replace(/__ph-(\d+)__/g,(function(t,e){return r[+e]}))},s="-shadowcsshost",a="-shadowcssslotted",i="-shadowcsscontext",u=")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)",l=new RegExp("("+s+u,"gim"),f=new RegExp("("+i+u,"gim"),p=new RegExp("("+a+u,"gim"),h=s+"-no-combinator",g=/-shadowcsshost-no-combinator([^\s]*)/,v=[/::shadow/g,/::content/g],d="([>\\s~+[.,{:][\\s\\S]*)?$",m=/-shadowcsshost/gim,x=/:host/gim,w=/::slotted/gim,_=/:host-context/gim,b=/\/\*\s*[\s\S]*?\*\//g,S=function(r){return r.replace(b,"")},W=/\/\*\s*#\s*source(Mapping)?URL=[\s\S]+?\*\//g,O=function(r){return r.match(W)||[]},k=/(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g,j=/([{}])/g,E="{",R="}",T="%BLOCK%",C=function(r,t){var e=L(r),n=0;return e.escapedString.replace(k,(function(){for(var r=[],o=0;o<arguments.length;o++)r[o]=arguments[o];var c=r[2],s="",a=r[4],i="";a&&a.startsWith("{"+T)&&(s=e.blocks[n++],a=a.substring(T.length+1),i="{");var u={selector:c,content:s},l=t(u);return""+r[1]+l.selector+r[3]+i+l.content+a}))},L=function(r){for(var t=r.split(j),e=[],n=[],o=0,c=[],s=0;s<t.length;s++){var a=t[s];a===R&&o--,o>0?c.push(a):(c.length>0&&(n.push(c.join("")),e.push(T),c=[]),e.push(a)),a===E&&o++}c.length>0&&(n.push(c.join("")),e.push(T));var i={escapedString:e.join(""),blocks:n};return i},B=function(r){return r=r.replace(_,i).replace(x,s).replace(w,a),r},I=function(r,t,e){return r.replace(t,(function(){for(var r=[],t=0;t<arguments.length;t++)r[t]=arguments[t];if(r[2]){for(var n=r[2].split(","),o=[],c=0;c<n.length;c++){var s=n[c].trim();if(!s)break;o.push(e(h,s,r[3]))}return o.join(",")}return h+r[3]}))},J=function(r,t,e){return r+t.replace(s,"")+e},K=function(r){return I(r,l,J)},$=function(r,t,e){return t.indexOf(s)>-1?J(r,t,e):r+t+e+", "+t+" "+r+e},y=function(r,t){var e="."+t+" > ",n=[];return r=r.replace(p,(function(){for(var r=[],t=0;t<arguments.length;t++)r[t]=arguments[t];if(r[2]){for(var o=r[2].trim(),c=r[3],s=e+o+c,a="",i=r[4]-1;i>=0;i--){var u=r[5][i];if("}"===u||","===u)break;a=u+a}var l=a+s,f=""+a.trimRight()+s.trim();if(l.trim()!==f.trim()){var p=f+", "+l;n.push({orgSelector:l,updatedSelector:p})}return s}return h+r[3]})),{selectors:n,cssText:r}},A=function(r){return I(r,f,$)},M=function(r){return v.reduce((function(r,t){return r.replace(t," ")}),r)},U=function(r){var t=/\[/g,e=/\]/g;return r=r.replace(t,"\\[").replace(e,"\\]"),new RegExp("^("+r+")"+d,"m")},q=function(r,t){var e=U(t);return!e.test(r)},z=function(r,t,e){if(m.lastIndex=0,m.test(r)){var n="."+e;return r.replace(g,(function(r,t){return t.replace(/([^:]*)(:*)(.*)/,(function(r,t,e,o){return t+n+e+o}))})).replace(m,n+" ")}return t+" "+r},D=function(r,t,e){var n=/\[is=([^\]]*)\]/g;t=t.replace(n,(function(r){for(var t=[],e=1;e<arguments.length;e++)t[e-1]=arguments[e];return t[0]}));var s="."+t,a=function(r){var n=r.trim();if(!n)return"";if(r.indexOf(h)>-1)n=z(r,t,e);else{var o=r.replace(m,"");if(o.length>0){var c=o.match(/([^:]*)(:*)(.*)/);c&&(n=c[1]+s+c[2]+c[3])}}return n},i=o(r);r=i.content;var u,l="",f=0,p=/( |>|\+|~(?!=))\s*/g,g=r.indexOf(h)>-1,v=!g;while(null!==(u=p.exec(r))){var d=u[1],x=r.slice(f,u.index).trim();v=v||x.indexOf(h)>-1;var w=v?a(x):x;l+=w+" "+d+" ",f=p.lastIndex}var _=r.substring(f);return v=v||_.indexOf(h)>-1,l+=v?a(_):_,c(i.placeholders,l)},F=function(r,t,e,n){return r.split(",").map((function(r){return n&&r.indexOf("."+n)>-1?r.trim():q(r,t)?D(r,t,e).trim():r.trim()})).join(", ")},G=function(r,t,e,n,o){return C(r,(function(r){var o=r.selector,c=r.content;"@"!==r.selector[0]?o=F(r.selector,t,e,n):(r.selector.startsWith("@media")||r.selector.startsWith("@supports")||r.selector.startsWith("@page")||r.selector.startsWith("@document"))&&(c=G(r.content,t,e,n));var s={selector:o.replace(/\s{2,}/g," ").trim(),content:c};return s}))},H=function(r,t,e,n,o){r=B(r),r=K(r),r=A(r);var c=y(r,n);return r=c.cssText,r=M(r),t&&(r=G(r,t,e,n)),r=r.replace(/-shadowcsshost-no-combinator/g,"."+e),r=r.replace(/>\s*\*\s+([^{, ]+)/gm," $1 "),{cssText:r.trim(),slottedSelectors:c.selectors}},N=function(r,t,e){var o=t+"-h",c=t+"-s",s=O(r);r=S(r);var a=[];if(e){var i=function(r){var t="/*!@___"+a.length+"___*/",e="/*!@"+r.selector+"*/";return a.push({placeholder:t,comment:e}),r.selector=t+r.selector,r};r=C(r,(function(r){return"@"!==r.selector[0]?i(r):r.selector.startsWith("@media")||r.selector.startsWith("@supports")||r.selector.startsWith("@page")||r.selector.startsWith("@document")?(r.content=C(r.content,i),r):r}))}var u=H(r,t,o,c);return r=n([u.cssText],s).join("\n"),e&&a.forEach((function(t){var e=t.placeholder,n=t.comment;r=r.replace(e,n)})),u.slottedSelectors.forEach((function(t){r=r.replace(t.orgSelector,t.updatedSelector)})),r};
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 * https://github.com/angular/angular/blob/master/packages/compiler/src/shadow_css.ts
 */}}]);
//# sourceMappingURL=chunk-2d20ef89.d8d2d65e.js.map