SITE.RVX.swap = () => RV('how does a swap work?', '交换是怎么做的？', `
  ${P('You need a third variable to hold one value for a moment — otherwise the first assignment destroys it.', '需要第三个变量临时存一个值——否则第一次赋值就把它覆盖了。')}
  ${C`
int hold = a[i];   // keep a copy
a[i] = a[j];
a[j] = hold;
`}`);
SITE.RVX.intdiv = () => RV('why is mid = (0 + 5) / 2 equal to 2?', '为什么 mid = (0 + 5) / 2 等于 2？', `
  ${P('In C++ <code>int / int</code> drops the decimal part: 5 / 2 = 2. So the left half of [0..5] is [0..2] — it gets the middle element.', '在 C++ 里 <code>int / int</code> 会丢掉小数：5 / 2 = 2。所以 [0..5] 的左半是 [0..2]——中间元素归左半。')}`);
SITE.RVX.growth = () => RV('the growth order to remember', '要记住的增长顺序', `
  ${P('1 &lt; log n &lt; n &lt; n log n &lt; n² &lt; 2ⁿ. Simple sorts are n² in the worst case; merge sort is always n log n.', '1 &lt; log n &lt; n &lt; n log n &lt; n² &lt; 2ⁿ。简单排序最坏是 n²；归并排序永远是 n log n。')}`);
