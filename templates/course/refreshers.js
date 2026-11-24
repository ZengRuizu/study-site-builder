/* Refreshers — background knowledge the slides ASSUME. Rendered collapsed and low-key.
   Use in a section as ${SITE.RVX.name()}. Keep each one short: a table or 3–6 lines + a tiny example. */
SITE.RVX.example = () => RV('what is an integer division?', '整数除法是什么？', `
  ${P('In C++, <code>int / int</code> drops the decimal part: <code>7 / 2</code> is <b>3</b>.', '在 C++ 里 <code>int / int</code> 会丢掉小数部分：<code>7 / 2</code> 等于 <b>3</b>。')}
  ${C`
int a = 7 / 2;      // 3
double b = 7.0 / 2; // 3.5
`}`);
