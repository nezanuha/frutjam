import "./styles.css"
export default class Popover {
  autoPopup: boolean;
  popupTime: number;
  timeoutId: number | null;

  constructor({ autoPopup = false, popupTime = 2000 }: { autoPopup?: boolean; popupTime?: number } = {}) {
      this.autoPopup = autoPopup;
      this.popupTime = popupTime;
      this.timeoutId = null;
      this.action();
  }

  action(): void {
      document.querySelectorAll<HTMLElement>(".fj-popover-toggle").forEach((event) => {
          event.addEventListener("click", (e) => {
              const self = e.target as HTMLElement;
              const popoverContent = self.closest(".fj-popover")!.querySelector(".fj-popover-content") as HTMLElement | null;
              if (popoverContent) {
                  this.togglePopover(popoverContent);
              }

              if (this.timeoutId !== null) {
                  clearTimeout(this.timeoutId);
                  this.timeoutId = null;
              }
          });
      });

      if (this.autoPopup === true) {
          this.timeoutId = window.setTimeout(() => {
              const popoverContents = document.querySelectorAll<HTMLElement>(".fj-popover .fj-popover-content");
              popoverContents.forEach((popoverContent) => {
                  this.togglePopover(popoverContent);
              });
              this.timeoutId = null;
          }, this.popupTime);
      }
  }

  togglePopover(popoverContent: HTMLElement): void {
      popoverContent.classList.toggle("translate-y-0");
      // Add other toggle logic here if needed
  }
}