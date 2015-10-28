#ast_diff

A tool for visualization of diffs between javascript source syntax trees

**early stage**

## what works

Currently you can compare two versions of a single function, and see a visualization of a syntax tree containing the removed nodes, the added nodes and the nodes that remained the same. 

## technologies

It uses `esprima` for parsing javascript source, `Treant` and `raphael.js` for drawing the tree, `codemirror` for highlighting the code, `lodash` and `jquery` for some common functionallity.

## todo(one day when I have more time)

* Improve visualization for different kinds of nodes
* Improve diff algorithm, find nodes moving up and down the tree
* Add tests

## License

MIT License
