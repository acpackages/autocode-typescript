import 'reflect-metadata';
import { acBootstrapElements, acRouter } from '@autocode-ts/ac-runtime';
import { IfTest } from './if-test';
import { ForTest } from './for-test';
import { ContainerTest } from './container-test';
import { TemplateTest } from './template-test';
import { LeakTestElement, TestChildElement } from './leak-test-element';

// Register elements
[IfTest, ForTest, ContainerTest, TemplateTest, LeakTestElement, TestChildElement].forEach(el => el);

window.addEventListener('DOMContentLoaded', async () => {
  console.log("🚀 [Runtime Tests] Initializing...");
  
  try {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div class="test-grid">
          <if-test></if-test>
          <for-test></for-test>
          <container-test></container-test>
          <template-test></template-test>
          <leak-test></leak-test>
        </div>
      `;
    }

    await acBootstrapElements();
    
    console.log("✅ [Runtime Tests] All elements bootstrapped.");
  } catch (err) {
    console.error("🔥 [Runtime Tests] Initialization failed:", err);
  }
});
