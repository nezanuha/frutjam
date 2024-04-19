export { a as Notification } from './chunk-IBBUYHAR.mjs';
export { a as TelephoneInput } from './chunk-ENVEEOFC.mjs';

var a=class{autoPopup;popupTime;timeoutId;constructor({autoPopup:t=!1,popupTime:e=2e3}={}){this.autoPopup=t,this.popupTime=e,this.timeoutId=null,this.action();}action(){document.querySelectorAll(".fj-popover-toggle").forEach(t=>{t.addEventListener("click",e=>{let r=e.target.closest(".fj-popover").querySelector(".fj-popover-content");r&&this.togglePopover(r),this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null);});}),this.autoPopup===!0&&(this.timeoutId=window.setTimeout(()=>{document.querySelectorAll(".fj-popover .fj-popover-content").forEach(e=>{this.togglePopover(e);}),this.timeoutId=null;},this.popupTime));}togglePopover(t){t.classList.toggle("translate-y-0");}};

export { a as Popover };
