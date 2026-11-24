DECK.bucket.simple = { t: ['Which simple sort does this describe?', '这句话描述的是哪种简单排序？'],
  buckets: [['Bubble', '冒泡'], ['Selection', '选择'], ['Insertion', '插入']], items: [
  ['Only ever compares neighbours', '只比较相邻的两个', 0], ['Can stop early when a pass makes no exchange', '某一趟没有交换就能提前停', 0],
  ['Exactly one swap per pass in its basic form', '基础版每趟恰好交换一次', 1], ['Takes the same number of comparisons whatever the input order', '无论输入顺序如何，比较次数都一样', 1],
  ['Grows a sorted region on the left, one item at a time', '左边的有序区每次增加一个', 2], ['Shifts bigger items one step to the right to make a gap', '把更大的项右移一格腾出空位', 2],
  ['Needs only n − 1 comparisons when the data is already sorted (best case)', '数据已排好时只需 n − 1 次比较（最好情况）', 2, ['The improved bubble sort shares this property.', '改进冒泡也有这个性质。']]] };

DECK.flash.ch1 = { t: ['Simple sorts — flashcards', '简单排序——记忆卡'], cards: [
  ['Bubble sort: one pass', '冒泡排序：一趟', 'Compare neighbours left to right and swap when out of order; the biggest remaining value ends at the back.', '从左到右比较相邻项，逆序就交换；剩下的最大值落到最后。'],
  ['Improved bubble sort', '改进冒泡排序', 'A flag records whether a pass swapped anything; a pass with no swap ends the sort (that pass still counts).', '用一个标志记录这一趟是否交换过；没交换的那一趟结束排序（这一趟仍要算）。'],
  ['Selection sort: one pass', '选择排序：一趟', 'Find the largest value in the unsorted part and swap it into the last unsorted position.', '在未排序部分找最大值，换到未排序部分的最后一个位置。'],
  ['Insertion sort: one pass', '插入排序：一趟', 'Take the next item and shift bigger items in the sorted part right until the gap fits it.', '取下一个元素，把有序部分里更大的项右移，直到空位适合它。'],
  ['Comparisons in the worst case', '最坏情况的比较次数', 'n(n − 1)/2 for all three simple sorts → O(n²).', '三种简单排序都是 n(n − 1)/2 → O(n²)。'],
  ['Best case O(n)', '最好情况 O(n)', 'Improved bubble sort and insertion sort on already sorted data. Selection sort never stops early.', '改进冒泡和插入排序（数据已有序）。选择排序永远不会提前停。']] };

DECK.flash.ch2 = { t: ['Merge & quick sort — flashcards', '归并与快排——记忆卡'], cards: [
  ['mergeSort(a, first, last)', 'mergeSort(a, first, last)', 'mid = (first + last) / 2; sort [first..mid]; sort [mid+1..last]; then merge.', 'mid = (first + last) / 2；排 [first..mid]；排 [mid+1..last]；再合并。'],
  ['merge() precondition', 'merge() 的前提', 'Both halves are already sorted — mergeSort sorts them before calling merge.', '两半都已有序——mergeSort 在调用 merge 之前已经排好它们。'],
  ['partition(): what is returned', 'partition() 返回什么', 'The index top where bottom and top meet (the cut). Next calls: quickSort(first, cut) and quickSort(cut + 1, last).', 'bottom 与 top 相遇处的下标 top（切分点）。接下来调用 quickSort(first, cut) 和 quickSort(cut + 1, last)。'],
  ['Quick sort worst case', '快排最坏情况', 'The pivot is always the smallest or largest value (e.g. sorted data, first-element pivot) → O(n²).', 'pivot 总是最小或最大值（如已有序数据、取首元素为 pivot）→ O(n²)。'],
  ['Merge sort cost', '归并排序的代价', 'O(n log n) in every case, but it needs a temporary array of size n.', '任何情况都是 O(n log n)，但需要大小为 n 的临时数组。']] };

DECK.cloze.ibubble = { t: ['Write the improved bubble sort', '写出改进冒泡排序'], given: `<div class="t1lab">${T('Fill the blanks. The function sorts <code>data[0..n−1]</code> ascending and stops after a pass with no exchange.', '填空。函数把 <code>data[0..n−1]</code> 升序排列，某一趟没有交换就停止。')}</div>`, code: String.raw`
  void BubbleSort(int data[], int n)
  {  bool sorted = ⟦false⟧;
     for (int pass = 1; (pass < n) && ⟦!sorted¦sorted == false⟧; pass++)
     {  sorted = ⟦true⟧;
        for (int x = 0; x < ⟦n - pass¦n-pass⟧; x++)
           if (data[x] ⟦>⟧ data[x + 1])
           {  int hold = data[x];
              data[x] = data[x + 1];
              data[x + 1] = ⟦hold⟧;
              sorted = ⟦false⟧;
           }
     }
  }` };

DECK.judge.facts = { t: ['True or false?', '对还是错？'], labels: [['✓ True', '✓ 对'], ['✗ False', '✗ 错']], items: [
  ['Merge sort is O(n log n) even on already sorted data.', 1, 'It always splits in halves and merges everything.', '它总是对半分、全部合并。'],
  ['Quick sort never needs more than O(n log n) time.', 0, 'Worst case O(n²) when the pivot is always the smallest or largest.', '若 pivot 总是最小或最大，最坏是 O(n²)。'],
  ['Selection sort makes at most n − 1 swaps.', 1, 'One swap per pass, n − 1 passes.', '每趟一次交换，共 n − 1 趟。'],
  ['Insertion sort is O(n²) on already sorted data.', 0, 'Sorted data: each item needs one comparison → O(n).', '已排好：每个元素只比一次 → O(n)。'],
  ['partition() returns the pivot value.', 0, 'It returns an index — the cut point.', '它返回下标——切分点。'],
  ['merge() only works when both halves are already sorted.', 1, 'That is why mergeSort sorts both halves first.', '所以 mergeSort 先把两半排好。']] };
