import 'reflect-metadata';
import { acBootstrapElements } from '@autocode-ts/ac-runtime';
import { IfTest } from './if-test';
import { ForTest } from './for-test';
import { ContainerTest } from './container-test';
import { TemplateTest } from './template-test';

// Register elements
[IfTest, ForTest, ContainerTest, TemplateTest].forEach(el => el);

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
        </div>
      `;
    }

    await acBootstrapElements();

    console.log("✅ [Runtime Tests] All elements bootstrapped.");
  } catch (err) {
    console.error("🔥 [Runtime Tests] Initialization failed:", err);
  }
});
