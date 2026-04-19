// import { AcTemplateEngine } from '@autocode-ts/ac-template-engine';

export class TemplateEnginePage extends HTMLElement {
  public static observedAttributes = [];

  async connectedCallback() {
    // console.log(this);
    const html = `
    <div class="app-container">
  <h1>Welcome to AcTemplateEngine</h1>

  <!-- Interpolation -->
  <p>{{ title }}</p>

  <!-- acModel / two-way binding -->
  <input type="text" ac:Model="title" />
  <span>You typed: {{ title }}</span>

  <!-- acIf -->
  <div>
  <button type="button" ac:on:click="handleShow()">Show : {{show}}</button>
  <div ac:if="show">Visible only if show=true</div>
  </div>
  <!-- acFor -->
  <ul>
    <li ac:for="let item of items">{{ item }}</li>
  </ul>

  <!-- acClass and acStyle -->
  <p ac:class="{ 'highlight': isHighlighted }" ac:style="{ font-size: fontSize + 'px' }">Styled Text</p>

  <!-- acBind -->
  <a ac:bind:href="link" target="_blank">Go to link</a>

  <!-- acRef and acOn -->
  <input ac:ref="myInput" ac:model="href"/>
  <button type="button" ac:on:click="focusInput()">Focus input</button>

  <!-- acSwitch -->
  <div ac:switch="status">
    <div ac:switch:case="'active'">Active</div>
    <div ac:switch:case="'inactive'">Inactive</div>
    <div ac:switch:default>Unknown</div>
  </div>

  <!-- ac-template usage -->
  <ac-template name="userTemplate" ac:let="user">
    <div>{{ user.name }} - {{ user.role }}</div>
  </ac-template>

  <div ac:for="let user of users" >
    <ac-container ac:template="userTemplate" ac:context="{user:user}"></ac-container>
  </div>
</div>

`;
    // console.log(html);
    this.innerHTML = html;
    const btnShow = this.querySelector('#btnShow');
    const ctx = {
      title: 'test-browser',
      show: true,
      items: ['One', 'Two', 'Three'],
      isHighlighted: true,
      fontSize: 16,
      link: 'https://example.com',
      status: 'active',
      users: [
        { name: 'Alice', role: 'Admin' },
        { name: 'Bob', role: 'User' },
      ],
      focusInput:()=>{
        console.log("Focus Input called",this);
      },
      handleShow:()=>{
        ctx.show = !ctx.show;
      },
      onInit() {
        console.log('AppElement initialized');
      },
      onDestroy() {
        console.log('AppElement destroyed');
      },
    };
    // const engine = new AcTemplateEngine({context:ctx,element:this});
    // engine.render();
    // console.log(engine);
    // btnShow?.addEventListener('click',()=>{engine.elementContext.setContextValue({key:'show',value:false})})
  }
}
