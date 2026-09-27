import * as fs from 'fs';
import * as path from 'path';
import { AcEnumApiDocAssetSource } from '../enums/ac-enum-api-doc-asset-source.enum';
import { AcEnumApiDocRenderer } from '../enums/ac-enum-api-doc-renderer.enum';
import { AcApiDocUiOptions } from '../models/ac-api-doc-ui-options.model';

export class AcApiDocUiHandler {
  readonly options: AcApiDocUiOptions;

  constructor({ options }: { options: AcApiDocUiOptions }) {
    this.options = options;
  }

  getHtml(): string {
    switch (this.options.renderer) {
      case AcEnumApiDocRenderer.Scalar:
        return this.getScalarHtml();
      case AcEnumApiDocRenderer.SwaggerUi:
        return this.getSwaggerUiHtml();
      case AcEnumApiDocRenderer.Redoc:
        return this.getRedocHtml();
      case AcEnumApiDocRenderer.RapiDoc:
        return this.getRapiDocHtml();
      case AcEnumApiDocRenderer.Elements:
        return this.getElementsHtml();
      default:
        return this.getScalarHtml();
    }
  }

  private getScalarHtml(): string {
    const customCssBlock = this.options.customCss ? `<style>${this.options.customCss}</style>` : '';
    const themeAttribute = this.options.theme !== 'auto' ? `data-theme="${this.options.theme}"` : '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${this.options.title}</title>
    ${customCssBlock}
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${this.options.jsonPath}"
      ${themeAttribute}>
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
  }

  private getSwaggerUiHtml(): string {
    const version = this.options.cdnVersion || '5.11.0';
    const customCssBlock = this.options.customCss ? `<style>${this.options.customCss}</style>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${this.options.title}</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@${version}/swagger-ui.css" />
  <link rel="icon" type="image/png" href="https://unpkg.com/swagger-ui-dist@${version}/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
  ${customCssBlock}
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@${version}/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@${version}/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${this.options.jsonPath}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
  }

  private getRedocHtml(): string {
    const version = this.options.cdnVersion || 'latest';
    const customCssBlock = this.options.customCss ? `<style>${this.options.customCss}</style>` : '';

    return `<!DOCTYPE html>
<html>
  <head>
    <title>${this.options.title}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
    <style>body { margin: 0; padding: 0; }</style>
    ${customCssBlock}
  </head>
  <body>
    <redoc spec-url="${this.options.jsonPath}"></redoc>
    <script src="https://cdn.redoc.ly/redoc/${version}/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
  }

  private getRapiDocHtml(): string {
    const theme = this.options.theme === 'light' ? 'light' : 'dark';
    const customCssBlock = this.options.customCss ? `<style>${this.options.customCss}</style>` : '';

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${this.options.title}</title>
    <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
    ${customCssBlock}
  </head>
  <body>
    <rapi-doc
      spec-url="${this.options.jsonPath}"
      theme="${theme}"
      render-style="read"
      show-header="false"
      allow-try="true"
    ></rapi-doc>
  </body>
</html>`;
  }

  private getElementsHtml(): string {
    const customCssBlock = this.options.customCss ? `<style>${this.options.customCss}</style>` : '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${this.options.title}</title>
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
    ${customCssBlock}
  </head>
  <body>
    <elements-api apiDescriptionUrl="${this.options.jsonPath}" router="hash" layout="sidebar" />
  </body>
</html>`;
  }

  getAssetContent({ relativePath }: { relativePath: string }): string | null {
    if (this.options.source === AcEnumApiDocAssetSource.InjectedMap && this.options.files) {
      return this.options.files[relativePath] || null;
    } else if (this.options.source === AcEnumApiDocAssetSource.Directory && this.options.directoryPath) {
      const fullPath = path.join(this.options.directoryPath, relativePath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
    }
    return null;
  }
}
