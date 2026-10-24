import {initNavigation} from "./modules/navigation.js";
import {initFaq} from "./modules/faq.js";
import {initReveal} from "./modules/reveal.js";
import {initEstimators} from "./modules/estimator.js";
import {initCapacity} from "./modules/capacity.js";
import {initDemoActions} from "./modules/demo.js";
import {initGlossary} from "./modules/glossary.js";
import {initVisitorCounter} from "./modules/counter.js";

document.addEventListener("DOMContentLoaded",()=>{
  initNavigation();
  initFaq();
  initReveal();
  initEstimators();
  initCapacity();
  initDemoActions();
  initGlossary();
  initVisitorCounter();
});
