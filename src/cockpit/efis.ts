// EFIS control panel, simplified: the flight director (FD) button and the baro reference knob.
// QNH is set in hectopascals with − / + (or the mouse wheel). STD switches to the standard
// setting of 1013 hPa used above the transition altitude.

export interface EfisState {
  fd: boolean;
  qnh: number;
  std: boolean;
}

export class EfisPanel {
  readonly el: HTMLElement;
  private fdLight: HTMLElement;
  private value: HTMLElement;
  private stdBtn: HTMLButtonElement;

  constructor(parent: HTMLElement, getState: () => EfisState) {
    this.el = document.createElement("div");
    this.el.id = "efis";
    this.el.innerHTML = `
      <span class="efis-title">EFIS</span>
      <button data-ctl="efis-fd" class="fcu-push" title="Flight director on / off"><i></i>FD</button>
      <div class="fcu-field" data-ctl="efis-baro">
        <span class="fcu-label">BARO</span>
        <button data-k="down" data-ctl="efis-baro-down" title="QNH down">−</button>
        <span class="fcu-value efis-value" title="Scroll to change"></span>
        <button data-k="up" data-ctl="efis-baro-up" title="QNH up">+</button>
        <button data-ctl="efis-std" title="Standard setting 1013 hPa, push / pull">STD</button>
      </div>`;
    parent.appendChild(this.el);
    this.fdLight = this.el.querySelector("[data-ctl=efis-fd] i")!;
    this.value = this.el.querySelector(".efis-value")!;
    this.stdBtn = this.el.querySelector("[data-ctl=efis-std]")!;
    const nudge = (d: number) => {
      const st = getState();
      if (st.std) return; // the knob does nothing useful while STD is shown
      st.qnh = Math.max(945, Math.min(1050, st.qnh + d));
    };
    this.el.querySelector("[data-ctl=efis-fd]")!.addEventListener("click", (e) => {
      getState().fd = !getState().fd;
      (e.currentTarget as HTMLElement).blur();
    });
    this.el.querySelector("[data-k=down]")!.addEventListener("click", (e) => {
      nudge(-1);
      (e.currentTarget as HTMLElement).blur();
    });
    this.el.querySelector("[data-k=up]")!.addEventListener("click", (e) => {
      nudge(1);
      (e.currentTarget as HTMLElement).blur();
    });
    this.value.addEventListener("wheel", (e) => {
      e.preventDefault();
      nudge(e.deltaY < 0 ? 1 : -1);
    });
    this.stdBtn.addEventListener("click", (e) => {
      getState().std = !getState().std;
      (e.currentTarget as HTMLElement).blur();
    });
  }

  update(st: EfisState) {
    this.fdLight.classList.toggle("on", st.fd);
    this.value.textContent = st.std ? "STD" : String(st.qnh);
    this.stdBtn.classList.toggle("on", st.std);
  }
}

/** Baro setting in hPa that the altimeter uses. */
export function baroSetting(st: EfisState): number {
  return st.std ? 1013.25 : st.qnh;
}
