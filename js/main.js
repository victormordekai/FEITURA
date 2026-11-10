import {initNavigation} from "./modules/navigation.js";
import {initFaq} from "./modules/faq.js";
import {initReveal} from "./modules/reveal.js";
import {initEstimators} from "./modules/estimator.js";
import {initCapacity} from "./modules/capacity.js";
import {initDemoActions} from "./modules/demo.js";
import {initQuote} from "./modules/quote/index.js";
import {initVisitorCounter} from "./modules/counter.js";
import {initDocumentHud} from "./modules/hud-document.js";
import {initFooter} from "./modules/footer.js";

document.addEventListener("DOMContentLoaded",()=>{
  initNavigation();
  initFaq();
  initReveal();
  initEstimators();
  initCapacity();
  initDemoActions();
  initQuote();
  initVisitorCounter();
  initDocumentHud();
  initFooter();
});
