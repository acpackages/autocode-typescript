export const AC_REPORT_ATTRIBUTE = {
  accumulate: 'ac:accumulate',
  dataRepeater: 'ac-data-repeater',
  dataRow: 'ac-data-row',
  firstPageOnly: 'ac:first-page-only',
  groupHeader: 'ac:group-header',
  hideOnFirstPage: 'ac:hide-on-first-page',
  hideOnLastPage: 'ac:hide-on-last-page',
  keepTogether: 'ac:keep-together',
  lastPageOnly: 'ac:last-page-only',
  noBreak: 'ac:no-break',
  page: 'ac-page',
  pageBody: 'ac-page-body',
  pageBreak: 'ac:break',
  pageBreakAfter: 'ac:break-after',
  pageBreakBefore: 'ac:break-before',
  pageColumns: 'ac-page-columns',
  pageFooter: 'ac-page-footer',
  pageHeader: 'ac-page-header',
  pageMargin: 'ac-page-margin',
  pageOrientation: 'ac-page-orientation',
  pageSize: 'ac-page-size',
  repeatHeader: 'ac:repeat-header',
  report: 'ac-report',
  reportFooter: 'ac-report-footer',
  reportHeader: 'ac-report-header',
  section: 'ac:section',
  sectionName: 'ac:section-name',
  subtotal: 'ac:subtotal',
  templateBindAttribute: 'ac:bind',
  templateClass: 'ac:class',
  templateElse: 'ac:else',
  templateElseIf: 'ac:elseif',
  templateFor: 'ac:for',
  templateIf: 'ac:if',
  templateLet: 'ac:let',
  templateStyle: 'ac:style',
  templateSwitch: 'ac:switch',
  templateSwitchCase: 'ac:switch:case',
  templateSwitchDefault: 'ac:switch:default',
  tempId: 'ac-temp-id',
  toc: 'ac:toc',
  watermark: 'ac:watermark',
};

export function getAttrSelector(attrName: string): string {
  let escaped = attrName;
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    escaped = CSS.escape(attrName);
  } else {
    escaped = attrName.replace(/:/g, '\\:');
  }
  if (attrName.startsWith('ac:')) {
    const hyphenVariant = attrName.replace(/^ac:/, 'ac-');
    return `[${escaped}], [${hyphenVariant}]`;
  }
  if (attrName.startsWith('ac-')) {
    const colonVariant = attrName.replace(/^ac-/, 'ac\\:');
    return `[${escaped}], [${colonVariant}]`;
  }
  return `[${escaped}]`;
}
