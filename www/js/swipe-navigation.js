let root = document.querySelector("home-assistant");
root = root && root.shadowRoot;
root = root && root.querySelector("home-assistant-main");
root = root && root.shadowRoot;
root = root && root.querySelector("app-drawer-layout partial-panel-resolver");
root = (root && root.shadowRoot) || root;
root = root && root.querySelector("ha-panel-lovelace");
root = root && root.shadowRoot;
root = root && root.querySelector("hui-root");
const config = root.lovelace.config.swipe_nav || {};

let animate = config.animate !== undefined ? config.animate : "none";
let wrap = config.wrap !== undefined ? config.wrap : true;
let prevent_default =
  config.prevent_default !== undefined ? config.prevent_default : false;
  let swipe_amount =
  config.swipe_amount !== undefined
    ? config.swipe_amount / Math.pow(10, 2)
    : 0.15;
let skip_tabs =
  config.skip_tabs !== undefined
    ? String(config.skip_tabs)
        .replace(/\s+/g, "")
        .split(",")
        .map(function(item) {
          return parseInt(item, 10);
        })
    : [];

const appLayout = root.shadowRoot.querySelector("ha-app-layout");
const view = appLayout.querySelector('[id="view"]');
const tabContainer = appLayout.querySelector("paper-tabs");
let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab, left;
let tabs = Array.from(tabContainer.querySelectorAll("paper-tab"));

appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });

function handleTouchStart(event) {
  let ignored = [
    "APP-HEADER",
    "HA-SLIDER",
    "SWIPE-CARD",
    "HUI-MAP-CARD",
    "ROUND-SLIDER",
    "HUI-THERMOSTAT-CARD",
    "CH-HEADER",
    "CH-HEADER-BOTTOM"
  ];
  if (typeof event.path == "object") {
    for (let element of event.path) {
      if (element.nodeName == "HUI-VIEW") break;
      else if (ignored.indexOf(element.nodeName) > -1) return;
    }
  }
  xDown = event.touches[0].clientX;
  yDown = event.touches[0].clientY;
  if (!lastTab) filterTabs();
  activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
}

function handleTouchMove(event) {
  if (xDown && yDown) {
    xDiff = xDown - event.touches[0].clientX;
    yDiff = yDown - event.touches[0].clientY;
    if (Math.abs(xDiff) > Math.abs(yDiff) && prevent_default) {
      event.preventDefault();
    }
  }
}

function handleTouchEnd() {
  if (activeTab < 0 || Math.abs(xDiff) < Math.abs(yDiff)) {
    xDown = yDown = xDiff = yDiff = null;
    return;
  }
  if (xDiff > Math.abs(screen.width * swipe_amount)) {
    left = false;
    activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
  } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
    left = true;
    activeTab == 0 ? click(lastTab) : click(activeTab - 1);
  }
  xDown = yDown = xDiff = yDiff = null;
}

function filterTabs() {
  tabs = tabs.filter(element => {
    return (
      !skip_tabs.includes(tabs.indexOf(element)) &&
      getComputedStyle(element, null).display != "none"
    );
  });
  firstTab = wrap ? 0 : null;
  lastTab = wrap ? tabs.length - 1 : null;
}

function click(index) {
  if (
    (activeTab == 0 && !wrap && left) ||
    (activeTab == tabs.length - 1 && !wrap && !left)
  ) {
    return;
  }
  if (animate == "swipe") {
    let _in = left ? `${screen.width / 1.5}px` : `-${screen.width / 1.5}px`;
    let _out = left ? `-${screen.width / 1.5}px` : `${screen.width / 1.5}px`;
    view.style.transitionDuration = "200ms";
    view.style.opacity = 0;
    view.style.transform = `translate(${_in}, 0)`;
    view.style.transition = "transform 0.20s, opacity 0.18s";
    setTimeout(function() {
      tabs[index].dispatchEvent(
        new MouseEvent("click", { bubbles: false, cancelable: true })
      );
      view.style.transitionDuration = "0ms";
      view.style.transform = `translate(${_out}, 0)`;
      view.style.transition = "transform 0s";
    }, 210);
    setTimeout(function() {
      view.style.transitionDuration = "200ms";
      view.style.opacity = 1;
      view.style.transform = `translate(0px, 0)`;
      view.style.transition = "transform 0.20s, opacity 0.18s";
    }, 250);
  } else if (animate == "fade") {
    view.style.transitionDuration = "200ms";
    view.style.transition = "opacity 0.20s";
    view.style.opacity = 0;
    setTimeout(function() {
      tabs[index].dispatchEvent(
        new MouseEvent("click", { bubbles: false, cancelable: true })
      );
      view.style.transitionDuration = "0ms";
      view.style.opacity = 0;
      view.style.transition = "opacity 0s";
    }, 210);
    setTimeout(function() {
      view.style.transitionDuration = "200ms";
      view.style.transition = "opacity 0.20s";
      view.style.opacity = 1;
    }, 250);
  } else if (animate == "flip") {
    view.style.transitionDuration = "200ms";
    view.style.transform = "rotatey(90deg)";
    view.style.transition = "transform 0.20s, opacity 0.20s";
    view.style.opacity = 0.25;
    setTimeout(function() {
      tabs[index].dispatchEvent(
        new MouseEvent("click", { bubbles: false, cancelable: true })
      );
    }, 210);
    setTimeout(function() {
      view.style.transitionDuration = "200ms";
      view.style.transform = "rotatey(0deg)";
      view.style.transition = "transform 0.20s, opacity 0.20s";
      view.style.opacity = 1;
    }, 250);
  } else {
    tabs[index].dispatchEvent(
      new MouseEvent("click", { bubbles: false, cancelable: true })
    );
  }
}
