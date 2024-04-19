'use strict';

var chunkXQPX7AAA_js = require('./chunk-XQPX7AAA.js');
var chunk5ETHP6SS_js = require('./chunk-5ETHP6SS.js');

var a=class{autoPopup;popupTime;timeoutId;constructor({autoPopup:t=!1,popupTime:e=2e3}={}){this.autoPopup=t,this.popupTime=e,this.timeoutId=null,this.action();}action(){document.querySelectorAll(".fj-popover-toggle").forEach(t=>{t.addEventListener("click",e=>{let r=e.target.closest(".fj-popover").querySelector(".fj-popover-content");r&&this.togglePopover(r),this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null);});}),this.autoPopup===!0&&(this.timeoutId=window.setTimeout(()=>{document.querySelectorAll(".fj-popover .fj-popover-content").forEach(e=>{this.togglePopover(e);}),this.timeoutId=null;},this.popupTime));}togglePopover(t){t.classList.toggle("translate-y-0");}};

Object.defineProperty(exports, "Notification", {
	enumerable: true,
	get: function () { return chunkXQPX7AAA_js.a; }
});
Object.defineProperty(exports, "TelephoneInput", {
	enumerable: true,
	get: function () { return chunk5ETHP6SS_js.a; }
});
exports.Popover = a;
